/**
 * ============================================
 * CHECKOUT.JS - Checkout Page Component
 * ============================================
 * 
 * Componente para gerenciar a página de checkout
 * 
 * @module components/Checkout
 */

import { CartStorage } from '../core/storage.js';
import { formatPrice, validateEmail, validatePhone, validateCEP, delay } from '../core/utils.js';
import { Notification } from './notification.js';
import { CART_CONFIG } from '../core/config.js';

/**
 * Classe para gerenciar checkout
 */
export class CheckoutManager {
    constructor() {
        this.cart = CartStorage.get();
        this.shipping = null;
        this.paymentMethod = 'pix';
        this.discount = 0.05; // 5% desconto PIX
        this.couponCode = null;
        
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.loadOrderSummary();
            this.hideLoader();
            
            console.log('✅ Checkout inicializado com sucesso');
        } catch (error) {
            console.error('Erro na inicialização do checkout:', error);
        }
    }

    // ========================================
    // GERENCIAMENTO DO CARRINHO
    // ========================================

    loadOrderSummary() {
        const container = document.getElementById('summaryItems');
        if (!container || !this.cart.items || this.cart.items.length === 0) {
            // Redirecionar para carrinho se vazio
            if (!this.cart.items || this.cart.items.length === 0) {
                window.location.href = '../paginas/carrinho.html';
            }
            return;
        }

        container.innerHTML = this.cart.items.map(item => `
            <div class="summary-item">
                <div class="item-image">
                    <img src="${item.image || '../imagens/placeholder-product.jpg'}" 
                         alt="${item.name}" loading="lazy">
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-variant">
                        ${item.variant?.size || ''} ${item.variant?.color || ''}
                    </div>
                    ${item.personalization ? `
                        <div class="item-personalization">
                            Personalizado: "${item.personalization.text}"
                        </div>
                    ` : ''}
                    <div class="item-quantity">Qtd: ${item.quantity}</div>
                </div>
                <div class="item-price">
                    ${formatPrice((item.basePrice + (item.personalizationPrice || 0)) * item.quantity)}
                </div>
            </div>
        `).join('');

        this.updatePriceSummary();
    }

    updatePriceSummary() {
        const subtotal = this.cart.items.reduce((sum, item) => {
            const itemPrice = (item.basePrice + (item.personalizationPrice || 0)) * item.quantity;
            return sum + itemPrice;
        }, 0);
        
        const discountAmount = Math.round(subtotal * this.discount);
        const shippingCost = this.shipping?.price || 0;
        const total = subtotal - discountAmount + shippingCost;

        // Atualizar elementos da UI
        this.updatePriceElement('subtotalPrice', subtotal);
        this.updatePriceElement('totalPrice', total);
        this.updatePriceElement('shippingPrice', shippingCost);
        this.updatePriceElement('discountPrice', discountAmount);
    }

    updatePriceElement(elementId, price) {
        const element = document.getElementById(elementId);
        if (element) {
            if (elementId === 'shippingPrice' && price === 0 && !this.shipping) {
                element.textContent = 'Calculando...';
            } else {
                element.textContent = formatPrice(price);
            }
        }
    }

    // ========================================
    // CONFIGURAÇÃO DE EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // CEP lookup
        const zipCodeInput = document.getElementById('zipCode');
        if (zipCodeInput) {
            zipCodeInput.addEventListener('blur', (e) => this.lookupZipCode(e.target.value));
            zipCodeInput.addEventListener('input', (e) => this.formatZipCode(e.target));
        }

        // Formatação de telefone
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => this.formatPhone(e.target));
        });

        // Métodos de pagamento
        const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]');
        paymentInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handlePaymentMethodChange(e.target.value));
        });

        // Cupom de desconto
        const applyCouponBtn = document.getElementById('applyCoupon');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => this.applyCoupon());
        }

        // Formulário principal
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    // ========================================
    // FORMATAÇÃO DE CAMPOS
    // ========================================

    formatZipCode(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        input.value = value;
    }

    formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 6) {
                value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
            } else if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        input.value = value;
    }

    // ========================================
    // LOOKUP DE CEP
    // ========================================

    async lookupZipCode(zipCode) {
        const cleanZipCode = zipCode.replace(/\D/g, '');
        
        if (cleanZipCode.length !== 8) {
            if (cleanZipCode.length > 0) {
                Notification.error('CEP deve ter 8 dígitos');
            }
            return;
        }

        if (!validateCEP(cleanZipCode)) {
            Notification.error('CEP inválido');
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanZipCode}/json/`);
            const data = await response.json();

            if (data.erro) {
                Notification.error('CEP não encontrado');
                return;
            }

            // Preencher campos automaticamente
            this.fillAddressFields(data);
            
            // Calcular frete
            await this.calculateShipping(cleanZipCode);

        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            Notification.error('Erro ao buscar CEP. Verifique sua conexão.');
        }
    }

    fillAddressFields(addressData) {
        const fieldMap = {
            'address': addressData.logradouro,
            'neighborhood': addressData.bairro,
            'city': addressData.localidade,
            'state': addressData.uf
        };

        Object.entries(fieldMap).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value) {
                field.value = value;
            }
        });

        // Focar no campo número
        const numberField = document.getElementById('number');
        if (numberField) {
            numberField.focus();
        }
    }

    // ========================================
    // CÁLCULO DE FRETE
    // ========================================

    async calculateShipping(zipCode) {
        const shippingContainer = document.getElementById('shippingOptions');
        if (!shippingContainer) return;

        try {
            // Mostrar loading
            shippingContainer.innerHTML = `
                <div class="shipping-loading">
                    <div class="loading-spinner"></div>
                    <p>Calculando opções de entrega...</p>
                </div>
            `;

            // Simular cálculo de frete
            await delay(2000);

            const subtotal = this.cart.items.reduce((sum, item) => {
                const itemPrice = (item.basePrice + (item.personalizationPrice || 0)) * item.quantity;
                return sum + itemPrice;
            }, 0);

            let shippingOptions = CART_CONFIG.shipping?.defaultShippingMethods || [
                {
                    id: 'sedex',
                    name: 'SEDEX',
                    description: 'Entrega em 2-3 dias úteis',
                    price: 2500
                },
                {
                    id: 'pac',
                    name: 'PAC',
                    description: 'Entrega em 5-8 dias úteis',
                    price: 1500
                }
            ];

            // Frete grátis acima do limite
            if (subtotal >= CART_CONFIG.shipping?.freeShippingLimit) {
                shippingOptions.unshift({
                    id: 'free',
                    name: 'Frete Grátis',
                    description: 'Entrega em 5-7 dias úteis',
                    price: 0
                });
            }

            this.renderShippingOptions(shippingOptions);

        } catch (error) {
            console.error('Erro ao calcular frete:', error);
            shippingContainer.innerHTML = `
                <div class="shipping-error">
                    <p>Erro ao calcular frete. Tente novamente.</p>
                </div>
            `;
        }
    }

    renderShippingOptions(options) {
        const container = document.getElementById('shippingOptions');
        if (!container) return;

        container.innerHTML = options.map((option, index) => `
            <div class="shipping-option ${index === 0 ? 'selected' : ''}" 
                 data-shipping-id="${option.id}" 
                 data-shipping-price="${option.price}">
                <div class="shipping-info">
                    <h4>${option.name}</h4>
                    <p>${option.description}</p>
                </div>
                <div class="shipping-price">
                    ${option.price === 0 ? 'Grátis' : formatPrice(option.price)}
                </div>
            </div>
        `).join('');

        // Selecionar primeira opção por padrão
        if (options.length > 0) {
            this.shipping = options[0];
            this.updatePriceSummary();
        }

        // Event listeners para opções de frete
        container.querySelectorAll('.shipping-option').forEach(option => {
            option.addEventListener('click', () => {
                const shippingId = option.dataset.shippingId;
                
                // Atualizar seleção visual
                container.querySelectorAll('.shipping-option').forEach(opt => 
                    opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Atualizar dados de frete
                this.shipping = options.find(opt => opt.id === shippingId);
                this.updatePriceSummary();
            });
        });
    }

    // ========================================
    // MÉTODOS DE PAGAMENTO
    // ========================================

    handlePaymentMethodChange(method) {
        this.paymentMethod = method;
        
        // Atualizar desconto baseado no método
        switch (method) {
            case 'pix':
                this.discount = 0.05; // 5%
                break;
            case 'boleto':
                this.discount = 0.03; // 3%
                break;
            default:
                this.discount = 0;
        }

        this.updatePriceSummary();
    }

    // ========================================
    // CUPOM DE DESCONTO
    // ========================================

    async applyCoupon() {
        const couponInput = document.getElementById('couponCode');
        
        if (!couponInput) return;

        const couponCode = couponInput.value.trim().toUpperCase();
        
        if (!couponCode) {
            Notification.error('Digite um código de cupom');
            return;
        }

        try {
            // Validar cupom usando CART_CONFIG
            const validCoupons = CART_CONFIG.validCoupons || {};
            const coupon = validCoupons[couponCode];
            
            if (coupon) {
                this.couponCode = couponCode;
                
                // Aplicar desconto do cupom
                if (coupon.type === 'percentage') {
                    this.discount += coupon.value / 100;
                } else if (coupon.type === 'fixed') {
                    // Desconto fixo será aplicado no cálculo final
                    this.couponDiscount = coupon.value;
                } else if (coupon.type === 'free_shipping') {
                    // Frete grátis
                    if (this.shipping) {
                        this.shipping.price = 0;
                    }
                }
                
                this.updatePriceSummary();
                Notification.success(`Cupom "${couponCode}" aplicado com sucesso!`);
                couponInput.disabled = true;
                const applyBtn = document.getElementById('applyCoupon');
                if (applyBtn) {
                    applyBtn.textContent = 'Aplicado';
                    applyBtn.disabled = true;
                }
            } else {
                Notification.error('Cupom inválido ou expirado');
            }
        } catch (error) {
            console.error('Erro ao validar cupom:', error);
            Notification.error('Erro ao validar cupom');
        }
    }

    // ========================================
    // SUBMISSÃO DO FORMULÁRIO
    // ========================================

    async handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            // Validar formulário
            if (!this.validateForm()) {
                return;
            }
            
            // Coletar dados do formulário
            const formData = new FormData(e.target);
            const orderData = this.collectFormData(formData);
            
            // Simular processamento
            Notification.success('Pedido processado com sucesso!');
            
            // Limpar carrinho
            CartStorage.clear();
            
            // Redirecionar após delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);

        } catch (error) {
            console.error('Erro ao processar pedido:', error);
            Notification.error('Erro ao processar pedido. Tente novamente.');
        }
    }

    validateForm() {
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const zipCode = document.getElementById('zipCode')?.value;
        
        if (email && !validateEmail(email)) {
            Notification.error('E-mail inválido');
            return false;
        }
        
        if (phone && !validatePhone(phone)) {
            Notification.error('Telefone inválido');
            return false;
        }
        
        if (zipCode && !validateCEP(zipCode.replace(/\D/g, ''))) {
            Notification.error('CEP inválido');
            return false;
        }
        
        return true;
    }

    collectFormData(formData) {
        return {
            contact: {
                email: formData.get('email'),
                phone: formData.get('phone'),
                whatsapp: formData.get('whatsapp')
            },
            shipping: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                zipCode: formData.get('zipCode'),
                address: formData.get('address'),
                number: formData.get('number'),
                complement: formData.get('complement'),
                neighborhood: formData.get('neighborhood'),
                city: formData.get('city'),
                state: formData.get('state')
            },
            payment: {
                method: this.paymentMethod
            },
            items: this.cart.items,
            shipping: this.shipping,
            couponCode: this.couponCode
        };
    }

    // ========================================
    // UTILITÁRIOS
    // ========================================

    hideLoader() {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 300);
            }, 500);
        }
    }
}

