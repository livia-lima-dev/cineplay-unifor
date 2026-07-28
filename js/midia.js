// js/midia.js
import { reservationStorage } from './storage.js';

// Funcionalidades para a página de catálogo
class CatalogApp {
    constructor() {
        this.mediaItems = [];
        this.filteredItems = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        // Verificar se há dados de data/horário
        this.checkReservationData();
        this.init();
    }

    checkReservationData() {
        if (!reservationStorage.hasDateTimeData()) {
            // Se não há data/horário selecionados, voltar para tela de data
            alert('Por favor, selecione uma data e horário primeiro.');
            setTimeout(() => {
                window.location.href = 'dia.html';
            }, 2000);
            return;
        }

        // Mostrar dados da reserva atual no cabeçalho
        this.displayCurrentReservation();
    }

    displayCurrentReservation() {
        const formattedData = reservationStorage.getFormattedReservationData();
        if (formattedData) {
            // Adicionar informações da reserva no cabeçalho
            const titleSection = document.querySelector('.title-section');
            const reservationInfo = document.createElement('div');
            reservationInfo.className = 'reservation-info-header';
            reservationInfo.innerHTML = `
                <p class="current-reservation">Reserva atual: <strong>${formattedData.date}</strong> às <strong>${formattedData.time}</strong></p>
            `;
            
            // Adicionar estilos
            const style = document.createElement('style');
            style.textContent = `
                .reservation-info-header {
                    background: var(--light-blue);
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    margin-top: 0.5rem;
                    border-left: 4px solid var(--primary-blue);
                }
                .current-reservation {
                    color: var(--primary-blue);
                    font-weight: 500;
                    margin: 0;
                    font-size: 0.9rem;
                }
                .current-reservation strong {
                    color: var(--dark-blue);
                }
            `;
            document.head.appendChild(style);
            
            titleSection.appendChild(reservationInfo);
        }
    }

    init() {
        this.loadMediaItems();
        this.setupEventListeners();
        // Inicializa a lista de itens filtrados com todos os itens, exceto o ID 0
        this.filteredItems = this.mediaItems.filter(item => item.id !== 0);
        this.renderMediaList();
    }

    loadMediaItems() {
        // Catálogo completo com tipos mapeados para as novas categorias do filtro
        this.mediaItems = [
            // ITEM ESPECIAL: Mídia a ser consultada (ID 0)
            { id: 0, title: 'Mídia a ser consultada (Escolher Pessoalmente)', type: 'Consultar Pessoalmente' }, 

            // FILMES -> Filme
            { id: 1, title: '2001: Uma Odisseia no Espaço', type: 'Filme' },
            { id: 2, title: 'A Viagem de Chihiro', type: 'Filme' },
            { id: 3, title: 'Além da Imaginação', type: 'Filme' },
            { id: 4, title: 'Apocalypse Now', type: 'Filme' },
            { id: 5, title: 'Blade Runner, o Caçador de Androides', type: 'Filme' },
            { id: 6, title: 'Casablanca', type: 'Filme' },
            { id: 7, title: 'Cidadão Kane', type: 'Filme' },
            { id: 8, title: 'Laranja Mecânica', type: 'Filme' },
            { id: 9, title: 'O Poderoso Chefão', type: 'Filme' },
            { id: 10, title: 'Psicose', type: 'Filme' },
            
            // DOCUMENTÁRIOS -> Documentário
            { id: 11, title: 'Cosmos: Uma Viagem Pessoal', type: 'Documentário' },
            { id: 12, title: 'História da Arte com Andrew Graham-Dixon', type: 'Documentário' },
            { id: 13, title: 'A Era de Ouro de Hollywood', type: 'Documentário' },
            
            // OBRA ACADÊMICA (Projetos de Alunos Gravados na Unifor)
            { id: 14, title: 'TCC Audiovisual: A Fortaleza de Pixels', type: 'Obra Acadêmica' },
            { id: 15, title: 'Monografia: Impacto da IA na Comunicação', type: 'Obra Acadêmica' },
            { id: 16, title: 'Seminário: O Futuro da Saúde Digital', type: 'Obra Acadêmica' },
            { id: 17, title: 'Curta Experimental: O Despertar da Memória', type: 'Obra Acadêmica' },
            
            // AULA/GRAVAÇÃO (Diversas Áreas)
            { id: 18, title: 'Aula Magna: Tendências do Marketing Digital', type: 'Aula/Gravação' },
            { id: 19, title: 'Gravação: Simpósio de Engenharia Civil (Dia 1)', type: 'Aula/Gravação' },
            { id: 20, title: 'Palestra: Direito Constitucional na Prática', type: 'Aula/Gravação' },
            
            // NOVOS TIPOS para fins de demonstração e filtro:
            // Curta-Metragem
            { id: 21, title: 'Curta: Ilha das Flores', type: 'Curta-Metragem' },
            { id: 22, title: 'Curta: A Máquina do Tempo', type: 'Curta-Metragem' },

            // TV UNIFOR (Novo tipo solicitado)
            { id: 23, title: 'Programa: Jornal da UNIFOR (2024)', type: 'TV UNIFOR' },
            { id: 24, title: 'Programa: Entrevista com Egídio Serpa', type: 'TV UNIFOR' },

            // Outros
            { id: 25, title: 'Gravação de Evento Antigo', type: 'Outros' }
        ];
    }

    setupEventListeners() {
        // Pesquisa
        const searchInput = document.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterMedia();
        });

        // Filtro por tipo
        const filterSelect = document.querySelector('.filter-select');
        filterSelect.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterMedia();
        });

        // Botões de reserva
        document.addEventListener('click', (e) => {
            if (e.target.closest('.reserve-button')) {
                this.handleReserve(e);
            }
        });
    }

    filterMedia() {
        // Filtra apenas os itens com ID diferente de 0 (o item "Mídia a ser consultada" não é filtrável)
        const searchableItems = this.mediaItems.filter(item => item.id !== 0);
        
        // Aplica a filtragem e pesquisa apenas se houver termo de busca ou filtro ativo
        if (this.searchTerm !== '' || (this.currentFilter !== 'Filtrar por tipo' && this.currentFilter !== 'all')) {
             this.filteredItems = searchableItems.filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(this.searchTerm);
                const matchesFilter = this.currentFilter === 'Filtrar por tipo' || 
                                    this.currentFilter === 'all' || 
                                    item.type === this.currentFilter;
                
                return matchesSearch && matchesFilter;
            });
        } else {
             // Se não há filtro ou pesquisa ativa, mostra todos os itens filtráveis
            this.filteredItems = searchableItems;
        }

        this.renderMediaList();
    }

    renderMediaList() {
        const mediaList = document.querySelector('.media-list');
        const consultOption = this.mediaItems.find(item => item.id === 0);

        // 1. Item fixo "Mídia a ser consultada (Escolher Pessoalmente)"
        let listHTML = `
            <div class="media-item special-consult-option" data-id="0">
                <h3 class="media-title">${consultOption.title}</h3>
                <button class="reserve-button">
                    <span class="button-text">Reservar Horário</span>
                </button>
            </div>
        `;
        
        // 2. Renderiza os itens filtrados ou a mensagem de "sem resultados"
        if (this.filteredItems.length === 0 && (this.searchTerm !== '' || (this.currentFilter !== 'Filtrar por tipo' && this.currentFilter !== 'all'))) {
            // Mostra a mensagem de "sem resultados" apenas se houver uma pesquisa/filtro ativo.
            listHTML += `
                <div class="no-results">
                    <p>Nenhuma mídia encontrada com os filtros e termos atuais.</p>
                    <p>Tente ajustar os filtros ou termos de pesquisa.</p>
                </div>
            `;
        } else {
            // Renderiza os itens filtrados (ou todos os itens se não houver filtro/pesquisa ativo)
            listHTML += this.filteredItems.map(item => `
                <div class="media-item" data-id="${item.id}">
                    <h3 class="media-title">${item.title}</h3>
                    <button class="reserve-button">
                        <span class="button-text">Reservar</span>
                    </button>
                </div>
            `).join('');
        }
        
        mediaList.innerHTML = listHTML;
    }

    handleReserve(event) {
        const mediaItem = event.target.closest('.media-item');
        const mediaId = mediaItem.dataset.id;
        const mediaTitle = mediaItem.querySelector('.media-title').textContent;
        
        // Capturar o valor do campo de observações
        const observationsTextarea = document.getElementById('equipment-observations');
        const observations = observationsTextarea ? observationsTextarea.value.trim() : '';

        // Salvar a mídia selecionada e as observações no storage
        const mediaData = {
            selectedMedia: mediaTitle,
            selectedMediaId: mediaId,
            equipmentObservations: observations // NOVO DADO SALVO
        };
        reservationStorage.saveReservationData(mediaData);
        
        // Feedback visual no botão
        const button = event.target.closest('.reserve-button');
        const originalText = button.querySelector('.button-text').textContent;
        
        button.disabled = true;
        button.querySelector('.button-text').textContent = 'Reservando...';
        button.style.opacity = '0.7';
        
        // Mostrar popup de seleção de tipo de usuário
        setTimeout(() => {
            this.showUserTypeSelection(mediaTitle, button, originalText);
        }, 500);
    }

    showUserTypeSelection(mediaTitle, button, originalText) {
        // Criar modal de seleção de tipo de usuário
        const modal = document.createElement('div');
        modal.className = 'user-type-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Selecione seu tipo de usuário</h3>
                <p>Você está reservando: <strong>${mediaTitle}</strong></p>
                
                <div class="user-type-options">
                    <button class="user-type-btn docente-btn" data-type="docente">
                        <div class="user-type-icon">
                            <span class="material-symbols-outlined">school</span>
                        </div>
                        <div class="user-type-info">
                            <strong>Docente</strong>
                            <span>Professores e funcionários</span>
                        </div>
                        <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                    
                    <button class="user-type-btn discente-btn" data-type="discente">
                        <div class="user-type-icon">
                            <span class="material-symbols-outlined">person</span>
                        </div>
                        <div class="user-type-info">
                            <strong>Discente</strong>
                            <span>Alunos e estudantes</span>
                        </div>
                        <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
                
                <div class="modal-note">
                    <p><strong>Docente:</strong> Acesso a reservas em lote<br>
                    <strong>Discente:</strong> Reserva individual</p>
                </div>
                
                <button class="modal-close secondary-button">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .user-type-modal {
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
            .user-type-modal .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 0.75rem;
                max-width: 450px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            .user-type-modal h3 {
                color: var(--primary-blue);
                margin: 0 0 1rem 0;
                font-size: 1.5rem;
            }
            .user-type-modal p {
                color: var(--dark-gray);
                margin: 0 0 1.5rem 0;
            }
            .user-type-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin: 2rem 0;
            }
            .user-type-btn {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1.5rem;
                border: 2px solid var(--light-gray);
                border-radius: 0.5rem;
                background: white;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
                width: 100%;
            }
            .user-type-btn:hover {
                border-color: var(--primary-blue);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .user-type-btn.docente-btn:hover {
                border-color: var(--primary-blue);
                background: var(--light-blue);
            }
            .user-type-btn.discente-btn:hover {
                border-color: var(--success);
                background: #f0f9f0;
            }
            .user-type-icon {
                margin-right: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .user-type-icon .material-symbols-outlined {
                font-size: 2rem;
                color: var(--primary-blue);
            }
            .user-type-btn.discente-btn .user-type-icon .material-symbols-outlined {
                color: var(--success);
            }
            .user-type-info {
                flex: 1;
            }
            .user-type-info strong {
                display: block;
                color: var(--dark-blue);
                font-size: 1.1rem;
                margin-bottom: 0.25rem;
            }
            .user-type-info span {
                color: var(--dark-gray);
                font-size: 0.9rem;
            }
            .user-type-btn .material-symbols-outlined {
                color: var(--dark-gray);
                font-size: 1.5rem;
            }
            .modal-note {
                background: var(--light-gray);
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
                text-align: left;
            }
            .modal-note p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--dark-gray);
            }
            .modal-note strong {
                color: var(--dark-blue);
            }
            .modal-close {
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background: var(--light-gray);
                color: var(--dark-gray);
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            .modal-close:hover {
                background: #e0e0e0;
            }
            /* Adiciona um estilo para a opção de reserva especial */
            .special-consult-option {
                border: 2px dashed var(--gray-400);
                background: var(--gray-50);
            }
            .special-consult-option .media-title {
                color: var(--gray-700);
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
        
        // Event listeners para os botões
        modal.querySelector('.docente-btn').addEventListener('click', () => {
            this.handleUserTypeSelection('docente', button, originalText);
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.querySelector('.discente-btn').addEventListener('click', () => {
            this.handleUserTypeSelection('discente', button, originalText);
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            // Resetar botão se cancelar
            button.disabled = false;
            button.querySelector('.button-text').textContent = originalText;
            button.style.opacity = '';
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
    }

    handleUserTypeSelection(userType, button, originalText) {
        // Salvar tipo de usuário no storage
        reservationStorage.saveReservationData({ userType });
        
        // Feedback visual final no botão
        button.querySelector('.button-text').textContent = 'Reservado!';
        button.style.backgroundColor = 'var(--success)';
        
        // Navegar para a tela apropriada
        setTimeout(() => {
            if (userType === 'docente') {
                window.location.href = 'cabinelote.html';
            } else {
                window.location.href = 'cabine.html';
            }
        }, 1000);
    }

    navigateToCabine() {
        window.location.href = 'cabine.html';
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new CatalogApp();
});

console.log('🎬 Catálogo de Mídias - Sistema carregado!');