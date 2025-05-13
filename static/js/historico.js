document.addEventListener("DOMContentLoaded", () => {
    initFilters();
    loadCurrentProcess();
    loadPreviousCycles();
    initPagination();
});

// Dados simulados de ciclos anteriores
const allCycles = [
    { plant: "Lavanda", part: "Flor", date: "15/05/2023", time: "14:30", status: "Concluído" },
    { plant: "Eucalipto", part: "Folha", date: "12/05/2023", time: "09:45", status: "Concluído" },
    { plant: "Alecrim", part: "Caule", date: "08/05/2023", time: "16:20", status: "Interrompido" },
    { plant: "Manjericão", part: "Raiz", date: "03/05/2023", time: "11:10", status: "Concluído" },
    { plant: "Hortelã", part: "Folha", date: "28/04/2023", time: "13:55", status: "Interrompido" },
    { plant: "Lavanda", part: "Caule", date: "25/04/2023", time: "10:15", status: "Concluído" },
    { plant: "Eucalipto", part: "Casca", date: "20/04/2023", time: "15:40", status: "Concluído" },
    { plant: "Alecrim", part: "Folha", date: "18/04/2023", time: "09:30", status: "Interrompido" },
    { plant: "Manjericão", part: "Flor", date: "15/04/2023", time: "14:20", status: "Concluído" },
    { plant: "Hortelã", part: "Caule", date: "10/04/2023", time: "11:45", status: "Concluído" },
    { plant: "Lavanda", part: "Raiz", date: "05/04/2023", time: "16:10", status: "Interrompido" },
    { plant: "Eucalipto", part: "Flor", date: "01/04/2023", time: "10:30", status: "Concluído" },
    { plant: "Alecrim", part: "Casca", date: "28/03/2023", time: "13:15", status: "Concluído" },
    { plant: "Manjericão", part: "Caule", date: "25/03/2023", time: "09:50", status: "Interrompido" },
    { plant: "Hortelã", part: "Folha", date: "20/03/2023", time: "15:25", status: "Concluído" }
];

// Variáveis para paginação
let currentPage = 1;
const itemsPerPage = 5;
let filteredCycles = [...allCycles];


// Inicializar filtros
function initFilters() {
    const plantFilter = document.getElementById("filter-plant");
    const statusFilter = document.getElementById("filter-status");
    const searchInput = document.getElementById("search-history");
    
    // Função para aplicar filtros
    const applyFilters = () => {
        const plantValue = plantFilter.value;
        const statusValue = statusFilter.value;
        const searchValue = searchInput.value.toLowerCase().trim();
        
        // Filtrar ciclos
        filteredCycles = allCycles.filter(cycle => {
            const matchPlant = plantValue === "" || cycle.plant === plantValue;
            const matchStatus = statusValue === "" || cycle.status === statusValue;
            const matchSearch = searchValue === "" || 
                cycle.plant.toLowerCase().includes(searchValue) || 
                cycle.part.toLowerCase().includes(searchValue) || 
                cycle.date.includes(searchValue);
            
            return matchPlant && matchStatus && matchSearch;
        });
        
        // Resetar paginação
        currentPage = 1;
        updatePagination();
        displayCycles();
    };
    
    // Adicionar eventos aos filtros
    plantFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    searchInput.addEventListener("input", applyFilters);
}

// Inicializar paginação
function initPagination() {
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");
    
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayCycles();
            updatePagination();
        }
    });
    
    nextButton.addEventListener("click", () => {
        const totalPages = Math.ceil(filteredCycles.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayCycles();
            updatePagination();
        }  {
            currentPage++;
            displayCycles();
            updatePagination();
        }
    });
    
    updatePagination();
}

// Atualizar controles de paginação
function updatePagination() {
    const totalPages = Math.ceil(filteredCycles.length / itemsPerPage);
    
    document.getElementById("current-page").textContent = currentPage;
    document.getElementById("total-pages").textContent = totalPages;
    
    // Habilitar/desabilitar botões de paginação
    document.getElementById("prev-page").disabled = currentPage === 1;
    document.getElementById("next-page").disabled = currentPage === totalPages;
}

// Carregar processo atual
function loadCurrentProcess() {
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
        
        // Atualizar tabela de processo atual
        const tbody = document.getElementById("current-process-body");
        tbody.innerHTML = "";
        
        const row = document.createElement("tr");
        
        // Criar células
        const plantCell = document.createElement("td");
        plantCell.textContent = plant;
        
        const partCell = document.createElement("td");
        partCell.textContent = part;
        
        const dateCell = document.createElement("td");
        dateCell.textContent = date;
        
        const timeCell = document.createElement("td");
        timeCell.textContent = time;
        
        const verifyCell = document.createElement("td");
        const verifyLink = document.createElement("a");
        verifyLink.href = "dashboard";
        verifyLink.className = "verify-btn";
        verifyLink.textContent = "Acessar";
        verifyCell.appendChild(verifyLink);
        
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = "status-badge operating";
        statusBadge.textContent = "Operando";
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
        
        // Exibir seção de processo atual
        document.querySelector(".current-process").style.display = "block";
    } else {
        // Ocultar seção de processo atual se não houver processo ativo
        document.querySelector(".current-process").style.display = "none";
    }
}

// Carregar ciclos anteriores
function loadPreviousCycles() {
    displayCycles();
}

// Exibir ciclos com paginação
function displayCycles() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCycles = filteredCycles.slice(startIndex, endIndex);
    
    // Atualizar tabela com dados paginados
    const tbody = document.getElementById("previous-cycles-body");
    tbody.innerHTML = "";
    
    if (paginatedCycles.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "Nenhum registro encontrado.";
        cell.style.textAlign = "center";
        cell.style.padding = "20px";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }
    
    paginatedCycles.forEach(cycle => {
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