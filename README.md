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

## Execução Local

### Pré-requisitos
- Python 3.8 ou superior
- Node.js 18.0 ou superior
- npm (Node Package Manager)

### Configuração do Ambiente

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd Essencialia
```

2. Configure o ambiente Python:
```bash
# Crie e ative um ambiente virtual (recomendado)
python -m venv venv
# No Windows:
.\venv\Scripts\activate
# No Linux/Mac:
source venv/bin/activate

# Instale as dependências Python
pip install -r requirements.txt
```

3. Configure o ambiente Node.js:
```bash
# Instale as dependências do frontend
npm install
```

### Migração do Banco de Dados

Antes de executar a aplicação pela primeira vez (ou após atualizações de estrutura do banco), execute as migrações para garantir que todas as colunas e tabelas estejam atualizadas:

```bash
npm run migrations
```

Esse comando executa o script de migração que cria/atualiza as colunas necessárias no banco de dados (por exemplo, a coluna `eficiencia` na tabela `process`).

### Executando a Aplicação

1. Inicie o servidor Flask:
```bash
# Usando npm
npm start

# Ou diretamente com Python
python app.py
```

2. Para desenvolvimento, você pode usar o modo debug:
```bash
npm run dev
```

3. Para executar os testes:
```bash
npm test
```

A aplicação estará disponível em `http://localhost:5000`

### Notas Importantes
- Certifique-se de que todas as dependências estão instaladas corretamente
- O banco de dados SQLite será criado automaticamente na primeira execução
- Para simulação de dados MQTT, o sistema possui um simulador integrado

---

## Resumo das Páginas

- **Home**: Navegação e boas-vindas
- **Dashboard**: Monitoramento e controle do processo
- **Histórico**: Consulta de processos passados
- **Biblioteca**: Conteúdo informativo
- **Suporte**: Contato dos desenvolvedores

---

## Rotas Importantes da API

### 1. Processo de Extração

#### `POST /api/process`
Cria um novo processo de extração. Recebe dados como planta, operador, quantidade de matéria-prima, parte utilizada, temperatura mínima/máxima, etc. Garante que não exista outro processo em andamento antes de criar um novo. Armazena o processo na tabela `process`.

- **Exemplo de payload:**
```json
{
  "planta": "Capim-limão",
  "operator": "João",
  "quantidade": 2.5,
  "parte": "folha",
  "temp_min": 80,
  "temp_max": 100
}
```
- **Resposta:**
  - Sucesso: `{ "success": true, "process_id": 1, "message": "Processo iniciado com sucesso" }`
  - Erro: `{ "success": false, "error": "Mensagem de erro" }`

#### `GET /api/process`
Retorna a lista de todos os processos de extração cadastrados, incluindo informações da planta, operador, tempos, status, etc.

- **Resposta:**
  - Sucesso: `{ "success": true, "processes": [ ... ] }`

### 2. Dados de Temperatura

#### `GET /temperature-data`
Retorna os dados históricos de temperatura registrados pelos sensores durante os processos de extração.

- **Parâmetros opcionais:**
  - `process_id`: filtra os dados para um processo específico.
- **Resposta:**
```json
{
  "timestamps": ["2024-06-01T12:00:00-04:00", ...],
  "temperatures": [85.2, ...]
}
```
- **Armazena:**
  - Tabela `sensor_data` (tipo `temperature`)

### 3. Dados de Pressão

#### `GET /pressure-data`
Retorna os dados históricos de pressão registrados pelos sensores durante os processos de extração.

- **Parâmetros opcionais:**
  - `process_id`: filtra os dados para um processo específico.
- **Resposta:**
```json
{
  "timestamps": ["2024-06-01T12:00:00-04:00", ...],
  "pressures": [1.2, ...]
}
```
- **Armazena:**
  - Tabela `sensor_data` (tipo `pressure`)

---

Se quiser um diagrama, fluxograma, ou detalhamento de alguma parte específica, consulte a documentação ou entre em contato com os desenvolvedores.
 