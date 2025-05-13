// --- Simulação de dados de extrações ---
const extracoes = [
  {
    id: 12345,
    plant_id: 1,
    nome_planta: 'Lavanda',
    parte_utilizada: 'Flor',
    quantidade_materia_prima: 120,
    temp_min: 80,
    temp_max: 90,
    start_time: '2024-06-01T08:00:00',
    end_time: '2024-06-01T10:10:00',
    operator: 'João',
    volume_extraido: 8.5,
    rendimento: 7.08,
    notas_operador: 'Processo normal, sem intercorrências.',
    status: 'finalizado',
    falha: {
      tipo: '-',
      horario: '-',
      duracao: '-',
      solucao: '-'
    },
    temperatura: [80, 82, 85, 87, 89, 90, 88, 86, 85, 84],
    pressao: [20, 22, 25, 27, 29, 30, 28, 27, 26, 25],
    niveis_agua: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35],
    fases: {
      aquecimento: 1800, // segundos
      destilacao: 3000,
      resfriamento: 1200
    }
  },
  {
    id: 12346,
    plant_id: 2,
    nome_planta: 'Eucalipto',
    parte_utilizada: 'Folha',
    quantidade_materia_prima: 150,
    temp_min: 85,
    temp_max: 95,
    start_time: '2024-06-02T09:00:00',
    end_time: '2024-06-02T11:00:00',
    operator: 'Maria',
    volume_extraido: 10.2,
    rendimento: 6.8,
    notas_operador: 'Pequena oscilação de pressão.',
    status: 'finalizado',
    falha: {
      tipo: 'Oscilação de pressão',
      horario: '09:45:00',
      duracao: '00h 10min 00sec',
      solucao: 'Ajuste manual da válvula.'
    },
    temperatura: [85, 87, 90, 92, 95, 93, 91, 90, 89, 88],
    pressao: [22, 24, 27, 29, 32, 30, 28, 27, 26, 25],
    niveis_agua: [90, 85, 80, 75, 70, 65, 60, 55, 50, 45],
    fases: {
      aquecimento: 2000,
      destilacao: 3200,
      resfriamento: 1000
    }
  }
];

// --- Utilitários ---
function formatDateTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleDateString('pt-BR');
}
function formatTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function formatDuracao(segundos) {
  if (!segundos || isNaN(segundos)) return '-';
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return `${h}h ${m.toString().padStart(2, '0')}min ${s.toString().padStart(2, '0')}sec`;
}

// --- Preencher dropdown de extrações ---
function preencherDropdown() {
  const select = document.getElementById('extracao-select');
  select.innerHTML = '';
  extracoes.forEach((extracao, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `#${extracao.id}`;
    select.appendChild(opt);
  });
}

// --- Atualizar todos os campos/cards/gráficos ---
let tempChart = null;
let pressChart = null;
let niveisChart = null;

function atualizarPainel(idx) {
  const extracao = extracoes[idx];
  // Linha 1
  document.getElementById('hora-inicial').textContent = formatTime(extracao.start_time);
  document.getElementById('data-inicial').textContent = formatDate(extracao.start_time);
  document.getElementById('hora-final').textContent = formatTime(extracao.end_time);
  document.getElementById('data-final').textContent = formatDate(extracao.end_time);
  // Duração total
  const duracaoTotal = (new Date(extracao.end_time) - new Date(extracao.start_time)) / 1000;
  document.getElementById('duracao-total').textContent = formatDuracao(duracaoTotal);
  // Linha 2
  document.getElementById('nome-planta').textContent = extracao.nome_planta;
  document.getElementById('tipo-materia').textContent = extracao.parte_utilizada;
  document.getElementById('quantidade-utilizada').textContent = `${extracao.quantidade_materia_prima} gramas`;
  // Falhas
  document.getElementById('tipo-falha').textContent = extracao.falha.tipo;
  document.getElementById('horario-falha').textContent = extracao.falha.horario;
  document.getElementById('duracao-falha').textContent = extracao.falha.duracao;
  document.getElementById('solucao-falha').textContent = extracao.falha.solucao;
  // Linha 3
  document.getElementById('volume-extraido').textContent = `${extracao.volume_extraido} ml`;
  document.getElementById('rendimento').textContent = `${extracao.rendimento} %`;
  document.getElementById('notas-operador').textContent = extracao.notas_operador;
  // Linha 4 - Temperatura
  const tempMedia = (extracao.temperatura.reduce((a,b)=>a+b,0)/extracao.temperatura.length).toFixed(1);
  const tempMax = Math.max(...extracao.temperatura);
  document.getElementById('temp-media').textContent = `${tempMedia} °C`;
  document.getElementById('temp-max').textContent = `${tempMax} °C`;
  // Linha 4 - Pressão
  const pressMedia = (extracao.pressao.reduce((a,b)=>a+b,0)/extracao.pressao.length).toFixed(1);
  const pressMax = Math.max(...extracao.pressao);
  document.getElementById('pressao-media').textContent = `${pressMedia} KPa`;
  document.getElementById('pressao-max').textContent = `${pressMax} KPa`;
  // Gráficos
  atualizarGraficos(extracao);
  // Fases
  document.getElementById('tempo-aquecimento').textContent = formatDuracao(extracao.fases.aquecimento);
  document.getElementById('tempo-destilacao').textContent = formatDuracao(extracao.fases.destilacao);
  document.getElementById('tempo-resfriamento').textContent = formatDuracao(extracao.fases.resfriamento);
}

function atualizarGraficos(extracao) {
  // Temperatura
  const tempCtx = document.getElementById('grafico-temperatura').getContext('2d');
  if (tempChart) tempChart.destroy();
  tempChart = new Chart(tempCtx, {
    type: 'line',
    data: {
      labels: extracao.temperatura.map((_,i)=>`${i+1}`),
      datasets: [{
        label: 'Temperatura',
        data: extracao.temperatura,
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251,191,36,0.08)',
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { beginAtZero: false, grid: { color: '#eee' } }
      }
    }
  });
  // Pressão
  const pressCtx = document.getElementById('grafico-pressao').getContext('2d');
  if (pressChart) pressChart.destroy();
  pressChart = new Chart(pressCtx, {
    type: 'line',
    data: {
      labels: extracao.pressao.map((_,i)=>`${i+1}`),
      datasets: [{
        label: 'Pressão',
        data: extracao.pressao,
        borderColor: '#f87171',
        backgroundColor: 'rgba(248,113,113,0.08)',
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { beginAtZero: false, grid: { color: '#eee' } }
      }
    }
  });
  // Níveis de água
  const niveisCtx = document.getElementById('grafico-niveis').getContext('2d');
  if (niveisChart) niveisChart.destroy();
  niveisChart = new Chart(niveisCtx, {
    type: 'bar',
    data: {
      labels: extracao.niveis_agua.map((_,i)=>`${10+i} am`),
      datasets: [{
        label: 'Nível de água',
        data: extracao.niveis_agua,
        backgroundColor: ['#6ee7b7','#fbbf24','#f87171','#60a5fa','#a7f3d0','#fde68a','#fbbf24','#6ee7b7','#60a5fa','#a7f3d0'],
        borderRadius: 8
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#eee' } }
      }
    }
  });
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
  preencherDropdown();
  atualizarPainel(0);
  document.getElementById('extracao-select').addEventListener('change', function() {
    atualizarPainel(this.value);
  });
});