/**
 * Componente para gerenciar cards de Plantas Amazônicas e Seus Óleos
 * Simplifica a adição de novos cards na seção
 */

class AmazonPlantsCardManager {
    constructor() {
        this.sectionSelector = '.article-section:has(.section-title:contains("Plantas Amazônicas")) .article-grid';
        this.init();
    }

    init() {
        // Aguarda um pouco para garantir que o DOM esteja pronto
        setTimeout(() => {
            this.addCards();
        }, 100);
    }

    addCards() {
        // Tenta diferentes seletores para encontrar a seção correta
        let articleGrid = document.querySelector('.article-section:nth-of-type(2) .article-grid');
        
        if (!articleGrid) {
            // Tenta encontrar pela seção que contém "Plantas Amazônicas"
            const sections = document.querySelectorAll('.article-section');
            sections.forEach((section, index) => {
                const title = section.querySelector('.section-title');
                if (title && title.textContent.includes('Plantas Amazônicas')) {
                    articleGrid = section.querySelector('.article-grid');
                    console.log(`Seção "Plantas Amazônicas" encontrada no índice ${index}`);
                }
            });
        }
        
        console.log('Procurando seção:', this.sectionSelector);
        console.log('Seção encontrada:', articleGrid);
        
        if (!articleGrid) {
            console.error('Seção de Plantas Amazônicas não encontrada');
            return;
        }

        // Adiciona os cards das plantas amazônicas
        this.addCard({
            icon: '🌳',
            title: 'Canela-Preta',
            description: 'Óleo essencial da casca de Ocotea catharinensis Mez. (Lauraceae) com alto teor de linalol e grande potencial para as indústrias de fragrâncias, cosméticos e farmacêutica.',
            content: `
                <h4>Óleo Essencial da Casca de Ocotea catharinensis Mez. (Lauraceae)</h4>
                <h5>RESUMO</h5>
                <p>Por cromatografia a gás e espectrometria de massas (CG/EM), foram identificados 10 componentes do óleo essencial extraído da casca de <strong>Ocotea catharinensis Mez.</strong>, uma espécie arbórea da família Lauraceae, amplamente encontrada na Mata Atlântica. O material vegetal foi coletado no Parque Estadual da Cantareira (São Paulo, SP). A destilação foi realizada utilizando o método de Clevenger, com rendimento de 1,34% em relação à massa seca da casca. O óleo essencial apresentou coloração amarela, odor aromático persistente e sabor levemente picante. Os principais componentes identificados foram:</p>
                <ul>
                    <li>α-pineno (0,07%)</li>
                    <li>limoneno (0,11%)</li>
                    <li>1,8-cineol (0,14%)</li>
                    <li>óxido-3,6-linalol (0,36%)</li>
                    <li>copaeno (0,08%)</li>
                    <li>linalol (95,76%)</li>
                    <li>α-terpineol (1,47%)</li>
                    <li>sesquiterpeno (M+204) (0,12%)</li>
                    <li>citronelol (0,28%)</li>
                    <li>geraniol (0,75%)</li>
                </ul>
                <h5>1. INTRODUÇÃO E REVISÃO BIBLIOGRÁFICA</h5>
                <p><strong>Ocotea catharinensis</strong>, também conhecida como canela-preta ou canela-amarela, é uma árvore de grande porte nativa da Mata Atlântica, frequentemente associada a ambientes úmidos de floresta densa. Ela pertence ao gênero <em>Ocotea</em>, que inclui cerca de 300 espécies distribuídas principalmente na América Tropical.</p>
                <p>Além do valor madeireiro, essa espécie tem sido estudada por suas propriedades químicas, especialmente em relação à composição de seus óleos essenciais. Esses óleos são amplamente utilizados nas indústrias cosmética, farmacêutica e de perfumaria. Dentro da família Lauraceae, várias espécies, como <em>Aniba rosaeodora</em> (pau-rosa), <em>Ocotea pretiosa</em> (sassafrás) e <em>Cinnamomum zeylanicum</em> (canela-de-ceilão), destacam-se pela produção de compostos voláteis com propriedades aromáticas e bioativas.</p>
                <p>Estudos anteriores revelam que os óleos essenciais dessas plantas possuem variações químicas significativas entre populações, sendo influenciados por fatores genéticos, ambientais e pela parte da planta utilizada. A presença de compostos como linalol, safrol, metileugenol e geraniol em diferentes concentrações pode afetar diretamente a atividade biológica e o uso comercial desses óleos.</p>
                <h5>2. MATERIAIS E MÉTODOS</h5>
                <b>2.1 Material Botânico</b>
                <p>A casca do lenho de <em>O. catharinensis</em> foi coletada no Parque Estadual da Cantareira, localizado no município de São Paulo, SP. As amostras foram identificadas e depositadas no Herbário D. Bento Pickel, sob o número de registro SPSF 5.550. Os nomes populares incluem: canela-preta, canela-amarela, canela-broto, canela-pinho, canela-bicho e canela-coqueira.</p>
                <b>2.2 Extração do Óleo Essencial</b>
                <p>O material vegetal foi triturado em micromoinho de facas de aço inoxidável e submetido à destilação por arraste de vapor com aparelho de Clevenger modificado. Foram utilizados 100 g de casca seca para a extração. O rendimento obtido foi de 1,34% (mL/100g).</p>
                <b>2.3 Análises Físico-Químicas e Cromatográficas</b>
                <ul>
                    <li><b>Organoléptica:</b> o óleo apresentou cor amarela, odor persistente e agradável e sabor levemente picante.</li>
                    <li><b>Cromatografia em Camada Delgada (CCD):</b> realizada com sílica gel G e revelada com aldeído anísico.</li>
                    <li><b>Cromatografia em Fase Gasosa (CG/EM):</b> realizada em equipamento Hewlett Packard 5740 com coluna capilar de 25 m e espectrômetro de massas Hitachi M-80. Os componentes foram identificados por comparação com padrões.</li>
                </ul>
                <h5>3. RESULTADOS E DISCUSSÕES</h5>
                <p>O principal constituinte identificado no óleo essencial da casca foi o <b>linalol</b>, representando 95,76% da composição total. Este composto é um monoterpeno com ampla aplicação em fragrâncias, repelentes naturais e estudos farmacológicos por suas propriedades antimicrobianas, anti-inflamatórias e ansiolíticas.</p>
                <p>Além do linalol, foram encontrados outros compostos em menores proporções, como α-pineno, limoneno, 1,8-cineol, copaeno, α-terpineol, citronelol e geraniol. Esses compostos também possuem propriedades biológicas relevantes e contribuem para o aroma e atividade do óleo.</p>
                <p>A predominância do linalol nesse óleo é superior ao encontrado em espécies como <em>Aniba rosaeodora</em> (80-85%) e <em>Orhodon linaloliferum</em> (82%), tornando-o altamente interessante para aplicação industrial.</p>
                <p>A cromatografia em fase gasosa acoplada à espectrometria de massas demonstrou ser uma técnica eficiente na separação e identificação dos componentes. Em contrapartida, a CCD apresentou baixa resolução, dificultando a visualização precisa das substâncias presentes.</p>
                <p>Os dados obtidos reforçam o potencial econômico da espécie <em>O. catharinensis</em> como fonte alternativa de linalol natural. Além disso, os resultados contribuem para estudos de quimiossistemática dentro da família Lauraceae, possibilitando a diferenciação de espécies com base na composição química de seus óleos essenciais.</p>
                <h5>4. CONCLUSÃO</h5>
                <p>O óleo essencial da casca de <strong>Ocotea catharinensis Mez.</strong> apresenta alto teor de linalol, um composto de elevado valor comercial. O rendimento obtido foi satisfatório, e o perfil químico do óleo reforça o potencial dessa espécie para aplicação nas indústrias de fragrâncias, cosméticos e farmacêutica. Além disso, os dados obtidos podem auxiliar na caracterização botânica de espécies da família Lauraceae, promovendo o uso sustentável e consciente dos recursos florestais nativos.</p>
            `
        }, articleGrid);

        this.addCard({
            icon: '🌺',
            title: 'Pau-Rosa',
            description: 'Aniba rosaeodora Ducke: árvore amazônica de grande porte, fonte do óleo essencial rico em linalol, muito utilizado na perfumaria internacional.',
            content: `
                <h4>Aniba rosaeodora Ducke (Pau-Rosa)</h4>
                <p>No Brasil, o início da produção de óleos essenciais aconteceu no final da segunda década do século XX. O extrativismo de essências nativas como o Pau Rosa (<strong>Aniba rosaeodora</strong>), durante a Segunda Guerra Mundial, passou a consolidar-se, período em que o país começou a organizar o sistema para exportação (VIVAN et al., 2011).</p>
                <p>Destaca-se na produção de óleo essencial de aroma agradável, rico em linalol e muito utilizado na indústria de perfumaria como fixador. O óleo é obtido a partir da destilação de qualquer parte da planta, porém a madeira tem sido sua fonte principal.</p>
                <p>Diferenças no rendimento, nas propriedades físico-químicas e no aroma foram encontradas em função da parte da planta utilizada e das variações intraespecíficas. O óleo das folhas possui aroma adocicado e o da madeira apresenta aroma semelhante à lavanda devido à maior concentração de linalol dextro e linalol laevo, respectivamente. Diferenças no aroma também são evidentes entre óleos oriundos de regiões distintas, como as verificadas entre o óleo brasileiro e o franco-guianense (SANTANA, 2003).</p>
                <h5>Características Botânicas</h5>
                <p>Árvore de grande porte, podendo atingir 30 m de altura e 2 m de diâmetro. O tronco é retilíneo e ramificado no ápice, formando uma copa pequena. Possui casca pardo–amarelada ou pardo-avermelhada, que se desprende em grandes placas.</p>
                <p>As folhas são coriáceas ou rígidocartáceas, simples, alternas, obovadas, elípticas ou obovado-lanceoladas, com 6–25 cm de comprimento e 2,5–10 cm de largura, margens recurvadas ou planas, face superior glabra e verde-escura e inferior pilosa e amarelo-pálida.</p>
                <p>As flores são amarelo-ferruginosas, hermafroditas e diminutas, dispostas em panículas subterminais; possuem dois verticilos de tépalas; os estames, em número de nove, estão distribuídos em três verticilos com três estames em cada; o ovário é central, súpero e com apenas um óvulo; o sistema de reprodução é de fecundação cruzada, garantida pela ocorrência de dicogamia sincronizada.</p>
                <p>O fruto é uma baga glabra de coloração violáceo-escura, elipsoide ou subglobosa, com 2–3 cm de comprimento e 1,5–2 cm de diâmetro; exocarpo fino e polpa carnosa de coloração amarelo-esverdeada; está inserido em uma cúpula espessa de 1 cm de comprimento e provida de lenticelas lenhosas; contém 1 semente ovoides, com 2,6 cm de comprimento e 1,5 cm de diâmetro (OHASHI; ROSA, 2004).</p>
                <h5>Histórico e Importância Econômica</h5>
                <p>A priori, a <strong>Aniba rosaeodora</strong> era utilizada por sua propriedade aromática, muito utilizada na produção do Chanel, fragrância internacionalmente conhecida (CHAAR, 2000).</p>
                <p>No estudo de Bizzo (2009), ele descreve que o Brasil é o único fornecedor de OE de Pau Rosa no mundo. Da espécie <strong>Aniba rosaeodora</strong> variação amazônica Ducke, extrai-se o óleo da madeira por arraste a vapor, rico em linalol. A história deste óleo confunde-se com a exploração indiscriminada das espécies florestais da Amazônia.</p>
                <p>Esse foi o primeiro OE extraído em larga escala e exportado pelo Brasil. Sua exploração começou em 1925, inicialmente no Pará e depois no Amazonas. Em 1927, a produção nacional atingiu 200 t, não havendo mercado para absorver o volume produzido (AZEREDO, 1958). A preocupação com a exploração predatória já era manifestada em 1933, apenas alguns anos após o início da extração do óleo e, com esse cenário, decretos governamentais foram estabelecidos para tentar criar limites de produção e reflorestamento foram emitidos e grosseiramente ignorados.</p>
                <h5>Propriedades e Potencial</h5>
                <p>A espécie <strong>Aniba rosaeodora</strong> também é conhecida pelo seu potencial antimicrobiano, devido ao alto teor de linalol, o qual é possível atribuir sua atividade antimicrobiana (CANSIAN et al., 2010). Em um estudo recente, foi evidenciado o potencial larvicida do óleo essencial extraído da <em>A. rosaeodora</em>, frente a larvas de <em>Aedes aegypti</em>, mas, em contraponto a isso, ainda não há muitos estudos sobre atividade antioxidante e antimicrobiana.</p>
                <h5>Conservação</h5>
                <p>Após séculos de exploração desordenada na região amazônica e o grande interesse comercial que o gênero desperta, várias espécies do gênero estão em extinção ou próximas dela, como a <strong>Aniba rosaeodora Ducke</strong> (ALCÂNTARA et al., 2010).</p>
                <p>Nos últimos 30 anos, as exportações do óleo de Pau Rosa têm sofrido declínio. Vários motivos contribuem para a diminuição, como fontes vegetais em estado de exaustão, altos custos de logística e produção, regulamentações governamentais mais rigorosas e o comércio do linalol sintético produzido pela indústria (MAY; BARATATA, 2004).</p>
            `
        }, articleGrid);

        this.addCard({
            icon: '🌸',
            title: 'Orquídeas',
            description: 'Orquídeas amazônicas: lendas, usos tradicionais, importância econômica, medicinal e ambiental. Conheça as espécies e curiosidades dessa planta fascinante.',
            content: `
                <h4>Orquídeas da Amazônia</h4>
                <h5>Lendas</h5>
                <p>Segundo a lenda, as orquídeas da Amazônia foram criadas pela deusa da lua para enfeitar a floresta. Também se acredita que as orquídeas possuem propriedades mágicas e curativas. Outra lenda conta que as orquídeas foram criadas para proteger a floresta dos invasores, pois suas raízes são capazes de sugar a água dos intrusos e impedi-los de prosseguir.</p>
                <p>Os índios da Amazônia acreditam que as orquídeas possuem poderes afrodisíacos e utilizam suas raízes em chás para aumentar a libido. A lenda da orquídea fantasma diz que a flor só pode ser vista por quem tem um coração puro e que ela desaparece quando alguém tenta tocá-la.</p>
                <p>Os índios da Amazônia utilizam as orquídeas em rituais de cura, acreditando que suas propriedades medicinais são capazes de curar diversas doenças.</p>
                <h5>Usos</h5>
                <p>As orquídeas da Amazônia são utilizadas na produção de perfumes, cosméticos e medicamentos. Além disso, algumas tribos indígenas utilizam as orquídeas em rituais religiosos e para fins medicinais.</p>
                <p>As orquídeas da Amazônia também são utilizadas na culinária, sendo adicionadas em pratos como saladas e sobremesas. Além disso, suas flores são utilizadas na decoração de festas e eventos.</p>
                <p>As orquídeas também são importantes para a preservação da biodiversidade da Amazônia, sendo utilizadas como indicadoras da qualidade ambiental da região.</p>
                <p>As orquídeas da Amazônia são importantes para a economia da região, sendo exportadas para diversos países do mundo.</p>
                <p>As orquídeas também são importantes para a pesquisa científica, sendo estudadas por suas propriedades medicinais e biotecnológicas.</p>
                <h5>Tipos de Orquídeas</h5>
                <p>Entre as orquídeas encontradas na Amazônia, destacam-se:</p>
                <ul>
                    <li>Cattleya walkeriana</li>
                    <li>Brassavola tuberculata</li>
                    <li>Miltonia flavescens</li>
                    <li>Oncidium flexuosum</li>
                    <li>Epidendrum secundum</li>
                    <li>Stanhopea oculata</li>
                    <li>Vanilla planifolia</li>
                    <li>Dendrobium nobile</li>
                    <li>Maxillaria tenuifolia</li>
                    <li>Cattleya labiata <span style="color:red;">(ameaçada de extinção)</span></li>
                    <li>Laelia purpurata <span style="color:red;">(ameaçada de extinção)</span></li>
                    <li>Catasetum luridum</li>
                    <li>Encyclia cochleata</li>
                    <li>Gongora quinquenervis</li>
                </ul>
                <p><b>Fonte:</b> <a href="https://blogdecoracao.biz/orquideas-e-a-cultura-amazonica-lendas-e-usos/#:~:text=As%20orqu%C3%ADdeas%20s%C3%A3o%20plantas%20muito%20comuns%20na%20Am" target="_blank">blogdecoracao.biz/orquideas-e-a-cultura-amazonica-lendas-e-usos</a></p>
            `
        }, articleGrid);
    }

    /**
     * Adiciona um novo card à seção de Plantas Amazônicas
     * @param {Object} cardData - Dados do card
     * @param {string} cardData.icon - Emoji do ícone
     * @param {string} cardData.title - Título do card
     * @param {string} cardData.description - Descrição curta
     * @param {string} cardData.content - Conteúdo completo (HTML)
     */
    addCard(cardData, articleGrid) {
        const cardHTML = `
            <div class="article-card">
                <div class="article-icon">${cardData.icon}</div>
                <h4>${cardData.title}</h4>
                <p>${cardData.description}</p>
                <a href="#" class="read-more">Ler mais</a>
            </div>
        `;

        // Adiciona o card ao grid
        articleGrid.insertAdjacentHTML('beforeend', cardHTML);

        // Seleciona o último card adicionado
        const cards = articleGrid.querySelectorAll('.article-card');
        const newCard = cards[cards.length - 1];
        const readMore = newCard.querySelector('.read-more');
        if (readMore) {
            readMore.addEventListener('click', function(e) {
                e.preventDefault();
                const bibliotecaContent = document.querySelector('.biblioteca-content');
                if (bibliotecaContent) {
                    bibliotecaContent.innerHTML = `
                        <section class="article-section">
                            <h3 class="section-title">${cardData.title}</h3>
                            <div class="article-full-text" style="background:#fff; border-radius:10px; padding:32px; box-shadow:0 2px 10px rgba(0,0,0,0.05); font-size:1.08rem; color:#222; line-height:1.7;">
                                ${cardData.content}
                            </div>
                        </section>
                    `;
                }
            });
        }

        console.log(`Card "${cardData.title}" adicionado com sucesso!`);
    }

    /**
     * Remove um card pelo título
     * @param {string} title - Título do card a ser removido
     */
    removeCard(title) {
        const cards = document.querySelectorAll(this.sectionSelector + ' .article-card');
        cards.forEach(card => {
            const cardTitle = card.querySelector('h4').textContent;
            if (cardTitle === title) {
                card.remove();
                console.log(`Card "${title}" removido com sucesso!`);
            }
        });
    }

    /**
     * Lista todos os cards existentes
     */
    listCards() {
        const cards = document.querySelectorAll(this.sectionSelector + ' .article-card');
        const cardList = [];
        cards.forEach(card => {
            const title = card.querySelector('h4').textContent;
            const description = card.querySelector('p').textContent;
            cardList.push({ title, description });
        });
        console.log('Cards existentes:', cardList);
        return cardList;
    }
}

// Inicializa o gerenciador quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.amazonPlantsManager = new AmazonPlantsCardManager();
});

// Exemplo de uso:
/*
// Adicionar um novo card
window.amazonPlantsManager.addCard({
    icon: '🌺',
    title: 'Jaborandi',
    description: 'Planta amazônica rica em pilocarpina, utilizada no tratamento do glaucoma.',
    content: `
        <h4>Jaborandi (Pilocarpus microphyllus)</h4>
        <p>O jaborandi é uma planta nativa da Amazônia brasileira, pertencente à família Rutaceae...</p>
        <h5>Propriedades Medicinais</h5>
        <p>A principal substância ativa do jaborandi é a pilocarpina, um alcaloide que...</p>
        <h5>Aplicações</h5>
        <ul>
            <li>Tratamento do glaucoma</li>
            <li>Estimulação da produção de saliva</li>
            <li>Medicina tradicional indígena</li>
        </ul>
    `
});

// Remover um card
window.amazonPlantsManager.removeCard('Jaborandi');

// Listar todos os cards
window.amazonPlantsManager.listCards();
*/