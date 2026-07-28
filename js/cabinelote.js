// js/cabinelote.js
import { reservationStorage } from './storage.js';

// Funcionalidades para a página de reserva em lote
class BatchReservationApp {
    constructor() {
        this.selectedCabines = [];
        
        // Verificar se é docente
        this.checkUserType();
        this.init();
    }

    checkUserType() {
        const userType = reservationStorage.getUserType();
        
        if (userType !== 'docente') {
            // Se não é docente, redirecionar para tela de cabine normal
            alert('Acesso restrito a docentes. Redirecionando para reserva individual...');
            setTimeout(() => {
                window.location.href = 'cabine.html';
            }, 2000);
            return;
        }

        // Mostrar resumo da reserva
        this.displayReservationSummary();
    }

    displayReservationSummary() {
        const reservationData = reservationStorage.getReservationData();
        const formattedData = reservationStorage.getFormattedReservationData();
        
        const summaryElement = document.getElementById('reservation-summary');
        
        if (reservationData.selectedMedia && formattedData) {
            summaryElement.innerHTML = `
                <div class="reservation-info-header">
                    <h3>Reserva em Lote - Docente</h3>
                    <div class="reservation-details">
                        <div class="detail-item">
                            <span class="detail-label">Mídia:</span>
                            <span class="detail-value">${reservationData.selectedMedia}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Data e Horário:</span>
                            <span class="detail-value">${formattedData.date} às ${formattedData.time}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Adicionar estilos
            const style = document.createElement('style');
            style.textContent = `
                .reservation-info-header {
                    background: var(--light-blue);
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    margin-bottom: 2rem;
                    border-left: 4px solid var(--primary-blue);
                }
                .reservation-info-header h3 {
                    color: var(--primary-blue);
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                }
                .reservation-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .detail-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                }
                .detail-label {
                    color: var(--dark-blue);
                    font-weight: 500;
                    min-width: 120px;
                    font-size: 0.9rem;
                }
                .detail-value {
                    color: var(--dark-gray);
                    font-weight: 400;
                    flex: 1;
                    font-size: 0.9rem;
                }
                @media (max-width: 768px) {
                    .detail-item {
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                    .detail-label {
                        min-width: auto;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    init() {
        this.setupEventListeners();
        this.updateConfirmButton();
    }

    setupEventListeners() {
        // Checkboxes
        document.querySelectorAll('.batch-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleCheckboxChange(e);
            });
        });

        // Labels (para clicar em qualquer lugar do item)
        document.querySelectorAll('.batch-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Evitar duplicação quando clicar diretamente no checkbox
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('.batch-checkbox');
                    checkbox.checked = !checkbox.checked;
                    this.handleCheckboxChange({ target: checkbox });
                }
            });
        });

        // Botão de confirmação
        document.getElementById('confirm-batch-btn').addEventListener('click', () => {
            this.handleBatchReservation();
        });
    }

    handleCheckboxChange(event) {
        const checkbox = event.target;
        const batchItem = checkbox.closest('.batch-item');
        const cabineName = batchItem.querySelector('.batch-name').textContent;

        if (checkbox.checked) {
            this.selectedCabines.push(cabineName);
            batchItem.classList.add('selected');
        } else {
            this.selectedCabines = this.selectedCabines.filter(name => name !== cabineName);
            batchItem.classList.remove('selected');
        }

        this.updateConfirmButton();
    }

    updateConfirmButton() {
        const confirmButton = document.getElementById('confirm-batch-btn');
        
        if (this.selectedCabines.length > 0) {
            confirmButton.disabled = false;
            confirmButton.querySelector('.button-text').textContent = 
                `Confirmar Reserva em Lote (${this.selectedCabines.length})`;
        } else {
            confirmButton.disabled = true;
            confirmButton.querySelector('.button-text').textContent = 'Confirmar Reserva em Lote';
        }
    }

    handleBatchReservation() {
        if (this.selectedCabines.length === 0) {
            alert('Por favor, selecione pelo menos uma cabine para reservar.');
            return;
        }

        // Salvar cabines selecionadas no storage
        const cabineData = {
            selectedCabines: this.selectedCabines,
            selectedCabine: this.selectedCabines.join(', ') // Para compatibilidade
        };
        reservationStorage.saveReservationData(cabineData);

        // Mostrar popup de confirmação
        this.showConfirmationPopup();
    }

    showConfirmationPopup() {
        const reservationData = reservationStorage.getReservationData();
        const formattedData = reservationStorage.getFormattedReservationData();

        const cabinesList = this.selectedCabines.map(cabine => `• ${cabine}`).join('<br>');

        // Criar popup de confirmação
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Confirmação de Reserva em Lote</h3>
                <div class="reservation-summary">
                    <div class="summary-item">
                        <span class="summary-label">Mídia:</span>
                        <span class="summary-value">${reservationData.selectedMedia}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Data e Horário:</span>
                        <span class="summary-value">${formattedData.date} às ${formattedData.time}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Cabines Selecionadas:</span>
                        <div class="summary-value">
                            ${cabinesList}
                            <div style="margin-top: 0.5rem; font-weight: 500;">
                                Total: ${this.selectedCabines.length} cabine(s)
                            </div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Tipo de Usuário:</span>
                        <span class="summary-value">Docente</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-button cancel-button">Cancelar</button>
                    <button class="modal-button confirm-button">Confirmar Reserva</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .confirmation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .confirmation-modal .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 0.75rem;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            .confirmation-modal h3 {
                color: var(--primary-blue);
                margin: 0 0 1.5rem 0;
                font-size: 1.5rem;
                font-weight: 600;
            }
            .reservation-summary {
                background: var(--light-blue);
                padding: 1.5rem;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
                border-left: 4px solid var(--primary-blue);
            }
            .summary-item {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
                padding: 0.5rem 0;
            }
            .summary-item:last-child {
                margin-bottom: 0;
            }
            .summary-label {
                color: var(--dark-blue);
                font-weight: 500;
                text-align: left;
                font-size: 0.95rem;
                min-width: 140px;
            }
            .summary-value {
                color: var(--dark-gray);
                font-weight: 400;
                text-align: right;
                font-size: 0.95rem;
                flex: 1;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
            }
            .modal-button {
                flex: 1;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95rem;
                transition: all 0.3s ease;
                min-height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cancel-button {
                background: white;
                color: var(--dark-gray);
                border: 2px solid var(--light-gray);
            }
            .cancel-button:hover {
                background: var(--light-gray);
                border-color: var(--gray);
            }
            .confirm-button {
                background: var(--primary-blue);
                color: white;
                border: 2px solid var(--primary-blue);
            }
            .confirm-button:hover {
                background: var(--primary-blue-dark);
                border-color: var(--primary-blue-dark);
            }
            @media (max-width: 768px) {
                .modal-actions {
                    flex-direction: column;
                }
                .summary-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.25rem;
                }
                .summary-value {
                    text-align: left;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Event listeners para os botões
        modal.querySelector('.cancel-button').addEventListener('click', () => {
            // Fechar modal sem fazer nada
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.querySelector('.confirm-button').addEventListener('click', () => {
            // Confirmar reserva e navegar para aprovação
            this.confirmReservation();
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
    }

    confirmReservation() {
        // Gerar dados para aprovação
        const approvalData = reservationStorage.generateApprovalData();
        
        if (!approvalData) {
            alert('Erro ao gerar dados da reserva. Por favor, tente novamente.');
            return;
        }

        // Salvar reserva pendente
        const reservationId = reservationStorage.addPendingReservation(approvalData);
        
        if (reservationId) {
            // Salvar status de confirmação
            const confirmationData = {
                reservationStatus: 'pending',
                reservationConfirmed: true,
                reservationId: reservationId,
                confirmationTimestamp: new Date().toISOString()
            };
            reservationStorage.saveReservationData(confirmationData);
            
            // Navegar para tela de aprovação
            setTimeout(() => {
                window.location.href = 'aprovacao.html';
            }, 500);
        } else {
            alert('Erro ao salvar reserva. Por favor, tente novamente.');
        }
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new BatchReservationApp();
});

console.log('🎬 Sistema de Reserva em Lote carregado!');