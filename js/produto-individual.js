// ========================================
//   PRODUTO-INDIVIDUAL.JS - PREPARADO PARA SHOPIFY
// ========================================

// ========================================
//   CONFIGURAÇÃO DA API
// ========================================

const API_CONFIG = {
    // Configuração para desenvolvimento (mock)
    isDevelopment: true,
    
    // Configuração para produção (Shopify)
    shopify: {
        domain: 'queise.myshopify.com', // Será configurado quando criar a loja
        storefrontAccessToken: '', // Token será gerado na Shopify
        apiVersion: '2024-01'
    },
    
    // URLs da API
    endpoints: {
        products: '/api/products',
        variants: '/api/variants',
        cart: '/api/cart'
    }
};

// ========================================
//   BASE DE DADOS MOCK (DESENVOLVIMENTO)
// ========================================

const MOCK_PRODUCTS = {
    'garrafa-stanley-1l': {
        // Estrutura compatível com Shopify Product API
        id: 'garrafa-stanley-1l',
        handle: 'garrafa-stanley-1l', // Shopify handle
        title: 'Garrafa Stanley 1L Personalizada',
        product_type: 'Garrafas Térmicas',
        vendor: 'QUEISE',
        tags: ['térmica', 'personalizada', 'premium', 'stanley'],
        
        // Preços em centavos (padrão Shopify)
        price: 16500, // R$ 165,00
        compare_at_price: null,
        
        // Metafields para personalização (Shopify)
        metafields: {
            personalization: {
                enabled: true,
                price: 2000, // R$ 20,00
                max_chars: 30,
                allowed_fonts: ['Arial', 'Times New Roman', 'Brush Script MT', 'Arial Black'],
                allowed_colors: ['#FFFFFF', '#000000', '#FFD700', '#C0C0C0'],
                allowed_positions: ['center', 'bottom', 'side']
            }
        },
        
        // Imagens
        images: [
            {
                id: 1,
                src: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                alt: 'Garrafa Stanley 1L - Vista frontal'
            }
        ],
        
        // Variantes (Shopify variants)
        variants: [
            {
                id: 'var_1',
                title: '600ml / Preto',
                price: 12500,
                option1: '600ml',
                option2: 'Preto',
                available: true,
                inventory_quantity: 50
            },
            {
                id: 'var_2', 
                title: '1L / Preto',
                price: 16500,
                option1: '1L',
                option2: 'Preto',
                available: true,
                inventory_quantity: 30
            },
            {
                id: 'var_3',
                title: '1.2L / Preto', 
                price: 18500,
                option1: '1.2L',
                option2: 'Preto',
                available: true,
                inventory_quantity: 20
            }
        ],
        
        // Opções de produto (Shopify options)
        options: [
            {
                name: 'Tamanho',
                values: ['600ml', '1L', '1.2L']
            },
            {
                name: 'Cor',
                values: ['Preto', 'Azul', 'Verde', 'Vermelho']
            }
        ],
        
        // Descrição e características
        body_html: '<p>Garrafa térmica premium Stanley com isolamento duplo de aço inoxidável. Mantém bebidas quentes por até 12 horas e frias por até 24 horas.</p>',
        
        features: [
            '🌡️ Isolamento térmico duplo',
            '🔒 Tampa com vedação hermética', 
            '⚡ Aço inoxidável 18/8',
            '🎨 Personalizável com texto',
            '♻️ Livre de BPA',
            '🏆 Garantia vitalícia Stanley'
        ]
    },
    
    'copo-termico-500ml': {
        id: 'copo-termico-500ml',
        handle: 'copo-termico-500ml',
        title: 'Copo Térmico 500ml',
        product_type: 'Copos Térmicos',
        vendor: 'QUEISE',
        tags: ['térmico', 'personalizado', 'café', 'copo'],
        
        price: 8000, // R$ 80,00
        
        metafields: {
            personalization: {
                enabled: true,
                price: 2000,
                max_chars: 25
            }
        },
        
        variants: [
            {
                id: 'var_cup_1',
                title: '350ml / Preto',
                price: 6500,
                option1: '350ml',
                option2: 'Preto',
                available: true
            },
            {
                id: 'var_cup_2',
                title: '500ml / Preto', 
                price: 8000,
                option1: '500ml',
                option2: 'Preto',
                available: true
            }
        ],
        
        options: [
            { name: 'Tamanho', values: ['350ml', '500ml'] },
            { name: 'Cor', values: ['Preto', 'Azul', 'Branco'] }
        ],
        
        images: [
            {
                id: 2,
                src: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                alt: 'Copo Térmico 500ml'
            }
        ],
        
        body_html: '<p>Copo térmico ergonômico com tampa antivazamento, ideal para café, chá e bebidas quentes.</p>',
        
        features: [
            '☕ Perfeito para café e chá',
            '🔒 Tampa antivazamento',
            '🌡️ Isolamento térmico',
            '✋ Design ergonômico',
            '🎨 Personalizável'
        ]
    }
    
    // Outros produtos seguem o mesmo padrão...
};

// ========================================
//   CAMADA DE ABSTRAÇÃO DA API
// ========================================

class ProductAPI {
    constructor() {
        this.isDevelopment = API_CONFIG.isDevelopment;
    }
    
    // Buscar produto por ID/handle
    async getProduct(productHandle) {
        if (this.isDevelopment) {
            // Desenvolvimento: usar mock
            return this.getMockProduct(productHandle);
        } else {
            // Produção: usar Shopify API
            return this.getShopifyProduct(productHandle);
        }
    }
    
    // Buscar múltiplos produtos
    async getProducts(filters = {}) {
        if (this.isDevelopment) {
            return this.getMockProducts(filters);
        } else {
            return this.getShopifyProducts(filters);
        }
    }
    
    // Adicionar ao carrinho
    async addToCart(variantId, quantity, properties = {}) {
        if (this.isDevelopment) {
            return this.addToMockCart(variantId, quantity, properties);
        } else {
            return this.addToShopifyCart(variantId, quantity, properties);
        }
    }
    
    // ========================================
    //   MÉTODOS MOCK (DESENVOLVIMENTO)
    // ========================================
    
    getMockProduct(handle) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const product = MOCK_PRODUCTS[handle];
                if (product) {
                    resolve({
                        success: true,
                        product: product
                    });
                } else {
                    reject({
                        success: false,
                        error: 'Produto não encontrado'
                    });
                }
            }, 300); // Simular delay da API
        });
    }
    
    getMockProducts(filters) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const products = Object.values(MOCK_PRODUCTS);
                resolve({
                    success: true,
                    products: products
                });
            }, 500);
        });
    }
    
    addToMockCart(variantId, quantity, properties) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular adição ao carrinho
                const cartItem = {
                    id: variantId,
                    quantity: quantity,
                    properties: properties,
                    added_at: new Date().toISOString()
                };
                
                // Salvar no localStorage
                let cart = JSON.parse(localStorage.getItem('queise_cart')) || [];
                cart.push(cartItem);
                localStorage.setItem('queise_cart', JSON.stringify(cart));
                
                resolve({
                    success: true,
                    item: cartItem
                });
            }, 200);
        });
    }
    
    // ========================================
    //   MÉTODOS SHOPIFY (PRODUÇÃO)
    // ========================================
    
    async getShopifyProduct(handle) {
        try {
            const response = await fetch(
                `https://${API_CONFIG.shopify.domain}/api/${API_CONFIG.shopify.apiVersion}/graphql.json`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Storefront-Access-Token': API_CONFIG.shopify.storefrontAccessToken
                    },
                    body: JSON.stringify({
                        query: `
                            query getProduct($handle: String!) {
                                product(handle: $handle) {
                                    id
                                    handle
                                    title
                                    productType
                                    vendor
                                    tags
                                    priceRange {
                                        minVariantPrice {
                                            amount
                                            currencyCode
                                        }
                                    }
                                    variants(first: 100) {
                                        edges {
                                            node {
                                                id
                                                title
                                                price {
                                                    amount
                                                    currencyCode
                                                }
                                                selectedOptions {
                                                    name
                                                    value
                                                }
                                                availableForSale
                                                quantityAvailable
                                            }
                                        }
                                    }
                                    images(first: 10) {
                                        edges {
                                            node {
                                                id
                                                url
                                                altText
                                            }
                                        }
                                    }
                                    options {
                                        name
                                        values
                                    }
                                    descriptionHtml
                                    metafields(first: 10) {
                                        edges {
                                            node {
                                                namespace
                                                key
                                                value
                                            }
                                        }
                                    }
                                }
                            }
                        `,
                        variables: { handle }
                    })
                }
            );
            
            const data = await response.json();
            
            if (data.errors) {
                throw new Error(data.errors[0].message);
            }
            
            return {
                success: true,
                product: this.transformShopifyProduct(data.data.product)
            };
            
        } catch (error) {
            console.error('Erro ao buscar produto Shopify:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async addToShopifyCart(variantId, quantity, properties) {
        try {
            // Usar Shopify Cart API
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: variantId,
                    quantity: quantity,
                    properties: properties
                })
            });
            
            const data = await response.json();
            
            return {
                success: true,
                item: data
            };
            
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho Shopify:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Transformar dados do Shopify para formato padrão
    transformShopifyProduct(shopifyProduct) {
        return {
            id: shopifyProduct.handle,
            handle: shopifyProduct.handle,
            title: shopifyProduct.title,
            product_type: shopifyProduct.productType,
            vendor: shopifyProduct.vendor,
            tags: shopifyProduct.tags,
            price: parseInt(shopifyProduct.priceRange.minVariantPrice.amount * 100),
            variants: shopifyProduct.variants.edges.map(edge => ({
                id: edge.node.id,
                title: edge.node.title,
                price: parseInt(edge.node.price.amount * 100),
                options: edge.node.selectedOptions,
                available: edge.node.availableForSale,
                inventory_quantity: edge.node.quantityAvailable
            })),
            images: shopifyProduct.images.edges.map(edge => ({
                id: edge.node.id,
                src: edge.node.url,
                alt: edge.node.altText
            })),
            options: shopifyProduct.options,
            body_html: shopifyProduct.descriptionHtml,
            metafields: this.parseMetafields(shopifyProduct.metafields.edges)
        };
    }
    
    parseMetafields(metafieldsEdges) {
        const metafields = {};
        metafieldsEdges.forEach(edge => {
            const { namespace, key, value } = edge.node;
            if (!metafields[namespace]) {
                metafields[namespace] = {};
            }
            metafields[namespace][key] = JSON.parse(value);
        });
        return metafields;
    }
}

// ========================================
//   INSTÂNCIA GLOBAL DA API
// ========================================

const productAPI = new ProductAPI();

// ========================================
//   ESTADO DA APLICAÇÃO (ATUALIZADO)
// ========================================

const ProductApp = {
    productData: null,
    selectedVariant: null,
    selectedVariants: {
        size: null,
        color: null,
        quantity: 1,
        customText: '',
        selectedFont: 'Arial',
        textColor: '#FFFFFF',
        textPosition: 'center'
    },
    gallery: {
        currentImage: 0,
        images: []
    }
};

// ========================================
//   INICIALIZAÇÃO ATUALIZADA
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeProductPage();
});

async function initializeProductPage() {
    console.log('Inicializando página do produto...');
    
    try {
        // Mostrar loading
        showLoading();
        
        // Capturar ID do produto da URL
        const productHandle = getProductHandleFromURL();
        
        if (!productHandle) {
            throw new Error('Handle do produto não encontrado na URL');
        }
        
        // Buscar produto via API
        const response = await productAPI.getProduct(productHandle);
        
        if (!response.success) {
            throw new Error(response.error);
        }
        
        // Carregar dados do produto
        loadProductData(response.product);
        
        // Configurar página
        setupGallery();
        setupProductVariants();
        setupPersonalization();
        setupQuantityControls();
        setupInfoTabs();
        setupActionButtons();
        
        // Atualizar preços iniciais
        updatePricing();
        
        // Esconder loading
        hideLoading();
        
        console.log('Página do produto inicializada com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar página:', error);
        showProductNotFound(error.message);
        hideLoading();
    }
}

// ========================================
//   FUNÇÕES DE LOADING
// ========================================

function showLoading() {
    document.querySelector('.product-main').innerHTML = `
        <div class="loading-container" style="text-align: center; padding: 4rem;">
            <div class="loader"></div>
            <p>Carregando produto...</p>
        </div>
    `;
}

function hideLoading() {
    const loadingContainer = document.querySelector('.loading-container');
    if (loadingContainer) {
        loadingContainer.remove();
    }
}

// ========================================
//   CARREGAMENTO DO PRODUTO (ATUALIZADO)
// ========================================

function getProductHandleFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); // Handle do produto
}

function loadProductData(product) {
    ProductApp.productData = product;
    
    // Atualizar informações na página
    updateProductInfo(product);
    
    // Configurar variante padrão
    setupDefaultVariant(product);
    
    // Atualizar breadcrumb
    updateBreadcrumb(product);
    
    console.log('Produto carregado:', product.title);
}

function updateProductInfo(product) {
    // Atualizar título da página
    document.title = `${product.title} - QUEISE | Use Exclusividade`;
    
    // Atualizar elementos da página
    document.querySelector('.product-category').textContent = product.product_type;
    document.querySelector('.product-title').textContent = product.title;
    
    // Atualizar descrição
    if (product.body_html) {
        document.querySelector('.product-description p').innerHTML = product.body_html.replace(/<[^>]*>/g, '');
    }
    
    // Atualizar características
    if (product.features) {
        const featuresList = document.querySelector('.product-features ul');
        featuresList.innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');
    }
    
    // Atualizar imagens
    if (product.images && product.images.length > 0) {
        document.getElementById('mainProductImage').src = product.images[0].src;
        ProductApp.gallery.images = product.images.map(img => img.src);
    }
}

function setupDefaultVariant(product) {
    if (product.variants && product.variants.length > 0) {
        // Selecionar primeira variante disponível
        const defaultVariant = product.variants.find(v => v.available) || product.variants[0];
        ProductApp.selectedVariant = defaultVariant;
        
        // Atualizar preço
        updatePricing();
    }
}

// ========================================
//   FUNÇÃO DE ADICIONAR AO CARRINHO (ATUALIZADA)
// ========================================

async function handleAddToCart() {
    if (!ProductApp.productData || !ProductApp.selectedVariant) {
        alert('Erro: Produto ou variante não selecionado');
        return;
    }
    
    const addToCartBtn = document.getElementById('addToCart');
    
    try {
        // Mostrar loading
        addToCartBtn.innerHTML = '<span>Adicionando...</span>';
        addToCartBtn.disabled = true;
        
        // Preparar propriedades de personalização
        const properties = {};
        if (ProductApp.selectedVariants.customText) {
            properties['Texto Personalizado'] = ProductApp.selectedVariants.customText;
            properties['Fonte'] = ProductApp.selectedVariants.selectedFont;
            properties['Cor do Texto'] = ProductApp.selectedVariants.textColor;
            properties['Posição'] = ProductApp.selectedVariants.textPosition;
        }
        
        // Adicionar ao carrinho via API
        const response = await productAPI.addToCart(
            ProductApp.selectedVariant.id,
            ProductApp.selectedVariants.quantity,
            properties
        );
        
        if (response.success) {
            // Feedback de sucesso
            addToCartBtn.innerHTML = '<span>✓ Adicionado!</span>';
            addToCartBtn.style.background = '#27AE60';
            
            setTimeout(() => {
                addToCartBtn.innerHTML = `
                    <span>Adicionar ao Carrinho</span>
                    <span class="price">R$ <span id="cartPrice">${formatPrice(getCurrentTotalPrice())}</span></span>
                `;
                addToCartBtn.style.background = '';
                addToCartBtn.disabled = false;
            }, 2000);
            
            // Atualizar contador do carrinho
            updateCartCounter();
            
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert('Erro ao adicionar ao carrinho. Tente novamente.');
        
        // Restaurar botão
        addToCartBtn.innerHTML = `
            <span>Adicionar ao Carrinho</span>
            <span class="price">R$ <span id="cartPrice">${formatPrice(getCurrentTotalPrice())}</span></span>
        `;
        addToCartBtn.disabled = false;
    }
}

// ========================================
//   FUNÇÕES AUXILIARES
// ========================================

function getCurrentTotalPrice() {
    if (!ProductApp.selectedVariant) return 0;
    
    const basePrice = ProductApp.selectedVariant.price / 100; // Converter centavos para reais
    const personalizationPrice = ProductApp.selectedVariants.customText ? 
        (ProductApp.productData.metafields?.personalization?.price || 2000) / 100 : 0;
    
    return (basePrice + personalizationPrice) * ProductApp.selectedVariants.quantity;
}

function formatPrice(price) {
    return price.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ========================================
//   EXPORTAR PARA ESCOPO GLOBAL
// ========================================

window.ProductApp = ProductApp;
window.productAPI = productAPI;

console.log('produto-individual.js (Shopify-ready) carregado com sucesso!');
    'garrafa-stanley-1l': {
        id: 'garrafa-stanley-1l',
        name: 'Garrafa Stanley 1L Personalizada',
        category: 'Garrafas Térmicas',
        basePrice: 165,
        personalizationPrice: 20,
        description: 'Garrafa térmica premium Stanley com isolamento duplo de aço inoxidável. Mantém bebidas quentes por até 12 horas e frias por até 24 horas. Design robusto e elegante, perfeita para aventuras e uso diário.',
        features: [
            '🌡️ Isolamento térmico duplo',
            '🔒 Tampa com vedação hermética',
            '⚡ Aço inoxidável 18/8',
            '🎨 Personalizável com texto',
            '♻️ Livre de BPA',
            '🏆 Garantia vitalícia Stanley'
        ],
        variants: {
            sizes: [
                { id: '600ml', name: '600ml', price: 125 },
                { id: '1l', name: '1L', price: 165, default: true },
                { id: '1.2l', name: '1.2L', price: 185 }
            ],
            colors: [
                { id: 'black', name: 'Preto', color: '#2C3E50', default: true },
                { id: 'blue', name: 'Azul', color: '#4682B4' },
                { id: 'green', name: 'Verde', color: '#27AE60' },
                { id: 'red', name: 'Vermelho', color: '#E74C3C' }
            ]
        },
        images: [
            '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp'
        ]
    },
    'copo-termico-500ml': {
        id: 'copo-termico-500ml',
        name: 'Copo Térmico 500ml',
        category: 'Copos Térmicos',
        basePrice: 80,
        personalizationPrice: 20,
        description: 'Copo térmico ergonômico com tampa antivazamento, ideal para café, chá e bebidas quentes. Design moderno e isolamento superior.',
        features: [
            '☕ Perfeito para café e chá',
            '🔒 Tampa antivazamento',
            '🌡️ Isolamento térmico',
            '✋ Design ergonômico',
            '🎨 Personalizável',
            '♻️ Reutilizável'
        ],
        variants: {
            sizes: [
                { id: '350ml', name: '350ml', price: 65 },
                { id: '500ml', name: '500ml', price: 80, default: true }
            ],
            colors: [
                { id: 'black', name: 'Preto', color: '#2C3E50', default: true },
                { id: 'blue', name: 'Azul', color: '#4682B4' },
                { id: 'white', name: 'Branco', color: '#FFFFFF' }
            ]
        },
        images: [
            '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp'
        ]
    },
    'bolsa-termica-20l': {
        id: 'bolsa-termica-20l',
        name: 'Bolsa Térmica Premium 20L',
        category: 'Bolsas Térmicas',
        basePrice: 150,
        personalizationPrice: 25,
        description: 'Bolsa térmica de alta capacidade com isolamento superior para manter alimentos frescos. Design resistente e prático para uso diário.',
        features: [
            '❄️ Isolamento superior',
            '📦 Capacidade 20L',
            '💪 Material resistente',
            '👜 Design ergonômico',
            '🎨 Personalizável',
            '🔧 Fácil limpeza'
        ],
        variants: {
            sizes: [
                { id: '8l', name: '8L', price: 85 },
                { id: '20l', name: '20L', price: 150, default: true },
                { id: '35l', name: '35L', price: 200 }
            ],
            colors: [
                { id: 'black', name: 'Preto', color: '#2C3E50', default: true },
                { id: 'blue', name: 'Azul', color: '#4682B4' },
                { id: 'gray', name: 'Cinza', color: '#7F8C8D' }
            ]
        },
        images: [
            '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp'
        ]
    },
    'mochila-executiva-30l': {
        id: 'mochila-executiva-30l',
        name: 'Mochila Executiva 30L',
        category: 'Malas & Mochilas',
        basePrice: 220,
        personalizationPrice: 25,
        description: 'Mochila profissional com compartimentos organizadores e design sofisticado. Ideal para trabalho e viagens.',
        features: [
            '💼 Design executivo',
            '📁 Compartimentos organizadores',
            '💻 Espaço para laptop',
            '🔐 Zíperes de qualidade',
            '🎨 Personalizável',
            '✈️ Ideal para viagens'
        ],
        variants: {
            sizes: [
                { id: '20l', name: '20L', price: 180 },
                { id: '30l', name: '30L', price: 220, default: true },
                { id: '40l', name: '40L', price: 280 }
            ],
            colors: [
                { id: 'black', name: 'Preto', color: '#2C3E50', default: true },
                { id: 'gray', name: 'Cinza', color: '#7F8C8D' },
                { id: 'brown', name: 'Marrom', color: '#8B4513' }
            ]
        },
        images: [
            '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp'
        ]
    }
    // Adicionar outros produtos conforme necessário...
};

// Estado da aplicação do produto
const ProductApp = {
    currentProduct: null,
    productData: null,
    selectedVariants: {
        size: null,
        color: null,
        quantity: 1,
        customText: '',
        selectedFont: 'Arial',
        textColor: '#FFFFFF',
        textPosition: 'center'
    },
    gallery: {
        currentImage: 0,
        images: []
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeProductPage();
});

function initializeProductPage() {
    console.log('Inicializando página do produto...');
    
    // Capturar ID do produto da URL
    const productId = getProductIdFromURL();
    
    if (!productId || !PRODUCTS_DATABASE[productId]) {
        console.error('Produto não encontrado:', productId);
        showProductNotFound();
        return;
    }
    
    // Carregar dados do produto
    loadProductData(productId);
    
    // Configurar página
    setupGallery();
    setupProductVariants();
    setupPersonalization();
    setupQuantityControls();
    setupInfoTabs();
    setupActionButtons();
    
    // Atualizar preços iniciais
    updatePricing();
    
    console.log('Página do produto inicializada com sucesso!');
}

// ========================================
//   CARREGAMENTO DO PRODUTO
// ========================================

function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function loadProductData(productId) {
    const product = PRODUCTS_DATABASE[productId];
    ProductApp.productData = product;
    
    // Atualizar informações na página
    updateProductInfo(product);
    
    // Configurar variantes padrão
    setupDefaultVariants(product);
    
    // Atualizar breadcrumb
    updateBreadcrumb(product);
    
    console.log('Produto carregado:', product.name);
}

function updateProductInfo(product) {
    // Atualizar título da página
    document.title = `${product.name} - QUEISE | Use Exclusividade`;
    
    // Atualizar elementos da página
    document.querySelector('.product-category').textContent = product.category;
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.product-description p').textContent = product.description;
    
    // Atualizar características
    const featuresList = document.querySelector('.product-features ul');
    featuresList.innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');
    
    // Atualizar preço base
    document.querySelector('.price-base').textContent = `R$ ${product.basePrice.toFixed(2)}`;
    
    // Atualizar imagens
    if (product.images && product.images.length > 0) {
        document.getElementById('mainProductImage').src = product.images[0];
        ProductApp.gallery.images = product.images;
    }
}

function setupDefaultVariants(product) {
    // Configurar tamanho padrão
    const defaultSize = product.variants.sizes.find(size => size.default);
    if (defaultSize) {
        ProductApp.selectedVariants.size = defaultSize.id;
        ProductApp.currentProduct = { ...ProductApp.currentProduct, basePrice: defaultSize.price };
    }
    
    // Configurar cor padrão
    const defaultColor = product.variants.colors.find(color => color.default);
    if (defaultColor) {
        ProductApp.selectedVariants.color = defaultColor.id;
    }
}

function updateBreadcrumb(product) {
    const breadcrumb = document.querySelector('.breadcrumb');
    breadcrumb.innerHTML = `
        <a href="../index.html">Home</a>
        <span>/</span>
        <a href="produtos.html">Produtos</a>
        <span>/</span>
        <strong>${product.name}</strong>
    `;
}

function showProductNotFound() {
    document.querySelector('.product-main').innerHTML = `
        <div style="text-align: center; padding: 4rem;">
            <h2>Produto não encontrado</h2>
            <p>O produto que você procura não existe ou foi removido.</p>
            <a href="produtos.html" class="btn-primary">Voltar aos Produtos</a>
        </div>
    `;
}

// ========================================
//   GALERIA DE IMAGENS
// ========================================

function setupGallery() {
    // Capturar todas as thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainProductImage');
    
    ProductApp.gallery.images = Array.from(thumbnails).map(thumb => 
        thumb.getAttribute('data-image')
    );
    
    // Event listeners para thumbnails
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            switchMainImage(index);
        });
    });
    
    // Event listener para zoom na imagem principal
    mainImage.addEventListener('click', () => {
        openImageZoom(ProductApp.gallery.currentImage);
    });
}

function switchMainImage(index) {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Atualizar imagem principal
    mainImage.src = ProductApp.gallery.images[index];
    
    // Atualizar thumbnails ativas
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnails[index].classList.add('active');
    
    // Atualizar estado
    ProductApp.gallery.currentImage = index;
    
    // Animação suave
    mainImage.style.opacity = '0';
    setTimeout(() => {
        mainImage.style.opacity = '1';
    }, 150);
}

function openImageZoom(imageIndex) {
    // Implementar modal de zoom
    console.log('Abrindo zoom da imagem:', imageIndex);
    
    // Por enquanto, apenas um log. 
    // Futuramente pode implementar um modal com zoom
    alert('Funcionalidade de zoom será implementada!');
}

// ========================================
//   VARIAÇÕES DO PRODUTO
// ========================================

function setupProductVariants() {
    // Seletores de tamanho
    const sizeInputs = document.querySelectorAll('input[name="size"]');
    sizeInputs.forEach(input => {
        input.addEventListener('change', handleSizeChange);
    });
    
    // Seletores de cor
    const colorInputs = document.querySelectorAll('input[name="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('change', handleColorChange);
    });
}

function handleSizeChange(event) {
    const newSize = event.target.value;
    const newPrice = parseFloat(event.target.getAttribute('data-price'));
    
    ProductApp.currentProduct.selectedSize = newSize;
    ProductApp.currentProduct.basePrice = newPrice;
    
    updatePricing();
    
    console.log(`Tamanho alterado para: ${newSize} - Preço: R$ ${newPrice}`);
}

function handleColorChange(event) {
    const newColor = event.target.value;
    ProductApp.currentProduct.selectedColor = newColor;
    
    // Atualizar preview visual se necessário
    updateProductPreview();
    
    console.log(`Cor alterada para: ${newColor}`);
}

// ========================================
//   SISTEMA DE PERSONALIZAÇÃO
// ========================================

function setupPersonalization() {
    // Campo de texto personalizado
    const customTextInput = document.getElementById('customText');
    const charCount = document.getElementById('charCount');
    
    customTextInput.addEventListener('input', function(e) {
        const text = e.target.value;
        ProductApp.currentProduct.customText = text;
        
        // Atualizar contador de caracteres
        charCount.textContent = text.length;
        
        // Atualizar preview
        updateTextPreview();
        updatePricing();
    });
    
    // Seletores de fonte
    const fontInputs = document.querySelectorAll('input[name="font"]');
    fontInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            ProductApp.currentProduct.selectedFont = e.target.value;
            updateTextPreview();
        });
    });
    
    // Seletores de cor do texto
    const textColorInputs = document.querySelectorAll('input[name="textColor"]');
    textColorInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            ProductApp.currentProduct.textColor = e.target.value;
            updateTextPreview();
        });
    });
    
    // Seletores de posição
    const positionInputs = document.querySelectorAll('input[name="position"]');
    positionInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            ProductApp.currentProduct.textPosition = e.target.value;
            updateTextPreview();
        });
    });
}

function updateTextPreview() {
    const previewText = document.getElementById('previewText');
    const { customText, selectedFont, textColor, textPosition } = ProductApp.currentProduct;
    
    // Atualizar texto
    previewText.textContent = customText || 'SEU TEXTO AQUI';
    
    // Atualizar estilo da fonte
    previewText.style.fontFamily = selectedFont;
    previewText.style.color = textColor;
    
    // Atualizar posição
    updateTextPosition(previewText, textPosition);
    
    // Animação de atualização
    previewText.style.transform = 'scale(1.1)';
    setTimeout(() => {
        previewText.style.transform = 'scale(1)';
    }, 200);
}

function updateTextPosition(element, position) {
    switch(position) {
        case 'center':
            element.style.top = '50%';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            break;
        case 'bottom':
            element.style.top = '80%';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            break;
        case 'side':
            element.style.top = '50%';
            element.style.left = '20%';
            element.style.transform = 'translate(-50%, -50%)';
            break;
    }
}

function updateProductPreview() {
    // Atualizar preview do produto baseado nas variações selecionadas
    console.log('Atualizando preview do produto...');
    
    // Aqui você poderia trocar a imagem baseada na cor selecionada
    // Por enquanto, apenas log
}

// ========================================
//   SISTEMA DE PREÇOS
// ========================================

function updatePricing() {
    if (!ProductApp.productData) return;
    
    const { selectedVariants } = ProductApp;
    const { personalizationPrice } = ProductApp.productData;
    
    // Obter preço base do tamanho selecionado
    let basePrice = ProductApp.productData.basePrice;
    if (selectedVariants.size) {
        const sizeVariant = ProductApp.productData.variants.sizes.find(size => size.id === selectedVariants.size);
        if (sizeVariant) {
            basePrice = sizeVariant.price;
        }
    }
    
    // Calcular preço da personalização
    const hasPersonalization = selectedVariants.customText.length > 0;
    const currentPersonalizationPrice = hasPersonalization ? personalizationPrice : 0;
    
    // Calcular total por unidade
    const unitTotal = basePrice + currentPersonalizationPrice;
    
    // Calcular total geral
    const finalTotal = unitTotal * selectedVariants.quantity;
    
    // Atualizar elementos do DOM
    document.getElementById('personalizationPrice').textContent = currentPersonalizationPrice.toFixed(2);
    document.getElementById('totalPrice').textContent = unitTotal.toFixed(2);
    document.getElementById('cartPrice').textContent = finalTotal.toFixed(2);
    
    // Atualizar preço base se mudou
    document.querySelector('.price-base').textContent = `R$ ${basePrice.toFixed(2)}`;
    
    // Atualizar visibilidade da personalização
    const personalizationElement = document.querySelector('.price-personalization');
    if (hasPersonalization) {
        personalizationElement.style.opacity = '1';
    } else {
        personalizationElement.style.opacity = '0.5';
    }
}

// ========================================
//   CONTROLES DE QUANTIDADE
// ========================================

function setupQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    
    // Botão diminuir
    decreaseBtn.addEventListener('click', () => {
        const currentQty = parseInt(quantityInput.value);
        if (currentQty > 1) {
            const newQty = currentQty - 1;
            quantityInput.value = newQty;
            ProductApp.selectedVariants.quantity = newQty;
            updatePricing();
        }
    });
    
    // Botão aumentar
    increaseBtn.addEventListener('click', () => {
        const currentQty = parseInt(quantityInput.value);
        const maxQty = parseInt(quantityInput.getAttribute('max')) || 10;
        if (currentQty < maxQty) {
            const newQty = currentQty + 1;
            quantityInput.value = newQty;
            ProductApp.selectedVariants.quantity = newQty;
            updatePricing();
        }
    });
    
    // Input direto
    quantityInput.addEventListener('change', (e) => {
        let newQty = parseInt(e.target.value);
        const minQty = parseInt(e.target.getAttribute('min')) || 1;
        const maxQty = parseInt(e.target.getAttribute('max')) || 10;
        
        // Validar limites
        if (newQty < minQty) newQty = minQty;
        if (newQty > maxQty) newQty = maxQty;
        if (isNaN(newQty)) newQty = 1;
        
        e.target.value = newQty;
        ProductApp.selectedVariants.quantity = newQty;
        updatePricing();
    });
}

// ========================================
//   ABAS DE INFORMAÇÕES
// ========================================

function setupInfoTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover classes ativas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Adicionar classe ativa
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// ========================================
//   BOTÕES DE AÇÃO
// ========================================

function setupActionButtons() {
    // Botão adicionar ao carrinho
    const addToCartBtn = document.getElementById('addToCart');
    addToCartBtn.addEventListener('click', handleAddToCart);
    
    // Botão favoritar
    const wishlistBtn = document.getElementById('addToWishlist');
    wishlistBtn.addEventListener('click', handleAddToWishlist);
}

function handleAddToCart() {
    if (!ProductApp.productData) return;
    
    const product = {
        id: ProductApp.productData.id + '-' + Date.now(),
        productId: ProductApp.productData.id,
        name: ProductApp.productData.name,
        category: ProductApp.productData.category,
        basePrice: getCurrentBasePrice(),
        personalizationPrice: ProductApp.productData.personalizationPrice,
        selectedSize: ProductApp.selectedVariants.size,
        selectedColor: ProductApp.selectedVariants.color,
        quantity: ProductApp.selectedVariants.quantity,
        customText: ProductApp.selectedVariants.customText,
        selectedFont: ProductApp.selectedVariants.selectedFont,
        textColor: ProductApp.selectedVariants.textColor,
        textPosition: ProductApp.selectedVariants.textPosition,
        image: document.getElementById('mainProductImage').src
    };
    
    // Validações
    if (product.customText.length > 0 && product.customText.length < 2) {
        alert('Texto de personalização deve ter pelo menos 2 caracteres.');
        return;
    }
    
    // Simular adição ao carrinho
    console.log('Produto adicionado ao carrinho:', product);
    
    // Feedback visual
    const addToCartBtn = document.getElementById('addToCart');
    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = '<span>✓ Adicionado!</span>';
    addToCartBtn.style.background = '#27AE60';
    addToCartBtn.disabled = true;
    
    setTimeout(() => {
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.style.background = '';
        addToCartBtn.disabled = false;
    }, 2000);
    
    // Salvar no localStorage para simular carrinho
    saveToCart(product);
    
    // Tracking de evento
    trackAddToCart(product);
}

function getCurrentBasePrice() {
    if (!ProductApp.productData || !ProductApp.selectedVariants.size) {
        return ProductApp.productData?.basePrice || 0;
    }
    
    const sizeVariant = ProductApp.productData.variants.sizes.find(
        size => size.id === ProductApp.selectedVariants.size
    );
    
    return sizeVariant ? sizeVariant.price : ProductApp.productData.basePrice;
}

function handleAddToWishlist() {
    const wishlistBtn = document.getElementById('addToWishlist');
    const isInWishlist = wishlistBtn.classList.contains('active');
    
    if (isInWishlist) {
        // Remover da wishlist
        wishlistBtn.classList.remove('active');
        wishlistBtn.innerHTML = '♡ Favoritar';
        console.log('Produto removido da wishlist');
    } else {
        // Adicionar à wishlist
        wishlistBtn.classList.add('active');
        wishlistBtn.innerHTML = '♥ Favoritado';
        console.log('Produto adicionado à wishlist');
    }
    
    // Salvar estado da wishlist
    saveToWishlist(ProductApp.productData, !isInWishlist);
}

// ========================================
//   PERSISTÊNCIA DE DADOS
// ========================================

function saveToCart(product) {
    try {
        let cart = JSON.parse(localStorage.getItem('queise_cart')) || [];
        
        // Verificar se produto já existe no carrinho
        const existingIndex = cart.findIndex(item => 
            item.productId === product.productId &&
            item.selectedSize === product.selectedSize &&
            item.selectedColor === product.selectedColor &&
            item.customText === product.customText
        );
        
        if (existingIndex > -1) {
            // Atualizar quantidade
            cart[existingIndex].quantity += product.quantity;
        } else {
            // Adicionar novo item
            cart.push(product);
        }
        
        localStorage.setItem('queise_cart', JSON.stringify(cart));
        updateCartCounter();
        
    } catch (error) {
        console.log('Erro ao salvar no carrinho:', error);
    }
}

function saveToWishlist(product, add = true) {
    try {
        let wishlist = JSON.parse(localStorage.getItem('queise_wishlist')) || [];
        
        if (add) {
            // Adicionar à wishlist se não existir
            const exists = wishlist.some(item => item.id === product.id);
            if (!exists) {
                wishlist.push({
                    id: product.id,
                    name: product.name,
                    price: product.basePrice,
                    image: document.getElementById('mainProductImage').src
                });
            }
        } else {
            // Remover da wishlist
            wishlist = wishlist.filter(item => item.id !== product.id);
        }
        
        localStorage.setItem('queise_wishlist', JSON.stringify(wishlist));
        
    } catch (error) {
        console.log('Erro ao salvar na wishlist:', error);
    }
}

function updateCartCounter() {
    // Atualizar contador do carrinho no header (se existir)
    try {
        const cart = JSON.parse(localStorage.getItem('queise_cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.log('Erro ao atualizar contador do carrinho:', error);
    }
}

// ========================================
//   VALIDAÇÕES E UTILITÁRIOS
// ========================================

function validatePersonalization() {
    const { customText } = ProductApp.selectedVariants;
    
    const errors = [];
    
    // Validar comprimento do texto
    if (customText.length > 30) {
        errors.push('Texto não pode ter mais de 30 caracteres');
    }
    
    // Validar caracteres especiais (opcional)
    const allowedChars = /^[a-zA-Z0-9\s\-_.!?]*$/;
    if (customText && !allowedChars.test(customText)) {
        errors.push('Texto contém caracteres não permitidos');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function clearPersonalization() {
    // Limpar todos os campos de personalização
    document.getElementById('customText').value = '';
    document.querySelector('input[name="font"][value="Arial"]').checked = true;
    document.querySelector('input[name="textColor"][value="#FFFFFF"]').checked = true;
    document.querySelector('input[name="position"][value="center"]').checked = true;
    
    // Atualizar estado
    ProductApp.selectedVariants.customText = '';
    ProductApp.selectedVariants.selectedFont = 'Arial';
    ProductApp.selectedVariants.textColor = '#FFFFFF';
    ProductApp.selectedVariants.textPosition = 'center';
    
    // Atualizar UI
    updateTextPreview();
    updatePricing();
    document.getElementById('charCount').textContent = '0';
}

function loadWishlistState() {
    try {
        const wishlist = JSON.parse(localStorage.getItem('queise_wishlist')) || [];
        const isInWishlist = wishlist.some(item => item.id === ProductApp.productData?.id);
        
        if (isInWishlist) {
            const wishlistBtn = document.getElementById('addToWishlist');
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '♥ Favoritado';
        }
    } catch (error) {
        console.log('Erro ao carregar estado da wishlist:', error);
    }
}

// ========================================
//   EXPORTAR PARA ESCOPO GLOBAL
// ========================================

// Disponibilizar funções para uso externo
window.ProductApp = ProductApp;
window.clearPersonalization = clearPersonalization;

// Executar inicialização extra após carregamento da página
window.addEventListener('load', () => {
    setTimeout(() => {
        updateCartCounter();
        loadWishlistState();
    }, 500);
});

// Log de inicialização
console.log('produto-individual.js carregado com sucesso!');