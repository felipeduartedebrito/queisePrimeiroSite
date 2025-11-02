/**
 * ============================================
 * CONFIG.JS - Configurações Centralizadas
 * ============================================
 * 
 * Arquivo central de configuração do projeto QUEISE
 * Gerencia todas as constantes e configurações em um único lugar
 * 
 * @module config
 */

// ========================================
// AMBIENTE
// ========================================

/**
 * Configuração de ambiente
 * isDevelopment: true = usa mock database
 * isDevelopment: false = usa Shopify API real
 */
export const ENVIRONMENT = {
    isDevelopment: true,
    version: '1.0.0',
    debugMode: true
};

// ========================================
// SHOPIFY
// ========================================

/**
 * Configurações da API Shopify
 * Usado apenas quando isDevelopment = false
 */
export const SHOPIFY = {
    domain: 'queise.myshopify.com',
    storefrontAccessToken: 'your-storefront-access-token-here',
    apiVersion: '2024-01',
    
    // Endpoints
    endpoints: {
        graphql: '/api/2024-01/graphql.json'
    }
};

// ========================================
// STORAGE
// ========================================

/**
 * Chaves do localStorage usadas no projeto
 * Centralizadas para evitar conflitos e facilitar manutenção
 */
export const STORAGE_KEYS = {
    cart: 'queise_cart',
    wishlist: 'queise_wishlist',
    filters: 'queise_filters',
    savedDesigns: 'queise_saved_designs',
    userPreferences: 'queise_preferences',
    recentlyViewed: 'queise_recently_viewed'
};

// ========================================
// CARRINHO
// ========================================

/**
 * Configurações do carrinho de compras
 */
export const CART_CONFIG = {
    maxQuantity: 99,
    minQuantity: 1,
    
    // Cupons válidos (desenvolvimento)
    validCoupons: {
        'QUEISE10': { 
            type: 'percentage', 
            value: 10, 
            description: '10% de desconto' 
        },
        'BEMVINDO': { 
            type: 'fixed', 
            value: 2000, // R$ 20,00 em centavos
            description: 'R$ 20 de desconto' 
        },
        'FRETEGRATIS': { 
            type: 'shipping', 
            value: 0, 
            description: 'Frete grátis' 
        }
    },
    
    // Opções de frete (mock)
    shippingMethods: [
        { 
            id: 'pac', 
            name: 'PAC', 
            time: '10-15 dias úteis', 
            price: 1500 // R$ 15,00 em centavos
        },
        { 
            id: 'sedex', 
            name: 'SEDEX', 
            time: '3-5 dias úteis', 
            price: 2500 // R$ 25,00
        },
        { 
            id: 'express', 
            name: 'Expresso', 
            time: '1-2 dias úteis', 
            price: 3500 // R$ 35,00
        }
    ],
    
    // Valor mínimo para frete grátis
    freeShippingThreshold: 20000 // R$ 200,00 em centavos
};

// ========================================
// PERSONALIZAÇÃO
// ========================================

/**
 * Configurações do sistema de personalização
 */
export const PERSONALIZATION_CONFIG = {
    // Preço adicional por personalização
    basePrice: 2000, // R$ 20,00 em centavos
    
    // Limite de caracteres
    maxChars: 30,
    minChars: 1,
    
    // Fontes disponíveis
    availableFonts: [
        { value: 'Arial', label: 'Arial', family: 'Arial, sans-serif' },
        { value: 'Times', label: 'Times New Roman', family: '"Times New Roman", serif' },
        { value: 'Script', label: 'Brush Script', family: '"Brush Script MT", cursive' },
        { value: 'Bold', label: 'Arial Black', family: '"Arial Black", sans-serif' }
    ],
    
    // Cores disponíveis
    availableColors: [
        { value: '#FFFFFF', label: 'Branco', hex: '#FFFFFF' },
        { value: '#000000', label: 'Preto', hex: '#000000' },
        { value: '#FFD700', label: 'Dourado', hex: '#FFD700' },
        { value: '#C0C0C0', label: 'Prata', hex: '#C0C0C0' }
    ],
    
    // Posições disponíveis
    availablePositions: [
        { value: 'center', label: 'Centro' },
        { value: 'bottom', label: 'Parte Inferior' },
        { value: 'side', label: 'Lateral' }
    ]
};

// ========================================
// PRODUTOS
// ========================================

/**
 * Configurações de produtos
 */
export const PRODUCTS_CONFIG = {
    // Paginação
    itemsPerPage: 9,
    loadMoreIncrement: 9,
    
    // Ordenação
    sortOptions: [
        { value: 'relevance', label: 'Relevância' },
        { value: 'name-asc', label: 'Nome A-Z' },
        { value: 'name-desc', label: 'Nome Z-A' },
        { value: 'price-asc', label: 'Menor Preço' },
        { value: 'price-desc', label: 'Maior Preço' }
    ],
    
    // Views
    viewTypes: ['grid', 'list'],
    defaultView: 'grid',
    
    // Categorias
    categories: [
        'garrafas',
        'copos',
        'canecas',
        'bolsas-malas',
        'mochilas',
        'azulejos',
        'imas'
    ],
    
    // Faixas de preço
    priceRanges: [
        { min: 0, max: 5000, label: 'Até R$ 50' },
        { min: 5000, max: 10000, label: 'R$ 50 - R$ 100' },
        { min: 10000, max: 20000, label: 'R$ 100 - R$ 200' },
        { min: 20000, max: 999999, label: 'Acima de R$ 200' }
    ]
};

// ========================================
// ANIMAÇÕES
// ========================================

/**
 * Configurações de animações e transições
 */
export const ANIMATION_CONFIG = {
    // Durações (em ms)
    duration: {
        fast: 200,
        normal: 300,
        slow: 500
    },
    
    // Delays
    delay: {
        short: 100,
        medium: 300,
        long: 500
    },
    
    // Intersection Observer
    observerOptions: {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    }
};

// ========================================
// NOTIFICAÇÕES
// ========================================

/**
 * Configurações do sistema de notificações
 */
export const NOTIFICATION_CONFIG = {
    duration: 4000, // ms
    position: 'top-right',
    
    types: {
        success: {
            icon: '✓',
            color: '#28a745'
        },
        error: {
            icon: '✗',
            color: '#dc3545'
        },
        info: {
            icon: 'ℹ',
            color: '#4682B4'
        },
        warning: {
            icon: '⚠',
            color: '#ffc107'
        }
    }
};

// ========================================
// FORMATAÇÃO
// ========================================

/**
 * Configurações de formatação
 */
export const FORMAT_CONFIG = {
    // Moeda
    currency: {
        locale: 'pt-BR',
        currency: 'BRL',
        style: 'currency'
    },
    
    // Data
    date: {
        locale: 'pt-BR',
        options: {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    },
    
    // Números
    number: {
        locale: 'pt-BR'
    }
};

// ========================================
// VALIDAÇÃO
// ========================================

/**
 * Padrões de validação
 */
export const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/,
    cep: /^\d{5}-?\d{3}$/,
    cpf: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
    cnpj: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/
};

// ========================================
// ROTAS
// ========================================

/**
 * Rotas do projeto (relativas)
 */
export const ROUTES = {
    home: '../index.html',
    products: '../paginas/produtos.html',
    productDetail: '../paginas/produto-individual.html',
    cart: '../paginas/carrinho.html',
    checkout: '../paginas/checkout.html',
    personalize: '../paginas/personalizar.html',
    about: '../paginas/sobre.html',
    contact: '../paginas/contato.html',
    collections: '../paginas/colecoes.html',
    business: '../paginas/para-empresas.html'
};

// ========================================
// HELPERS
// ========================================

/**
 * Helper para verificar se está em desenvolvimento
 */
export const isDevelopment = () => ENVIRONMENT.isDevelopment;

/**
 * Helper para verificar se está em debug mode
 */
export const isDebugMode = () => ENVIRONMENT.debugMode;

/**
 * Log apenas em modo debug
 */
export const debugLog = (...args) => {
    if (isDebugMode()) {
        console.log('[QUEISE DEBUG]', ...args);
    }
};

/**
 * Exportação default de todas as configurações
 */
export default {
    ENVIRONMENT,
    SHOPIFY,
    STORAGE_KEYS,
    CART_CONFIG,
    PERSONALIZATION_CONFIG,
    PRODUCTS_CONFIG,
    ANIMATION_CONFIG,
    NOTIFICATION_CONFIG,
    FORMAT_CONFIG,
    VALIDATION_PATTERNS,
    ROUTES,
    isDevelopment,
    isDebugMode,
    debugLog
};
