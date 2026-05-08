/**
 * ============================================
 * FILTERS.JS - Sistema de Filtros de Produtos
 * ============================================
 * 
 * Componente para gerenciamento de filtros de produtos
 * Suporta: categorias, preços, características, busca
 * 
 * @module components/Filters
 */

import { FiltersStorage } from '../core/storage.js';
import { debounce, getUrlParam, updateUrlParam } from '../core/utils.js';

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Normaliza texto removendo acentos e convertendo para minúsculas
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizeText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
}

/**
 * Verifica se texto contém termo (flexível, sem acentos)
 * @param {string} text - Texto a verificar
 * @param {string} term - Termo a buscar
 * @returns {boolean}
 */
function flexibleIncludes(text, term) {
    return normalizeText(text).includes(normalizeText(term));
}

/**
 * Verifica se um productType (normalizado) pertence a um filtro de categoria.
 *
 * Os checkboxes de categoria são gerados dinamicamente em produtos.js com
 * o valor = normalizeText(productType), portanto a comparação é exata.
 * Não é necessário nenhum mapeamento.
 *
 * @param {string} productType - productType normalizado (sem acentos, minúsculas)
 * @param {string} filterValue - valor do checkbox (= productType normalizado)
 * @returns {boolean}
 */
function matchesProductType(productType, filterValue) {
    return productType === filterValue;
}

// ========================================
// CLASSE PRODUCT FILTERS
// ========================================

/**
 * Classe para gerenciar filtros de produtos
 */
export class ProductFilters {
    constructor(onFilterChange) {
        this.onFilterChange = onFilterChange; // Callback quando filtros mudam
        this.currentFilters = {
            categories: [],
            prices: [],
            features: [],
            priceRange: { min: '', max: '' },
            search: ''
        };
        // Teto do primeiro bucket de preço ("Até R$ X").
        // Será ajustado em calibratePriceFilters() se necessário.
        this.lowestBucketMax = 50;

        this.loadSavedFilters();
        this.loadURLFilters();
        this.initializeEventListeners();
    }

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    /**
     * Inicializa event listeners dos filtros
     */
    initializeEventListeners() {
        // Filtros de categoria
        document.querySelectorAll('input[name="category"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleCategoryFilter(e));
        });
        
        // Filtros de preço
        document.querySelectorAll('input[name="price"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handlePriceFilter(e));
        });
        
        // Filtros de características
        document.querySelectorAll('input[name="features"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleFeaturesFilter(e));
        });
        
        // Range de preço personalizado
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        
        if (priceMin && priceMax) {
            priceMin.addEventListener('input', debounce(() => this.handlePriceRangeFilter(), 500));
            priceMax.addEventListener('input', debounce(() => this.handlePriceRangeFilter(), 500));
        }
        
        // Busca
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => this.handleSearch(e), 300));
        }
    }

    // ========================================
    // HANDLERS DE FILTROS
    // ========================================

    /**
     * Manipula filtro de categoria (radio button — seleção única)
     * @param {Event} event - Evento do radio
     */
    handleCategoryFilter(event) {
        const value = event.target.value;
        // "all" ou radio desmarcado → limpar filtro de categoria
        this.currentFilters.categories = (value && value !== 'all') ? [value] : [];
        this.applyFilters();
    }

    /**
     * Manipula filtro de preço
     * @param {Event} event - Evento do checkbox
     */
    handlePriceFilter(event) {
        const priceRange = event.target.value;
        
        if (event.target.checked) {
            if (!this.currentFilters.prices.includes(priceRange)) {
                this.currentFilters.prices.push(priceRange);
            }
        } else {
            this.currentFilters.prices = this.currentFilters.prices.filter(p => p !== priceRange);
        }
        
        this.applyFilters();
    }

    /**
     * Manipula filtro de características
     * @param {Event} event - Evento do checkbox
     */
    handleFeaturesFilter(event) {
        const feature = event.target.value;
        
        if (event.target.checked) {
            if (!this.currentFilters.features.includes(feature)) {
                this.currentFilters.features.push(feature);
            }
        } else {
            this.currentFilters.features = this.currentFilters.features.filter(f => f !== feature);
        }
        
        this.applyFilters();
    }

    /**
     * Manipula filtro de range de preço
     */
    handlePriceRangeFilter() {
        const minPrice = document.getElementById('priceMin')?.value;
        const maxPrice = document.getElementById('priceMax')?.value;
        
        this.currentFilters.priceRange = {
            min: minPrice ? parseFloat(minPrice) : '',
            max: maxPrice ? parseFloat(maxPrice) : ''
        };
        
        this.applyFilters();
    }

    /**
     * Manipula busca
     * @param {Event} event - Evento do input
     */
    handleSearch(event) {
        // Normalizar busca (remover acentos será feito na comparação)
        this.currentFilters.search = event.target.value.trim();
        this.applyFilters();
    }

    // ========================================
    // APLICAÇÃO DE FILTROS
    // ========================================

    /**
     * Aplica filtros aos produtos
     * @param {Array} products - Lista de produtos
     * @returns {Array} Produtos filtrados
     */
    applyFiltersToProducts(products) {
        let filtered = [...products];

        // Filtro por categoria — baseado exclusivamente no productType da Shopify
        if (this.currentFilters.categories.length > 0) {
            filtered = filtered.filter(product => {
                // productType da Shopify (normalizado: sem acentos, minúsculas)
                const productType = normalizeText(product.category || '');

                return this.currentFilters.categories.some(filterValue => {
                    return matchesProductType(productType, filterValue);
                });
            });
        }
        
        // Filtro por faixa de preço predefinida
        if (this.currentFilters.prices.length > 0) {
            filtered = filtered.filter(product => {
                // Garantir que price é um número válido
                let productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
                
                // Se price não for válido, tentar extrair do priceText
                if (isNaN(productPrice) || productPrice <= 0) {
                    const priceText = product.priceText || '';
                    const priceMatch = priceText.match(/[\d,]+/);
                    if (priceMatch) {
                        productPrice = parseFloat(priceMatch[0].replace(',', '.').replace(/\./g, ''));
                    }
                }
                
                const matches = this.currentFilters.prices.some(priceRange => {
                    return this.checkPriceInRange(productPrice, priceRange);
                });
                
                // Debug logging
                if (!matches && productPrice > 0) {
                    // Converter para reais para debug
                    const priceInReais = productPrice > 1000 ? productPrice / 100 : productPrice;
                    console.debug('💰 Preço não matchou:', {
                        product: product.name,
                        price: product.price,
                        priceInReais: priceInReais,
                        ranges: this.currentFilters.prices
                    });
                }
                
                return matches;
            });
        }
        
        // Filtro por range de preço personalizado
        if (this.currentFilters.priceRange.min !== '' || this.currentFilters.priceRange.max !== '') {
            filtered = filtered.filter(product => {
                // Garantir que price é um número válido
                let productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
                
                // Detectar se price está em centavos e converter
                if (productPrice > 1000) {
                    productPrice = productPrice / 100;
                }
                
                const min = this.currentFilters.priceRange.min ? parseFloat(this.currentFilters.priceRange.min) : null;
                const max = this.currentFilters.priceRange.max ? parseFloat(this.currentFilters.priceRange.max) : null;
                
                if (min !== null && max !== null) {
                    return productPrice >= min && productPrice <= max;
                } else if (min !== null) {
                    return productPrice >= min;
                } else if (max !== null) {
                    return productPrice <= max;
                }
                return true;
            });
        }
        
        // Filtro por características (flexível - sem acentos)
        if (this.currentFilters.features.length > 0) {
            filtered = filtered.filter(product => {
                if (!product.features || product.features.length === 0) return false;
                return this.currentFilters.features.some(filterFeature => {
                    const normalizedFilter = normalizeText(filterFeature);
                    return product.features.some(productFeature => 
                        flexibleIncludes(productFeature, normalizedFilter)
                    );
                });
            });
        }
        
        // Filtro por busca (flexível - sem acentos, case-insensitive)
        if (this.currentFilters.search) {
            filtered = filtered.filter(product => {
                const searchTerm = normalizeText(this.currentFilters.search);
                return flexibleIncludes(product.name, searchTerm) ||
                       flexibleIncludes(product.description, searchTerm) ||
                       flexibleIncludes(product.category, searchTerm) ||
                       // Também busca nas características/features
                       (product.features && product.features.some(feature => 
                           flexibleIncludes(feature, searchTerm)
                       ));
            });
        }
        
        return filtered;
    }

    /**
     * Atualiza as contagens exibidas ao lado de cada opção de filtro
     * com base nos produtos reais do catálogo.
     * @param {Array} products - Produtos capturados do DOM
     */
    updateFilterCounts(products) {
        if (!products || products.length === 0) return;

        // Salva estado atual para restaurar depois
        const saved = JSON.parse(JSON.stringify(this.currentFilters));

        const countFor = (field, value) => {
            this.currentFilters = {
                categories: [],
                prices: [],
                features: [],
                priceRange: { min: '', max: '' },
                search: ''
            };
            this.currentFilters[field] = [value];
            return this.applyFiltersToProducts(products).length;
        };

        // Categorias
        document.querySelectorAll('input[name="category"]').forEach(cb => {
            const count = countFor('categories', cb.value);
            const span = cb.closest('.filter-option')?.querySelector('.filter-count');
            if (span) span.textContent = count;
        });

        // Faixas de preço
        document.querySelectorAll('input[name="price"]').forEach(cb => {
            const count = countFor('prices', cb.value);
            const span = cb.closest('.filter-option')?.querySelector('.filter-count');
            if (span) span.textContent = count;
        });

        // Características
        document.querySelectorAll('input[name="features"]').forEach(cb => {
            const count = countFor('features', cb.value);
            const span = cb.closest('.filter-option')?.querySelector('.filter-count');
            if (span) span.textContent = count;
        });

        // Restaura estado
        this.currentFilters = saved;
    }

    /**
     * Calibra os buckets de preço com base no catálogo real de produtos.
     * Garante que o primeiro bucket ("Até R$ X") sempre inclui pelo menos
     * o produto mais barato do catálogo.
     * @param {Array} products - Produtos capturados do DOM
     */
    calibratePriceFilters(products) {
        if (!products || products.length === 0) return;

        // Coletar preços válidos (normalizar centavos → reais)
        const prices = products
            .map(p => {
                let price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
                if (price > 1000) price = price / 100;
                return price;
            })
            .filter(p => p > 0);

        if (prices.length === 0) return;

        const minPrice = Math.min(...prices);

        // Se o produto mais barato já cabe no bucket padrão, nada a fazer
        if (minPrice <= this.lowestBucketMax) return;

        // Arredondar para cima para o múltiplo de 10 acima do menor preço
        const newMax = Math.ceil(minPrice / 10) * 10;
        this.lowestBucketMax = newMax;

        // Atualizar label no DOM
        const label = document.querySelector('label[for="price1"]');
        if (label) label.textContent = `Até R$ ${newMax}`;

        console.log(`💰 Bucket de preço ajustado: "Até R$ ${newMax}" (menor produto: R$ ${minPrice})`);
    }

    /**
     * Verifica se preço está na faixa
     * @param {number} price - Preço do produto (pode estar em reais ou centavos)
     * @param {string} range - Faixa de preço (ex: '0-50')
     * @returns {boolean}
     */
    checkPriceInRange(price, range) {
        // Garantir que price é um número
        let priceNum = typeof price === 'number' ? price : parseFloat(price) || 0;

        // Se price não for válido, não matcha
        if (isNaN(priceNum) || priceNum <= 0) {
            return false;
        }

        // Detectar se price está em centavos (valores > 1000 provavelmente são centavos)
        // Converter para reais se necessário
        if (priceNum > 1000) {
            priceNum = priceNum / 100;
        }

        switch(range) {
            case '0-50':
                // Usa lowestBucketMax dinâmico (ajustado por calibratePriceFilters)
                return priceNum >= 0 && priceNum <= this.lowestBucketMax;
            case '50-100':
                return priceNum >= 50 && priceNum <= 100;
            case '100-200':
                return priceNum >= 100 && priceNum <= 200;
            case '200+':
                return priceNum > 200;
            default:
                return true;
        }
    }

    /**
     * Aplica filtros e notifica mudança
     */
    applyFilters() {
        // Salvar filtros
        this.saveFilters();
        this.updateURL();
        
        // Notificar mudança
        if (this.onFilterChange) {
            this.onFilterChange(this.currentFilters);
        }
    }

    // ========================================
    // GERENCIAMENTO DE ESTADO
    // ========================================

    /**
     * Limpa todos os filtros
     */
    clearAllFilters() {
        // Limpar checkboxes de preço e características
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        // Restaurar radio "Todas" como selecionado
        const allRadio = document.getElementById('cat-all');
        if (allRadio) allRadio.checked = true;
        document.querySelectorAll('input[type="radio"][name="category"]').forEach(r => {
            if (r.value !== 'all') r.checked = false;
        });
        
        // Limpar inputs de preço
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        if (priceMin) priceMin.value = '';
        if (priceMax) priceMax.value = '';
        
        // Limpar busca
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        // Resetar estado
        this.currentFilters = {
            categories: [],
            prices: [],
            features: [],
            priceRange: { min: '', max: '' },
            search: ''
        };
        
        // Aplicar filtros (que agora estão vazios)
        this.applyFilters();
    }

    /**
     * Obtém filtros atuais
     * @returns {Object} Objeto de filtros
     */
    getFilters() {
        return { ...this.currentFilters };
    }

    /**
     * Define filtros
     * @param {Object} filters - Objeto de filtros
     */
    setFilters(filters) {
        this.currentFilters = { ...filters };
        this.applyFiltersToDOM();
        this.applyFilters();
    }

    // ========================================
    // PERSISTÊNCIA
    // ========================================

    /**
     * Salva filtros no storage
     */
    saveFilters() {
        FiltersStorage.save(this.currentFilters);
    }

    /**
     * Carrega filtros salvos
     */
    loadSavedFilters() {
        const saved = FiltersStorage.get();
        if (saved && Object.keys(saved).length > 0) {
            this.currentFilters = { ...saved };
            this.applyFiltersToDOM();
        }
    }

    /**
     * Aplica filtros ao DOM (restaura checkboxes e inputs)
     * @param {Object} filters - Filtros a aplicar (opcional, usa currentFilters se não fornecido)
     */
    applyFiltersToDOM(filters = null) {
        const filtersToApply = filters || this.currentFilters;
        
        // Aplicar categorias
        filtersToApply.categories.forEach(category => {
            const checkbox = document.querySelector(`input[name="category"][value="${category}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Aplicar preços
        filtersToApply.prices.forEach(price => {
            const checkbox = document.querySelector(`input[name="price"][value="${price}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Aplicar características
        filtersToApply.features.forEach(feature => {
            const checkbox = document.querySelector(`input[name="features"][value="${feature}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Aplicar range de preço
        if (filtersToApply.priceRange.min) {
            const priceMin = document.getElementById('priceMin');
            if (priceMin) priceMin.value = filtersToApply.priceRange.min;
        }
        if (filtersToApply.priceRange.max) {
            const priceMax = document.getElementById('priceMax');
            if (priceMax) priceMax.value = filtersToApply.priceRange.max;
        }
        
        // Aplicar busca
        if (filtersToApply.search) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = filtersToApply.search;
        }
    }

    // ========================================
    // URL PARAMETERS
    // ========================================

    /**
     * Carrega filtros da URL
     */
    loadURLFilters() {
        const categoryParam = getUrlParam('category');
        if (categoryParam) {
            this.currentFilters.categories = categoryParam.split(',');
        }
        
        const searchParam = getUrlParam('search');
        if (searchParam) {
            this.currentFilters.search = searchParam.toLowerCase();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = searchParam;
        }
        
        // Aplicar filtros da URL ao DOM
        if (categoryParam || searchParam) {
            this.applyFiltersToDOM();
        }
    }

    /**
     * Atualiza URL com filtros atuais
     */
    updateURL() {
        const params = new URLSearchParams();
        
        if (this.currentFilters.categories.length > 0) {
            params.set('category', this.currentFilters.categories.join(','));
        }
        
        if (this.currentFilters.search) {
            params.set('search', this.currentFilters.search);
        }
        
        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newURL);
    }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default ProductFilters;

