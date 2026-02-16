/**
 * ============================================
 * CACHE.JS - Simple Cache Layer
 * ============================================
 * 
 * Sistema de cache simples com TTL (Time To Live)
 * Usado para cachear produtos e coleções do Shopify
 * 
 * @module cache
 */

import { debugLog } from './config.js';

/**
 * Classe para gerenciamento de cache com TTL
 */
export class SimpleCache {
    constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutos padrão
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    /**
     * Adiciona item ao cache
     * 
     * @param {string} key - Chave do cache
     * @param {*} value - Valor a ser cacheado
     * @param {number} ttl - Time to live em milissegundos (opcional)
     */
    set(key, value, ttl = null) {
        const expirationTime = Date.now() + (ttl || this.defaultTTL);
        
        this.cache.set(key, {
            value,
            expirationTime
        });

        debugLog(`Cache SET: ${key} (expires in ${(ttl || this.defaultTTL) / 1000}s)`);
    }

    /**
     * Obtém item do cache
     * 
     * @param {string} key - Chave do cache
     * @returns {*|null} Valor cacheado ou null se expirado/não encontrado
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            debugLog(`Cache MISS: ${key}`);
            return null;
        }

        // Verificar expiração
        if (Date.now() > item.expirationTime) {
            this.cache.delete(key);
            debugLog(`Cache EXPIRED: ${key}`);
            return null;
        }

        debugLog(`Cache HIT: ${key}`);
        return item.value;
    }

    /**
     * Verifica se chave existe e não está expirada
     * 
     * @param {string} key - Chave do cache
     * @returns {boolean}
     */
    has(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return false;
        }

        if (Date.now() > item.expirationTime) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Remove item do cache
     * 
     * @param {string} key - Chave do cache
     * @returns {boolean} True se removido, false se não existia
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            debugLog(`Cache DELETE: ${key}`);
        }
        return deleted;
    }

    /**
     * Limpa todo o cache
     */
    clear() {
        this.cache.clear();
        debugLog('Cache CLEAR: all entries removed');
    }

    /**
     * Remove itens expirados do cache
     * 
     * @returns {number} Número de itens removidos
     */
    cleanup() {
        const now = Date.now();
        let removed = 0;

        for (const [key, item] of this.cache.entries()) {
            if (now > item.expirationTime) {
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            debugLog(`Cache CLEANUP: ${removed} expired entries removed`);
        }

        return removed;
    }

    /**
     * Obtém tamanho do cache
     * 
     * @returns {number} Número de itens no cache
     */
    size() {
        return this.cache.size;
    }

    /**
     * Gera chave de cache para produto
     * 
     * @param {string} handle - Handle do produto
     * @returns {string} Chave de cache
     */
    static productKey(handle) {
        return `product:${handle}`;
    }

    /**
     * Gera chave de cache para lista de produtos
     * 
     * @param {Object} filters - Filtros aplicados
     * @returns {string} Chave de cache
     */
    static productsKey(filters = {}) {
        const filterStr = JSON.stringify(filters);
        return `products:${filterStr}`;
    }

    /**
     * Gera chave de cache para coleção
     * 
     * @param {string} handle - Handle da coleção
     * @returns {string} Chave de cache
     */
    static collectionKey(handle) {
        return `collection:${handle}`;
    }

    /**
     * Gera chave de cache para lista de coleções
     * 
     * @returns {string} Chave de cache
     */
    static collectionsKey() {
        return 'collections:all';
    }
}

// Instância global do cache
export const cache = new SimpleCache();

export default cache;

