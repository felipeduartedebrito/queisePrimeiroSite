/**
 * ============================================
 * PRODUCT-GRID.JS - Grid de Produtos
 * ============================================
 * 
 * Componente para exibição e gerenciamento de grid de produtos
 * Suporta: ordenação, visualização (grid/list), animações
 * 
 * @module components/ProductGrid
 */

import { PRODUCTS_CONFIG, ANIMATION_CONFIG } from '../core/config.js';
import { createObserver } from '../core/utils.js';

// ========================================
// CLASSE PRODUCT GRID
// ========================================

/**
 * Classe para gerenciar grid de produtos
 */
export class ProductGrid {
    constructor(containerId = 'productsGrid') {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.products = [];
        this.filteredProducts = [];
        this.currentSort = 'relevance';
        this.currentView = PRODUCTS_CONFIG.defaultView;
        this.currentPage = 1;
        this.itemsPerPage = PRODUCTS_CONFIG.itemsPerPage;
        
        this.captureProductsFromDOM();
    }

    // ========================================
    // CAPTURA DE PRODUTOS
    // ========================================

    /**
     * Captura produtos do DOM
     */
    captureProductsFromDOM() {
        const productElements = document.querySelectorAll('.product-item');
        
        this.products = Array.from(productElements).map((element, index) => {
            const name = element.querySelector('.product-name')?.textContent.trim() || '';
            const categoryAttr = element.getAttribute('data-category') || '';
            
            // Se não tiver data-category, tentar inferir do nome ou categoria visual
            let category = categoryAttr;
            if (!category) {
                const categoryEl = element.querySelector('.product-category');
                if (categoryEl) {
                    category = categoryEl.textContent.trim().toLowerCase();
                } else {
                    // Inferir do nome do produto
                    const nameLower = name.toLowerCase();
                    if (nameLower.includes('garrafa')) category = 'garrafas';
                    else if (nameLower.includes('copo') || nameLower.includes('caneca')) category = 'copos';
                    else if (nameLower.includes('bolsa')) category = 'bolsas';
                    else if (nameLower.includes('mala') || nameLower.includes('mochila')) category = 'malas';
                    else if (nameLower.includes('imã') || nameLower.includes('ima')) category = 'imas';
                }
            }
            
            // Parse price - garantir que é número
            const priceAttr = element.getAttribute('data-price');
            let price = 0;
            if (priceAttr) {
                price = parseFloat(priceAttr);
                if (isNaN(price)) {
                    // Tentar extrair do texto do preço se data-price não funcionar
                    const priceText = element.querySelector('.price-main')?.textContent;
                    if (priceText) {
                        const priceMatch = priceText.match(/[\d,]+/);
                        if (priceMatch) {
                            price = parseFloat(priceMatch[0].replace(',', '.'));
                        }
                    }
                }
            }
            
            return {
                id: index + 1,
                element: element,
                name: name,
                category: category,
                price: isNaN(price) ? 0 : price,
                features: (element.getAttribute('data-features') || '').split(',').filter(f => f.trim()),
                description: element.querySelector('.product-description')?.textContent.trim() || '',
                priceText: element.querySelector('.price-main')?.textContent.trim() || ''
            };
        });
        
        this.filteredProducts = [...this.products];
        
        // Debug: log produtos capturados
        console.log('📦 Produtos capturados:', this.products.map(p => ({ 
            name: p.name, 
            category: p.category,
            price: p.price,
            priceType: typeof p.price
        })));
    }

    // ========================================
    // ATUALIZAÇÃO DE PRODUTOS
    // ========================================

    /**
     * Define produtos filtrados
     * @param {Array} filteredProducts - Produtos filtrados
     */
    setFilteredProducts(filteredProducts) {
        this.filteredProducts = filteredProducts;
        // Resetar para primeira página quando filtros mudam
        this.currentPage = 1;
        this.updateDisplay();
    }

    /**
     * Atualiza exibição dos produtos
     */
    updateDisplay() {
        if (!this.container) return;
        
        // Aplicar ordenação antes de paginar
        this.applySorting();
        
        // Calcular produtos da página atual
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        console.log(`📄 Página ${this.currentPage} de ${this.getTotalPages()}: Mostrando ${productsToShow.length} produtos (índices ${startIndex} a ${endIndex - 1})`);
        
        // Esconder todos os produtos
        this.products.forEach(product => {
            if (product.element) {
                product.element.style.display = 'none';
            }
        });
        
        // Mostrar apenas produtos da página atual
        // Respeitar o modo de visualização (grid ou list)
        productsToShow.forEach(product => {
            if (product.element) {
                if (this.currentView === 'list') {
                    product.element.style.display = 'grid';
                } else {
                    product.element.style.display = 'block';
                }
            }
        });
        
        // Reorganizar no DOM conforme ordenação
        productsToShow.forEach(product => {
            if (product.element && this.container) {
                this.container.appendChild(product.element);
            }
        });
        
        // Aplicar view atual
        this.applyCurrentView();
        
        // Mostrar mensagem se não houver resultados
        this.showNoResultsMessage();
        
        // Atualizar contador
        this.updateResultsCount();
        
        // Atualizar paginação
        this.updatePagination();
        
        // Reiniciar animações
        this.setupAnimations();
    }

    /**
     * Aplica view atual (grid ou list)
     */
    applyCurrentView() {
        if (!this.container) return;
        
        // Calcular produtos da página atual
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        if (this.currentView === 'list') {
            this.container.classList.add('list-view');
            productsToShow.forEach(product => {
                if (product.element) {
                    product.element.classList.add('list-view');
                }
            });
        } else {
            this.container.classList.remove('list-view');
            productsToShow.forEach(product => {
                if (product.element) {
                    product.element.classList.remove('list-view');
                }
            });
        }
    }

    /**
     * Atualiza contador de resultados
     */
    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const total = this.filteredProducts.length;
            const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.itemsPerPage, total);
            resultsCount.textContent = total;
            
            // Opcional: mostrar range atual (ex: "Mostrando 1-9 de 51 produtos")
            // resultsCount.textContent = `${startIndex}-${endIndex} de ${total}`;
        }
    }

    /**
     * Mostra mensagem quando não há resultados
     */
    showNoResultsMessage() {
        if (!this.container) return;
        
        let noResultsElement = this.container.querySelector('.no-results');
        
        if (this.filteredProducts.length === 0) {
            if (!noResultsElement) {
                noResultsElement = document.createElement('div');
                noResultsElement.className = 'no-results';
                noResultsElement.innerHTML = `
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente ajustar os filtros ou buscar por outros termos.</p>
                    <button class="btn-primary clear-filters-btn">
                        Limpar Filtros
                    </button>
                `;
                
                // Adicionar event listener ao botão
                const clearBtn = noResultsElement.querySelector('.clear-filters-btn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        window.dispatchEvent(new CustomEvent('clearAllFilters'));
                    });
                }
                
                this.container.appendChild(noResultsElement);
            }
            noResultsElement.style.display = 'block';
        } else {
            if (noResultsElement) {
                noResultsElement.style.display = 'none';
            }
        }
    }

    // ========================================
    // ORDENAÇÃO
    // ========================================

    /**
     * Define ordenação
     * @param {string} sortBy - Tipo de ordenação
     */
    setSort(sortBy) {
        this.currentSort = sortBy;
        this.applySorting();
        this.updateDisplay();
    }

    /**
     * Aplica ordenação aos produtos filtrados
     */
    applySorting() {
        const sortBy = this.currentSort;
        
        this.filteredProducts.sort((a, b) => {
            switch(sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'newest':
                    return b.id - a.id; // Assumindo que IDs maiores são mais recentes
                case 'relevance':
                default:
                    return a.id - b.id; // Ordem original
            }
        });
    }

    /**
     * Obtém ordenação atual
     * @returns {string} Tipo de ordenação
     */
    getSort() {
        return this.currentSort;
    }

    // ========================================
    // VISUALIZAÇÃO (GRID/LIST)
    // ========================================

    /**
     * Define visualização em grid
     */
    setGridView() {
        this.currentView = 'grid';
        // Remover classe list-view de todos os produtos
        this.products.forEach(product => {
            if (product.element) {
                product.element.classList.remove('list-view');
            }
        });
        this.applyCurrentView();
        this.updateViewButtons('grid');
    }

    /**
     * Define visualização em lista
     */
    setListView() {
        this.currentView = 'list';
        // Remover classe list-view de todos os produtos primeiro
        this.products.forEach(product => {
            if (product.element) {
                product.element.classList.remove('list-view');
            }
        });
        this.applyCurrentView();
        this.updateViewButtons('list');
    }

    /**
     * Atualiza botões de visualização
     * @param {string} activeView - View ativa
     */
    updateViewButtons(activeView) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === activeView) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Obtém view atual
     * @returns {string} View atual
     */
    getView() {
        return this.currentView;
    }

    // ========================================
    // ANIMAÇÕES
    // ========================================

    /**
     * Configura animações dos produtos
     */
    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const productObserver = createObserver((target, index) => {
            // Animação escalonada
            setTimeout(() => {
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
            }, index * 100);
        }, observerOptions);

        // Calcular produtos da página atual para animar apenas os visíveis
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToAnimate = this.filteredProducts.slice(startIndex, endIndex);

        // Observar apenas produtos da página atual
        productsToAnimate.forEach((product, index) => {
            if (product.element) {
                product.element.style.opacity = '0';
                product.element.style.transform = 'translateY(30px)';
                product.element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                productObserver.observe(product.element);
            }
        });
    }

    // ========================================
    // PAGINAÇÃO
    // ========================================

    /**
     * Obtém total de páginas
     * @returns {number} Total de páginas
     */
    getTotalPages() {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }

    /**
     * Define página atual
     * @param {number} page - Número da página
     */
    setPage(page) {
        const totalPages = this.getTotalPages();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.updateDisplay();
            // Scroll suave para o topo dos produtos
            if (this.container) {
                this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    /**
     * Vai para próxima página
     */
    nextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.setPage(this.currentPage + 1);
        }
    }

    /**
     * Vai para página anterior
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.setPage(this.currentPage - 1);
        }
    }

    /**
     * Obtém página atual
     * @returns {number} Página atual
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Atualiza interface de paginação
     */
    updatePagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        const totalPages = this.getTotalPages();
        const currentPage = this.currentPage;

        // Se não houver produtos ou apenas uma página, esconder paginação
        if (this.filteredProducts.length === 0 || totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';

        // Limpar paginação existente
        paginationContainer.innerHTML = '';

        // Botão Anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = '← Anterior';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => this.prevPage();
        paginationContainer.appendChild(prevBtn);

        // Gerar números de página
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Ajustar início se estiver no final
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Primeira página e ellipsis
        if (startPage > 1) {
            const firstPageBtn = document.createElement('a');
            firstPageBtn.href = '#';
            firstPageBtn.className = 'pagination-btn';
            firstPageBtn.textContent = '1';
            firstPageBtn.onclick = (e) => {
                e.preventDefault();
                this.setPage(1);
            };
            paginationContainer.appendChild(firstPageBtn);

            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 0.5rem';
                paginationContainer.appendChild(ellipsis);
            }
        }

        // Páginas visíveis
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('a');
            pageBtn.href = '#';
            pageBtn.className = 'pagination-btn';
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i.toString();
            pageBtn.onclick = (e) => {
                e.preventDefault();
                this.setPage(i);
            };
            paginationContainer.appendChild(pageBtn);
        }

        // Última página e ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 0.5rem';
                paginationContainer.appendChild(ellipsis);
            }

            const lastPageBtn = document.createElement('a');
            lastPageBtn.href = '#';
            lastPageBtn.className = 'pagination-btn';
            lastPageBtn.textContent = totalPages.toString();
            lastPageBtn.onclick = (e) => {
                e.preventDefault();
                this.setPage(totalPages);
            };
            paginationContainer.appendChild(lastPageBtn);
        }

        // Botão Próximo
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Próximo →';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => this.nextPage();
        paginationContainer.appendChild(nextBtn);
    }

    /**
     * Carrega mais produtos (para implementação futura)
     */
    loadMoreProducts() {
        const loadBtn = document.querySelector('.load-more-btn');
        if (!loadBtn) return;
        
        // Estado de carregamento
        loadBtn.textContent = 'Carregando...';
        loadBtn.disabled = true;
        
        // Simular carregamento
        setTimeout(() => {
            // Aqui você integraria com uma API ou carregaria mais produtos
            console.log('Carregando mais produtos...');
            
            // Simular que não há mais produtos (50% de chance)
            if (Math.random() > 0.5) {
                loadBtn.style.display = 'none';
                const loadMoreContainer = document.querySelector('.load-more');
                if (loadMoreContainer) {
                    loadMoreContainer.innerHTML = `
                        <p style="text-align: center; color: var(--text-light); margin-top: 2rem;">
                            Todos os produtos foram carregados
                        </p>
                    `;
                }
            } else {
                loadBtn.textContent = 'Carregar Mais Produtos';
                loadBtn.disabled = false;
            }
        }, 1500);
    }

    // ========================================
    // GETTERS
    // ========================================

    /**
     * Obtém produtos filtrados
     * @returns {Array} Lista de produtos
     */
    getFilteredProducts() {
        return [...this.filteredProducts];
    }

    /**
     * Obtém todos os produtos
     * @returns {Array} Lista de produtos
     */
    getProducts() {
        return [...this.products];
    }

    /**
     * Obtém contagem de produtos filtrados
     * @returns {number} Contagem
     */
    getFilteredCount() {
        return this.filteredProducts.length;
    }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default ProductGrid;

