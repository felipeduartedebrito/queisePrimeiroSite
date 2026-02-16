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
import { shopifyFetch, buildProductQuery, getThumbnailUrl, getResponsiveImageUrl } from './shopify-client.js';
import { 
    PRODUCT_QUERY, 
    PRODUCTS_QUERY, 
    COLLECTION_QUERY,
    COLLECTIONS_QUERY,
    CART_CREATE_MUTATION,
    CART_QUERY,
    CART_LINES_ADD_MUTATION,
    CART_LINES_UPDATE_MUTATION,
    CART_LINES_REMOVE_MUTATION
} from '../config/shopify.config.js';
import { cache, SimpleCache } from './cache.js';
import { CartStorage } from './storage.js';

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
                    title: '1L / Azul Marinho',
                    price: 16500,
                    compareAtPrice: 19900,
                    availableForSale: true,
                    quantityAvailable: 15,
                    selectedOptions: [
                        { name: 'Tamanho', value: '1L' },
                        { name: 'Cor', value: 'Azul Marinho' }
                    ]
                },
                {
                    id: 'variant-2',
                    title: '1L / Verde Militar',
                    price: 16500,
                    compareAtPrice: 19900,
                    availableForSale: true,
                    quantityAvailable: 12,
                    selectedOptions: [
                        { name: 'Tamanho', value: '1L' },
                        { name: 'Cor', value: 'Verde Militar' }
                    ]
                },
                {
                    id: 'variant-3',
                    title: '1L / Preto Fosco',
                    price: 16500,
                    compareAtPrice: 19900,
                    availableForSale: true,
                    quantityAvailable: 8,
                    selectedOptions: [
                        { name: 'Tamanho', value: '1L' },
                        { name: 'Cor', value: 'Preto Fosco' }
                    ]
                },
                {
                    id: 'variant-4',
                    title: '1L / Cinza Grafite',
                    price: 16500,
                    compareAtPrice: 19900,
                    availableForSale: false,
                    quantityAvailable: 0,
                    selectedOptions: [
                        { name: 'Tamanho', value: '1L' },
                        { name: 'Cor', value: 'Cinza Grafite' }
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
                    values: ['Azul Marinho', 'Verde Militar', 'Preto Fosco', 'Cinza Grafite']
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
                    compareAtPrice: 9500,
                    availableForSale: true,
                    quantityAvailable: 10,
                    selectedOptions: [
                        { name: 'Tamanho', value: '500ml' },
                        { name: 'Cor', value: 'Preto' }
                    ]
                },
                {
                    id: 'variant-2',
                    title: '500ml / Branco',
                    price: 8000,
                    compareAtPrice: 9500,
                    availableForSale: true,
                    quantityAvailable: 15,
                    selectedOptions: [
                        { name: 'Tamanho', value: '500ml' },
                        { name: 'Cor', value: 'Branco' }
                    ]
                },
                {
                    id: 'variant-3',
                    title: '500ml / Azul',
                    price: 8000,
                    compareAtPrice: 9500,
                    availableForSale: true,
                    quantityAvailable: 5,
                    selectedOptions: [
                        { name: 'Tamanho', value: '500ml' },
                        { name: 'Cor', value: 'Azul' }
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
                    values: ['Preto', 'Branco', 'Azul']
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
        this.cache = cache;
    }

    /**
     * Busca produto por handle
     * @param {string} handle - Handle do produto
     * @returns {Promise<Object>}
     */
    async getProduct(handle) {
        // Verificar cache
        const cacheKey = SimpleCache.productKey(handle);
        const cached = this.cache.get(cacheKey);
        if (cached) {
            debugLog('Product cache HIT:', handle);
            return { product: cached };
        }

        debugLog('Product cache MISS, fetching from Shopify:', handle);

        const data = await shopifyFetch(PRODUCT_QUERY, { handle });
        
        if (!data.product) {
            throw new Error(`Produto não encontrado: ${handle}`);
        }

        // Transformar dados do Shopify para formato interno
        const transformed = this._transformProduct(data.product);
        
        // Cachear resultado
        this.cache.set(cacheKey, transformed);
        
        return { product: transformed };
    }

    /**
     * Busca produtos com filtros
     * @param {Object} filters - Filtros de busca
     * @returns {Promise<Object>}
     */
    async getProducts(filters = {}) {
        const { collection, tag, query, first = 10, after } = filters;
        
        // Verificar cache
        const cacheKey = SimpleCache.productsKey(filters);
        const cached = this.cache.get(cacheKey);
        if (cached && !after) { // Não cachear paginação
            debugLog('Products cache HIT:', filters);
            return cached;
        }

        debugLog('Products cache MISS, fetching from Shopify:', filters);

        const variables = { first };
        
        // Construir query string usando helper
        if (query) {
            variables.query = query;
        } else {
            variables.query = buildProductQuery(filters);
        }

        if (after) {
            variables.after = after;
        }

        const data = await shopifyFetch(PRODUCTS_QUERY, variables);
        
        // Debug: verificar dados brutos do Shopify
        if (data.products?.edges?.length > 0) {
            const firstNode = data.products.edges[0].node;
            debugLog('📦 Primeiro produto RAW do Shopify:', {
                handle: firstNode.handle,
                id: firstNode.id,
                title: firstNode.title
            });
        }
        
        const result = {
            products: data.products.edges.map(edge => {
                const transformed = this._transformProduct(edge.node);
                // Debug: verificar se handle foi preservado
                if (!transformed.handle) {
                    debugLog('⚠️ Handle perdido na transformação:', {
                        original: edge.node.handle,
                        transformed: transformed
                    });
                }
                return transformed;
            }),
            pageInfo: data.products.pageInfo
        };

        // Cachear apenas primeira página
        if (!after) {
            this.cache.set(cacheKey, result);
        }
        
        return result;
    }

    /**
     * Busca coleção
     * @param {string} handle - Handle da coleção
     * @returns {Promise<Object>}
     */
    async getCollection(handle) {
        // Verificar cache
        const cacheKey = SimpleCache.collectionKey(handle);
        const cached = this.cache.get(cacheKey);
        if (cached) {
            debugLog('Collection cache HIT:', handle);
            return cached;
        }

        debugLog('Collection cache MISS, fetching from Shopify:', handle);

        const data = await shopifyFetch(COLLECTION_QUERY, { handle });
        
        if (!data.collection) {
            throw new Error(`Coleção não encontrada: ${handle}`);
        }

        const result = {
            collection: {
                ...data.collection,
                products: data.collection.products.edges.map(edge => 
                    this._transformProduct(edge.node)
                )
            }
        };

        // Cachear resultado
        this.cache.set(cacheKey, result);
        
        return result;
    }

    /**
     * Busca todas as coleções
     * @returns {Promise<Object>}
     */
    async getCollections() {
        // Verificar cache
        const cacheKey = SimpleCache.collectionsKey();
        const cached = this.cache.get(cacheKey);
        if (cached) {
            debugLog('Collections cache HIT');
            return cached;
        }

        debugLog('Collections cache MISS, fetching from Shopify');

        const data = await shopifyFetch(COLLECTIONS_QUERY, { first: 50 });
        
        const result = {
            collections: data.collections.edges.map(edge => edge.node)
        };

        // Cachear resultado
        this.cache.set(cacheKey, result);
        
        return result;
    }

    // ========================================
    // CART API METHODS
    // ========================================

    /**
     * Cria um novo carrinho
     * @param {Array} lines - Linhas do carrinho (opcional)
     * @returns {Promise<Object>} Carrinho criado
     */
    async createCart(lines = []) {
        const variables = {
            input: {
                lines: lines
            }
        };

        const data = await shopifyFetch(CART_CREATE_MUTATION, variables);
        
        if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
            throw new Error(data.cartCreate.userErrors[0].message);
        }

        const cart = data.cartCreate.cart;
        
        // Salvar cart ID
        CartStorage.saveCartId(cart.id);
        
        return this._transformCart(cart);
    }

    /**
     * Busca carrinho por ID
     * @param {string} cartId - ID do carrinho
     * @returns {Promise<Object>} Carrinho
     */
    async getCart(cartId) {
        if (!cartId) {
            throw new Error('Cart ID é obrigatório');
        }

        const data = await shopifyFetch(CART_QUERY, { id: cartId });
        
        if (!data.cart) {
            // Carrinho não encontrado, limpar ID salvo
            CartStorage.clearCartId();
            throw new Error('Carrinho não encontrado');
        }

        return this._transformCart(data.cart);
    }

    /**
     * Obtém ou cria carrinho
     * @returns {Promise<Object>} Carrinho
     */
    async getOrCreateCart() {
        let cartId = CartStorage.getCartId();
        
        if (cartId) {
            try {
                return await this.getCart(cartId);
            } catch (error) {
                debugLog('Cart not found, creating new one:', error);
                // Continuar para criar novo carrinho
            }
        }

        return await this.createCart();
    }

    /**
     * Adiciona itens ao carrinho
     * @param {string} cartId - ID do carrinho
     * @param {Array} lines - Linhas a adicionar [{merchandiseId, quantity, attributes?}]
     * @returns {Promise<Object>} Carrinho atualizado
     */
    async addToCart(cartId, lines) {
        if (!cartId) {
            throw new Error('Cart ID é obrigatório');
        }

        const variables = {
            cartId: cartId,
            lines: lines
        };

        const data = await shopifyFetch(CART_LINES_ADD_MUTATION, variables);
        
        if (data.cartLinesAdd.userErrors && data.cartLinesAdd.userErrors.length > 0) {
            throw new Error(data.cartLinesAdd.userErrors[0].message);
        }

        return this._transformCart(data.cartLinesAdd.cart);
    }

    /**
     * Atualiza quantidade de itens no carrinho
     * @param {string} cartId - ID do carrinho
     * @param {Array} lines - Linhas a atualizar [{id, quantity}]
     * @returns {Promise<Object>} Carrinho atualizado
     */
    async updateCartLine(cartId, lines) {
        if (!cartId) {
            throw new Error('Cart ID é obrigatório');
        }

        const variables = {
            cartId: cartId,
            lines: lines
        };

        const data = await shopifyFetch(CART_LINES_UPDATE_MUTATION, variables);
        
        if (data.cartLinesUpdate.userErrors && data.cartLinesUpdate.userErrors.length > 0) {
            throw new Error(data.cartLinesUpdate.userErrors[0].message);
        }

        return this._transformCart(data.cartLinesUpdate.cart);
    }

    /**
     * Remove itens do carrinho
     * @param {string} cartId - ID do carrinho
     * @param {Array} lineIds - IDs das linhas a remover
     * @returns {Promise<Object>} Carrinho atualizado
     */
    async removeCartLine(cartId, lineIds) {
        if (!cartId) {
            throw new Error('Cart ID é obrigatório');
        }

        const variables = {
            cartId: cartId,
            lineIds: lineIds
        };

        const data = await shopifyFetch(CART_LINES_REMOVE_MUTATION, variables);
        
        if (data.cartLinesRemove.userErrors && data.cartLinesRemove.userErrors.length > 0) {
            throw new Error(data.cartLinesRemove.userErrors[0].message);
        }

        return this._transformCart(data.cartLinesRemove.cart);
    }

    /**
     * Gera URL de checkout
     * @param {string} cartId - ID do carrinho
     * @returns {string} URL de checkout
     */
    getCheckoutUrl(cartId) {
        if (!cartId) {
            throw new Error('Cart ID é obrigatório');
        }
        return `${SHOPIFY.urls.checkout}/cart/${cartId}`;
    }

    /**
     * Constrói customAttributes a partir de objeto de personalização
     * @param {Object} personalization - Objeto de personalização
     * @returns {Array} Array de customAttributes
     */
    _buildCustomAttributes(personalization) {
        if (!personalization || !personalization.text) {
            return [];
        }

        const attributes = [];

        // Tipo de texto
        if (personalization.textType) {
            attributes.push({
                key: 'Tipo de Texto',
                value: personalization.textType
            });
        } else {
            // Detectar tipo automaticamente
            const text = personalization.text.trim();
            if (text.length === 1) {
                attributes.push({ key: 'Tipo de Texto', value: 'inicial' });
            } else if (text.split(' ').length === 1) {
                attributes.push({ key: 'Tipo de Texto', value: 'nome' });
            } else {
                attributes.push({ key: 'Tipo de Texto', value: 'livre' });
            }
        }

        // Texto personalizado
        attributes.push({
            key: 'Texto Personalizado',
            value: personalization.text
        });

        // Fonte
        if (personalization.font) {
            attributes.push({
                key: 'Fonte',
                value: personalization.font
            });
        }

        // Cor
        if (personalization.color || personalization.orientation) {
            const colorMap = {
                '#FFFFFF': 'Branco',
                '#000000': 'Preto',
                '#FFD700': 'Dourado',
                '#C0C0C0': 'Prata'
            };
            const color = personalization.color || '#000000';
            attributes.push({
                key: 'Cor',
                value: colorMap[color] || 'Preto'
            });
        }

        // Posição
        if (personalization.orientation || personalization.position) {
            const positionMap = {
                'center': 'Centro',
                'bottom': 'Parte Inferior',
                'side': 'Lateral'
            };
            const pos = personalization.orientation || personalization.position || 'center';
            attributes.push({
                key: 'Posição',
                value: positionMap[pos] || 'Centro'
            });
        }

        return attributes;
    }

    /**
     * Sincroniza carrinho local com Shopify
     * @returns {Promise<Object>} Carrinho Shopify
     */
    async syncLocalCartToShopify() {
        const localCart = CartStorage.get();
        
        if (!localCart.items || localCart.items.length === 0) {
            return await this.getOrCreateCart();
        }

        // Criar novo carrinho
        const lines = localCart.items.map(item => ({
            merchandiseId: item.variantId,
            quantity: item.quantity,
            attributes: item.personalization ? this._buildCustomAttributes(item.personalization) : []
        }));

        return await this.createCart(lines);
    }

    /**
     * Cria checkout (DEPRECATED - usar Cart API)
     * @param {Array} lineItems - Itens do carrinho
     * @returns {Promise<Object>}
     * @deprecated Use Cart API instead
     */
    async createCheckout(lineItems) {
        // Criar carrinho e retornar checkout URL
        const lines = lineItems.map(item => ({
            merchandiseId: item.variantId,
            quantity: item.quantity,
            attributes: item.customAttributes || []
        }));

        const cart = await this.createCart(lines);
        
        return {
            checkout: {
                id: cart.id,
                webUrl: cart.checkoutUrl,
                lineItems: cart.items,
                subtotalPrice: cart.subtotal
            }
        };
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

        const compareAtPriceInCents = shopifyProduct.compareAtPriceRange?.minVariantPrice?.amount
            ? Math.round(parseFloat(shopifyProduct.compareAtPriceRange.minVariantPrice.amount) * 100)
            : null;

        // Processar imagens com otimização
        const images = shopifyProduct.images?.edges?.map(e => {
            const originalUrl = e.node.url;
            return {
                id: e.node.id,
                url: originalUrl,
                altText: e.node.altText || shopifyProduct.title,
                thumbnail: getThumbnailUrl(originalUrl),
                mobile: getResponsiveImageUrl(originalUrl, 'mobile'),
                desktop: getResponsiveImageUrl(originalUrl, 'desktop')
            };
        }) || [];

        return {
            id: shopifyProduct.handle,
            handle: shopifyProduct.handle,
            title: shopifyProduct.title,
            vendor: shopifyProduct.vendor,
            productType: shopifyProduct.productType,
            description: shopifyProduct.description,
            descriptionHtml: shopifyProduct.descriptionHtml,
            price: priceInCents,
            compareAtPrice: compareAtPriceInCents,
            availableForSale: shopifyProduct.availableForSale,
            // totalInventory não está disponível no Storefront API sem permissão especial
            // Usar quantityAvailable das variantes se necessário
            images: images,
            variants: shopifyProduct.variants?.edges?.map(e => {
                const variantPrice = Math.round(parseFloat(e.node.price?.amount || 0) * 100);
                const variantCompareAtPrice = e.node.compareAtPrice?.amount
                    ? Math.round(parseFloat(e.node.compareAtPrice.amount) * 100)
                    : null;

                return {
                    id: e.node.id,
                    title: e.node.title,
                    price: variantPrice,
                    compareAtPrice: variantCompareAtPrice,
                    availableForSale: e.node.availableForSale,
                    // quantityAvailable não está disponível no Storefront API sem permissão especial
                    // Usar null e tratar no código que consome
                    quantityAvailable: null,
                    selectedOptions: e.node.selectedOptions || [],
                    image: e.node.image ? {
                        url: e.node.image.url,
                        altText: e.node.image.altText
                    } : null
                };
            }) || [],
            options: shopifyProduct.options || [],
            tags: shopifyProduct.tags || [],
            metafields: this._parseMetafields(shopifyProduct.metafields),
            collections: shopifyProduct.collections?.edges?.map(e => e.node.handle) || []
        };
    }

    /**
     * Transforma carrinho do Shopify para formato interno
     * @param {Object} shopifyCart - Carrinho do Shopify
     * @returns {Object}
     */
    _transformCart(shopifyCart) {
        if (!shopifyCart) return null;

        const items = shopifyCart.lines?.edges?.map(edge => {
            const line = edge.node;
            const variant = line.merchandise;
            const product = variant.product;

            // Extrair personalização de customAttributes
            const personalization = {};
            if (line.attributes && line.attributes.length > 0) {
                line.attributes.forEach(attr => {
                    if (attr.key === 'Texto Personalizado') {
                        personalization.text = attr.value;
                    } else if (attr.key === 'Fonte') {
                        personalization.font = attr.value;
                    } else if (attr.key === 'Cor') {
                        personalization.color = attr.value;
                    } else if (attr.key === 'Posição') {
                        personalization.position = attr.value;
                    }
                });
            }

            const price = Math.round(parseFloat(variant.price?.amount || 0) * 100);
            const hasPersonalization = personalization.text && personalization.text.trim().length > 0;
            const personalizationPrice = hasPersonalization ? 2000 : 0; // R$ 20,00

            return {
                id: line.id,
                lineId: line.id,
                productId: product.id,
                handle: product.handle,
                variantId: variant.id,
                name: product.title,
                variantTitle: variant.title,
                basePrice: price,
                personalizationPrice: personalizationPrice,
                totalPrice: price + personalizationPrice,
                quantity: line.quantity,
                image: product.images?.edges?.[0]?.node?.url || null,
                variant: {
                    id: variant.id,
                    title: variant.title
                },
                personalization: hasPersonalization ? personalization : null
            };
        }) || [];

        const subtotal = Math.round(parseFloat(shopifyCart.cost?.subtotalAmount?.amount || 0) * 100);
        const total = Math.round(parseFloat(shopifyCart.cost?.totalAmount?.amount || 0) * 100);

        return {
            id: shopifyCart.id,
            checkoutUrl: shopifyCart.checkoutUrl,
            items: items,
            itemCount: shopifyCart.totalQuantity || 0,
            subtotal: subtotal,
            total: total
        };
    }

    /**
     * Parseia metafields do Shopify
     * @param {Array} metafields - Metafields do Shopify
     * @returns {Object}
     */
    _parseMetafields(metafields) {
        if (!metafields || !Array.isArray(metafields)) return {};

        const parsed = {};
        metafields.forEach(field => {
            // Verificar se field existe e tem as propriedades necessárias
            if (!field || !field.namespace || !field.key) {
                return; // Pular campos inválidos
            }
            
            if (!parsed[field.namespace]) {
                parsed[field.namespace] = {};
            }
            try {
                parsed[field.namespace][field.key] = field.value ? JSON.parse(field.value) : null;
            } catch {
                parsed[field.namespace][field.key] = field.value || null;
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
