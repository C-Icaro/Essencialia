// --- Simulação de dados de extrações ---
// REMOVIDO: const extracoes = [...]

// Buscar dados reais do backend
let extracoes = [];

async function fetchExtracoes() {
  try {
    const response = await fetch('/api/process');
    const data = await response.json();
    if (data.success && data.processes) {
      extracoes = data.processes.filter(p => p.status === 'finalizado');
    } else {
      extracoes = [];
    }
  } catch (e) {
    extracoes = [];
  }
}

// --- Utilitários ---
function formatDateTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleDateString('pt-BR', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
}
function formatTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
}
function formatDuracao(segundos) {
  if (!segundos || isNaN(segundos)) return '-';
  if (segundos < 60) {
    return `${Math.round(segundos)}s`;
  } else if (segundos < 3600) {
    const m = Math.floor(segundos / 60);
    const s = Math.round(segundos % 60);
    return `${m}min${s > 0 ? ' ' + s + 's' : ''}`;
  } else {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    return `${h}h${m > 0 ? ' ' + m + 'min' : ''}`;
  }
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

async function fetchTemperatureData(processId) {
  const response = await fetch(`/temperature-data?process_id=${processId}`);
  return await response.json();
}
async function fetchPressureData(processId) {
  const response = await fetch(`/pressure-data?process_id=${processId}`);
  return await response.json();
}
async function fetchWaterLevelData(processId) {
  const response = await fetch(`/water-level-data?process_id=${processId}`);
  return await response.json();
}

function safe(val, fallback = '-') {
  return val !== null && val !== undefined && val !== '' ? val : fallback;
}

async function atualizarPainel(idx) {
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
  document.getElementById('nome-planta').textContent = safe(extracao.plant_name);
  document.getElementById('tipo-materia').textContent = safe(extracao.parte_utilizada);
  document.getElementById('quantidade-utilizada').textContent = `${safe(extracao.quantidade_materia_prima, 0)} gramas`;
  // Falhas (não implementado no backend)
  document.getElementById('tipo-falha').textContent = '-';
  document.getElementById('horario-falha').textContent = '-';
  document.getElementById('duracao-falha').textContent = '-';
  document.getElementById('solucao-falha').textContent = '-';
  // Linha 3
  document.getElementById('volume-extraido').textContent = `${safe(extracao.volume_extraido, 0)} g`;
  let rendimento = safe(extracao.rendimento, 0);
  if (!isNaN(rendimento) && rendimento !== '-') rendimento = parseFloat(rendimento).toFixed(2);
  document.getElementById('rendimento').textContent = `${rendimento} %`;
  const obsEl = document.getElementById('notas-operador');
  obsEl.textContent = safe(extracao.notas_operador);
  obsEl.classList.add('historico-observacao-menor');
  // Linha 4 - Temperatura
  const tempData = await fetchTemperatureData(extracao.id);
  let tempMedia = '-', tempMax = '-';
  if (tempData.temperatures && tempData.temperatures.length > 0) {
    const temps = tempData.temperatures.map(Number);
    tempMedia = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    tempMax = Math.max(...temps).toFixed(1);
    atualizarGrafico('grafico-temperatura', temps, 'Temperatura', '#fbbf24');
  } else {
    atualizarGrafico('grafico-temperatura', [], 'Temperatura', '#fbbf24');
  }
  document.getElementById('temp-media').textContent = `${tempMedia} °C`;
  document.getElementById('temp-max').textContent = `${tempMax} °C`;
  // Linha 4 - Pressão
  const pressData = await fetchPressureData(extracao.id);
  let pressMedia = '-', pressMax = '-';
  if (pressData.pressures && pressData.pressures.length > 0) {
    const presses = pressData.pressures.map(Number);
    pressMedia = (presses.reduce((a, b) => a + b, 0) / presses.length).toFixed(1);
    pressMax = Math.max(...presses).toFixed(1);
    atualizarGrafico('grafico-pressao', presses, 'Pressão', '#f87171');
  } else {
    atualizarGrafico('grafico-pressao', [], 'Pressão', '#f87171');
  }
  document.getElementById('pressao-media').textContent = `${pressMedia} KPa`;
  document.getElementById('pressao-max').textContent = `${pressMax} KPa`;
  // Linha 4 - Níveis de água
  const waterData = await fetchWaterLevelData(extracao.id);
  if (waterData.water_levels && waterData.water_levels.length > 0) {
    atualizarGraficoBarra('grafico-niveis', waterData.water_levels, 'Nível de água');
  } else {
    atualizarGraficoBarra('grafico-niveis', [], 'Nível de água');
  }
  // Fases (não implementado no backend)
  document.getElementById('tempo-aquecimento').textContent = '-';
  document.getElementById('tempo-destilacao').textContent = '-';
  document.getElementById('tempo-resfriamento').textContent = '-';
}

function atualizarGrafico(canvasId, data, label, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (window[canvasId] && typeof window[canvasId].destroy === 'function') {
    window[canvasId].destroy();
  }
  window[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => `${i + 1}`),
      datasets: [{
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: color + '22',
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
}
function atualizarGraficoBarra(canvasId, data, label) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (window[canvasId] && typeof window[canvasId].destroy === 'function') {
    window[canvasId].destroy();
  }
  // Calcular % alto e baixo
  let alto = 0, baixo = 0;
  data.forEach(v => {
    if (parseFloat(v) >= 0.5) alto++;
    else baixo++;
  });
  const total = alto + baixo;
  const percAlto = total ? ((alto / total) * 100).toFixed(2) : '0.00';
  const percBaixo = total ? ((baixo / total) * 100).toFixed(2) : '0.00';
  window[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Nível Alto', 'Nível Baixo'],
      datasets: [{
        data: [alto, baixo],
        backgroundColor: ['#34d399', '#60a5fa'],
        borderWidth: 2
      }]
    },
    options: {
      plugins: { legend: { display: true, position: 'bottom' } },
      cutout: '65%',
      responsive: true,
      maintainAspectRatio: false
    }
  });
  // Exibir texto com percentuais abaixo do gráfico
  let info = document.getElementById(canvasId + '-info');
  if (!info) {
    info = document.createElement('div');
    info.id = canvasId + '-info';
    info.style = 'text-align:center; font-size:0.98em; margin-top:6px; color:#333;';
    ctx.canvas.parentNode.appendChild(info);
  }
  info.innerHTML = `<b>${percAlto}%</b> do tempo em <span style='color:#34d399'>nível alto</span> &nbsp; | &nbsp; <b>${percBaixo}%</b> do tempo em <span style='color:#60a5fa'>nível baixo</span>`;
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', async () => {
  await fetchExtracoes();
  preencherDropdown();
  if (extracoes.length > 0) {
    atualizarPainel(0);
  }
  document.getElementById('extracao-select').addEventListener('change', function() {
    atualizarPainel(this.value);
  });

  // Botão de excluir extração
  const btnExcluir = document.getElementById('btn-excluir-extracao');
  btnExcluir.addEventListener('click', async function() {
    const idx = document.getElementById('extracao-select').value;
    const extracao = extracoes[idx];
    if (!extracao || !extracao.id) return;
    if (!confirm('Tem certeza que deseja excluir esta extração?')) return;
    try {
      const resp = await fetch(`/api/process/${extracao.id}`, { method: 'DELETE' });
      const data = await resp.json();
      if (data.success) {
        window.alerts && window.alerts.add('success', 'Extração excluída com sucesso!', null, true);
        // Atualiza a lista
        await fetchExtracoes();
        preencherDropdown();
        if (extracoes.length > 0) {
          atualizarPainel(0);
        } else {
          window.location.reload();
        }
      } else {
        window.alerts && window.alerts.add('error', data.error || 'Erro ao excluir extração.');
      }
    } catch (e) {
      window.alerts && window.alerts.add('error', 'Erro ao excluir extração.');
    }
  });
});