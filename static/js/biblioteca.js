document.addEventListener("DOMContentLoaded", () => {
    initPlantSelection();
    initSearch();
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
    const searchInput = document.querySelector(".search-bar input");
    const articleCards = document.querySelectorAll(".article-card");
    
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        articleCards.forEach(card => {
            const title = card.querySelector("h4").textContent.toLowerCase();
            const description = card.querySelector("p").textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
        
        // Verificar se há resultados em cada seção
        document.querySelectorAll(".article-section").forEach(section => {
            const visibleCards = section.querySelectorAll(".article-card[style='display: block']").length;
            const noResultsMessage = section.querySelector(".no-results");
            
            if (visibleCards === 0 && searchTerm !== "") {
                if (!noResultsMessage) {
                    const message = document.createElement("p");
                    message.className = "no-results";
                    message.textContent = "Nenhum resultado encontrado nesta seção.";
                    message.style.padding = "20px";
                    message.style.color = "#666";
                    message.style.fontStyle = "italic";
                    section.querySelector(".article-grid").appendChild(message);
                }
            } else if (noResultsMessage) {
                noResultsMessage.remove();
            }
        });
    });
}

// Função para exibir artigo completo (simulação)
function showArticle(articleId) {
    console.log(`Exibindo artigo ${articleId}`);

}