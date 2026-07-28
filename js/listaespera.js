// js/listaespera.js
import { reservationStorage } from './storage.js';

class WaitlistApp {
    constructor() {
        this.waitlistData = [];
        this.init();
    }

    init() {
        this.loadWaitlistData();
        this.renderWaitlistTable();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    loadWaitlistData() {
        // Carregar dados REAIS da lista de espera do storage
        let waitlistData = reservationStorage.getWaitlist();
        
        // Ordenar por data (mais próximas primeiro)
        this.waitlistData = this.sortWaitlistByDate(waitlistData);
        
        console.log('Dados da lista de espera carregados e ordenados:', this.waitlistData);
    }

    sortWaitlistByDate(waitlistData) {
        return waitlistData.sort((a, b) => {
            // Extrair a data da reserva do campo 'date' (formato: "DD/MM/YYYY - HH:MM")
            const dateA = this.extractReservationDate(a.date);
            const dateB = this.extractReservationDate(b.date);
            
            // Se as datas forem iguais, ordenar por horário
            if (dateA.getTime() === dateB.getTime()) {
                const timeA = this.extractReservationTime(a.date);
                const timeB = this.extractReservationTime(b.date);
                return timeA - timeB;
            }
            
            // Ordenar por data (mais próximas primeiro)
            return dateA - dateB;
        });
    }

    extractReservationDate(dateString) {
        if (!dateString) return new Date(0); // Retorna data mínima se não houver data
        
        try {
            // Formato esperado: "DD/MM/YYYY - HH:MM"
            const [datePart, timePart] = dateString.split(' - ');
            const [day, month, year] = datePart.split('/');
            const [hours, minutes] = timePart.split(':');
            
            return new Date(year, month - 1, day, hours, minutes);
        } catch (error) {
            console.error('Erro ao extrair data da reserva:', error, dateString);
            return new Date(0);
        }
    }

    extractReservationTime(dateString) {
        if (!dateString) return 0;
        
        try {
            const [datePart, timePart] = dateString.split(' - ');
            const [hours, minutes] = timePart.split(':');
            return parseInt(hours) * 60 + parseInt(minutes); // Retorna em minutos
        } catch (error) {
            return 0;
        }
    }

    renderWaitlistTable() {
        const tableBody = document.querySelector('.waitlist-body');
        tableBody.innerHTML = '';

        if (this.waitlistData.length === 0) {
            tableBody.innerHTML = `
                <tr class="waitlist-row">
                    <td class="waitlist-td" colspan="6" style="text-align: center; padding: 2rem; color: var(--dark-gray);">
                        Nenhuma reserva na lista de espera no momento
                    </td>
                </tr>
            `;
            return;
        }

        this.waitlistData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = 'waitlist-row';
            row.dataset.id = item.id;
            
            row.innerHTML = `
                <td class="waitlist-td">
                    <p class="position-number">${index + 1}</p>
                </td>
                <td class="waitlist-td">
                    <p class="student-name">${item.student}</p>
                    <small class="student-registration">${item.registration || 'N/A'}</small>
                </td>
                <td class="waitlist-td">
                    <p class="resource-name">${item.resource}</p>
                    <small class="user-type">${item.userType === 'docente' ? 'Docente' : 'Discente'}</small>
                </td>
                <td class="waitlist-td">
                    <p class="request-date">${this.formatDate(item.addedToWaitlistAt)}</p>
                    <small class="reservation-date">${item.date || ''}</small>
                </td>
                <td class="waitlist-td">
                    <p class="movie-name">${item.movie || 'N/A'}</p>
                </td>
                <td class="waitlist-td actions-cell">
                    <div class="actions-container">
                        <button class="checkin-button" data-id="${item.id}" title="Fazer Check-in">
                            <span class="material-symbols-outlined">login</span>
                            Check-in
                        </button>
                        <button class="details-button" data-id="${item.id}">Detalhes</button>
                        <button class="remove-button" data-id="${item.id}">Remover</button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        this.setupEventListeners();
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    formatReservationDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const [datePart, timePart] = dateString.split(' - ');
            const [day, month, year] = datePart.split('/');
            const date = new Date(year, month - 1, day);
            
            return {
                date: date.toLocaleDateString('pt-BR'),
                time: timePart,
                full: `${date.toLocaleDateString('pt-BR', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })} às ${timePart}`
            };
        } catch (error) {
            return {
                date: dateString,
                time: '',
                full: dateString
            };
        }
    }

    setupEventListeners() {
        // Event listeners para botões de check-in
        document.querySelectorAll('.checkin-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = button.dataset.id;
                const waitlistItem = this.waitlistData.find(item => item.id === itemId);
                if (waitlistItem) {
                    this.handleCheckin(waitlistItem);
                }
            });
        });

        // Event listeners para botões de detalhes
        document.querySelectorAll('.details-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = button.dataset.id;
                const waitlistItem = this.waitlistData.find(item => item.id === itemId);
                if (waitlistItem) {
                    this.showWaitlistDetails(waitlistItem);
                }
            });
        });

        // Event listeners para botões de remover
        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = button.dataset.id;
                const waitlistItem = this.waitlistData.find(item => item.id === itemId);
                if (waitlistItem) {
                    this.removeFromWaitlist(waitlistItem.id);
                }
            });
        });

        // Event listener para clicar na linha (opcional)
        document.querySelectorAll('.waitlist-row').forEach(row => {
            row.addEventListener('click', () => {
                const itemId = row.dataset.id;
                const waitlistItem = this.waitlistData.find(item => item.id === itemId);
                if (waitlistItem) {
                    this.showWaitlistDetails(waitlistItem);
                }
            });
        });
    }

    handleCheckin(waitlistItem) {
        // Salvar os dados da reserva selecionada no storage para usar no check-in
        const checkinData = {
            selectedReservation: waitlistItem,
            checkinTimestamp: new Date().toISOString()
        };
        
        // Salvar no localStorage para acessar na tela de check-in
        localStorage.setItem('cineplay_checkin_data', JSON.stringify(checkinData));
        
        // Navegar para a tela de check-in
        this.navigateToCheckin();
    }

    navigateToCheckin() {
        // Feedback visual antes do redirecionamento
        const checkinButtons = document.querySelectorAll('.checkin-button');
        checkinButtons.forEach(button => {
            button.disabled = true;
        });

        // Mostrar mensagem de redirecionamento
        this.showNotification('Redirecionando para check-in...', 'info');
        
        setTimeout(() => {
            window.location.href = 'checkin.html';
        }, 1000);
    }

    showWaitlistDetails(waitlistItem) {
        const formattedDate = this.formatReservationDate(waitlistItem.date);
        
        const modal = document.createElement('div');
        modal.className = 'waitlist-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Detalhes da Reserva - Posição ${this.waitlistData.findIndex(item => item.id === waitlistItem.id) + 1}</h3>
                <div class="details-list">
                    <div class="detail-item">
                        <strong>Aluno:</strong> ${waitlistItem.student}
                    </div>
                    <div class="detail-item">
                        <strong>Matrícula:</strong> ${waitlistItem.registration || 'N/A'}
                    </div>
                    <div class="detail-item">
                        <strong>Recurso:</strong> ${waitlistItem.resource}
                    </div>
                    <div class="detail-item">
                        <strong>Data da Reserva:</strong> ${formattedDate.full}
                    </div>
                    <div class="detail-item">
                        <strong>Data de Solicitação:</strong> ${this.formatDate(waitlistItem.addedToWaitlistAt)}
                    </div>
                    <div class="detail-item">
                        <strong>Filme:</strong> ${waitlistItem.movie || 'N/A'}
                    </div>
                    <div class="detail-item">
                        <strong>Tipo de Usuário:</strong> ${waitlistItem.userType === 'docente' ? 'Docente' : 'Discente'}
                    </div>
                    <div class="detail-item">
                        <strong>Status:</strong> <span class="status-waiting">Aguardando</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-button checkin-button-modal">
                        <span class="material-symbols-outlined">login</span>
                        Fazer Check-in
                    </button>
                    <button class="modal-button remove-button">Remover da Lista</button>
                    <button class="modal-button close-button">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const style = document.createElement('style');
        style.textContent = `
            .waitlist-modal {
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
            .waitlist-modal .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 0.5rem;
                max-width: 500px;
                width: 90%;
            }
            .waitlist-modal h3 {
                margin-bottom: 1.5rem;
                color: var(--primary-blue);
            }
            .details-list {
                margin: 1.5rem 0;
            }
            .detail-item {
                margin: 0.75rem 0;
                padding: 0.5rem;
                background: var(--light-gray);
                border-radius: 0.25rem;
                font-size: 0.9rem;
            }
            .status-waiting {
                color: var(--warning);
                font-weight: 600;
            }
            .modal-actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-top: 1.5rem;
            }
            .modal-button {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 0.25rem;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            .checkin-button-modal {
                background: var(--success);
                color: white;
            }
            .checkin-button-modal:hover {
                background: #218838;
            }
            .remove-button {
                background: var(--error);
                color: white;
            }
            .remove-button:hover {
                background: #c82333;
            }
            .close-button {
                background: var(--light-gray);
                color: var(--dark-gray);
            }
            .close-button:hover {
                background: #e0e0e0;
            }
        `;
        document.head.appendChild(style);
        
        modal.querySelector('.close-button').addEventListener('click', () => {
            this.closeModal(modal, style);
        });

        modal.querySelector('.remove-button').addEventListener('click', () => {
            this.removeFromWaitlist(waitlistItem.id, modal, style);
        });

        modal.querySelector('.checkin-button-modal').addEventListener('click', () => {
            this.handleCheckin(waitlistItem);
            this.closeModal(modal, style);
        });

        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal, style);
            }
        });
    }

    closeModal(modal, style) {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    }

    removeFromWaitlist(waitlistId, modal = null, style = null) {
        if (reservationStorage.removeFromWaitlist(waitlistId)) {
            this.showSuccessMessage('Reserva removida da lista de espera!');
            if (modal && style) {
                this.closeModal(modal, style);
            }
            this.loadWaitlistData();
            this.renderWaitlistTable();
        } else {
            this.showErrorMessage('Erro ao remover da lista de espera.');
        }
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
        
        let icon = 'check_circle';
        if (type === 'error') icon = 'error';
        if (type === 'info') icon = 'info';
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="material-symbols-outlined">${icon}</span>
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
            .info-notification {
                background: var(--primary-blue);
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

    startAutoRefresh() {
        // Atualizar a cada 30 segundos
        setInterval(() => {
            this.refreshWaitlistData();
        }, 30000);
    }

    refreshWaitlistData() {
        console.log('🔄 Atualizando lista de espera...');
        
        const table = document.querySelector('.waitlist-table');
        table.classList.add('loading');
        
        setTimeout(() => {
            this.loadWaitlistData();
            this.renderWaitlistTable();
            table.classList.remove('loading');
            console.log('✅ Lista de espera atualizada e ordenada');
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WaitlistApp();
});

console.log('🎬 Sistema de Lista de Espera carregado!');