document.addEventListener("DOMContentLoaded", () => {
    initSearch();
    initReadMore();
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

// Nova função para exibir o texto de métodos de extração ao clicar em 'Ler mais' do card de Economia circular
function initReadMore() {
    const cards = document.querySelectorAll('.article-section:first-of-type .article-card');
    if (!cards.length) return;

    cards.forEach((card) => {
        const readMore = card.querySelector('.read-more');
        if (readMore) {
            readMore.addEventListener('click', function(e) {
                e.preventDefault();
                const bibliotecaContent = document.querySelector('.biblioteca-content');
                if (bibliotecaContent) {
                    const title = card.querySelector('h4').textContent;
                    // Pega o conteúdo do <p> (mantendo formatação se for o segundo card)
                    let content = card.querySelector('p').innerHTML;
                    bibliotecaContent.innerHTML = `
                        <section class="article-section">
                            <h3 class="section-title">${title}</h3>
                            <div class="article-full-text" style="background:#fff; border-radius:10px; padding:32px; box-shadow:0 2px 10px rgba(0,0,0,0.05); font-size:1.08rem; color:#222; line-height:1.7;">
                                ${content}
                            </div>
                        </section>
                    `;
                }
            });
        }
    });
}