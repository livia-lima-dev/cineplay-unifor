// js/storage.js
class ReservationStorage {
    constructor() {
        this.storageKey = 'cineplay_reservation';
        this.pendingReservationsKey = 'cineplay_pending_reservations';
        this.waitlistKey = 'cineplay_waitlist';
        this.init();
    }

    init() {
        // Inicializar storage se não existir
        if (!localStorage.getItem(this.pendingReservationsKey)) {
            localStorage.setItem(this.pendingReservationsKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.waitlistKey)) {
            localStorage.setItem(this.waitlistKey, JSON.stringify([]));
        }
    }

    // Métodos para dados da reserva atual
    saveReservationData(data) {
        try {
            const currentData = this.getReservationData();
            const updatedData = { 
                ...currentData, 
                ...data,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados da reserva:', error);
            return false;
        }
    }

    getReservationData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Erro ao obter dados da reserva:', error);
            return {};
        }
    }

    clearReservationData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados da reserva:', error);
            return false;
        }
    }

    hasDateTimeData() {
        const data = this.getReservationData();
        return !!(data.selectedDate && data.selectedTime);
    }

    hasMediaData() {
        const data = this.getReservationData();
        return !!(data.selectedMedia);
    }

    hasCabineData() {
        const data = this.getReservationData();
        return !!(data.selectedCabine || data.selectedCabines);
    }

    hasUserType() {
        const data = this.getReservationData();
        return !!(data.userType);
    }

    getUserType() {
        const data = this.getReservationData();
        return data.userType || null;
    }

    hasCompleteReservationData() {
        const data = this.getReservationData();
        const hasBasicData = !!(data.selectedDate && data.selectedTime && data.selectedMedia);
        
        if (data.userType === 'docente') {
            return hasBasicData && !!(data.selectedCabines && data.selectedCabines.length > 0);
        } else {
            return hasBasicData && !!(data.selectedCabine);
        }
    }

    getReservationSummary() {
        const data = this.getReservationData();
        if (data.selectedDate && data.selectedTime) {
            const dateObj = new Date(data.selectedDate);
            const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            return `${formattedDate} às ${data.selectedTime}`;
        }
        return null;
    }

    getFormattedReservationData() {
        const data = this.getReservationData();
        if (data.selectedDate && data.selectedTime) {
            const dateObj = new Date(data.selectedDate);
            return {
                date: dateObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                time: data.selectedTime,
                fullDate: dateObj.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                dateTime: dateObj.toLocaleString('pt-BR')
            };
        }
        return null;
    }

    getCompleteReservationSummary() {
        const data = this.getReservationData();
        const formattedData = this.getFormattedReservationData();
        
        if (this.hasCompleteReservationData()) {
            const summary = {
                userType: data.userType,
                media: data.selectedMedia,
                date: formattedData.date,
                time: formattedData.time,
                fullDate: formattedData.fullDate,
                mediaId: data.selectedMediaId,
                timestamp: data.timestamp
            };

            if (data.userType === 'docente') {
                summary.cabines = data.selectedCabines;
                summary.totalCabines = data.selectedCabines ? data.selectedCabines.length : 0;
                summary.cabine = data.selectedCabines ? data.selectedCabines.join(', ') : '';
            } else {
                summary.cabine = data.selectedCabine;
            }

            return summary;
        }
        return null;
    }

    getBasicReservationInfo() {
        const data = this.getReservationData();
        const formattedData = this.getFormattedReservationData();
        
        const info = {
            userType: data.userType,
            hasDateTime: !!(data.selectedDate && data.selectedTime),
            hasMedia: !!(data.selectedMedia),
            hasCabine: this.hasCabineData()
        };
        
        if (data.selectedMedia) {
            info.media = data.selectedMedia;
        }
        
        if (formattedData) {
            info.date = formattedData.date;
            info.time = formattedData.time;
            info.fullDate = formattedData.fullDate;
        }
        
        if (data.selectedCabine) {
            info.cabine = data.selectedCabine;
        }
        
        if (data.selectedCabines) {
            info.cabines = data.selectedCabines;
            info.totalCabines = data.selectedCabines.length;
        }

        return info;
    }

    resetReservationData(keysToKeep = []) {
        try {
            const dataToKeep = {};
            const currentData = this.getReservationData();
            
            keysToKeep.forEach(key => {
                if (currentData[key] !== undefined) {
                    dataToKeep[key] = currentData[key];
                }
            });
            
            this.clearReservationData();
            if (Object.keys(dataToKeep).length > 0) {
                this.saveReservationData(dataToKeep);
            }
            return true;
        } catch (error) {
            console.error('Erro ao resetar dados da reserva:', error);
            return false;
        }
    }

    getReservationProgress() {
        const data = this.getReservationData();
        let completedSteps = 0;
        const totalSteps = 4;
        
        if (data.selectedDate && data.selectedTime) completedSteps++;
        if (data.selectedMedia) completedSteps++;
        if (data.userType) completedSteps++;
        if (this.hasCabineData()) completedSteps++;
        
        const progress = (completedSteps / totalSteps) * 100;
        
        return {
            progress: Math.round(progress),
            completedSteps,
            totalSteps,
            currentStep: completedSteps < totalSteps ? completedSteps + 1 : totalSteps,
            steps: {
                dateTime: !!(data.selectedDate && data.selectedTime),
                media: !!(data.selectedMedia),
                userType: !!(data.userType),
                cabine: this.hasCabineData()
            }
        };
    }

    validateReservationData() {
        const data = this.getReservationData();
        const errors = [];

        if (!data.selectedDate || !data.selectedTime) {
            errors.push('Data e horário são obrigatórios');
        } else {
            try {
                const selectedDate = new Date(data.selectedDate);
                const now = new Date();
                if (selectedDate < now) {
                    errors.push('A data selecionada não pode ser no passado');
                }
            } catch (error) {
                errors.push('Data inválida');
            }
        }

        if (!data.selectedMedia) {
            errors.push('Selecione uma mídia');
        }

        if (!data.userType) {
            errors.push('Selecione o tipo de usuário');
        } else if (data.userType !== 'docente' && data.userType !== 'discente') {
            errors.push('Tipo de usuário inválido');
        }

        if (data.userType === 'docente') {
            if (!data.selectedCabines || data.selectedCabines.length === 0) {
                errors.push('Selecione pelo menos uma cabine para reserva em lote');
            }
        } else if (data.userType === 'discente') {
            if (!data.selectedCabine) {
                errors.push('Selecione uma cabine');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    exportReservationData() {
        const data = this.getReservationData();
        return {
            ...data,
            formatted: this.getFormattedReservationData(),
            progress: this.getReservationProgress(),
            validation: this.validateReservationData(),
            timestamp: new Date().toISOString()
        };
    }

    isReservationExpired() {
        const data = this.getReservationData();
        if (data.timestamp) {
            const reservationTime = new Date(data.timestamp);
            const now = new Date();
            const diffHours = (now - reservationTime) / (1000 * 60 * 60);
            return diffHours > 24;
        }
        return false;
    }

    cleanupExpiredData() {
        if (this.isReservationExpired()) {
            console.log('Limpando dados de reserva expirados');
            return this.clearReservationData();
        }
        return false;
    }

    getReservationStats() {
        const data = this.getReservationData();
        const progress = this.getReservationProgress();
        const validation = this.validateReservationData();
        
        return {
            progress: progress.progress,
            completedSteps: progress.completedSteps,
            totalSteps: progress.totalSteps,
            isValid: validation.isValid,
            hasErrors: validation.errors.length > 0,
            errorCount: validation.errors.length,
            userType: data.userType,
            hasMedia: !!data.selectedMedia,
            hasDateTime: !!(data.selectedDate && data.selectedTime),
            hasCabine: this.hasCabineData(),
            isExpired: this.isReservationExpired(),
            lastUpdate: data.timestamp ? new Date(data.timestamp) : null
        };
    }

    // MÉTODOS PARA RESERVAS PENDENTES
    addPendingReservation(reservationData) {
        try {
            const pendingReservations = this.getPendingReservations();
            const newReservation = {
                id: Date.now().toString(),
                ...reservationData,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            pendingReservations.push(newReservation);
            localStorage.setItem(this.pendingReservationsKey, JSON.stringify(pendingReservations));
            return newReservation.id;
        } catch (error) {
            console.error('Erro ao adicionar reserva pendente:', error);
            return null;
        }
    }

    getPendingReservations() {
        try {
            const data = localStorage.getItem(this.pendingReservationsKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao obter reservas pendentes:', error);
            return [];
        }
    }

    updateReservationStatus(reservationId, status) {
        try {
            const pendingReservations = this.getPendingReservations();
            const reservationIndex = pendingReservations.findIndex(r => r.id === reservationId);
            
            if (reservationIndex !== -1) {
                pendingReservations[reservationIndex].status = status;
                pendingReservations[reservationIndex].updatedAt = new Date().toISOString();
                localStorage.setItem(this.pendingReservationsKey, JSON.stringify(pendingReservations));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao atualizar status da reserva:', error);
            return false;
        }
    }

    generateApprovalData() {
        const data = this.getReservationData();
        const formattedData = this.getFormattedReservationData();
        
        if (!this.hasCompleteReservationData()) {
            return null;
        }

        const names = ['Ana Silva', 'Carlos Santos', 'Marina Oliveira', 'João Pereira', 'Fernanda Costa'];
        const registrations = ['2310456', '2310789', '2310123', '2310567', '2310890'];
        const randomIndex = Math.floor(Math.random() * names.length);

        // Formatar data para lista de espera
        const waitlistDate = this.formatReservationDateForWaitlist(data.selectedDate, data.selectedTime);

        return {
            name: names[randomIndex],
            registration: registrations[randomIndex],
            date: waitlistDate,
            room: data.userType === 'docente' ? data.selectedCabines.join(', ') : data.selectedCabine,
            movie: data.selectedMedia,
            type: data.userType,
            cabines: data.selectedCabines || [data.selectedCabine],
            userType: data.userType
        };
    }

    formatReservationDateForWaitlist(selectedDate, selectedTime) {
        if (!selectedDate || !selectedTime) return '';
        
        try {
            const dateObj = new Date(selectedDate);
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            
            return `${day}/${month}/${year} - ${selectedTime}`;
        } catch (error) {
            console.error('Erro ao formatar data para lista de espera:', error);
            return '';
        }
    }

    // MÉTODOS PARA LISTA DE ESPERA
    addToWaitlist(approvedReservation) {
        try {
            const waitlist = this.getWaitlist();
            const waitlistItem = {
                id: Date.now().toString(),
                ...approvedReservation,
                position: waitlist.length + 1,
                addedToWaitlistAt: new Date().toISOString(),
                status: 'waiting'
            };
            
            waitlist.push(waitlistItem);
            localStorage.setItem(this.waitlistKey, JSON.stringify(waitlist));
            return waitlistItem.id;
        } catch (error) {
            console.error('Erro ao adicionar à lista de espera:', error);
            return null;
        }
    }

    getWaitlist() {
        try {
            const data = localStorage.getItem(this.waitlistKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao obter lista de espera:', error);
            return [];
        }
    }

    getSortedWaitlist() {
        const waitlist = this.getWaitlist();
        return this.sortWaitlistByDate(waitlist);
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

    removeFromWaitlist(waitlistId) {
        try {
            const waitlist = this.getWaitlist();
            const updatedWaitlist = waitlist.filter(item => item.id !== waitlistId);
            localStorage.setItem(this.waitlistKey, JSON.stringify(updatedWaitlist));
            
            this.recalculateWaitlistPositions();
            return true;
        } catch (error) {
            console.error('Erro ao remover da lista de espera:', error);
            return false;
        }
    }

    recalculateWaitlistPositions() {
        try {
            const waitlist = this.getWaitlist();
            const sortedWaitlist = this.sortWaitlistByDate(waitlist);
            const updatedWaitlist = sortedWaitlist.map((item, index) => ({
                ...item,
                position: index + 1
            }));
            
            localStorage.setItem(this.waitlistKey, JSON.stringify(updatedWaitlist));
            return true;
        } catch (error) {
            console.error('Erro ao recalcular posições da lista de espera:', error);
            return false;
        }
    }

    clearWaitlist() {
        try {
            localStorage.setItem(this.waitlistKey, JSON.stringify([]));
            return true;
        } catch (error) {
            console.error('Erro ao limpar lista de espera:', error);
            return false;
        }
    }

    getWaitlistStats() {
        const waitlist = this.getWaitlist();
        const sortedWaitlist = this.sortWaitlistByDate(waitlist);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const upcoming = sortedWaitlist.filter(item => {
            const itemDate = this.extractReservationDate(item.date);
            return itemDate >= today;
        });
        
        const past = sortedWaitlist.filter(item => {
            const itemDate = this.extractReservationDate(item.date);
            return itemDate < today;
        });
        
        const todayItems = sortedWaitlist.filter(item => {
            const itemDate = this.extractReservationDate(item.date);
            return itemDate.toDateString() === today.toDateString();
        });

        return {
            total: sortedWaitlist.length,
            upcoming: upcoming.length,
            past: past.length,
            today: todayItems.length,
            nextReservation: sortedWaitlist.length > 0 ? sortedWaitlist[0] : null
        };
    }

    // Método para mover reserva aprovada para lista de espera
    approveAndMoveToWaitlist(reservationId) {
        try {
            const pendingReservations = this.getPendingReservations();
            const reservation = pendingReservations.find(r => r.id === reservationId);
            
            if (reservation) {
                // Atualizar status para aprovado
                this.updateReservationStatus(reservationId, 'approved');
                
                // Adicionar à lista de espera
                const waitlistId = this.addToWaitlist({
                    student: reservation.name,
                    resource: reservation.room,
                    date: reservation.date,
                    registration: reservation.registration,
                    movie: reservation.movie,
                    userType: reservation.userType,
                    originalReservationId: reservationId
                });
                
                // Recalcular posições após adicionar
                this.recalculateWaitlistPositions();
                
                return waitlistId;
            }
            return null;
        } catch (error) {
            console.error('Erro ao aprovar e mover para lista de espera:', error);
            return null;
        }
    }

    // Métodos utilitários para datas
    isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return checkDate.toDateString() === today.toDateString();
    }

    isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const checkDate = new Date(date);
        return checkDate.toDateString() === tomorrow.toDateString();
    }

    isUpcoming(date) {
        const now = new Date();
        const checkDate = new Date(date);
        return checkDate > now;
    }

    isPast(date) {
        const now = new Date();
        const checkDate = new Date(date);
        return checkDate < now;
    }

    // Limpeza de dados antigos
    cleanupOldWaitlistItems() {
        try {
            const waitlist = this.getWaitlist();
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const updatedWaitlist = waitlist.filter(item => {
                const itemDate = this.extractReservationDate(item.date);
                return itemDate >= oneWeekAgo;
            });
            
            if (updatedWaitlist.length !== waitlist.length) {
                localStorage.setItem(this.waitlistKey, JSON.stringify(updatedWaitlist));
                this.recalculateWaitlistPositions();
                console.log(`Limpeza realizada: ${waitlist.length - updatedWaitlist.length} itens antigos removidos`);
            }
            
            return true;
        } catch (error) {
            console.error('Erro na limpeza de itens antigos:', error);
            return false;
        }
    }

    // Backup e restore
    exportAllData() {
        try {
            return {
                reservationData: this.getReservationData(),
                pendingReservations: this.getPendingReservations(),
                waitlist: this.getWaitlist(),
                exportDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            return null;
        }
    }

    importAllData(data) {
        try {
            if (data.reservationData) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.reservationData));
            }
            if (data.pendingReservations) {
                localStorage.setItem(this.pendingReservationsKey, JSON.stringify(data.pendingReservations));
            }
            if (data.waitlist) {
                localStorage.setItem(this.waitlistKey, JSON.stringify(data.waitlist));
            }
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }

    // Estatísticas gerais
    getSystemStats() {
        const reservationData = this.getReservationData();
        const pendingReservations = this.getPendingReservations();
        const waitlist = this.getWaitlist();
        const waitlistStats = this.getWaitlistStats();
        
        return {
            currentReservation: reservationData,
            pendingCount: pendingReservations.length,
            waitlistCount: waitlist.length,
            waitlistStats: waitlistStats,
            storageSize: {
                reservation: JSON.stringify(reservationData).length,
                pending: JSON.stringify(pendingReservations).length,
                waitlist: JSON.stringify(waitlist).length,
                total: JSON.stringify(reservationData).length + 
                       JSON.stringify(pendingReservations).length + 
                       JSON.stringify(waitlist).length
            },
            lastUpdated: new Date().toISOString()
        };
    }
}

// Instância global para uso em todas as telas
const reservationStorage = new ReservationStorage();

// Limpar dados expirados ao carregar o storage
reservationStorage.cleanupExpiredData();
// Limpar itens antigos da lista de espera
reservationStorage.cleanupOldWaitlistItems();

export { reservationStorage };