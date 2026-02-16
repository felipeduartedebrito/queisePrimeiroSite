/**
 * ============================================
 * PERSONALIZATION.JS - Componente de Personalização
 * ============================================
 * 
 * Componente modular para sistema de personalização de produtos
 * Wizard multi-step com preview em tempo real
 * 
 * @module components/Personalization
 */

import { CartStorage } from '../core/storage.js';
import { formatPrice } from '../core/utils.js';
import { Notification } from './notification.js';
import { api } from '../core/api.js';

// ========================================
// CONFIGURAÇÃO DE PRODUTOS PERSONALIZÁVEIS
// ========================================

/**
 * Configuração de produtos que podem ser personalizados
 * Pode vir do API ou ser configurado manualmente
 */
const PERSONALIZABLE_PRODUCTS = {
    'garrafa-stanley-1l': {
        name: 'Garrafa Stanley 1L',
        description: 'Garrafa térmica premium com isolamento superior',
        basePrice: 16500, // em centavos
        personalizationPrice: 2000, // em centavos
        variants: {
            tamanho: ['500ml', '1L', '1.2L'],
            cor: ['azul', 'preto', 'branco', 'verde']
        },
            personalizationConfig: {
                maxChars: 20,
                allowedFonts: ['Arial', 'Times', 'Script', 'Bold'],
                allowedColors: ['#FFFFFF', '#000000', '#FFD700', '#C0C0C0']
            }
    },
    'copo-termico-500ml': {
        name: 'Copo Térmico 500ml',
        description: 'Perfeito para seu café ou chá favorito',
        basePrice: 8000,
        personalizationPrice: 2000,
        variants: {
            tamanho: ['350ml', '500ml'],
            cor: ['azul', 'preto', 'branco']
        },
        personalizationConfig: {
            maxChars: 15,
            allowedFonts: ['Arial', 'Times', 'Bold'],
            allowedColors: ['#FFFFFF', '#000000', '#C0C0C0'],
            allowedPositions: ['center', 'bottom']
        }
    },
    'caneca-ceramica': {
        name: 'Caneca de Cerâmica',
        description: 'Caneca clássica para momentos especiais',
        basePrice: 4500,
        personalizationPrice: 1500,
        variants: {
            tamanho: ['300ml', '400ml'],
            cor: ['branco', 'preto', 'azul']
        },
        personalizationConfig: {
            maxChars: 25,
            allowedFonts: ['Arial', 'Times', 'Script', 'Bold'],
            allowedColors: ['#FFFFFF', '#000000', '#FFD700'],
            allowedPositions: ['center', 'side']
        }
    },
    'azulejo-decorativo': {
        name: 'Azulejo Decorativo',
        description: 'Transforme qualquer ambiente',
        basePrice: 3500,
        personalizationPrice: 1000,
        variants: {
            tamanho: ['10x10cm', '15x15cm', '20x20cm'],
            cor: ['branco', 'bege']
        },
        personalizationConfig: {
            maxChars: 30,
            allowedFonts: ['Arial', 'Times', 'Script', 'Bold'],
            allowedColors: ['#000000', '#4682B4', '#FFD700'],
            allowedPositions: ['center']
        }
    }
};

// ========================================
// CLASSE PERSONALIZATION MANAGER
// ========================================

/**
 * Classe principal para gerenciamento de personalização
 */
export class PersonalizationManager {
    /**
     * Cria um novo gerenciador de personalização
     * @param {Object} options - Opções de configuração
     */
    constructor(options = {}) {
        this.options = {
            storageKey: 'queise_personalization_state',
            maxSteps: 4,
            ...options
        };

        // Estado da personalização
        this.state = {
            currentStep: 1,
            selectedProduct: null,
            variants: {
                tamanho: null,
                cor: null
            },
            personalization: {
                text: 'SEU TEXTO',
                font: 'Arial',
                color: '#FFFFFF',
                orientation: 'texto-horizontal', // texto-vertical, texto-horizontal, icone-texto-vertical, icone-texto-horizontal, icone
                icon: 'icon-1' // icon-1, icon-2, icon-3, icon-4
            },
            pricing: {
                basePrice: 0,
                personalizationPrice: 0,
                total: 0
            }
        };

        // Referências DOM
        this.elements = {};
        
        // Inicializar
        this.init();
    }

    /**
     * Inicializa o componente
     */
    init() {
        this.captureDOMElements();
        this.loadSavedState();
        this.setupEventListeners();
        this.updateUI();
    }

    /**
     * Captura elementos DOM necessários
     */
    captureDOMElements() {
        this.elements = {
            progressSteps: document.querySelectorAll('.progress-step'),
            progressFill: document.querySelector('.progress-fill'),
            wizardSteps: document.querySelectorAll('.wizard-step'),
            btnNext: document.querySelectorAll('.btn-next'),
            btnBack: document.querySelectorAll('.btn-back'),
            produtoCards: document.querySelectorAll('.produto-card'),
            previewText: document.getElementById('previewText'),
            customTextInput: document.getElementById('customText'),
            charCount: document.getElementById('charCount'),
            productShape: document.querySelector('.product-shape')
        };
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Product selection
        this.elements.produtoCards.forEach(card => {
            card.addEventListener('click', () => this.handleProductSelection(card));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleProductSelection(card);
                }
            });
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
        });

        // Variant selection
        const variantOptions = document.querySelectorAll('.variacao-option, .variacao-color');
        variantOptions.forEach(option => {
            option.addEventListener('click', () => this.handleVariantSelection(option));
        });

        // Personalization controls
        if (this.elements.customTextInput) {
            this.elements.customTextInput.addEventListener('input', (e) => this.handleTextChange(e));
            this.elements.customTextInput.addEventListener('keyup', () => this.updateCharCounter());
        }

        const fontOptions = document.querySelectorAll('.font-option');
        fontOptions.forEach(option => {
            option.addEventListener('click', () => this.handleFontChange(option));
        });

        // Color selection removed - color is fixed

        // Orientation dropdown
        const orientationSelect = document.querySelector('#orientationSelect');
        if (orientationSelect) {
            orientationSelect.addEventListener('change', (e) => this.handleOrientationChange(e));
        }

        // Icon selection
        const iconOptions = document.querySelectorAll('.icon-option');
        iconOptions.forEach(option => {
            option.addEventListener('click', () => this.handleIconChange(option));
        });

        // Wizard navigation
        this.elements.btnNext.forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        this.elements.btnBack.forEach(btn => {
            btn.addEventListener('click', () => this.previousStep());
        });

        // Finalization actions
        const btnCarrinho = document.querySelector('.btn-carrinho');
        if (btnCarrinho) {
            btnCarrinho.addEventListener('click', () => this.handleAddToCart());
        }

        const btnComprar = document.querySelector('.btn-comprar');
        if (btnComprar) {
            btnComprar.addEventListener('click', () => this.handleBuyNow());
        }

        const btnSalvar = document.querySelector('.btn-salvar');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => this.handleSaveDesign());
        }

        const btnNovoProduto = document.querySelector('.btn-novo-produto');
        if (btnNovoProduto) {
            btnNovoProduto.addEventListener('click', () => this.handleNewProduct());
        }

        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleShare(btn.dataset.platform));
        });
    }

    // ========================================
    // SELEÇÃO DE PRODUTO (STEP 1)
    // ========================================

    /**
     * Manipula seleção de produto
     * @param {HTMLElement} card - Card do produto selecionado
     */
    handleProductSelection(card) {
        // Remover seleção anterior
        this.elements.produtoCards.forEach(c => c.classList.remove('selected'));
        
        // Selecionar card atual
        card.classList.add('selected');
        
        // Atualizar estado
        const productId = card.dataset.product;
        this.state.selectedProduct = productId;
        
        // Atualizar preços
        const product = PERSONALIZABLE_PRODUCTS[productId];
        if (product) {
            this.state.pricing.basePrice = product.basePrice;
            this.state.pricing.personalizationPrice = product.personalizationPrice;
            this.state.pricing.total = product.basePrice + product.personalizationPrice;
            
            // Resetar variantes para primeiros valores
            if (product.variants.tamanho) {
                this.state.variants.tamanho = product.variants.tamanho[0];
            }
            if (product.variants.cor) {
                this.state.variants.cor = product.variants.cor[0];
            }
            
            this.updatePricing();
        }
        
        // Habilitar botão next
        const nextBtn = document.querySelector('[data-step="1"] .btn-next');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
        
        this.saveState();
        this.trackEvent('product_select', { productId });
    }

    // ========================================
    // SELEÇÃO DE VARIANTES (STEP 2)
    // ========================================

    /**
     * Manipula seleção de variante
     * @param {HTMLElement} option - Opção selecionada
     */
    handleVariantSelection(option) {
        const variantType = option.dataset.variant;
        const variantValue = option.dataset.value;
        
        // Remover active de siblings
        const siblings = option.parentNode.querySelectorAll(`[data-variant="${variantType}"]`);
        siblings.forEach(sibling => sibling.classList.remove('active'));
        
        // Adicionar active ao atual
        option.classList.add('active');
        
        // Atualizar estado
        this.state.variants[variantType] = variantValue;
        
        // Atualizar preview
        this.updateProductVariant(variantType, variantValue);
        
        this.saveState();
    }

    /**
     * Atualiza variante do produto no preview
     * @param {string} type - Tipo de variante
     * @param {string} value - Valor da variante
     */
    updateProductVariant(type, value) {
        if (type === 'cor' && this.elements.productShape) {
            const colorMap = {
                'azul': '#4682B4',
                'preto': '#2C3E50',
                'branco': '#FFFFFF',
                'verde': '#27AE60',
                'bege': '#F5E6D3'
            };
            
            if (colorMap[value]) {
                this.elements.productShape.style.background = colorMap[value];
                
                // Ajustar cor do texto para contraste
                if (value === 'branco' || value === 'bege') {
                    this.elements.productShape.style.border = '1px solid #ddd';
                } else {
                    this.elements.productShape.style.border = 'none';
                }
            }
        }
    }

    // ========================================
    // CONTROLES DE PERSONALIZAÇÃO (STEP 3)
    // ========================================

    /**
     * Manipula mudança de texto
     * @param {Event} event - Evento do input
     */
    handleTextChange(event) {
        const text = event.target.value;
        this.state.personalization.text = text || 'SEU TEXTO';
        
        this.updatePreview();
        this.updateCharCounter();
        this.saveState();
    }


    /**
     * Manipula mudança de fonte
     * @param {HTMLElement} option - Opção selecionada
     */
    handleFontChange(option) {
        const siblings = option.parentNode.querySelectorAll('.font-option');
        siblings.forEach(sibling => sibling.classList.remove('active'));
        option.classList.add('active');
        
        this.state.personalization.font = option.dataset.font;
        this.updatePreview();
        this.saveState();
    }

    // Color selection removed - using default color

    /**
     * Manipula mudança de orientação
     * @param {Event} event - Evento do select
     */
    handleOrientationChange(event) {
        this.state.personalization.orientation = event.target.value;
        this.toggleIconSelector();
        this.updatePreview();
        this.saveState();
    }

    /**
     * Mostra/esconde seletor de ícones baseado na orientação
     */
    toggleIconSelector() {
        const iconSelector = document.querySelector('.icon-options');
        const iconLabel = document.querySelector('label[for="iconSelect"], label:has(+ .icon-options)');
        
        const orientationsWithIcons = ['icone-texto-horizontal', 'icone-texto-vertical', 'icone'];
        const shouldShow = orientationsWithIcons.includes(this.state.personalization.orientation);
        
        if (iconSelector) {
            iconSelector.style.display = shouldShow ? 'flex' : 'none';
        }
        
        // Encontrar o label que vem antes do icon-options
        const iconOptionsContainer = document.querySelector('.icon-options');
        if (iconOptionsContainer) {
            const label = iconOptionsContainer.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.style.display = shouldShow ? 'block' : 'none';
            }
        }
    }

    /**
     * Manipula mudança de ícone
     * @param {HTMLElement} option - Opção selecionada
     */
    handleIconChange(option) {
        const siblings = option.parentNode.querySelectorAll('.icon-option');
        siblings.forEach(sibling => sibling.classList.remove('active'));
        option.classList.add('active');
        
        this.state.personalization.icon = option.dataset.icon;
        this.updatePreview();
        this.saveState();
    }

    /**
     * Atualiza contador de caracteres
     */
    updateCharCounter() {
        if (!this.elements.customTextInput || !this.elements.charCount) return;
        
        const current = this.elements.customTextInput.value.length;
        const max = this.elements.customTextInput.maxLength;
        
        this.elements.charCount.textContent = current;
        
        // Color coding
        if (current > max * 0.9) {
            this.elements.charCount.style.color = '#e74c3c';
        } else if (current > max * 0.7) {
            this.elements.charCount.style.color = '#f39c12';
        } else {
            this.elements.charCount.style.color = '';
        }
    }

    // ========================================
    // PREVIEW
    // ========================================


    /**
     * Atualiza preview completo
     */
    updatePreview() {
        if (!this.elements.previewText) return;
        
        const { text, font, orientation } = this.state.personalization;
        
        // Atualizar conteúdo do texto
        this.elements.previewText.textContent = text;
        
        // Atualizar fonte
        const fontMap = {
            'Arial': 'Arial, sans-serif',
            'Times': '"Times New Roman", serif',
            'Script': '"Brush Script MT", cursive',
            'Bold': 'Arial, sans-serif'
        };
        
        this.elements.previewText.style.fontFamily = fontMap[font] || 'Arial, sans-serif';
        this.elements.previewText.style.fontWeight = font === 'Bold' ? '700' : '600';
        
        // Cor fixa (não selecionável pelo usuário)
        this.elements.previewText.style.color = '#000000'; // Cor padrão preta
        
        // Atualizar orientação
        this.updateTextOrientation(orientation);
        
        // Atualizar preview final se visível
        this.updateFinalPreview();
    }

    /**
     * Atualiza orientação do texto
     * @param {string} orientation - Orientação do texto
     */
    updateTextOrientation(orientation) {
        if (!this.elements.previewText) return;
        
        const { text, icon } = this.state.personalization;
        
        // Resetar estilos
        this.elements.previewText.style.position = '';
        this.elements.previewText.style.top = '';
        this.elements.previewText.style.left = '';
        this.elements.previewText.style.transform = '';
        this.elements.previewText.style.writingMode = '';
        this.elements.previewText.style.textOrientation = '';
        this.elements.previewText.style.display = 'flex';
        this.elements.previewText.style.flexDirection = 'column';
        this.elements.previewText.style.alignItems = 'center';
        this.elements.previewText.style.justifyContent = 'center';
        this.elements.previewText.style.fontSize = '';
        this.elements.previewText.style.gap = '0.8rem';
        
        // Obter caminho do ícone
        const iconPath = this.getIconPath(icon);
        
        switch (orientation) {
            case 'texto-vertical':
                this.elements.previewText.style.writingMode = 'vertical-rl';
                this.elements.previewText.style.textOrientation = 'upright';
                this.elements.previewText.innerHTML = `<span class="preview-text vertical">${text}</span>`;
                break;
            case 'texto-horizontal':
                this.elements.previewText.innerHTML = `<span class="preview-text">${text}</span>`;
                break;
            case 'icone-texto-vertical':
                this.elements.previewText.innerHTML = `<span class="preview-text">${text}</span><img src="${iconPath}" alt="Icon" class="preview-icon-large">`;
                break;
            case 'icone-texto-horizontal':
                this.elements.previewText.innerHTML = `<span class="preview-text">${text}</span><img src="${iconPath}" alt="Icon" class="preview-icon-large">`;
                break;
            case 'icone':
                this.elements.previewText.innerHTML = `<img src="${iconPath}" alt="Icon" class="preview-icon-only">`;
                break;
            default:
                this.elements.previewText.textContent = text;
                break;
        }

        // Atualizar classes auxiliares
        if (this.elements.previewText) {
            this.elements.previewText.classList.toggle('has-icon', orientation.includes('icone'));
            this.elements.previewText.classList.toggle('only-icon', orientation === 'icone');
        }
    }

    /**
     * Obtém caminho do ícone
     * @param {string} iconId - ID do ícone
     * @returns {string} Caminho do ícone
     */
    getIconPath(iconId) {
        const iconMap = {
            'icon-1': '../imagens/icones/sol-ondas.png',
            'icon-2': '../imagens/icones/olho-paz.png',
            'icon-3': '../imagens/icones/girassol.png',
            'icon-4': '../imagens/icones/arvore.png'
        };
        return iconMap[iconId] || iconMap['icon-1'];
    }

    /**
     * Atualiza preview final (Step 4)
     */
    updateFinalPreview() {
        const finalPreviewText = document.getElementById('finalPreviewText');
        const finalProduct = document.getElementById('finalProduct');
        const finalColor = document.getElementById('finalColor');
        const finalText = document.getElementById('finalText');
        const finalFont = document.getElementById('finalFont');
        const finalOrientation = document.getElementById('finalOrientation');
        
        if (finalPreviewText) {
            const { text, font, orientation, icon } = this.state.personalization;
            
            // Resetar estilos e centralizar no meio
            finalPreviewText.style.position = 'absolute';
            finalPreviewText.style.top = '50%';
            finalPreviewText.style.left = '50%';
            finalPreviewText.style.transform = 'translate(-50%, -50%)';
            finalPreviewText.style.display = 'flex';
            finalPreviewText.style.alignItems = 'center';
            finalPreviewText.style.justifyContent = 'center';
            finalPreviewText.style.fontFamily = '';
            finalPreviewText.style.fontWeight = '';
            finalPreviewText.style.color = '#000000';
            finalPreviewText.style.writingMode = '';
            finalPreviewText.style.textOrientation = '';
            finalPreviewText.style.flexDirection = '';
            finalPreviewText.style.fontSize = '';
            
            // Aplicar fonte
            const fontMap = {
                'Arial': 'Arial, sans-serif',
                'Times': '"Times New Roman", serif',
                'Script': '"Brush Script MT", cursive',
                'Bold': 'Arial, sans-serif'
            };
            finalPreviewText.style.fontFamily = fontMap[font] || 'Arial, sans-serif';
            finalPreviewText.style.fontWeight = font === 'Bold' ? '700' : '600';
            
            // Obter caminho do ícone
            const iconPath = this.getIconPath(icon);
            
            // Aplicar orientação mantendo centralizado
            switch (orientation) {
                case 'texto-vertical':
                    finalPreviewText.style.writingMode = 'vertical-rl';
                    finalPreviewText.style.textOrientation = 'upright';
                    finalPreviewText.textContent = text;
                    break;
                case 'texto-horizontal':
                    finalPreviewText.textContent = text;
                    break;
                case 'icone-texto-vertical':
                    finalPreviewText.style.flexDirection = 'column';
                    finalPreviewText.innerHTML = `<span class="preview-text">${text}</span><img src="${iconPath}" alt="Icon" class="preview-icon-large">`;
                    break;
                case 'icone-texto-horizontal':
                    finalPreviewText.style.flexDirection = 'column';
                    finalPreviewText.innerHTML = `<span class="preview-text">${text}</span><img src="${iconPath}" alt="Icon" class="preview-icon-large">`;
                    break;
                case 'icone':
                    finalPreviewText.innerHTML = `<img src="${iconPath}" alt="Icon" class="preview-icon-only">`;
                    break;
                default:
                    finalPreviewText.textContent = text;
                    break;
            }
        }
        
        if (this.state.selectedProduct) {
            const product = PERSONALIZABLE_PRODUCTS[this.state.selectedProduct];
            
            if (finalProduct) finalProduct.textContent = product.name;
            if (finalColor) finalColor.textContent = this.state.variants.cor;
            if (finalText) finalText.textContent = `"${this.state.personalization.text}"`;
            if (finalFont) finalFont.textContent = this.state.personalization.font;
            if (finalOrientation) finalOrientation.textContent = this.getOrientationLabel(this.state.personalization.orientation);
        }
    }

    /**
     * Obtém label da orientação
     * @param {string} orientation - Orientação
     * @returns {string} Label
     */
    getOrientationLabel(orientation) {
        const labels = {
            'texto-vertical': 'Texto Vertical',
            'texto-horizontal': 'Texto Horizontal',
            'icone-texto-vertical': 'Ícone + Texto Vertical',
            'icone-texto-horizontal': 'Ícone + Texto Horizontal',
            'icone': 'Ícone'
        };
        return labels[orientation] || 'Texto Horizontal';
    }

    // ========================================
    // PREÇOS
    // ========================================

    /**
     * Atualiza exibição de preços
     */
    updatePricing() {
        const summaryProduct = document.getElementById('summaryProduct');
        const summaryPersonalization = document.getElementById('summaryPersonalization');
        const summaryTotal = document.getElementById('summaryTotal');
        const basePrice = document.getElementById('basePrice');
        const personalizationPrice = document.getElementById('personalizationPrice');
        const totalPrice = document.getElementById('totalPrice');
        
        const { pricing, selectedProduct } = this.state;
        
        if (selectedProduct) {
            const product = PERSONALIZABLE_PRODUCTS[selectedProduct];
            
            if (summaryProduct) summaryProduct.textContent = product.name;
            if (summaryPersonalization) summaryPersonalization.textContent = `+ ${formatPrice(pricing.personalizationPrice)}`;
            if (summaryTotal) summaryTotal.textContent = formatPrice(pricing.total);
            
            if (basePrice) basePrice.textContent = formatPrice(pricing.basePrice);
            if (personalizationPrice) personalizationPrice.textContent = formatPrice(pricing.personalizationPrice);
            if (totalPrice) totalPrice.textContent = formatPrice(pricing.total);
        }
    }

    // ========================================
    // NAVEGAÇÃO DO WIZARD
    // ========================================

    /**
     * Avança para próximo passo
     */
    nextStep() {
        if (this.state.currentStep < this.options.maxSteps) {
            this.state.currentStep++;
            this.updateWizardState();
            this.trackEvent('wizard_step_complete', { step: this.state.currentStep - 1 });
        }
    }

    /**
     * Volta para passo anterior
     */
    previousStep() {
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.updateWizardState();
        }
    }

    /**
     * Atualiza estado do wizard
     */
    updateWizardState() {
        this.updateProgressBar();
        this.updateStepVisibility();
        this.updatePricing();
        this.saveState();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Atualiza barra de progresso
     */
    updateProgressBar() {
        const { currentStep } = this.state;
        
        // Atualizar steps
        this.elements.progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            
            step.classList.remove('active', 'completed');
            
            if (stepNumber === currentStep) {
                step.classList.add('active');
            } else if (stepNumber < currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Atualizar fill
        const progressPercentage = (currentStep / this.options.maxSteps) * 100;
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progressPercentage}%`;
        }
    }

    /**
     * Atualiza visibilidade dos steps
     */
    updateStepVisibility() {
        this.elements.wizardSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            
            if (stepNumber === this.state.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // ========================================
    // FINALIZAÇÃO
    // ========================================

    /**
     * Manipula adicionar ao carrinho
     */
    async handleAddToCart() {
        const cartItem = this.createCartItem();
        
        try {
            // Adicionar loading state
            const btn = document.querySelector('.btn-carrinho');
            if (btn) {
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
            }
            
            // Adicionar ao carrinho
            CartStorage.addItem(cartItem);
            
            // Notificação de sucesso
            Notification.success('Produto adicionado ao carrinho!');
            
            // Disparar evento
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Track
            this.trackEvent('add_to_cart', { 
                value: cartItem.totalPrice,
                currency: 'BRL',
                items: [{
                    item_id: cartItem.productId,
                    item_name: cartItem.name,
                    category: 'Personalized',
                    quantity: 1,
                    price: cartItem.totalPrice
                }]
            });
            
            // Redirecionar após delay
            setTimeout(() => {
                window.location.href = '../paginas/carrinho.html';
            }, 1500);
            
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            Notification.error('Erro ao adicionar produto. Tente novamente.');
        }
    }

    /**
     * Manipula compra direta
     */
    async handleBuyNow() {
        const cartItem = this.createCartItem();
        
        try {
            const btn = document.querySelector('.btn-comprar');
            if (btn) {
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
            }
            
            CartStorage.addItem(cartItem);
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            this.trackEvent('begin_checkout', {
                value: cartItem.totalPrice,
                currency: 'BRL'
            });
            
            window.location.href = '../paginas/checkout.html';
            
        } catch (error) {
            console.error('Erro na compra:', error);
            Notification.error('Erro ao processar compra. Tente novamente.');
        }
    }

    /**
     * Manipula salvar design
     */
    handleSaveDesign() {
        const design = this.createDesignObject();
        
        try {
            // Salvar no storage
            const savedDesigns = JSON.parse(localStorage.getItem('queise_saved_designs') || '[]');
            savedDesigns.push(design);
            localStorage.setItem('queise_saved_designs', JSON.stringify(savedDesigns));
            
            Notification.success('Design salvo com sucesso!');
            this.trackEvent('save_design', { productId: design.productId });
            
        } catch (error) {
            console.error('Erro ao salvar design:', error);
            Notification.error('Erro ao salvar design. Tente novamente.');
        }
    }

    /**
     * Manipula novo produto
     */
    handleNewProduct() {
        // Resetar estado
        this.state.currentStep = 1;
        this.state.selectedProduct = null;
        this.state.personalization.text = 'SEU TEXTO';
        
        // Limpar seleções
        this.elements.produtoCards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // Resetar form
        if (this.elements.customTextInput) {
            this.elements.customTextInput.value = 'SEU TEXTO';
        }
        
        // Atualizar wizard
        this.updateWizardState();
        this.updatePreview();
        
        this.trackEvent('new_product_click');
    }

    /**
     * Manipula compartilhamento
     * @param {string} platform - Plataforma
     */
    handleShare(platform) {
        const shareData = this.createShareData();
        
        switch (platform) {
            case 'whatsapp':
                this.shareToWhatsApp(shareData);
                break;
            case 'facebook':
                this.shareToFacebook(shareData);
                break;
            case 'copy':
                this.copyShareLink(shareData);
                break;
        }
        
        this.trackEvent('share', { method: platform });
    }

    // ========================================
    // HELPERS
    // ========================================

    /**
     * Cria item do carrinho
     * @returns {Object} Item do carrinho
     */
    createCartItem() {
        const { selectedProduct, variants, personalization, pricing } = this.state;
        const product = PERSONALIZABLE_PRODUCTS[selectedProduct];
        
        return {
            id: `${selectedProduct}_${Date.now()}`,
            productId: selectedProduct,
            name: product.name,
            basePrice: pricing.basePrice,
            personalizationPrice: pricing.personalizationPrice,
            totalPrice: pricing.total,
            variant: { ...variants },
            personalization: { ...personalization },
            quantity: 1,
            timestamp: Date.now()
        };
    }

    /**
     * Cria objeto de design
     * @returns {Object} Design
     */
    createDesignObject() {
        return {
            id: Date.now(),
            ...this.createCartItem(),
            savedAt: new Date().toISOString()
        };
    }

    /**
     * Cria dados de compartilhamento
     * @returns {Object} Dados
     */
    createShareData() {
        const { selectedProduct, personalization } = this.state;
        const product = PERSONALIZABLE_PRODUCTS[selectedProduct];
        
        return {
            title: `Meu produto personalizado - ${product.name}`,
            text: `Olha que legal! Personalizei um "${product.name}" com o texto "${personalization.text}" na QUEISE!`,
            url: window.location.href
        };
    }

    /**
     * Compartilha no WhatsApp
     * @param {Object} data - Dados
     */
    shareToWhatsApp(data) {
        const message = encodeURIComponent(`${data.text} ${data.url}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    }

    /**
     * Compartilha no Facebook
     * @param {Object} data - Dados
     */
    shareToFacebook(data) {
        const url = encodeURIComponent(data.url);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }

    /**
     * Copia link de compartilhamento
     * @param {Object} data - Dados
     */
    copyShareLink(data) {
        navigator.clipboard.writeText(data.url).then(() => {
            Notification.success('Link copiado para a área de transferência!');
        }).catch(() => {
            Notification.error('Erro ao copiar link. Tente manualmente.');
        });
    }

    // ========================================
    // STATE MANAGEMENT
    // ========================================

    /**
     * Salva estado atual
     */
    saveState() {
        localStorage.setItem(this.options.storageKey, JSON.stringify(this.state));
    }

    /**
     * Carrega estado salvo
     */
    loadSavedState() {
        const saved = localStorage.getItem(this.options.storageKey);
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                Object.assign(this.state, savedState);
                this.restoreUIState();
            } catch (error) {
                console.error('Erro ao carregar estado salvo:', error);
            }
        }
    }

    /**
     * Restaura estado da UI
     */
    restoreUIState() {
        // Restaurar seleção de produto
        if (this.state.selectedProduct) {
            const productCard = document.querySelector(`[data-product="${this.state.selectedProduct}"]`);
            if (productCard) {
                productCard.classList.add('selected');
            }
        }
        
        // Restaurar input de texto
        if (this.elements.customTextInput) {
            this.elements.customTextInput.value = this.state.personalization.text;
        }
        
        // Restaurar estados ativos dos controles
        this.restoreControlStates();
    }

    /**
     * Restaura estados dos controles
     */
    restoreControlStates() {
        const fontOption = document.querySelector(`[data-font="${this.state.personalization.font}"]`);
        if (fontOption) fontOption.classList.add('active');
        
        const colorOption = document.querySelector(`[data-color="${this.state.personalization.color}"]`);
        if (colorOption) colorOption.classList.add('active');
        
        const orientationSelect = document.querySelector('#orientationSelect');
        if (orientationSelect) {
            orientationSelect.value = this.state.personalization.orientation || 'texto-horizontal';
        }
        
        const iconOption = document.querySelector(`[data-icon="${this.state.personalization.icon || 'icon-1'}"]`);
        if (iconOption) iconOption.classList.add('active');
    }

    /**
     * Atualiza UI completa
     */
    updateUI() {
        this.updateProgressBar();
        this.updateStepVisibility();
        this.updatePricing();
        this.toggleIconSelector();
        this.updatePreview();
    }

    // ========================================
    // ANALYTICS
    // ========================================

    /**
     * Track evento
     * @param {string} eventName - Nome do evento
     * @param {Object} params - Parâmetros
     */
    trackEvent(eventName, params = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Personalization',
                ...params
            });
        }
    }
}

// ========================================
// EXPORTS
// ========================================

export { PERSONALIZABLE_PRODUCTS };

