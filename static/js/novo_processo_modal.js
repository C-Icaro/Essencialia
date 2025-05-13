// static/js/novo_processo_modal.js
document.addEventListener('DOMContentLoaded', function() {
    // Abrir modal ao clicar em qualquer botão de novo processo
    function abrirModalNovoProcesso(e) {
      if (e) e.preventDefault();
      document.getElementById('novo-processo-modal').style.display = 'block';
    }
    // Para todos os botões com a classe .new-process-btn
    document.querySelectorAll('.new-process-btn').forEach(btn => {
      btn.removeEventListener('click', abrirModalNovoProcesso); // previne duplicidade
      btn.addEventListener('click', abrirModalNovoProcesso);
    });
    // Para o card amarelo (caso não tenha a classe new-process-btn)
    const homeCardYellow = document.querySelector('.home-card.yellow');
    if (homeCardYellow) {
      homeCardYellow.removeEventListener('click', abrirModalNovoProcesso);
      homeCardYellow.addEventListener('click', abrirModalNovoProcesso);
    }
    // Para o card com id new-process-card
    const newProcessCard = document.getElementById('new-process-card');
    if (newProcessCard) {
      newProcessCard.removeEventListener('click', abrirModalNovoProcesso);
      newProcessCard.addEventListener('click', abrirModalNovoProcesso);
    }
  
    // Fechar modal ao clicar em cancelar
    const cancelarBtn = document.querySelector('#novo-processo-modal .cancelar-btn');
    if (cancelarBtn) {
      cancelarBtn.addEventListener('click', () => {
        document.getElementById('novo-processo-modal').style.display = 'none';
      });
    }
  
    // Fechar modal ao clicar fora do conteúdo
    window.addEventListener('click', (event) => {
      const modal = document.getElementById('novo-processo-modal');
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  
    // Submissão do formulário
    const form = document.getElementById('novo-processo-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('novo-processo-modal').style.display = 'none';
        alert('Processo iniciado com sucesso!');
      });
    }
  
    // Atualizar duração estimada ao digitar a quantidade
    const inputGrama = document.querySelector('input[name="quantidade"]');
    const duracaoEstimada = document.getElementById('duracao-estimada');
    if (inputGrama && duracaoEstimada) {
      inputGrama.addEventListener('input', function() {
        const massa = parseFloat(inputGrama.value.replace(',', '.'));
        if (!massa || massa <= 0) {
          duracaoEstimada.value = '';
        } else {
          const tempo = Math.round(0.12 * massa + 20);
          duracaoEstimada.value = `${tempo} minutos`;
        }
      });
      inputGrama.dispatchEvent(new Event('input'));
    }
  
    const tempPorPlanta = {
      hortela: { min: 95, max: 100 },
      // lavanda: { min: 80, max: 90 }, // exemplo para outras plantas
    };
  
    const selectPlanta = document.querySelector('select[name="planta"]');
    const inputMin = document.querySelector('input[name="temp_min"]');
    const inputMax = document.querySelector('input[name="temp_max"]');
  
    if (selectPlanta && inputMin && inputMax) {
      selectPlanta.addEventListener('change', function() {
        const planta = selectPlanta.value;
        if (tempPorPlanta[planta]) {
          inputMin.value = tempPorPlanta[planta].min;
          inputMax.value = tempPorPlanta[planta].max;
        }
      });
      selectPlanta.dispatchEvent(new Event('change'));
    }
  });