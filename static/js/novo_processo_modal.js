// static/js/novo_processo_modal.js
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o ProcessChecker
    const processChecker = window.ProcessChecker.init();

    // Função para adicionar alerta no quadro de avisos
    async function adicionarAlerta(mensagem, tipo = 'error') {
        // Usa o sistema de alertas do dashboard
        if (window.alerts) {
            await window.alerts.add(mensagem, tipo, null, true);
        } else {
            console.error('Sistema de alertas não disponível');
        }
    }

    // Função para abrir o modal de novo processo
    function abrirModalNovoProcesso(e) {
        if (e) e.preventDefault();
        // Verifica se existe processo em andamento usando o ProcessChecker
        if (window.ProcessChecker && window.ProcessChecker.state && window.ProcessChecker.state.currentProcess) {
            // Se já existe processo em andamento, não abre o modal
            window.alerts && window.alerts.add('Já existe um processo em andamento. Finalize antes de iniciar outro.', 'error');
            return;
        }
        document.getElementById('novo-processo-modal').style.display = 'block';
    }

    // Ao carregar a página, associa o evento a todos os botões/cards .new-process-btn
    function setupNovoProcessoBtns() {
        document.querySelectorAll('.new-process-btn').forEach(btn => {
            btn.removeEventListener('click', abrirModalNovoProcesso);
            btn.addEventListener('click', abrirModalNovoProcesso);
        });
    }

    setupNovoProcessoBtns();

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
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = {
                    planta: form.querySelector('select[name="planta"]').value,
                    quantidade: form.querySelector('input[name="quantidade"]').value,
                    parte: form.querySelector('select[name="parte"]').value,
                    temp_min: form.querySelector('input[name="temp_min"]').value,
                    temp_max: form.querySelector('input[name="temp_max"]').value,
                    operator: 'Operador 1' // TODO: Implementar seleção de operador
                };

                const response = await fetch('/api/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    // Armazena o ID do processo para uso posterior
                    window.currentProcessId = result.process_id;
                    
                    // Fecha o modal
                    document.getElementById('novo-processo-modal').style.display = 'none';
                    
                    // Dispara evento customizado para o dashboard
                    window.dispatchEvent(new CustomEvent('novoProcessoIniciado', {
                        detail: { 
                            ...formData,
                            duracao: document.getElementById('duracao-estimada').value,
                            process_id: result.process_id
                        }
                    }));
                    
                    alert('Processo iniciado com sucesso!');
                } else {
                    // Verifica se é o erro de processo em andamento
                    if (result.error && result.error.includes('Já existe um processo em andamento')) {
                        alert('Não é possível iniciar um novo processo enquanto houver outro em andamento.\n\nPor favor, finalize o processo atual antes de iniciar um novo.');
                    } else {
                        throw new Error(result.error || 'Erro ao iniciar processo');
                    }
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao iniciar processo: ' + error.message);
            }
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
                duracaoEstimada.dataset.minutes = '0';
            } else {
                const tempo = Math.round(0.12 * massa + 20);
                duracaoEstimada.value = `${tempo} minutos`;
                duracaoEstimada.dataset.minutes = tempo.toString();
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

async function iniciarProcesso(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const duracaoEstimada = document.getElementById('duracao-estimada');
    const tempoEstimado = parseInt(duracaoEstimada.dataset.minutes || '0');

    if (!tempoEstimado || tempoEstimado <= 0) {
        window.alerts.add('Por favor, insira uma quantidade válida para calcular o tempo estimado', 'error');
        return;
    }

    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plant_id: formData.get('plant_id'),
                material_input: formData.get('material_input'),
                part_used: formData.get('part_used'),
                tempo_estimado: tempoEstimado,
                operator: formData.get('operator')
            })
        });

        const result = await response.json();

        if (result.success) {
            // Dispara evento com os dados do novo processo
            window.dispatchEvent(new CustomEvent('novoProcessoIniciado', {
                detail: {
                    process_id: result.process_id,
                    plant_name: formData.get('plant_name'),
                    material_input: `${formData.get('material_input')} gramas`,
                    part_used: formData.get('part_used'),
                    tempo_estimado: tempoEstimado
                }
            }));

            // Fecha o modal
            const modal = document.getElementById('novo-processo-modal');
            if (modal) modal.style.display = 'none';

            // Limpa o formulário
            form.reset();

            // Mostra mensagem de sucesso
            window.alerts.add('Processo iniciado com sucesso!', 'success');
        } else {
            throw new Error(result.message || 'Erro ao iniciar processo');
        }
    } catch (error) {
        console.error('Erro ao iniciar processo:', error);
        window.alerts.add(error.message || 'Erro ao iniciar processo', 'error');
    }
}