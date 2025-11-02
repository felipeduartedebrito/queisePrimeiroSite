/**
 * ============================================
 * API.JS - Abstração de API (Mock/Shopify)
 * ============================================
 * 
 * Módulo responsável por abstrair chamadas de API
 * Em desenvolvimento usa Mock Database
 * Em produção usa Shopify Storefront API
 * 
 * @module api
 */

import { ENVIRONMENT, SHOPIFY, debugLog } from './config.js';
import { delay } from './utils.js';

// ========================================
// MOCK DATABASE
// ========================================

/**
 * Database mock para desenvolvimento
 * Estrutura idêntica aos dados que virão do Shopify
 */
const MOCK_DATABASE = {
    products: [
        {
            id: 'garrafa-stanley-1l',
            handle: 'garrafa-stanley-1l',
            title: 'Garrafa Térmica Stanley Adventure 1L',
            vendor: 'Stanley',
            productType: 'Garrafa Térmica',
            description: 'Garrafa térmica premium com isolamento duplo',
            descriptionHtml: '<p>Mantém bebidas quentes por 16h e frias por 20h</p>',
            
            price: 16500, // R$ 165,00 em centavos
            compareAtPrice: 19900, // R$ 199,00
            
            availableForSale: true,
            totalInventory: 50,
            
            images: [
                {
                    id: 'img1',
                    url: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                    altText: 'Garrafa Stanley 1L'
                }
            ],
            
            variants: [
                {
                    id: 'variant-1',
                    title: '1L / Azul',
                    price: 16500,
                    compareAtPrice: 19900,
                    availableForSale: true,
                    quantityAvailable: 50,
                    selectedOptions: [
                        { name: 'Tamanho', value: '1L' },
                        { name: 'Cor', value: 'Azul' }
                    ]
                }
            ],
            
            options: [
                {
                    name: 'Tamanho',
                    values: ['1L']
                },
                {
                    name: 'Cor',
                    values: ['Azul', 'Preto', 'Verde']
                }
            ],
            
            metafields: {
                personalization: {
                    enabled: true,
                    price: 2000, // R$ 20,00
                    maxChars: 30,
                    allowedFonts: ['Arial', 'Times', 'Script', 'Bold'],
                    allowedColors: ['#FFFFFF', '#000000', '#FFD700', '#C0C0C0'],
                    allowedPositions: ['center', 'bottom', 'side']
                },
                specifications: {
                    'Capacidade': '1 Litro',
                    'Material': 'Aço Inoxidável 18/8',
                    'Isolamento': 'Vácuo Duplo',
                    'Dimensões': '28cm x 9cm',
                    'Peso': '450g'
                }
            },
            
            tags: ['Premium', 'Térmico', 'Esportivo', 'Garrafas'],
            collections: ['garrafas', 'premium']
        },
        
        {
            id: 'copo-termico-500ml',
            handle: 'copo-termico-500ml',
            title: 'Copo Térmico 500ml',
            vendor: 'QUEISE',
            productType: 'Copo',
            description: 'Copo térmico ideal para café e bebidas quentes',
            descriptionHtml: '<p>Mantém temperatura ideal por horas</p>',
            
            price: 8000, // R$ 80,00
            compareAtPrice: 10000,
            
            availableForSale: true,
            totalInventory: 100,
            
            images: [
                {
                    id: 'img1',
                    url: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                    altText: 'Copo Térmico 500ml'
                }
            ],
            
            variants: [
                {
                    id: 'variant-1',
                    title: '500ml / Preto',
                    price: 8000,
                    availableForSale: true,
                    quantityAvailable: 100,
                    selectedOptions: [
                        { name: 'Tamanho', value: '500ml' },
                        { name: 'Cor', value: 'Preto' }
                    ]
                }
            ],
            
            options: [
                {
                    name: 'Tamanho',
                    values: ['500ml']
                },
                {
                    name: 'Cor',
                    values: ['Preto', 'Branco']
                }
            ],
            
            metafields: {
                personalization: {
                    enabled: true,
                    price: 2000,
                    maxChars: 30,
                    allowedFonts: ['Arial', 'Times', 'Script', 'Bold'],
                    allowedColors: ['#FFFFFF', '#000000', '#FFD700', '#C0C0C0'],
                    allowedPositions: ['center', 'bottom', 'side']
                }
            },
            
            tags: ['Térmico', 'Copos'],
            collections: ['copos']
        }
    ],
    
    collections: [
        {
            id: 'garrafas',
            handle: 'garrafas',
            title: 'Garrafas Térmicas',
            description: 'Coleção de garrafas térmicas premium',
            productsCount: 5
        },
        {
            id: 'copos',
            handle: 'copos',
            title: 'Copos e Canecas',
            description: 'Copos térmicos para todas as ocasiões',
            productsCount: 8
        }
    ]
};

// ========================================
// CLASSE API MOCK
// ========================================

/**
 * Simula API do Shopify para desenvolvimento
 */
class MockAPI {
    /**
     * Simula delay de rede
     * @param {number} ms - Milissegundos de delay
     */
    async _simulateNetworkDelay(ms = 500) {
        await delay(ms);
    }

    /**
     * Busca produto por handle
     * @param {string} handle - Handle do produto
     * @returns {Promise<Object|null>}
     */
    async getProduct(handle) {
        debugLog('MockAPI.getProduct:', handle);
        await this._simulateNetworkDelay();
        
        const product = MOCK_DATABASE.products.find(p => p.handle === handle);
        
        if (!product) {
            throw new Error(`Produto não encontrado: ${handle}`);
        }
        
        return { product };
    }

    /**
     * Busca múltiplos produtos
     * @param {Object} filters - Filtros de busca
     * @returns {Promise<Object>}
     */
    async getProducts(filters = {}) {
        debugLog('MockAPI.getProducts:', filters);
        await this._simulateNetworkDelay();
        
        let products = [...MOCK_DATABASE.products];
        
        // Aplicar filtros
        if (filters.collection) {
            products = products.filter(p => 
                p.collections.includes(filters.collection)
            );
        }
        
        if (filters.tag) {
            products = products.filter(p => 
                p.tags.includes(filters.tag)
            );
        }
        
        if (filters.query) {
            const query = filters.query.toLowerCase();
            products = products.filter(p => 
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }
        
        // Paginação
        const first = filters.first || 10;
        const products_paginated = products.slice(0, first);
        
        return {
            products: products_paginated,
            pageInfo: {
                hasNextPage: products.length > first,
                hasPreviousPage: false
            }
        };
    }

    /**
     * Busca coleção por handle
     * @param {string} handle - Handle da coleção
     * @returns {Promise<Object|null>}
     */
    async getCollection(handle) {
        debugLog('MockAPI.getCollection:', handle);
        await this._simulateNetworkDelay();
        
        const collection = MOCK_DATABASE.collections.find(c => c.handle === handle);
        
        if (!collection) {
            throw new Error(`Coleção não encontrada: ${handle}`);
        }
        
        // Buscar produtos da coleção
        const products = MOCK_DATABASE.products.filter(p => 
            p.collections.includes(handle)
        );
        
        return {
            collection: {
                ...collection,
                products
            }
        };
    }

    /**
     * Busca todas as coleções
     * @returns {Promise<Array>}
     */
    async getCollections() {
        debugLog('MockAPI.getCollections');
        await this._simulateNetworkDelay();
        
        return {
            collections: MOCK_DATABASE.collections
        };
    }

    /**
     * Cria checkout (simulado)
     * @param {Array} lineItems - Itens do carrinho
     * @returns {Promise<Object>}
     */
    async createCheckout(lineItems) {
        debugLog('MockAPI.createCheckout:', lineItems);
        await this._simulateNetworkDelay();
        
        // Simular criação de checkout
        return {
            checkout: {
                id: `mock-checkout-${Date.now()}`,
                webUrl: '#checkout-mock',
                lineItems,
                subtotalPrice: lineItems.reduce((sum, item) => 
                    sum + (item.variant.price * item.quantity), 0
                )
            }
        };
    }
}

// ========================================
// CLASSE SHOPIFY API
// ========================================

/**
 * API real do Shopify para produção
 */
class ShopifyAPI {
    constructor() {
        this.endpoint = `https://${SHOPIFY.domain}${SHOPIFY.endpoints.graphql}`;
        this.headers = {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY.storefrontAccessToken
        };
    }

    /**
     * Executa query GraphQL
     * @param {string} query - Query GraphQL
     * @param {Object} variables - Variáveis da query
     * @returns {Promise<Object>}
     */
    async _query(query, variables = {}) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ query, variables })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.errors) {
                throw new Error(data.errors[0].message);
            }

            return data.data;
        } catch (error) {
            console.error('Erro na query Shopify:', error);
            throw error;
        }
    }

    /**
     * Busca produto por handle
     * @param {string} handle - Handle do produto
     * @returns {Promise<Object>}
     */
    async getProduct(handle) {
        const query = `
            query getProduct($handle: String!) {
                product(handle: $handle) {
                    id
                    handle
                    title
                    vendor
                    productType
                    description
                    descriptionHtml
                    availableForSale
                    totalInventory
                    tags
                    
                    priceRange {
                        minVariantPrice {
                            amount
                            currencyCode
                        }
                        maxVariantPrice {
                            amount
                            currencyCode
                        }
                    }
                    
                    compareAtPriceRange {
                        minVariantPrice {
                            amount
                            currencyCode
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
                    
                    variants(first: 50) {
                        edges {
                            node {
                                id
                                title
                                availableForSale
                                quantityAvailable
                                price {
                                    amount
                                    currencyCode
                                }
                                compareAtPrice {
                                    amount
                                    currencyCode
                                }
                                selectedOptions {
                                    name
                                    value
                                }
                            }
                        }
                    }
                    
                    options {
                        name
                        values
                    }
                    
                    metafields(identifiers: [
                        {namespace: "custom", key: "personalization"}
                        {namespace: "custom", key: "specifications"}
                    ]) {
                        namespace
                        key
                        value
                        type
                    }
                }
            }
        `;

        const data = await this._query(query, { handle });
        
        // Transformar dados do Shopify para formato interno
        return this._transformProduct(data.product);
    }

    /**
     * Busca produtos com filtros
     * @param {Object} filters - Filtros de busca
     * @returns {Promise<Object>}
     */
    async getProducts(filters = {}) {
        const { collection, tag, query, first = 10 } = filters;
        
        let graphqlQuery = `
            query getProducts($first: Int!, $query: String) {
                products(first: $first, query: $query) {
                    edges {
                        node {
                            id
                            handle
                            title
                            vendor
                            productType
                            description
                            availableForSale
                            
                            priceRange {
                                minVariantPrice {
                                    amount
                                    currencyCode
                                }
                            }
                            
                            images(first: 1) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                            
                            tags
                        }
                    }
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                    }
                }
            }
        `;

        const variables = { first };
        
        // Construir query string
        if (query) {
            variables.query = query;
        } else if (collection) {
            variables.query = `collection:${collection}`;
        } else if (tag) {
            variables.query = `tag:${tag}`;
        }

        const data = await this._query(graphqlQuery, variables);
        
        return {
            products: data.products.edges.map(edge => 
                this._transformProduct(edge.node)
            ),
            pageInfo: data.products.pageInfo
        };
    }

    /**
     * Busca coleção
     * @param {string} handle - Handle da coleção
     * @returns {Promise<Object>}
     */
    async getCollection(handle) {
        const query = `
            query getCollection($handle: String!) {
                collection(handle: $handle) {
                    id
                    handle
                    title
                    description
                    
                    products(first: 50) {
                        edges {
                            node {
                                id
                                handle
                                title
                                vendor
                                
                                priceRange {
                                    minVariantPrice {
                                        amount
                                        currencyCode
                                    }
                                }
                                
                                images(first: 1) {
                                    edges {
                                        node {
                                            url
                                            altText
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const data = await this._query(query, { handle });
        
        return {
            collection: {
                ...data.collection,
                products: data.collection.products.edges.map(edge => 
                    this._transformProduct(edge.node)
                )
            }
        };
    }

    /**
     * Cria checkout
     * @param {Array} lineItems - Itens do carrinho
     * @returns {Promise<Object>}
     */
    async createCheckout(lineItems) {
        const query = `
            mutation checkoutCreate($input: CheckoutCreateInput!) {
                checkoutCreate(input: $input) {
                    checkout {
                        id
                        webUrl
                        lineItems(first: 250) {
                            edges {
                                node {
                                    id
                                    title
                                    quantity
                                }
                            }
                        }
                        subtotalPrice {
                            amount
                            currencyCode
                        }
                    }
                    checkoutUserErrors {
                        message
                        field
                    }
                }
            }
        `;

        const variables = {
            input: {
                lineItems: lineItems.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    customAttributes: item.customAttributes || []
                }))
            }
        };

        const data = await this._query(query, variables);
        
        if (data.checkoutCreate.checkoutUserErrors.length > 0) {
            throw new Error(data.checkoutCreate.checkoutUserErrors[0].message);
        }

        return data.checkoutCreate;
    }

    /**
     * Transforma dados do Shopify para formato interno
     * @param {Object} shopifyProduct - Produto do Shopify
     * @returns {Object}
     */
    _transformProduct(shopifyProduct) {
        if (!shopifyProduct) return null;

        // Converter preços de string para centavos
        const priceInCents = Math.round(
            parseFloat(shopifyProduct.priceRange?.minVariantPrice?.amount || 0) * 100
        );

        return {
            id: shopifyProduct.handle,
            handle: shopifyProduct.handle,
            title: shopifyProduct.title,
            vendor: shopifyProduct.vendor,
            productType: shopifyProduct.productType,
            description: shopifyProduct.description,
            descriptionHtml: shopifyProduct.descriptionHtml,
            price: priceInCents,
            availableForSale: shopifyProduct.availableForSale,
            totalInventory: shopifyProduct.totalInventory,
            images: shopifyProduct.images?.edges?.map(e => ({
                id: e.node.id,
                url: e.node.url,
                altText: e.node.altText
            })) || [],
            variants: shopifyProduct.variants?.edges?.map(e => ({
                id: e.node.id,
                title: e.node.title,
                price: Math.round(parseFloat(e.node.price.amount) * 100),
                availableForSale: e.node.availableForSale,
                quantityAvailable: e.node.quantityAvailable,
                selectedOptions: e.node.selectedOptions
            })) || [],
            options: shopifyProduct.options || [],
            tags: shopifyProduct.tags || [],
            metafields: this._parseMetafields(shopifyProduct.metafields)
        };
    }

    /**
     * Parseia metafields do Shopify
     * @param {Array} metafields - Metafields do Shopify
     * @returns {Object}
     */
    _parseMetafields(metafields) {
        if (!metafields) return {};

        const parsed = {};
        metafields.forEach(field => {
            if (!parsed[field.namespace]) {
                parsed[field.namespace] = {};
            }
            try {
                parsed[field.namespace][field.key] = JSON.parse(field.value);
            } catch {
                parsed[field.namespace][field.key] = field.value;
            }
        });

        return parsed;
    }
}

// ========================================
// FACTORY PATTERN
// ========================================

/**
 * Retorna instância de API apropriada (Mock ou Shopify)
 */
function createAPI() {
    if (ENVIRONMENT.isDevelopment) {
        debugLog('Usando MockAPI (desenvolvimento)');
        return new MockAPI();
    } else {
        debugLog('Usando ShopifyAPI (produção)');
        return new ShopifyAPI();
    }
}

// ========================================
// INSTÂNCIA GLOBAL
// ========================================

/**
 * Instância única da API para uso em todo o projeto
 */
export const api = createAPI();

// ========================================
// EXPORTAÇÕES
// ========================================

export default api;

export {
    MockAPI,
    ShopifyAPI,
    createAPI,
    MOCK_DATABASE
};
