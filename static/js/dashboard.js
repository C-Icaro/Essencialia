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

let temperatureChart = null; // Variável global para armazenar o gráfico

function fetchTemperatureData() {
    fetch("/temperature-data")
        .then(response => response.json())
        .then(data => {
            // Formatar os timestamps
            const formattedTimestamps = data.timestamps.map(timestamp => {
                const date = new Date(timestamp);
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`; // Formato HH:mm:ss
            });

            const ctx = document.getElementById('temperatureChart').getContext('2d');

            // Destruir o gráfico existente, se houver
            if (temperatureChart) {
                temperatureChart.destroy();
            }

            // Criar um novo gráfico
            temperatureChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: formattedTimestamps, // Timestamps formatados
                    datasets: [{
                        label: 'Temperatura ao longo do tempo',
                        data: data.temperatures, // Temperaturas do banco de dados
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Tempo'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperatura (°C)'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error("Erro ao buscar dados do gráfico:", error));
}

// Atualiza o gráfico a cada 10 segundos
setInterval(fetchTemperatureData, 10000);

// Chama a função ao carregar a página
fetchTemperatureData();