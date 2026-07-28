// js/dia.js
import { reservationStorage } from './storage.js';

// Configuração do calendário
class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.reservedDates = ['2024-10-01', '2024-10-10', '2024-10-15'];
        
        // Carregar dados salvos se existirem
        this.loadSavedData();
        this.init();
    }

    loadSavedData() {
        const savedData = reservationStorage.getReservationData();
        if (savedData.selectedDate) {
            this.selectedDate = new Date(savedData.selectedDate);
        }
    }

    init() {
        this.renderCalendar();
        this.setupEventListeners();
        this.updateReservationInfo();
        
        // Preencher horário salvo se existir
        const savedData = reservationStorage.getReservationData();
        if (savedData.selectedTime) {
            document.getElementById('time-select').value = savedData.selectedTime;
        }

        // Verificar se já existe mídia selecionada
        this.checkMediaSelection();
    }

    checkMediaSelection() {
        const hasMedia = reservationStorage.hasMediaData();
        if (!hasMedia) {
            console.warn('Nenhuma mídia selecionada. O usuário veio diretamente para esta tela.');
            // Podemos adicionar um aviso visual se necessário
        }
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYearElement = document.getElementById('current-month');
        
        // Limpar calendário anterior
        calendarGrid.innerHTML = '';
        
        // Adicionar dias da semana
        const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        weekdays.forEach(day => {
            const dayElement = document.createElement('p');
            dayElement.className = 'weekday';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });

        // Configurar datas
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Primeiro dia do mês
        const firstDay = new Date(year, month, 1);
        // Último dia do mês
        const lastDay = new Date(year, month + 1, 0);
        // Dia da semana do primeiro dia (0 = Domingo, 6 = Sábado)
        const firstDayOfWeek = firstDay.getDay();
        
        // Atualizar cabeçalho do mês/ano
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        monthYearElement.textContent = `${monthNames[month]} ${year}`;

        // Adicionar dias vazios no início
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Adicionar dias do mês
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateString = this.formatDate(date);
            const isReserved = this.reservedDates.includes(dateString);
            const isToday = this.isToday(date);
            const isPast = date < today && !isToday;
            const isSelected = this.selectedDate && this.formatDate(this.selectedDate) === dateString;

            const dayElement = document.createElement('button');
            dayElement.className = 'day';
            
            if (isPast) {
                dayElement.className += ' past-day';
                dayElement.disabled = true;
            } else if (isReserved) {
                dayElement.className += ' unavailable';
                dayElement.disabled = true;
            } else if (isToday) {
                dayElement.className += ' today';
            } else {
                dayElement.className += ' available';
            }

            if (isSelected) {
                dayElement.className += ' selected';
            }

            dayElement.innerHTML = `<div class="day-content">${day}</div>`;
            
            if (!isPast && !isReserved) {
                dayElement.addEventListener('click', () => this.selectDate(date));
            }

            calendarGrid.appendChild(dayElement);
        }

        this.updateNavigationButtons();
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    updateNavigationButtons() {
        const prevButton = document.querySelector('.prev-month');
        const nextButton = document.querySelector('.next-month');
        
        const today = new Date();
        const currentMonthStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        prevButton.disabled = currentMonthStart <= todayMonthStart;
        nextButton.disabled = false;
        
        if (prevButton.disabled) {
            prevButton.style.opacity = '0.5';
            prevButton.style.cursor = 'not-allowed';
        } else {
            prevButton.style.opacity = '1';
            prevButton.style.cursor = 'pointer';
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        
        // Salvar data selecionada no storage
        reservationStorage.saveReservationData({
            selectedDate: date.toISOString()
        });
        
        this.renderCalendar();
        this.updateReservationInfo();
    }

    setupEventListeners() {
        document.querySelector('.prev-month').addEventListener('click', () => {
            if (!document.querySelector('.prev-month').disabled) {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            }
        });

        document.querySelector('.next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.getElementById('time-select').addEventListener('change', (e) => {
            // Salvar horário selecionado no storage
            reservationStorage.saveReservationData({
                selectedTime: e.target.value
            });
            this.updateReservationInfo();
        });

        document.getElementById('confirm-btn').addEventListener('click', () => {
            this.confirmReservation();
        });

        document.getElementById('new-reservation-btn').addEventListener('click', () => {
            this.resetReservation();
        });
    }

    updateReservationInfo() {
        const selectedDateElement = document.getElementById('selected-date');
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const confirmButton = document.getElementById('confirm-btn');
        const timeSelect = document.getElementById('time-select');

        if (this.selectedDate) {
            const dateString = this.selectedDate.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            selectedDateElement.textContent = dateString;
            
            const isReserved = this.reservedDates.includes(this.formatDate(this.selectedDate));
            const isPast = this.selectedDate < new Date() && !this.isToday(this.selectedDate);
            
            if (isReserved || isPast) {
                statusIndicator.className = 'status-indicator unavailable';
                statusText.textContent = 'Indisponível';
                statusText.className = 'info-value error-message';
                confirmButton.disabled = true;
            } else {
                statusIndicator.className = 'status-indicator available';
                statusText.textContent = 'Disponível';
                statusText.className = 'info-value success-message';
                confirmButton.disabled = !timeSelect.value;
            }
        } else {
            selectedDateElement.textContent = 'Nenhuma data selecionada';
            statusIndicator.className = 'status-indicator';
            statusText.textContent = 'Selecione uma data';
            statusText.className = 'info-value';
            confirmButton.disabled = true;
        }
    }

    confirmReservation() {
        const timeSelect = document.getElementById('time-select');
        const selectedTime = timeSelect.value;
        
        if (!this.selectedDate || !selectedTime) {
            alert('Por favor, selecione uma data e horário.');
            return;
        }

        // Verificar se a data não é passada
        const now = new Date();
        if (this.selectedDate < now && !this.isToday(this.selectedDate)) {
            alert('Não é possível reservar uma data passada.');
            return;
        }

        // Verificar se há mídia selecionada
        if (!reservationStorage.hasMediaData()) {
            alert('Erro: Nenhuma mídia selecionada. Por favor, volte e selecione uma obra primeiro.');
            return;
        }

        // Salvar dados completos no storage
        const reservationData = {
            selectedDate: this.selectedDate.toISOString(),
            selectedTime: selectedTime,
            dateDisplay: this.selectedDate.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            timestamp: new Date().toISOString()
        };

        reservationStorage.saveReservationData(reservationData);

        // Verificar dados salvos
        const savedData = reservationStorage.getReservationData();
        console.log('Dados da reserva salvos:', savedData);

        // Navegar para a próxima tela (midia.html ou aprovação)
        this.navigateToNextScreen();
    }

    navigateToNextScreen() {
        const confirmButton = document.getElementById('confirm-btn');
        const originalText = confirmButton.querySelector('.button-text').textContent;
        
        confirmButton.disabled = true;
        confirmButton.querySelector('.button-text').textContent = 'Redirecionando...';
        confirmButton.style.opacity = '0.7';

        setTimeout(() => {
            // Verificar qual é a próxima tela baseado no fluxo
            // Por padrão, vamos para midia.html
            window.location.href = 'midia.html';
        }, 1000);
    }

    resetReservation() {
        this.selectedDate = null;
        document.getElementById('time-select').value = '';
        
        // Limpar dados de data/hora no storage, mantendo a mídia
        reservationStorage.resetReservationData(['selectedMedia', 'selectedMediaId', 'mediaType']);
        
        document.getElementById('reservation-summary').style.display = 'none';
        document.getElementById('confirm-btn').style.display = 'flex';
        this.renderCalendar();
        this.updateReservationInfo();
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
});

console.log('🎬 Cineplay Unifor - Sistema de Reservas de Data carregado!');