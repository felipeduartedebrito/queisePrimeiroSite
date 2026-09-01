/**
 * ============================================
 * PRODUTOS.JS - Página de Produtos
 * ============================================
 * 
 * Página wrapper que orquestra filtros e grid de produtos
 * 
 * @module pages/produtos
 */

import { ProductFilters } from '../components/filters.js';
import { ProductGrid } from '../components/product-grid.js';
import { api } from '../core/api.js';
import { ENVIRONMENT } from '../core/config.js';
import { createProductElement } from '../core/product-card.js';

// ========================================
// ESTADO DA PÁGINA
// ========================================

let productFilters = null;
let productGrid = null;

// ========================================
// INICIALIZAÇÃO
// ========================================

/**
 * Inicializa a página de produtos
 */
async function initializeProductsPage() {
    console.log('Inicializando página de produtos...');
    
    // Se não estiver em desenvolvimento, carregar produtos da API PRIMEIRO
    if (!ENVIRONMENT.isDevelopment) {
        try {
            console.log('Carregando produtos do Shopify...');
            await loadProductsFromAPI();
            console.log('✅ Produtos carregados e renderizados');
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            // Continuar mesmo com erro, pode ter produtos estáticos no HTML
        }
    }
    
    // Aguardar um pouco para garantir que DOM foi atualizado
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Criar instâncias dos componentes DEPOIS dos produtos serem renderizados
    productGrid = new ProductGrid('productsGrid');

    // Construir filtros de categoria com as categorias reais do catálogo
    // (feito aqui, fora do try/catch de loadProductsFromAPI, para sempre rodar)
    buildCategoryFilters(productGrid.getProducts());

    // Criar filtros com callback
    productFilters = new ProductFilters((filters) => {
        // Quando filtros mudam, aplicar aos produtos
        const filtered = productFilters.applyFiltersToProducts(productGrid.getProducts());
        productGrid.setFilteredProducts(filtered);
    });

    // Quando chegamos via ?colecao=, ignorar filtros salvos do localStorage —
    // eles são de uma sessão anterior e podem não corresponder a esta coleção.
    if (new URLSearchParams(window.location.search).get('colecao')) {
        productFilters.currentFilters = {
            categories: [], prices: [], priceRange: { min: '', max: '' }, search: ''
        };
        document.querySelectorAll('input[name="category"]').forEach(r => { r.checked = r.value === 'all'; });
        document.querySelectorAll('input[name="price"]').forEach(cb => { cb.checked = false; });
        const si = document.getElementById('searchInput');
        if (si) si.value = '';
    }

    // Configurar event listeners adicionais
    setupEventListeners();
    
    // Calibrar buckets de preço e atualizar contagens reais por filtro
    productFilters.calibratePriceFilters(productGrid.getProducts());
    productFilters.updateFilterCounts(productGrid.getProducts());

    // Configurar animações iniciais
    productGrid.setupAnimations();

    // Aplicar filtros iniciais
    const initialFiltered = productFilters.applyFiltersToProducts(productGrid.getProducts());
    productGrid.setFilteredProducts(initialFiltered);
    
    // Atualizar contador inicial
    productGrid.updateResultsCount();
    
    console.log('Página de produtos inicializada com sucesso!');
}

/**
 * Carrega produtos da API do Shopify e renderiza no DOM
 */
async function loadProductsFromAPI() {
    const container = document.getElementById('productsGrid');
    if (!container) {
        console.warn('Container productsGrid não encontrado');
        return;
    }

    // Mostrar loading
    container.innerHTML = '<div class="loading">Carregando produtos...</div>';

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const colecaoHandle = urlParams.get('colecao');

        let allProducts = [];

        if (colecaoHandle) {
            console.log(`🏷️ Filtrando por coleção: ${colecaoHandle}`);
            const { collection } = await api.getCollection(colecaoHandle);
            // Guardar título da coleção como fallback de categoria para produtos sem productType
            const collectionTitle = collection?.title || '';
            allProducts = (collection?.products || []).map(p => ({
                ...p,
                _collectionTitle: collectionTitle
            }));
            // Atualizar título da página com nome da coleção
            const h1 = document.querySelector('.products-hero h1, .page-title, h1');
            if (h1 && collectionTitle) h1.textContent = collectionTitle;
        } else {
            // Buscar TODOS os produtos paginando até não haver próxima página
            let after = null;
            let hasMore = true;

            while (hasMore) {
                const { products: page, pageInfo } = await api.getProducts({ first: 250, after });
                allProducts = allProducts.concat(page);
                hasMore = pageInfo?.hasNextPage ?? false;
                after   = pageInfo?.endCursor   ?? null;
                console.log(`📦 Página carregada: ${page.length} produtos (total até agora: ${allProducts.length})`);
            }
        }

        const products = allProducts;
        console.log(`✅ ${products.length} produtos carregados do Shopify`);
        
        // Debug: verificar primeiro produto e diagnosticar fonte de categoria
        if (products.length > 0) {
            const p0 = products[0];
            console.log('📦 Primeiro produto (diagnóstico de categoria):', {
                title:       p0.title,
                productType: p0.productType || '(vazio)',
                collections: p0.collections,
                tags:        p0.tags,
            });

            const withType = products.filter(p => p.productType).length;
            const withColl = products.filter(p => p.collections?.length).length;
            console.log(`📊 Produtos com productType: ${withType}/${products.length} | com collections: ${withColl}/${products.length}`);
        }

        if (products.length === 0) {
            container.innerHTML = '<div class="no-products">Nenhum produto encontrado.</div>';
            return;
        }

        // Limpar container
        container.innerHTML = '';

        // Renderizar cada produto
        products.forEach((product, index) => {
            // Debug: verificar se handle existe
            if (!product.handle) {
                console.warn('⚠️ Produto sem handle:', product.title, product);
            }
            
            // Debug: log do primeiro produto
            if (index === 0) {
                console.log('🔗 Criando primeiro produto:', {
                    handle: product.handle,
                    title: product.title,
                    url: `produto-individual.html?id=${product.handle}`
                });
            }
            
            const productElement = createProductElement(product);
            container.appendChild(productElement);
        });
        
        console.log(`✅ ${products.length} produtos renderizados no DOM`);

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        container.innerHTML = `<div class="error">Erro ao carregar produtos: ${error.message}</div>`;
    }
}

/**
 * Constrói dinamicamente as opções de categoria do painel de filtros
 * com base nas categorias reais capturadas dos produtos no DOM.
 * Roda sempre — tanto em dev (produtos estáticos) quanto em prod (Shopify).
 *
 * @param {Array} products - Resultado de productGrid.getProducts()
 */
function buildCategoryFilters(products) {
    const filterOptions = document.querySelector('.filter-group .filter-options');
    if (!filterOptions) {
        console.warn('⚠️ Container de filtros de categoria não encontrado');
        return;
    }

    // Normalização idêntica à de filters.js
    const normalizeText = t =>
        t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    // Título amigável: primeira letra de cada palavra em maiúscula
    const toLabel = s => s.replace(/\b\w/g, c => c.toUpperCase());

    // Coletar categorias únicas (ignorar vazio e "outros")
    const categories = [...new Set(
        products.map(p => p.category).filter(c => c && c !== 'outros')
    )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    if (categories.length === 0) {
        console.warn('⚠️ Nenhuma categoria encontrada nos produtos');
        return;
    }

    console.log(`🏷️ Categorias geradas (${categories.length}):`, categories);

    // Opção "Todas" sempre primeiro, marcada por padrão
    const allOption = `
        <div class="filter-option">
            <input type="radio" id="cat-all" name="category" value="all" checked>
            <label for="cat-all">Todas</label>
        </div>`;

    const categoryOptions = categories.map(cat => {
        const value = normalizeText(cat);
        const label = toLabel(cat);
        const id    = 'cat-' + value.replace(/\s+/g, '-');
        return `
            <div class="filter-option">
                <input type="radio" id="${id}" name="category" value="${value}">
                <label for="${id}">${label}</label>
                <span class="filter-count">0</span>
            </div>`;
    }).join('');

    filterOptions.innerHTML = allOption + categoryOptions;
}


/**
 * Configura event listeners adicionais
 */
function setupEventListeners() {
    // Ordenação
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            productGrid.setSort(e.target.value);
        });
    }
    
    // Event listener para limpar filtros
    window.addEventListener('clearAllFilters', () => {
        if (productFilters) {
            productFilters.clearAllFilters();
        }
    });
}

// ========================================
// FUNÇÕES GLOBAIS (PARA HTML)
// ========================================

/**
 * Limpa todos os filtros (chamada do HTML)
 */
function clearAllFilters() {
    if (productFilters) {
        productFilters.clearAllFilters();
    }
}


// ========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ========================================

// Aguardar DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProductsPage);
} else {
    initializeProductsPage();
}

// ========================================
// EXPORTAÇÕES GLOBAIS
// ========================================

// Disponibilizar funções globalmente para uso no HTML
if (typeof window !== 'undefined') {
    window.clearAllFilters = clearAllFilters;
    // Disponibilizar componentes para debug
    window.ProductsApp = {
        getFilters: () => productFilters,
        getGrid: () => productGrid
    };
}

export { ProductFilters, ProductGrid };

