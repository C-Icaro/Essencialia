document.addEventListener("DOMContentLoaded", () => {
    // Inicializar componentes
    initProgressCircle()
    initTemperatureChart()
    initPressureGauge()
    initWaterLevel()
    initControls()
    initAlerts()
    initPlantSelection()
  
    // Iniciar busca de dados reais
    startDataFetching()
  
    // Iniciar simulação como fallback
    startSimulation()
  })
  
  // Variáveis globais para simulação
  const simulationData = {
    temperature: 0,
    pressure: 0,
    waterLevel: 50,
    timeRemaining: 3600, // 1 hora em segundos
    progress: 0,
    isRunning: true,
    useRealData: false, // Flag para controlar se estamos usando dados reais
    currentPlant: null, // Planta atual selecionada
  }
  
  // Dados das plantas
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
  
  // Inicializar seleção de plantas
  function initPlantSelection() {
    // Abrir modal ao clicar no botão "Iniciar novo processo"
    document.querySelector(".new-process-btn").addEventListener("click", () => {
      document.getElementById("plantSelectionModal").style.display = "block"
    })
  
    // Fechar modal ao clicar no X
    document.querySelector(".close-modal").addEventListener("click", () => {
      document.getElementById("plantSelectionModal").style.display = "none"
    })
  
    // Fechar modal ao clicar fora dele
    window.addEventListener("click", (event) => {
      if (event.target === document.getElementById("plantSelectionModal")) {
        document.getElementById("plantSelectionModal").style.display = "none"
      }
    })
  
    // Adicionar evento de clique aos cards de plantas
    document.querySelectorAll(".plant-card").forEach((card) => {
      card.addEventListener("click", () => {
        // Remover seleção anterior
        document.querySelectorAll(".plant-card").forEach((c) => c.classList.remove("selected"))
  
        // Adicionar seleção ao card clicado
        card.classList.add("selected")
  
        // Obter dados da planta
        const plantId = card.dataset.plant
        const plantTemp = Number.parseInt(card.dataset.temp)
        const plantPressure = Number.parseInt(card.dataset.pressure)
  
        // Selecionar a planta
        selectPlant(plantId, plantTemp, plantPressure)
  
        // Fechar o modal após um breve delay
        setTimeout(() => {
          document.getElementById("plantSelectionModal").style.display = "none"
        }, 500)
      })
    })
  }
  
  // Selecionar uma planta
  function selectPlant(plantId, recommendedTemp, recommendedPressure) {
    // Armazenar planta atual
    simulationData.currentPlant = plantId
  
    // Atualizar nome da planta
    document.querySelector(".plant-name").innerText = plants[plantId].name
  
    // Atualizar temperatura recomendada
    document.querySelector(".current-temp").textContent = `${recommendedTemp} °C`
  
    // Adicionar indicadores de valores recomendados
    addRecommendedIndicators(recommendedTemp, recommendedPressure)
  
    // Reiniciar o processo
    simulationData.timeRemaining = 3600
    simulationData.progress = 0
    simulationData.isRunning = true
    document.getElementById("interruptBtn").innerHTML = '<span class="btn-icon">⏸️</span> Interromper'
  
    // Atualizar display de tempo
    document.querySelector(".time-display").textContent = formatTime(simulationData.timeRemaining)
  
    // Atualizar círculo de progresso
    window.updateProgressCircle(0)
  
    // Adicionar alerta
    addAlert("success", `Processo iniciado com ${plants[plantId].name}. ${plants[plantId].description}`)
  
    // Publicar seleção de planta via MQTT
    publishMQTTCommand("plant", plantId)
  }
  
  // Adicionar indicadores de valores recomendados
  function addRecommendedIndicators(recommendedTemp, recommendedPressure) {
    // Adicionar indicador de temperatura recomendada
    const tempDisplay = document.querySelector(".temp-display")
    if (!tempDisplay.querySelector(".recommended-value")) {
      const tempRecommended = document.createElement("span")
      tempRecommended.className = "recommended-value"
      tempRecommended.textContent = `Meta: ${recommendedTemp}°C`
      tempDisplay.appendChild(tempRecommended)
    } else {
      tempDisplay.querySelector(".recommended-value").textContent = `Meta: ${recommendedTemp}°C`
    }
  
    // Adicionar indicador de pressão recomendada
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
  
  // Função para publicar comandos MQTT
  function publishMQTTCommand(command, value) {
    // Construir payload do comando
    const payload = {
      command: command,
      value: value,
      timestamp: new Date().toISOString(),
    }
  }
  
  // Função para buscar dados MQTT
  function updateBoardInfo() {
    fetch("/mqtt-data")
      .then((response) => response.json())
      .then((data) => {
        // Marcar que estamos usando dados reais
        simulationData.useRealData = true
  
        // Atualizar nome da planta se não houver uma selecionada
        if (!simulationData.currentPlant) {
          document.querySelector(".plant-name").innerText = "Manjericão"
        }
  
        // Atualizar temperatura
        const tempValue = Number.parseFloat(data.temperatura)
        document.querySelector(".temp-value").innerText = `${tempValue} °C`
        simulationData.temperature = tempValue
  
        // Atualizar nível de água
        const waterLevel = data.nivel === "ALTO" ? 80 : 20
        simulationData.waterLevel = waterLevel
        window.updateWaterLevel(waterLevel)
  
        // Atualizar pressão
        const pressure = Number.parseFloat(data.pressao_kPa)
        simulationData.pressure = pressure
        window.updatePressureGauge(pressure)
  
        // Adicionar alerta de dados atualizados (apenas na primeira vez)
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
  
  // Variável global para armazenar o gráfico
  const temperatureChart = null
  
  // Função para buscar dados históricos de temperatura
  function fetchTemperatureData() {
    fetch("/temperature-data")
      .then((response) => response.json())
      .then((data) => {
        // Formatar os timestamps
        const formattedTimestamps = data.timestamps.map((timestamp) => {
          const date = new Date(timestamp)
          return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}` // Formato HH:mm:ss
        })
  
        // Atualizar o gráfico de temperatura com dados reais
        updateRealTemperatureChart(formattedTimestamps, data.temperatures)
      })
      .catch((error) => {
        console.error("Erro ao buscar dados do gráfico:", error)
      })
  }
  
  // Função para atualizar o gráfico com dados reais
  function updateRealTemperatureChart(timestamps, temperatures) {
    console.log('Temperatura:', timestamps, temperatures);
    const canvas = document.getElementById("temperatureChart")
    const ctx = canvas.getContext("2d")
  
    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  
    // Desenhar linhas de grade
    const width = canvas.width
    const height = canvas.height
  
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
  
    // Linhas horizontais
    for (let i = 0; i <= 4; i++) {
      const y = height - (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
  
      // Rótulos de temperatura
      ctx.fillStyle = "#666"
      ctx.font = "12px Inter"
      ctx.textAlign = "right"
      ctx.fillText(`${i * 25}°C`, 30, y - 5)
    }
  
    // Linhas verticais e rótulos de tempo
    const timeLabels =
      timestamps.length > 3
        ? [
            timestamps[0],
            timestamps[Math.floor(timestamps.length / 3)],
            timestamps[Math.floor((timestamps.length * 2) / 3)],
            timestamps[timestamps.length - 1],
          ]
        : timestamps
  
    for (let i = 0; i < timeLabels.length; i++) {
      const x = (width / (timeLabels.length - 1)) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
  
      // Rótulos de tempo
      ctx.fillStyle = "#666"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(timeLabels[i], x, height - 5)
    }
  
    // Desenhar linha de temperatura
    if (temperatures.length > 0) {
      const maxTemp = Math.max(...temperatures, 100) // Garantir que o máximo seja pelo menos 100
  
      ctx.beginPath()
      ctx.moveTo(0, height - (temperatures[0] / maxTemp) * height)
  
      for (let i = 1; i < temperatures.length; i++) {
        const x = (i / (temperatures.length - 1)) * width
        const y = height - (temperatures[i] / maxTemp) * height
        ctx.lineTo(x, y)
      }
  
      ctx.strokeStyle = "#2196F3"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
  
  // Função para buscar dados históricos de pressão
  function fetchPressureData() {
    fetch("/pressure-data")
      .then((response) => response.json())
      .then((data) => {
        // Formatar os timestamps
        const formattedTimestamps = data.timestamps.map((timestamp) => {
          const date = new Date(timestamp)
          return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}` // Formato HH:mm:ss
        })
        // Atualizar o gráfico de pressão com dados reais
        updateRealPressureChart(formattedTimestamps, data.pressures)
      })
      .catch((error) => {
        console.error("Erro ao buscar dados do gráfico de pressão:", error)
      })
  }
  
  // Função para atualizar o gráfico de pressão com dados reais
  function updateRealPressureChart(timestamps, pressures) {
    console.log('Pressão:', timestamps, pressures);
    const canvas = document.getElementById("pressureChart")
    const ctx = canvas.getContext("2d")
  
    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  
    // Desenhar linhas de grade
    const width = canvas.width
    const height = canvas.height
  
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
  
    // Linhas horizontais
    for (let i = 0; i <= 4; i++) {
      const y = height - (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
      // Rótulos de pressão
      ctx.fillStyle = "#666"
      ctx.font = "12px Inter"
      ctx.textAlign = "right"
      ctx.fillText(`${i * 10} kPa`, 30, y - 5)
    }
  
    // Linhas verticais e rótulos de tempo
    const timeLabels =
      timestamps.length > 3
        ? [
            timestamps[0],
            timestamps[Math.floor(timestamps.length / 3)],
            timestamps[Math.floor((timestamps.length * 2) / 3)],
            timestamps[timestamps.length - 1],
          ]
        : timestamps
  
    for (let i = 0; i < timeLabels.length; i++) {
      const x = (width / (timeLabels.length - 1)) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      // Rótulos de tempo
      ctx.fillStyle = "#666"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(timeLabels[i], x, height - 5)
    }
  
    // Desenhar linha de pressão
    if (pressures.length > 0) {
      const maxPressure = Math.max(...pressures, 40) // Garantir que o máximo seja pelo menos 40
      ctx.beginPath()
      ctx.moveTo(0, height - (pressures[0] / maxPressure) * height)
      for (let i = 1; i < pressures.length; i++) {
        const x = (i / (pressures.length - 1)) * width
        const y = height - (pressures[i] / maxPressure) * height
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = "#FF5722" // Cor laranja para diferenciar da temperatura
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
  
  // Iniciar busca de dados
  function startDataFetching() {
    // Atualizar dados MQTT a cada 2 segundos
    setInterval(updateBoardInfo, 2000)
    // Atualizar gráficos a cada 10 segundos
    setInterval(fetchTemperatureData, 10000)
    setInterval(fetchPressureData, 10000)
    // Buscar dados iniciais
    updateBoardInfo()
    fetchTemperatureData()
    fetchPressureData()
  }
  
  // Inicializar o círculo de progresso
  function initProgressCircle() {
    const canvas = document.getElementById("progressCircle")
    const ctx = canvas.getContext("2d")
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 70
  
    // Função para desenhar o círculo
    function drawCircle(percentage) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
  
      // Círculo de fundo
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = "#e0e0e0"
      ctx.lineWidth = 10
      ctx.stroke()
  
      // Círculo de progresso
      if (percentage > 0) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, (2 * Math.PI * percentage) / 100 - Math.PI / 2)
        ctx.strokeStyle = "#4CAF50"
        ctx.lineWidth = 10
        ctx.stroke()
      }
  
      // Atualizar texto de porcentagem
      document.querySelector(".progress-text").textContent = `${Math.floor(percentage)}%`
    }
  
    // Desenhar círculo inicial
    drawCircle(0)
  
    // Expor função para atualização
    window.updateProgressCircle = drawCircle
  }
  
  // Inicializar o gráfico de temperatura
  function initTemperatureChart() {
    const canvas = document.getElementById("temperatureChart")
    const ctx = canvas.getContext("2d")
    const width = (canvas.width = canvas.parentElement.clientWidth)
    const height = (canvas.height = 250)
  
    // Dados iniciais
    const data = Array(60).fill(0)
    const maxTemp = 100
  
    // Função para desenhar o gráfico
    function drawChart() {
      // Só desenhar se não estivermos usando dados reais
      if (simulationData.useRealData) return
  
      ctx.clearRect(0, 0, width, height)
  
      // Desenhar linhas de grade
      ctx.strokeStyle = "#e0e0e0"
      ctx.lineWidth = 1
  
      // Linhas horizontais
      for (let i = 0; i <= 4; i++) {
        const y = height - (height / 4) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
  
        // Rótulos de temperatura
        ctx.fillStyle = "#666"
        ctx.font = "12px Inter"
        ctx.textAlign = "right"
        ctx.fillText(`${i * 25}°C`, 30, y - 5)
      }
  
      // Linhas verticais e rótulos de tempo
      for (let i = 0; i <= 3; i++) {
        const x = (width / 3) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
  
        // Rótulos de tempo
        if (i > 0) {
          ctx.fillStyle = "#666"
          ctx.font = "12px Inter"
          ctx.textAlign = "center"
          ctx.fillText(`00:${i * 20}`, x, height - 5)
        } else {
          ctx.fillText(`00:00`, x, height - 5)
        }
      }
  
      // Desenhar linha de temperatura
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
  
    // Função para adicionar novo ponto de dados
    function addDataPoint(temp) {
      // Só adicionar se não estivermos usando dados reais
      if (simulationData.useRealData) return
  
      data.shift()
      data.push(temp)
      drawChart()
    }
  
    // Desenhar gráfico inicial
    drawChart()
  
    // Expor função para atualização
    window.updateTemperatureChart = addDataPoint
  }
  
  // Inicializar o medidor de pressão
  function initPressureGauge() {
    const canvas = document.getElementById("pressureGauge")
    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height
    const radius = height - 20
  
    // Função para desenhar o medidor
    function drawGauge(pressure) {
      ctx.clearRect(0, 0, width, height)
  
      // Desenhar arco de fundo
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, Math.PI, 0)
      ctx.strokeStyle = "#e0e0e0"
      ctx.lineWidth = 20
      ctx.stroke()
  
      // Definir cores para diferentes níveis de pressão
      const colors = [
        { limit: 25, color: "#4CAF50" }, // Verde - Baixo
        { limit: 50, color: "#8BC34A" }, // Verde claro - Normal
        { limit: 75, color: "#FFC107" }, // Amarelo - Atenção
        { limit: 100, color: "#F44336" }, // Vermelho - Risco
      ]
  
      // Desenhar arcos coloridos
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
  
      // Desenhar ponteiro
      const angle = Math.PI - (Math.PI * pressure) / 100
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(angle) * (radius - 10), centerY + Math.sin(angle) * (radius - 10))
      ctx.strokeStyle = "#333"
      ctx.lineWidth = 3
      ctx.stroke()
  
      // Desenhar círculo central
      ctx.beginPath()
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI)
      ctx.fillStyle = "#333"
      ctx.fill()
  
      // Atualizar valor de pressão
      document.querySelector(".gauge-value").textContent = `${Math.floor(pressure)} kPa`
  
      // Atualizar estado
      let state = "Baixa"
      if (pressure > 75) state = "Risco"
      else if (pressure > 50) state = "Atenção"
      else if (pressure > 25) state = "Normal"
  
      document.querySelector(".gauge-label").textContent = `Estado: ${state}`
    }
  
    // Desenhar medidor inicial
    drawGauge(0)
  
    // Expor função para atualização
    window.updatePressureGauge = drawGauge
  }
  
  // Inicializar o nível de água
  function initWaterLevel() {
    const waterFill = document.getElementById("waterFill")
  
    // Função para atualizar o nível de água
    function updateLevel(level) {
      waterFill.style.height = `${level}%`
  
      // Atualizar status
      let status = "Baixo"
      if (level > 75) status = "Alto"
      else if (level > 25) status = "Normal"
  
      document.querySelector(".level-status").textContent = `${status} (${Math.floor(level)}%)`
    }
  
    // Nível inicial
    updateLevel(50)
  
    // Expor função para atualização
    window.updateWaterLevel = updateLevel
  }
  
  // Inicializar controles
  function initControls() {
    // Botão de interromper
    const interruptBtn = document.getElementById("interruptBtn");
    if (interruptBtn) {
      interruptBtn.addEventListener("click", function () {
        simulationData.isRunning = !simulationData.isRunning;
        this.innerHTML = simulationData.isRunning
          ? '<span class="btn-icon">⏸️</span> Interromper'
          : '<span class="btn-icon">▶️</span> Continuar';
        // Enviar comando MQTT
        publishMQTTCommand("process", simulationData.isRunning ? "start" : "stop");
      });
    }
  }
  
  // Inicializar alertas
  function initAlerts() {
    // Adicionar evento para fechar alertas
    document.querySelectorAll(".close-alert").forEach((button) => {
      button.addEventListener("click", function () {
        this.parentElement.style.display = "none"
      })
    })
  }
  
  // Função para adicionar um novo alerta
  function addAlert(type, message) {
    const alertList = document.querySelector(".alert-list")
    const alertElement = document.createElement("div")
    alertElement.className = `alert ${type}`
  
    let icon = "⚠️"
    if (type === "success") icon = "✅"
    else if (type === "info") icon = "ℹ️"
  
    alertElement.innerHTML = `
          <span class="alert-icon">${icon}</span>
          <span class="alert-text">${message}</span>
          <button class="close-alert">×</button>
      `
  
    // Adicionar evento para fechar
    alertElement.querySelector(".close-alert").addEventListener("click", () => {
      alertElement.style.display = "none"
    })
  
    // Adicionar ao topo da lista
    alertList.prepend(alertElement)
  
    // Auto-remover após 5 segundos
    setTimeout(() => {
      alertElement.style.opacity = "0"
      alertElement.style.transition = "opacity 0.5s"
      setTimeout(() => alertElement.remove(), 500)
    }, 5000)
  }
  
  // Função para formatar tempo (segundos para HH:MM:SS)
  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
  
    return [h, m, s].map((v) => (v < 10 ? "0" + v : v)).join(":")
  }
  
  // Iniciar simulação
  function startSimulation() {
    // Atualizar a cada segundo
    setInterval(() => {
      // Não atualizar se estivermos usando dados reais
      if (simulationData.useRealData) return
  
      if (!simulationData.isRunning) return
  
      // Atualizar tempo restante
      simulationData.timeRemaining = Math.max(0, simulationData.timeRemaining - 1)
      document.querySelector(".time-display").textContent = formatTime(simulationData.timeRemaining)
  
      // Calcular progresso
      simulationData.progress = 100 - (simulationData.timeRemaining / 3600) * 100
      window.updateProgressCircle(simulationData.progress)
  
      // Simular aumento de temperatura
      simulationData.temperature = Math.min(100, simulationData.temperature + 0.2)
      document.querySelector(".temp-value").textContent = `${Math.floor(simulationData.temperature)} °C`
      window.updateTemperatureChart(simulationData.temperature)
  
      // Simular flutuação de pressão
      const pressureChange = (Math.random() - 0.5) * 5
      simulationData.pressure = Math.max(0, Math.min(100, simulationData.pressure + pressureChange))
      window.updatePressureGauge(simulationData.pressure)
  
      // Simular flutuação de nível de água
      const levelChange = (Math.random() - 0.5) * 2
      simulationData.waterLevel = Math.max(0, Math.min(100, simulationData.waterLevel + levelChange))
      window.updateWaterLevel(simulationData.waterLevel)
  
      // Gerar alertas aleatórios
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
  
      // Verificar fim do processo
      if (simulationData.timeRemaining === 0) {
        addAlert("success", "Processo concluído com sucesso!")
        simulationData.isRunning = false
        document.getElementById("interruptBtn").innerHTML = '<span class="btn-icon">▶️</span> Reiniciar'
      }
    }, 1000)
  }
  