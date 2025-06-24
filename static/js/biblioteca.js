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

    cards.forEach((card, idx) => {
        const readMore = card.querySelector('.read-more');
        if (readMore) {
            readMore.addEventListener('click', function(e) {
                e.preventDefault();
                const bibliotecaContent = document.querySelector('.biblioteca-content');
                if (bibliotecaContent) {
                    const title = card.querySelector('h4').textContent;
                    let content;
                    if (title === 'Óleos Essenciais e suas Aplicações') {
                        content = `
                        <h4>Introdução</h4>
                        <p>Os óleos essenciais são substâncias voláteis de origem vegetal, obtidas por processos físicos através de diferentes métodos de extração. Utilizados há mais de 2 mil anos, possuem inúmeros benefícios comprovados para o bem-estar e a saúde, inclusive com efeitos curativos (GONÇALVES & GUAZZELLI, 2014).</p>
                        <p>Com o passar dos séculos, a diversificação de suas finalidades se expandiu. Há cerca de 300 óleos essenciais de importância comercial no mundo. Esses compostos naturais possuem intensas propriedades aromatizantes e saborizantes, sendo usados em perfumes, cosméticos, higiene pessoal, alimentos, bebidas, medicamentos e até na indústria de tintas e vernizes (BASER & BUCHBAUER, 2010).</p>
                        <p>A busca por produtos naturais vem crescendo gradativamente, ampliando a demanda por óleos essenciais e criando oportunidades para produtores rurais e empreendedores ligados ao campo e às florestas.</p>
                        <p>Este estudo busca intensificar o entendimento sobre os óleos essenciais e suas potencialidades, trazendo conhecimento aprofundado sobre um tema cada vez mais relevante para o mercado e para o fortalecimento das cadeias produtivas locais.</p>
                        <h4>Objetivos</h4>
                        <b>Objetivo Geral</b>
                        <p>Apresentar uma visão bibliográfica sobre óleos essenciais, com enfoque em suas principais características, benefícios, utilidades, métodos de obtenção e impactos ambientais.</p>
                        <b>Objetivos Específicos</b>
                        <ul style='margin-left:20px;'>
                            <li>Apresentar o conceito e benefícios dos óleos essenciais;</li>
                            <li>Descrever métodos de extração dos óleos essenciais;</li>
                            <li>Apresentar as aplicações dos óleos essenciais.</li>
                        </ul>
                        <h4>Justificativas</h4>
                        <p>Os óleos essenciais são substâncias voláteis extraídas de diversas plantas e possuem uma grande diversidade de usos, muitas vezes desconhecidos pela sociedade. O mercado está em crescimento, sendo uma boa oportunidade para quem deseja atuar na área agrícola, agregando valor à produção existente.</p>
                        <h4>Metodologia</h4>
                        <p>Este trabalho foi realizado por meio de pesquisa bibliográfica, baseada em referências teóricas já analisadas e publicadas em livros, artigos científicos e páginas de web sites (FONSECA, 2002).</p>
                        <h4>2. Óleos Essenciais</h4>
                        <h5>2.1 Conceito</h5>
                        <p>Óleos essenciais são compostos voláteis presentes em algumas plantas, geralmente caracterizados por forte aroma, derivados do metabolismo secundário vegetal. São misturas complexas, compostas principalmente por terpenoides ou fenilpropanoides (AMORIM, 2007). São pequenas moléculas orgânicas que mudam facilmente do estado sólido ou líquido para o gasoso em temperatura ambiente (STEFFENS, 2010).</p>
                        <p>Podem ser extraídos de raízes, folhas, flores, cascas, sementes e frutos, desempenhando funções biológicas como defesa, polinização e controle de temperatura. A composição química varia conforme fatores ambientais, resultando em diferentes quimiotipos.</p>
                        <p>É importante diferenciar óleos essenciais de óleos vegetais: os primeiros são ricos em terpenoides e voláteis, enquanto os vegetais são compostos por lipídeos (óleos fixos, não voláteis).</p>
                        <h5>2.2 Métodos de Extração</h5>
                        <p>As técnicas de extração evoluíram com o tempo e variam conforme a localização do óleo na planta e seu uso. Os principais métodos são:</p>
                        <ul style='margin-left:20px;'>
                            <li><b>Enfloração (Enfleurage):</b> Extração de pétalas delicadas usando gordura e álcool.</li>
                            <li><b>Arraste a vapor:</b> Método industrial mais comum, usando vapor para liberar e transportar o óleo essencial.</li>
                            <li><b>Hidrodestilação:</b> Método antigo, usado em laboratório, com a planta submersa em água fervente.</li>
                            <li><b>Prensagem a frio:</b> Usado para frutos cítricos, separando o óleo por pressão e centrifugação.</li>
                            <li><b>Solventes orgânicos:</b> Usa solventes apolares, mas pode extrair compostos indesejados.</li>
                            <li><b>CO₂ supercrítico:</b> Método industrial puro e eficiente, sem resíduos de solventes.</li>
                        </ul>
                        <h5>2.3 Benefícios do Método de Destilação por Arraste a Vapor</h5>
                        <ul style='margin-left:20px;'>
                            <li><b>Purificação:</b> Separa os óleos essenciais de outros componentes da matéria-prima.</li>
                            <li><b>Conservação de propriedades:</b> Preserva aromas e propriedades naturais.</li>
                            <li><b>Ampla aplicabilidade:</b> Usado em folhas, raízes, sementes, ramos e flores.</li>
                            <li><b>Isento de solventes tóxicos:</b> Seguro para alimentos, cosméticos e medicamentos.</li>
                            <li><b>Temperaturas mais baixas:</b> Permite separar componentes sem decomposição.</li>
                        </ul>
                        <h5>2.4 Aplicações</h5>
                        <p>Existem cerca de 3 mil espécies produtoras de óleos essenciais, sendo 300 usadas em grande escala (MARTINS, 2017). Suas aplicações incluem:</p>
                        <ul style='margin-left:20px;'>
                            <li><b>Na planta:</b> Atração de polinizadores, defesa contra predadores, proteção contra fungos e bactérias.</li>
                            <li><b>Na indústria:</b> Farmacêutica, alimentícia, cosmética, química, agroquímica, aromaterapia, entre outras.</li>
                            <li><b>Para humanos:</b> Efeitos antifúngicos, antibacterianos, antioxidantes, antiulcerogênicos, anti-inflamatórios, etc.</li>
                        </ul>
                        <p>Essas substâncias garantem vantagens adaptativas para as plantas e têm grande valor econômico e científico.</p>
                        <h4>3. Considerações Finais</h4>
                        <p>O estudo dos óleos essenciais, suas características, métodos de extração e aplicações é fundamental para quem deseja aprender ou atuar na área. O Brasil tem destaque na produção, especialmente de óleos cítricos, e possui grande potencial devido à sua biodiversidade e centros de pesquisa.</p>
                        <p>O tema é relevante para pesquisa e aplicação prática, gerando conhecimento útil e novas oportunidades de mercado.</p>
                        <h4>4. Referências</h4>
                        <ul style='margin-left:20px; font-size:0.97em;'>
                            <li><a href="https://ccnh.ufabc.edu.br/arquivos/CENTRAL/4.Ensino/TCC/Beatriz_Rodrigues_Pinto_versao_final_TCC_BacQui-2022.3.pdf" target="_blank">Beatriz Rodrigues Pinto, TCC BacQui-2022.3</a></li>
                            <li><a href="https://www.buchi.com/pt/knowledge/tecnologias/destilacao-arraste-vapor" target="_blank">Buchi - Destilação por arraste a vapor</a></li>
                            <li><a href="https://arandu.iffarroupilha.edu.br/bitstream/itemid/157/1/CAMILA%20TCC%207." target="_blank">Camila TCC</a></li>
                        </ul>
                        `;
                    } else if (title === 'Introdução aos óleos essenciais') {
                        content = `
                        <h4>Introdução</h4>
                        <p>Estima-se que o Brasil possua 50.000 espécies de plantas superiores, produtoras de madeiras, celulose, fibras, alimentos, óleos vegetais e óleos essenciais, entre outros produtos naturais. A floresta Amazônica, com 4 milhões km², teria 30.000 espécies de plantas — cerca de um terço medicinais e/ou aromáticas — e talvez 70% destas usadas como medicamentos pela população local, além de outros usos.</p>
                        <p>Porém, acredita-se que apenas 8% das espécies vegetais da flora brasileira foram estudadas em busca de compostos bioativos, e apenas 1.100 espécies vegetais da flora brasileira foram avaliadas em suas propriedades medicinais.</p>
                        <p>Plantas têm sido tradicionalmente usadas por populações de todos os continentes no controle de diversas doenças e pragas, além de representarem uma fonte importante de produtos naturais biologicamente ativos, muitos dos quais se constituem modelos para síntese de um grande número de fármacos.</p>
                        <p>O fato que gera interesse nos produtos encontrados na natureza é que esses apresentam enorme diversidade em termos de estrutura e de propriedades físico-químicas e biológicas. A diversidade molecular dos produtos naturais é muito superior àquela derivada dos processos de síntese que, apesar dos avanços consideráveis, ainda é limitada.</p>
                        <p>Além disso, como produtos de organismos que possuem muitas similaridades com o metabolismo dos mamíferos, os produtos naturais muitas vezes exibem propriedades adicionais às antimicrobianas a eles associadas.</p>
                        <p>Estudos apontam que a maior parte da população nacional usa a medicina alternativa como fonte de recursos terapêuticos. Com o aumento da demanda pela utilização de plantas medicinais na cura ou prevenção de doenças, o cultivo e/ou o extrativismo dessas plantas torna-se uma alternativa cada vez mais importante na agricultura nacional.</p>
                        <p>No entanto, o intenso extrativismo coloca em risco de extinção inúmeras espécies nativas, causando distúrbios ecológicos. Considerando-se o valor das plantas medicinais não apenas como recurso terapêutico, mas também como fonte de recurso econômico, torna-se importante estabelecer linhas de ação voltadas para o desenvolvimento de técnicas de manejo ou cultivo, tendo em vista a utilização dessas espécies vegetais pelo homem, aliada à manutenção do equilíbrio dos ecossistemas tropicais.</p>
                        <p>O mercado de produtos farmacêuticos derivados de plantas é um segmento promissor, já que o crescimento do mercado de medicamentos fitoterápicos é da ordem de 15% ao ano, enquanto o crescimento anual do mercado de medicamentos sintéticos gira em torno de 3 a 4%, além de constituir-se em uma opção terapêutica eficaz e culturalmente apropriada.</p>
                        <p>O último diagnóstico do mercado de cosméticos, feito pela ABIHPEC (Associação Brasileira da Indústria de Higiene Pessoal, Perfumaria e Cosméticos), disponível para consulta, mostra que o Brasil conta com 1.367 empresas atuando no setor, sendo que as 16 de grande porte são responsáveis por 72,4% do faturamento total.</p>
                        <p>As vendas de cosméticos em 2005 atingiram o valor de R$ 15,4 bilhões, e o crescimento do setor de cosméticos, higiene pessoal e perfumaria em 2005 foi de 14,5%, apresentando, nos últimos 10 anos, um crescimento médio de 10,7%. Adicionalmente, o setor de cosméticos tem alta demanda por novos produtos.</p>
                        <p>Essa dissertação visa à inovação em novos produtos para perfumaria e cosméticos. A Figura 1 apresenta a evolução do faturamento desse setor.</p>
                        <figure style='text-align:center;'>
                            <img src="static/assets/figuras/Fig. 1. Evolução do faturamento líquido do setor.png" alt="Evolução do faturamento líquido do setor de higiene pessoal, perfumaria e cosméticos no Brasil" style="max-width:350px;width:100%;border-radius:8px;"/>
                            <figcaption>Fig. 1. Evolução do faturamento líquido do setor de higiene pessoal, perfumaria e cosméticos no Brasil</figcaption>
                        </figure>
                        <p>A Amazônia tem papel de grande importância, nacional e internacional. Sua flora e fauna são extremamente ricas, e centenas de espécies de animais e plantas são encontradas exclusivamente na região.</p>
                        <p>É urgente a necessidade de preservar sua biodiversidade, pois a floresta Amazônica sofre grande devastação, tanto pela exploração madeireira como pela prática agrícola. Estima-se que o desmatamento já destruiu cerca de 625.000 km² de floresta, não poupando nem mesmo plantas úteis para a área farmacêutica ou cosmética. O custo ecológico dessas derrubadas é altíssimo, e o ambiente é afetado de forma irreparável.</p>
                        <p>Apesar de a indústria de Perfumaria e Cosméticos exigir produtos novos com frequência, e esta ser uma boa área de investimento por consumir baixos volumes de materiais a altos preços, apenas três espécies aromáticas oriundas da biodiversidade fazem parte da pauta de exportação e comércio na Amazônia: as favas de cumarú (Coumarona odorata), o óleo de copaíba (Copaifera spp.) e o óleo de pau-rosa (Aniba rosaeodora).</p>
                        <p>Recentemente, o Estado do Acre iniciou a extração do óleo essencial de pimenta longa (Piper hispidinervium), originado de cultivos, como produtor de safrol; e o Pará, a extração do óleo essencial de priprioca (Cyperus articulatus) para perfumes finos.</p>
                        <p>No Sul do Brasil, a espécie Ocotea sassafraz está em perigo de extinção, e a erva baleeira (Cordia verbenaceae) é a única que se tornou comercial em bases sustentáveis, como medicamento Acheflan desenvolvido pela Aché em colaboração com o CPQBA – UNICAMP.</p>
                        <h4>1.1. Óleo Essencial</h4>
                        <p>As substâncias odoríferas em plantas possuem funções ecológicas, especialmente como inibidores da germinação, na proteção contra predadores, na atração de polinizadores, na proteção contra a perda de água e aumento da temperatura, entre outras.</p>
                        <p>Óleos essenciais, também chamados de óleos voláteis, são produtos obtidos de partes de plantas através, sobretudo, de destilação por arraste com vapor d'água, bem como os produtos obtidos por expressão dos pericarpos de frutos cítricos.</p>
                        <p>De forma geral, são misturas complexas de substâncias voláteis lipofílicas, geralmente odoríferas e líquidas. Sua principal característica é a volatilidade, diferindo-se, assim, dos óleos fixos — mistura de substâncias lipídicas, obtidos geralmente de sementes.</p>
                        <p>Apresentam também outras características:</p>
                        <ul style='margin-left:20px;'>
                            <li>Aparência oleosa à temperatura ambiente;</li>
                            <li>Aroma agradável e intenso da maioria dos óleos;</li>
                            <li>Solubilidade em solventes orgânicos apolares. Em água apresentam solubilidade limitada, mas suficiente para aromatizar as soluções aquosas, que são denominadas hidrolatos;</li>
                            <li>Sabor: geralmente acre (ácido) e picante;</li>
                            <li>Cor: quando recentemente extraídos são geralmente incolores ou ligeiramente amarelados; são poucos os óleos que apresentam cor, como o óleo volátil de camomila, de coloração azulada pelo seu alto teor de azuleno;</li>
                            <li>Estabilidade: em geral, não são muito estáveis, principalmente na presença de ar, calor, luz, umidade e metais;</li>
                            <li>A maioria possui índice de refração e são opticamente ativos;</li>
                            <li>Seus constituintes variam desde hidrocarbonetos terpênicos, álcoois simples e terpênicos, aldeídos, cetonas, fenóis, ésteres, éteres, óxidos, peróxidos, furanos, ácidos orgânicos, lactonas, cumarinas e até compostos com enxofre.</li>
                            <li>Na mistura, tais compostos apresentam-se em diferentes concentrações — normalmente, um deles é o composto majoritário, existindo outros em menores teores e alguns em baixíssimas quantidades ou traços.</li>
                        </ul>
                        <p>A grande maioria dos óleos essenciais é constituída de derivados de terpenoides ou de fenilpropanóides, sendo que os primeiros preponderam. Os terpenoides são derivados de unidades do isopreno, e os fenilpropanóides se formam a partir do ácido chiquímico, que forma as unidades básicas dos ácidos cinâmico e p-cumárico. A Figura 2 mostra a origem dos terpenóides e fenilpropanóides.</p>
                        <figure style='text-align:center;'>
                            <img src="static/assets/figuras/Figura 2 mostra a origem dos terpenóides e fenilpropanóides.png" alt="Origem dos terpenóides e fenilpropanóides" style="max-width:350px;width:100%;border-radius:8px;"/>
                            <figcaption>Figura 2. Origem dos terpenóides e fenilpropanóides</figcaption>
                        </figure>
                        <p>Tais compostos são metabólitos secundários que têm a sua origem explicada a partir do metabolismo da glicose. Esse ciclo biossintético pode ser observado na Figura 3.</p>
                        <figure style='text-align:center;'>
                            <img src="static/assets/figuras/Fig. 3. Ciclo biossintético geral dos metabólitos secundários 3.png" alt="Ciclo biossintético geral dos metabólitos secundários" style="max-width:350px;width:100%;border-radius:8px;"/>
                            <figcaption>Figura 3. Ciclo biossintético geral dos metabólitos secundários</figcaption>
                        </figure>
                        <p>Os óleos essenciais podem estar estocados em certos órgãos, tais como nas flores, folhas ou ainda nas cascas dos caules, madeira, raízes, rizomas, frutos ou sementes. Embora todos os órgãos de uma planta possam acumular óleos essenciais, sua composição pode variar segundo a localização.</p>
                        <p>A composição química dos óleos essenciais pode ser afetada pelas condições ambientais. Por exemplo, um indivíduo cultivado numa região chuvosa pode apresentar composição química diferente de outro indivíduo da mesma espécie cultivado em uma região seca.</p>
                        <h4>Métodos de Extração</h4>
                        <p>Os métodos de extração variam conforme a localização do óleo essencial na planta e com a proposta de utilização do mesmo. Os mais comuns são:</p>
                        <ol style='margin-left:20px;'>
                            <li>"Enfleurage" – empregado para extrair óleo essencial de pétalas de flores. As pétalas são depositadas, à temperatura ambiente, sobre uma camada de gordura. Após a saturação, a gordura é tratada com álcool. Para se obter o óleo essencial, o álcool é destilado a baixa temperatura.</li>
                            <li>Arraste por vapor d'água – os constituintes do material vegetal possuem pressão de vapor mais elevada que a da água, sendo arrastados pelo vapor.</li>
                            <li>Extração com solventes orgânicos – usa solventes apolares, mas extrai outros compostos, o que reduz seu valor comercial.</li>
                            <li>Prensagem (ou expressão) – usada em frutos cítricos, separando o óleo da emulsão por decantação, centrifugação ou destilação.</li>
                            <li>Extração por CO₂ supercrítico – método industrial mais puro e eficiente, que não deixa resíduos de solventes. O CO₂ é liquefeito e aquecido acima de 31 °C, tornando-se supercrítico e extraindo os compostos com eficiência.</li>
                        </ol>
                        <h4>1.2. Mercado de Óleos Essenciais</h4>
                        <p>O uso de extratos e óleos essenciais na indústria de cosméticos e, em particular, no ramo de perfumes remonta à Antiguidade. Na China, na Índia e no Oriente Médio, as plantas aromáticas, os óleos, as águas perfumadas e preparações cosméticas eram utilizadas na cozinha, em cosméticos, na medicina e nas práticas religiosas.</p>
                        <p>A indústria de cosméticos moderna foi buscar na sabedoria milenar da fitoterapia as receitas para hidratação e relaxamento da pele e do cabelo.</p>
                        <p>Além dos óleos essenciais obtidos de plantas, produtos sintéticos são encontrados no mercado. Esses óleos sintéticos podem ser imitações dos naturais ou composições de fantasia. Para o uso farmacêutico, somente os naturais são permitidos pelas farmacopéias. Exceções são aqueles óleos que contêm somente uma substância, como o óleo de baunilha (vanilina).</p>
                        <p>No mercado internacional, o Brasil é o décimo maior importador de óleos essenciais e o quarto maior exportador, somando US$ 98 bilhões em 2004. Existem hoje aproximadamente 3.000 óleos conhecidos e 300 comercializados, sendo os seis principais produzidos e exportados: óleos de laranja, limão-taiti, eucalipto, pau-rosa, lima e capim-limão.</p>
                        <p>Empresas multinacionais começaram a instalar-se na Amazônia a partir de 2001. Assim, a Crodamazon, a Cognis e a Beraca (Brazmazon) produzem diferentes óleos e extratos para importantes indústrias de cosméticos.</p>
                        <p>O mercado mundial de Higiene Pessoal, Perfumaria e Cosmético chegou a US$ 240 bilhões em 2004, sendo provavelmente 10% desse valor o consumo de matérias-primas. O valor deste mercado mostra claramente que os produtos naturais da Amazônia têm uma oportunidade única neste contexto, visto que a demanda de novos óleos essenciais para o mercado de perfumaria é crescente — principalmente aqueles oriundos da Amazônia e da Mata Atlântica.</p>
                        <p>Infelizmente, a baixa qualidade das matérias-primas originadas na região, aliada a fatores como suprimento inadequado, prazos e falta de controle de qualidade, liquidam a competitividade da região na busca de novos mercados.</p>
                        `;
                    } else if (title === 'Óleos essenciais na Amazônia ricos em linalol') {
                        content = `
                        <h4>Óleos essenciais na Amazônia ricos em linalol</h4>
                        <h5>1.1 PAU-ROSA</h5>
                        <p>O gênero <b>Aniba</b> é constituído por 41 espécies neotropicais pertencentes à família Lauraceae e ocorrem na América Central e América do Sul. Destas, 27 espécies estão distribuídas em território brasileiro (MABBERLEY, 1990). As espécies do gênero Aniba destacam-se pelo alto valor econômico que possuem, devido ao óleo essencial, encontrado em grande quantidade, principalmente no lenho (MARQUES, 2001). Após séculos de exploração desordenada na região amazônica e o grande interesse comercial que o gênero desperta, várias espécies do gênero estão em extinção ou próximas dela, como a <b>Aniba rosaeodora Ducke</b> (figura 1) (ALCÂNTARA et al. 2010).</p>
                        <figure style='text-align:center;'>
                            <img src="static/assets/figuras/Figura 1 Aniba rosaeodora Ducke (pau-rosa).png" alt="Aniba rosaeodora Ducke (pau-rosa)" style="max-width:350px;width:100%;border-radius:8px;"/>
                            <figcaption>Figura 1: Aniba rosaeodora Ducke (pau-rosa)<br><span style="font-size:0.95em;color:#888;">FONTE: Preedy (2015).</span></figcaption>
                        </figure>
                        <p>A espécie possui os nomes vernáculos: pau-rosa, pau-rosa-itaúba, pau-rosa-mulatinho, pau-rosa-imbaúba (Brasil); bois de rose femelle (Guiana Francesa e França); cara-cara (Guiana); enclit rosenhout (Suriname) e rosewood (Estados Unidos e Inglaterra). Ela é também, frequentemente, denominada como o verdadeiro pau-rosa, na região amazônica (SUDAM, 1972; OHASHI e ROSA, 1977; SAMPAIO et al. 2003).</p>
                        <p>O pau-rosa é uma árvore perene que ocorre predominantemente em áreas de terra firme, possui uma distribuição geográfica ampla, sendo encontrado em toda a bacia amazônica, nos estados brasileiros do Acre, Amapá, Amazonas, Pará, Roraima, e nas porções amazônicas da Guiana, Venezuela, Peru e Colômbia (DUCKE, 1938; SUDAM, 1972). Caracteriza-se por ser de grande porte, podendo atingir 30 metros de altura por 2 metros de diâmetro, possui tronco reto e cilíndrico e uma casca pardo-amarelada ou avermelhada, que se desprende facilmente em grandes placas. Ocupa o dossel intermediário ou superior da floresta, com sua copa estreita ou ovalada (KUBITZKI e RENNER, 1982). A floração ocorre de outubro a fevereiro e a frutificação de novembro a março, período em que muda suas folhas (MAGALHÃES e ALENCAR, 1979).</p>
                        <p>A árvore possui grande importância econômica no mercado internacional, principalmente para a indústria de cosméticos, devido à extração do seu óleo essencial, constituído majoritariamente por linalol (80–97%), utilizado como fixador de perfumes. Apesar de o linalol estar presente em todas as partes da árvore, o óleo essencial é basicamente extraído da madeira (GOTTILIEB et al. 1964; ARAÚJO et al. 1971; LAWLESS, 2002; LETIZIA et al. 2003). Nos últimos 30 anos, as exportações do óleo de pau-rosa têm sofrido declínio. Vários motivos contribuem para a diminuição, como fontes vegetais em estado de exaustão, altos custos de logística e produção, regulamentações governamentais mais rigorosas e o comércio do linalol sintético produzido pela indústria (MAIA et al. 2007).</p>
                        <p>Diversos usos etnofarmacológicos são atribuídos ao óleo essencial de pau-rosa (OEPR), como ação analgésica, antimicrobiana, antisséptica, bactericida, anticonvulsivante, antidepressiva, afrodisíaca, regenerador de tecidos, tônica e contra a insônia (PRICE e PRICE, 1999; LAWLESS, 2002). Com base nos relatos da utilização do óleo pela medicina tradicional foram realizadas pesquisas a respeito das suas atividades biológicas. Foi relatado que o OEPR induziu sedação e atuou na inibição do potencial de ação composto em roedores (ALMEIDA et al. 2009) e na inibição da adenilato-ciclase na retina de pinto (SAMPAIO et al. 2012). Posteriormente, foi relatado que o óleo essencial, rico em linalol, induz bradicardia vaso-vagal e reflexo depressor em ratos (SIQUEIRA et al. 2013).</p>
                        <p>Estudos investigaram outras atividades biológicas atribuídas ao OEPR, como potencial ação anticancerígena, na indução seletiva de apoptose em células pré-cancerosas e cancerosas de pele (SOEUR et al. 2011) e as atividades antimicrobianas contra Acinetobacter baumannii, Aeromonas veronii, Candida albicans, Enterococcus faecalis, Escherichia coli, Klebsiella pneumoniae, Pseudomonas aeruginosa, Proteus mirabilis, Proteus vulgaris, Edwardsiella tarda, Salmonella enterica subsp. enterica sorotipo typhimurium, Serratia marcescens, Staphylococcus aureus e Enterobacter aerogenes (LOBATO et al. 1989; HAMMER et al. 1999). Outra espécie do gênero Aniba, rica em linalol, e também muito utilizada na medicina tradicional, é a Aniba parviflora (Meisn.) Mez.</p>
                        <h5>1.2 MACACAPORANGA</h5>
                        <p>A espécie <b>Aniba parviflora</b> (Meisn.) Mez (figura 2), de sinonímia Aniba fragrans Ducke (KUBITZKI e RENNER, 1982), é conhecida popularmente no estado do Pará como macacaporanga ou louro rosa e louro amarelo no Amazonas. A espécie pertence à família Lauraceae e é característica de floresta pluvial, solos argilosos e não inundáveis, sendo uma planta aromática nativa da Amazônia. Na floresta Amazônica ocidental é encontrada próxima a igarapés, distribuída nas regiões de Santarém, Faro e médio rio Tapajós (REVILLA, 2002; MATTOSO, 2005).</p>
                        <figure style='text-align:center;'>
                            <img src="static/assets/figuras/Figura 2 Aniba parviflora (Meisn.) Mez (macacaporanga).png" alt="Aniba parviflora (Meisn.) Mez (macacaporanga)" style="max-width:350px;width:100%;border-radius:8px;"/>
                            <figcaption>Figura 2: Aniba parviflora (Meisn.) Mez (macacaporanga)<br><span style="font-size:0.95em;color:#888;">FONTE: Preedy (2015).</span></figcaption>
                        </figure>
                        <p>A árvore da macacaporanga é muito assemelhada à árvore do pau-rosa, por este motivo é considerada botanicamente (taxonomia) vizinha a ele. Dessa forma, as espécies são, frequentemente, confundidas pela grande semelhança de suas folhas e frutos. E apesar de conter linalol como composto majoritário, o óleo essencial de macacaporanga (OEMP) tem fragrância bem diferenciada (MATTOSO, 2005). O seu óleo tem menor teor de linalol, varia de 32% a 40% (MAIA et al. 2001).</p>
                        <p>É uma árvore de médio porte e sua morfologia é caracterizada por tronco pardo-amarelo, folhas coriáceas, inflorescência lateral de até 2,5 centímetros, flores pequenas, multifloral e frutos com drupa cupulada, do tipo baga, contendo apenas uma semente por fruto, cor vinho-escuro quando maduro (SILVEIRA et al. 2008). Os ramos e a madeira da árvore são secos e transformados em pó, para assim serem usados como sachês aromatizantes (CORRÊA, 1974) e em "banhos de cheiro" (RODRIGUES, 1989).</p>
                        <p>Alguns estudos sobre as atividades biológicas da macacaporanga foram realizados. A análise do OEMP por cromatografia gasosa bidimensional acoplada a espectrometria de massa quadrupolar de rápida varredura, identificou a presença de 87 componentes (TRANCHIDA et al. 2008). Paredes et al. (2014) avaliou o perfil fitoquímico da espécie e, posteriormente, constatou que ela possui atividade antioxidante. Ensaios farmacológicos confirmaram a atividade antimicrobiana do OEMP (SARRAZIN et al. 2016). E o extrato aquoso da planta apresentou atividade anti-hemorrágica contra o veneno de cobra (Bothrops jararaca) (MOURA, 2010).</p>
                        <h5>1.3 CATINGA-DE-MULATA</h5>
                        <p><b>Aeollanthus suaveolens</b> Mart. ex Spreng (figura 3) é uma espécie aromática pertencente à família Lamiaceae. Apresenta odor forte e característico, sendo nativa do sul do continente africano, mas naturalizada no Brasil. A espécie é uma erva anual bem estabelecida na Amazônia brasileira, muito utilizada na medicina tradicional por seus efeitos sedativos e anticonvulsivantes. Ela também é utilizada no folclore para a ornamentação de vários rituais afro-religiosos (ELISABETSKY et al. 1995; ELISABETSKY et al. 1999; TUCKER et al. 2001), e em perfumes caseiros (OLIVEIRA et al. 2004).</p>
                        <figure style='text-align:center;'>
                            <img src="static/assets/figuras/Figura 3 Aeollanthus suaveolens Mart. ex Spreng (catinga-de-mulata).png" alt="Aeollanthus suaveolens Mart. ex Spreng (catinga-de-mulata)" style="max-width:350px;width:100%;border-radius:8px;"/>
                            <figcaption>Figura 3: Aeollanthus suaveolens Mart. ex Spreng (catinga-de-mulata)<br><span style="font-size:0.95em;color:#888;">FONTE: Profa. Rosa Mourão, UFOPA/Santarém.</span></figcaption>
                        </figure>
                        <p>A espécie possui diferentes nomes populares, de acordo com cada região. Nos estados do Pará, Amapá e Maranhão, ela é vulgarmente conhecida como catinga-de-mulata. Nos estados do Rio Grande do Norte e Pernambuco como macassá e no Rio de Janeiro a conhecem por manjericão miúdo ou chegadinha (MAIA et al. 2003). Quanto ao seu uso pela medicina tradicional, o chá ou o sumo da folha é usado no combate à gripe, febre, dor de ouvido, dor de cabeça, derrame, estados convulsivos, e também é utilizado para obter sedação (SOUZA et al. 1996; OLIVEIRA et al. 2004).</p>
                        <p>Devido à importância da planta para a medicina tradicional e como fragrância, diversos estudos foram realizados. Estudo revelou que o β-farneseno (27,6%), linalol (26,7%) e a δ-decen-2-lactona (26,6%) foram os componentes majoritários encontrados no óleo essencial de Catinga-de-Mulata (OECM) (SOUSA et al. 2003). Os resultados observados na análise toxicológica da planta sugerem uma baixa toxicidade do seu óleo essencial (SOUSA et al. 2003). A atividade antimicrobiana do óleo foi comprovada, o mesmo foi ativo contra todos os microrganismos testados, com ênfase a concentração inibitória mínima (1,25 mg/ml) observada contra a bactéria Escherichia coli e o fungo Cryptococcus neoformans (SIMIONATTO et al. 2007).</p>
                        <p>Estudos fitoquímicos monitorados farmacologicamente revelaram que o OECM é o responsável por inibir as convulsões induzidas por metrazol (PTZ) em camundongos (SOUZA et al. 1996). A atividade anticonvulsivante de lactonas detectadas na espécie foi avaliada em camundongos, contudo a γ-decalactona apresentou atividade sedativa (SOUZA et al. 1997). O extrato hidroalcoólico apresentou potente atividade analgésica e anti-inflamatória em camundongos (LOTUFO et al. 2004). E em estudo recente, o OECM mostrou atividade antimicrobiana, pouca atividade antioxidante e alta atividade citotóxica (MARTINS et al. 2016). A variabilidade de compostos presentes nos óleos essenciais da Amazônia lhes confere diversas propriedades biológicas. O composto majoritário dos óleos essenciais de pau-rosa, macacaporanga e catinga-de-mulata e que possui diversas atividades biológicas, entre elas, atividades sobre o SNC, é o linalol.</p>
                        <h5>1.4 LINALOL</h5>
                        <p>O linalol (3,7-dimetil-1,6-octadien-3-ol) (figura 4) é um monoterpeno acíclico, álcool terciário e constituinte volátil majoritário de óleos essenciais de diversas espécies de plantas aromáticas. Ele representa cerca de 70% do total de terpenoides de plantas aromáticas (STASHENKO e MARTINEZ, 2008). Por conta das propriedades quirais do carbono terciário hidroxilado, dois enantiômeros ocorrem na natureza, o (3S)-(+)-linalol (coriandrol) e o (3R)-(–)-linalol (licareol). Estes enantiômeros apresentam diferentes fragrâncias. O coriandrol é relatado como sendo doce, floral e herbáceo, enquanto o licareol tem um aroma do tipo lavanda (BONNLÄNDER et al. 2006; CSEKE et al. 2007).</p>
                        <figure style='text-align:center;'>
                            <img src="static/assets/figuras/Figura 4 Linalol.png" alt="Linalol" style="max-width:350px;width:100%;border-radius:8px;"/>
                            <figcaption>Figura 4: Linalol<br><span style="font-size:0.95em;color:#888;">FONTE: Lapczynski et al. (2008).</span></figcaption>
                        </figure>
                        <p>O linalol se destaca internacionalmente, principalmente nos ramos de cosméticos e de fragrâncias, por ser um ingrediente com bouquet floral e um constituinte de perfumes. Dessa forma, com destaque para o produto de origem sintética, ele é encontrado em 60% a 90% dos produtos cosméticos, como xampus, loções corporais, sabonetes, cremes e desodorantes. Ele também é adicionado a detergentes domésticos, a produtos de cuidado com móveis e ceras, além de ser adicionado a bebidas e alimentos processados como um agente de sabor e fragrância. Na indústria, é um intermediário importante na síntese de vitamina E, além de ser usado para a produção de vitamina A. O consumo mundial anual de linalol excede mil toneladas (CAL e KRZYZANIAK, 2006; LAPCZYNSKI et al. 2008).</p>
                        <p>Muitas espécies, ricas em linalol, são utilizadas na medicina tradicional para aliviar sintomas de diversas enfermidades (ELISABETSKY et al. 1995; JIA et al. 1999). Por conta do uso tradicional, vários pesquisadores investigaram e relataram suas atividades biológicas, como anticonvulsivante em modelos de convulsão relacionado com o glutamato (ELISABETSKY et al. 1995; ELISABETSKY et al. 1999), anti-inflamatória (PEANA et al. 2002) e indução de antinocicepção (PEANA et al. 2003; PEANA et al. 2004).</p>
                        <p>Outros pesquisadores verificaram que em voluntários humanos saudáveis, a administração transdérmica de linalol induziu um decréscimo na pressão sanguínea sistólica e uma pequena queda da temperatura da pele, sem efeitos no bem-estar subjetivo (HEUBERGUER et al. 2004). Além disso, a sua inalação, mesmo em seres humanos, apresentou diminuição da frequência cardíaca e da atividade aumentada do nervo vagal (KURODA et al. 2005) e ação sedativa (SUGAWARA et al. 1998). Ele também inibiu a formação de óxido nítrico in vitro (PEANA et al. 2006). A atividade de espécies ricas em linalol sobre o SNC indicam que este composto pode ser capaz de tratar transtornos neuropsiquiátricos.</p>
                        <p>As doenças que afetam o SNC surgem aos poucos e várias ainda não possuem cura. Elas cerceiam o ser humano de sua liberdade e comprometem funções importantes do organismo. Dessa forma, é fundamental a busca por novos insumos que possam tratar satisfatoriamente o paciente, melhorando sua qualidade de vida. As atividades dos óleos essenciais, ricos em linalol, de pau-rosa, macacaporanga e catinga-de-mulata sobre o SNC, os apontam como prováveis fontes de compostos capazes de interagir com vias das desordens neurodegenerativas e comportamentais. Considerando a relevância e o impacto social apresentado por essas doenças e o pouco conhecimento que existe sobre os óleos essenciais da Amazônia, estudos que explorem os seus efeitos sobre o SNC são de extrema importância para fomentar o conhecimento e para uma possível descoberta de novos medicamentos.</p>
                        `;
                    } else if (title === 'Canela-Preta') {
                        content = `
                        <h4>Óleo Essencial da Casca de Ocotea catharinensis Mez. (Lauraceae)</h4>
                        <h5>Resumo</h5>
                        <p>Por cromatografia a gás e espectrometria de massas (CG/EM), foram identificados 10 componentes do óleo essencial extraído da casca de <b>Ocotea catharinensis</b> Mez., uma espécie arbórea da família Lauraceae, amplamente encontrada na Mata Atlântica. O material vegetal foi coletado no Parque Estadual da Cantareira (São Paulo, SP). A destilação foi realizada utilizando o método de Clevenger, com rendimento de 1,34% em relação à massa seca da casca. O óleo essencial apresentou coloração amarela, odor aromático persistente e sabor levemente picante. Os principais componentes identificados foram: α-pineno (0,07%), limoneno (0,11%), 1,8-cineol (0,14%), óxido-3,6-linalol (0,36%), copaeno (0,08%), linalol (95,76%), α-terpineol (1,47%), sesquiterpeno (M+204) (0,12%), citronelol (0,28%) e geraniol (0,75%).</p>
                        <h5>1. Introdução e Revisão Bibliográfica</h5>
                        <p><b>Ocotea catharinensis</b>, também conhecida como canela-preta ou canela-amarela, é uma árvore de grande porte nativa da Mata Atlântica, frequentemente associada a ambientes úmidos de floresta densa. Ela pertence ao gênero <b>Ocotea</b>, que inclui cerca de 300 espécies distribuídas principalmente na América Tropical.</p>
                        <p>Além do valor madeireiro, essa espécie tem sido estudada por suas propriedades químicas, especialmente em relação à composição de seus óleos essenciais. Esses óleos são amplamente utilizados nas indústrias cosmética, farmacêutica e de perfumaria. Dentro da família Lauraceae, várias espécies, como <i>Aniba rosaeodora</i> (pau-rosa), <i>Ocotea pretiosa</i> (sassafrás) e <i>Cinnamomum zeylanicum</i> (canela-de-ceilão), destacam-se pela produção de compostos voláteis com propriedades aromáticas e bioativas.</p>
                        <p>Estudos anteriores revelam que os óleos essenciais dessas plantas possuem variações químicas significativas entre populações, sendo influenciados por fatores genéticos, ambientais e pela parte da planta utilizada. A presença de compostos como linalol, safrol, metileugenol e geraniol em diferentes concentrações pode afetar diretamente a atividade biológica e o uso comercial desses óleos.</p>
                        <h5>2. Materiais e Métodos</h5>
                        <b>2.1 Material Botânico</b>
                        <p>A casca do lenho de <i>O. catharinensis</i> foi coletada no Parque Estadual da Cantareira, localizado no município de São Paulo, SP. As amostras foram identificadas e depositadas no Herbário D. Bento Pickel, sob o número de registro SPSF 5.550. Os nomes populares incluem: canela-preta, canela-amarela, canela-broto, canela-pinho, canela-bicho e canela-coqueira.</p>
                        <b>2.2 Extração do Óleo Essencial</b>
                        <p>O material vegetal foi triturado em micromoinho de facas de aço inoxidável e submetido à destilação por arraste de vapor com aparelho de Clevenger modificado. Foram utilizados 100 g de casca seca para a extração. O rendimento obtido foi de 1,34% (mL/100g).</p>
                        <b>2.3 Análises Físico-Químicas e Cromatográficas</b>
                        <ul style='margin-left:20px;'>
                            <li><b>Organoléptica:</b> O óleo apresentou cor amarela, odor persistente e agradável e sabor levemente picante.</li>
                            <li><b>Cromatografia em Camada Delgada (CCD):</b> Realizada com sílica gel G e revelada com aldeído anísico.</li>
                            <li><b>Cromatografia em Fase Gasosa (CG/EM):</b> Realizada em equipamento Hewlett Packard 5740 com coluna capilar de 25 m e espectrômetro de massas Hitachi M-80. Os componentes foram identificados por comparação com padrões.</li>
                        </ul>
                        <h5>3. Resultados e Discussões</h5>
                        <p>O principal constituinte identificado no óleo essencial da casca foi o <b>linalol</b>, representando 95,76% da composição total. Este composto é um monoterpeno com ampla aplicação em fragrâncias, repelentes naturais e estudos farmacológicos por suas propriedades antimicrobianas, anti-inflamatórias e ansiolíticas.</p>
                        <p>Além do linalol, foram encontrados outros compostos em menores proporções, como α-pineno, limoneno, 1,8-cineol, copaeno, α-terpineol, citronelol e geraniol. Esses compostos também possuem propriedades biológicas relevantes e contribuem para o aroma e atividade do óleo.</p>
                        <p>A predominância do linalol nesse óleo é superior ao encontrado em espécies como <i>Aniba rosaeodora</i> (80-85%) e <i>Orhodon linaloliferum</i> (82%), tornando-o altamente interessante para aplicação industrial.</p>
                        <p>A cromatografia em fase gasosa acoplada à espectrometria de massas demonstrou ser uma técnica eficiente na separação e identificação dos componentes. Em contrapartida, a CCD apresentou baixa resolução, dificultando a visualização precisa das substâncias presentes.</p>
                        <p>Os dados obtidos reforçam o potencial econômico da espécie <i>O. catharinensis</i> como fonte alternativa de linalol natural. Além disso, os resultados contribuem para estudos de quimiossistemática dentro da família Lauraceae, possibilitando a diferenciação de espécies com base na composição química de seus óleos essenciais.</p>
                        <h5>4. Conclusão</h5>
                        <p>O óleo essencial da casca de <b>Ocotea catharinensis</b> Mez. apresenta alto teor de linalol, um composto de elevado valor comercial. O rendimento obtido foi satisfatório, e o perfil químico do óleo reforça o potencial dessa espécie para aplicação nas indústrias de fragrâncias, cosméticos e farmacêutica. Além disso, os dados obtidos podem auxiliar na caracterização botânica de espécies da família Lauraceae, promovendo o uso sustentável e consciente dos recursos florestais nativos.</p>
                        `;
                    } else {
                        content = card.querySelector('p').innerHTML;
                    }
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