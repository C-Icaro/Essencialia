// Configuração global do Chart.js
Chart.register(ChartDataLabels);
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#666';
Chart.defaults.plugins.datalabels.color = '#fff';
Chart.defaults.plugins.datalabels.font.weight = 'bold';
Chart.defaults.locale = window.dateFnsLocale;

// Configurações e constantes
const CONFIG = {
    UPDATE_INTERVAL: 2000,
    SIMULATION_INTERVAL: 1000,
    MAX_TEMPERATURE: 100,
    MAX_PRESSURE: 100,
    MAX_WATER_LEVEL: 100,
    PROCESS_DURATION: 3600,
    CHART_POINT_RADIUS: 0,
    CHART_TENSION: 0.4,
    CHART_FILL_OPACITY: 0.1
};

// Estado global da aplicação
const state = {
    simulation: {
        temperature: 0,
        pressure: 0,
        waterLevel: 50,
        timeRemaining: CONFIG.PROCESS_DURATION,
        progress: 0,
        isRunning: true,
        useRealData: false,
        currentPlant: null,
        alertShown: false
    },
    charts: {
        temperature: null,
        pressure: null
    }
};

// Dados das plantas
const PLANTS = {
    lavanda: {
        name: "Lavanda",
        temperature: 60,
        pressure: 25,
        description: "Ideal para óleos relaxantes"
    },
    eucalipto: {
        name: "Eucalipto",
        temperature: 70,
        pressure: 30,
        description: "Propriedades medicinais"
    },
    alecrim: {
        name: "Alecrim",
        temperature: 65,
        pressure: 28,
        description: "Estimulante natural"
    },
    manjericao: {
        name: "Manjericão",
        temperature: 55,
        pressure: 22,
        description: "Aroma intenso"
    },
    hortela: {
        name: "Hortelã",
        temperature: 50,
        pressure: 20,
        description: "Refrescante e medicinal"
    }
};

// Utilitários
const utils = {
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    },

    formatAlertTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    },

    async fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }
};

// Gerenciamento de Alertas
const alerts = {
    localAlerts: new Map(), // Armazena alertas locais que não devem ser sobrescritos

    async fetch() {
        try {
            const response = await utils.fetchWithTimeout('/alerts');
            const data = await response.json();
            this.render(data);
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
            this.add('error', 'Erro ao carregar alertas');
        }
    },

    render(alerts) {
        const alertList = document.querySelector('.alert-list');
        if (!alertList) return;

        // Limpa apenas os alertas do servidor, mantendo os locais
        const serverAlerts = Array.from(alertList.querySelectorAll('.alert:not([data-local="true"])'));
        serverAlerts.forEach(alert => alert.remove());

        // Adiciona os novos alertas do servidor
        alerts.forEach(alert => {
            // Não sobrescreve alertas locais
            if (!this.localAlerts.has(alert.id)) {
                this.createAlertElement(alert, alertList);
            }
        });

        // Garante que os alertas locais permaneçam visíveis
        this.localAlerts.forEach((alertData, alertId) => {
            if (!alertList.querySelector(`[data-alert-id="${alertId}"]`)) {
                this.createAlertElement(alertData, alertList, true);
            }
        });
    },

    createAlertElement(alert, container, isLocal = false) {
        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alert.type}`;
        if (isLocal) {
            alertElement.dataset.local = 'true';
        }
        if (alert.id) {
            alertElement.dataset.alertId = alert.id;
        }
        
        const icon = this.getAlertIcon(alert.type);
        alertElement.innerHTML = `
            <div class="alert-header">
                <span class="alert-icon">${icon}</span>
                <span class="alert-text">${alert.message}</span>
                <button class="close-alert">×</button>
            </div>
            ${alert.data ? `<div class="alert-details">${this.formatAlertDetails(alert.type, alert.data)}</div>` : ''}
            <div class="alert-footer">
                <span class="alert-time">${alert.timestamp || 'Agora mesmo'}</span>
            </div>
        `;

        this.setupAlertInteractions(alertElement, alert, isLocal);
        container.appendChild(alertElement);
    },

    getAlertIcon(type) {
        const icons = {
            success: '✅',
            error: '⚠️',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || 'ℹ️';
    },

    getAlertContent(alert) {
        if (alert.type === 'falha' && alert.data) {
            return this.formatFailureAlert(alert.data);
        }
        return `<div class='alert-details'>${alert.message}</div>`;
    },

    formatFailureAlert(data) {
        const fields = ['tipo', 'horario', 'duracao_sec', 'solucao'];
        return `
            <div class='alert-details'>
                ${fields.map(field => 
                    data[field] ? `<div><b>${field}:</b> ${field === 'horario' ? 
                        utils.formatAlertTime(data[field]) : data[field]}</div>` : ''
                ).join('')}
            </div>
        `;
    },

    setupAlertInteractions(element, alert, isLocal = false) {
        const closeBtn = element.querySelector('.close-alert');
        if (closeBtn) {
            closeBtn.addEventListener('click', async () => {
                if (isLocal) {
                    // Remove apenas do DOM se for local
                    element.remove();
                    if (alert.id) {
                        this.localAlerts.delete(alert.id);
                    }
                } else if (alert.id) {
                    // Marca como resolvido no servidor se não for local
                    try {
                        const response = await fetch(`/alerts/resolve/${alert.id}`, {
                            method: 'POST'
                        });
                        const data = await response.json();
                        if (data.success) {
                            element.remove();
                        }
                    } catch (error) {
                        console.error('Erro ao resolver alerta:', error);
                    }
                }
            });
        }
    },

    add(type, message, data = null, isLocal = false) {
        const alertList = document.querySelector('.alert-list');
        if (!alertList) return;

        const alertData = {
            type,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        if (isLocal) {
            // Gera um ID temporário para alertas locais
            const tempId = 'local_' + Date.now();
            alertData.id = tempId;
            this.localAlerts.set(tempId, alertData);
        }

        this.createAlertElement(alertData, alertList, isLocal);
    },

    formatAlertDetails(type, data) {
        if (!data) return '';
        
        const templates = {
            temperature: `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Temperatura:</span>
                        <span class="detail-value">${data.temperatura}°C</span>
                    </div>
                    ${data.limite ? `
                    <div class="detail-item">
                        <span class="detail-label">Limite:</span>
                        <span class="detail-value">${data.limite}°C</span>
                    </div>` : ''}
                </div>`,
            pressure: data.variacao ? `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Pressão Atual:</span>
                        <span class="detail-value">${data.pressao_atual} kPa</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Pressão Anterior:</span>
                        <span class="detail-value">${data.pressao_anterior} kPa</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Variação:</span>
                        <span class="detail-value">${data.variacao.toFixed(1)} kPa</span>
                    </div>
                </div>` : `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Pressão:</span>
                        <span class="detail-value">${data.pressao} kPa</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Limite:</span>
                        <span class="detail-value">${data.limite} kPa</span>
                    </div>
                </div>`,
            water_level: `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Nível:</span>
                        <span class="detail-value">${data.nivel}</span>
                    </div>
                </div>`
        };

        return templates[type] || '';
    }
};

// Expor alerts para o escopo global
window.alerts = alerts;

// Gerenciamento de Gráficos
const charts = {
    commonOptions: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 10,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                callbacks: {
                    title: function(context) {
                        const date = new Date(context[0].parsed.x);
                        return date.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second',
                    displayFormats: {
                        second: 'HH:mm:ss'
                    },
                    tooltipFormat: 'HH:mm:ss'
                },
                grid: { display: false },
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6,
                    source: 'auto',
                    callback: function(value) {
                        const date = new Date(value);
                        return date.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });
                    }
                }
            },
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(0, 0, 0, 0.1)' }
            }
        }
    },

    init() {
        this.initTemperatureChart();
        this.initPressureChart();
    },

    initTemperatureChart() {
        const ctx = document.getElementById('temperatureChart')?.getContext('2d');
        if (!ctx) return;

        state.charts.temperature = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Temperatura',
                    data: [],
                    borderColor: '#FF6B6B',
                    backgroundColor: `rgba(255, 107, 107, ${CONFIG.CHART_FILL_OPACITY})`,
                    borderWidth: 2,
                    pointRadius: CONFIG.CHART_POINT_RADIUS,
                    pointHoverRadius: CONFIG.CHART_POINT_RADIUS,
                    tension: CONFIG.CHART_TENSION,
                    fill: true
                }]
            },
            options: {
                ...this.commonOptions,
                plugins: {
                    ...this.commonOptions.plugins,
                    datalabels: { display: false }
                },
                scales: {
                    ...this.commonOptions.scales,
                    y: {
                        ...this.commonOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    }
                }
            }
        });
    },

    initPressureChart() {
        const ctx = document.getElementById('pressureChart')?.getContext('2d');
        if (!ctx) return;

        state.charts.pressure = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Pressão',
                    data: [],
                    borderColor: '#4ECDC4',
                    backgroundColor: `rgba(78, 205, 196, ${CONFIG.CHART_FILL_OPACITY})`,
                    borderWidth: 2,
                    pointRadius: CONFIG.CHART_POINT_RADIUS,
                    pointHoverRadius: CONFIG.CHART_POINT_RADIUS,
                    tension: CONFIG.CHART_TENSION,
                    fill: true
                }]
            },
            options: {
                ...this.commonOptions,
                plugins: {
                    ...this.commonOptions.plugins,
                    datalabels: { display: false }
                },
                scales: {
                    ...this.commonOptions.scales,
                    y: {
                        ...this.commonOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Pressão (kPa)'
                        }
                    }
                }
            }
        });
    },

    async update() {
        await Promise.all([
            this.updateTemperatureChart(),
            this.updatePressureChart()
        ]);
    },

    async updateTemperatureChart() {
        try {
            const response = await utils.fetchWithTimeout('/temperature-data');
            const data = await response.json();
            
            if (!data.timestamps || !data.temperatures) {
                throw new Error('Dados de temperatura inválidos');
            }
            
            const chartData = data.timestamps.map((timestamp, index) => ({
                x: new Date(timestamp).getTime(),
                y: parseFloat(data.temperatures[index])
            }));
            
            if (state.charts.temperature) {
                state.charts.temperature.data.datasets[0].data = chartData;
                state.charts.temperature.update('none');
            }
        } catch (error) {
            console.error('Erro ao atualizar gráfico de temperatura:', error);
        }
    },

    async updatePressureChart() {
        try {
            const response = await utils.fetchWithTimeout('/pressure-data');
            const data = await response.json();
            
            if (!data.timestamps || !data.pressures) {
                throw new Error('Dados de pressão inválidos');
            }
            
            const chartData = data.timestamps.map((timestamp, index) => ({
                x: new Date(timestamp).getTime(),
                y: parseFloat(data.pressures[index])
            }));
            
            if (state.charts.pressure) {
                state.charts.pressure.data.datasets[0].data = chartData;
                state.charts.pressure.update('none');
            }
        } catch (error) {
            console.error('Erro ao atualizar gráfico de pressão:', error);
        }
    }
};

// Gerenciamento de Controles
const controls = {
    init() {
        this.initInterruptButton();
        this.initPlantSelection();
    },

    initInterruptButton() {
        const interruptBtn = document.getElementById('interruptBtn');
        if (!interruptBtn) return;

        interruptBtn.addEventListener('click', () => {
            state.simulation.isRunning = !state.simulation.isRunning;
            interruptBtn.innerHTML = state.simulation.isRunning
                ? '<span class="btn-icon">⏸️</span> Interromper'
                : '<span class="btn-icon">▶️</span> Continuar';
            
            this.publishMQTTCommand('process', state.simulation.isRunning ? 'start' : 'stop');
        });
    },

    initPlantSelection() {
        const plantButtons = document.querySelectorAll('.plant-button');
        plantButtons.forEach(button => {
            button.addEventListener('click', () => {
                const plantId = button.dataset.plant;
                const plant = PLANTS[plantId];
                if (plant) {
                    this.selectPlant(plantId, plant.temperature, plant.pressure);
                }
            });
        });
    },

    selectPlant(plantId, recommendedTemp, recommendedPressure) {
        state.simulation.currentPlant = plantId;
        const plant = PLANTS[plantId];

        document.querySelector('.plant-name').innerText = plant.name;
        document.querySelector('.current-temp').textContent = `${recommendedTemp} °C`;

        this.addRecommendedIndicators(recommendedTemp, recommendedPressure);

        state.simulation.timeRemaining = CONFIG.PROCESS_DURATION;
        state.simulation.progress = 0;
        state.simulation.isRunning = true;

        document.getElementById('interruptBtn').innerHTML = '<span class="btn-icon">⏸️</span> Interromper';
        document.querySelector('.time-display').textContent = utils.formatTime(state.simulation.timeRemaining);
        window.updateProgressCircle(0);

        alerts.add('success', `Processo iniciado com ${plant.name}. ${plant.description}`);
        this.publishMQTTCommand('plant', plantId);
    },

    addRecommendedIndicators(recommendedTemp, recommendedPressure) {
        const tempDisplay = document.querySelector('.temp-display');
        const pressureDisplay = document.querySelector('.gauge-value');
        
        if (!tempDisplay || !pressureDisplay) return;

        this.updateRecommendedIndicator(tempDisplay, `Meta: ${recommendedTemp}°C`);
        this.updateRecommendedIndicator(pressureDisplay.parentElement, `Meta: ${recommendedPressure} Pa`);
    },

    updateRecommendedIndicator(container, text) {
        let indicator = container.querySelector('.recommended-value');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'recommended-value';
            container.appendChild(indicator);
        }
        indicator.textContent = text;
    },

    publishMQTTCommand(command, value) {
        const payload = {
            command,
            value,
            timestamp: new Date().toISOString()
        };
        // Implementar publicação MQTT aqui
        console.log('MQTT Command:', payload);
    }
};

// Gerenciamento de Dados em Tempo Real
const realtime = {
    async update() {
        try {
            const response = await utils.fetchWithTimeout('/mqtt-data');
            const data = await response.json();
            
            state.simulation.useRealData = true;

            if (!state.simulation.currentPlant) {
                document.querySelector('.plant-name').innerText = 'Manjericão';
            }

            const tempValue = parseFloat(data.temperatura) || 0;
            document.querySelector('.temp-value').innerText = `${tempValue.toFixed(1)} °C`;
            state.simulation.temperature = tempValue;

            const waterLevel = data.nivel === 'ALTO' ? 80 : 20;
            state.simulation.waterLevel = waterLevel;
            window.updateWaterLevel(waterLevel);

            const pressure = parseFloat(data.pressao_kPa) || 0;
            state.simulation.pressure = pressure;
            window.updatePressureGauge(pressure);

            if (!state.simulation.alertShown) {
                alerts.add('success', 'Conectado ao broker MQTT. Dados reais sendo exibidos.');
                state.simulation.alertShown = true;
            }
        } catch (error) {
            console.error('Erro ao buscar dados MQTT:', error);
            if (state.simulation.useRealData) {
                alerts.add('error', 'Erro na conexão MQTT. Usando dados simulados.');
                state.simulation.useRealData = false;
            }
        }
    }
};

// Simulação
const simulation = {
    start() {
        setInterval(() => {
            if (state.simulation.useRealData || !state.simulation.isRunning) return;

            this.updateTime();
            this.updateProgress();
            this.updateTemperature();
            this.updatePressure();
            this.updateWaterLevel();
            this.checkRandomAlerts();
            this.checkProcessCompletion();
        }, CONFIG.SIMULATION_INTERVAL);
    },

    updateTime() {
        state.simulation.timeRemaining = Math.max(0, state.simulation.timeRemaining - 1);
        document.querySelector('.time-display').textContent = utils.formatTime(state.simulation.timeRemaining);
    },

    updateProgress() {
        state.simulation.progress = 100 - (state.simulation.timeRemaining / CONFIG.PROCESS_DURATION) * 100;
        window.updateProgressCircle(state.simulation.progress);
    },

    updateTemperature() {
        state.simulation.temperature = Math.min(CONFIG.MAX_TEMPERATURE, 
            state.simulation.temperature + 0.2);
        document.querySelector('.temp-value').textContent = 
            `${Math.floor(state.simulation.temperature)} °C`;
        window.updateTemperatureChart(state.simulation.temperature);
    },

    updatePressure() {
        const pressureChange = (Math.random() - 0.5) * 5;
        state.simulation.pressure = Math.max(0, 
            Math.min(CONFIG.MAX_PRESSURE, state.simulation.pressure + pressureChange));
        window.updatePressureGauge(state.simulation.pressure);
    },

    updateWaterLevel() {
        const levelChange = (Math.random() - 0.5) * 2;
        state.simulation.waterLevel = Math.max(0, 
            Math.min(CONFIG.MAX_WATER_LEVEL, state.simulation.waterLevel + levelChange));
        window.updateWaterLevel(state.simulation.waterLevel);
    },

    checkRandomAlerts() {
        if (Math.random() < 0.01) {
            const types = ['error', 'success', 'info'];
            const messages = [
                'Temperatura acima do limite',
                'Pressão normalizada',
                'Nível de água baixo',
                'Sistema funcionando normalmente',
                'Verificação de rotina concluída'
            ];

            const type = types[Math.floor(Math.random() * types.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];

            alerts.add(type, message);
        }
    },

    checkProcessCompletion() {
        if (state.simulation.timeRemaining === 0) {
            alerts.add('success', 'Processo concluído com sucesso!');
            state.simulation.isRunning = false;
            document.getElementById('interruptBtn').innerHTML = 
                '<span class="btn-icon">▶️</span> Reiniciar';
        }
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
    charts.init();
    controls.init();
    
    // Iniciar atualizações periódicas
    setInterval(() => {
        realtime.update();
        charts.update();
        alerts.fetch();
    }, CONFIG.UPDATE_INTERVAL);
    
    // Iniciar simulação
    simulation.start();
    
    // Primeira atualização
    realtime.update();
    charts.update();
    alerts.fetch();

    // Adiciona funcionalidade ao botão de abrir modal de produção
    const btnProducao = document.getElementById('abrir-producao-modal-btn');
    if (btnProducao) {
        btnProducao.addEventListener('click', function() {
            const modal = document.getElementById('producao-modal');
            if (modal) modal.style.display = 'block';
        });
    }

    // Escuta evento customizado do novo processo
    window.addEventListener('novoProcessoIniciado', function(e) {
        const { planta, quantidade, parte, duracao } = e.detail;
        // Atualiza nome da planta
        const plantName = document.querySelector('.plant-name');
        if (plantName) plantName.textContent = planta.charAt(0).toUpperCase() + planta.slice(1);
        // Atualiza quantidade de matéria-prima
        const materialInput = document.querySelector('.material-input');
        if (materialInput) materialInput.value = `${quantidade} gramas`;
        // Atualiza parte utilizada (adiciona se não existir)
        let parteEl = document.querySelector('.parte-utilizada');
        if (!parteEl) {
            parteEl = document.createElement('div');
            parteEl.className = 'parte-utilizada';
            parteEl.style.marginTop = '8px';
            parteEl.style.fontSize = '15px';
            document.querySelector('.plant-info').appendChild(parteEl);
        }
        parteEl.textContent = `Parte utilizada: ${parte.charAt(0).toUpperCase() + parte.slice(1)}`;
        // Atualiza duração estimada (adiciona se não existir)
        let duracaoEl = document.querySelector('.duracao-estimada');
        if (!duracaoEl) {
            duracaoEl = document.createElement('div');
            duracaoEl.className = 'duracao-estimada';
            duracaoEl.style.marginTop = '4px';
            duracaoEl.style.fontSize = '15px';
            document.querySelector('.plant-info').appendChild(duracaoEl);
        }
        duracaoEl.textContent = `Duração estimada: ${duracao}`;
    });
});

// Atualiza o gauge de pressão desenhando o arco no canvas
window.updatePressureGauge = function(pressure) {
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
};

// Adiciona função para atualizar o nível de água
window.updateWaterLevel = function(waterLevel) {
    const waterFill = document.getElementById('waterFill');
    const levelStatus = document.querySelector('.level-status');
    if (!waterFill || !levelStatus) return;
    // Nível de 0 a 100
    const percent = Math.max(0, Math.min(100, waterLevel));
    waterFill.style.height = `${percent}%`;
    levelStatus.textContent = percent < 50 ? 'Baixo' : 'Alto';
};

// Corrige duplicidade de alertas: limpa a lista antes de renderizar
alerts.render = function(alertsArr) {
    const alertList = document.querySelector('.alert-list');
    if (!alertList) return;
    alertList.innerHTML = '';
    alertsArr.forEach(alert => this.createAlertElement(alert, alertList));
};

// Função para desenhar o contador circular de tempo restante
window.updateProgressCircle = function(percent) {
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
};

// Atualiza o contador circular e o tempo restante
function startCircularCountdown(durationSec) {
    let remaining = durationSec;
    const timeDisplay = document.querySelector('.time-display');
    const progressText = document.querySelector('.progress-text');
    if (!timeDisplay) return;
    if (window._countdownInterval) clearInterval(window._countdownInterval);
    function update() {
        const percent = 100 * (remaining / durationSec);
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        const timeStr = [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
        timeDisplay.textContent = timeStr;
        progressText.textContent = `${Math.round(percent)}%`;
        window.updateProgressCircle(percent);
        if (remaining <= 0) {
            clearInterval(window._countdownInterval);
        } else {
            remaining--;
        }
    }
    update();
    window._countdownInterval = setInterval(update, 1000);
}

// Escuta evento customizado do novo processo para iniciar o contador
window.addEventListener('novoProcessoIniciado', function(e) {
    let duracao = e.detail.duracao;
    // Extrai número de minutos do texto (ex: '44 minutos')
    let minutos = 0;
    if (duracao) {
        const match = duracao.match(/(\d+)/);
        if (match) minutos = parseInt(match[1], 10);
    }
    if (minutos > 0) {
        startCircularCountdown(minutos * 60);
    }
});

// Adicionar handler para o modal de produção
document.addEventListener('DOMContentLoaded', function() {
    const producaoForm = document.getElementById('producao-form');
    const volumeInput = document.querySelector('input[name="volume_extraido"]');
    const rendimentoInput = document.getElementById('rendimento-extracao');
    const quantidadeOriginal = document.querySelector('.material-input')?.value;

    if (producaoForm && volumeInput && rendimentoInput) {
        // Calcular rendimento quando o volume é alterado
        volumeInput.addEventListener('input', function() {
            const volume = parseFloat(this.value) || 0;
            const quantidade = parseFloat(quantidadeOriginal?.match(/(\d+)/)?.[1] || 0);
            
            if (quantidade > 0) {
                const rendimento = (volume / quantidade) * 100;
                rendimentoInput.value = rendimento.toFixed(2) + '%';
            } else {
                rendimentoInput.value = '';
            }
        });

        // Handler para submissão do formulário
        producaoForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!window.currentProcessId) {
                alert('Erro: ID do processo não encontrado');
                return;
            }

            try {
                const formData = {
                    volume_extraido: parseFloat(volumeInput.value),
                    rendimento: parseFloat(rendimentoInput.value),
                    notas_operador: document.querySelector('textarea[name="notas_operador"]').value
                };

                const response = await fetch(`/api/process/${window.currentProcessId}/finish`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    document.getElementById('producao-modal').style.display = 'none';
                    alert('Processo finalizado com sucesso!');
                    // Limpar o ID do processo atual
                    window.currentProcessId = null;
                    // Recarregar a página para atualizar o estado
                    window.location.reload();
                } else {
                    throw new Error(result.error || 'Erro ao finalizar processo');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao finalizar processo: ' + error.message);
            }
        });
    }
});

// Função global para verificar processo em andamento
window.verificarProcessoEmAndamento = async function() {
    console.log('Verificando processo em andamento...');
    try {
        const response = await fetch('/api/process');
        const result = await response.json();
        
        if (result.success) {
            const processoEmAndamento = result.processes.find(p => p.status === 'em andamento');
            if (processoEmAndamento) {
                console.log('Processo em andamento encontrado:', processoEmAndamento);
                // Aguarda um pequeno delay para garantir que o sistema de alertas esteja disponível
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (window.alerts) {
                    await window.alerts.add(
                        `Já existe um processo em andamento: ${processoEmAndamento.planta} (${processoEmAndamento.quantidade_materia_prima}g)`,
                        'error',
                        null,
                        true
                    );
                } else {
                    console.error('Sistema de alertas não disponível');
                }
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Erro ao verificar processo em andamento:', error);
        // Aguarda um pequeno delay para garantir que o sistema de alertas esteja disponível
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (window.alerts) {
            await window.alerts.add(
                'Erro ao verificar processo em andamento. Por favor, tente novamente.',
                'error',
                null,
                true
            );
        } else {
            console.error('Sistema de alertas não disponível');
        }
        return true; // Em caso de erro, impede a abertura do modal por segurança
    }
}; 