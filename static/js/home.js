document.addEventListener("DOMContentLoaded", () => {
    initPlantSelection();
    initSearch();
    updateSystemStatus();
    loadPreviousCycles();
    
    // Atualizar status do sistema a cada 5 segundos
    setInterval(updateSystemStatus, 5000);
});

// Inicializar seleção de plantas
function initPlantSelection() {
    // Abrir modal ao clicar no botão "Iniciar novo processo"
    document.querySelector(".new-process-btn").addEventListener("click", () => {
        document.getElementById("plantSelectionModal").style.display = "block";
    });

    // Fechar modal ao clicar no X
    document.querySelector(".close-modal").addEventListener("click", () => {
        document.getElementById("plantSelectionModal").style.display = "none";
    });

    // Fechar modal ao clicar fora dele
    window.addEventListener("click", (event) => {
        if (event.target === document.getElementById("plantSelectionModal")) {
            document.getElementById("plantSelectionModal").style.display = "none";
        }
    });

    // Adicionar evento de clique aos cards de plantas
    document.querySelectorAll(".plant-card").forEach(card => {
        card.addEventListener("click", () => {
            // Remover seleção anterior
            document.querySelectorAll(".plant-card").forEach(c => c.classList.remove("selected"));
            
            // Adicionar seleção ao card clicado
            card.classList.add("selected");
            
            // Obter dados da planta
            const plantId = card.dataset.plant;
            
            // Redirecionar para o dashboard com a planta selecionada
            setTimeout(() => {
                window.location.href = `dashboard?plant=${plantId}`;
            }, 500);
        });
    });
}

// Inicializar funcionalidade de pesquisa
function initSearch() {
    const searchInput = document.querySelector(".history-search");
    const tableRows = document.querySelectorAll("#previous-cycles-body tr");
    
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        tableRows.forEach(row => {
            const plantName = row.cells[0].textContent.toLowerCase();
            const plantPart = row.cells[1].textContent.toLowerCase();
            const date = row.cells[2].textContent.toLowerCase();
            const status = row.cells[5].textContent.toLowerCase();
            
            if (plantName.includes(searchTerm) || 
                plantPart.includes(searchTerm) || 
                date.includes(searchTerm) || 
                status.includes(searchTerm)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
        
        // Verificar se há resultados
        const visibleRows = document.querySelectorAll("#previous-cycles-body tr:not([style='display: none'])").length;
        const noResultsMessage = document.querySelector(".no-results");
        
        if (visibleRows === 0 && searchTerm !== "") {
            if (!noResultsMessage) {
                const tbody = document.getElementById("previous-cycles-body");
                const tr = document.createElement("tr");
                tr.className = "no-results";
                const td = document.createElement("td");
                td.colSpan = 6;
                td.textContent = "Nenhum resultado encontrado.";
                td.style.textAlign = "center";
                td.style.padding = "20px";
                td.style.color = "#666";
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    });
}

// Atualizar status do sistema
function updateSystemStatus() {
    fetch('/mqtt-data')
    .then(response => response.json())
    .then(data => {
        const temperature = data.temperatura;
        const pressure = data.pressao_kPa;
        const level = data.nivel;

        // Atualizar valores na interface
        document.getElementById("temperature-value").textContent = `${temperature} °C`;
        document.getElementById("pressure-value").textContent = pressure;
        document.getElementById("level-value").textContent = level;
    })
    .catch(error => console.error("Erro ao buscar dados do MQTT:", error));
}

// Atualizar informações do processo atual
function updateCurrentProcess() {
    // Verificar se há um processo em andamento (simulado)
    const hasActiveProcess = Math.random() > 0.3; // 70% de chance de ter um processo ativo
    
    if (hasActiveProcess) {
        // Plantas disponíveis
        const plants = ["Lavanda", "Eucalipto", "Alecrim", "Manjericão", "Hortelã"];
        const parts = ["Folha", "Caule", "Flor", "Raiz", "Casca"];
        
        // Selecionar planta e parte aleatoriamente
        const plant = plants[Math.floor(Math.random() * plants.length)];
        const part = parts[Math.floor(Math.random() * parts.length)];
        
        // Gerar data e hora atual
        const now = new Date();
        const date = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Atualizar linha do processo atual
        const row = document.getElementById("current-process-row");
        row.cells[0].textContent = plant;
        row.cells[1].textContent = part;
        row.cells[2].textContent = date;
        row.cells[3].textContent = time;
        
        // Exibir seção de processo atual
        document.querySelector(".current-process").style.display = "block";
    } else {
        // Ocultar seção de processo atual se não houver processo ativo
        document.querySelector(".current-process").style.display = "none";
    }
}

// Carregar ciclos anteriores
function loadPreviousCycles() {
    // Dados simulados de ciclos anteriores
    const cycles = [
        { plant: "Lavanda", part: "Flor", date: "15/05/2023", time: "14:30", status: "Concluído" },
        { plant: "Eucalipto", part: "Folha", date: "12/05/2023", time: "09:45", status: "Concluído" },
        { plant: "Alecrim", part: "Caule", date: "08/05/2023", time: "16:20", status: "Interrompido" },
        { plant: "Manjericão", part: "Raiz", date: "03/05/2023", time: "11:10", status: "Concluído" },
        { plant: "Hortelã", part: "Folha", date: "28/04/2023", time: "13:55", status: "Interrompido" }
    ];
    
    // Limitar a 3 ciclos para a página inicial
    const limitedCycles = cycles.slice(0, 3);
    
    // Atualizar tabela com dados simulados
    const tbody = document.getElementById("previous-cycles-body");
    tbody.innerHTML = "";
    
    limitedCycles.forEach(cycle => {
        const row = document.createElement("tr");
        
        // Criar células
        const plantCell = document.createElement("td");
        plantCell.textContent = cycle.plant;
        
        const partCell = document.createElement("td");
        partCell.textContent = cycle.part;
        
        const dateCell = document.createElement("td");
        dateCell.textContent = cycle.date;
        
        const timeCell = document.createElement("td");
        timeCell.textContent = cycle.time;
        
        const verifyCell = document.createElement("td");
        const verifyLink = document.createElement("a");
        verifyLink.href = "#";
        verifyLink.className = "verify-btn";
        verifyLink.textContent = "Acessar";
        verifyCell.appendChild(verifyLink);
        
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = `status-badge ${cycle.status === "Concluído" ? "completed" : "interrupted"}`;
        statusBadge.textContent = cycle.status;
        statusCell.appendChild(statusBadge);
        
        // Adicionar células à linha
        row.appendChild(plantCell);
        row.appendChild(partCell);
        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(verifyCell);
        row.appendChild(statusCell);
        
        // Adicionar linha à tabela
        tbody.appendChild(row);
    });
}