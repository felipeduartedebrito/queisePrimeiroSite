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

        // Personalization state
        this.personalization = {
            enabled: false,
            panelOpen: false,
            type: '',       // texto-vertical | texto-horizontal | icone-texto-vertical | icone-texto-horizontal | icone
            text: '',
            font: 'Arial',
            icon: '',       // nome do ícone (ex: 'arvore')
            iconSrc: ''     // caminho da imagem do ícone
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
        const mode = PERSONALIZATION_CONFIG.mode;

        // 'none' → nenhum produto personaliza
        if (mode === 'none') {
            this.personalization.enabled = false;
            return;
        }

        // 'allowed' → respeita metafield do Shopify
        if (mode === 'allowed') {
            const config = this.currentProduct?.metafields?.personalization;
            if (config?.enabled) {
                this.personalization.enabled = true;
                this.setupPersonalizationOptions(config);
            } else {
                this.personalization.enabled = false;
            }
            return;
        }

        // 'global' → todos os produtos, usa metafield se existir ou defaults
        const config = this.currentProduct?.metafields?.personalization ?? {
            enabled: true,
            price: PERSONALIZATION_CONFIG.basePrice,
            maxChars: PERSONALIZATION_CONFIG.maxChars,
            allowedFonts: PERSONALIZATION_CONFIG.availableFonts.map(f => f.value),
            allowedColors: PERSONALIZATION_CONFIG.availableColors.map(c => c.value),
            allowedPositions: PERSONALIZATION_CONFIG.availablePositions.map(p => p.value)
        };
        this.personalization.enabled = true;
        this.setupPersonalizationOptions(config);
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
        if (personalizableBadge) {
            const showBadge =
                PERSONALIZATION_CONFIG.mode === 'global' ||
                (PERSONALIZATION_CONFIG.mode === 'allowed' && this.currentProduct.metafields?.personalization?.enabled);
            personalizableBadge.style.display = showBadge ? 'inline-block' : 'none';
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
                    this.switchImage(index);
                });
                
                this.elements.thumbnailGallery.appendChild(thumbnail);
            });
        }

        // Atualizar navegação
        this.updateGalleryNavigation();
    }

    /**
     * Troca a imagem principal com transição de fade.
     * Atualiza índice, src e thumbnail ativo sem re-renderizar tudo.
     * @param {number} index - Índice da nova imagem
     */
    switchImage(index) {
        const images = this.currentProduct?.images;
        if (!images || index < 0 || index >= images.length) return;

        this.selectedImageIndex = index;
        const newImage = images[index];

        // Fade out → troca src → fade in
        const mainImg = this.elements.mainProductImage;
        if (mainImg) {
            mainImg.style.transition = 'opacity 0.2s ease';
            mainImg.style.opacity = '0';
            setTimeout(() => {
                mainImg.src = newImage.url;
                mainImg.alt = newImage.altText || this.currentProduct.title;
                mainImg.style.opacity = '1';
            }, 200);
        }

        // Atualizar thumbnail ativo
        if (this.elements.thumbnailGallery) {
            this.elements.thumbnailGallery
                .querySelectorAll('.thumbnail')
                .forEach((th, i) => th.classList.toggle('active', i === index));
        }

        this.updateGalleryNavigation();
    }

    /**
     * Troca src da imagem principal sem exigir que a URL esteja no array de imagens
     */
    _swapMainImageUrl(url) {
        const mainImg = this.elements.mainProductImage;
        if (!mainImg) return;
        mainImg.style.transition = 'opacity 0.2s ease';
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src = url;
            mainImg.style.opacity = '1';
        }, 200);
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

            const isColorOption = /^cor$/i.test(option.name.trim());

            // Atualizar label "Cor — NomeAtual"
            if (isColorOption) {
                const labelEl = groupElement.querySelector('.variant-label');
                const selectedColor = this.selectedVariant?.selectedOptions?.find(
                    o => o.name === option.name
                )?.value || '';
                if (labelEl && selectedColor) {
                    labelEl.textContent = `${option.name} — ${selectedColor}`;
                }
            }

            option.values.forEach(value => {
                const isAvailable = this.isVariantOptionAvailable(option.name, value);
                const isSelected = this.selectedVariant?.selectedOptions?.some(
                    opt => opt.name === option.name && opt.value === value
                );

                const btn = document.createElement('button');

                if (isColorOption) {
                    const hex = this._colorNameToHex(value);
                    btn.className = 'variant-color-swatch' + (isSelected ? ' selected' : '') + (!isAvailable ? ' unavailable' : '');
                    btn.style.background = hex;
                    btn.title = value;
                    btn.setAttribute('aria-label', value);
                    if (isSelected) {
                        btn.style.boxShadow = `0 0 0 2.5px #fff, 0 0 0 4px ${hex}`;
                    } else {
                        btn.style.boxShadow = `0 0 0 2.5px #fff, 0 0 0 3.5px #d0d0d0`;
                    }
                } else {
                    btn.className = 'variant-option' + (isSelected ? ' selected' : '') + (!isAvailable ? ' unavailable' : '');
                    btn.textContent = value;
                }

                if (!isAvailable) btn.disabled = true;

                btn.addEventListener('click', () => {
                    if (!isAvailable) return;

                    // Atualizar label da cor ao selecionar
                    if (isColorOption) {
                        const labelEl = groupElement.querySelector('.variant-label');
                        if (labelEl) labelEl.textContent = `${option.name} — ${value}`;
                    }

                    this.selectVariant(option.name, value);
                });

                optionsContainer.appendChild(btn);
            });
        });
    }

    /**
     * Mapeia nome de cor para hex
     */
    _colorNameToHex(name) {
        const map = {
            // PT
            'preto': '#1a1a1a', 'black': '#1a1a1a',
            'branco': '#f5f5f5', 'white': '#f5f5f5',
            'cinza': '#9e9e9e', 'gray': '#9e9e9e', 'grey': '#9e9e9e',
            'cinza escuro': '#4a4a4a', 'chumbo': '#4a4a4a',
            'prata': '#c0c0c0', 'silver': '#c0c0c0',
            'azul': '#3a6ea8', 'blue': '#3a6ea8',
            'azul claro': '#6baed6', 'light blue': '#6baed6', 'sky': '#87ceeb',
            'azul escuro': '#1a3a5c', 'navy': '#1a3a5c', 'marinho': '#1a3a5c',
            'vermelho': '#c0392b', 'red': '#c0392b',
            'rosa': '#e9a0b0', 'pink': '#e9a0b0',
            'rosa claro': '#f8c8d0', 'baby pink': '#f8c8d0',
            'lilás': '#c8a9d4', 'lilas': '#c8a9d4', 'lilac': '#c8a9d4', 'lavanda': '#b89ac8',
            'roxo': '#7b2d8b', 'purple': '#7b2d8b', 'violeta': '#7b2d8b',
            'vinho': '#722f37', 'burgundy': '#722f37', 'bordô': '#722f37', 'bordo': '#722f37',
            'laranja': '#e07b39', 'orange': '#e07b39',
            'amarelo': '#f5c842', 'yellow': '#f5c842',
            'verde': '#3a7a52', 'green': '#3a7a52',
            'verde claro': '#6dbf7e', 'mint': '#6dbf7e',
            'verde escuro': '#1e4d2b', 'dark green': '#1e4d2b',
            'bege': '#e8dcc8', 'beige': '#e8dcc8', 'areia': '#e8dcc8',
            'marrom': '#7a4a2a', 'brown': '#7a4a2a', 'café': '#7a4a2a',
            'dourado': '#c9a84c', 'gold': '#c9a84c',
            'caramelo': '#c47e3a', 'caramel': '#c47e3a',
            'salmão': '#e8967a', 'salmon': '#e8967a', 'pessego': '#e8967a',
            'coral': '#e8735a',
            'terracota': '#c4673a',
            'nude': '#d4a882',
            'off white': '#f0ede8', 'off-white': '#f0ede8', 'cru': '#f0ede8',
            'plum': '#8b3a62', 'ameixa': '#8b3a62',
            'tiffany': '#81d8d0', 'turquesa': '#40bfbf', 'turquoise': '#40bfbf',
            'grafite': '#5a5a5a', 'graphite': '#5a5a5a',
        };
        const key = name.toLowerCase().trim();
        return map[key] || '#cccccc';
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

            // Trocar imagem se a variante tiver imagem própria
            if (newVariant.image?.url) {
                const stripQ = url => url?.split('?')[0];
                const images = this.currentProduct.images || [];
                const targetIndex = images.findIndex(img => stripQ(img.url) === stripQ(newVariant.image.url));
                if (targetIndex !== -1 && targetIndex !== this.selectedImageIndex) {
                    this.switchImage(targetIndex);
                } else if (targetIndex === -1) {
                    this._swapMainImageUrl(newVariant.image.url);
                }
            }

            // Re-renderizar variantes para atualizar disponibilidade
            this.renderVariants();
            this.updatePricing();
            this.updateAvailability();
        }
    }

    /**
     * Renderiza seção de personalização
     */
    renderPersonalization() {
        const section = document.getElementById('personalizationSection');
        if (!section) return;

        // 'none' → ocultar tudo
        if (PERSONALIZATION_CONFIG.mode === 'none') {
            section.style.display = 'none';
            this.personalization.enabled = false;
            return;
        }

        // 'allowed' → respeita metafield Shopify
        if (PERSONALIZATION_CONFIG.mode === 'allowed') {
            const config = this.currentProduct?.metafields?.personalization;
            if (config?.enabled) {
                section.style.display = 'flex';
                this.personalization.enabled = true;
                this.setupPersonalizationListeners();
            } else {
                section.style.display = 'none';
                this.personalization.enabled = false;
            }
            return;
        }

        // 'global' → mostrar para todos
        section.style.display = 'flex';
        this.personalization.enabled = true;
        this.setupPersonalizationListeners();
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
        if (this.personalization.enabled && this.personalization.panelOpen && this.personalization.type) {
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
                <span class="availability-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
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
                <span class="availability-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </span>
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
     * Atualiza overlay de personalização sobre a imagem do produto
     */
    updateImageOverlay() {
        const overlay = document.getElementById('personalizationOverlay');
        if (!overlay) return;

        const { type, text, font, iconSrc } = this.personalization;
        const hasText = text.trim().length > 0;
        const hasIcon = iconSrc.length > 0;
        const needsText = type.includes('texto');
        const needsIcon = type.includes('icone');
        const isVertical = type.includes('vertical');

        // Só mostra overlay se houver algo para exibir
        const shouldShow = (needsText && hasText) || (needsIcon && hasIcon) || (!needsText && needsIcon && hasIcon);

        if (!shouldShow || !type) {
            overlay.style.display = 'none';
            return;
        }

        overlay.style.display = 'flex';
        overlay.className = 'personalization-overlay';

        const vertClass = isVertical ? ' vertical' : '';
        let content = '';
        if (needsIcon && needsText) {
            content = `<span class="overlay-icon-text${vertClass}">
                ${hasIcon ? `<img class="overlay-icon" src="${iconSrc}" alt="">` : ''}
                ${hasText ? `<span class="overlay-text${vertClass}" style="font-family:${font}">${text.trim()}</span>` : ''}
            </span>`;
        } else if (needsIcon) {
            content = hasIcon ? `<img class="overlay-icon" src="${iconSrc}" alt="">` : '';
        } else {
            content = hasText ? `<span class="overlay-text${vertClass}" style="font-family:${font}">${text.trim()}</span>` : '';
        }

        overlay.innerHTML = content;
        this.updatePricing();
    }

    /**
     * Atualiza contador de caracteres
     */
    updateCharCount() {
        const textArea = document.getElementById('personalizationText');
        const charCount = document.getElementById('charCount');
        if (!textArea || !charCount) return;

        const maxChars = parseInt(textArea.maxLength) || 30;
        const current = textArea.value.length;
        charCount.textContent = `${current}/${maxChars}`;

        charCount.className = 'char-count';
        if (current > maxChars * 0.8) {
            charCount.classList.add(current > maxChars * 0.9 ? 'danger' : 'warning');
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
                    if (!PERSONALIZATION_CONFIG.enabled || !personalization || !personalization.type) return [];
                    const attrs = [];
                    attrs.push({ key: 'Tipo de Personalização', value: personalization.type });
                    if (personalization.text) {
                        attrs.push({ key: 'Texto Personalizado', value: personalization.text });
                    }
                    if (personalization.font) {
                        attrs.push({ key: 'Fonte', value: personalization.font });
                    }
                    if (personalization.icon) {
                        attrs.push({ key: 'Ícone', value: personalization.icon });
                    }
                    attrs.push({
                        key: 'Confirmação de não devolução',
                        value: personalization.confirmado === 'sim'
                            ? `Confirmado em ${new Date().toLocaleString('pt-BR')}`
                            : 'Não confirmado'
                    });
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
        if (this.personalization.enabled && this.personalization.panelOpen && this.personalization.type) {
            const personalizationStr = JSON.stringify({
                type: this.personalization.type,
                text: this.personalization.text,
                font: this.personalization.font,
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
        if (this.personalization.enabled && this.personalization.panelOpen && this.personalization.type) {
            const confirmEl = document.getElementById('personalizationConfirm');
            cartItem.personalization = {
                type: this.personalization.type,
                text: this.personalization.text,
                font: this.personalization.font,
                icon: this.personalization.icon,
                confirmado: confirmEl?.checked ? 'sim' : 'nao'
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

            if (ENVIRONMENT.isDevelopment) {
                await delay(500);
                CartStorage.addItem(cartItem);
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                // Produção: adiciona via Shopify API (igual ao addToCart)
                let cart = await api.getOrCreateCart();
                const lines = [{
                    merchandiseId: cartItem.variantId,
                    quantity: cartItem.quantity,
                    attributes: (PERSONALIZATION_CONFIG.enabled && cartItem.personalization)
                        ? Object.entries(cartItem.personalization).map(([k, v]) => ({ key: k, value: String(v) }))
                        : []
                }];
                cart = await api.addToCart(cart.id, lines);
                window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
            }

            this.updateCartBadge();
            Notification.success('Redirecionando para o carrinho...');

            setTimeout(() => {
                window.location.href = '../paginas/carrinho.html';
            }, 800);

        } catch (error) {
            console.error('Erro ao processar compra:', error);
            Notification.error('Erro ao processar compra');
            this.setButtonLoading('buyNowBtn', false);
            this.isLoading = false;
        }
    }

    /**
     * Atualiza badge do carrinho
     */
    updateCartBadge() {
        const badge = document.getElementById('headerCartBadge');
        if (!badge) return;
        try {
            const raw   = localStorage.getItem('queise_cart');
            const cart  = raw ? JSON.parse(raw) : { items: [] };
            const count = (cart.items || []).reduce((t, i) => t + (i.quantity || 1), 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        } catch (e) {
            badge.style.display = 'none';
        }
    }

    /**
     * Mostra modal de carrinho
     */
    showCartModal() {
        const modal = document.createElement('div');
        modal.className = 'cart-success-modal';

        // Montar estrutura
        modal.innerHTML = `
            <div class="csc-inner">
                <button class="csc-close" aria-label="Fechar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="csc-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2f4f6f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <h3 class="csc-title">Produto adicionado!</h3>
                <p class="csc-msg">O que você gostaria de fazer agora?</p>
                <div class="csc-actions">
                    <button class="csc-btn-secondary">Continuar Comprando</button>
                    <a href="../paginas/carrinho.html" class="csc-btn-primary">Ver Carrinho</a>
                </div>
            </div>
        `;

        // === OVERLAY ===
        Object.assign(modal.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '99999',
            padding: '1rem',
            boxSizing: 'border-box'
        });

        // === CARD INNER ===
        const inner = modal.querySelector('.csc-inner');
        Object.assign(inner.style, {
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem 2rem 2rem',
            maxWidth: '380px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
            textAlign: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
            animation: 'cscIn 0.25s ease'
        });

        // === CLOSE BTN ===
        const closeBtn = modal.querySelector('.csc-close');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#888',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.2s'
        });

        // === ICON ===
        const icon = modal.querySelector('.csc-icon');
        Object.assign(icon.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(47,79,111,0.08)',
            margin: '0 auto 1rem'
        });

        // === TITLE ===
        const title = modal.querySelector('.csc-title');
        Object.assign(title.style, {
            margin: '0 0 0.5rem',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1a1a1a',
            fontFamily: 'Inter, system-ui, sans-serif'
        });

        // === MESSAGE ===
        const msg = modal.querySelector('.csc-msg');
        Object.assign(msg.style, {
            margin: '0 0 1.75rem',
            fontSize: '0.95rem',
            color: '#666',
            fontFamily: 'Inter, system-ui, sans-serif'
        });

        // === ACTIONS ===
        const actions = modal.querySelector('.csc-actions');
        Object.assign(actions.style, {
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
        });

        // === BTN SECONDARY ===
        const btnSecondary = modal.querySelector('.csc-btn-secondary');
        Object.assign(btnSecondary.style, {
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid #2f4f6f',
            background: 'transparent',
            color: '#2f4f6f',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'background 0.2s, color 0.2s',
            flex: '1',
            minWidth: '130px'
        });

        // === BTN PRIMARY ===
        const btnPrimary = modal.querySelector('.csc-btn-primary');
        Object.assign(btnPrimary.style, {
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2f4f6f, #4682B4)',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 4px 14px rgba(47,79,111,0.3)',
            flex: '1',
            minWidth: '130px'
        });

        // Adicionar keyframe de entrada
        if (!document.getElementById('csc-keyframes')) {
            const style = document.createElement('style');
            style.id = 'csc-keyframes';
            style.textContent = `@keyframes cscIn { from { opacity:0; transform:scale(0.92) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Hover effects
        closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = '#f0f0f0'; });
        closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'none'; });
        btnSecondary.addEventListener('mouseenter', () => { btnSecondary.style.background = '#2f4f6f'; btnSecondary.style.color = 'white'; });
        btnSecondary.addEventListener('mouseleave', () => { btnSecondary.style.background = 'transparent'; btnSecondary.style.color = '#2f4f6f'; });

        // Event listeners para fechar
        const close = () => { if (document.body.contains(modal)) document.body.removeChild(modal); };

        closeBtn.addEventListener('click', close);
        btnSecondary.addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

        // Auto close após 8 segundos
        setTimeout(close, 8000);
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
                    this.switchImage(this.selectedImageIndex - 1);
                }
            });
        }

        if (this.elements.nextImageBtn) {
            this.elements.nextImageBtn.addEventListener('click', () => {
                const maxIndex = (this.currentProduct?.images?.length || 1) - 1;
                if (this.selectedImageIndex < maxIndex) {
                    this.switchImage(this.selectedImageIndex + 1);
                }
            });
        }
    }

    /**
     * Configura listeners de personalização (fluxo estilo Tuyo)
     */
    setupPersonalizationListeners() {
        if (this._personalizationListenersSet) return;
        this._personalizationListenersSet = true;

        // --- Botão toggle Personalizar / Remover ---
        const toggleBtn = document.getElementById('personalizeToggleBtn');
        const panel = document.getElementById('personalizationPanel');
        if (toggleBtn && panel) {
            toggleBtn.addEventListener('click', () => {
                this.personalization.panelOpen = !this.personalization.panelOpen;
                if (this.personalization.panelOpen) {
                    panel.style.display = 'flex';
                    toggleBtn.textContent = 'Remover';
                    toggleBtn.classList.add('active');
                } else {
                    panel.style.display = 'none';
                    toggleBtn.textContent = 'Personalizar (Grátis)';
                    toggleBtn.classList.remove('active');
                    this._resetPersonalization();
                }
                this._updateCartButtonsState();
            });
        }

        // --- Dropdown de tipo ---
        const typeSelect = document.getElementById('customTypeSelect');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.personalization.type = e.target.value;
                this._handleTypeChange(e.target.value);
                this.updateImageOverlay();
                this._updateCartButtonsState();
            });
        }

        // --- Ícones ---
        const iconBtns = document.querySelectorAll('.icon-btn');
        iconBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                iconBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.personalization.icon = btn.dataset.icon;
                this.personalization.iconSrc = btn.dataset.src;
                this.updateImageOverlay();
            });
        });

        // --- Campo de texto ---
        const textArea = document.getElementById('personalizationText');
        if (textArea) {
            this.elements.personalizationText = textArea;
            textArea.addEventListener('input', (e) => {
                this.personalization.text = e.target.value;
                this.updateCharCount();
                this.updateImageOverlay();
            });
        }

        // --- Botões de fonte ---
        const fontBtns = document.querySelectorAll('.font-btn');
        fontBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                fontBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.personalization.font = btn.dataset.font;
                this.updateImageOverlay();
            });
        });

        // --- Checkbox de confirmação ---
        const confirmCheck = document.getElementById('personalizationConfirm');
        if (confirmCheck) {
            confirmCheck.addEventListener('change', () => this._updateCartButtonsState());
        }

        // --- Botão Preview ---
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this._openPreviewModal());
        }

        // --- Fechar modal ---
        const modalBg = document.getElementById('previewModalBg');
        const modalCloseBtn = document.getElementById('previewModalCloseBtn');
        if (modalBg) modalBg.addEventListener('click', () => this._closePreviewModal());
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => this._closePreviewModal());

        // charCount ref
        const charCount = document.getElementById('charCount');
        if (charCount) this.elements.charCount = charCount;
    }

    /**
     * Mostra/esconde seções conforme o tipo selecionado
     */
    _handleTypeChange(type) {
        const iconSection    = document.getElementById('iconSection');
        const textSection    = document.getElementById('textSection');
        const fontSection    = document.getElementById('fontSection');
        const confirmSection = document.getElementById('confirmSection');
        const previewBtn     = document.getElementById('previewBtn');

        const hasText = type.includes('texto');
        const hasIcon = type.includes('icone');
        const hasType = type.length > 0;
        const isVertical = type.includes('vertical');
        const maxChars = isVertical ? 20 : 8;

        if (iconSection)    iconSection.style.display    = hasIcon ? 'flex' : 'none';
        if (textSection)    textSection.style.display    = hasText ? 'flex' : 'none';
        if (fontSection)    fontSection.style.display    = hasText ? 'flex' : 'none';
        if (confirmSection) confirmSection.style.display = hasType ? 'flex' : 'none';
        if (previewBtn)     previewBtn.style.display     = hasType ? 'block' : 'none';

        // Aplicar limite de caracteres conforme orientação
        if (hasText) {
            const textArea = document.getElementById('personalizationText');
            const charCount = document.getElementById('charCount');
            if (textArea) {
                textArea.maxLength = maxChars;
                textArea.placeholder = `Máximo ${maxChars} caracteres`;
            }
            if (charCount) charCount.textContent = `0/${maxChars}`;
        }

        // Resetar estado ao mudar tipo
        this.personalization.text = '';
        this.personalization.icon = '';
        this.personalization.iconSrc = '';
        const textArea = document.getElementById('personalizationText');
        if (textArea) textArea.value = '';
        document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
        const confirm = document.getElementById('personalizationConfirm');
        if (confirm) confirm.checked = false;
        this.updateCharCount();
    }

    /**
     * Reseta todo o estado de personalização
     */
    _resetPersonalization() {
        this.personalization.type = '';
        this.personalization.text = '';
        this.personalization.font = 'Arial';
        this.personalization.icon = '';
        this.personalization.iconSrc = '';

        const typeSelect = document.getElementById('customTypeSelect');
        if (typeSelect) typeSelect.value = '';

        ['iconSection','textSection','fontSection','confirmSection'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) previewBtn.style.display = 'none';

        const textArea = document.getElementById('personalizationText');
        if (textArea) textArea.value = '';
        document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.font-btn').forEach((b, i) => {
            b.classList.toggle('active', i === 0);
        });
        const confirm = document.getElementById('personalizationConfirm');
        if (confirm) confirm.checked = false;

        this.updateImageOverlay();
        this.updatePricing();
        this._updateCartButtonsState();
    }

    /**
     * Abre o modal fullscreen de preview
     */
    _openPreviewModal() {
        const modal   = document.getElementById('previewModal');
        const img     = document.getElementById('previewModalImg');
        const overlay = document.getElementById('previewModalOverlayEl');
        if (!modal || !img) return;

        // Imagem atual do produto
        const currentImg = this.elements.mainProductImage;
        img.src = currentImg?.src || '';

        // Montar overlay no modal
        const { type, text, font, iconSrc } = this.personalization;
        const hasText = text.trim().length > 0;
        const hasIcon = iconSrc.length > 0;
        const needsText = type.includes('texto');
        const needsIcon = type.includes('icone');

        const isVertical = type.includes('vertical');
        const vertClass = isVertical ? ' vertical' : '';
        overlay.className = 'preview-modal-overlay';

        let content = '';
        if (needsIcon && needsText) {
            content = `<span class="overlay-icon-text${vertClass}">
                ${hasIcon ? `<img class="overlay-icon" src="${iconSrc}" alt="">` : ''}
                ${hasText ? `<span class="overlay-text${vertClass}" style="font-family:${font}">${text.trim()}</span>` : ''}
            </span>`;
        } else if (needsIcon) {
            content = hasIcon ? `<img class="overlay-icon" src="${iconSrc}" alt="">` : '';
        } else {
            content = hasText ? `<span class="overlay-text${vertClass}" style="font-family:${font}">${text.trim()}</span>` : '';
        }
        overlay.innerHTML = content;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Fecha o modal fullscreen de preview
     */
    _closePreviewModal() {
        const modal = document.getElementById('previewModal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    /**
     * Atualiza estado dos botões de compra:
     * - Bloqueia quando painel aberto + tipo selecionado + checkbox não marcado
     * - Libera quando checkbox marcado ou painel fechado
     */
    _updateCartButtonsState() {
        const addBtn = this.elements.addToCartBtn;
        const buyBtn = this.elements.buyNowBtn;
        const confirm = document.getElementById('personalizationConfirm');

        const panelOpen = this.personalization.panelOpen;
        const typeSelected = this.personalization.type.length > 0;
        const confirmed = confirm?.checked ?? true;

        // Bloquear só quando painel aberto, tipo escolhido e checkbox não marcado
        const shouldBlock = panelOpen && typeSelected && !confirmed;

        if (addBtn) {
            addBtn.disabled = shouldBlock;
            addBtn.title = shouldBlock ? 'Confirme os termos da personalização para continuar' : '';
        }
        if (buyBtn) {
            buyBtn.disabled = shouldBlock;
            buyBtn.title = shouldBlock ? 'Confirme os termos da personalização para continuar' : '';
        }
    }

    // ========================================
    // IMAGE ZOOM (lens magnifier)
    // ========================================

    /**
     * Configura zoom com lupa + painel lateral:
     * um quadrado segue o mouse sobre a imagem e um painel ao lado
     * mostra a área ampliada.
     */
    setupImageZoom() {
        const img       = this.elements.mainProductImage;
        const container = img?.parentElement;
        const lens      = document.getElementById('zoomLens');
        const result    = document.getElementById('zoomResult');
        const hint      = document.getElementById('imageZoomOverlay');

        if (!img || !lens || !result) return;

        const LENS_SIZE = 200;

        const isTouchOnly = () =>
            window.matchMedia('(max-width: 1200px)').matches ||
            window.matchMedia('(hover: none)').matches;

        const moveLens = (e) => {
            const rect = container.getBoundingClientRect();
            const W = rect.width;
            const H = rect.height;

            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            // Mantém a lupa dentro dos limites
            x = Math.max(LENS_SIZE / 2, Math.min(x, W - LENS_SIZE / 2));
            y = Math.max(LENS_SIZE / 2, Math.min(y, H - LENS_SIZE / 2));

            const lensLeft = x - LENS_SIZE / 2;
            const lensTop  = y - LENS_SIZE / 2;

            lens.style.left   = lensLeft + 'px';
            lens.style.top    = lensTop  + 'px';
            lens.style.width  = LENS_SIZE + 'px';
            lens.style.height = LENS_SIZE + 'px';

            // Painel de resultado
            const rW = result.offsetWidth  || 380;
            const rH = result.offsetHeight || 380;
            const cx = rW / LENS_SIZE;
            const cy = rH / LENS_SIZE;

            result.style.backgroundImage    = `url('${img.src}')`;
            result.style.backgroundSize     = `${W * cx}px ${H * cy}px`;
            result.style.backgroundPosition = `-${lensLeft * cx}px -${lensTop * cy}px`;
        };

        container.addEventListener('mouseenter', () => {
            if (isTouchOnly()) return;
            lens.style.display   = 'block';
            result.style.display = 'block';
            if (hint) hint.style.opacity = '0';
        });

        container.addEventListener('mousemove', (e) => {
            if (isTouchOnly()) return;
            moveLens(e);
        });

        container.addEventListener('mouseleave', () => {
            lens.style.display   = 'none';
            result.style.display = 'none';
            if (hint) hint.style.opacity = '';
        });
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

