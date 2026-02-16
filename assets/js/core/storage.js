/**
 * ============================================
 * STORAGE.JS - Gerenciamento de LocalStorage
 * ============================================
 * 
 * Módulo responsável por abstrair operações de localStorage
 * Fornece métodos seguros com validação e tratamento de erros
 * 
 * @module storage
 */

import { STORAGE_KEYS, debugLog } from './config.js';

// ========================================
// CLASSE PRINCIPAL
// ========================================

/**
 * Classe para gerenciar localStorage de forma segura
 */
export class Storage {
    /**
     * Verifica se localStorage está disponível
     * @returns {boolean}
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage não disponível:', e);
            return false;
        }
    }

    /**
     * Salva item no localStorage
     * @param {string} key - Chave do item
     * @param {*} value - Valor a ser salvo (será convertido para JSON)
     * @returns {boolean} Sucesso da operação
     */
    static set(key, value) {
        if (!this.isAvailable()) {
            debugLog('localStorage não disponível');
            return false;
        }

        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            debugLog(`Storage SET: ${key}`, value);
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    /**
     * Recupera item do localStorage
     * @param {string} key - Chave do item
     * @param {*} defaultValue - Valor padrão se não encontrar
     * @returns {*} Valor armazenado ou defaultValue
     */
    static get(key, defaultValue = null) {
        if (!this.isAvailable()) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            
            if (item === null) {
                return defaultValue;
            }

            const parsed = JSON.parse(item);
            debugLog(`Storage GET: ${key}`, parsed);
            return parsed;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item do localStorage
     * @param {string} key - Chave do item
     * @returns {boolean} Sucesso da operação
     */
    static remove(key) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.removeItem(key);
            debugLog(`Storage REMOVE: ${key}`);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    }

    /**
     * Limpa todo o localStorage do projeto
     * Remove apenas chaves do QUEISE
     * @returns {boolean} Sucesso da operação
     */
    static clear() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            debugLog('Storage CLEAR: todas as chaves do projeto removidas');
            return true;
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
            return false;
        }
    }

    /**
     * Verifica se uma chave existe
     * @param {string} key - Chave a verificar
     * @returns {boolean}
     */
    static has(key) {
        return this.get(key) !== null;
    }

    /**
     * Atualiza item existente mesclando com novos dados
     * @param {string} key - Chave do item
     * @param {Object} updates - Objeto com atualizações
     * @returns {boolean} Sucesso da operação
     */
    static update(key, updates) {
        const current = this.get(key, {});
        const updated = { ...current, ...updates };
        return this.set(key, updated);
    }

    /**
     * Obtém tamanho aproximado do localStorage em bytes
     * @returns {number} Tamanho em bytes
     */
    static getSize() {
        if (!this.isAvailable()) {
            return 0;
        }

        let total = 0;
        Object.values(STORAGE_KEYS).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                total += item.length + key.length;
            }
        });
        return total;
    }
}

// ========================================
// MÉTODOS ESPECÍFICOS DO CARRINHO
// ========================================

/**
 * Gerenciamento específico do carrinho
 */
export const CartStorage = {
    /**
     * Obtém carrinho atual
     * @returns {Object} Objeto do carrinho com items array
     */
    get() {
        return Storage.get(STORAGE_KEYS.cart, { items: [] });
    },

    /**
     * Salva carrinho completo
     * @param {Object} cart - Objeto do carrinho
     * @returns {boolean}
     */
    set(cart) {
        return Storage.set(STORAGE_KEYS.cart, cart);
    },

    /**
     * Adiciona item ao carrinho
     * @param {Object} item - Item a adicionar
     * @returns {boolean}
     */
    addItem(item) {
        const cart = this.get();
        
        // Verificar se item já existe
        const existingIndex = cart.items.findIndex(i => 
            i.id === item.id && 
            JSON.stringify(i.variant) === JSON.stringify(item.variant) &&
            JSON.stringify(i.personalization) === JSON.stringify(item.personalization)
        );

        if (existingIndex > -1) {
            // Atualizar quantidade
            cart.items[existingIndex].quantity += item.quantity || 1;
        } else {
            // Adicionar novo item
            cart.items.push({
                ...item,
                timestamp: Date.now()
            });
        }

        return this.set(cart);
    },

    /**
     * Remove item do carrinho
     * @param {string} itemId - ID do item
     * @returns {boolean}
     */
    removeItem(itemId) {
        const cart = this.get();
        cart.items = cart.items.filter(item => item.id !== itemId);
        return this.set(cart);
    },

    /**
     * Atualiza quantidade de um item
     * @param {string} itemId - ID do item
     * @param {number} quantity - Nova quantidade
     * @returns {boolean}
     */
    updateQuantity(itemId, quantity) {
        const cart = this.get();
        const item = cart.items.find(i => i.id === itemId);
        
        if (item) {
            item.quantity = Math.max(1, Math.min(99, quantity));
            return this.set(cart);
        }
        
        return false;
    },

    /**
     * Limpa carrinho
     * @returns {boolean}
     */
    clear() {
        return this.set({ items: [] });
    },

    /**
     * Obtém contagem total de itens
     * @returns {number}
     */
    getCount() {
        const cart = this.get();
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Obtém valor total do carrinho
     * @returns {number} Total em centavos
     */
    getTotal() {
        const cart = this.get();
        return cart.items.reduce((total, item) => {
            const itemTotal = (item.basePrice + (item.personalizationPrice || 0)) * item.quantity;
            return total + itemTotal;
        }, 0);
    },

    /**
     * Salva ID do carrinho Shopify
     * @param {string} cartId - ID do carrinho Shopify
     * @returns {boolean}
     */
    saveCartId(cartId) {
        return Storage.set('shopify_cart_id', cartId);
    },

    /**
     * Obtém ID do carrinho Shopify
     * @returns {string|null} ID do carrinho ou null
     */
    getCartId() {
        return Storage.get('shopify_cart_id', null);
    },

    /**
     * Remove ID do carrinho Shopify
     * @returns {boolean}
     */
    clearCartId() {
        return Storage.remove('shopify_cart_id');
    }
};

// ========================================
// MÉTODOS ESPECÍFICOS DA WISHLIST
// ========================================

/**
 * Gerenciamento específico da wishlist
 */
export const WishlistStorage = {
    /**
     * Obtém wishlist atual
     * @returns {Array}
     */
    get() {
        return Storage.get(STORAGE_KEYS.wishlist, []);
    },

    /**
     * Adiciona item à wishlist
     * @param {Object} item - Item a adicionar
     * @returns {boolean}
     */
    add(item) {
        const wishlist = this.get();
        
        // Verificar se já existe
        const exists = wishlist.some(i => i.id === item.id);
        if (exists) {
            return false;
        }

        wishlist.push({
            ...item,
            addedAt: Date.now()
        });

        return Storage.set(STORAGE_KEYS.wishlist, wishlist);
    },

    /**
     * Remove item da wishlist
     * @param {string} itemId - ID do item
     * @returns {boolean}
     */
    remove(itemId) {
        const wishlist = this.get();
        const filtered = wishlist.filter(item => item.id !== itemId);
        return Storage.set(STORAGE_KEYS.wishlist, filtered);
    },

    /**
     * Verifica se item está na wishlist
     * @param {string} itemId - ID do item
     * @returns {boolean}
     */
    has(itemId) {
        const wishlist = this.get();
        return wishlist.some(item => item.id === itemId);
    },

    /**
     * Limpa wishlist
     * @returns {boolean}
     */
    clear() {
        return Storage.set(STORAGE_KEYS.wishlist, []);
    }
};

// ========================================
// MÉTODOS ESPECÍFICOS DE FILTROS
// ========================================

/**
 * Gerenciamento específico de filtros
 */
export const FiltersStorage = {
    /**
     * Salva filtros atuais
     * @param {Object} filters - Objeto de filtros
     * @returns {boolean}
     */
    save(filters) {
        return Storage.set(STORAGE_KEYS.filters, filters);
    },

    /**
     * Obtém filtros salvos
     * @returns {Object}
     */
    get() {
        return Storage.get(STORAGE_KEYS.filters, {
            categories: [],
            prices: [],
            features: [],
            priceRange: { min: '', max: '' },
            search: ''
        });
    },

    /**
     * Limpa filtros
     * @returns {boolean}
     */
    clear() {
        return Storage.remove(STORAGE_KEYS.filters);
    }
};

// ========================================
// MÉTODOS ESPECÍFICOS DE DESIGNS SALVOS
// ========================================

/**
 * Gerenciamento específico de designs personalizados salvos
 */
export const DesignsStorage = {
    /**
     * Obtém designs salvos
     * @returns {Array}
     */
    getAll() {
        return Storage.get(STORAGE_KEYS.savedDesigns, []);
    },

    /**
     * Salva novo design
     * @param {Object} design - Design a salvar
     * @returns {boolean}
     */
    save(design) {
        const designs = this.getAll();
        designs.push({
            ...design,
            id: Date.now(),
            savedAt: new Date().toISOString()
        });
        return Storage.set(STORAGE_KEYS.savedDesigns, designs);
    },

    /**
     * Remove design
     * @param {string} designId - ID do design
     * @returns {boolean}
     */
    remove(designId) {
        const designs = this.getAll();
        const filtered = designs.filter(d => d.id !== designId);
        return Storage.set(STORAGE_KEYS.savedDesigns, filtered);
    },

    /**
     * Limpa todos os designs
     * @returns {boolean}
     */
    clear() {
        return Storage.set(STORAGE_KEYS.savedDesigns, []);
    }
};

// ========================================
// MÉTODOS ESPECÍFICOS DE PREFERÊNCIAS
// ========================================

/**
 * Gerenciamento específico de preferências do usuário
 */
export const PreferencesStorage = {
    /**
     * Obtém preferências
     * @returns {Object}
     */
    get() {
        return Storage.get(STORAGE_KEYS.userPreferences, {
            theme: 'light',
            view: 'grid',
            sort: 'relevance',
            notifications: true
        });
    },

    /**
     * Salva preferência específica
     * @param {string} key - Chave da preferência
     * @param {*} value - Valor
     * @returns {boolean}
     */
    set(key, value) {
        const preferences = this.get();
        preferences[key] = value;
        return Storage.set(STORAGE_KEYS.userPreferences, preferences);
    },

    /**
     * Obtém preferência específica
     * @param {string} key - Chave da preferência
     * @param {*} defaultValue - Valor padrão
     * @returns {*}
     */
    getPref(key, defaultValue = null) {
        const preferences = this.get();
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }
};

// ========================================
// MÉTODOS ESPECÍFICOS DE PRODUTOS VISUALIZADOS
// ========================================

/**
 * Gerenciamento específico de produtos recentemente visualizados
 */
export const RecentlyViewedStorage = {
    /**
     * Obtém produtos visualizados
     * @returns {Array}
     */
    get() {
        return Storage.get(STORAGE_KEYS.recentlyViewed, []);
    },

    /**
     * Adiciona produto à lista
     * @param {Object} product - Produto visualizado
     * @param {number} maxItems - Máximo de itens a manter
     * @returns {boolean}
     */
    add(product, maxItems = 10) {
        let recent = this.get();
        
        // Remove se já existe
        recent = recent.filter(p => p.id !== product.id);
        
        // Adiciona no início
        recent.unshift({
            ...product,
            viewedAt: Date.now()
        });
        
        // Limita quantidade
        recent = recent.slice(0, maxItems);
        
        return Storage.set(STORAGE_KEYS.recentlyViewed, recent);
    },

    /**
     * Limpa histórico
     * @returns {boolean}
     */
    clear() {
        return Storage.set(STORAGE_KEYS.recentlyViewed, []);
    }
};

export default Storage;