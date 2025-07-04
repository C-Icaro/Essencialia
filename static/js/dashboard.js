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
    },

    async getCurrentProcess() {
        const resp = await fetch('/api/process/active');
        const data = await resp.json();
        return data.active && data.process ? data.process : null;
    }
};

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

    async updateWaterLevelChart() {
        try {
            const processId = window.currentProcessId;
            const url = processId ? `/water-level-data?process_id=${processId}` : '/water-level-data';
            const response = await utils.fetchWithTimeout(url);
            const data = await response.json();
            if (!data.timestamps || !data.water_levels) {
                throw new Error('Dados de nível de água inválidos');
            }
            // Aqui você pode atualizar um gráfico de nível de água, se houver
            // Exemplo: atualizar um gráfico Chart.js ou exibir o último valor
            // Exemplo de uso futuro:
            // const chartData = data.timestamps.map((timestamp, index) => ({
            //     x: new Date(timestamp).getTime(),
            //     y: parseFloat(data.water_levels[index])
            // }));
            // if (state.charts.waterLevel) {
            //     state.charts.waterLevel.data.datasets[0].data = chartData;
            //     state.charts.waterLevel.update('none');
            // }
            // Atualizar o display do nível de água atual
            if (data.water_levels.length > 0) {
                const lastLevel = data.water_levels[data.water_levels.length - 1];
                window.updateWaterLevel(lastLevel * 100); // Supondo que 1.0 = 100%
            }
        } catch (error) {
            console.error('Erro ao atualizar dados de nível de água:', error);
        }
    },

    async update() {
        await Promise.all([
            this.updateTemperatureChart(),
            this.updatePressureChart(),
            this.updateWaterLevelChart()
        ]);
    },

    async updateTemperatureChart() {
        try {
            const processId = window.currentProcessId;
            const url = processId ? `/temperature-data?process_id=${processId}` : '/temperature-data';
            const response = await utils.fetchWithTimeout(url);
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
            const processId = window.currentProcessId;
            const url = processId ? `/pressure-data?process_id=${processId}` : '/pressure-data';
            const response = await utils.fetchWithTimeout(url);
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

        const plantNameEl = document.querySelector('.plant-name');
        if (plantNameEl) plantNameEl.innerText = plant.name;

        const currentTempEl = document.querySelector('.current-temp');
        if (currentTempEl) currentTempEl.textContent = `${recommendedTemp} °C`;

        this.addRecommendedIndicators(recommendedTemp, recommendedPressure);

        state.simulation.timeRemaining = CONFIG.PROCESS_DURATION;
        state.simulation.progress = 0;
        state.simulation.isRunning = true;

        const interruptBtn = document.getElementById('interruptBtn');
        if (interruptBtn) {
            interruptBtn.innerHTML = '<span class="btn-icon">⏸️</span> Interromper';
        }

        alerts.add('success', `Processo iniciado com ${plant.name}. ${plant.description}`);
        this.publishMQTTCommand('plant', plantId);
    },

    addRecommendedIndicators(recommendedTemp, recommendedPressure) {
        const tempDisplay = document.querySelector('.temp-display');
        const pressureDisplay = document.querySelector('.gauge-value');
        
        if (!tempDisplay || !pressureDisplay) return;

        this.updateRecommendedIndicator(tempDisplay, `Meta: ${recommendedTemp}°C`);
        if (pressureDisplay.parentElement) {
            this.updateRecommendedIndicator(pressureDisplay.parentElement, `Meta: ${recommendedPressure} Pa`);
        }
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

            const tempValue = parseFloat(data.temperatura) || 0;
            const tempValueEl = document.querySelector('.temp-value');
            if (tempValueEl) tempValueEl.innerText = `${tempValue.toFixed(1)} °C`;
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
    },

    updateProgress() {
        state.simulation.progress = 100 - (state.simulation.timeRemaining / CONFIG.PROCESS_DURATION) * 100;
    },

    updateTemperature() {
        state.simulation.temperature = Math.min(CONFIG.MAX_TEMPERATURE, 
            state.simulation.temperature + 0.2);
        const tempValueEl = document.querySelector('.temp-value');
        if (tempValueEl) {
            tempValueEl.textContent = 
                `${Math.floor(state.simulation.temperature)} °C`;
        }
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

// Handler para cancelar processo
function setupCancelProcessButton() {
    const cancelBtn = document.getElementById('cancelProcessBtn');
    if (!cancelBtn) return;
    cancelBtn.addEventListener('click', async () => {
        if (!window.currentProcessId) {
            alert('Nenhum processo em andamento para cancelar.');
            return;
        }
        if (!confirm('Tem certeza que deseja cancelar o processo em andamento?')) return;
        try {
            const response = await fetch(`/api/process/${window.currentProcessId}/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    volume_extraido: 0,
                    rendimento: 0,
                    notas_operador: 'Processo cancelado pelo operador.'
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('Processo cancelado com sucesso!');
                // Abrir o modal de produção para preenchimento dos dados finais
                const producaoModal = document.getElementById('producao-modal');
                if (producaoModal) producaoModal.style.display = 'block';
                // window.currentProcessId = null; // Remover reload automático para permitir preenchimento do modal
                // window.location.reload();
            } else {
                throw new Error(result.error || 'Erro ao cancelar processo');
            }
        } catch (error) {
            alert('Erro ao cancelar processo: ' + error.message);
        }
    });
}

// Defina o fuso horário da aplicação (pode ser alterado para 'America/Manaus' depois)
window.APP_TIMEZONE = 'America/Sao_Paulo';

function formatToAppTimezone(utcString, options = {}) {
    if (!utcString) return '';
    const date = new Date(utcString);
    return date.toLocaleString('pt-BR', {
        timeZone: window.APP_TIMEZONE,
        ...options
    });
}

// Exemplo de uso: exibir start_time e finish_time se existirem
function updateProcessTimesOnDashboard(processo) {
    if (!processo) return;
    const startTimeEl = document.querySelector('.start-time');
    const finishTimeEl = document.querySelector('.finish-time');
    if (startTimeEl && processo.start_time) {
        startTimeEl.textContent = formatToAppTimezone(processo.start_time);
    }
    if (finishTimeEl && processo.finish_time) {
        finishTimeEl.textContent = formatToAppTimezone(processo.finish_time);
    }
}

async function checkProcessActiveAndToggleUI() {
    try {
        const resp = await fetch('/api/process');
        const data = await resp.json();
        const processoAtivo = data.processes && data.processes.find(p => p.status === 'em andamento');
        const processSection = document.getElementById('process-active-section');
        const noProcessSection = document.getElementById('no-process-section');
        if (processoAtivo) {
            if (processSection) processSection.style.display = '';
            if (noProcessSection) noProcessSection.style.display = 'none';
        } else {
            if (processSection) processSection.style.display = 'none';
            if (noProcessSection) noProcessSection.style.display = '';
        }
    } catch (e) {
        // Em caso de erro, esconde tudo
        const processSection = document.getElementById('process-active-section');
        const noProcessSection = document.getElementById('no-process-section');
        if (processSection) processSection.style.display = 'none';
        if (noProcessSection) noProcessSection.style.display = '';
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    await checkProcessActiveAndToggleUI();
    // Buscar processo em andamento ao carregar a página
    try {
        const resp = await fetch('/api/process/active');
        const data = await resp.json();
        if (data.auto_finished) {
            alert('Processo finalizado automaticamente por tempo excedido!');
        }
        if (data.active && data.process && data.process.id) {
            window.currentProcessId = data.process.id;
            updateProcessTimesOnDashboard(data.process);
        } else {
            window.currentProcessId = null;
        }
    } catch (e) {
        window.currentProcessId = null;
    }

    // Inicializa os componentes
    const processChecker = window.ProcessChecker.init();
    const uiUpdater = window.UIUpdater.init();
    const remainingTime = await window.RemainingTime.init('.time-display');

    // Atualiza informações do processo em andamento ao carregar
    if (uiUpdater) uiUpdater.updateCurrentProcess();

    // Inicializa os gráficos
    charts.init();
    controls.init();

    // Inicia atualizações periódicas dos gráficos
    setInterval(async () => {
        try {
            await charts.update();
            await realtime.update();
        } catch (error) {
            console.error('Erro nas atualizações periódicas:', error);
        }
    }, CONFIG.UPDATE_INTERVAL);

    // Inicia a simulação
    simulation.start();

    // Primeira atualização
    charts.update();
    realtime.update();

    // Evento de novo processo iniciado
    window.addEventListener('novoProcessoIniciado', async () => {
        await checkProcessActiveAndToggleUI();
        window.location.reload(); // Recarrega a página após novo processo
    });

    // Evento de conclusão do processo
    window.addEventListener('countdownComplete', async () => {
        // Mostra alerta de sucesso
        window.alerts.add('Processo concluído com sucesso!', 'success');
        
        // Abre o modal de produção
        const producaoModal = document.getElementById('producao-modal');
        if (producaoModal) producaoModal.style.display = 'block';
        await checkProcessActiveAndToggleUI();
    });

    // Evento de visibilidade da página
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
            // Atualiza os gráficos
            await charts.update();
            await realtime.update();
            
            // Reinicia o contador quando a página volta a ficar visível (mantido apenas o RemainingTime)
            if (remainingTime) {
                await remainingTime.start();
            }
        }
    });

    setupCancelProcessButton();
});

// Atualiza o gauge de pressão usando o UIUpdater
window.updatePressureGauge = function(pressure) {
    const uiUpdater = window.UIUpdater;
    if (uiUpdater) uiUpdater.updatePressureGauge(pressure);
};

// Atualiza o nível de água
window.updateWaterLevel = function(waterLevel) {
    const waterFill = document.getElementById('waterFill');
    const levelStatus = document.querySelector('.level-status');
    if (!waterFill || !levelStatus) return;
    // Nível de 0 a 100
    const percent = Math.max(0, Math.min(100, waterLevel));
    waterFill.style.height = `${percent}%`;
    levelStatus.textContent = percent < 50 ? 'Baixo' : 'Alto';
};

// Adicionar handler para o modal de produção
document.addEventListener('DOMContentLoaded', function() {
    const producaoForm = document.getElementById('producao-form');
    const volumeInput = document.querySelector('input[name="volume_extraido"]');

    if (producaoForm && volumeInput) {
        producaoForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!window.currentProcessId) {
                alert('Erro: ID do processo não encontrado');
                return;
            }

            try {
                // Obter volume extraído
                const volumeExtraido = parseFloat(volumeInput.value);
                // Buscar quantidade de matéria-prima do processo ativo
                let quantidadeMateriaPrima = 0;
                try {
                    const resp = await fetch('/api/process/active');
                    const data = await resp.json();
                    if (data && data.process && data.process.quantidade_materia_prima) {
                        quantidadeMateriaPrima = parseFloat(data.process.quantidade_materia_prima);
                    }
                } catch (e) {
                    quantidadeMateriaPrima = 0;
                }
                // Calcular rendimento
                let rendimento = 0;
                if (quantidadeMateriaPrima > 0) {
                    rendimento = (volumeExtraido / quantidadeMateriaPrima) * 100;
                }
                const formData = {
                    volume_extraido: volumeExtraido,
                    rendimento: rendimento,
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
                    window.currentProcessId = null;
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