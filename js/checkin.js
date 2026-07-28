// js/checkin.js
// Funcionalidades para a página de check-in
class CheckinApp {
    constructor() {
        this.reservationData = null;
        this.init();
    }

    init() {
        this.loadReservationData();
        this.setupEventListeners();
        this.showUsageInstructions();
        this.addButtonStyles();
    }

    loadReservationData() {
        try {
            const checkinData = localStorage.getItem('cineplay_checkin_data');
            if (checkinData) {
                this.reservationData = JSON.parse(checkinData);
                console.log('Dados da reserva carregados:', this.reservationData);
                this.updateCheckinInfo();
            } else {
                console.log('Nenhum dado de reserva encontrado no localStorage');
                // Se não houver dados específicos, usar dados genéricos
                this.setupGenericCheckin();
            }
        } catch (error) {
            console.error('Erro ao carregar dados da reserva:', error);
            this.setupGenericCheckin();
        }
    }

    updateCheckinInfo() {
        if (this.reservationData && this.reservationData.selectedReservation) {
            const reservation = this.reservationData.selectedReservation;
            
            // Atualizar informações na tela de check-in
            const title = document.querySelector('.checkin-title');
            if (title) {
                title.innerHTML = `Check-in - ${reservation.resource}`;
            }
            
            const subtitle = document.querySelector('.checkin-subtitle');
            if (subtitle) {
                subtitle.innerHTML = `Check-in para <strong>${reservation.student}</strong><br>${reservation.resource} - ${reservation.date}`;
            }

            // Atualizar instruções com informações específicas
            this.updateInstructions(reservation);
        }
    }

    updateInstructions(reservation) {
        const instructions = document.querySelector('.usage-instructions');
        if (instructions) {
            instructions.innerHTML = `
                <div class="instructions-content">
                    <h4>Check-in para ${reservation.student}</h4>
                    <div class="reservation-details">
                        <p><strong>Recurso:</strong> ${reservation.resource}</p>
                        <p><strong>Data:</strong> ${reservation.date}</p>
                        <p><strong>Filme:</strong> ${reservation.movie || 'Não especificado'}</p>
                    </div>
                    <h4>Como fazer o check-in:</h4>
                    <ol>
                        <li>Abra a câmera do seu celular</li>
                        <li>Aponte para o QR Code acima</li>
                        <li>Aguarde o reconhecimento automático</li>
                        <li>Confirme o check-in quando solicitado</li>
                    </ol>
                </div>
            `;
        }
    }

    setupGenericCheckin() {
        console.log('Configurando check-in genérico');
        // Pode adicionar lógica para check-in sem reserva específica se necessário
    }

    addButtonStyles() {
        // Adicionar estilos específicos para o botão de checkout
        const style = document.createElement('style');
        style.textContent = `
            .checkout-nav-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: var(--primary-blue);
                color: white;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 500;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                text-decoration: none;
            }
            .checkout-nav-button:hover {
                background: var(--primary-blue-dark);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            .checkout-nav-button .material-symbols-outlined {
                font-size: 1.2rem;
            }
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }
            
            /* Estilos para informações da reserva */
            .reservation-details {
                background: rgba(255, 255, 255, 0.1);
                padding: 0.75rem;
                border-radius: 0.5rem;
                margin: 0.75rem 0;
                border-left: 4px solid var(--primary-blue);
            }
            
            .reservation-details p {
                margin: 0.25rem 0;
                font-size: 0.9rem;
            }
            
            @media (max-width: 768px) {
                .checkout-nav-button span:last-child {
                    display: none;
                }
                .checkout-nav-button {
                    padding: 0.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Adicionar interação com o QR Code
        const qrCode = document.querySelector('.qr-code-container');
        if (qrCode) {
            qrCode.addEventListener('click', () => {
                this.handleQRCodeClick();
            });
        }

        // Adicionar evento de teclado para acessibilidade
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('qr-code-container')) {
                    this.handleQRCodeClick();
                }
            }
        });
    }

    handleQRCodeClick() {
        // Simular scan do QR Code
        this.simulateQRScan();
    }

    simulateQRScan() {
        const qrContainer = document.querySelector('.qr-code-container');
        
        // Efeito visual de scan
        qrContainer.classList.add('checkin-scanning');
        
        // Adicionar estilos para animação de scan
        const scanStyle = document.createElement('style');
        scanStyle.textContent = `
            .checkin-scanning {
                position: relative;
                overflow: hidden;
            }
            .checkin-scanning::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                animation: scan 0.5s ease-in-out;
            }
            @keyframes scan {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        `;
        document.head.appendChild(scanStyle);
        
        setTimeout(() => {
            qrContainer.classList.remove('checkin-scanning');
            document.head.removeChild(scanStyle);
            
            // Mostrar modal de confirmação
            this.showCheckinConfirmationModal();
        }, 500);
    }

    showCheckinConfirmationModal() {
        const modal = document.createElement('div');
        modal.className = 'checkin-modal';
        
        let reservationInfo = '';
        if (this.reservationData && this.reservationData.selectedReservation) {
            const reservation = this.reservationData.selectedReservation;
            reservationInfo = `
                <div class="reservation-confirmation-info">
                    <p><strong>Aluno:</strong> ${reservation.student}</p>
                    <p><strong>Recurso:</strong> ${reservation.resource}</p>
                    <p><strong>Data:</strong> ${reservation.date}</p>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="checkin-icon">
                    <span class="material-symbols-outlined">login</span>
                </div>
                <h3>Confirmar Check-in</h3>
                ${reservationInfo}
                <p class="confirmation-message">Tem certeza que deseja fazer o check-in na sala?</p>
                <div class="modal-actions">
                    <button class="modal-button cancel-button">Cancelar</button>
                    <button class="modal-button confirm-button">Confirmar Check-in</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .checkin-modal {
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
            .checkin-modal .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 0.75rem;
                max-width: 400px;
                width: 90%;
                text-align: center;
            }
            .checkin-icon {
                font-size: 4rem;
                color: var(--primary-blue);
                margin-bottom: 1rem;
            }
            .checkin-icon .material-symbols-outlined {
                font-size: 4rem;
                font-variation-settings: 'FILL' 1;
            }
            .reservation-confirmation-info {
                background: var(--light-gray);
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 1rem 0;
                text-align: left;
            }
            .reservation-confirmation-info p {
                margin: 0.5rem 0;
                font-size: 0.9rem;
            }
            .confirmation-message {
                color: var(--dark-gray);
                font-weight: 500;
                margin: 1rem 0 2rem 0;
                font-size: 1.1rem;
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
                transition: all 0.2s;
                min-height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cancel-button {
                background: var(--light-gray);
                color: var(--dark-gray);
            }
            .cancel-button:hover {
                background: #e0e0e0;
            }
            .confirm-button {
                background: var(--primary-blue);
                color: white;
            }
            .confirm-button:hover {
                background: var(--primary-blue-dark);
            }
        `;
        document.head.appendChild(style);
        
        // Ações dos botões
        modal.querySelector('.cancel-button').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.querySelector('.confirm-button').addEventListener('click', () => {
            this.processCheckin();
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        // Fechar modal ao pressionar ESC
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.head.removeChild(style);
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);

        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
                document.removeEventListener('keydown', handleEscKey);
            }
        });
    }

    processCheckin() {
        // Simular processamento do check-in
        const qrContainer = document.querySelector('.qr-code-container');
        if (qrContainer) {
            qrContainer.style.opacity = '0.6';
            qrContainer.style.pointerEvents = 'none';
        }
        
        // Mostrar loading
        this.showProcessingIndicator();
        
        // Simular delay de processamento
        setTimeout(() => {
            this.showCheckinSuccessModal();
            if (qrContainer) {
                qrContainer.style.opacity = '1';
                qrContainer.style.pointerEvents = 'auto';
            }
            
            // Registrar o check-in no sistema
            this.registerCheckinInSystem();
        }, 2000);
    }

    showProcessingIndicator() {
        const processing = document.createElement('div');
        processing.className = 'processing-overlay';
        processing.innerHTML = `
            <div class="processing-content">
                <div class="spinner"></div>
                <p>Processando check-in...</p>
            </div>
        `;
        
        const checkinContent = document.querySelector('.checkin-content');
        if (checkinContent) {
            checkinContent.appendChild(processing);
        }
        
        // Estilos do processing
        const style = document.createElement('style');
        style.textContent = `
            .processing-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                border-radius: 1rem;
            }
            .processing-content {
                text-align: center;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--light-gray);
                border-left: 4px solid var(--primary-blue);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Remover após uso
        setTimeout(() => {
            if (processing.parentNode) {
                processing.remove();
                document.head.removeChild(style);
            }
        }, 2000);
    }

    registerCheckinInSystem() {
        // Registrar o check-in no localStorage ou sistema
        try {
            const checkinRecord = {
                reservation: this.reservationData ? this.reservationData.selectedReservation : null,
                checkinTime: new Date().toISOString(),
                status: 'checked-in'
            };
            
            // Salvar no histórico de check-ins
            let checkinHistory = JSON.parse(localStorage.getItem('cineplay_checkin_history') || '[]');
            checkinHistory.push(checkinRecord);
            localStorage.setItem('cineplay_checkin_history', JSON.stringify(checkinHistory));
            
            console.log('Check-in registrado no sistema:', checkinRecord);
            
            // Atualizar status na lista de espera se aplicável
            if (this.reservationData && this.reservationData.selectedReservation) {
                this.updateWaitlistStatus(this.reservationData.selectedReservation.id);
            }
        } catch (error) {
            console.error('Erro ao registrar check-in no sistema:', error);
        }
    }

    updateWaitlistStatus(reservationId) {
        // Atualizar o status da reserva na lista de espera
        try {
            let waitlist = JSON.parse(localStorage.getItem('cineplay_waitlist') || '[]');
            const reservationIndex = waitlist.findIndex(item => item.id === reservationId);
            
            if (reservationIndex !== -1) {
                waitlist[reservationIndex].checkinTime = new Date().toISOString();
                waitlist[reservationIndex].status = 'checked-in';
                localStorage.setItem('cineplay_waitlist', JSON.stringify(waitlist));
                console.log('Status da reserva atualizado para checked-in');
            }
        } catch (error) {
            console.error('Erro ao atualizar status da lista de espera:', error);
        }
    }

    showCheckinSuccessModal() {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        
        let successMessage = 'Acesso à sala liberado. Bom filme!';
        if (this.reservationData && this.reservationData.selectedReservation) {
            const reservation = this.reservationData.selectedReservation;
            successMessage = `Check-in realizado para ${reservation.student} na ${reservation.resource}. Bom filme!`;
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">
                    <span class="material-symbols-outlined">check_circle</span>
                </div>
                <h3>Check-in Realizado!</h3>
                <p class="success-message">${successMessage}</p>
                <div class="success-actions">
                    <button class="modal-button checkout-button" onclick="window.location.href='checkout.html'">
                        <span class="material-symbols-outlined">logout</span>
                        Ir para Check-out
                    </button>
                    <button class="modal-close">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Estilos do modal de sucesso
        const style = document.createElement('style');
        style.textContent = `
            .success-modal {
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
            .success-modal .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 0.75rem;
                max-width: 400px;
                width: 90%;
                text-align: center;
            }
            .success-icon {
                font-size: 4rem;
                color: var(--success);
                margin-bottom: 1rem;
            }
            .success-icon .material-symbols-outlined {
                font-size: 4rem;
                font-variation-settings: 'FILL' 1;
            }
            .success-message {
                color: var(--success);
                font-weight: 600;
                margin: 1rem 0 2rem 0;
                font-size: 1.1rem;
                line-height: 1.4;
            }
            .success-actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .checkout-button {
                background: var(--primary-blue);
                color: white;
                border: none;
                border-radius: 0.5rem;
                padding: 0.75rem 1.5rem;
                cursor: pointer;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.2s;
            }
            .checkout-button:hover {
                background: var(--primary-blue-dark);
            }
            .success-modal .modal-close {
                padding: 0.75rem 1.5rem;
                background: var(--light-gray);
                color: var(--dark-gray);
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }
            .success-modal .modal-close:hover {
                background: #e0e0e0;
            }
        `;
        document.head.appendChild(style);
        
        // Fechar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        // Auto-fechar após 8 segundos
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        }, 8000);
    }

    showUsageInstructions() {
        // Adicionar instruções de uso abaixo do QR Code
        const instructions = document.createElement('div');
        instructions.className = 'usage-instructions';
        
        let initialContent = `
            <div class="instructions-content">
                <h4>Como fazer o check-in:</h4>
                <ol>
                    <li>Abra a câmera do seu celular</li>
                    <li>Aponte para o QR Code acima</li>
                    <li>Aguarde o reconhecimento automático</li>
                    <li>Confirme o check-in quando solicitado</li>
                </ol>
            </div>
        `;
        
        instructions.innerHTML = initialContent;
        
        const checkinContent = document.querySelector('.checkin-content');
        if (checkinContent) {
            checkinContent.appendChild(instructions);
        }
        
        // Estilos das instruções
        const style = document.createElement('style');
        style.textContent = `
            .usage-instructions {
                margin-top: 2rem;
                padding: 1rem;
                background: var(--light-blue);
                border-radius: 0.5rem;
                max-width: 400px;
            }
            .instructions-content h4 {
                margin: 0 0 0.5rem 0;
                color: var(--dark-blue);
                font-weight: 600;
            }
            .instructions-content ol {
                margin: 0;
                padding-left: 1.5rem;
                color: var(--dark-gray);
            }
            .instructions-content li {
                margin: 0.25rem 0;
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new CheckinApp();
});

console.log('🎬 Sistema de Check-in carregado!');