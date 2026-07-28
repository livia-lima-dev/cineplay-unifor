// js/aprovacao.js
import { reservationStorage } from './storage.js';

class ApprovalApp {
    constructor() {
        this.pendingRequests = [];
        this.init();
    }

    init() {
        this.loadPendingRequests();
        this.renderApprovalTable();
        this.setupEventListeners();
    }

    loadPendingRequests() {
        this.pendingRequests = reservationStorage.getPendingReservations().filter(request => 
            request.status === 'pending'
        );
        
        console.log('Reservas pendentes carregadas:', this.pendingRequests);
    }

    renderApprovalTable() {
        const tableBody = document.querySelector('.approval-body');
        tableBody.innerHTML = '';
        
        if (this.pendingRequests.length === 0) {
            tableBody.innerHTML = `
                <tr class="approval-row">
                    <td class="approval-td" colspan="6" style="text-align: center; padding: 2rem; color: var(--dark-gray);">
                        Nenhuma reserva pendente de aprovação
                    </td>
                </tr>
            `;
            return;
        }

        this.pendingRequests.forEach(request => {
            const row = document.createElement('tr');
            row.className = 'approval-row';
            row.dataset.id = request.id;
            
            row.innerHTML = `
                <td class="approval-td">${request.name}</td>
                <td class="approval-td">${request.registration}</td>
                <td class="approval-td">${request.date}</td>
                <td class="approval-td">${request.room}</td>
                <td class="approval-td">${request.movie}</td>
                <td class="approval-td actions-cell">
                    <div class="actions-container">
                        <button class="approve-button">Aprovar</button>
                        <button class="cancel-button">Cancelar</button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.approve-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('.approval-row');
                const requestId = row.dataset.id;
                const request = this.pendingRequests.find(r => r.id === requestId);
                if (request) {
                    this.handleApprove(request, row);
                }
            });
        });

        document.querySelectorAll('.cancel-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('.approval-row');
                const requestId = row.dataset.id;
                const request = this.pendingRequests.find(r => r.id === requestId);
                if (request) {
                    this.handleCancel(request, row);
                }
            });
        });
    }

    handleApprove(request, row) {
        this.showConfirmationModal('aprovar', request, row);
    }

    handleCancel(request, row) {
        this.showConfirmationModal('cancelar', request, row);
    }

    showConfirmationModal(action, request, row) {
        const modal = document.createElement('div');
        modal.className = 'approval-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-icon">
                    <span class="material-symbols-outlined">
                        ${action === 'aprovar' ? 'check_circle' : 'cancel'}
                    </span>
                </div>
                <h3>Confirmar ${action === 'aprovar' ? 'Aprovação' : 'Cancelamento'}</h3>
                <div class="request-details">
                    <div class="detail-item">
                        <strong>Nome:</strong> ${request.name}
                    </div>
                    <div class="detail-item">
                        <strong>Matrícula:</strong> ${request.registration}
                    </div>
                    <div class="detail-item">
                        <strong>Data:</strong> ${request.date}
                    </div>
                    <div class="detail-item">
                        <strong>Sala:</strong> ${request.room}
                    </div>
                    ${request.movie !== '-' ? `
                    <div class="detail-item">
                        <strong>Filme:</strong> ${request.movie}
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <strong>Tipo:</strong> ${request.userType === 'docente' ? 'Docente' : 'Discente'}
                    </div>
                </div>
                <p class="confirmation-message">
                    Tem certeza que deseja ${action} esta reserva?
                </p>
                <div class="modal-actions">
                    <button class="modal-button cancel-action">Voltar</button>
                    <button class="modal-button confirm-action ${action === 'aprovar' ? 'approve-action' : 'cancel-modal-action'}">
                        ${action === 'aprovar' ? 'Aprovar' : 'Cancelar'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const style = document.createElement('style');
        style.textContent = `
            .approval-modal {
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
            .approval-modal .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 0.75rem;
                max-width: 450px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            .modal-icon {
                font-size: 4rem;
                color: ${action === 'aprovar' ? 'var(--success)' : 'var(--error)'};
                margin-bottom: 1rem;
            }
            .modal-icon .material-symbols-outlined {
                font-size: 4rem;
                font-variation-settings: 'FILL' 1;
            }
            .request-details {
                margin: 1.5rem 0;
                text-align: left;
            }
            .request-details .detail-item {
                margin: 0.5rem 0;
                padding: 0.5rem;
                background: var(--light-gray);
                border-radius: 0.25rem;
                font-size: 0.9rem;
            }
            .confirmation-message {
                color: var(--dark-gray);
                font-weight: 500;
                margin: 1.5rem 0;
                font-size: 1.1rem;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
            }
            .modal-button {
                flex: 1;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
                min-height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cancel-action {
                background: var(--light-gray);
                color: var(--dark-gray);
            }
            .cancel-action:hover {
                background: #e0e0e0;
            }
            .approve-action {
                background: var(--success);
                color: white;
            }
            .approve-action:hover {
                background: #218838;
            }
            .cancel-modal-action {
                background: var(--error);
                color: white;
            }
            .cancel-modal-action:hover {
                background: #c82333;
            }
        `;
        document.head.appendChild(style);
        
        modal.querySelector('.cancel-action').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.querySelector('.confirm-action').addEventListener('click', () => {
            this.processAction(action, request, row);
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
    }

    processAction(action, request, row) {
        row.classList.add('processing');
        row.style.opacity = '0.6';
        
        const actionsContainer = row.querySelector('.actions-container');
        actionsContainer.style.pointerEvents = 'none';
        
        setTimeout(() => {
            row.classList.remove('processing');
            row.style.opacity = '1';
            
            if (action === 'aprovar') {
                row.classList.add('approved', 'processed');
                
                // Mover para lista de espera
                const waitlistId = reservationStorage.approveAndMoveToWaitlist(request.id);
                
                if (waitlistId) {
                    this.showSuccessMessage('Reserva aprovada e adicionada à lista de espera!');
                    
                    // Redirecionar para lista de espera após 2 segundos
                    setTimeout(() => {
                        window.location.href = 'listaespera.html';
                    }, 2000);
                } else {
                    this.showErrorMessage('Erro ao adicionar à lista de espera.');
                }
                
            } else {
                row.classList.add('cancelled', 'processed');
                reservationStorage.updateReservationStatus(request.id, 'cancelled');
                this.showSuccessMessage('Reserva cancelada com sucesso!');
                
                setTimeout(() => {
                    row.remove();
                    this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
                    
                    if (this.pendingRequests.length === 0) {
                        this.renderApprovalTable();
                    }
                }, 2000);
            }
            
        }, 1500);
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}-notification`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="material-symbols-outlined">
                    ${type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1001;
                animation: slideIn 0.3s ease-out;
            }
            .success-notification {
                background: var(--success);
            }
            .error-notification {
                background: var(--error);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .notification-content .material-symbols-outlined {
                font-variation-settings: 'FILL' 1;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
                document.head.removeChild(style);
            }
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ApprovalApp();
});

console.log('🎬 Sistema de Aprovação de Reservas carregado!');