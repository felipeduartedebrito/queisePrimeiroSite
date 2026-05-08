/**
 * ============================================
 * PRODUCT-GRID.JS - Grid de Produtos
 * ============================================
 *
 * Componente para exibição e gerenciamento de grid de produtos
 * Suporta: ordenação, visualização, infinite scroll
 *
 * @module components/ProductGrid
 */

import { ANIMATION_CONFIG } from '../core/config.js';
import { createObserver } from '../core/utils.js';

// ========================================
// CONSTANTES DE SCROLL
// ========================================

const INITIAL_LOAD = 24;   // Produtos exibidos no carregamento inicial
const BATCH_SIZE   = 12;   // Produtos carregados a cada scroll

// ========================================
// CLASSE PRODUCT GRID
// ========================================

/**
 * Classe para gerenciar grid de produtos com infinite scroll
 */
export class ProductGrid {
    constructor(containerId = 'productsGrid') {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.products = [];
        this.filteredProducts = [];
        this.currentSort = 'relevance';
        this.currentView = 'grid';
        this.loadedCount = 0;
        this.isLoading = false;
        this.animatedElements = new WeakSet();

        this.captureProductsFromDOM();
        this.setupInfiniteScroll();
    }

    // ========================================
    // CAPTURA DE PRODUTOS
    // ========================================

    captureProductsFromDOM() {
        const productElements = document.querySelectorAll('.product-item');

        this.products = Array.from(productElements).map((element, index) => {
            const name = element.querySelector('.product-name')?.textContent.trim() || '';
            const categoryAttr = element.getAttribute('data-category') || '';

            let category = categoryAttr;
            if (!category) {
                const categoryEl = element.querySelector('.product-category');
                if (categoryEl) {
                    category = categoryEl.textContent.trim().toLowerCase();
                } else {
                    const nameLower = name.toLowerCase();
                    if (nameLower.includes('garrafa')) category = 'garrafas';
                    else if (nameLower.includes('copo') || nameLower.includes('caneca')) category = 'copos';
                    else if (nameLower.includes('bolsa')) category = 'bolsas';
                    else if (nameLower.includes('mala') || nameLower.includes('mochila')) category = 'malas';
                    else if (nameLower.includes('imã') || nameLower.includes('ima')) category = 'imas';
                }
            }

            const priceAttr = element.getAttribute('data-price');
            let price = 0;
            if (priceAttr) {
                price = parseFloat(priceAttr);
                if (isNaN(price)) {
                    const priceText = element.querySelector('.price-main')?.textContent;
                    if (priceText) {
                        const priceMatch = priceText.match(/[\d,]+/);
                        if (priceMatch) price = parseFloat(priceMatch[0].replace(',', '.'));
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
        this.loadedCount = Math.min(INITIAL_LOAD, this.filteredProducts.length);

        console.log(`📦 ${this.products.length} produtos capturados`);
    }

    // ========================================
    // INFINITE SCROLL
    // ========================================

    /**
     * Cria sentinela no final do grid e observa com IntersectionObserver
     */
    setupInfiniteScroll() {
        if (!this.container) return;

        // Criar/reutilizar sentinela
        this.sentinel = document.createElement('div');
        this.sentinel.className = 'scroll-sentinel';
        this.sentinel.style.cssText = 'height:2px;width:100%;';
        this.container.parentNode.insertBefore(this.sentinel, this.container.nextSibling);

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading) {
                    this.loadMore();
                }
            });
        }, { rootMargin: '300px' }); // Começa a carregar 300px antes de chegar ao fim

        this.scrollObserver.observe(this.sentinel);
    }

    /**
     * Carrega o próximo lote de produtos
     */
    loadMore() {
        if (this.loadedCount >= this.filteredProducts.length) return;

        this.isLoading = true;

        const from = this.loadedCount;
        const to   = Math.min(from + BATCH_SIZE, this.filteredProducts.length);
        const newProducts = this.filteredProducts.slice(from, to);

        newProducts.forEach((p, i) => {
            if (!p.element) return;
            p.element.style.display = 'block';
            this.container.appendChild(p.element);
            this.animateEntry(p.element, i);
        });

        this.loadedCount = to;
        this.updateResultsCount();
        this.updateSentinel();

        this.isLoading = false;
    }

    /**
     * Atualiza visibilidade da sentinela
     */
    updateSentinel() {
        if (!this.sentinel) return;
        this.sentinel.style.display =
            this.loadedCount >= this.filteredProducts.length ? 'none' : 'block';
    }

    // ========================================
    // ATUALIZAÇÃO DE PRODUTOS
    // ========================================

    /**
     * Define produtos filtrados e reseta exibição
     */
    setFilteredProducts(filteredProducts) {
        this.filteredProducts = filteredProducts;
        this.loadedCount = Math.min(INITIAL_LOAD, filteredProducts.length);
        this.animatedElements = new WeakSet(); // resetar animações
        this.updateDisplay();
    }

    /**
     * Atualiza exibição (chamada ao filtrar ou ordenar)
     */
    updateDisplay() {
        if (!this.container) return;

        this.applySorting();

        const productsToShow = this.filteredProducts.slice(0, this.loadedCount);

        // Esconder todos
        this.products.forEach(p => {
            if (p.element) p.element.style.display = 'none';
        });

        // Mostrar e reordenar no DOM
        productsToShow.forEach((p, i) => {
            if (!p.element) return;
            p.element.style.display = 'block';
            this.container.appendChild(p.element);
        });

        this.applyCurrentView();
        this.showNoResultsMessage();
        this.updateResultsCount();
        this.updateSentinel();
        this.setupAnimations();
    }

    /**
     * Aplica view atual ao container
     */
    applyCurrentView() {
        if (!this.container) return;
        if (this.currentView === 'list') {
            this.container.classList.add('list-view');
        } else {
            this.container.classList.remove('list-view');
        }
    }

    /**
     * Atualiza contador de resultados
     */
    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = this.filteredProducts.length;
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
                    <button class="btn-primary clear-filters-btn">Limpar Filtros</button>
                `;
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
            if (noResultsElement) noResultsElement.style.display = 'none';
        }
    }

    // ========================================
    // ORDENAÇÃO
    // ========================================

    setSort(sortBy) {
        this.currentSort = sortBy;
        this.loadedCount = Math.min(INITIAL_LOAD, this.filteredProducts.length);
        this.animatedElements = new WeakSet();
        this.updateDisplay();
    }

    applySorting() {
        this.filteredProducts.sort((a, b) => {
            switch (this.currentSort) {
                case 'name-asc':    return a.name.localeCompare(b.name);
                case 'name-desc':   return b.name.localeCompare(a.name);
                case 'price-asc':   return a.price - b.price;
                case 'price-desc':  return b.price - a.price;
                case 'newest':      return b.id - a.id;
                case 'relevance':
                default:            return a.id - b.id;
            }
        });
    }

    getSort() { return this.currentSort; }

    // ========================================
    // VISUALIZAÇÃO (GRID/LIST)
    // ========================================

    setGridView() {
        this.currentView = 'grid';
        this.products.forEach(p => { if (p.element) p.element.classList.remove('list-view'); });
        this.applyCurrentView();
        this.updateViewButtons('grid');
    }

    setListView() {
        this.currentView = 'list';
        this.products.forEach(p => { if (p.element) p.element.classList.remove('list-view'); });
        this.applyCurrentView();
        this.updateViewButtons('list');
    }

    updateViewButtons(activeView) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === activeView);
        });
    }

    getView() { return this.currentView; }

    // ========================================
    // ANIMAÇÕES
    // ========================================

    /**
     * Anima entrada de um elemento (scroll reveal)
     */
    animateEntry(el, delay = 0) {
        if (!el || this.animatedElements.has(el)) return;
        this.animatedElements.add(el);
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, delay * 80);
    }

    /**
     * Configura animações scroll-reveal para produtos visíveis
     */
    setupAnimations() {
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

        const productObserver = createObserver((target, index) => {
            if (this.animatedElements.has(target)) return;
            this.animatedElements.add(target);
            setTimeout(() => {
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
            }, index * 80);
        }, observerOptions);

        this.filteredProducts.slice(0, this.loadedCount).forEach(p => {
            if (!p.element || this.animatedElements.has(p.element)) return;
            p.element.style.opacity = '0';
            p.element.style.transform = 'translateY(30px)';
            p.element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            productObserver.observe(p.element);
        });
    }

    // ========================================
    // GETTERS
    // ========================================

    getFilteredProducts() { return [...this.filteredProducts]; }
    getProducts()         { return [...this.products]; }
    getFilteredCount()    { return this.filteredProducts.length; }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default ProductGrid;
