// CARRINHO.JS - Sistema de Carrinho QUEISE (Shopify-Ready)

// ========================================
// CONFIGURAÇÃO E CONSTANTES
// ========================================

const CART_CONFIG = {
    isDevelopment: true, // Mudar para false na produção com Shopify
    storageKey: 'queise_cart',
    maxQuantity: 99,
    minQuantity: 1,
    
    // Configuração Shopify (para produção)
    shopify: {
        domain: 'queise.myshopify.com',
        storefrontAccessToken: 'your-storefront-access-token'
    },
    
    // Configuração de frete (simulado)
    shipping: {
        freeShippingLimit: 20000, // R$ 200,00 em centavos
        defaultShippingMethods: [
            { id: 'pac', name: 'PAC', time: '8 a 12 dias úteis', price: 1500 },
            { id: 'sedex', name: 'SEDEX', time: '3 a 5 dias úteis', price: 2500 },
            { id: 'sedex10', name: 'SEDEX 10', time: '1 dia útil', price: 4000 }
        ]
    },
    
    // Cupons válidos (simulado)
    validCoupons: {
        'QUEISE10': { type: 'percentage', value: 10, description: '10% de desconto' },
        'PRIMEIRACOMPRA': { type: 'percentage', value: 15, description: '15% de desconto primeira compra' },
        'FRETEGRATIS': { type: 'free_shipping', value: 0, description: 'Frete grátis' },
        'WELCOME20': { type: 'fixed', value: 2000, description: 'R$ 20,00 de desconto' }
    }
};

// Produtos recomendados (simulado)
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
// CLASSES PRINCIPAIS
// ========================================

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.selectedShipping = null;
        this.appliedCoupon = null;
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.renderCart();
        this.renderRecommendedProducts();
    }

    // ========================================
    // GERENCIAMENTO DE DADOS DO CARRINHO
    // ========================================

    loadCart() {
        try {
            const saved = localStorage.getItem(CART_CONFIG.storageKey);
            return saved ? JSON.parse(saved) : { items: [], timestamp: Date.now() };
        } catch (error) {
            console.warn('Erro ao carregar carrinho:', error);
            return { items: [], timestamp: Date.now() };
        }
    }

    saveCart() {
        try {
            this.cart.timestamp = Date.now();
            localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(this.cart));
            
            // Dispatch evento personalizado para outras páginas
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: this.cart }
            }));
        } catch (error) {
            console.error('Erro ao salvar carrinho:', error);
        }
    }

    // ========================================
    // OPERAÇÕES DO CARRINHO
    // ========================================

    updateQuantity(productId, newQuantity) {
        newQuantity = Math.max(CART_CONFIG.minQuantity, Math.min(CART_CONFIG.maxQuantity, parseInt(newQuantity)));
        
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.renderCart();
            this.showNotification(`Quantidade atualizada para ${newQuantity}`, 'success');
        }
    }

    removeItem(productId) {
        const itemIndex = this.cart.items.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const removedItem = this.cart.items[itemIndex];
            this.cart.items.splice(itemIndex, 1);
            this.saveCart();
            this.renderCart();
            this.showNotification(`${removedItem.name} removido do carrinho`, 'success');
        }
    }

    clearCart() {
        if (this.cart.items.length === 0) return;
        
        if (confirm('Tem certeza que deseja remover todos os itens do carrinho?')) {
            this.cart.items = [];
            this.selectedShipping = null;
            this.appliedCoupon = null;
            this.saveCart();
            this.renderCart();
            this.showNotification('Carrinho limpo com sucesso', 'success');
        }
    }

    editItem(productId) {
        // Redirecionar para página de edição do produto
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            const editUrl = `produto-individual.html?id=${item.handle}&edit=true&cartItemId=${productId}`;
            window.location.href = editUrl;
        }
    }

    // ========================================
    // CÁLCULOS FINANCEIROS
    // ========================================

    calculateSubtotal() {
        return this.cart.items.reduce((total, item) => {
            return total + (item.basePrice * item.quantity);
        }, 0);
    }

    calculatePersonalizationTotal() {
        return this.cart.items.reduce((total, item) => {
            const personalizationPrice = item.personalization ? (item.personalizationPrice || 0) : 0;
            return total + (personalizationPrice * item.quantity);
        }, 0);
    }

    calculateItemTotal(item) {
        const baseTotal = item.basePrice * item.quantity;
        const personalizationTotal = item.personalization ? (item.personalizationPrice || 0) * item.quantity : 0;
        return baseTotal + personalizationTotal;
    }

    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        const personalizationTotal = this.calculatePersonalizationTotal();
        const shippingCost = this.getShippingCost();
        const discount = this.getDiscountAmount();
        
        return Math.max(0, subtotal + personalizationTotal + shippingCost - discount);
    }

    getShippingCost() {
        if (!this.selectedShipping) return 0;
        
        // Frete grátis se coupon aplicado ou valor mínimo atingido
        if (this.appliedCoupon?.type === 'free_shipping') return 0;
        if (this.calculateSubtotal() >= CART_CONFIG.shipping.freeShippingLimit) return 0;
        
        return this.selectedShipping.price;
    }

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

    renderCart() {
        this.updateCartCount();
        
        if (this.cart.items.length === 0) {
            this.showEmptyCart();
        } else {
            this.showCartWithItems();
        }
    }

    updateCartCount() {
        const count = this.cart.items.reduce((total, item) => total + item.quantity, 0);
        const countElement = document.getElementById('cartItemCount');
        if (countElement) {
            countElement.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
        }
    }

    showEmptyCart() {
        document.getElementById('emptyCart').style.display = 'block';
        document.getElementById('cartWithItems').style.display = 'none';
    }

    showCartWithItems() {
        document.getElementById('emptyCart').style.display = 'none';
        document.getElementById('cartWithItems').style.display = 'block';
        
        this.renderCartItems();
        this.updateSummary();
    }

    renderCartItems() {
        const container = document.getElementById('cartItemsList');
        const template = document.getElementById('cartItemTemplate');
        
        container.innerHTML = '';
        
        this.cart.items.forEach(item => {
            const itemElement = template.content.cloneNode(true);
            
            // Configurar dados do item
            const cartItem = itemElement.querySelector('.cart-item');
            cartItem.dataset.productId = item.id;
            
            // Imagem
            const img = itemElement.querySelector('.item-image img');
            img.src = item.image || '../imagens/placeholder-product.jpg';
            img.alt = item.name;
            
            // Badge de personalização
            const customBadge = itemElement.querySelector('.item-customization-badge');
            if (item.personalization) {
                customBadge.style.display = 'block';
            }
            
            // Detalhes do produto
            itemElement.querySelector('.item-name').textContent = item.name;
            itemElement.querySelector('.item-variant').textContent = 
                `${item.variant?.size || ''} ${item.variant?.color || ''}`.trim() || 'Tamanho único';
            
            // Personalização
            const customSection = itemElement.querySelector('.item-customization');
            if (item.personalization) {
                customSection.style.display = 'block';
                const details = itemElement.querySelector('.customization-details');
                details.innerHTML = this.formatPersonalizationDetails(item.personalization);
            }
            
            // Quantidade
            const quantityInput = itemElement.querySelector('.quantity-input');
            quantityInput.value = item.quantity;
            
            // Preços
            const currentPrice = itemElement.querySelector('.current-price');
            const basePrice = itemElement.querySelector('.base-price');
            const customPrice = itemElement.querySelector('.customization-price');
            
            currentPrice.textContent = this.formatPrice(this.calculateItemTotal(item));
            basePrice.textContent = `Produto: ${this.formatPrice(item.basePrice * item.quantity)}`;
            
            if (item.personalization) {
                customPrice.style.display = 'block';
                customPrice.textContent = `Personalização: ${this.formatPrice((item.personalizationPrice || 0) * item.quantity)}`;
            }
            
            container.appendChild(itemElement);
        });
        
        this.setupItemEventListeners();
    }

    formatPersonalizationDetails(personalization) {
        let details = [];
        if (personalization.text) details.push(`Texto: "${personalization.text}"`);
        if (personalization.font) details.push(`Fonte: ${personalization.font}`);
        if (personalization.color) details.push(`Cor: ${personalization.color}`);
        if (personalization.position) details.push(`Posição: ${personalization.position}`);
        return details.join('<br>');
    }

    updateSummary() {
        document.getElementById('subtotalPrice').textContent = this.formatPrice(this.calculateSubtotal());
        document.getElementById('personalizationPrice').textContent = this.formatPrice(this.calculatePersonalizationTotal());
        
        const shippingElement = document.getElementById('shippingPrice');
        const shippingCost = this.getShippingCost();
        
        if (this.selectedShipping) {
            if (shippingCost === 0) {
                shippingElement.textContent = 'Grátis';
                shippingElement.style.color = 'var(--primary)';
            } else {
                shippingElement.textContent = this.formatPrice(shippingCost);
                shippingElement.style.color = '';
            }
        } else {
            shippingElement.textContent = 'Calcular';
            shippingElement.style.color = '';
        }
        
        document.getElementById('totalPrice').textContent = this.formatPrice(this.calculateTotal());
        
        // Atualizar botão de checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.disabled = this.cart.items.length === 0;
    }

    // ========================================
    // FRETE E CUPONS
    // ========================================

    async calculateShipping(zipCode) {
        this.setLoading(true, 'Calculando frete...');
        
        try {
            // Simular chamada de API
            await this.delay(1500);
            
            // Em produção, aqui seria uma chamada real para API dos Correios ou Melhor Envio
            const shippingOptions = this.getShippingOptions(zipCode);
            this.displayShippingOptions(shippingOptions);
            
        } catch (error) {
            this.showNotification('Erro ao calcular frete. Tente novamente.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

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

    displayShippingOptions(options) {
        const container = document.getElementById('shippingOptions');
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
                <div class="shipping-price">${this.formatPrice(option.price)}</div>
            `;
            
            optionElement.addEventListener('click', () => {
                document.querySelectorAll('.shipping-option').forEach(el => el.classList.remove('selected'));
                optionElement.classList.add('selected');
                this.selectedShipping = option;
                this.updateSummary();
                this.showNotification(`Frete ${option.name} selecionado`, 'success');
            });
            
            container.appendChild(optionElement);
        });
    }

    async applyCoupon(code) {
        if (!code.trim()) {
            this.showCouponMessage('Digite um código de cupom', 'error');
            return;
        }

        this.setLoading(true, 'Validando cupom...');
        
        try {
            // Simular validação de API
            await this.delay(1000);
            
            const coupon = CART_CONFIG.validCoupons[code.toUpperCase()];
            
            if (coupon) {
                this.appliedCoupon = { ...coupon, code: code.toUpperCase() };
                this.updateSummary();
                this.showCouponMessage(`Cupom aplicado: ${coupon.description}`, 'success');
                
                // Limpar campo
                document.getElementById('couponCode').value = '';
            } else {
                this.showCouponMessage('Cupom inválido ou expirado', 'error');
            }
            
        } catch (error) {
            this.showCouponMessage('Erro ao validar cupom. Tente novamente.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    showCouponMessage(message, type) {
        const messageElement = document.getElementById('couponMessage');
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

    async proceedToCheckout() {
        if (this.cart.items.length === 0) {
            this.showNotification('Seu carrinho está vazio', 'error');
            return;
        }

        this.setLoading(true, 'Preparando checkout...');

        try {
            if (CART_CONFIG.isDevelopment) {
                // Modo desenvolvimento - simular checkout
                await this.simulateCheckout();
            } else {
                // Modo produção - usar Shopify Checkout
                await this.createShopifyCheckout();
            }
        } catch (error) {
            console.error('Erro no checkout:', error);
            this.showNotification('Erro ao processar checkout. Tente novamente.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async simulateCheckout() {
        await this.delay(2000);
        
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
        
        // Redirecionar para página de checkout (a ser desenvolvida)
        window.location.href = 'checkout.html';
    }

    async createShopifyCheckout() {
        try {
            // Preparar line items para Shopify
            const lineItems = this.cart.items.map(item => {
                const lineItem = {
                    variantId: item.variantId,
                    quantity: item.quantity
                };

                // Adicionar propriedades de personalização
                if (item.personalization) {
                    lineItem.customAttributes = [
                        { key: 'Texto Personalizado', value: item.personalization.text || '' },
                        { key: 'Fonte', value: item.personalization.font || '' },
                        { key: 'Cor do Texto', value: item.personalization.color || '' },
                        { key: 'Posição', value: item.personalization.position || '' }
                    ];
                }

                return lineItem;
            });

            // Criar checkout no Shopify
            const checkout = await this.shopifyCreateCheckout(lineItems);
            
            // Aplicar cupom se houver
            if (this.appliedCoupon) {
                await this.shopifyApplyDiscount(checkout.id, this.appliedCoupon.code);
            }

            // Redirecionar para checkout do Shopify
            window.location.href = checkout.webUrl;

        } catch (error) {
            throw new Error('Falha ao criar checkout no Shopify: ' + error.message);
        }
    }

    async shopifyCreateCheckout(lineItems) {
        const query = `
            mutation checkoutCreate($input: CheckoutCreateInput!) {
                checkoutCreate(input: $input) {
                    checkout {
                        id
                        webUrl
                        totalPrice {
                            amount
                        }
                    }
                    checkoutUserErrors {
                        field
                        message
                    }
                }
            }
        `;

        const variables = {
            input: {
                lineItems: lineItems,
                allowPartialAddresses: true
            }
        };

        const response = await this.shopifyGraphQL(query, variables);
        
        if (response.data.checkoutCreate.checkoutUserErrors.length > 0) {
            throw new Error(response.data.checkoutCreate.checkoutUserErrors[0].message);
        }

        return response.data.checkoutCreate.checkout;
    }

    async shopifyApplyDiscount(checkoutId, discountCode) {
        const query = `
            mutation checkoutDiscountCodeApplyV2($checkoutId: ID!, $discountCode: String!) {
                checkoutDiscountCodeApplyV2(checkoutId: $checkoutId, discountCode: $discountCode) {
                    checkout {
                        id
                    }
                    checkoutUserErrors {
                        field
                        message
                    }
                }
            }
        `;

        const variables = {
            checkoutId: checkoutId,
            discountCode: discountCode
        };

        await this.shopifyGraphQL(query, variables);
    }

    async shopifyGraphQL(query, variables = {}) {
        const response = await fetch(`https://${CART_CONFIG.shopify.domain}/api/2023-10/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': CART_CONFIG.shopify.storefrontAccessToken
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // ========================================
    // PRODUTOS RECOMENDADOS
    // ========================================

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
            
            productElement.querySelector('.recommended-image img').src = product.image;
            productElement.querySelector('.recommended-image img').alt = product.name;
            productElement.querySelector('.recommended-name').textContent = product.name;
            productElement.querySelector('.recommended-price').textContent = this.formatPrice(product.price);
            
            const link = productElement.querySelector('.btn-secondary');
            link.href = `produto-individual.html?id=${product.handle}`;
            
            container.appendChild(productElement);
        });
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    initializeEventListeners() {
        // Limpar carrinho
        document.getElementById('clearCartBtn')?.addEventListener('click', () => {
            this.clearCart();
        });

        // Calcular frete
        document.getElementById('calculateShipping')?.addEventListener('click', () => {
            const zipCode = document.getElementById('zipCode').value.replace(/\D/g, '');
            
            if (zipCode.length !== 8) {
                this.showNotification('Digite um CEP válido (8 dígitos)', 'error');
                return;
            }
            
            this.calculateShipping(zipCode);
        });

        // Aplicar cupom
        document.getElementById('applyCoupon')?.addEventListener('click', () => {
            const code = document.getElementById('couponCode').value.trim();
            this.applyCoupon(code);
        });

        // Enter nos campos de entrada
        document.getElementById('zipCode')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('calculateShipping').click();
            }
        });

        document.getElementById('couponCode')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('applyCoupon').click();
            }
        });

        // Máscara de CEP
        document.getElementById('zipCode')?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5, 8);
            }
            e.target.value = value;
        });

        // Checkout
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            this.proceedToCheckout();
        });
    }

    setupItemEventListeners() {
        // Botões de quantidade
        document.querySelectorAll('.quantity-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const input = cartItem.querySelector('.quantity-input');
                const newQuantity = Math.max(1, parseInt(input.value) - 1);
                input.value = newQuantity;
                this.updateQuantity(cartItem.dataset.productId, newQuantity);
            });
        });

        document.querySelectorAll('.quantity-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const input = cartItem.querySelector('.quantity-input');
                const newQuantity = Math.min(99, parseInt(input.value) + 1);
                input.value = newQuantity;
                this.updateQuantity(cartItem.dataset.productId, newQuantity);
            });
        });

        // Input de quantidade direto
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const newQuantity = parseInt(e.target.value) || 1;
                e.target.value = newQuantity;
                this.updateQuantity(cartItem.dataset.productId, newQuantity);
            });

            input.addEventListener('blur', (e) => {
                const value = parseInt(e.target.value);
                if (isNaN(value) || value < 1) {
                    e.target.value = 1;
                    this.updateQuantity(e.target.closest('.cart-item').dataset.productId, 1);
                }
            });
        });

        // Botões de ação
        document.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.cart-item').dataset.productId;
                this.editItem(productId);
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
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

    formatPrice(priceInCents) {
        return (priceInCents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    setLoading(isLoading, message = 'Carregando...') {
        this.isLoading = isLoading;
        
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = isLoading;
        });

        if (isLoading) {
            // Adicionar overlay de loading se necessário
            this.showNotification(message, 'info');
        }
    }

    showNotification(message, type = 'info') {
        // Criar notificação toast
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Estilos inline para a notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '1rem 1.5rem',
            background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : 'var(--primary)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-medium)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            fontSize: '0.9rem',
            fontWeight: '500'
        });

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover após 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================
    // MÉTODOS PÚBLICOS PARA OUTRAS PÁGINAS
    // ========================================

    static addToCart(product) {
        // Método estático para adicionar produto ao carrinho de outras páginas
        try {
            const cart = JSON.parse(localStorage.getItem(CART_CONFIG.storageKey) || '{"items":[]}');
            
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

            localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(cart));
            
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

    static getCartCount() {
        try {
            const cart = JSON.parse(localStorage.getItem(CART_CONFIG.storageKey) || '{"items":[]}');
            return cart.items.reduce((total, item) => total + item.quantity, 0);
        } catch (error) {
            return 0;
        }
    }

    static getCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_CONFIG.storageKey) || '{"items":[]}');
        } catch (error) {
            return { items: [] };
        }
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Aguardar DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cartManager = new CartManager();
    });
} else {
    window.cartManager = new CartManager();
}

// Adicionar estilos CSS para notificações se não existirem
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .notification-icon {
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .notification-message {
            flex: 1;
        }
    `;
    document.head.appendChild(style);
}

// Exportar para uso global
window.CartManager = CartManager;

// ========================================
// DESENVOLVIMENTO - DADOS DE TESTE
// ========================================

// Função para adicionar produtos de teste (apenas desenvolvimento)
if (CART_CONFIG.isDevelopment) {
    window.addTestProducts = function() {
        const testProducts = [
            {
                id: 'garrafa-stanley-1l-test',
                handle: 'garrafa-stanley-1l',
                name: 'Garrafa Stanley 1L',
                basePrice: 16500,
                personalizationPrice: 2000,
                image: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                variant: { size: '1L', color: 'Azul' },
                personalization: {
                    text: 'JOÃO SILVA',
                    font: 'Arial',
                    color: '#FFFFFF',
                    position: 'center'
                },
                quantity: 1
            },
            {
                id: 'copo-termico-test',
                handle: 'copo-termico-500ml',
                name: 'Copo Térmico 500ml',
                basePrice: 8000,
                image: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                variant: { size: '500ml', color: 'Preto' },
                quantity: 2
            }
        ];

        testProducts.forEach(product => {
            CartManager.addToCart(product);
        });

        if (window.cartManager) {
            window.cartManager.cart = window.cartManager.loadCart();
            window.cartManager.renderCart();
        }

        console.log('Produtos de teste adicionados ao carrinho');
    };

    // Comando para limpar dados de teste
    window.clearTestData = function() {
        localStorage.removeItem(CART_CONFIG.storageKey);
        if (window.cartManager) {
            window.cartManager.cart = { items: [] };
            window.cartManager.renderCart();
        }
        console.log('Dados de teste removidos');
    };

    console.log('Modo desenvolvimento ativo. Use addTestProducts() para adicionar produtos de teste.');
}