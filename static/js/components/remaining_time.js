const RemainingTime = {
    intervalId: null,
    el: null,
    processId: null,
    endTime: null,
    tempoEstimado: null,
    startDate: null,
    lastUpdate: null,

    async init(selector = '.time-display') {
        this.el = document.querySelector(selector);
        if (!this.el) return;
        await this.start();
        return this;
    },

    async start() {
        if (this.intervalId) clearInterval(this.intervalId);

        try {
            const response = await fetch('/api/process');
            const result = await response.json();
            
            if (!result.success || !result.processes) {
                this.reset();
                return;
            }

            const processo = result.processes.find(p => p.status === 'em andamento');
            if (!processo || !processo.start_time || !processo.tempo_estimado || !processo.finish_time) {
                this.reset();
                return;
            }

            this.processId = processo.id;
            this.tempoEstimado = parseInt(processo.tempo_estimado);
            
            // Converte start_time do formato dd/mm/yyyy HH:MM:SS para Date
            const [data, hora] = processo.start_time.split(' ');
            const [dia, mes, ano] = data.split('/');
            const [h, m, s] = hora.split(':');
            this.startDate = new Date(`${ano}-${mes}-${dia}T${h}:${m}:${s}`);
            
            // Usa finish_time UTC do backend
            this.endTime = new Date(processo.finish_time); // finish_time já está em UTC ISO
            
            // Calcula o tempo final baseado no tempo estimado (em minutos)
            const now = new Date();
            const elapsedMinutes = Math.floor((now - this.startDate) / (60 * 1000));
            const remainingMinutes = Math.max(0, this.tempoEstimado - elapsedMinutes);
            
            // Se o processo já acabou
            if (remainingMinutes <= 0) {
                await this.handleProcessCompletion();
                return;
            }

            // Define o tempo final baseado no tempo restante
            this.endTime = new Date(now.getTime() + (remainingMinutes * 60 * 1000));
            this.lastUpdate = now;

            // Atualiza imediatamente e inicia o intervalo
            await this.update();
            this.intervalId = setInterval(() => this.update(), 1000);

            // Atualiza o tempo estimado no banco a cada minuto
            setInterval(() => this.updateEstimatedTime(), 60000);

            // Log para debug
            console.log('RemainingTime iniciado:', {
                processId: this.processId,
                tempoEstimado: this.tempoEstimado,
                startDate: this.startDate,
                endTime: this.endTime,
                elapsedMinutes,
                remainingMinutes
            });

        } catch (error) {
            console.error('Erro ao iniciar contador:', error);
            this.reset();
        }
    },

    async update() {
        if (!this.el || !this.endTime) return;

        try {
            const now = new Date();
            let diff = Math.floor((this.endTime - now) / 1000);
            
            // Se o tempo acabou
            if (diff <= 0) {
                await this.handleProcessCompletion();
                return;
            }

            // Atualiza o display
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            this.setTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

            // Atualiza o círculo de progresso
            const total = this.tempoEstimado * 60; // Converte minutos para segundos
            const elapsed = total - diff;
            const percent = Math.max(0, Math.min(100, (elapsed / total) * 100));
            this.updateProgressCircle(percent);

        } catch (error) {
            console.error('Erro ao atualizar contador:', error);
        }
    },

    async updateEstimatedTime() {
        if (!this.processId || !this.endTime) return;

        try {
            const now = new Date();
            const diff = Math.floor((this.endTime - now) / 60); // Diferença em minutos

            if (diff > 0) {
                await fetch(`/api/process/${this.processId}/update_time`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tempo_estimado: diff })
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar tempo estimado:', error);
        }
    },

    async handleProcessCompletion() {
        if (!this.processId) return;

        try {
            // Para o contador
            this.clearInterval();
            
            // Finaliza o processo no backend
            const response = await fetch(`/api/process/${this.processId}/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    volume_extraido: 0,
                    rendimento: 0,
                    notas_operador: 'Processo finalizado automaticamente'
                })
            });

            if (response.ok) {
                // Dispara evento de conclusão
                window.dispatchEvent(new CustomEvent('countdownComplete'));
            }
        } catch (error) {
            console.error('Erro ao finalizar processo:', error);
        } finally {
            this.reset();
        }
    },

    setTime(str) {
        if (this.el) this.el.textContent = str;
    },

    updateProgressCircle(percent) {
        const canvas = document.getElementById('progressCircle');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 65;

        // Limpa o canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha o círculo de fundo
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Desenha o arco de progresso
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI/2, -Math.PI/2 + 2 * Math.PI * percent / 100);
        ctx.strokeStyle = '#4FCB98';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Atualiza o texto de progresso
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${Math.round(percent)}%`;
        }
    },

    clearInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    reset() {
        this.clearInterval();
        this.setTime('00:00:00');
        this.updateProgressCircle(0);
        this.processId = null;
        this.endTime = null;
        this.tempoEstimado = null;
        this.startDate = null;
        this.lastUpdate = null;
    }
};

// Expor globalmente
window.RemainingTime = RemainingTime;

document.addEventListener('DOMContentLoaded', () => {
    RemainingTime.init('.time-display');
}); 