/**
 * Sistema de Paginação Generalizado para Administração
 * Centraliza toda a lógica de paginação, busca e filtros
 */

class AdminPagination {
    constructor(config) {
        this.config = {
            // Configurações obrigatórias
            apiEndpoint: config.apiEndpoint,
            tableBodyId: config.tableBodyId,
            paginationId: config.paginationId || 'pagination',
            
            // Configurações opcionais
            itemsPerPage: config.itemsPerPage || 10,
            searchInputId: config.searchInputId || 'searchInput',
            searchBtnId: config.searchBtnId || 'searchBtn',
            filterIds: config.filterIds || [],
            
            // Callbacks para renderização personalizada
            renderRow: config.renderRow,
            onLoadSuccess: config.onLoadSuccess || (() => {}),
            onLoadError: config.onLoadError || ((error) => console.error('Erro ao carregar dados:', error)),
            
            // Textos customizáveis
            emptyMessage: config.emptyMessage || 'Nenhum item encontrado',
            previousText: config.previousText || 'Anterior',
            nextText: config.nextText || 'Próximo'
        };
        
        // Estado interno
        this.currentPage = 1;
        this.currentSearch = '';
        this.currentFilters = {};
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadData();
    }
    
    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById(this.config.searchBtnId);
        const searchInput = document.getElementById(this.config.searchInputId);
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }
        
        // Filter functionality
        this.config.filterIds.forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement) {
                filterElement.addEventListener('change', () => this.performSearch());
            }
        });
        
        // Pagination links (usando event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.pagination-link')) {
                e.preventDefault();
                const page = parseInt(e.target.closest('.pagination-link').dataset.page);
                this.loadData(page);
            }
        });
    }
    
    async loadData(page = 1) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage = page;
        
        try {
            const url = this.buildApiUrl();
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                this.displayData(data.items || data.books || data.users || data.lendings || data);
                this.updatePagination(data.total, data.page, data.lastPage);
                this.config.onLoadSuccess(data);
            } else {
                throw new Error(data.message || 'Erro ao carregar dados');
            }
            
        } catch (error) {
            this.config.onLoadError(error);
            this.showError();
        } finally {
            this.isLoading = false;
        }
    }
    
    buildApiUrl() {
        let url = this.config.apiEndpoint;
        const params = new URLSearchParams();
        
        // Se há busca, usar endpoint de search
        if (this.currentSearch) {
            // Para diferentes tipos de busca
            if (url.includes('/books')) {
                return `${url}/search?title=${encodeURIComponent(this.currentSearch)}`;
            } else if (url.includes('/users')) {
                return `${url}/search?q=${encodeURIComponent(this.currentSearch)}`;
            } else if (url.includes('/lending')) {
                return `${url}/search?q=${encodeURIComponent(this.currentSearch)}`;
            }
        }
        
        // URL de paginação normal
        if (!url.includes(`/${this.currentPage}/${this.config.itemsPerPage}`)) {
            // Adicionar page e limit no final da URL se ainda não estiverem lá
            url = `${url}/${this.currentPage}/${this.config.itemsPerPage}`;
        }
        
        // Adicionar filtros como query params
        Object.keys(this.currentFilters).forEach(key => {
            if (this.currentFilters[key] !== '') {
                params.append(key, this.currentFilters[key]);
            }
        });
        
        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
    }
    
    displayData(items) {
        const tbody = document.getElementById(this.config.tableBodyId);
        
        if (!items || items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="100%" class="text-center">${this.config.emptyMessage}</td></tr>`;
            return;
        }
        
        tbody.innerHTML = items.map(item => this.config.renderRow(item)).join('');
    }
    
    updatePagination(total, page, lastPage) {
        const pagination = document.getElementById(this.config.paginationId);
        
        if (!total || total <= this.config.itemsPerPage) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        if (page > 1) {
            paginationHTML += `<li class="page-item">
                <a class="page-link pagination-link" href="#" data-page="${page - 1}">
                    ${this.config.previousText}
                </a>
            </li>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(lastPage, page + 2);
        
        // First page + ellipsis
        if (startPage > 1) {
            paginationHTML += `<li class="page-item">
                <a class="page-link pagination-link" href="#" data-page="1">1</a>
            </li>`;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>`;
            }
        }
        
        // Visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<li class="page-item ${i === page ? 'active' : ''}">
                <a class="page-link pagination-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        }
        
        // Last page + ellipsis
        if (endPage < lastPage) {
            if (endPage < lastPage - 1) {
                paginationHTML += `<li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>`;
            }
            paginationHTML += `<li class="page-item">
                <a class="page-link pagination-link" href="#" data-page="${lastPage}">${lastPage}</a>
            </li>`;
        }
        
        // Next button
        if (page < lastPage) {
            paginationHTML += `<li class="page-item">
                <a class="page-link pagination-link" href="#" data-page="${page + 1}">
                    ${this.config.nextText}
                </a>
            </li>`;
        }
        
        pagination.innerHTML = paginationHTML;
    }
    
    performSearch() {
        const searchInput = document.getElementById(this.config.searchInputId);
        this.currentSearch = searchInput ? searchInput.value.trim() : '';
        
        // Coletar valores dos filtros
        this.currentFilters = {};
        this.config.filterIds.forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement) {
                // Mapear IDs específicos para nomes de parâmetros corretos
                let paramName = filterId.replace('Filter', '');
                if (filterId === 'availabilityFilter') {
                    paramName = 'availability';
                } else if (filterId === 'typeFilter') {
                    paramName = 'type';
                } else if (filterId === 'statusFilter') {
                    paramName = 'status';
                }
                this.currentFilters[paramName] = filterElement.value;
            }
        });
        
        this.currentPage = 1;
        this.loadData();
    }
    
    showError() {
        const tbody = document.getElementById(this.config.tableBodyId);
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center text-danger">Erro ao carregar dados. Tente novamente.</td></tr>';
        
        const pagination = document.getElementById(this.config.paginationId);
        pagination.innerHTML = '';
    }
    
    // Métodos públicos para controle externo
    refresh() {
        this.loadData(this.currentPage);
    }
    
    goToPage(page) {
        this.loadData(page);
    }
    
    setSearch(searchTerm) {
        const searchInput = document.getElementById(this.config.searchInputId);
        if (searchInput) {
            searchInput.value = searchTerm;
        }
        this.currentSearch = searchTerm;
        this.performSearch();
    }
    
    setFilter(filterId, value) {
        const filterElement = document.getElementById(filterId);
        if (filterElement) {
            filterElement.value = value;
        }
        this.currentFilters[filterId.replace('Filter', '')] = value;
        this.performSearch();
    }
}

function showToast(message, type = 'info') {
    if (window.showToast && typeof window.showToast === 'function') {
        return window.showToast(message, type);
    }
    
    const toastContainer = document.querySelector('.toast-container') || document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn('Container de toast não encontrado');
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.id = 'toast-container';
        document.body.appendChild(container);
        return showToast(message, type);
    }
    
    const toastId = 'toast-' + Date.now();
    const typeConfig = {
        success: { title: 'Sucesso', class: 'text-bg-success' },
        error: { title: 'Erro', class: 'text-bg-danger' },
        warning: { title: 'Aviso', class: 'text-bg-warning' },
        info: { title: 'Informação', class: 'text-bg-info' }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    const toastHTML = `
        <div class="toast ${config.class}" role="alert" id="${toastId}">
            <div class="toast-header">
                <strong class="me-auto">${config.title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

window.AdminPagination = AdminPagination;
window.showToast = showToast;