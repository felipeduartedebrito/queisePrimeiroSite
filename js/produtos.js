// ========================================
//   PRODUTOS.JS - SCRIPTS ESPECÍFICOS
// ========================================

// Estado da aplicação
const ProductsApp = {
    currentFilters: {
        categories: [],
        prices: [],
        features: [],
        priceRange: { min: '', max: '' },
        search: ''
    },
    currentSort: 'relevance',
    currentView: 'grid',
    products: [],
    filteredProducts: [],
    currentPage: 1,
    itemsPerPage: 9
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

function initializeProductsPage() {
    console.log('Inicializando página de produtos...');
    
    // Capturar produtos do DOM
    captureProductsFromDOM();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar animações
    setupProductAnimations();
    
    // Atualizar contador inicial
    updateResultsCount();
    
    console.log('Página de produtos inicializada com sucesso!');
}

// ========================================
//   CAPTURA DE PRODUTOS DO DOM
// ========================================

function captureProductsFromDOM() {
    const productElements = document.querySelectorAll('.product-item');
    
    ProductsApp.products = Array.from(productElements).map((element, index) => {
        return {
            id: index + 1,
            element: element,
            name: element.querySelector('.product-name').textContent.trim(),
            category: element.getAttribute('data-category'),
            price: parseFloat(element.getAttribute('data-price')) || 0,
            features: element.getAttribute('data-features')?.split(',') || [],
            description: element.querySelector('.product-description').textContent.trim(),
            priceText: element.querySelector('.price-main').textContent.trim()
        };
    });
    
    ProductsApp.filteredProducts = [...ProductsApp.products];
    console.log(`${ProductsApp.products.length} produtos carregados`);
}

// ========================================
//   EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Filtros de categoria
    document.querySelectorAll('input[name="category"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCategoryFilter);
    });
    
    // Filtros de preço
    document.querySelectorAll('input[name="price"]').forEach(checkbox => {
        checkbox.addEventListener('change', handlePriceFilter);
    });
    
    // Filtros de características
    document.querySelectorAll('input[name="features"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleFeaturesFilter);
    });
    
    // Range de preço personalizado
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    if (priceMin && priceMax) {
        priceMin.addEventListener('input', debounce(handlePriceRangeFilter, 500));
        priceMax.addEventListener('input', debounce(handlePriceRangeFilter, 500));
    }
    
    // Busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Ordenação
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

// ========================================
//   SISTEMA DE FILTROS
// ========================================

function handleCategoryFilter(event) {
    const category = event.target.value;
    
    if (event.target.checked) {
        if (!ProductsApp.currentFilters.categories.includes(category)) {
            ProductsApp.currentFilters.categories.push(category);
        }
    } else {
        ProductsApp.currentFilters.categories = ProductsApp.currentFilters.categories.filter(c => c !== category);
    }
    
    applyFilters();
}

function handlePriceFilter(event) {
    const priceRange = event.target.value;
    
    if (event.target.checked) {
        if (!ProductsApp.currentFilters.prices.includes(priceRange)) {
            ProductsApp.currentFilters.prices.push(priceRange);
        }
    } else {
        ProductsApp.currentFilters.prices = ProductsApp.currentFilters.prices.filter(p => p !== priceRange);
    }
    
    applyFilters();
}

function handleFeaturesFilter(event) {
    const feature = event.target.value;
    
    if (event.target.checked) {
        if (!ProductsApp.currentFilters.features.includes(feature)) {
            ProductsApp.currentFilters.features.push(feature);
        }
    } else {
        ProductsApp.currentFilters.features = ProductsApp.currentFilters.features.filter(f => f !== feature);
    }
    
    applyFilters();
}

function handlePriceRangeFilter() {
    const minPrice = document.getElementById('priceMin').value;
    const maxPrice = document.getElementById('priceMax').value;
    
    ProductsApp.currentFilters.priceRange = {
        min: minPrice ? parseFloat(minPrice) : '',
        max: maxPrice ? parseFloat(maxPrice) : ''
    };
    
    applyFilters();
}

function handleSearch(event) {
    ProductsApp.currentFilters.search = event.target.value.toLowerCase().trim();
    applyFilters();
}

function applyFilters() {
    let filtered = [...ProductsApp.products];
    
    // Filtro por categoria
    if (ProductsApp.currentFilters.categories.length > 0) {
        filtered = filtered.filter(product => 
            ProductsApp.currentFilters.categories.includes(product.category)
        );
    }
    
    // Filtro por faixa de preço predefinida
    if (ProductsApp.currentFilters.prices.length > 0) {
        filtered = filtered.filter(product => {
            return ProductsApp.currentFilters.prices.some(priceRange => {
                return checkPriceInRange(product.price, priceRange);
            });
        });
    }
    
    // Filtro por range de preço personalizado
    if (ProductsApp.currentFilters.priceRange.min !== '' || ProductsApp.currentFilters.priceRange.max !== '') {
        filtered = filtered.filter(product => {
            const price = product.price;
            const min = ProductsApp.currentFilters.priceRange.min;
            const max = ProductsApp.currentFilters.priceRange.max;
            
            if (min !== '' && max !== '') {
                return price >= min && price <= max;
            } else if (min !== '') {
                return price >= min;
            } else if (max !== '') {
                return price <= max;
            }
            return true;
        });
    }
    
    // Filtro por características
    if (ProductsApp.currentFilters.features.length > 0) {
        filtered = filtered.filter(product => {
            return ProductsApp.currentFilters.features.some(feature => 
                product.features.includes(feature)
            );
        });
    }
    
    // Filtro por busca
    if (ProductsApp.currentFilters.search) {
        filtered = filtered.filter(product => {
            const searchTerm = ProductsApp.currentFilters.search;
            return product.name.toLowerCase().includes(searchTerm) ||
                   product.description.toLowerCase().includes(searchTerm) ||
                   product.category.toLowerCase().includes(searchTerm);
        });
    }
    
    ProductsApp.filteredProducts = filtered;
    
    // Aplicar ordenação
    applySorting();
    
    // Atualizar visualização
    updateProductsDisplay();
    updateResultsCount();
}

function checkPriceInRange(price, range) {
    switch(range) {
        case '0-50':
            return price <= 50;
        case '50-100':
            return price > 50 && price <= 100;
        case '100-200':
            return price > 100 && price <= 200;
        case '200+':
            return price > 200;
        default:
            return true;
    }
}

// ========================================
//   SISTEMA DE ORDENAÇÃO
// ========================================

function handleSort(event) {
    ProductsApp.currentSort = event.target.value;
    applySorting();
    updateProductsDisplay();
}

function applySorting() {
    const sortBy = ProductsApp.currentSort;
    
    ProductsApp.filteredProducts.sort((a, b) => {
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

// ========================================
//   SISTEMA DE VISUALIZAÇÃO
// ========================================

function setGridView() {
    ProductsApp.currentView = 'grid';
    
    const productsGrid = document.getElementById('productsGrid');
    const productItems = document.querySelectorAll('.product-item');
    
    productsGrid.classList.remove('list-view');
    productItems.forEach(item => item.classList.remove('list-view'));
    
    // Atualizar botões
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function setListView() {
    ProductsApp.currentView = 'list';
    
    const productsGrid = document.getElementById('productsGrid');
    const productItems = document.querySelectorAll('.product-item');
    
    productsGrid.classList.add('list-view');
    productItems.forEach(item => item.classList.add('list-view'));
    
    // Atualizar botões
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// ========================================
//   ATUALIZAÇÃO DA INTERFACE
// ========================================

function updateProductsDisplay() {
    // Esconder todos os produtos
    ProductsApp.products.forEach(product => {
        product.element.style.display = 'none';
    });
    
    // Mostrar produtos filtrados
    ProductsApp.filteredProducts.forEach(product => {
        product.element.style.display = 'block';
    });
    
    // Reorganizar no DOM conforme ordenação
    const productsGrid = document.getElementById('productsGrid');
    ProductsApp.filteredProducts.forEach(product => {
        productsGrid.appendChild(product.element);
    });
    
    // Aplicar view atual
    if (ProductsApp.currentView === 'list') {
        productsGrid.classList.add('list-view');
        ProductsApp.filteredProducts.forEach(product => {
            product.element.classList.add('list-view');
        });
    } else {
        productsGrid.classList.remove('list-view');
        ProductsApp.filteredProducts.forEach(product => {
            product.element.classList.remove('list-view');
        });
    }
    
    // Mostrar mensagem se não houver resultados
    showNoResultsMessage();
}

function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = ProductsApp.filteredProducts.length;
    }
}

function showNoResultsMessage() {
    const productsGrid = document.getElementById('productsGrid');
    let noResultsElement = document.querySelector('.no-results');
    
    if (ProductsApp.filteredProducts.length === 0) {
        if (!noResultsElement) {
            noResultsElement = document.createElement('div');
            noResultsElement.className = 'no-results';
            noResultsElement.innerHTML = `
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar os filtros ou buscar por outros termos.</p>
                <button onclick="clearAllFilters()" class="btn-primary">
                    Limpar Filtros
                </button>
            `;
            productsGrid.appendChild(noResultsElement);
        }
        noResultsElement.style.display = 'block';
    } else {
        if (noResultsElement) {
            noResultsElement.style.display = 'none';
        }
    }
}

// ========================================
//   FUNÇÕES GLOBAIS (CHAMADAS PELO HTML)
// ========================================

function clearAllFilters() {
    // Limpar checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Limpar inputs de preço
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    
    // Limpar busca
    document.getElementById('searchInput').value = '';
    
    // Resetar estado
    ProductsApp.currentFilters = {
        categories: [],
        prices: [],
        features: [],
        priceRange: { min: '', max: '' },
        search: ''
    };
    
    // Aplicar filtros (que agora estão vazios)
    applyFilters();
    
    console.log('Filtros limpos');
}

function loadMoreProducts() {
    const loadBtn = document.querySelector('.load-more-btn');
    
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
            document.querySelector('.load-more').innerHTML = `
                <p style="text-align: center; color: var(--text-light); margin-top: 2rem;">
                    Todos os produtos foram carregados
                </p>
            `;
        } else {
            loadBtn.textContent = 'Carregar Mais Produtos';
            loadBtn.disabled = false;
        }
    }, 1500);
}

function changePage(direction) {
    if (direction === 'prev' && ProductsApp.currentPage > 1) {
        ProductsApp.currentPage--;
    } else if (direction === 'next') {
        ProductsApp.currentPage++;
    }
    
    console.log(`Mudando para página: ${ProductsApp.currentPage}`);
    
    // Aqui você implementaria a lógica de paginação real
    // Por enquanto, apenas log para demonstração
    updatePaginationButtons();
}

function updatePaginationButtons() {
    const prevBtn = document.querySelector('.pagination-btn[onclick*="prev"]');
    const nextBtn = document.querySelector('.pagination-btn[onclick*="next"]');
    
    if (prevBtn) {
        prevBtn.disabled = ProductsApp.currentPage === 1;
    }
    
    // Atualizar números das páginas seria implementado aqui
    console.log(`Página atual: ${ProductsApp.currentPage}`);
}

// ========================================
//   ANIMAÇÕES DOS PRODUTOS
// ========================================

function setupProductAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const productObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Animação escalonada
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    // Observar todos os produtos
    document.querySelectorAll('.product-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        productObserver.observe(item);
    });
}

// ========================================
//   UTILITÁRIOS
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
//   INTEGRAÇÃO COM ANALYTICS
// ========================================

function trackProductFilter(filterType, filterValue) {
    // Integração com Google Analytics ou similar
    console.log(`Filter applied: ${filterType} = ${filterValue}`);
    
    // Exemplo de tracking:
    // gtag('event', 'filter_applied', {
    //     'filter_type': filterType,
    //     'filter_value': filterValue,
    //     'results_count': ProductsApp.filteredProducts.length
    // });
}

function trackProductView(productId, productName) {
    console.log(`Product viewed: ${productId} - ${productName}`);
    
    // Exemplo de tracking de visualização de produto:
    // gtag('event', 'view_item', {
    //     'item_id': productId,
    //     'item_name': productName,
    //     'item_category': 'products'
    // });
}

// ========================================
//   FUNCIONALIDADES AVANÇADAS
// ========================================

function setupAdvancedFeatures() {
    // Salvar filtros no localStorage
    setupFilterPersistence();
    
    // Compartilhamento de filtros via URL
    setupURLFilters();
    
    // Comparação de produtos
    setupProductComparison();
}

function setupFilterPersistence() {
    // Salvar filtros quando mudarem
    const saveFilters = () => {
        localStorage.setItem('queise_filters', JSON.stringify(ProductsApp.currentFilters));
    };
    
    // Carregar filtros salvos
    const loadSavedFilters = () => {
        const saved = localStorage.getItem('queise_filters');
        if (saved) {
            try {
                const filters = JSON.parse(saved);
                // Aplicar filtros salvos aos elementos do DOM
                applyFiltersToDOM(filters);
            } catch (e) {
                console.log('Erro ao carregar filtros salvos:', e);
            }
        }
    };
    
    // Carregar na inicialização
    loadSavedFilters();
}

function applyFiltersToDOM(filters) {
    // Aplicar categorias
    filters.categories.forEach(category => {
        const checkbox = document.querySelector(`input[value="${category}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Aplicar preços
    filters.prices.forEach(price => {
        const checkbox = document.querySelector(`input[value="${price}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Aplicar características
    filters.features.forEach(feature => {
        const checkbox = document.querySelector(`input[value="${feature}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Aplicar range de preço
    if (filters.priceRange.min) {
        document.getElementById('priceMin').value = filters.priceRange.min;
    }
    if (filters.priceRange.max) {
        document.getElementById('priceMax').value = filters.priceRange.max;
    }
    
    // Aplicar busca
    if (filters.search) {
        document.getElementById('searchInput').value = filters.search;
    }
    
    // Atualizar estado e aplicar filtros
    ProductsApp.currentFilters = filters;
    applyFilters();
}

function setupURLFilters() {
    // Ler filtros da URL
    const urlParams = new URLSearchParams(window.location.search);
    
    // Aplicar filtros da URL se existirem
    if (urlParams.has('category')) {
        const categories = urlParams.get('category').split(',');
        ProductsApp.currentFilters.categories = categories;
    }
    
    // Atualizar URL quando filtros mudarem
    const updateURL = () => {
        const params = new URLSearchParams();
        
        if (ProductsApp.currentFilters.categories.length > 0) {
            params.set('category', ProductsApp.currentFilters.categories.join(','));
        }
        
        if (ProductsApp.currentFilters.search) {
            params.set('search', ProductsApp.currentFilters.search);
        }
        
        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newURL);
    };
    
    // Chamar updateURL após aplicar filtros
    // (seria integrado na função applyFilters)
}

function setupProductComparison() {
    let comparisonList = [];
    
    // Adicionar botões de comparação aos produtos
    document.querySelectorAll('.product-item').forEach(item => {
        const compareBtn = document.createElement('button');
        compareBtn.className = 'btn-compare';
        compareBtn.textContent = 'Comparar';
        compareBtn.onclick = () => toggleProductComparison(item);
        
        const actions = item.querySelector('.product-actions');
        if (actions) {
            actions.appendChild(compareBtn);
        }
    });
}

function toggleProductComparison(productElement) {
    // Lógica de comparação de produtos seria implementada aqui
    console.log('Toggle product comparison for:', productElement.querySelector('.product-name').textContent);
}

// ========================================
//   EXPORTAR PARA ESCOPO GLOBAL
// ========================================

// Disponibilizar funções globalmente para uso no HTML
window.clearAllFilters = clearAllFilters;
window.loadMoreProducts = loadMoreProducts;
window.changePage = changePage;
window.setGridView = setGridView;
window.setListView = setListView;

// Disponibilizar objeto principal para debug
window.ProductsApp = ProductsApp;

// Log de inicialização
console.log('produtos.js carregado com sucesso!');