const RemainingTime = {
    intervalId: null,
    el: null,
    processId: null,
    endTime: null,
    tempoEstimado: null,
    startDate: null,

    async init(selector = '.time-display') {
        this.el = document.querySelector(selector);
        if (!this.el) return;
        await this.start();
    },

    async start() {
        if (this.intervalId) clearInterval(this.intervalId);

        const response = await fetch('/api/process');
        const result = await response.json();
        if (!result.success) {
            this.setTime('00:00:00');
            this.updateProgressCircle(0);
            return;
        }
        const processo = result.processes.find(p => p.status === 'em andamento');
        if (!processo || !processo.start_time || !processo.tempo_estimado) {
            this.setTime('00:00:00');
            this.updateProgressCircle(0);
            return;
        }

        this.processId = processo.id;
        this.tempoEstimado = processo.tempo_estimado;
        // start_time no formato dd/mm/yyyy HH:MM:SS
        const [data, hora] = processo.start_time.split(' ');
        const [dia, mes, ano] = data.split('/');
        const [h, m, s] = hora.split(':');
        this.startDate = new Date(`${ano}-${mes}-${dia}T${h}:${m}:${s}`);
        this.endTime = new Date(this.startDate.getTime() + this.tempoEstimado * 60000);

        this.update();
        this.intervalId = setInterval(() => this.update(), 1000);
    },

    async update() {
        if (!this.el || !this.endTime) return;
        const now = new Date();
        let diff = Math.floor((this.endTime - now) / 1000);
        if (diff < 0) diff = 0;

        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        this.setTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

        // Atualiza o círculo de progresso
        const total = this.tempoEstimado * 60;
        const elapsed = total - diff;
        const percent = Math.max(0, Math.min(100, (elapsed / total) * 100));
        this.updateProgressCircle(percent);

        // Atualiza o tempo_estimado no banco (reduzindo com o passar do tempo)
        if (this.processId) {
            fetch(`/api/process/${this.processId}/update_time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempo_estimado: Math.ceil(diff / 60) })
            });
        }

        // Se acabou o tempo, para o contador, finaliza o processo e abre o modal de produção
        if (diff === 0) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            if (this.processId) {
                // Finaliza o processo no backend
                fetch(`/api/process/${this.processId}/finish`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        volume_extraido: 0,
                        rendimento: 0,
                        notas_operador: ''
                    })
                }).then(() => {
                    // Abre o modal de produção automaticamente
                    const producaoModal = document.getElementById('producao-modal');
                    if (producaoModal) producaoModal.style.display = 'block';
                });
            }
        }
    },

    setTime(str) {
        if (this.el) this.el.textContent = str;
    },

    updateProgressCircle(percent) {
        if (window.updateProgressCircle) {
            window.updateProgressCircle(percent);
        }
    },

    reset() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.setTime('00:00:00');
        this.updateProgressCircle(0);
        this.processId = null;
        this.endTime = null;
        this.tempoEstimado = null;
        this.startDate = null;
    }
};

// Expor globalmente
window.RemainingTime = RemainingTime;

document.addEventListener('DOMContentLoaded', () => {
    RemainingTime.init('.time-display');
}); 