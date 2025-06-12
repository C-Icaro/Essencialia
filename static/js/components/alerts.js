const AlertSystem = {
    localAlerts: new Map(), // Armazena alertas locais que não devem ser sobrescritos

    async fetch() {
        try {
            const response = await fetch('/alerts');
            const data = await response.json();
            this.render(data);
            
            // Verifica processo em andamento após buscar alertas
            await this.checkOngoingProcess();
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
        }
    },

    async checkOngoingProcess() {
        try {
            const response = await fetch('/api/process');
            const result = await response.json();
            
            if (result.success) {
                const processoEmAndamento = result.processes.find(p => p.status === 'em andamento');
                if (processoEmAndamento) {
                    // Verifica se já existe um alerta de processo em andamento
                    const existingAlert = Array.from(this.localAlerts.values())
                        .find(alert => alert.type === 'process' && alert.data?.processId === processoEmAndamento.id);
                    
                    if (!existingAlert) {
                        this.add(
                            'process',
                            `Processo em andamento: ${processoEmAndamento.plant_name}`,
                            {
                                processId: processoEmAndamento.id,
                                quantidade: processoEmAndamento.quantidade_materia_prima,
                                parte: processoEmAndamento.parte_utilizada,
                                tempoEstimado: processoEmAndamento.tempo_estimado
                            },
                            true
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao verificar processo em andamento:', error);
        }
    },

    render(alerts) {
        const alertList = document.querySelector('.alert-list');
        if (!alertList) return;

        // Limpa apenas os alertas do servidor, mantendo os locais
        const serverAlerts = Array.from(alertList.querySelectorAll('.alert:not([data-local="true"])'));
        serverAlerts.forEach(alert => alert.remove());

        // Adiciona os novos alertas do servidor
        alerts.forEach(alert => {
            // Não sobrescreve alertas locais
            if (!this.localAlerts.has(alert.id)) {
                this.createAlertElement(alert, alertList);
            }
        });

        // Garante que os alertas locais permaneçam visíveis
        this.localAlerts.forEach((alertData, alertId) => {
            if (!alertList.querySelector(`[data-alert-id="${alertId}"]`)) {
                this.createAlertElement(alertData, alertList, true);
            }
        });
    },

    createAlertElement(alert, container, isLocal = false) {
        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alert.type}`;
        if (isLocal) {
            alertElement.dataset.local = 'true';
        }
        if (alert.id) {
            alertElement.dataset.alertId = alert.id;
        }
        
        const icon = this.getAlertIcon(alert.type);
        alertElement.innerHTML = `
            <div class="alert-header">
                <span class="alert-icon">${icon}</span>
                <span class="alert-text">${alert.message}</span>
                <button class="close-alert">×</button>
            </div>
            ${alert.data ? `<div class="alert-details">${this.formatAlertDetails(alert.type, alert.data)}</div>` : ''}
        `;

        this.setupAlertInteractions(alertElement, alert, isLocal);
        container.appendChild(alertElement);
    },

    getAlertIcon(type) {
        const icons = {
            success: '✅',
            error: '⚠️',
            info: 'ℹ️',
            warning: '⚠️',
            process: '⚙️'
        };
        return icons[type] || 'ℹ️';
    },

    formatAlertDetails(type, data) {
        if (!data) return '';
        
        const templates = {
            process: `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Quantidade:</span>
                        <span class="detail-value">${data.quantidade}g</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Parte utilizada:</span>
                        <span class="detail-value">${data.parte}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tempo estimado:</span>
                        <span class="detail-value">${data.tempoEstimado ? data.tempoEstimado : 0} minutos</span>
                    </div>
                </div>`,
            temperature: `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Temperatura:</span>
                        <span class="detail-value">${data.temperatura}°C</span>
                    </div>
                    ${data.limite ? `
                    <div class="detail-item">
                        <span class="detail-label">Limite:</span>
                        <span class="detail-value">${data.limite}°C</span>
                    </div>` : ''}
                </div>`,
            pressure: data.variacao ? `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Pressão Atual:</span>
                        <span class="detail-value">${data.pressao_atual} kPa</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Pressão Anterior:</span>
                        <span class="detail-value">${data.pressao_anterior} kPa</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Variação:</span>
                        <span class="detail-value">${data.variacao.toFixed(1)} kPa</span>
                    </div>
                </div>` : `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Pressão:</span>
                        <span class="detail-value">${data.pressao} kPa</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Limite:</span>
                        <span class="detail-value">${data.limite} kPa</span>
                    </div>
                </div>`,
            water_level: `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Nível:</span>
                        <span class="detail-value">${data.nivel}</span>
                    </div>
                </div>`
        };

        return templates[type] || '';
    },

    setupAlertInteractions(element, alert, isLocal = false) {
        const closeBtn = element.querySelector('.close-alert');
        if (closeBtn) {
            closeBtn.addEventListener('click', async () => {
                if (isLocal) {
                    // Remove apenas do DOM se for local
                    element.remove();
                    if (alert.id) {
                        this.localAlerts.delete(alert.id);
                    }
                } else if (alert.id) {
                    // Marca como resolvido no servidor se não for local
                    try {
                        const response = await fetch(`/alerts/resolve/${alert.id}`, {
                            method: 'POST'
                        });
                        const data = await response.json();
                        if (data.success) {
                            element.remove();
                        }
                    } catch (error) {
                        console.error('Erro ao resolver alerta:', error);
                    }
                }
            });
        }
    },

    add(type, message, data = null, isLocal = false) {
        const alertList = document.querySelector('.alert-list');
        if (!alertList) return;

        const alertData = {
            type,
            message,
            data
        };

        if (isLocal) {
            // Gera um ID temporário para alertas locais
            const tempId = 'local_' + Date.now();
            alertData.id = tempId;
            this.localAlerts.set(tempId, alertData);
        }

        this.createAlertElement(alertData, alertList, isLocal);
    }
};

// Expor o sistema de alertas para o escopo global
window.alerts = AlertSystem;

// Inicializar o sistema de alertas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar atualizações periódicas dos alertas
    setInterval(() => AlertSystem.fetch(), 2000);
    // Primeira atualização
    AlertSystem.fetch();
}); 