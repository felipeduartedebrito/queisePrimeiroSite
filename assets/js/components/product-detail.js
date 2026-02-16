/**
 * ============================================
 * PRODUCT-DETAIL.JS - Componente de Detalhe do Produto
 * ============================================
 * 
 * Componente modular para página de detalhe do produto
 * Gerencia galeria, variantes, personalização, preços e carrinho
 * 
 * @module components/ProductDetail
 */

import { api } from '../core/api.js';
import { CartStorage } from '../core/storage.js';
import { formatPrice, clamp, delay } from '../core/utils.js';
import { Notification } from './notification.js';
import { CART_CONFIG, ENVIRONMENT, PERSONALIZATION_CONFIG } from '../core/config.js';

// ========================================
// CLASSE PRODUCT DETAIL MANAGER
// ========================================

/**
 * Classe principal para gerenciamento de detalhe do produto
 */
export class ProductDetailManager {
    /**
     * Cria um novo gerenciador de detalhe do produto
     * @param {Object} options - Opções de configuração
     */
    constructor(options = {}) {
        this.options = {
            ...options
        };

        // Estado do produto
        this.currentProduct = null;
        this.selectedVariant = null;
        this.selectedImageIndex = 0;
        this.quantity = 1;
        this.isLoading = false;

        // Personalization state (alinhado com novo sistema)
        this.personalization = {
            enabled: false,
            text: '',
            font: 'Arial',
            orientation: 'texto-horizontal',
            icon: 'icon-1'
        };

        // Referências DOM
        this.elements = {};

        // Salvar HTML original do painel de personalização
        this.originalPersonalizationHTML = null;

        // Inicializar
        this.init();
    }

    /**
     * Inicializa o componente
     */
    async init() {
        try {
            // Capturar elementos DOM PRIMEIRO, antes de carregar produto
            console.log('🔍 Capturando elementos DOM...');
            this.captureDOMElements();
            console.log('✅ Elementos DOM capturados:', Object.keys(this.elements));
            
            // Verificar se elemento principal existe
            if (!this.elements.productDetail) {
                console.error('❌ Elemento productDetail não encontrado no DOM!');
            }
            
            // Carregar produto (isso vai chamar renderProduct)
            await this.loadProduct();
            
            // Configurar event listeners após renderizar
            this.setupEventListeners();
            this.setupImageZoom();
            this.setupTabs();
            this.updateCartBadge();
            
            console.log('✅ ProductDetailManager inicializado');
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showError('Erro ao carregar produto');
        }
    }

    /**
     * Captura elementos DOM necessários
     */
    captureDOMElements() {
        this.elements = {
            pageLoader: document.getElementById('pageLoader'),
            productDetail: document.getElementById('productDetail'),
            mainProductImage: document.getElementById('mainProductImage'),
            thumbnailGallery: document.getElementById('thumbnailGallery'),
            prevImageBtn: document.getElementById('prevImageBtn'),
            nextImageBtn: document.getElementById('nextImageBtn'),
            quantityInput: document.getElementById('quantityInput'),
            quantityMinus: document.getElementById('quantityMinus'),
            quantityPlus: document.getElementById('quantityPlus'),
            addToCartBtn: document.getElementById('addToCartBtn'),
            buyNowBtn: document.getElementById('buyNowBtn'),
            personalizationPanel: document.getElementById('personalizationPanel'),
            personalizationText: document.getElementById('personalizationText'),
            personalizationFont: document.getElementById('personalizationFont'),
            orientationSelect: document.getElementById('orientationSelect'),
            iconOptions: document.querySelectorAll('.icon-option'),
            charCount: document.getElementById('charCount')
        };
    }

    // ========================================
    // CARREGAMENTO DO PRODUTO
    // ========================================

    /**
     * Carrega produto da API
     */
    async loadProduct() {
        this.showMainLoading(true);
        
        try {
            const productHandle = this.getProductHandle();
            console.log('🔍 Tentando carregar produto com handle:', productHandle);
            
            if (!productHandle) {
                console.error('❌ Handle do produto não encontrado na URL');
                throw new Error('Handle do produto não encontrado na URL');
            }

            console.log('📡 Chamando API para buscar produto:', productHandle);
            const { product } = await api.getProduct(productHandle);
            
            console.log('📦 Produto retornado da API:', product ? {
                handle: product.handle,
                title: product.title,
                id: product.id
            } : 'null');

            if (!product) {
                console.error('❌ Produto não encontrado na API');
                throw new Error('Produto não encontrado');
            }

            this.currentProduct = product;
            this.selectedVariant = product.variants?.[0] || null;
            this.setupPersonalization();
            
            await this.renderProduct();
            
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            this.showError(error.message);
        } finally {
            this.showMainLoading(false);
        }
    }

    /**
     * Obtém handle do produto da URL
     * @returns {string|null} Handle do produto
     */
    getProductHandle() {
        // Tentar múltiplas formas de obter o handle
        const urlParams = new URLSearchParams(window.location.search);
        let handle = urlParams.get('id');
        
        // Se não encontrou, tentar da hash
        if (!handle) {
            const hash = window.location.hash;
            if (hash) {
                const hashParams = new URLSearchParams(hash.substring(1));
                handle = hashParams.get('id');
            }
        }
        
        // Se ainda não encontrou, tentar do sessionStorage (fallback)
        if (!handle) {
            const storedHandle = sessionStorage.getItem('product_handle');
            if (storedHandle) {
                console.warn('⚠️ Handle não encontrado na URL, usando do sessionStorage:', storedHandle);
                handle = storedHandle;
                // Tentar restaurar na URL
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('id', storedHandle);
                window.history.replaceState({}, '', newUrl.toString());
            }
        }
        
        // Debug: verificar URL completa
        console.log('🔍 URL completa:', window.location.href);
        console.log('🔍 Pathname:', window.location.pathname);
        console.log('🔍 Search:', window.location.search);
        console.log('🔍 Hash:', window.location.hash);
        console.log('🔍 Handle extraído:', handle);
        
        // Se ainda não encontrou, tentar extrair do pathname (fallback)
        if (!handle && window.location.pathname.includes('produto-individual')) {
            console.warn('⚠️ Handle não encontrado na query string, tentando extrair do pathname...');
        }
        
        return handle;
    }

    /**
     * Configura personalização baseado no produto
     */
    setupPersonalization() {
        // Verificar se personalização está habilitada globalmente
        if (!PERSONALIZATION_CONFIG.enabled) {
            // Painel será renderizado com mensagem "em breve" no renderPersonalization()
            this.personalization.enabled = false;
            return;
        }

        const config = this.currentProduct?.metafields?.personalization;
        if (config?.enabled) {
            this.personalization.enabled = true;
            this.setupPersonalizationOptions(config);
        } else {
            this.personalization.enabled = false;
        }
    }

    /**
     * Configura opções de personalização
     * @param {Object} config - Configuração de personalização
     */
    setupPersonalizationOptions(config) {
        // Setup font options
        if (this.elements.personalizationFont && config.allowedFonts) {
            this.elements.personalizationFont.innerHTML = '';
            config.allowedFonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font;
                option.textContent = font;
                this.elements.personalizationFont.appendChild(option);
            });
        }

        // Setup orientation dropdown (sem cor, sem posição)
        if (this.elements.orientationSelect) {
            // Já deve estar no HTML, apenas garantir que está configurado
        }

        // Setup character limit
        if (this.elements.personalizationText && config.maxChars) {
            this.elements.personalizationText.maxLength = config.maxChars;
            this.elements.personalizationText.placeholder = `Digite seu texto (máximo ${config.maxChars} caracteres)`;
        }

        this.updateCharCount();
    }

    // ========================================
    // RENDERIZAÇÃO
    // ========================================

    /**
     * Renderiza produto completo
     */
    async renderProduct() {
        console.log('🎨 renderProduct() iniciado');
        console.log('🎨 currentProduct:', this.currentProduct ? {
            title: this.currentProduct.title,
            handle: this.currentProduct.handle,
            images: this.currentProduct.images?.length || 0
        } : 'null');
        
        if (!this.currentProduct) {
            console.error('❌ renderProduct: currentProduct é null!');
            return;
        }
        
        try {
            this.updateBreadcrumb();
            console.log('✅ Breadcrumb atualizado');
            
            this.renderProductInfo();
            console.log('✅ ProductInfo renderizado');
            
            this.renderGallery();
            console.log('✅ Gallery renderizada');
            
            this.renderVariants();
            console.log('✅ Variants renderizadas');
            
            this.renderPersonalization();
            console.log('✅ Personalization renderizada');
            
            this.renderSpecifications();
            console.log('✅ Specifications renderizadas');
            
            this.updatePricing();
            console.log('✅ Pricing atualizado');
            
            this.updateAvailability();
            console.log('✅ Availability atualizada');
            
            this.renderRelatedProducts();
            console.log('✅ RelatedProducts renderizados');
            
            // Animar entrada
            await delay(100);
            if (this.elements.productDetail) {
                this.elements.productDetail.classList.add('loaded');
                console.log('✅ Classe "loaded" adicionada');
            } else {
                console.warn('⚠️ Elemento productDetail não encontrado!');
            }
            
            console.log('✅ renderProduct() concluído com sucesso');
        } catch (error) {
            console.error('❌ Erro em renderProduct:', error);
            throw error;
        }
    }

    /**
     * Atualiza breadcrumb
     */
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumbProduct');
        if (breadcrumb && this.currentProduct) {
            breadcrumb.textContent = this.currentProduct.title;
        }
    }

    /**
     * Renderiza informações do produto
     */
    renderProductInfo() {
        const { title, vendor, description, descriptionHtml } = this.currentProduct;
        
        this.updateElement('productTitle', title);
        this.updateElement('productVendor', vendor);
        
        // Usar descriptionHtml se disponível, senão description
        const descriptionContent = descriptionHtml || description || '';
        this.updateElement('productDescription', descriptionContent);

        // Mostrar badge de personalizável
        const personalizableBadge = document.getElementById('personalizableBadge');
        if (personalizableBadge && this.currentProduct.metafields?.personalization?.enabled) {
            personalizableBadge.style.display = 'inline-block';
        }
    }

    /**
     * Renderiza galeria de imagens
     */
    renderGallery() {
        const { images } = this.currentProduct;
        if (!images || !images.length) return;

        // Imagem principal
        if (this.elements.mainProductImage) {
            const currentImage = images[this.selectedImageIndex];
            this.elements.mainProductImage.src = currentImage.url;
            this.elements.mainProductImage.alt = currentImage.altText || this.currentProduct.title;
        }

        // Thumbnails
        if (this.elements.thumbnailGallery) {
            this.elements.thumbnailGallery.innerHTML = '';
            images.forEach((image, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail ${index === this.selectedImageIndex ? 'active' : ''}`;
                thumbnail.innerHTML = `<img src="${image.url}" alt="${image.altText}" loading="lazy">`;
                
                thumbnail.addEventListener('click', () => {
                    this.selectedImageIndex = index;
                    this.renderGallery();
                });
                
                this.elements.thumbnailGallery.appendChild(thumbnail);
            });
        }

        // Atualizar navegação
        this.updateGalleryNavigation();
    }

    /**
     * Atualiza navegação da galeria
     */
    updateGalleryNavigation() {
        const totalImages = this.currentProduct.images?.length || 0;

        if (this.elements.prevImageBtn) {
            this.elements.prevImageBtn.disabled = this.selectedImageIndex === 0;
        }
        if (this.elements.nextImageBtn) {
            this.elements.nextImageBtn.disabled = this.selectedImageIndex === totalImages - 1;
        }
    }

    /**
     * Renderiza variantes do produto
     */
    renderVariants() {
        if (!this.currentProduct.options) return;

        this.currentProduct.options.forEach(option => {
            const groupElement = document.getElementById(`${option.name.toLowerCase()}Group`);
            const optionsContainer = document.getElementById(`${option.name.toLowerCase()}Options`);
            
            if (!groupElement || !optionsContainer) return;

            groupElement.style.display = 'block';
            optionsContainer.innerHTML = '';
            
            option.values.forEach(value => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'variant-option';
                optionBtn.textContent = value;
                
                // Verificar disponibilidade considerando outras opções já selecionadas
                const isAvailable = this.isVariantOptionAvailable(option.name, value);
                
                if (!isAvailable) {
                    optionBtn.classList.add('unavailable');
                    optionBtn.disabled = true;
                }
                
                // Verificar se está selecionado
                const isSelected = this.selectedVariant?.selectedOptions?.some(
                    opt => opt.name === option.name && opt.value === value
                );
                
                if (isSelected) {
                    optionBtn.classList.add('selected');
                }
                
                optionBtn.addEventListener('click', () => {
                    if (!isAvailable) return;
                    this.selectVariant(option.name, value);
                });
                
                optionsContainer.appendChild(optionBtn);
            });
        });
    }

    /**
     * Verifica se uma opção de variante está disponível
     * Considera outras opções já selecionadas
     * @param {string} optionName - Nome da opção
     * @param {string} optionValue - Valor da opção
     * @returns {boolean} Se está disponível
     */
    isVariantOptionAvailable(optionName, optionValue) {
        // Obter opções já selecionadas (exceto a que estamos verificando)
        const currentSelections = {};
        if (this.selectedVariant?.selectedOptions) {
            this.selectedVariant.selectedOptions.forEach(opt => {
                if (opt.name !== optionName) {
                    currentSelections[opt.name] = opt.value;
                }
            });
        }

        // Verificar se existe variante que combine:
        // - As opções já selecionadas
        // - A opção que estamos verificando
        // - E está disponível
        return this.currentProduct.variants.some(variant => {
            if (!variant.availableForSale) return false;
            
            // Verificar se a variante tem a opção que estamos verificando
            const hasTargetOption = variant.selectedOptions?.some(
                opt => opt.name === optionName && opt.value === optionValue
            );
            
            if (!hasTargetOption) return false;
            
            // Verificar se a variante combina com as opções já selecionadas
            const matchesCurrentSelections = Object.keys(currentSelections).every(selectedName => {
                return variant.selectedOptions?.some(
                    opt => opt.name === selectedName && opt.value === currentSelections[selectedName]
                );
            });
            
            return matchesCurrentSelections;
        });
    }

    /**
     * Seleciona variante
     * @param {string} optionName - Nome da opção
     * @param {string} optionValue - Valor da opção
     */
    selectVariant(optionName, optionValue) {
        // Atualizar seleção visual
        const container = document.getElementById(`${optionName.toLowerCase()}Options`);
        if (container) {
            container.querySelectorAll('.variant-option').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.textContent.trim() === optionValue) {
                    btn.classList.add('selected');
                }
            });
        }

        // Construir seleções atuais incluindo a nova
        const currentSelections = {};
        if (this.selectedVariant?.selectedOptions) {
            this.selectedVariant.selectedOptions.forEach(opt => {
                currentSelections[opt.name] = opt.value;
            });
        }
        currentSelections[optionName] = optionValue;

        // Encontrar variante que corresponda a TODAS as seleções
        const newVariant = this.currentProduct.variants.find(variant => {
            if (!variant.selectedOptions) return false;
            
            // Verificar se a variante tem todas as opções selecionadas
            return Object.keys(currentSelections).every(selectedName => {
                return variant.selectedOptions.some(
                    opt => opt.name === selectedName && opt.value === currentSelections[selectedName]
                );
            });
        });

        if (newVariant) {
            this.selectedVariant = newVariant;
            // Re-renderizar variantes para atualizar disponibilidade
            this.renderVariants();
            this.updatePricing();
            this.updateAvailability();
            this.updatePersonalizationPreview();
        }
    }

    /**
     * Renderiza painel de personalização
     */
    renderPersonalization() {
        const panel = this.elements.personalizationPanel;
        if (!panel) return;

        // Salvar HTML original na primeira vez
        if (!this.originalPersonalizationHTML && panel.innerHTML.trim()) {
            this.originalPersonalizationHTML = panel.innerHTML;
        }

        // Verificar se personalização está habilitada globalmente
        if (!PERSONALIZATION_CONFIG.enabled) {
            // Mostrar mensagem "Em breve" quando desabilitado
            panel.style.display = 'block';
            panel.innerHTML = `
                <div class="personalization-coming-soon">
                    <div class="coming-soon-icon">✨</div>
                    <h3>Personalização em Breve!</h3>
                    <p>Estamos trabalhando para trazer a funcionalidade de personalização de produtos. Em breve você poderá adicionar textos, escolher fontes e cores para tornar seus produtos únicos!</p>
                    <div class="coming-soon-features">
                        <div class="feature-item">
                            <span class="feature-icon">✍️</span>
                            <span>Texto personalizado</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🎨</span>
                            <span>Escolha de fontes e cores</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">👁️</span>
                            <span>Preview em tempo real</span>
                        </div>
                    </div>
                    <p class="coming-soon-note">Enquanto isso, você pode adicionar os produtos ao carrinho normalmente!</p>
                </div>
            `;
            this.personalization.enabled = false;
            return;
        }

        // Personalização habilitada - renderizar normalmente
        const config = this.currentProduct.metafields?.personalization;

        if (config?.enabled) {
            // Se o painel contém a mensagem "em breve", restaurar HTML original
            if (panel.querySelector('.personalization-coming-soon') && this.originalPersonalizationHTML) {
                panel.innerHTML = this.originalPersonalizationHTML;
                // Re-inicializar elementos após restaurar HTML
                this.elements.personalizationPanel = document.getElementById('personalizationPanel');
                this.elements.personalizationText = document.getElementById('personalizationText');
                this.elements.personalizationFont = document.getElementById('personalizationFont');
                this.setupPersonalizationListeners();
            }
            
            panel.style.display = 'block';
            this.personalization.enabled = true;
            // O conteúdo do formulário será renderizado pelos outros métodos
        } else {
            panel.style.display = 'none';
            this.personalization.enabled = false;
        }
    }

    /**
     * Renderiza especificações
     */
    renderSpecifications() {
        const container = document.getElementById('productSpecifications');
        if (!container || !this.currentProduct.specifications) return;

        container.innerHTML = '';
        Object.entries(this.currentProduct.specifications).forEach(([label, value]) => {
            const specItem = document.createElement('div');
            specItem.className = 'spec-item';
            specItem.innerHTML = `
                <span class="spec-label">${label}:</span>
                <span class="spec-value">${value}</span>
            `;
            container.appendChild(specItem);
        });
    }

    /**
     * Renderiza produtos relacionados
     */
    async renderRelatedProducts() {
        const container = document.getElementById('relatedProductsGrid');
        if (!container) return;

        try {
            // Buscar produtos relacionados (excluindo o atual)
            const { products } = await api.getProducts({ first: 4 });
            const currentProductId = this.currentProduct.id;
            const relatedProducts = products.filter(p => p.id !== currentProductId).slice(0, 3);

            container.innerHTML = '';
            
            relatedProducts.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'related-product';
                productElement.innerHTML = `
                    <div class="related-image">
                        <img src="${product.images?.[0]?.url || ''}" alt="${product.title}" loading="lazy">
                    </div>
                    <div class="related-info">
                        <h4 class="related-name">${product.title}</h4>
                        <div class="related-price">${formatPrice(product.price)}</div>
                        <a href="produto-individual.html?id=${product.handle}" class="btn-secondary btn-small">
                            Ver Produto
                            <span>→</span>
                        </a>
                    </div>
                `;
                container.appendChild(productElement);
            });
        } catch (error) {
            console.error('Erro ao carregar produtos relacionados:', error);
        }
    }

    // ========================================
    // PREÇOS E DISPONIBILIDADE
    // ========================================

    /**
     * Atualiza exibição de preços
     */
    updatePricing() {
        if (!this.selectedVariant) return;

        const { price, compareAtPrice } = this.selectedVariant;
        const personalizationPrice = this.getPersonalizationPrice();
        const totalPrice = (price + personalizationPrice) * this.quantity;

        // Preço atual
        this.updateElement('currentPrice', formatPrice(price));

        // Preço comparado e desconto
        if (compareAtPrice && compareAtPrice > price) {
            this.updateElement('comparePrice', formatPrice(compareAtPrice));
            const comparePriceEl = document.getElementById('comparePrice');
            if (comparePriceEl) comparePriceEl.style.display = 'inline';
            
            const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
            this.updateElement('discountBadge', `-${discount}%`);
            const discountBadge = document.getElementById('discountBadge');
            if (discountBadge) discountBadge.style.display = 'inline-block';
        } else {
            const comparePriceEl = document.getElementById('comparePrice');
            if (comparePriceEl) comparePriceEl.style.display = 'none';
            const discountBadge = document.getElementById('discountBadge');
            if (discountBadge) discountBadge.style.display = 'none';
        }

        // Preço de personalização
        const personalizationElement = document.getElementById('personalizationPrice');
        if (personalizationElement) {
            if (personalizationPrice > 0) {
                personalizationElement.textContent = `+ Personalização: ${formatPrice(personalizationPrice)}`;
                personalizationElement.style.display = 'block';
            } else {
                personalizationElement.style.display = 'none';
            }
        }

        // Preço total
        this.updateElement('totalPrice', formatPrice(totalPrice));

        // Atualizar texto do botão
        const addToCartBtn = this.elements.addToCartBtn;
        if (addToCartBtn) {
            const btnText = addToCartBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = `Adicionar ao Carrinho - ${formatPrice(totalPrice)}`;
            }
        }
    }

    /**
     * Obtém preço de personalização
     * @returns {number} Preço em centavos
     */
    getPersonalizationPrice() {
        if (this.personalization.enabled && this.personalization.text.trim()) {
            return this.currentProduct?.metafields?.personalization?.price || 0;
        }
        return 0;
    }

    /**
     * Atualiza disponibilidade
     */
    updateAvailability() {
        const availabilityElement = document.getElementById('availability');
        if (!availabilityElement || !this.selectedVariant) return;

        const { availableForSale, quantityAvailable } = this.selectedVariant || {};
        const addToCartBtn = this.elements.addToCartBtn;
        const buyNowBtn = this.elements.buyNowBtn;
        const quantityInput = this.elements.quantityInput;

        // quantityAvailable pode ser null se não estiver disponível na API
        if (availableForSale && (quantityAvailable === null || quantityAvailable > 0)) {
            availabilityElement.innerHTML = `
                <span class="availability-icon">✓</span>
                <span class="availability-text">${quantityAvailable !== null ? `Em estoque (${quantityAvailable} disponíveis)` : 'Em estoque'}</span>
            `;
            availabilityElement.className = 'availability in-stock';
            
            // Habilitar controles
            if (addToCartBtn) addToCartBtn.disabled = false;
            if (buyNowBtn) buyNowBtn.disabled = false;
            if (quantityInput) {
                quantityInput.disabled = false;
                // Se quantityAvailable não estiver disponível, usar um valor padrão alto
                quantityInput.max = quantityAvailable !== null ? quantityAvailable : 999;
            }
        } else {
            availabilityElement.innerHTML = `
                <span class="availability-icon">✗</span>
                <span class="availability-text">Indisponível</span>
            `;
            availabilityElement.className = 'availability out-of-stock';
            
            // Desabilitar controles
            if (addToCartBtn) {
                addToCartBtn.disabled = true;
                const btnText = addToCartBtn.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'Indisponível';
            }
            if (buyNowBtn) buyNowBtn.disabled = true;
            if (quantityInput) quantityInput.disabled = true;
        }
    }

    // ========================================
    // PERSONALIZAÇÃO
    // ========================================

    /**
     * Atualiza preview de personalização
     */
    updatePersonalizationPreview() {
        const preview = document.getElementById('personalizationPreview');
        if (!preview) return;

        if (this.personalization.text.trim()) {
            preview.style.display = 'block';
            const container = preview.querySelector('.preview-container');
            if (container) {
                const orientationLabel = this.getOrientationLabel(this.personalization.orientation);
                container.innerHTML = `
                    <div class="preview-text" style="
                        font-family: ${this.personalization.font};
                        color: #000000;
                        padding: 1rem;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                        background: #f8f9fa;
                    ">
                        "${this.personalization.text}"
                    </div>
                    <div class="preview-info">
                        <strong>Configuração:</strong><br>
                        Fonte: ${this.personalization.font} | 
                        Orientação: ${orientationLabel}
                    </div>
                `;
            }
        } else {
            preview.style.display = 'none';
        }
        
        this.updatePricing();
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

    /**
     * Atualiza contador de caracteres
     */
    updateCharCount() {
        const charCount = this.elements.charCount;
        const maxChars = this.currentProduct?.metafields?.personalization?.maxChars || 30;
        
        if (charCount && this.elements.personalizationText) {
            const current = this.elements.personalizationText.value.length;
            charCount.textContent = `${current}/${maxChars}`;
            
            charCount.className = 'char-count';
            if (current > maxChars * 0.8) {
                charCount.classList.add(current > maxChars * 0.9 ? 'danger' : 'warning');
            }
        }
    }

    /**
     * Mostra/esconde seletor de ícones baseado na orientação
     */
    toggleIconSelector() {
        const iconSelector = document.querySelector('.icon-options');
        const orientationsWithIcons = ['icone-texto-horizontal', 'icone-texto-vertical', 'icone'];
        const shouldShow = orientationsWithIcons.includes(this.personalization.orientation);
        
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

    // ========================================
    // CARRINHO
    // ========================================

    /**
     * Adiciona produto ao carrinho
     */
    async addToCart() {
        if (this.isLoading) return;
        
        if (!this.selectedVariant || !this.selectedVariant.availableForSale) {
            Notification.error('Produto indisponível');
            return;
        }

        // Validar quantidade apenas se quantityAvailable estiver disponível
        if (this.selectedVariant.quantityAvailable !== null && this.quantity > this.selectedVariant.quantityAvailable) {
            Notification.error('Quantidade solicitada não disponível');
            return;
        }

        try {
            this.setButtonLoading('addToCartBtn', true);
            this.isLoading = true;
            
            if (ENVIRONMENT.isDevelopment) {
                // Modo desenvolvimento: usar localStorage
                const cartItem = this.buildCartItem();
                await delay(500); // Simular processamento
                
                CartStorage.addItem(cartItem);
                window.dispatchEvent(new CustomEvent('cartUpdated'));
                
                Notification.success('Produto adicionado ao carrinho!');
                this.updateCartBadge();
                
                // Mostrar modal de sucesso após delay
                setTimeout(() => {
                    this.showCartModal();
                }, 1000);
            } else {
                // Modo produção: usar Shopify API
                const cartItem = this.buildCartItem();
                
                // Obter ou criar carrinho
                let cart = await api.getOrCreateCart();
                const cartId = cart.id;
                
                // Construir customAttributes para personalização (apenas se habilitada)
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
                
                // Adicionar item ao carrinho Shopify
                const lines = [{
                    merchandiseId: cartItem.variantId,
                    quantity: cartItem.quantity,
                    attributes: (PERSONALIZATION_CONFIG.enabled && cartItem.personalization) ? buildCustomAttributes(cartItem.personalization) : []
                }];
                
                cart = await api.addToCart(cartId, lines);
                
                // Dispatch evento para atualizar UI
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { cart: cart }
                }));
                
                Notification.success('Produto adicionado ao carrinho!');
                this.updateCartBadge();
                
                // Mostrar modal de sucesso após delay
                setTimeout(() => {
                    this.showCartModal();
                }, 1000);
            }

        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            Notification.error('Erro ao adicionar produto ao carrinho. Tente novamente.');
        } finally {
            this.setButtonLoading('addToCartBtn', false);
            this.isLoading = false;
        }
    }

    /**
     * Gera ID consistente para item do carrinho
     * Baseado em produto, variante e personalização
     * @returns {string} ID do item
     */
    generateCartItemId() {
        let id = `${this.currentProduct.handle}-${this.selectedVariant.id}`;
        
        // Adicionar hash da personalização se existir
        if (this.personalization.enabled && this.personalization.text.trim()) {
            const personalizationStr = JSON.stringify({
                text: this.personalization.text,
                font: this.personalization.font,
                orientation: this.personalization.orientation,
                icon: this.personalization.icon
            });
            // Criar hash simples da personalização
            let hash = 0;
            for (let i = 0; i < personalizationStr.length; i++) {
                const char = personalizationStr.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            id += `-${Math.abs(hash)}`;
        } else {
            id += '-no-personalization';
        }
        
        return id;
    }

    /**
     * Constrói item do carrinho
     * @returns {Object} Item do carrinho
     */
    buildCartItem() {
        const basePrice = this.selectedVariant.price;
        const personalizationPrice = this.getPersonalizationPrice();
        
        const cartItem = {
            id: this.generateCartItemId(),
            productId: this.currentProduct.id,
            handle: this.currentProduct.handle,
            variantId: this.selectedVariant.id,
            name: this.currentProduct.title,
            basePrice: basePrice,
            image: this.currentProduct.images?.[0]?.url,
            quantity: this.quantity,
            variant: {
                id: this.selectedVariant.id,
                title: this.selectedVariant.title,
                size: this.getSelectedOptionValue('Tamanho'),
                color: this.getSelectedOptionValue('Cor')
            },
            timestamp: Date.now()
        };

        // Adicionar personalização se configurada
        if (this.personalization.enabled && this.personalization.text.trim()) {
            cartItem.personalization = {
                text: this.personalization.text,
                font: this.personalization.font,
                orientation: this.personalization.orientation,
                icon: this.personalization.icon
            };
            cartItem.personalizationPrice = personalizationPrice;
        }

        cartItem.totalPrice = basePrice + personalizationPrice;

        return cartItem;
    }

    /**
     * Compra direta
     */
    async buyNow() {
        if (this.isLoading) {
            console.log('buyNow: já está carregando, ignorando...');
            return;
        }
        
        if (!this.selectedVariant || !this.selectedVariant.availableForSale) {
            Notification.error('Produto indisponível');
            return;
        }

        // Validar quantidade apenas se quantityAvailable estiver disponível
        if (this.selectedVariant.quantityAvailable !== null && this.quantity > this.selectedVariant.quantityAvailable) {
            Notification.error('Quantidade solicitada não disponível');
            return;
        }

        const cartItem = this.buildCartItem();
        
        try {
            this.setButtonLoading('buyNowBtn', true);
            this.isLoading = true;
            
            await delay(500); // Simular processamento
            
            CartStorage.addItem(cartItem);
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            Notification.success('Redirecionando para o carrinho...');
            this.updateCartBadge();
            
            // Redirecionar para carrinho
            // Usar um timeout maior para garantir que o estado seja limpo antes do redirect
            setTimeout(() => {
                try {
                    // Tentar redirecionar, mas se falhar (ex: test page), reabilitar o botão
                    const currentPath = window.location.pathname;
                    const isTestPage = currentPath.includes('test-');
                    
                    if (isTestPage) {
                        // Na página de teste, apenas mostrar mensagem e reabilitar botão
                        console.log('Test page detectada - não redirecionando');
                        this.setButtonLoading('buyNowBtn', false);
                        this.isLoading = false;
                        Notification.success('Produto adicionado ao carrinho! (Test page - sem redirect)');
                    } else {
                        window.location.href = '../paginas/carrinho.html';
                    }
                } catch (redirectError) {
                    console.error('Erro ao redirecionar:', redirectError);
                    // Se o redirect falhar, garantir que o botão seja reabilitado
                    this.setButtonLoading('buyNowBtn', false);
                    this.isLoading = false;
                    Notification.error('Não foi possível redirecionar. Produto adicionado ao carrinho.');
                }
            }, 1000);

        } catch (error) {
            console.error('Erro ao processar compra:', error);
            Notification.error('Erro ao processar compra');
            // Garantir que o botão seja reabilitado em caso de erro
            this.setButtonLoading('buyNowBtn', false);
            this.isLoading = false;
        }
        // NOTA: Não usar finally aqui porque o redirect acontece em setTimeout
        // O botão será reabilitado apenas se o redirect falhar ou em caso de erro
    }

    /**
     * Atualiza badge do carrinho
     */
    updateCartBadge() {
        const count = CartStorage.getCount();
        const badge = document.getElementById('headerCartBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    /**
     * Mostra modal de carrinho
     */
    showCartModal() {
        const modal = document.createElement('div');
        modal.className = 'cart-success-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>✅ Produto adicionado ao carrinho!</h3>
                        <button class="close-btn" id="closeModal">✕</button>
                    </div>
                    <div class="modal-body">
                        <p>O que você gostaria de fazer agora?</p>
                        <div class="modal-actions">
                            <button class="btn-secondary" id="continueShopping">
                                Continuar Comprando
                            </button>
                            <a href="../paginas/carrinho.html" class="btn-primary">
                                Ver Carrinho
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Estilos inline para modal
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000'
        });

        const modalContent = modal.querySelector('.modal-content');
        Object.assign(modalContent.style, {
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '400px',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        });

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('#closeModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#continueShopping').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                document.body.removeChild(modal);
            }
        });

        // Auto close após 8 segundos
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 8000);
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        this.setupQuantityControls();
        this.setupActionButtons();
        this.setupGalleryNavigation();
        this.setupPersonalizationListeners();
    }

    /**
     * Configura controles de quantidade
     */
    setupQuantityControls() {
        if (this.elements.quantityInput) {
            this.elements.quantityInput.addEventListener('change', (e) => {
                const maxQty = this.selectedVariant?.quantityAvailable || CART_CONFIG.maxQuantity;
                this.quantity = clamp(parseInt(e.target.value) || 1, CART_CONFIG.minQuantity, maxQty);
                e.target.value = this.quantity;
                this.updatePricing();
            });
        }

        if (this.elements.quantityMinus) {
            this.elements.quantityMinus.addEventListener('click', () => {
                this.quantity = Math.max(CART_CONFIG.minQuantity, this.quantity - 1);
                if (this.elements.quantityInput) {
                    this.elements.quantityInput.value = this.quantity;
                }
                this.updatePricing();
            });
        }

        if (this.elements.quantityPlus) {
            this.elements.quantityPlus.addEventListener('click', () => {
                const maxQty = this.selectedVariant?.quantityAvailable || CART_CONFIG.maxQuantity;
                this.quantity = Math.min(maxQty, this.quantity + 1);
                if (this.elements.quantityInput) {
                    this.elements.quantityInput.value = this.quantity;
                }
                this.updatePricing();
            });
        }
    }

    /**
     * Configura botões de ação
     */
    setupActionButtons() {
        if (this.elements.addToCartBtn) {
            this.elements.addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addToCart();
            });
        }

        if (this.elements.buyNowBtn) {
            this.elements.buyNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.buyNow();
            });
        }
    }

    /**
     * Configura navegação da galeria
     */
    setupGalleryNavigation() {
        if (this.elements.prevImageBtn) {
            this.elements.prevImageBtn.addEventListener('click', () => {
                if (this.selectedImageIndex > 0) {
                    this.selectedImageIndex--;
                    this.renderGallery();
                }
            });
        }

        if (this.elements.nextImageBtn) {
            this.elements.nextImageBtn.addEventListener('click', () => {
                const maxIndex = (this.currentProduct?.images?.length || 1) - 1;
                if (this.selectedImageIndex < maxIndex) {
                    this.selectedImageIndex++;
                    this.renderGallery();
                }
            });
        }
    }

    /**
     * Configura listeners de personalização
     */
    setupPersonalizationListeners() {
        if (this.elements.personalizationText) {
            this.elements.personalizationText.addEventListener('input', (e) => {
                this.personalization.text = e.target.value;
                this.updateCharCount();
                this.updatePersonalizationPreview();
            });
        }

        if (this.elements.personalizationFont) {
            this.elements.personalizationFont.addEventListener('change', (e) => {
                this.personalization.font = e.target.value;
                this.updatePersonalizationPreview();
            });
        }

        if (this.elements.orientationSelect) {
            this.elements.orientationSelect.addEventListener('change', (e) => {
                this.personalization.orientation = e.target.value;
                this.toggleIconSelector();
                this.updatePersonalizationPreview();
            });
        }

        // Icon selection
        if (this.elements.iconOptions && this.elements.iconOptions.length > 0) {
            this.elements.iconOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const siblings = option.parentNode.querySelectorAll('.icon-option');
                    siblings.forEach(sibling => sibling.classList.remove('active'));
                    option.classList.add('active');
                    
                    this.personalization.icon = option.dataset.icon;
                    this.updatePersonalizationPreview();
                });
            });
        }
    }

    // ========================================
    // IMAGE ZOOM
    // ========================================

    /**
     * Configura zoom de imagem
     */
    setupImageZoom() {
        const mainImage = this.elements.mainProductImage;
        const modal = document.getElementById('imageZoomModal');
        const closeBtn = document.getElementById('zoomCloseBtn');
        const overlay = document.getElementById('zoomModalOverlay');

        if (mainImage && modal) {
            mainImage.addEventListener('click', () => {
                this.openImageZoom();
            });

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeImageZoom();
                });
            }

            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeImageZoom();
                    }
                });
            }
        }

        // Suporte a teclado
        document.addEventListener('keydown', (e) => {
            if (modal && modal.style.display === 'block') {
                if (e.key === 'Escape') {
                    this.closeImageZoom();
                } else if (e.key === 'ArrowLeft') {
                    this.navigateZoomImage(-1);
                } else if (e.key === 'ArrowRight') {
                    this.navigateZoomImage(1);
                }
            }
        });
    }

    /**
     * Abre zoom de imagem
     */
    openImageZoom() {
        const modal = document.getElementById('imageZoomModal');
        const modalImage = document.getElementById('zoomModalImage');
        
        if (modal && modalImage && this.currentProduct.images) {
            const currentImage = this.currentProduct.images[this.selectedImageIndex];
            modalImage.src = currentImage.url;
            modalImage.alt = currentImage.altText;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Fecha zoom de imagem
     */
    closeImageZoom() {
        const modal = document.getElementById('imageZoomModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Navega imagem no zoom
     * @param {number} direction - Direção (-1 ou 1)
     */
    navigateZoomImage(direction) {
        const totalImages = this.currentProduct?.images?.length || 0;
        if (totalImages <= 1) return;

        if (direction > 0 && this.selectedImageIndex < totalImages - 1) {
            this.selectedImageIndex++;
        } else if (direction < 0 && this.selectedImageIndex > 0) {
            this.selectedImageIndex--;
        }

        this.renderGallery();
        this.openImageZoom();
    }

    // ========================================
    // TABS
    // ========================================

    /**
     * Configura tabs
     */
    setupTabs() {
        const tabHeaders = document.querySelectorAll('.tab-header');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetTab = header.dataset.tab;
                
                // Remover active de todos
                tabHeaders.forEach(h => h.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));
                
                // Adicionar active ao clicado
                header.classList.add('active');
                const targetPanel = document.getElementById(`tab-${targetTab}`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // ========================================
    // UTILITIES
    // ========================================

    /**
     * Obtém valor da opção selecionada
     * @param {string} optionName - Nome da opção
     * @returns {string} Valor
     */
    getSelectedOptionValue(optionName) {
        return this.selectedVariant?.selectedOptions?.find(
            opt => opt.name === optionName
        )?.value || '';
    }

    /**
     * Atualiza elemento DOM
     * @param {string} id - ID do elemento
     * @param {string} content - Conteúdo
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            if (content.includes('<')) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
        }
    }

    /**
     * Define estado de loading do botão
     * @param {string} buttonId - ID do botão
     * @param {boolean} isLoading - Se está carregando
     */
    setButtonLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const btnText = button.querySelector('.btn-text');
        const btnIcon = button.querySelector('.btn-icon');
        const btnLoading = button.querySelector('.btn-loading');

        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            if (btnText) btnText.style.opacity = '0';
            if (btnIcon) btnIcon.style.opacity = '0';
            if (btnLoading) btnLoading.style.display = 'inline-block';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (btnText) btnText.style.opacity = '1';
            if (btnIcon) btnIcon.style.opacity = '1';
            if (btnLoading) btnLoading.style.display = 'none';
            
            // Restaurar texto do botão
            this.updatePricing();
        }
    }

    /**
     * Mostra/esconde loading principal
     * @param {boolean} show - Mostrar ou esconder
     */
    showMainLoading(show) {
        if (this.elements.pageLoader) {
            if (show) {
                this.elements.pageLoader.classList.remove('hidden');
            } else {
                this.elements.pageLoader.classList.add('hidden');
            }
        }
    }

    /**
     * Mostra erro
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h2>❌ Ops! Algo deu errado</h2>
                <p>${message}</p>
                <div class="error-actions">
                    <button class="btn-primary" onclick="window.location.reload()">
                        Tentar Novamente
                    </button>
                    <a href="../paginas/produtos.html" class="btn-secondary">
                        Ver Outros Produtos
                    </a>
                </div>
            </div>
        `;

        Object.assign(errorContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '9999',
            textAlign: 'center'
        });

        document.body.appendChild(errorContainer);
    }
}

