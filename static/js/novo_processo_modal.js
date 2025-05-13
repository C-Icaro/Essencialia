// static/js/novo_processo_modal.js
document.addEventListener('DOMContentLoaded', function() {
    // Função para adicionar alerta no quadro de avisos
    async function adicionarAlerta(mensagem, tipo = 'error') {
        // Usa o sistema de alertas do dashboard
        if (window.alerts) {
            await window.alerts.add(mensagem, tipo, null, true);
        } else {
            console.error('Sistema de alertas não disponível');
        }
    }

    // Função para verificar se existe processo em andamento
    async function verificarProcessoEmAndamento() {
        try {
            console.log('Verificando processo em andamento...');
            const response = await fetch('/api/process');
            const result = await response.json();
            
            if (result.success) {
                const processoEmAndamento = result.processes.find(p => p.status === 'em andamento');
                if (processoEmAndamento) {
                    console.log('Processo em andamento encontrado, mostrando alerta...');
                    // Usa o sistema de alertas persistente
                    await adicionarAlerta(
                        'Já existe um processo em andamento. Finalize o processo atual antes de iniciar um novo.',
                        'error'
                    );
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar processo em andamento:', error);
            // Em caso de erro, também cria um alerta persistente
            await adicionarAlerta(
                'Erro ao verificar processo em andamento. Por favor, tente novamente.',
                'error'
            );
            return false;
        }
    }

    // Abrir modal ao clicar em qualquer botão de novo processo
    async function abrirModalNovoProcesso(e) {
        if (e) e.preventDefault();
        
        // Verifica se existe processo em andamento usando a função global
        if (typeof window.verificarProcessoEmAndamento === 'function') {
            const temProcessoEmAndamento = await window.verificarProcessoEmAndamento();
            if (temProcessoEmAndamento) {
                return; // Não abre o modal se houver processo em andamento
            }
        } else {
            console.error('Função verificarProcessoEmAndamento não disponível');
            return;
        }
        
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