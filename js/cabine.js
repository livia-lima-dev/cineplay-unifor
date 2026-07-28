// js/cabine.js
import { reservationStorage } from './storage.js';

// Funcionalidades para a página de cabines
class CabineApp {
    constructor() {
        this.cabines = [];
        
        // Verificar se há dados de mídia e se é discente
        this.checkUserAndData();
        this.init();
    }

    checkUserAndData() {
        const userType = reservationStorage.getUserType();
        const reservationData = reservationStorage.getReservationData();
        
        if (!reservationData.selectedMedia) {
            // Se não há mídia selecionada, voltar para tela de mídia
            alert('Por favor, selecione uma mídia primeiro.');
            setTimeout(() => {
                window.location.href = 'midia.html';
            }, 2000);
            return;
        }

        if (userType === 'docente') {
            // Se é docente, redirecionar para tela de lote
            alert('Docentes devem usar a reserva em lote. Redirecionando...');
            setTimeout(() => {
                window.location.href = 'cabinelote.html';
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
                    <h3>Reserva Individual - Discente</h3>
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
            
            // Adicionar estilos padronizados
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
        this.loadCabines();
        this.setupEventListeners();
    }

    loadCabines() {
        // Simular carregamento de dados
        this.cabines = [
            { id: 1, name: 'Auditório 1', type: 'auditorio', capacity: 50 },
            { id: 2, name: 'Auditório 2', type: 'auditorio', capacity: 30 },
            { id: 3, name: 'Cabine 1', type: 'cabine', capacity: 4 },
            { id: 4, name: 'Cabine 2', type: 'cabine', capacity: 4 },
            { id: 5, name: 'Sala de Reunião', type: 'sala', capacity: 10 },
            { id: 6, name: 'Estúdio de Gravação', type: 'estudio', capacity: 8 }
        ];
    }

    setupEventListeners() {
        // Botões de reserva
        document.addEventListener('click', (e) => {
            if (e.target.closest('.reserve-button')) {
                this.handleReserve(e);
            }
        });
    }

    handleReserve(event) {
        const cabineItem = event.target.closest('.cabine-item');
        const cabineName = cabineItem.querySelector('.cabine-name').textContent;
        
        // Salvar a cabine selecionada no storage
        const cabineData = {
            selectedCabine: cabineName
        };
        reservationStorage.saveReservationData(cabineData);
        
        // Mostrar popup de confirmação
        this.showConfirmationPopup(cabineName);
    }

    showConfirmationPopup(cabineName) {
        const reservationData = reservationStorage.getReservationData();
        const formattedData = reservationStorage.getFormattedReservationData();

        // Criar popup de confirmação
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Confirmação de Reserva</h3>
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
                        <span class="summary-label">Cabine/Sala:</span>
                        <span class="summary-value">${cabineName}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Tipo de Usuário:</span>
                        <span class="summary-value">Discente</span>
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
                align-items: center;
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
            }
            .summary-value {
                color: var(--dark-gray);
                font-weight: 400;
                text-align: right;
                font-size: 0.95rem;
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
    new CabineApp();
});

console.log('🎬 Sistema de Reserva de Cabines carregado!');