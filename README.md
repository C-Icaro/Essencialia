# Essenciália

Essenciália é um sistema web para monitoramento, controle e histórico de processos de extração de óleos essenciais, integrando hardware (via MQTT) e interface amigável para o usuário.

---

## Visão Geral

### Propósito
A aplicação Essenciália permite acompanhar e controlar processos de extração de óleos essenciais, exibindo dados em tempo real, históricos e facilitando a operação do sistema.

---

## Principais Funcionalidades

- **Dashboard**: Monitoramento em tempo real (temperatura, pressão, nível de água, planta selecionada, tempo restante), gráficos históricos, painel de controle, alertas e seleção de planta.
- **Home**: Tela inicial com cards de navegação, barra de pesquisa e mensagem de boas-vindas.
- **Histórico**: Consulta de ciclos anteriores de extração, pesquisa e acesso a detalhes.
- **Biblioteca**: Informações sobre plantas, métodos de extração, dicas, etc.
- **Suporte**: Informações de contato dos desenvolvedores para suporte técnico.

---

## Estrutura de Interface

- **Sidebar fixa** à esquerda com navegação para todas as áreas.
- **Área principal** com conteúdo dinâmico conforme a página.
- **Design moderno**: cards coloridos, cantos arredondados, fontes limpas, responsivo.

---

## Integração com Hardware

- **MQTT**: Recebe dados em tempo real de sensores (temperatura, pressão, nível de água).
- **Banco de dados SQLite**: Armazena históricos de temperatura e pressão.
- **Simulação**: Caso não haja hardware, o frontend simula dados para visualização.

---

## Modelagem de Dados

- **Tabelas principais**:
  - `temperature_data`: id, timestamp, temperature
  - `pressure_data`: id, timestamp, pressure
- **Cada leitura**: timestamp + valor (temperatura ou pressão)

---

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS customizado, JavaScript puro
- **Backend**: Python (Flask), MQTT (paho-mqtt), SQLite
- **Gráficos**: Canvas API customizada
- **Responsividade**: CSS customizado

---

## Resumo das Páginas

- **Home**: Navegação e boas-vindas
- **Dashboard**: Monitoramento e controle do processo
- **Histórico**: Consulta de processos passados
- **Biblioteca**: Conteúdo informativo
- **Suporte**: Contato dos desenvolvedores

---

Se quiser um diagrama, fluxograma, ou detalhamento de alguma parte específica, consulte a documentação ou entre em contato com os desenvolvedores.
 