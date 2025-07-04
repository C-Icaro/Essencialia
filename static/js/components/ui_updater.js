// Componente para gerenciar atualizações da interface do usuário
const UIUpdater = {
    // Estado interno do componente
    state: {
        currentProcess: null
    },

    // Inicializa o componente
    init() {
        console.log('UIUpdater: Inicializando componente...');
        // Inicializa o ProcessChecker
        this.processChecker = window.ProcessChecker.init();
        return this;
    },

    // Atualiza o processo em andamento
    async updateCurrentProcess() {
        try {
            const processoEmAndamento = await this.processChecker.check();
            const plantNameEl = document.querySelector('.plant-name');
            const materialInputEl = document.querySelector('.material-input');
            
            if (!plantNameEl || !materialInputEl) return;
            
            if (processoEmAndamento) {
                this.state.currentProcess = processoEmAndamento;
                plantNameEl.textContent = processoEmAndamento.plant_name || 'Nome da planta';
                materialInputEl.value = processoEmAndamento.quantidade_materia_prima ? 
                    `${processoEmAndamento.quantidade_materia_prima} gramas` : '000 gramas';
            } else {
                this.state.currentProcess = null;
                plantNameEl.textContent = 'Aguardando início de processo';
                materialInputEl.value = '000 gramas';
            }
        } catch (error) {
            console.error('UIUpdater: Erro ao atualizar processo em andamento:', error);
            const plantNameEl = document.querySelector('.plant-name');
            const materialInputEl = document.querySelector('.material-input');
            
            if (plantNameEl) plantNameEl.textContent = 'Aguardando início de processo';
            if (materialInputEl) materialInputEl.value = '000 gramas';
        }
    },

    // Atualiza o gauge de pressão
    updatePressureGauge(pressure) {
        const gaugeValue = document.querySelector('.gauge-value');
        const gaugeLabel = document.querySelector('.gauge-label');
        const canvas = document.getElementById('pressureGauge');
        if (!gaugeValue || !gaugeLabel || !canvas) return;

        let estado = 'Normal';
        let cor = '#8BC34A';
        if (pressure < 20) {
            estado = 'Baixa';
            cor = '#4CAF50';
        } else if (pressure < 40) {
            estado = 'Normal';
            cor = '#8BC34A';
        } else if (pressure < 70) {
            estado = 'Atenção';
            cor = '#FFC107';
        } else {
            estado = 'Risco';
            cor = '#F44336';
        }

        gaugeValue.textContent = `${pressure.toFixed(0).padStart(2, '0')} kPa`;
        gaugeLabel.textContent = `Estado: ${estado}`;
        gaugeValue.style.color = cor;

        // Desenhar arco do gauge
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 10;
        const radius = Math.min(canvas.width, canvas.height * 2) / 2 - 20;
        const startAngle = Math.PI;
        const endAngle = 0;

        // Fundo do arco
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.lineWidth = 18;
        ctx.strokeStyle = '#eee';
        ctx.stroke();

        // Arco colorido proporcional à pressão
        const percent = Math.max(0, Math.min(1, pressure / 100));
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + Math.PI * percent, false);
        ctx.lineWidth = 18;
        ctx.strokeStyle = cor;
        ctx.stroke();
    },

    // Atualiza o círculo de progresso
    updateProgressCircle(percent) {
        const canvas = document.getElementById('progressCircle');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 65;

        // Fundo
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Arco de progresso
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI/2, -Math.PI/2 + 2 * Math.PI * percent / 100, false);
        ctx.strokeStyle = '#4FCB98';
        ctx.lineWidth = 14;
        ctx.stroke();
    },

    // Inicia atualizações periódicas
    startPeriodicUpdates(interval = 60000) {
        this.updateCurrentProcess(); // Primeira atualização
        setInterval(() => this.updateCurrentProcess(), interval);
    }
};

// Exporta o componente
window.UIUpdater = UIUpdater; 