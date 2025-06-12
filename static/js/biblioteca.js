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
    const cards = document.querySelectorAll('.article-card');
    if (!cards.length) return;
    // O card de economia circular é o primeiro da primeira seção
    const economiaCard = cards[0];
    const readMore = economiaCard.querySelector('.read-more');
    if (readMore) {
        readMore.addEventListener('click', function(e) {
            e.preventDefault();
            const bibliotecaContent = document.querySelector('.biblioteca-content');
            if (bibliotecaContent) {
                bibliotecaContent.innerHTML = `
                    <section class="article-section">
                        <h3 class="section-title">2.2 MÉTODOS DE EXTRAÇÃO</h3>
                        <div class="article-full-text" style="background:#fff; border-radius:10px; padding:32px; box-shadow:0 2px 10px rgba(0,0,0,0.05); font-size:1.08rem; color:#222; line-height:1.7;">
                        As técnicas de extração de óleos essenciais estão em constante evolução pelo progresso tecnológico, e variam conforme a localização do óleo essencial na planta e suas utilizações. Os métodos mais comuns são: enfloração, arraste a vapor, hidrodestilação, prensagem a frio, por solventes orgânicos e por fluidos supercríticos.<br><br>
                        A técnica de enfloração, também conhecida como enfleurage, é utilizada para fazer a extração do óleo essencial de matérias primas mais delicadas como pétalas de flores. O procedimento consiste basicamente em colocar as pétalas em um recipiente com fundo de vidro recoberto geralmente por ceras e gorduras (vegetais ou animais); diariamente, as pétalas são trocadas por outras mais frescas. Lentamente, a cera extrai os componentes aromáticos obtendo uma mistura de óleo essencial e gordura. Por fim, destila-se a mistura com álcool para a obtenção do óleo essencial (AZAMBUJA, 2012; JAKIEMIU, 2008; NEVES, 2011; MARQUES et al., 2019).<br><br>
                        O método de destilação por arraste a vapor é um dos métodos de extração mais utilizado no mundo, principalmente em escala industrial. A matéria prima vegetal é colocada em uma placa perfurada para que o material não alcance a água em ebulição. O vapor d'água que é produzido por uma caldeira, quando saturado e superaquecido vai se misturando ao material vegetal, provocando um rompimento das cavidades secretoras presentes no tecido vegetal, onde estão armazenados os óleos essenciais, que são então liberados e arrastados pela corrente de vapor até o condensador. Ao passar pelo condensador de serpentina, refrigerado com água natural, ocorre o processo de condensação que separa o óleo essencial da água resultante, também conhecido como hidrolato.<br><br>
                        A hidrodestilação é considerada um dos métodos de extração mais antigos. Atualmente, é utilizada principalmente em laboratórios de pesquisa para extração em pequena escala, utilizando-se o aparelho tipo Clevenger (Fig. 4). O processo consiste em mergulhar a matéria-prima vegetal na água, o que o diferencia da destilação a vapor. Então, uma vez que a matéria-prima permanece submersa na água em ebulição, permite que o óleo essencial evapore junto com a água que vai para o condensador. Após, ocorre o resfriamento e a separação do óleo essencial do hidrolato, por diferença de densidade (JAKIEMIU, 2008)<br><br>
                        O método por prensagem a frio (Fig. 5) geralmente é empregado para extração envolvendo frutos cítricos como limão, laranja, tangerina e o grapefruit, obtidos na maioria das vezes de suas cascas. Vale ressaltar que, no Brasil, a prensagem a frio de laranja é utilizada em grande escala nas indústrias extratoras de suco de laranja, onde o óleo essencial é o seu subproduto.
                        </div>
                    </section>
                `;
            }
        });
    }
    // Demais cards
    for (let i = 1; i < cards.length; i++) {
        const readMoreBtn = cards[i].querySelector('.read-more');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('O artigo referente a este card será adicionado no futuro.');
            });
        }
    }
}