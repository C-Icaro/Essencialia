document.addEventListener("DOMContentLoaded", () => {
    initSearch();
});


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