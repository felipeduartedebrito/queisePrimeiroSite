/**
 * ============================================
 * SHOPIFY.CONFIG.JS - GraphQL Queries & Mutations
 * ============================================
 * 
 * Todas as queries e mutations GraphQL usadas na integração Shopify
 * Documentadas e organizadas por funcionalidade
 * 
 * @module shopify-config
 */

// ========================================
// PRODUCT QUERIES
// ========================================

/**
 * Query para buscar um produto por handle
 * Inclui variantes, imagens, metafields de personalização
 */
export const PRODUCT_QUERY = `
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
                        width
                        height
                    }
                }
            }
            
            variants(first: 50) {
                edges {
                    node {
                        id
                        title
                        availableForSale
                        # quantityAvailable não está disponível no Storefront API sem permissão especial
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
                        image {
                            url
                            altText
                        }
                    }
                }
            }
            
            options {
                name
                values
            }
            
            metafields(identifiers: [
                {namespace: "custom", key: "personalization"},
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

/**
 * Query para listar produtos com filtros
 * Usado em páginas de listagem e busca
 */
export const PRODUCTS_QUERY = `
    query getProducts($first: Int!, $query: String, $after: String) {
        products(first: $first, query: $query, after: $after) {
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
                startCursor
                endCursor
            }
        }
    }
`;

// ========================================
// COLLECTION QUERIES
// ========================================

/**
 * Query para buscar uma coleção por handle
 * Inclui produtos da coleção
 */
export const COLLECTION_QUERY = `
    query getCollection($handle: String!, $first: Int = 50, $after: String) {
        collection(handle: $handle) {
            id
            handle
            title
            description
            descriptionHtml
            
            products(first: $first, after: $after) {
                edges {
                    node {
                        id
                        handle
                        title
                        vendor
                        productType
                        
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
                pageInfo {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                }
            }
        }
    }
`;

/**
 * Query para listar todas as coleções
 */
export const COLLECTIONS_QUERY = `
    query getCollections($first: Int = 50) {
        collections(first: $first) {
            edges {
                node {
                    id
                    handle
                    title
                    description
                    image {
                        url
                        altText
                    }
                }
            }
        }
    }
`;

// ========================================
// CART MUTATIONS
// ========================================

/**
 * Mutation para criar um novo carrinho
 * Retorna o ID do carrinho criado
 */
export const CART_CREATE_MUTATION = `
    mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
            cart {
                id
                checkoutUrl
                totalQuantity
                cost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                    subtotalAmount {
                        amount
                        currencyCode
                    }
                }
                lines(first: 250) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    product {
                                        id
                                        title
                                        handle
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
                            attributes {
                                key
                                value
                            }
                        }
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

/**
 * Query para buscar carrinho por ID
 */
export const CART_QUERY = `
    query getCart($id: ID!) {
        cart(id: $id) {
            id
            checkoutUrl
            totalQuantity
            cost {
                totalAmount {
                    amount
                    currencyCode
                }
                subtotalAmount {
                    amount
                    currencyCode
                }
            }
            lines(first: 250) {
                edges {
                    node {
                        id
                        quantity
                        merchandise {
                            ... on ProductVariant {
                                id
                                title
                                price {
                                    amount
                                    currencyCode
                                }
                                product {
                                    id
                                    title
                                    handle
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
                        attributes {
                            key
                            value
                        }
                    }
                }
            }
        }
    }
`;

/**
 * Mutation para adicionar itens ao carrinho
 * Suporta customAttributes para personalização
 */
export const CART_LINES_ADD_MUTATION = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
                id
                checkoutUrl
                totalQuantity
                cost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                    subtotalAmount {
                        amount
                        currencyCode
                    }
                }
                lines(first: 250) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    product {
                                        id
                                        title
                                        handle
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
                            attributes {
                                key
                                value
                            }
                        }
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

/**
 * Mutation para atualizar quantidade de itens no carrinho
 */
export const CART_LINES_UPDATE_MUTATION = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart {
                id
                checkoutUrl
                totalQuantity
                cost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                    subtotalAmount {
                        amount
                        currencyCode
                    }
                }
                lines(first: 250) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    product {
                                        id
                                        title
                                        handle
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
                            attributes {
                                key
                                value
                            }
                        }
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

/**
 * Mutation para remover itens do carrinho
 */
export const CART_LINES_REMOVE_MUTATION = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart {
                id
                checkoutUrl
                totalQuantity
                cost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                    subtotalAmount {
                        amount
                        currencyCode
                    }
                }
                lines(first: 250) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    product {
                                        id
                                        title
                                        handle
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
                            attributes {
                                key
                                value
                            }
                        }
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

// ========================================
// EXPORTS
// ========================================

export default {
    // Product Queries
    PRODUCT_QUERY,
    PRODUCTS_QUERY,
    
    // Collection Queries
    COLLECTION_QUERY,
    COLLECTIONS_QUERY,
    
    // Cart Operations
    CART_CREATE_MUTATION,
    CART_QUERY,
    CART_LINES_ADD_MUTATION,
    CART_LINES_UPDATE_MUTATION,
    CART_LINES_REMOVE_MUTATION
};

