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
import { formatPrice } from '../core/utils.js';

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
        // Buscar TODOS os produtos paginando até não haver próxima página
        let allProducts = [];
        let after = null;
        let hasMore = true;

        while (hasMore) {
            const { products: page, pageInfo } = await api.getProducts({ first: 250, after });
            allProducts = allProducts.concat(page);
            hasMore = pageInfo?.hasNextPage ?? false;
            after   = pageInfo?.endCursor   ?? null;
            console.log(`📦 Página carregada: ${page.length} produtos (total até agora: ${allProducts.length})`);
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
 * Cria elemento HTML para um produto (estilo Tuyo — sem botão, swatches + hover)
 */
function createProductElement(product) {
    const firstCollection = product.collections?.[0];
    const categoryLabel = product.productType || firstCollection?.title || '';
    const categoryValue = categoryLabel.toLowerCase();

    const handle = product.handle || product.id || '';
    const detailUrl = `produto-individual.html?id=${encodeURIComponent(handle)}`;

    const article = document.createElement('article');
    article.className = 'product-item';
    article.setAttribute('data-category', categoryValue || 'outros');
    article.setAttribute('data-price', Math.round(product.price / 100));
    article.setAttribute('data-product-handle', handle);
    article.style.cursor = 'pointer';

    const navigateToDetail = () => {
        if (handle) sessionStorage.setItem('product_handle', handle);
        window.location.href = detailUrl;
    };

    // Imagem
    const defaultImageUrl = product.images?.[0]?.url || '../imagens/placeholder-product.svg';
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';
    imageContainer.addEventListener('click', navigateToDetail);

    const img = document.createElement('img');
    img.className = 'product-main-img';
    img.src = defaultImageUrl;
    img.alt = product.title || 'Produto';
    img.loading = 'lazy';
    img.onerror = function() { this.src = '../imagens/placeholder-product.svg'; };
    imageContainer.appendChild(img);

    // Swatches de cor
    const swatchRow = document.createElement('div');
    swatchRow.className = 'product-card-swatches';

    const colorOption = product.options?.find(o => /^cor$/i.test(o.name.trim()));
    if (colorOption && product.variants?.length) {
        // Mapear cor → imagem da variante; fallback por índice no array de imagens
        const colorImageMap = {};
        const allImages = product.images || [];
        colorOption.values.forEach((colorName, colorIdx) => {
            const variant = product.variants.find(v =>
                v.selectedOptions?.some(o => /^cor$/i.test(o.name.trim()) && o.value === colorName)
            );
            colorImageMap[colorName] = variant?.image?.url || defaultImageUrl;
        });

        // Preload das imagens de variantes para eliminar delay no hover
        Object.values(colorImageMap).forEach(url => {
            if (url && url !== defaultImageUrl) {
                const preload = new Image();
                preload.src = url;
            }
        });

        const MAX_SHOWN = 5;
        const colors = colorOption.values;
        const shown = colors.slice(0, MAX_SHOWN);
        const extra = colors.length - MAX_SHOWN;

        shown.forEach(colorName => {
            const hex = _cardColorToHex(colorName);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'product-card-swatch';
            btn.style.background = hex;
            btn.title = colorName;
            btn.setAttribute('aria-label', colorName);
            btn.style.boxShadow = `0 0 0 2px #fff, 0 0 0 3.5px #d0d0d0`;

            btn.addEventListener('mouseenter', () => {
                const imgUrl = colorImageMap[colorName];
                if (imgUrl) img.src = imgUrl;
            });
            btn.addEventListener('mouseleave', () => {
                img.src = defaultImageUrl;
            });
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateToDetail();
            });

            swatchRow.appendChild(btn);
        });

        if (extra > 0) {
            const more = document.createElement('span');
            more.className = 'product-card-swatches-more';
            more.textContent = `+${extra}`;
            swatchRow.appendChild(more);
        }
    }

    // Nome
    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.title;
    name.addEventListener('click', navigateToDetail);

    // Preço
    const priceEl = document.createElement('div');
    priceEl.className = 'price-main';
    priceEl.textContent = formatPrice(product.price);
    priceEl.addEventListener('click', navigateToDetail);

    article.appendChild(imageContainer);
    article.appendChild(swatchRow);
    article.appendChild(name);
    article.appendChild(priceEl);

    return article;
}

function _cardColorToHex(name) {
    const map = {
        'preto': '#1a1a1a', 'black': '#1a1a1a',
        'branco': '#f0f0f0', 'white': '#f0f0f0',
        'prata': '#a8a8a8', 'silver': '#a8a8a8',
        'dourado': '#c9a84c', 'gold': '#c9a84c',
        'azul': '#2563eb', 'blue': '#2563eb',
        'azul claro': '#93c5fd', 'light blue': '#93c5fd',
        'azul marinho': '#1e3a5f', 'navy': '#1e3a5f', 'navy blue': '#1e3a5f',
        'azul petróleo': '#0f4c5c', 'teal': '#0f766e',
        'verde': '#16a34a', 'green': '#16a34a',
        'verde claro': '#86efac', 'light green': '#86efac',
        'verde escuro': '#14532d', 'dark green': '#14532d',
        'verde militar': '#4b5320', 'olive': '#4b5320',
        'vermelho': '#dc2626', 'red': '#dc2626',
        'rosa': '#f472b6', 'pink': '#f472b6',
        'rosa claro': '#fbcfe8', 'light pink': '#fbcfe8',
        'rosa bebê': '#fce7f3',
        'salmão': '#fa8072', 'salmon': '#fa8072',
        'laranja': '#f97316', 'orange': '#f97316',
        'amarelo': '#facc15', 'yellow': '#facc15',
        'roxo': '#7c3aed', 'purple': '#7c3aed',
        'lilás': '#c4b5fd', 'lilac': '#c4b5fd',
        'lavanda': '#e9d5ff', 'lavender': '#e9d5ff',
        'vinho': '#7f1d1d', 'burgundy': '#7f1d1d', 'wine': '#7f1d1d',
        'marrom': '#92400e', 'brown': '#92400e',
        'bege': '#d4b896', 'beige': '#d4b896',
        'cinza': '#9ca3af', 'gray': '#9ca3af', 'grey': '#9ca3af',
        'cinza claro': '#e5e7eb', 'light gray': '#e5e7eb',
        'cinza escuro': '#374151', 'dark gray': '#374151',
        'terracota': '#c1674a', 'terracotta': '#c1674a',
        'cobre': '#b87333', 'copper': '#b87333',
    };
    return map[name.toLowerCase()] || '#888888';
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

