// js/checkout.js
// Funcionalidades para a página de check-out
class CheckoutApp {
    constructor() {
        this.reservationData = null;
        this.checkinData = null;
        this.init();
    }

    init() {
        this.loadReservationData();
        this.setupEventListeners();
        this.showUsageInstructions();
        this.updateCheckoutInfo();
    }

    loadReservationData() {
        try {
            // Primeiro tenta carregar dados específicos do check-out
            const checkoutData = localStorage.getItem('cineplay_checkout_data');
            if (checkoutData) {
                this.reservationData = JSON.parse(checkoutData);
                console.log('Dados da reserva (checkout) carregados:', this.reservationData);
            } else {
                // Se não houver dados específicos, tenta usar os dados do check-in
                const checkinData = localStorage.getItem('cineplay_checkin_data');
                if (checkinData) {
                    this.checkinData = JSON.parse(checkinData);
                    this.reservationData = this.checkinData;
                    console.log('Dados da reserva (checkin) carregados:', this.reservationData);
                } else {
                    console.log('Nenhum dado de reserva encontrado para check-out');
                    this.setupGenericCheckout();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados da reserva:', error);
            this.setupGenericCheckout();
        }
    }

    updateCheckoutInfo() {
        if (this.reservationData && this.reservationData.selectedReservation) {
            const reservation = this.reservationData.selectedReservation;
            
            // Atualizar informações na tela de check-out
            const title = document.querySelector('.checkout-title');
            if (title) {
                title.innerHTML = `Check-out - ${reservation.resource}`;
            }
            
            const subtitle = document.querySelector('.checkout-subtitle');
            if (subtitle) {
                subtitle.innerHTML = `Check-out para <strong>${reservation.student}</strong><br>${reservation.resource} - ${reservation.date}`;
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
                    <h4>Check-out para ${reservation.student}</h4>
                    <div class="reservation-details">
                        <p><strong>Recurso:</strong> ${reservation.resource}</p>
                        <p><strong>Data:</strong> ${reservation.date}</p>
                        <p><strong>Filme:</strong> ${reservation.movie || 'Não especificado'}</p>
                        ${this.checkinData ? `<p><strong>Check-in:</strong> ${this.formatTime(this.checkinData.checkinTimestamp)}</p>` : ''}
                    </div>
                    <h4>Como fazer o check-out:</h4>
                    <ol>
                        <li>Abra a câmera do seu celular</li>
                        <li>Aponte para o QR Code acima</li>
                        <li>Aguarde o reconhecimento automático</li>
                        <li>Confirme o check-out quando solicitado</li>
                    </ol>
                </div>
            `;
        }
    }

    formatTime(timestamp) {
        if (!timestamp) return 'Não registrado';
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            return 'Horário inválido';
        }
    }

    setupGenericCheckout() {
        console.log('Configurando check-out genérico');
        // Pode adicionar lógica para check-out sem reserva específica se necessário
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
        qrContainer.classList.add('checkout-scanning');
        
        // Adicionar estilos para animação de scan
        const scanStyle = document.createElement('style');
        scanStyle.textContent = `
            .checkout-scanning {
                position: relative;
                overflow: hidden;
            }
            .checkout-scanning::after {
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
            qrContainer.classList.remove('checkout-scanning');
            document.head.removeChild(scanStyle);
            
            // Mostrar modal de confirmação
            this.showCheckoutConfirmationModal();
        }, 500);
    }

    showCheckoutConfirmationModal() {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        
        let reservationInfo = '';
        if (this.reservationData && this.reservationData.selectedReservation) {
            const reservation = this.reservationData.selectedReservation;
            reservationInfo = `
                <div class="reservation-confirmation-info">
                    <p><strong>Aluno:</strong> ${reservation.student}</p>
                    <p><strong>Recurso:</strong> ${reservation.resource}</p>
                    <p><strong>Data:</strong> ${reservation.date}</p>
                    ${this.checkinData ? `<p><strong>Check-in realizado:</strong> ${this.formatTime(this.checkinData.checkinTimestamp)}</p>` : ''}
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="checkout-icon">
                    <span class="material-symbols-outlined">logout</span>
                </div>
                <h3>Confirmar Check-out</h3>
                ${reservationInfo}
                <p class="confirmation-message">Tem certeza que deseja fazer o check-out da sala?</p>
                <div class="modal-actions">
                    <button class="modal-button cancel-button">Cancelar</button>
                    <button class="modal-button confirm-button">Confirmar Check-out</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .checkout-modal {
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
            .checkout-modal .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 0.75rem;
                max-width: 400px;
                width: 90%;
                text-align: center;
            }
            .checkout-icon {
                font-size: 4rem;
                color: var(--warning);
                margin-bottom: 1rem;
            }
            .checkout-icon .material-symbols-outlined {
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
            this.processCheckout();
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

    processCheckout() {
        // Simular processamento do check-out
        const qrContainer = document.querySelector('.qr-code-container');
        if (qrContainer) {
            qrContainer.style.opacity = '0.6';
            qrContainer.style.pointerEvents = 'none';
        }
        
        // Mostrar loading
        this.showProcessingIndicator();
        
        // Simular delay de processamento
        setTimeout(() => {
            this.showCheckoutSuccessModal();
            if (qrContainer) {
                qrContainer.style.opacity = '1';
                qrContainer.style.pointerEvents = 'auto';
            }
            
            // Registrar o check-out no sistema
            this.registerCheckoutInSystem();
        }, 2000);
    }

    showProcessingIndicator() {
        const processing = document.createElement('div');
        processing.className = 'processing-overlay';
        processing.innerHTML = `
            <div class="processing-content">
                <div class="spinner"></div>
                <p>Processando check-out...</p>
            </div>
        `;
        
        const checkoutContent = document.querySelector('.checkout-content');
        if (checkoutContent) {
            checkoutContent.appendChild(processing);
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

    registerCheckoutInSystem() {
        // Registrar o check-out no localStorage ou sistema
        try {
            const checkoutRecord = {
                reservation: this.reservationData ? this.reservationData.selectedReservation : null,
                checkinTime: this.checkinData ? this.checkinData.checkinTimestamp : null,
                checkoutTime: new Date().toISOString(),
                status: 'checked-out'
            };
            
            // Salvar no histórico de check-outs
            let checkoutHistory = JSON.parse(localStorage.getItem('cineplay_checkout_history') || '[]');
            checkoutHistory.push(checkoutRecord);
            localStorage.setItem('cineplay_checkout_history', JSON.stringify(checkoutHistory));
            
            console.log('Check-out registrado no sistema:', checkoutRecord);
            
            // Atualizar status na lista de espera se aplicável
            if (this.reservationData && this.reservationData.selectedReservation) {
                this.updateWaitlistStatus(this.reservationData.selectedReservation.id);
            }
            
            // Limpar dados temporários
            this.cleanupTemporaryData();
        } catch (error) {
            console.error('Erro ao registrar check-out no sistema:', error);
        }
    }

    updateWaitlistStatus(reservationId) {
        // Atualizar o status da reserva na lista de espera
        try {
            let waitlist = JSON.parse(localStorage.getItem('cineplay_waitlist') || '[]');
            const reservationIndex = waitlist.findIndex(item => item.id === reservationId);
            
            if (reservationIndex !== -1) {
                waitlist[reservationIndex].checkoutTime = new Date().toISOString();
                waitlist[reservationIndex].status = 'checked-out';
                waitlist[reservationIndex].completed = true;
                localStorage.setItem('cineplay_waitlist', JSON.stringify(waitlist));
                console.log('Status da reserva atualizado para checked-out');
            }
        } catch (error) {
            console.error('Erro ao atualizar status da lista de espera:', error);
        }
    }

    cleanupTemporaryData() {
        // Limpar dados temporários do check-in/check-out
        try {
            localStorage.removeItem('cineplay_checkin_data');
            localStorage.removeItem('cineplay_checkout_data');
            console.log('Dados temporários de check-in/check-out limpos');
        } catch (error) {
            console.error('Erro ao limpar dados temporários:', error);
        }
    }

    showCheckoutSuccessModal() {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        
        let successMessage = 'Sala liberada com sucesso. Obrigado!';
        let durationInfo = '';
        
        if (this.reservationData && this.reservationData.selectedReservation) {
            const reservation = this.reservationData.selectedReservation;
            successMessage = `Check-out realizado para ${reservation.student} na ${reservation.resource}.`;
            
            // Calcular duração se houver dados de check-in
            if (this.checkinData && this.checkinData.checkinTimestamp) {
                const checkinTime = new Date(this.checkinData.checkinTimestamp);
                const checkoutTime = new Date();
                const duration = Math.round((checkoutTime - checkinTime) / (1000 * 60)); // em minutos
                durationInfo = `<p class="duration-info">Duração da sessão: ${duration} minutos</p>`;
            }
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">
                    <span class="material-symbols-outlined">check_circle</span>
                </div>
                <h3>Check-out Realizado!</h3>
                <p class="success-message">${successMessage}</p>
                ${durationInfo}
                <div class="success-actions">
                    <button class="modal-button back-button" onclick="window.location.href='listaespera.html'">
                        <span class="material-symbols-outlined">list</span>
                        Voltar para Lista
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
                margin: 1rem 0 1rem 0;
                font-size: 1.1rem;
                line-height: 1.4;
            }
            .duration-info {
                color: var(--dark-gray);
                font-weight: 500;
                margin: 0.5rem 0 1.5rem 0;
                font-size: 0.9rem;
            }
            .success-actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .back-button {
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
            .back-button:hover {
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
                <h4>Como fazer o check-out:</h4>
                <ol>
                    <li>Abra a câmera do seu celular</li>
                    <li>Aponte para o QR Code acima</li>
                    <li>Aguarde o reconhecimento automático</li>
                    <li>Confirme o check-out quando solicitado</li>
                </ol>
            </div>
        `;
        
        instructions.innerHTML = initialContent;
        
        const checkoutContent = document.querySelector('.checkout-content');
        if (checkoutContent) {
            checkoutContent.appendChild(instructions);
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
        `;
        document.head.appendChild(style);
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutApp();
});

console.log('🎬 Sistema de Check-out carregado!');