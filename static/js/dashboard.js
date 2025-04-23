function updateBoardInfo() {
    fetch("/mqtt-data")
        .then(response => response.json())
        .then(data => {
            document.querySelector(".nameBoard .boardInfo").innerText = data.nome_planta;
            document.querySelector(".temperatureBoard .boardInfo").innerText = data.temperatura + " °C";
            document.querySelector(".waterLevelBoard .boardInfo").innerText = data.nivel_agua + " %";
            document.querySelector(".pressureBoard .boardInfo").innerText = data.pressao + " Pa";
        })
        .catch(error => console.error("Erro ao buscar dados MQTT:", error));
}

// Atualiza os dados a cada 2 segundos
setInterval(updateBoardInfo, 2000);