Chart.register(ChartDataLabels);

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#666';
Chart.defaults.plugins.datalabels.color = '#fff';
Chart.defaults.plugins.datalabels.font.weight = 'bold';

Chart.defaults.locale = window.dateFnsLocale;

document.addEventListener("DOMContentLoaded", () => {
    initProgressCircle()
    initCharts()
    initPressureGauge()
    initWaterLevel()
    initControls()
    initAlerts()
    initPlantSelection()

    startDataFetching()

    startSimulation()
  })

  const simulationData = {
    temperature: 0,
    pressure: 0,
    waterLevel: 50,
    timeRemaining: 3600,
    progress: 0,
    isRunning: true,
    useRealData: false,
    currentPlant: null,
  }

  const plants = {
    lavanda: {
      name: "Lavanda",
      temperature: 60,
      pressure: 25,
      description: "Ideal para óleos relaxantes",
    },
    eucalipto: {
      name: "Eucalipto",
      temperature: 70,
      pressure: 30,
      description: "Propriedades medicinais",
    },
    alecrim: {
      name: "Alecrim",
      temperature: 65,
      pressure: 28,
      description: "Estimulante natural",
    },
    manjericao: {
      name: "Manjericão",
      temperature: 55,
      pressure: 22,
      description: "Aroma intenso",
    },
    hortela: {
      name: "Hortelã",
      temperature: 50,
      pressure: 20,
      description: "Refrescante e medicinal",
    },
  }

  function initPlantSelection() {
    document.querySelector(".new-process-btn").addEventListener("click", () => {
      document.getElementById("plantSelectionModal").style.display = "block"
    })

    document.querySelector(".close-modal").addEventListener("click", () => {
      document.getElementById("plantSelectionModal").style.display = "none"
    })

    window.addEventListener("click", (event) => {
      if (event.target === document.getElementById("plantSelectionModal")) {
        document.getElementById("plantSelectionModal").style.display = "none"
      }
    })

    document.querySelectorAll(".plant-card").forEach((card) => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".plant-card").forEach((c) => c.classList.remove("selected"))

        card.classList.add("selected")

        const plantId = card.dataset.plant
        const plantTemp = Number.parseInt(card.dataset.temp)
        const plantPressure = Number.parseInt(card.dataset.pressure)

        selectPlant(plantId, plantTemp, plantPressure)

        setTimeout(() => {
          document.getElementById("plantSelectionModal").style.display = "none"
        }, 500)
      })
    })
  }

  function selectPlant(plantId, recommendedTemp, recommendedPressure) {
    simulationData.currentPlant = plantId

    document.querySelector(".plant-name").innerText = plants[plantId].name

    document.querySelector(".current-temp").textContent = `${recommendedTemp} °C`

    addRecommendedIndicators(recommendedTemp, recommendedPressure)

    simulationData.timeRemaining = 3600
    simulationData.progress = 0
    simulationData.isRunning = true
    document.getElementById("interruptBtn").innerHTML = '<span class="btn-icon">⏸️</span> Interromper'

    document.querySelector(".time-display").textContent = formatTime(simulationData.timeRemaining)

    window.updateProgressCircle(0)

    addAlert("success", `Processo iniciado com ${plants[plantId].name}. ${plants[plantId].description}`)

    publishMQTTCommand("plant", plantId)
  }

  function addRecommendedIndicators(recommendedTemp, recommendedPressure) {
    const tempDisplay = document.querySelector(".temp-display")
    if (!tempDisplay.querySelector(".recommended-value")) {
      const tempRecommended = document.createElement("span")
      tempRecommended.className = "recommended-value"
      tempRecommended.textContent = `Meta: ${recommendedTemp}°C`
      tempDisplay.appendChild(tempRecommended)
    } else {
      tempDisplay.querySelector(".recommended-value").textContent = `Meta: ${recommendedTemp}°C`
    }

    const pressureDisplay = document.querySelector(".gauge-value")
    const pressureContainer = pressureDisplay.parentElement
    if (!pressureContainer.querySelector(".recommended-value")) {
      const pressureRecommended = document.createElement("span")
      pressureRecommended.className = "recommended-value"
      pressureRecommended.textContent = `Meta: ${recommendedPressure} Pa`
      pressureContainer.appendChild(pressureRecommended)
    } else {
      pressureContainer.querySelector(".recommended-value").textContent = `Meta: ${recommendedPressure} Pa`
    }
  }

  function publishMQTTCommand(command, value) {
    const payload = {
      command: command,
      value: value,
      timestamp: new Date().toISOString(),
    }
  }

  function startDataFetching() {
    setInterval(updateBoardInfo, 2000)

    setInterval(() => {
        updateCharts()
        fetchAlerts()
    }, 2000)

    updateBoardInfo()
    updateCharts()
    fetchAlerts()
  }

  function updateCharts() {
    fetch('/temperature-data')
        .then(response => response.json())
        .then(data => {
            if (!data.timestamps || !data.temperatures) {
                console.error('Dados de temperatura inválidos:', data);
                return;
            }
            
            const chartData = data.timestamps.map((timestamp, index) => ({
                x: new Date(timestamp).getTime(),
                y: parseFloat(data.temperatures[index])
            }));
            
            if (temperatureChart) {
                temperatureChart.data.datasets[0].data = chartData;
                temperatureChart.update('none');
            }
        })
        .catch(error => console.error('Erro ao buscar dados de temperatura:', error));

    fetch('/pressure-data')
        .then(response => response.json())
        .then(data => {
            if (!data.timestamps || !data.pressures) {
                console.error('Dados de pressão inválidos:', data);
                return;
            }
            
            const chartData = data.timestamps.map((timestamp, index) => ({
                x: new Date(timestamp).getTime(),
                y: parseFloat(data.pressures[index])
            }));
            
            if (pressureChart) {
                pressureChart.data.datasets[0].data = chartData;
                pressureChart.update('none');
            }
        })
        .catch(error => console.error('Erro ao buscar dados de pressão:', error));
  }

  function updateBoardInfo() {
    fetch("/mqtt-data")
      .then((response) => response.json())
      .then((data) => {
        simulationData.useRealData = true

        if (!simulationData.currentPlant) {
          document.querySelector(".plant-name").innerText = "Manjericão"
        }

            const tempValue = parseFloat(data.temperatura) || 0
            document.querySelector(".temp-value").innerText = `${tempValue.toFixed(1)} °C`
        simulationData.temperature = tempValue

        const waterLevel = data.nivel === "ALTO" ? 80 : 20
        simulationData.waterLevel = waterLevel
        window.updateWaterLevel(waterLevel)

            const pressure = parseFloat(data.pressao_kPa) || 0
        simulationData.pressure = pressure
        window.updatePressureGauge(pressure)

        if (!simulationData.alertShown) {
          addAlert("success", "Conectado ao broker MQTT. Dados reais sendo exibidos.")
          simulationData.alertShown = true
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar dados MQTT:", error)
        if (simulationData.useRealData) {
          addAlert("error", "Erro na conexão MQTT. Usando dados simulados.")
          simulationData.useRealData = false
        }
      })
  }

  let temperatureChart = null;
  let pressureChart = null;

  function initCharts() {
    const commonOptions = {
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
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                },
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
                grid: {
                    display: false
                },
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
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };

    // Inicializar gráfico de temperatura
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    temperatureChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Temperatura',
                data: [],
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                datalabels: {
                    display: false
                }
            },
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            }
        }
    });

    // Inicializar gráfico de pressão
    const pressureCtx = document.getElementById('pressureChart').getContext('2d');
    pressureChart = new Chart(pressureCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Pressão',
                data: [],
                borderColor: '#4ECDC4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                datalabels: {
                    display: false
                }
            },
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        display: true,
                        text: 'Pressão (kPa)'
                    }
                }
            }
        }
    });
  }

  function initAlerts() {
    document.querySelectorAll(".close-alert").forEach((button) => {
        button.addEventListener("click", function () {
            const alertElement = this.parentElement;
            const alertId = alertElement.dataset.alertId;
            if (alertId) {
                fetch(`/alerts/resolve/${alertId}`, {
                    method: 'POST'
                }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alertElement.style.display = "none";
                    }
                })
                .catch(error => console.error('Erro ao resolver alerta:', error));
            } else {
                alertElement.style.display = "none";
            }
        });
    });

    fetchAlerts();
  }

  function fetchAlerts() {
    fetch("/alerts")
        .then(response => response.json())
        .then(alerts => {
            const alertList = document.querySelector(".alert-list");
            alertList.innerHTML = "";
            if (alerts.length === 0) {
                const noAlerts = document.createElement("div");
                noAlerts.className = "alert info";
                noAlerts.innerHTML = `
                    <span class="alert-icon">ℹ️</span>
                    <span class="alert-text">Nenhum alerta ativo</span>
                `;
                alertList.appendChild(noAlerts);
                return;
            }
            alerts.forEach(alert => {
                const alertElement = document.createElement("div");
                alertElement.className = `alert ${getAlertClass(alert.type)}`;
                alertElement.dataset.alertId = alert.id;
                let icon = "⚠️";
                if (alert.type === "success") icon = "✅";
                else if (alert.type === "info") icon = "ℹ️";
                // Exibição simplificada
                let alertContent = "";
                if (alert.type === "falha" && alert.data) {
                    // Exibir apenas os campos enviados pelo broker
                    alertContent = `<div class='alert-details'>`;
                    if (alert.data.tipo) alertContent += `<div><b>Tipo:</b> ${alert.data.tipo}</div>`;
                    if (alert.data.horario) alertContent += `<div><b>Horário:</b> ${formatAlertTime(alert.data.horario)}</div>`;
                    if (alert.data.duracao_sec) alertContent += `<div><b>Duração:</b> ${alert.data.duracao_sec} s</div>`;
                    if (alert.data.solucao) alertContent += `<div><b>Solução:</b> ${alert.data.solucao}</div>`;
                    alertContent += `</div>`;
                } else {
                    // Para alertas: mostrar só o texto puro
                    alertContent = `<div class='alert-details'>${alert.message}</div>`;
                }
                alertElement.innerHTML = `
                    <div class="alert-header">
                        <span class="alert-icon">${icon}</span>
                        <span class="alert-text"></span>
                        <button class="close-alert">×</button>
                    </div>
                    ${alertContent}
                `;
                alertElement.querySelector(".close-alert").addEventListener("click", () => {
                    fetch(`/alerts/resolve/${alert.id}`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => { if (data.success) alertElement.style.display = "none"; });
                });
                alertList.appendChild(alertElement);
            });
        })
        .catch(error => console.error('Erro ao buscar alertas:', error));
  }

  function getAlertClass(type) {
    switch (type) {
        case 'temperature':
            return 'error';
        case 'pressure':
            return 'error';
        case 'water_level':
            return 'error';
        case 'success':
            return 'success';
        default:
            return 'info';
    }
  }

  function formatAlertTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const localTime = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    if (diff < 60000) {
        return 'Agora mesmo';
    }
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás (${localTime})`;
    }
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hora${hours > 1 ? 's' : ''} atrás (${localTime})`;
    }
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
  }

  function addAlert(type, message, data = null) {
    const alertList = document.querySelector(".alert-list");
    const alertElement = document.createElement("div");
    alertElement.className = `alert ${type}`;

    let icon = "⚠️";
    if (type === "success") icon = "✅";
    else if (type === "info") icon = "ℹ️";

    let alertDetails = "";
    if (data) {
        switch (type) {
            case "temperature":
                alertDetails = `
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
                    </div>`;
                break;
            case "pressure":
                if (data.variacao) {
                    alertDetails = `
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
                        </div>`;
                } else {
                    alertDetails = `
                        <div class="alert-details">
                            <div class="detail-item">
                                <span class="detail-label">Pressão:</span>
                                <span class="detail-value">${data.pressao} kPa</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Limite:</span>
                                <span class="detail-value">${data.limite} kPa</span>
                            </div>
                        </div>`;
                }
                break;
            case "water_level":
                alertDetails = `
                    <div class="alert-details">
                        <div class="detail-item">
                            <span class="detail-label">Nível:</span>
                            <span class="detail-value">${data.nivel}</span>
                        </div>
                    </div>`;
                break;
        }
    }

    alertElement.innerHTML = `
        <div class="alert-header">
            <span class="alert-icon">${icon}</span>
            <span class="alert-text">${message}</span>
            <button class="close-alert">×</button>
        </div>
        ${alertDetails}
        <div class="alert-footer">
            <span class="alert-time">Agora mesmo</span>
        </div>
    `;

    alertElement.querySelector(".close-alert").addEventListener("click", () => {
        alertElement.style.display = "none";
    });

    alertList.prepend(alertElement);

    if (!alertElement.dataset.alertId) {
        setTimeout(() => {
            alertElement.style.opacity = "0";
            alertElement.style.transition = "opacity 0.5s";
            setTimeout(() => alertElement.remove(), 500);
        }, 5000);
    }
  }

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
  
    return [h, m, s].map((v) => (v < 10 ? "0" + v : v)).join(":")
  }

  function startSimulation() {
    setInterval(() => {
      if (simulationData.useRealData) return
  
      if (!simulationData.isRunning) return
  
      simulationData.timeRemaining = Math.max(0, simulationData.timeRemaining - 1)
      document.querySelector(".time-display").textContent = formatTime(simulationData.timeRemaining)
  
      simulationData.progress = 100 - (simulationData.timeRemaining / 3600) * 100
      window.updateProgressCircle(simulationData.progress)
  
      simulationData.temperature = Math.min(100, simulationData.temperature + 0.2)
      document.querySelector(".temp-value").textContent = `${Math.floor(simulationData.temperature)} °C`
      window.updateTemperatureChart(simulationData.temperature)
  
      const pressureChange = (Math.random() - 0.5) * 5
      simulationData.pressure = Math.max(0, Math.min(100, simulationData.pressure + pressureChange))
      window.updatePressureGauge(simulationData.pressure)
  
      const levelChange = (Math.random() - 0.5) * 2
      simulationData.waterLevel = Math.max(0, Math.min(100, simulationData.waterLevel + levelChange))
      window.updateWaterLevel(simulationData.waterLevel)
  
      if (Math.random() < 0.01) {
        const types = ["error", "success", "info"]
        const messages = [
          "Temperatura acima do limite",
          "Pressão normalizada",
          "Nível de água baixo",
          "Sistema funcionando normalmente",
          "Verificação de rotina concluída",
        ]
  
        const type = types[Math.floor(Math.random() * types.length)]
        const message = messages[Math.floor(Math.random() * messages.length)]
  
        addAlert(type, message)
      }
  
      if (simulationData.timeRemaining === 0) {
        addAlert("success", "Processo concluído com sucesso!")
        simulationData.isRunning = false
        document.getElementById("interruptBtn").innerHTML = '<span class="btn-icon">▶️</span> Reiniciar'
      }
    }, 1000)
  }

  function initProgressCircle() {
    const canvas = document.getElementById("progressCircle")
    const ctx = canvas.getContext("2d")
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 70
  
    function drawCircle(percentage) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
  
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = "#e0e0e0"
      ctx.lineWidth = 10
      ctx.stroke()
  
      if (percentage > 0) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, (2 * Math.PI * percentage) / 100 - Math.PI / 2)
        ctx.strokeStyle = "#4CAF50"
        ctx.lineWidth = 10
        ctx.stroke()
      }
  
      document.querySelector(".progress-text").textContent = `${Math.floor(percentage)}%`
    }
  
    drawCircle(0)
  
    window.updateProgressCircle = drawCircle
  }

  function initTemperatureChart() {
    const canvas = document.getElementById("temperatureChart")
    const ctx = canvas.getContext("2d")
    const width = (canvas.width = canvas.parentElement.clientWidth)
    const height = (canvas.height = 250)
  
    const data = Array(60).fill(0)
    const maxTemp = 100
  
    function drawChart() {
      if (simulationData.useRealData) return
  
      ctx.clearRect(0, 0, width, height)
  
      ctx.strokeStyle = "#e0e0e0"
      ctx.lineWidth = 1
  
      for (let i = 0; i <= 4; i++) {
        const y = height - (height / 4) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
  
        ctx.fillStyle = "#666"
        ctx.font = "12px Inter"
        ctx.textAlign = "right"
        ctx.fillText(`${i * 25}°C`, 30, y - 5)
      }
  
      for (let i = 0; i <= 3; i++) {
        const x = (width / 3) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
  
        if (i > 0) {
          ctx.fillStyle = "#666"
          ctx.font = "12px Inter"
          ctx.textAlign = "center"
          ctx.fillText(`00:${i * 20}`, x, height - 5)
        } else {
          ctx.fillText(`00:00`, x, height - 5)
        }
      }
  
      ctx.beginPath()
      ctx.moveTo(0, height - (data[0] / maxTemp) * height)
  
      for (let i = 1; i < data.length; i++) {
        const x = (i / (data.length - 1)) * width
        const y = height - (data[i] / maxTemp) * height
        ctx.lineTo(x, y)
      }
  
      ctx.strokeStyle = "#2196F3"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  
    drawChart()
  
    window.updateTemperatureChart = addDataPoint
  }

  function initPressureGauge() {
    const canvas = document.getElementById("pressureGauge")
    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height
    const radius = height - 20
  
    function drawGauge(pressure) {
      ctx.clearRect(0, 0, width, height)
  
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, Math.PI, 0)
      ctx.strokeStyle = "#e0e0e0"
      ctx.lineWidth = 20
      ctx.stroke()
  
      const colors = [
        { limit: 25, color: "#4CAF50" },
        { limit: 50, color: "#8BC34A" },
        { limit: 75, color: "#FFC107" },
        { limit: 100, color: "#F44336" },
      ]
  
      let startAngle = Math.PI
      for (let i = 0; i < colors.length; i++) {
        const endAngle = Math.PI - (Math.PI * colors[i].limit) / 100
  
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.strokeStyle = colors[i].color
        ctx.lineWidth = 20
        ctx.stroke()
  
        startAngle = endAngle
      }
  
      const angle = Math.PI - (Math.PI * pressure) / 100
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(angle) * (radius - 10), centerY + Math.sin(angle) * (radius - 10))
      ctx.strokeStyle = "#333"
      ctx.lineWidth = 3
      ctx.stroke()
  
      ctx.beginPath()
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI)
      ctx.fillStyle = "#333"
      ctx.fill()
  
      document.querySelector(".gauge-value").textContent = `${Math.floor(pressure)} kPa`
  
      let state = "Baixa"
      if (pressure > 75) state = "Risco"
      else if (pressure > 50) state = "Atenção"
      else if (pressure > 25) state = "Normal"
  
      document.querySelector(".gauge-label").textContent = `Estado: ${state}`
    }
  
    drawGauge(0)
  
    window.updatePressureGauge = drawGauge
  }

  function initWaterLevel() {
    const waterFill = document.getElementById("waterFill")
  
    function updateLevel(level) {
      waterFill.style.height = `${level}%`
  
      let status = "Baixo"
      if (level > 75) status = "Alto"
      else if (level > 25) status = "Normal"
  
      document.querySelector(".level-status").textContent = `${status} (${Math.floor(level)}%)`
    }
  
    updateLevel(50)
  
    window.updateWaterLevel = updateLevel
  }

  function initControls() {
    const interruptBtn = document.getElementById("interruptBtn");
    if (interruptBtn) {
      interruptBtn.addEventListener("click", function () {
        simulationData.isRunning = !simulationData.isRunning;
      this.innerHTML = simulationData.isRunning
        ? '<span class="btn-icon">⏸️</span> Interromper'
          : '<span class="btn-icon">▶️</span> Continuar';
      publishMQTTCommand("process", simulationData.isRunning ? "start" : "stop");
      });
    }
  }
  