// Componente para verificação de processos em andamento
const ProcessChecker = {
    // Estado interno do componente
    state: {
        currentProcess: null,
        isChecking: false
    },

    // Inicializa o componente
    init() {
        console.log('ProcessChecker: Inicializando componente...');
        return this;
    },

    // Verifica se existe um processo em andamento
    async check() {
        if (this.state.isChecking) {
            console.log('ProcessChecker: Já existe uma verificação em andamento');
            return this.state.currentProcess;
        }

        this.state.isChecking = true;
        console.log('ProcessChecker: Verificando processo em andamento...');

        try {
            const response = await fetch('/api/process');
            const result = await response.json();
            
            if (result.success) {
                const processoEmAndamento = result.processes.find(p => p.status === 'em andamento');
                this.state.currentProcess = processoEmAndamento || null;

                if (processoEmAndamento) {
                    console.log('ProcessChecker: Processo em andamento encontrado:', processoEmAndamento);
                    // Aguarda um pequeno delay para garantir que o sistema de alertas esteja disponível
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    if (window.alerts) {
                        await window.alerts.add(
                            'Já existe um processo em andamento.\n\nFinalize o processo atual antes de iniciar um novo.\nAcesse o Dashboard para acompanhar ou finalizar o processo em andamento.',
                            'warning',
                            null,
                            true
                        );
                    } else {
                        console.error('ProcessChecker: Sistema de alertas não disponível');
                    }
                }
            }
        } catch (error) {
            console.error('ProcessChecker: Erro ao verificar processo em andamento:', error);
            // Aguarda um pequeno delay para garantir que o sistema de alertas esteja disponível
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (window.alerts) {
                await window.alerts.add(
                    'Ocorreu um erro ao verificar o processo em andamento. Por favor, tente novamente ou recarregue a página.',
                    'error',
                    null,
                    true
                );
            } else {
                console.error('ProcessChecker: Sistema de alertas não disponível');
            }
            this.state.currentProcess = null;
        } finally {
            this.state.isChecking = false;
        }

        return this.state.currentProcess;
    },

    // Verifica se existe um processo em andamento e retorna um booleano
    async hasActiveProcess() {
        const process = await this.check();
        return !!process;
    },

    // Obtém o processo atual em andamento
    getCurrentProcess() {
        return this.state.currentProcess;
    },

    // Limpa o estado do componente
    clear() {
        this.state.currentProcess = null;
        this.state.isChecking = false;
    }
};

// Exporta o componente
window.ProcessChecker = ProcessChecker; 