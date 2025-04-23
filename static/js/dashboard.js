function updateBoardInfo() {
    fetch("/mqtt-data")
        .then(response => response.json())
        .then(data => {
            document.querySelector(".nameBoard .boardInfo").innerText = "Manjericão";
            document.querySelector(".temperatureBoard .boardInfo").innerText = data.temperatura;
            document.querySelector(".waterLevelBoard .boardInfo").innerText = data.nivel;
            document.querySelector(".pressureBoard .boardInfo").innerText = data.pressao_kPa;
        })
        .catch(error => console.error("Erro ao buscar dados MQTT:", error));
}

// Atualiza os dados a cada 2 segundos
setInterval(updateBoardInfo, 2000);