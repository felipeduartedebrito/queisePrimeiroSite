/**
 * ============================================
 * CART.JS - Componente de Carrinho de Compras
 * ============================================
 * 
 * Componente modular para gerenciamento completo do carrinho
 * Integra com storage, utils, api e notification
 * 
 * @module components/Cart
 */

import { CartStorage } from '../core/storage.js';
import { formatPrice, delay, clamp } from '../core/utils.js';
import { CART_CONFIG, ENVIRONMENT, SHOPIFY, STORAGE_KEYS, PERSONALIZATION_CONFIG } from '../core/config.js';
import { Notification } from './notification.js';
import { api } from '../core/api.js';

// ========================================
// PRODUTOS RECOMENDADOS (MOCK)
// ========================================

const RECOMMENDED_PRODUCTS = [
    {
        id: 'copo-termico-500ml',
        handle: 'copo-termico-500ml',
        name: 'Copo Térmico 500ml',
        price: 8000,
        image: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp'
    },
    {
        id: 'bolsa-termica-20l',
        handle: 'bolsa-termica-20l',
        name: 'Bolsa Térmica 20L',
        price: 12000,
        image: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp'
    },
    {
        id: 'garrafa-600ml',
        handle: 'garrafa-600ml',
        name: 'Garrafa Térmica 600ml',
        price: 14500,
        image: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp'
    }
];

// ========================================
// CLASSE CART MANAGER
// ========================================

/**
 * Classe principal para gerenciamento do carrinho
 */
export class CartManager {
    constructor() {
        this.cart = { items: [], timestamp: Date.now() };
        this.selectedShipping = null;
        this.appliedCoupon = null;
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.init();
    }

    /**
     * Inicializa carrinho de forma assíncrona
     */
    async init() {
        this.setLoading(true, 'Carregando carrinho...');
        try {
            this.cart = await this.loadCart();
            this.renderCart();
            this.renderRecommendedProducts();
        } catch (error) {
            console.error('Erro ao inicializar carrinho:', error);
            Notification.error('Erro ao carregar carrinho');
        } finally {
            this.setLoading(false);
        }
    }

    // ========================================
    // GERENCIAMENTO DE DADOS DO CARRINHO
    // ========================================

    /**
     * Carrega carrinho do storage ou Shopify
     * @returns {Object} Objeto do carrinho
     */
    async loadCart() {
        if (ENVIRONMENT.isDevelopment) {
            // Modo desenvolvimento: usar localStorage
            const cart = CartStorage.get();
            if (!cart.items) {
                return { items: [], timestamp: Date.now() };
            }
            return cart;
        } else {
            // Modo produção: usar Shopify API
            try {
                const shopifyCart = await api.getOrCreateCart();
                // Converter formato Shopify para formato interno
                return {
                    items: shopifyCart.items || [],
                    timestamp: Date.now(),
                    shopifyCartId: shopifyCart.id,
                    checkoutUrl: shopifyCart.checkoutUrl
                };
            } catch (error) {
                console.error('Erro ao carregar carrinho do Shopify:', error);
                Notification.error('Erro ao carregar carrinho. Tente novamente.');
                return { items: [], timestamp: Date.now() };
            }
        }
    }

    /**
     * Salva carrinho no storage
     */
    saveCart() {
        this.cart.timestamp = Date.now();
        CartStorage.set(this.cart);
        
        // Dispatch evento personalizado para outras páginas
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart: this.cart }
        }));
    }

    // ========================================
    // OPERAÇÕES DO CARRINHO
    // ========================================

    /**
     * Atualiza quantidade de um item
     * @param {string} productId - ID do produto ou lineId
     * @param {number} newQuantity - Nova quantidade
     */
    async updateQuantity(productId, newQuantity) {
        newQuantity = clamp(
            parseInt(newQuantity), 
            CART_CONFIG.minQuantity, 
            CART_CONFIG.maxQuantity
        );
        
        const item = this.cart.items.find(item => item.id === productId || item.lineId === productId);
        if (!item) {
            Notification.error('Item não encontrado no carrinho');
            return;
        }

        this.setLoading(true, 'Atualizando quantidade...');

        try {
            if (ENVIRONMENT.isDevelopment) {
                // Modo desenvolvimento: usar localStorage
                item.quantity = newQuantity;
                CartStorage.updateQuantity(productId, newQuantity);
                this.cart = this.loadCart();
                this.renderCart();
                Notification.success(`Quantidade atualizada para ${newQuantity}`);
            } else {
                // Modo produção: usar Shopify API
                const cartId = this.cart.shopifyCartId || CartStorage.getCartId();
                if (!cartId) {
                    throw new Error('Cart ID não encontrado');
                }

                const lineId = item.lineId || item.id;
                const updatedCart = await api.updateCartLine(cartId, [{
                    id: lineId,
                    quantity: newQuantity
                }]);

                this.cart = {
                    items: updatedCart.items || [],
                    timestamp: Date.now(),
                    shopifyCartId: updatedCart.id,
                    checkoutUrl: updatedCart.checkoutUrl
                };

                this.renderCart();
                Notification.success(`Quantidade atualizada para ${newQuantity}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            Notification.error('Erro ao atualizar quantidade. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Remove item do carrinho
     * @param {string} productId - ID do produto ou lineId
     */
    async removeItem(productId) {
        const item = this.cart.items.find(item => item.id === productId || item.lineId === productId);
        if (!item) {
            Notification.error('Item não encontrado no carrinho');
            return;
        }

        this.setLoading(true, 'Removendo item...');

        try {
            if (ENVIRONMENT.isDevelopment) {
                // Modo desenvolvimento: usar localStorage
                CartStorage.removeItem(productId);
                this.cart = this.loadCart();
                this.renderCart();
                Notification.success(`${item.name} removido do carrinho`);
            } else {
                // Modo produção: usar Shopify API
                const cartId = this.cart.shopifyCartId || CartStorage.getCartId();
                if (!cartId) {
                    throw new Error('Cart ID não encontrado');
                }

                const lineId = item.lineId || item.id;
                const updatedCart = await api.removeCartLine(cartId, [lineId]);

                this.cart = {
                    items: updatedCart.items || [],
                    timestamp: Date.now(),
                    shopifyCartId: updatedCart.id,
                    checkoutUrl: updatedCart.checkoutUrl
                };

                this.renderCart();
                Notification.success(`${item.name} removido do carrinho`);
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
            Notification.error('Erro ao remover item. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Limpa todo o carrinho
     */
    async clearCart() {
        if (this.cart.items.length === 0) return;
        
        if (!confirm('Tem certeza que deseja remover todos os itens do carrinho?')) {
            return;
        }

        this.setLoading(true, 'Limpando carrinho...');

        try {
            if (ENVIRONMENT.isDevelopment) {
                // Modo desenvolvimento: usar localStorage
                CartStorage.clear();
                this.cart = { items: [], timestamp: Date.now() };
                this.selectedShipping = null;
                this.appliedCoupon = null;
                this.saveCart();
                this.renderCart();
                Notification.success('Carrinho limpo com sucesso');
            } else {
                // Modo produção: remover todos os itens via API
                const cartId = this.cart.shopifyCartId || CartStorage.getCartId();
                if (cartId) {
                    const lineIds = this.cart.items.map(item => item.lineId || item.id);
                    await api.removeCartLine(cartId, lineIds);
                }

                this.cart = { items: [], timestamp: Date.now() };
                this.selectedShipping = null;
                this.appliedCoupon = null;
                this.renderCart();
                Notification.success('Carrinho limpo com sucesso');
            }
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            Notification.error('Erro ao limpar carrinho. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Redireciona para edição do item
     * @param {string} productId - ID do produto
     */
    editItem(productId) {
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            const editUrl = `produto-individual.html?id=${item.handle}&edit=true&cartItemId=${productId}`;
            window.location.href = editUrl;
        }
    }

    // ========================================
    // CÁLCULOS FINANCEIROS
    // ========================================

    /**
     * Calcula subtotal (sem personalização)
     * @returns {number} Subtotal em centavos
     */
    calculateSubtotal() {
        return this.cart.items.reduce((total, item) => {
            return total + (item.basePrice * item.quantity);
        }, 0);
    }

    /**
     * Calcula total de personalização
     * @returns {number} Total em centavos
     */
    calculatePersonalizationTotal() {
        return this.cart.items.reduce((total, item) => {
            const personalizationPrice = item.personalization ? (item.personalizationPrice || 0) : 0;
            return total + (personalizationPrice * item.quantity);
        }, 0);
    }

    /**
     * Calcula total de um item específico
     * @param {Object} item - Item do carrinho
     * @returns {number} Total em centavos
     */
    calculateItemTotal(item) {
        const baseTotal = item.basePrice * item.quantity;
        const personalizationTotal = item.personalization ? (item.personalizationPrice || 0) * item.quantity : 0;
        return baseTotal + personalizationTotal;
    }

    /**
     * Calcula total final do carrinho
     * @returns {number} Total em centavos
     */
    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        const personalizationTotal = this.calculatePersonalizationTotal();
        const shippingCost = this.getShippingCost();
        const discount = this.getDiscountAmount();
        
        return Math.max(0, subtotal + personalizationTotal + shippingCost - discount);
    }

    /**
     * Obtém custo do frete
     * @returns {number} Custo em centavos
     */
    getShippingCost() {
        if (!this.selectedShipping) return 0;
        
        // Frete grátis se coupon aplicado ou valor mínimo atingido
        if (this.appliedCoupon?.type === 'free_shipping') return 0;
        if (this.calculateSubtotal() >= CART_CONFIG.shipping.freeShippingLimit) return 0;
        
        return this.selectedShipping.price;
    }

    /**
     * Calcula valor do desconto
     * @returns {number} Desconto em centavos
     */
    getDiscountAmount() {
        if (!this.appliedCoupon) return 0;
        
        const subtotal = this.calculateSubtotal() + this.calculatePersonalizationTotal();
        
        switch (this.appliedCoupon.type) {
            case 'percentage':
                return Math.floor(subtotal * (this.appliedCoupon.value / 100));
            case 'fixed':
                return Math.min(this.appliedCoupon.value, subtotal);
            default:
                return 0;
        }
    }

    // ========================================
    // RENDERIZAÇÃO DA INTERFACE
    // ========================================

    /**
     * Renderiza o carrinho completo
     */
    renderCart() {
        this.updateCartCount();
        
        if (this.cart.items.length === 0) {
            this.showEmptyCart();
        } else {
            this.showCartWithItems();
        }
    }

    /**
     * Atualiza contador de itens no header
     */
    updateCartCount() {
        const count = this.cart.items.reduce((total, item) => total + item.quantity, 0);
        const countElement = document.getElementById('cartItemCount');
        if (countElement) {
            countElement.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
        }
    }

    /**
     * Mostra estado de carrinho vazio
     */
    showEmptyCart() {
        const emptyCart = document.getElementById('emptyCart');
        const cartWithItems = document.getElementById('cartWithItems');
        
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartWithItems) cartWithItems.style.display = 'none';
    }

    /**
     * Mostra carrinho com itens
     */
    showCartWithItems() {
        const emptyCart = document.getElementById('emptyCart');
        const cartWithItems = document.getElementById('cartWithItems');
        
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartWithItems) cartWithItems.style.display = 'block';
        
        this.renderCartItems();
        this.updateSummary();
    }

    /**
     * Renderiza lista de itens do carrinho
     */
    renderCartItems() {
        const container = document.getElementById('cartItemsList');
        const template = document.getElementById('cartItemTemplate');
        
        if (!container || !template) return;
        
        container.innerHTML = '';
        
        this.cart.items.forEach(item => {
            const itemElement = template.content.cloneNode(true);
            
            // Configurar dados do item
            const cartItem = itemElement.querySelector('.cart-item');
            cartItem.dataset.productId = item.id;
            
            // Imagem
            const img = itemElement.querySelector('.item-image img');
            if (img) {
                img.src = item.image || '../imagens/placeholder-product.jpg';
                img.alt = item.name;
            }
            
            // Badge de personalização
            const customBadge = itemElement.querySelector('.item-customization-badge');
            if (customBadge) {
                customBadge.style.display = item.personalization ? 'block' : 'none';
            }
            
            // Detalhes do produto
            const nameEl = itemElement.querySelector('.item-name');
            if (nameEl) nameEl.textContent = item.name;
            
            const variantEl = itemElement.querySelector('.item-variant');
            if (variantEl) {
                variantEl.textContent = 
                    `${item.variant?.size || ''} ${item.variant?.color || ''}`.trim() || 'Tamanho único';
            }
            
            // Personalização
            const customSection = itemElement.querySelector('.item-customization');
            if (customSection) {
                customSection.style.display = item.personalization ? 'block' : 'none';
                if (item.personalization) {
                    const details = itemElement.querySelector('.customization-details');
                    if (details) {
                        details.innerHTML = this.formatPersonalizationDetails(item.personalization);
                    }
                }
            }
            
            // Quantidade
            const quantityInput = itemElement.querySelector('.quantity-input');
            if (quantityInput) {
                quantityInput.value = item.quantity;
            }
            
            // Preços
            const currentPrice = itemElement.querySelector('.current-price');
            if (currentPrice) {
                currentPrice.textContent = formatPrice(this.calculateItemTotal(item));
            }
            
            const basePrice = itemElement.querySelector('.base-price');
            if (basePrice) {
                basePrice.textContent = `Produto: ${formatPrice(item.basePrice * item.quantity)}`;
            }
            
            const customPrice = itemElement.querySelector('.customization-price');
            if (customPrice && item.personalization) {
                customPrice.style.display = 'block';
                customPrice.textContent = `Personalização: ${formatPrice((item.personalizationPrice || 0) * item.quantity)}`;
            } else if (customPrice) {
                customPrice.style.display = 'none';
            }
            
            container.appendChild(itemElement);
        });
        
        this.setupItemEventListeners();
    }

    /**
     * Formata detalhes de personalização
     * @param {Object} personalization - Objeto de personalização
     * @returns {string} HTML formatado
     */
    formatPersonalizationDetails(personalization) {
        let details = [];
        if (personalization.text) details.push(`Texto: "${personalization.text}"`);
        if (personalization.font) details.push(`Fonte: ${personalization.font}`);
        if (personalization.color) details.push(`Cor: ${personalization.color}`);
        if (personalization.position) details.push(`Posição: ${personalization.position}`);
        return details.join('<br>');
    }

    /**
     * Atualiza resumo do pedido
     */
    updateSummary() {
        const subtotalEl = document.getElementById('subtotalPrice');
        if (subtotalEl) {
            subtotalEl.textContent = formatPrice(this.calculateSubtotal());
        }
        
        const personalizationEl = document.getElementById('personalizationPrice');
        if (personalizationEl) {
            personalizationEl.textContent = formatPrice(this.calculatePersonalizationTotal());
        }
        
        const shippingElement = document.getElementById('shippingPrice');
        if (shippingElement) {
            const shippingCost = this.getShippingCost();
            
            if (this.selectedShipping) {
                if (shippingCost === 0) {
                    shippingElement.textContent = 'Grátis';
                    shippingElement.classList.add('free-shipping');
                } else {
                    shippingElement.textContent = formatPrice(shippingCost);
                    shippingElement.classList.remove('free-shipping');
                }
            } else {
                shippingElement.textContent = 'Calcular';
                shippingElement.classList.remove('free-shipping');
            }
        }
        
        const totalEl = document.getElementById('totalPrice');
        if (totalEl) {
            totalEl.textContent = formatPrice(this.calculateTotal());
        }
        
        // Atualizar botão de checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.items.length === 0;
        }
    }

    // ========================================
    // FRETE E CUPONS
    // ========================================

    /**
     * Calcula opções de frete
     * @param {string} zipCode - CEP
     */
    async calculateShipping(zipCode) {
        this.setLoading(true, 'Calculando frete...');
        
        try {
            // Simular chamada de API
            await delay(1500);
            
            // Em produção, aqui seria uma chamada real para API dos Correios ou Melhor Envio
            const shippingOptions = this.getShippingOptions(zipCode);
            this.displayShippingOptions(shippingOptions);
            
        } catch (error) {
            Notification.error('Erro ao calcular frete. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Obtém opções de frete baseado no CEP
     * @param {string} zipCode - CEP
     * @returns {Array} Opções de frete
     */
    getShippingOptions(zipCode) {
        // Simulação baseada no CEP
        const options = [...CART_CONFIG.shipping.defaultShippingMethods];
        
        // Ajustar preços baseado na região (simulado)
        if (zipCode.startsWith('01') || zipCode.startsWith('04')) {
            // São Paulo capital - frete mais barato
            options.forEach(option => option.price = Math.floor(option.price * 0.8));
        } else if (zipCode.startsWith('2') || zipCode.startsWith('3')) {
            // Interior SP/RJ - preço normal
        } else {
            // Outras regiões - frete mais caro
            options.forEach(option => option.price = Math.floor(option.price * 1.3));
        }
        
        return options;
    }

    /**
     * Exibe opções de frete na interface
     * @param {Array} options - Opções de frete
     */
    displayShippingOptions(options) {
        const container = document.getElementById('shippingOptions');
        if (!container) return;
        
        container.innerHTML = '';
        container.style.display = 'block';
        
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'shipping-option';
            optionElement.innerHTML = `
                <div class="shipping-info">
                    <div class="shipping-name">${option.name}</div>
                    <div class="shipping-time">${option.time}</div>
                </div>
                <div class="shipping-price">${formatPrice(option.price)}</div>
            `;
            
            optionElement.addEventListener('click', () => {
                document.querySelectorAll('.shipping-option').forEach(el => el.classList.remove('selected'));
                optionElement.classList.add('selected');
                this.selectedShipping = option;
                this.updateSummary();
                Notification.success(`Frete ${option.name} selecionado`);
            });
            
            container.appendChild(optionElement);
        });
    }

    /**
     * Aplica cupom de desconto
     * @param {string} code - Código do cupom
     */
    async applyCoupon(code) {
        if (!code.trim()) {
            this.showCouponMessage('Digite um código de cupom', 'error');
            return;
        }

        this.setLoading(true, 'Validando cupom...');
        
        try {
            // Simular validação de API
            await delay(1000);
            
            const coupon = CART_CONFIG.validCoupons[code.toUpperCase()];
            
            if (coupon) {
                this.appliedCoupon = { ...coupon, code: code.toUpperCase() };
                this.updateSummary();
                this.showCouponMessage(`Cupom aplicado: ${coupon.description}`, 'success');
                
                // Limpar campo
                const couponInput = document.getElementById('couponCode');
                if (couponInput) couponInput.value = '';
            } else {
                this.showCouponMessage('Cupom inválido ou expirado', 'error');
            }
            
        } catch (error) {
            this.showCouponMessage('Erro ao validar cupom. Tente novamente.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Exibe mensagem de cupom
     * @param {string} message - Mensagem
     * @param {string} type - Tipo: 'success' ou 'error'
     */
    showCouponMessage(message, type) {
        const messageElement = document.getElementById('couponMessage');
        if (!messageElement) return;
        
        messageElement.textContent = message;
        messageElement.className = `coupon-message ${type}`;
        
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'coupon-message';
        }, 4000);
    }

    // ========================================
    // CHECKOUT E INTEGRAÇÃO SHOPIFY
    // ========================================

    /**
     * Processa checkout
     */
    async proceedToCheckout() {
        if (this.cart.items.length === 0) {
            Notification.error('Seu carrinho está vazio');
            return;
        }

        this.setLoading(true, 'Preparando checkout...');

        try {
            if (ENVIRONMENT.isDevelopment) {
                // Modo desenvolvimento - simular checkout
                await this.simulateCheckout();
            } else {
                // Modo produção - usar Shopify Checkout
                await this.createShopifyCheckout();
            }
        } catch (error) {
            console.error('Erro no checkout:', error);
            Notification.error('Erro ao processar checkout. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Simula checkout (desenvolvimento)
     */
    async simulateCheckout() {
        await delay(2000);
        
        // Simular preparação do checkout
        const checkoutData = {
            items: this.cart.items,
            subtotal: this.calculateSubtotal(),
            personalizationTotal: this.calculatePersonalizationTotal(),
            shipping: this.selectedShipping,
            coupon: this.appliedCoupon,
            total: this.calculateTotal()
        };

        console.log('Dados do checkout (simulado):', checkoutData);
        
        // Redirecionar para página de checkout
        window.location.href = 'checkout.html';
    }

    /**
     * Cria checkout no Shopify (produção)
     */
    async createShopifyCheckout() {
        try {
            const cartId = this.cart.shopifyCartId || CartStorage.getCartId();
            
            if (!cartId) {
                // Se não há cart ID, criar carrinho primeiro
                // Helper para construir customAttributes (apenas se personalização habilitada)
                const buildCustomAttributes = (personalization) => {
                    if (!PERSONALIZATION_CONFIG.enabled || !personalization || !personalization.text) return [];
                    const attrs = [];
                    if (personalization.text) {
                        attrs.push({ key: 'Texto Personalizado', value: personalization.text });
                    }
                    if (personalization.font) {
                        attrs.push({ key: 'Fonte', value: personalization.font });
                    }
                    if (personalization.color) {
                        attrs.push({ key: 'Cor', value: personalization.color });
                    }
                    if (personalization.position || personalization.orientation) {
                        attrs.push({ key: 'Posição', value: personalization.position || personalization.orientation });
                    }
                    return attrs;
                };

                const lines = this.cart.items.map(item => ({
                    merchandiseId: item.variantId,
                    quantity: item.quantity,
                    attributes: (PERSONALIZATION_CONFIG.enabled && item.personalization) ? buildCustomAttributes(item.personalization) : []
                }));
                
                const newCart = await api.createCart(lines);
                const checkoutUrl = api.getCheckoutUrl(newCart.id);
                window.location.href = checkoutUrl;
                return;
            }

            // Usar checkout URL do carrinho existente
            const checkoutUrl = this.cart.checkoutUrl || api.getCheckoutUrl(cartId);
            
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                throw new Error('URL de checkout não disponível');
            }
        } catch (error) {
            throw new Error('Falha ao criar checkout no Shopify: ' + error.message);
        }
    }

    // ========================================
    // PRODUTOS RECOMENDADOS
    // ========================================

    /**
     * Renderiza produtos recomendados
     */
    renderRecommendedProducts() {
        const container = document.getElementById('recommendedGrid');
        const template = document.getElementById('recommendedProductTemplate');
        
        if (!container || !template) return;

        // Filtrar produtos que já estão no carrinho
        const cartProductIds = this.cart.items.map(item => item.id);
        const available = RECOMMENDED_PRODUCTS.filter(product => !cartProductIds.includes(product.id));
        
        // Mostrar até 3 produtos
        const toShow = available.slice(0, 3);
        
        container.innerHTML = '';
        
        toShow.forEach(product => {
            const productElement = template.content.cloneNode(true);
            
            const img = productElement.querySelector('.recommended-image img');
            if (img) {
                img.src = product.image;
                img.alt = product.name;
            }
            
            const nameEl = productElement.querySelector('.recommended-name');
            if (nameEl) nameEl.textContent = product.name;
            
            const priceEl = productElement.querySelector('.recommended-price');
            if (priceEl) priceEl.textContent = formatPrice(product.price);
            
            const link = productElement.querySelector('.btn-secondary');
            if (link) {
                link.href = `produto-individual.html?id=${product.handle}`;
            }
            
            container.appendChild(productElement);
        });
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    /**
     * Inicializa event listeners principais
     */
    initializeEventListeners() {
        // Limpar carrinho
        const clearBtn = document.getElementById('clearCartBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCart());
        }

        // Calcular frete
        const calculateShippingBtn = document.getElementById('calculateShipping');
        if (calculateShippingBtn) {
            calculateShippingBtn.addEventListener('click', () => {
                const zipCodeInput = document.getElementById('zipCode');
                if (!zipCodeInput) return;
                
                const zipCode = zipCodeInput.value.replace(/\D/g, '');
                
                if (zipCode.length !== 8) {
                    Notification.error('Digite um CEP válido (8 dígitos)');
                    return;
                }
                
                this.calculateShipping(zipCode);
            });
        }

        // Aplicar cupom
        const applyCouponBtn = document.getElementById('applyCoupon');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => {
                const couponInput = document.getElementById('couponCode');
                if (!couponInput) return;
                
                const code = couponInput.value.trim();
                this.applyCoupon(code);
            });
        }

        // Enter nos campos de entrada
        const zipCodeInput = document.getElementById('zipCode');
        if (zipCodeInput) {
            zipCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && calculateShippingBtn) {
                    calculateShippingBtn.click();
                }
            });

            // Máscara de CEP
            zipCodeInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 5) {
                    value = value.substring(0, 5) + '-' + value.substring(5, 8);
                }
                e.target.value = value;
            });
        }

        const couponInput = document.getElementById('couponCode');
        if (couponInput) {
            couponInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && applyCouponBtn) {
                    applyCouponBtn.click();
                }
            });
        }

        // Checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }
    }

    /**
     * Configura event listeners dos itens do carrinho
     */
    setupItemEventListeners() {
        // Botões de quantidade
        document.querySelectorAll('.quantity-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                const input = cartItem.querySelector('.quantity-input');
                if (!input) return;
                
                const newQuantity = Math.max(1, parseInt(input.value) - 1);
                input.value = newQuantity;
                this.updateQuantity(cartItem.dataset.productId, newQuantity);
            });
        });

        document.querySelectorAll('.quantity-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                const input = cartItem.querySelector('.quantity-input');
                if (!input) return;
                
                const newQuantity = Math.min(99, parseInt(input.value) + 1);
                input.value = newQuantity;
                this.updateQuantity(cartItem.dataset.productId, newQuantity);
            });
        });

        // Input de quantidade direto
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                const newQuantity = parseInt(e.target.value) || 1;
                e.target.value = newQuantity;
                this.updateQuantity(cartItem.dataset.productId, newQuantity);
            });

            input.addEventListener('blur', (e) => {
                const value = parseInt(e.target.value);
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                if (isNaN(value) || value < 1) {
                    e.target.value = 1;
                    this.updateQuantity(cartItem.dataset.productId, 1);
                }
            });
        });

        // Botões de ação
        document.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                const productId = cartItem.dataset.productId;
                this.editItem(productId);
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                const productId = cartItem.dataset.productId;
                
                // Animação de saída
                cartItem.style.transform = 'translateX(-100%)';
                cartItem.style.opacity = '0';
                
                setTimeout(() => {
                    this.removeItem(productId);
                }, 300);
            });
        });
    }

    // ========================================
    // UTILITÁRIOS
    // ========================================

    /**
     * Define estado de loading
     * @param {boolean} isLoading - Estado de loading
     * @param {string} message - Mensagem
     */
    setLoading(isLoading, message = 'Carregando...') {
        this.isLoading = isLoading;
        
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = isLoading;
        });

        if (isLoading) {
            Notification.info(message);
        }
    }

    // ========================================
    // MÉTODOS ESTÁTICOS (PARA OUTRAS PÁGINAS)
    // ========================================

    /**
     * Adiciona produto ao carrinho (método estático)
     * @param {Object} product - Produto a adicionar
     * @returns {boolean} Sucesso da operação
     */
    static addToCart(product) {
        try {
            const cart = CartStorage.get();
            
            // Verificar se produto já existe
            const existingItem = cart.items.find(item => 
                item.id === product.id && 
                JSON.stringify(item.variant) === JSON.stringify(product.variant) &&
                JSON.stringify(item.personalization) === JSON.stringify(product.personalization)
            );

            if (existingItem) {
                existingItem.quantity += product.quantity || 1;
            } else {
                cart.items.push({
                    ...product,
                    quantity: product.quantity || 1,
                    timestamp: Date.now()
                });
            }

            CartStorage.set(cart);
            
            // Dispatch evento
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: cart }
            }));

            return true;
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            return false;
        }
    }

    /**
     * Obtém contagem de itens no carrinho
     * @returns {number} Contagem total
     */
    static getCartCount() {
        const cart = CartStorage.get();
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Obtém carrinho completo
     * @returns {Object} Objeto do carrinho
     */
    static getCart() {
        return CartStorage.get();
    }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default CartManager;

