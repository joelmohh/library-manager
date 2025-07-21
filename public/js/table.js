(function(window) {
    class TableManager {
        constructor(tableId, options = {}) {
            this.tableId = tableId;
            this.table = $(`#${tableId}`);
            this.endpoint = options.endpoint || '/api/data'; // Endpoint padrão
            this.currentPage = 1;
            this.itemsPerPage = options.itemsPerPage || 5;
            this.searchInput = $(options.searchInput || '#searchInput');
            this.paginationContainer = $(options.paginationContainer || '#pagination');
            this.itemsPerPageSelector = $(options.itemsPerPageSelector || '#itemsPerPage');
            this.columns = options.columns || [];
            this.actionButtons = options.actionButtons;
            this.cache = new Map();
            this.debounceTimer = null;
            this.isLoading = false;
            this.total = 0;
            
            this.addLoadingIndicator();
            this.initialize();
        }

        addLoadingIndicator() {
            this.loadingIndicator = $('<div class="loading-indicator">Carregando...</div>');
            this.table.after(this.loadingIndicator);
            this.loadingIndicator.hide();
        }

        showLoading() {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = setTimeout(() => {
                this.loadingIndicator.show();
                this.table.addClass('loading');
            }, 200); // Delay para evitar flash de loading em carregamentos rápidos
        }

        hideLoading() {
            clearTimeout(this.loadingTimeout);
            this.loadingIndicator.hide();
            this.table.removeClass('loading');
        }

        async fetchPageData(page, searchTerm = '') {
            if (this.isLoading) return null;
            
            const cacheKey = `${this.tableId}_${page}_${searchTerm}_${this.itemsPerPage}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            this.isLoading = true;
            this.showLoading();

            try {
                const response = await fetch(`${this.endpoint}?page=${page}&limit=${this.itemsPerPage}&search=${searchTerm}`);
                const data = await response.json();
                this.cache.set(cacheKey, data);
                this.total = data.total;
                return data;
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                return null;
            } finally {
                this.isLoading = false;
                this.hideLoading();
            }
        }

        async displayRows(page, searchTerm = '') {
            const data = await this.fetchPageData(page, searchTerm);
            if (!data) return;

            const tbody = this.table.find("tbody");
            tbody.empty();

            if (data.rows.length === 0) {
                tbody.html(`<tr><td colspan="6"><div class="no-data"><i class="ri-inbox-archive-line"></i><p>Nenhum registro encontrado</p></div></td></tr>`);
                return;
            }

            data.rows.forEach(row => {
                const tr = this.createTableRow(row);
                tbody.append(tr);
            });

            this.displayPagination(data.total, page);
            
            // Reaplica eventos nos botões de ação
            this.setupActionButtons();
        }

        createTableRow(row) {
            let html = `<tr data-id="${row._id}" data-status="${row.status}">`;
            
            // Adiciona células para cada coluna definida
            this.columns.forEach(column => {
                if (column.field === 'status') {
                    // Tratamento especial para a coluna de status
                    html += `
                        <td data-field="${column.field}">
                            <span class="status-badge ${row[column.field] === 0 ? 'status-available' : 'status-unavailable'}">
                                <i class="ri-${row[column.field] === 0 ? 'checkbox-circle-line' : 'close-circle-line'}"></i>
                                ${row[column.field] === 0 ? 'Disponível' : 'Indisponível'}
                            </span>
                        </td>`;
                } else {
                    html += `<td data-field="${column.field}">${row[column.field] || ''}</td>`;
                }
            });

            // Adiciona botões de ação se existirem
            if (this.actionButtons) {
                html += `
                    <td>
                        <div class="action-buttons">
                            ${this.actionButtons(row)}
                        </div>
                    </td>`;
            }

            html += '</tr>';
            return $(html);
        }

        setupActionButtons() {
            // Reaplica eventos de modal nos novos botões
            $('[data-bs-toggle="modal"]').off('click').on('click', function() {
                const modalId = $(this).data('bs-target').substring(1);
                const row = $(this).closest('tr');
                
                if ($(this).hasClass('edit-book')) {
                    $('#editBookId').val($(this).data('book-id'));
                    $('#editTitle').val($(this).data('book-title'));
                    $('#editAutor').val($(this).data('book-autor'));
                    $('#editCategory').val($(this).data('book-category'));
                } else if ($(this).hasClass('delete-book')) {
                    $('#deleteBookId').val($(this).data('book-id'));
                }
                
                $(`#${modalId}`).addClass('show');
            });
        }

        initialize() {
            // Carrega primeira página
            this.displayRows(1);

            // Configuração da busca com debounce
            this.searchInput.on('input', () => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.currentPage = 1;
                    this.cache.clear();
                    this.displayRows(1, this.searchInput.val());
                }, 300);
            });

            // Configuração da paginação
            this.paginationContainer.on('click', '.page-btn', (e) => {
                const btn = $(e.currentTarget);
                if (btn.prop('disabled')) return;

                const page = parseInt(btn.data('page'));
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.displayRows(page, this.searchInput.val());
                }
            });

            // Configuração do selector de itens por página
            this.itemsPerPageSelector.on('change', () => {
                this.itemsPerPage = parseInt(this.itemsPerPageSelector.val());
                this.currentPage = 1;
                this.cache.clear();
                this.displayRows(1, this.searchInput.val());
            });
        }

        displayPagination(totalItems, currentPage) {
            const totalPages = Math.ceil(totalItems / this.itemsPerPage);
            let paginationHtml = '';

            // Container para informação de páginas
            paginationHtml += `<div class="pagination-info">Página ${currentPage} de ${totalPages} (${totalItems} itens)</div>`;

            // Botões de navegação
            paginationHtml += '<div class="pagination-controls">';
            
            // Primeiro e anterior
            paginationHtml += `
                <button class="page-btn first" ${currentPage === 1 ? 'disabled' : ''} data-page="1">
                    <i class="ri-skip-back-line"></i>
                </button>
                <button class="page-btn prev" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                    <i class="ri-arrow-left-s-line"></i>
                </button>
            `;

            // Números das páginas
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);

            if (startPage > 1) {
                paginationHtml += '<span class="page-dots">...</span>';
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHtml += `
                    <button class="page-btn number ${i === currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            }

            if (endPage < totalPages) {
                paginationHtml += '<span class="page-dots">...</span>';
            }

            // Próximo e último
            paginationHtml += `
                <button class="page-btn next" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                    <i class="ri-arrow-right-s-line"></i>
                </button>
                <button class="page-btn last" ${currentPage === totalPages ? 'disabled' : ''} data-page="${totalPages}">
                    <i class="ri-skip-forward-line"></i>
                </button>
            `;

            paginationHtml += '</div>';

            // Atualiza o HTML e adiciona os eventos
            $(this.paginationContainer).html(paginationHtml);
            this.addPaginationEvents();
        }

        addPaginationEvents() {
            // Corrigindo a seleção dos botões de paginação
            const self = this;
            const container = $(this.paginationContainer);
            
            container.find('.page-btn').not('[disabled]').on('click', function() {
                const page = parseInt($(this).data('page'));
                if (page && page !== self.currentPage) {
                    self.currentPage = page;
                    const searchTerm = self.searchInput.val();
                    self.displayRows(page, searchTerm);
                }
            });
        }
    }

    window.TableManager = TableManager;
})(window);
