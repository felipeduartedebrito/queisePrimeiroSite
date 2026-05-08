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
 * Cria elemento HTML para um produto
 */
function createProductElement(product) {
    // Determinar categoria: productType > primeira coleção > 'outros'
    // (productType pode estar vazio no Shopify; collections são mais confiáveis)
    const firstCollection = product.collections?.[0];
    const categoryLabel = product.productType || firstCollection?.title || '';
    const categoryValue = categoryLabel.toLowerCase();

    const article = document.createElement('article');
    article.className = 'product-item';
    article.setAttribute('data-category', categoryValue || 'outros');
    article.setAttribute('data-price', Math.round(product.price / 100));
    article.setAttribute('data-product-handle', product.handle);

    // Imagem
    const imageUrl = product.images?.[0]?.url || '../imagens/placeholder-product.svg';
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';
    
    const imageDiv = document.createElement('div');
    imageDiv.className = 'product-image';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = product.title || 'Produto';
    img.loading = 'lazy';
    // CSS vai controlar o tamanho
    
    // Tratar erro de imagem
    img.onerror = function() {
        console.warn('Erro ao carregar imagem:', imageUrl);
        this.src = '../imagens/placeholder-product.svg';
    };
    
    imageDiv.appendChild(img);
    imageContainer.appendChild(imageDiv);

    // Info
    const info = document.createElement('div');
    info.className = 'product-info';
    
    const category = document.createElement('div');
    category.className = 'product-category';
    category.textContent = categoryLabel || 'Produto';
    
    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.title;
    
    const description = document.createElement('p');
    description.className = 'product-description';
    // Truncar descrição se muito longa
    const descText = product.description || '';
    description.textContent = descText.length > 150 ? descText.substring(0, 150) + '...' : descText;
    
    const spacer = document.createElement('div');
    spacer.className = 'product-spacer';
    
    const pricing = document.createElement('div');
    pricing.className = 'product-pricing';
    
    const priceDiv = document.createElement('div');
    const priceMain = document.createElement('div');
    priceMain.className = 'price-main';
    priceMain.textContent = formatPrice(product.price);
    
    priceDiv.appendChild(priceMain);
    pricing.appendChild(priceDiv);
    
    const actions = document.createElement('div');
    actions.className = 'product-actions';
    
    // Verificar se handle existe
    if (!product.handle) {
        console.error('⚠️ Produto sem handle:', product.title, product);
    }
    
    const handle = product.handle || product.id || '';
    // Usar caminho relativo correto (página está em paginas/, então produto-individual.html também está em paginas/)
    const detailUrl = `produto-individual.html?id=${encodeURIComponent(handle)}`;
    
    // Debug: log do link criado
    console.log(`🔗 Criando link para "${product.title}": ${detailUrl} (handle: ${handle})`);
    
    if (!handle) {
        console.warn('⚠️ Link criado sem handle para produto:', product.title);
    }
    
    const detailLink = document.createElement('a');
    detailLink.href = detailUrl;
    detailLink.className = 'btn-product btn-primary-small';
    detailLink.textContent = 'Ver Detalhes';
    
    // Debug: verificar href após criação
    console.log(`🔗 Link criado - href: "${detailLink.href}", handle: "${handle}"`);
    
    // Adicionar evento de clique para debug
    detailLink.addEventListener('click', (e) => {
        console.log('🖱️ Clique no botão "Ver Detalhes" detectado!');
        console.log('🖱️ href atual:', detailLink.href);
        console.log('🖱️ detailUrl:', detailUrl);
        console.log('🖱️ Handle sendo passado:', handle);
        
        // SALVAR handle no sessionStorage ANTES de navegar (fallback)
        if (handle) {
            sessionStorage.setItem('product_handle', handle);
            console.log('✅ Handle salvo no sessionStorage:', handle);
        }
        
        // Verificar se query string está presente
        const url = new URL(detailLink.href, window.location.origin);
        console.log('🖱️ Query string do link:', url.search);
        
        // Se o query string não estiver presente, forçar navegação manual
        if (!url.search || !url.search.includes('id=')) {
            console.warn('⚠️ Query string perdido! Forçando navegação manual...');
            e.preventDefault();
            window.location.href = detailUrl;
            return;
        }
        
        // NÃO prevenir default - deixar navegar normalmente
    });
    
    // Também tornar a imagem clicável
    const imageLink = document.createElement('a');
    imageLink.href = detailUrl;
    imageLink.style.display = 'contents'; // Não quebrar layout
    imageLink.addEventListener('click', (e) => {
        console.log('🖱️ Clique na imagem detectado!');
        console.log('🖱️ href do link:', imageLink.href);
        console.log('🖱️ detailUrl:', detailUrl);
        console.log('🖱️ Handle sendo passado:', handle);
        
        // SALVAR handle no sessionStorage ANTES de navegar (fallback)
        if (handle) {
            sessionStorage.setItem('product_handle', handle);
            console.log('✅ Handle salvo no sessionStorage:', handle);
        }
        
        // Verificar se query string está presente
        const url = new URL(imageLink.href, window.location.origin);
        console.log('🖱️ Query string do link:', url.search);
        
        // Se o query string não estiver presente, forçar navegação manual
        if (!url.search || !url.search.includes('id=')) {
            console.warn('⚠️ Query string perdido! Forçando navegação manual...');
            e.preventDefault();
            window.location.href = detailUrl;
            return;
        }
        
        // NÃO prevenir default - deixar navegar normalmente
    });
    imageContainer.insertBefore(imageLink, imageDiv);
    imageLink.appendChild(imageDiv);
    
    // Debug: apenas para produtos sem handle
    if (!handle) {
        console.warn(`⚠️ Link criado sem handle: ${detailUrl}`);
    }
    
    actions.appendChild(detailLink);
    
    // Montar estrutura
    info.appendChild(category);
    info.appendChild(name);
    info.appendChild(description);
    info.appendChild(spacer);
    info.appendChild(pricing);
    info.appendChild(actions);
    
    article.appendChild(imageContainer);
    article.appendChild(info);
    
    return article;
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

