/**
 * ============================================
 * SHOPIFY-CLIENT.JS - Shopify API Client
 * ============================================
 * 
 * Cliente HTTP para comunicação com Shopify Storefront API
 * Inclui retry logic, rate limiting handling e tratamento de erros
 * 
 * @module shopify-client
 */

import { SHOPIFY, debugLog } from './config.js';

/**
 * Sleep helper para delays
 * @param {number} ms - Milissegundos
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executa requisição GraphQL para Shopify com retry logic
 * 
 * @param {string} query - Query ou mutation GraphQL
 * @param {Object} variables - Variáveis da query
 * @param {number} retries - Número de tentativas (padrão: 3)
 * @returns {Promise<Object>} Dados da resposta
 * @throws {Error} Erro após todas as tentativas
 */
export async function shopifyFetch(query, variables = {}, retries = 3) {
    const endpoint = `https://${SHOPIFY.domain}${SHOPIFY.endpoints.graphql}`;
    const headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY.storefrontAccessToken
    };

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            debugLog(`Shopify API Request (attempt ${attempt + 1}/${retries}):`, { query: query.substring(0, 100) + '...', variables });

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ query, variables })
            });

            // Rate limiting (429)
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || Math.pow(2, attempt);
                const waitTime = parseInt(retryAfter) * 1000;
                
                debugLog(`Rate limited. Waiting ${waitTime}ms before retry...`);
                
                if (attempt < retries - 1) {
                    await sleep(waitTime);
                    continue;
                } else {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
            }

            // Outros erros HTTP
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const json = await response.json();

            // Erros GraphQL
            if (json.errors && json.errors.length > 0) {
                const error = json.errors[0];
                const errorMessage = error.message || 'Unknown GraphQL error';
                const errorExtensions = error.extensions || {};
                
                debugLog('GraphQL Error:', error);

                // Alguns erros não devem ser retentados
                if (errorExtensions.code === 'INVALID_INPUT' || 
                    errorExtensions.code === 'NOT_FOUND' ||
                    errorMessage.includes('not found')) {
                    throw new Error(errorMessage);
                }

                // Retry em outros erros
                if (attempt < retries - 1) {
                    const waitTime = 1000 * (attempt + 1);
                    debugLog(`GraphQL error, retrying in ${waitTime}ms...`);
                    await sleep(waitTime);
                    continue;
                }

                throw new Error(errorMessage);
            }

            // Sucesso
            debugLog('Shopify API Response:', json.data);
            return json.data;

        } catch (error) {
            debugLog(`Shopify API Error (attempt ${attempt + 1}/${retries}):`, error);

            // Se é erro de rede e ainda temos tentativas
            if (error instanceof TypeError && error.message.includes('fetch')) {
                if (attempt < retries - 1) {
                    const waitTime = 1000 * (attempt + 1);
                    debugLog(`Network error, retrying in ${waitTime}ms...`);
                    await sleep(waitTime);
                    continue;
                }
                throw new Error('Network error. Please check your connection and try again.');
            }

            // Última tentativa ou erro não retentável
            if (attempt === retries - 1) {
                throw error;
            }

            // Aguardar antes de retry
            const waitTime = 1000 * (attempt + 1);
            await sleep(waitTime);
        }
    }

    throw new Error('Failed to fetch from Shopify after all retries');
}

/**
 * Helper para construir query string de busca
 * 
 * @param {Object} filters - Filtros de busca
 * @returns {string} Query string formatada
 */
export function buildProductQuery(filters = {}) {
    const parts = [];

    if (filters.collection) {
        parts.push(`collection:${filters.collection}`);
    }

    if (filters.tag) {
        parts.push(`tag:${filters.tag}`);
    }

    if (filters.query) {
        parts.push(filters.query);
    }

    if (filters.vendor) {
        parts.push(`vendor:${filters.vendor}`);
    }

    if (filters.productType) {
        parts.push(`product_type:${filters.productType}`);
    }

    if (filters.priceMin || filters.priceMax) {
        const min = filters.priceMin ? `variants.price:>=${filters.priceMin}` : '';
        const max = filters.priceMax ? `variants.price:<=${filters.priceMax}` : '';
        if (min || max) {
            parts.push([min, max].filter(Boolean).join(' AND '));
        }
    }

    return parts.join(' AND ') || '*';
}

/**
 * Helper para otimizar URLs de imagem do Shopify CDN
 * 
 * @param {string} imageUrl - URL original da imagem
 * @param {Object} options - Opções de transformação
 * @param {number} options.width - Largura desejada
 * @param {number} options.height - Altura desejada
 * @param {string} options.crop - Tipo de crop (center, top, bottom, left, right)
 * @returns {string} URL otimizada
 */
export function optimizeImageUrl(imageUrl, options = {}) {
    if (!imageUrl) return '';

    const params = new URLSearchParams();

    if (options.width) {
        params.append('width', options.width);
    }

    if (options.height) {
        params.append('height', options.height);
    }

    if (options.crop) {
        params.append('crop', options.crop);
    }

    const queryString = params.toString();
    return queryString ? `${imageUrl}?${queryString}` : imageUrl;
}

/**
 * Helper para gerar thumbnail de imagem
 * 
 * @param {string} imageUrl - URL original
 * @returns {string} URL do thumbnail
 */
export function getThumbnailUrl(imageUrl) {
    return optimizeImageUrl(imageUrl, { width: 400, height: 400, crop: 'center' });
}

/**
 * Helper para gerar URL responsiva de imagem
 * 
 * @param {string} imageUrl - URL original
 * @param {string} size - Tamanho: 'mobile' (800px) ou 'desktop' (1200px)
 * @returns {string} URL responsiva
 */
export function getResponsiveImageUrl(imageUrl, size = 'desktop') {
    const width = size === 'mobile' ? 800 : 1200;
    return optimizeImageUrl(imageUrl, { width });
}

export default {
    shopifyFetch,
    buildProductQuery,
    optimizeImageUrl,
    getThumbnailUrl,
    getResponsiveImageUrl
};

