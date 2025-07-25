// PRODUTO-INDIVIDUAL.JS - Sistema Completo Renovado QUEISE

// ========================================
// CONFIGURAÇÃO E CONSTANTES
// ========================================

const CONFIG = {
    isDevelopment: true,
    storageKey: 'queise_cart',
    maxQuantity: 99,
    minQuantity: 1,
    
    shopify: {
        domain: 'queise.myshopify.com',
        storefrontAccessToken: 'your-storefront-access-token'
    }
};

// ========================================
// DADOS MOCK COMPLETOS
// ========================================

const MOCK_PRODUCTS = {
    'garrafa-stanley-1l': {
        id: 'garrafa-stanley-1l',
        handle: 'garrafa-stanley-1l',
        title: 'Garrafa Térmica Stanley Adventure 1L',
        vendor: 'Stanley',
        productType: 'Garrafa Térmica',
        price: 16500,
        compareAtPrice: 19900,
        availableForSale: true,
        totalInventory: 50,
        
        description: `
            <p>A Garrafa Térmica Stanley Adventure 1L é o companheiro perfeito para suas aventuras. Com tecnologia de vácuo duplo, mantém suas bebidas quentes por até 16 horas e frias por até 20 horas.</p>
            
            <h3>🌟 Principais Características</h3>
            <ul>
                <li>Capacidade generosa de 1 litro</li>
                <li>Isolamento térmico superior com vácuo duplo</li>
                <li>Construção em aço inoxidável 18/8 de alta qualidade</li>
                <li>Tampa com sistema de vedação hermética</li>
                <li>Acabamento resistente a riscos e impactos</li>
                <li>Design ergonômico com alça confortável</li>
                <li>100% livre de BPA e materiais tóxicos</li>
            </ul>
            
            <h3>🎯 Ideal Para</h3>
            <ul>
                <li>Viagens e aventuras ao ar livre</li>
                <li>Academia e atividades esportivas</li>
                <li>Escritório e uso diário</li>
                <li>Camping e trilhas</li>
            </ul>
        `,
        
        images: [
            {
                id: 'img1',
                url: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                altText: 'Garrafa Stanley 1L - Vista principal'
            },
            {
                id: 'img2',
                url: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                altText: 'Garrafa Stanley 1L - Vista lateral'
            },
            {
                id: 'img3',
                url: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                altText: 'Garrafa Stanley 1L - Detalhes'
            }
        ],
        
        options: [
            {
                name: 'Tamanho',
                values: ['1L']
            },
            {
                name: 'Cor',
                values: ['Azul Marinho', 'Verde Militar', 'Preto Fosco', 'Cinza Grafite']
            }
        ],
        
        variants: [
            { 
                id: 'var1', 
                title: '1L / Azul Marinho', 
                price: 16500, 
                compareAtPrice: 19900,
                availableForSale: true, 
                quantityAvailable: 15, 
                selectedOptions: [
                    { name: 'Tamanho', value: '1L' }, 
                    { name: 'Cor', value: 'Azul Marinho' }
                ] 
            },
            { 
                id: 'var2', 
                title: '1L / Verde Militar', 
                price: 16500, 
                compareAtPrice: 19900,
                availableForSale: true, 
                quantityAvailable: 12, 
                selectedOptions: [
                    { name: 'Tamanho', value: '1L' }, 
                    { name: 'Cor', value: 'Verde Militar' }
                ] 
            },
            { 
                id: 'var3', 
                title: '1L / Preto Fosco', 
                price: 16500, 
                compareAtPrice: 19900,
                availableForSale: true, 
                quantityAvailable: 8, 
                selectedOptions: [
                    { name: 'Tamanho', value: '1L' }, 
                    { name: 'Cor', value: 'Preto Fosco' }
                ] 
            },
            { 
                id: 'var4', 
                title: '1L / Cinza Grafite', 
                price: 16500, 
                compareAtPrice: 19900,
                availableForSale: false, 
                quantityAvailable: 0, 
                selectedOptions: [
                    { name: 'Tamanho', value: '1L' }, 
                    { name: 'Cor', value: 'Cinza Grafite' }
                ] 
            }
        ],
        
        specifications: {
            'Capacidade': '1000ml (1 litro)',
            'Material': 'Aço inoxidável 18/8',
            'Isolamento': 'Vácuo duplo',
            'Dimensões': '32cm x 9cm',
            'Peso': '650g',
            'Garantia': '2 anos',
            'Origem': 'Nacional'
        },
        
        metafields: {
            personalization: {
                enabled: true,
                price: 2000,
                maxChars: 30,
                allowedFonts: ['Arial', 'Times New Roman', 'Brush Script MT', 'Arial Black'],
                allowedColors: ['#FFFFFF', '#000000', '#FFD700', '#C0C0C0'],
                allowedPositions: ['center', 'bottom', 'side']
            }
        }
    },
    
    'copo-termico-500ml': {
        id: 'copo-termico-500ml',
        handle: 'copo-termico-500ml',
        title: 'Copo Térmico Premium 500ml',
        vendor: 'QUEISE',
        productType: 'Copo Térmico',
        price: 8000,
        compareAtPrice: 9500,
        availableForSale: true,
        totalInventory: 30,
        
        description: `
            <p>Copo térmico de alta qualidade, perfeito para seu café, chá ou qualquer bebida. Mantém a temperatura ideal por horas com design elegante e funcional.</p>
            
            <h3>✨ Destaques</h3>
            <ul>
                <li>Capacidade ideal de 500ml</li>
                <li>Isolamento térmico por até 6 horas</li>
                <li>Material premium em aço inoxidável</li>
                <li>Tampa antivazamento com sistema de rosca</li>
                <li>Base antiderrapante</li>
                <li>Design ergonômico</li>
            </ul>
        `,
        
        images: [
            {
                id: 'img1',
                url: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                altText: 'Copo Térmico 500ml'
            }
        ],
        
        options: [
            { name: 'Tamanho', values: ['500ml'] },
            { name: 'Cor', values: ['Preto', 'Branco', 'Azul'] }
        ],
        
        variants: [
            { 
                id: 'var1', 
                title: '500ml / Preto', 
                price: 8000, 
                compareAtPrice: 9500,
                availableForSale: true, 
                quantityAvailable: 10, 
                selectedOptions: [
                    { name: 'Tamanho', value: '500ml' }, 
                    { name: 'Cor', value: 'Preto' }
                ] 
            },
            { 
                id: 'var2', 
                title: '500ml / Branco', 
                price: 8000, 
                compareAtPrice: 9500,
                availableForSale: true, 
                quantityAvailable: 15, 
                selectedOptions: [
                    { name: 'Tamanho', value: '500ml' }, 
                    { name: 'Cor', value: 'Branco' }
                ] 
            },
            { 
                id: 'var3', 
                title: '500ml / Azul', 
                price: 8000, 
                compareAtPrice: 9500,
                availableForSale: true, 
                quantityAvailable: 5, 
                selectedOptions: [
                    { name: 'Tamanho', value: '500ml' }, 
                    { name: 'Cor', value: 'Azul' }
                ] 
            }
        ],
        
        specifications: {
            'Capacidade': '500ml',
            'Material': 'Aço inoxidável',
            'Isolamento': 'Vácuo duplo',
            'Dimensões': '15cm x 8cm',
            'Peso': '280g',
            'Garantia': '1 ano',
            'Origem': 'Nacional'
        },
        
        metafields: {
            personalization: {
                enabled: true,
                price: 2000,
                maxChars: 20,
                allowedFonts: ['Arial', 'Times New Roman', 'Brush Script MT'],
                allowedColors: ['#FFFFFF', '#000000', '#FFD700'],
                allowedPositions: ['center', 'bottom']
            }
        }
    },

    'bolsa-termica-20l': {
        id: 'bolsa-termica-20l',
        handle: 'bolsa-termica-20l',
        title: 'Bolsa Térmica Profissional 20L',
        vendor: 'QUEISE',
        productType: 'Bolsa Térmica',
        price: 12000,
        availableForSale: true,
        totalInventory: 20,
        
        description: `
            <p>Bolsa térmica espaçosa e eficiente para manter seus alimentos e bebidas sempre frescos. Ideal para piqueniques, viagens, trabalho e uso diário.</p>
            
            <h3>🎒 Características</h3>
            <ul>
                <li>Capacidade generosa de 20 litros</li>
                <li>Isolamento térmico avançado</li>
                <li>Tecido impermeável e resistente</li>
                <li>Alças reforçadas e ajustáveis</li>
                <li>Bolsos externos para acessórios</li>
                <li>Fácil limpeza</li>
            </ul>
        `,
        
        images: [
            {
                id: 'img1',
                url: '../imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp',
                altText: 'Bolsa Térmica 20L'
            }
        ],
        
        options: [
            { name: 'Tamanho', values: ['20L'] },
            { name: 'Cor', values: ['Azul', 'Cinza'] }
        ],
        
        variants: [
            { 
                id: 'var1', 
                title: '20L / Azul', 
                price: 12000, 
                availableForSale: true, 
                quantityAvailable: 10, 
                selectedOptions: [
                    { name: 'Tamanho', value: '20L' }, 
                    { name: 'Cor', value: 'Azul' }
                ] 
            },
            { 
                id: 'var2', 
                title: '20L / Cinza', 
                price: 12000, 
                availableForSale: true, 
                quantityAvailable: 10, 
                selectedOptions: [
                    { name: 'Tamanho', value: '20L' }, 
                    { name: 'Cor', value: 'Cinza' }
                ] 
            }
        ],
        
        specifications: {
            'Capacidade': '20 litros',
            'Material': 'Tecido PVC + Isolamento',
            'Dimensões': '35cm x 25cm x 25cm',
            'Peso': '800g',
            'Garantia': '6 meses',
            'Origem': 'Nacional'
        },
        
        metafields: {
            personalization: {
                enabled: false
            }
        }
    }
};

const RELATED_PRODUCTS = [
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
// CLASSE PRINCIPAL COMPLETA
// ========================================

class ModernProductManager {
    constructor() {
        this.currentProduct = null;
        this.selectedVariant = null;
        this.selectedImageIndex = 0;
        this.quantity = 1;
        this.isLoading = false;
        
        // Personalization state
        this.personalization = {
            enabled: false,
            text: '',
            font: 'Arial',
            color: '#FFFFFF',
            position: 'center'
        };

        this.init();
    }

    async init() {
        try {
            await this.loadProduct();
            this.setupEventListeners();
            this.setupImageZoom();
            this.setupTabs();
            
            console.log('ModernProductManager inicializado');
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showError('Erro ao carregar produto');
        }
    }

    // ========================================
    // CARREGAMENTO DO PRODUTO
    // ========================================

    async loadProduct() {
        this.showMainLoading(true);
        
        try {
            const productHandle = this.getProductHandle();
            if (!productHandle) {
                throw new Error('Handle do produto não encontrado');
            }

            const product = CONFIG.isDevelopment ? 
                MOCK_PRODUCTS[productHandle] : 
                await this.fetchShopifyProduct(productHandle);

            if (!product) {
                throw new Error('Produto não encontrado');
            }

            this.currentProduct = product;
            this.selectedVariant = product.variants[0];
            this.setupPersonalization();
            
            await this.renderProduct();
            
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            this.showError(error.message);
        } finally {
            this.showMainLoading(false);
        }
    }

    getProductHandle() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async fetchShopifyProduct(handle) {
        // Implementação Shopify para produção
        const query = `
            query getProduct($handle: String!) {
                product(handle: $handle) {
                    id handle title vendor productType description 
                    availableForSale totalInventory
                    priceRange { minVariantPrice { amount } }
                    images(first: 10) { edges { node { id url altText } } }
                    variants(first: 50) { 
                        edges { 
                            node { 
                                id title availableForSale quantityAvailable
                                price { amount }
                                selectedOptions { name value }
                            } 
                        } 
                    }
                }
            }
        `;

        const response = await fetch(`https://${CONFIG.shopify.domain}/api/2023-10/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': CONFIG.shopify.storefrontAccessToken
            },
            body: JSON.stringify({ query, variables: { handle } })
        });

        const data = await response.json();
        return this.transformShopifyProduct(data.data.product);
    }

    transformShopifyProduct(shopifyProduct) {
        if (!shopifyProduct) return null;

        return {
            id: shopifyProduct.handle,
            handle: shopifyProduct.handle,
            title: shopifyProduct.title,
            vendor: shopifyProduct.vendor,
            productType: shopifyProduct.productType,
            price: Math.round(parseFloat(shopifyProduct.priceRange.minVariantPrice.amount) * 100),
            availableForSale: shopifyProduct.availableForSale,
            totalInventory: shopifyProduct.totalInventory,
            description: shopifyProduct.description,
            images: shopifyProduct.images.edges.map(edge => edge.node),
            variants: shopifyProduct.variants.edges.map(edge => ({
                ...edge.node,
                price: Math.round(parseFloat(edge.node.price.amount) * 100)
            }))
        };
    }

    // ========================================
    // RENDERIZAÇÃO PRINCIPAL
    // ========================================

    async renderProduct() {
        this.updateBreadcrumb();
        this.renderProductInfo();
        this.renderGallery();
        this.renderVariants();
        this.renderPersonalization();
        this.renderSpecifications();
        this.updatePricing();
        this.updateAvailability();
        this.renderRelatedProducts();
        
        // Animar entrada
        await this.delay(100);
        document.getElementById('productDetail').classList.add('loaded');
    }

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumbProduct');
        if (breadcrumb && this.currentProduct) {
            breadcrumb.textContent = this.currentProduct.title;
        }
    }

    renderProductInfo() {
        const { title, vendor, description } = this.currentProduct;
        
        this.updateElement('productTitle', title);
        this.updateElement('productVendor', vendor);
        this.updateElement('productDescription', description);

        // Show personalization badge
        const personalizableBadge = document.getElementById('personalizableBadge');
        if (personalizableBadge && this.currentProduct.metafields?.personalization?.enabled) {
            personalizableBadge.style.display = 'inline-block';
        }
    }

    renderGallery() {
        const { images } = this.currentProduct;
        const mainImage = document.getElementById('mainProductImage');
        const thumbnailContainer = document.getElementById('thumbnailGallery');
        
        if (!images || !images.length) return;

        // Main image
        if (mainImage) {
            const currentImage = images[this.selectedImageIndex];
            mainImage.src = currentImage.url;
            mainImage.alt = currentImage.altText || this.currentProduct.title;
        }

        // Thumbnails
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = '';
            images.forEach((image, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail ${index === this.selectedImageIndex ? 'active' : ''}`;
                thumbnail.innerHTML = `<img src="${image.url}" alt="${image.altText}" loading="lazy">`;
                
                thumbnail.addEventListener('click', () => {
                    this.selectedImageIndex = index;
                    this.renderGallery();
                });
                
                thumbnailContainer.appendChild(thumbnail);
            });
        }

        // Update navigation buttons
        this.updateGalleryNavigation();
    }

    updateGalleryNavigation() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');
        const totalImages = this.currentProduct.images?.length || 0;

        if (prevBtn) {
            prevBtn.disabled = this.selectedImageIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.selectedImageIndex === totalImages - 1;
        }
    }

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
                
                // Check availability
                const isAvailable = this.currentProduct.variants.some(variant => 
                    variant.selectedOptions.some(opt => opt.name === option.name && opt.value === value) &&
                    variant.availableForSale
                );
                
                if (!isAvailable) {
                    optionBtn.classList.add('unavailable');
                    optionBtn.disabled = true;
                }
                
                // Check if selected
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

    selectVariant(optionName, optionValue) {
        // Update visual selection
        const container = document.getElementById(`${optionName.toLowerCase()}Options`);
        if (container) {
            container.querySelectorAll('.variant-option').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.textContent.trim() === optionValue) {
                    btn.classList.add('selected');
                }
            });
        }

        // Find matching variant
        const newVariant = this.currentProduct.variants.find(variant =>
            variant.selectedOptions.some(opt => opt.name === optionName && opt.value === optionValue)
        );

        if (newVariant) {
            this.selectedVariant = newVariant;
            this.updatePricing();
            this.updateAvailability();
            this.updatePersonalizationPreview();
        }
    }

    renderPersonalization() {
        const panel = document.getElementById('personalizationPanel');
        const config = this.currentProduct.metafields?.personalization;
        
        if (!panel) return;

        if (config?.enabled) {
            panel.style.display = 'block';
            this.personalization.enabled = true;
            this.setupPersonalizationOptions(config);
        } else {
            panel.style.display = 'none';
            this.personalization.enabled = false;
        }
    }

    setupPersonalization() {
        const config = this.currentProduct?.metafields?.personalization;
        if (config?.enabled) {
            this.personalization.enabled = true;
        }
    }

    setupPersonalizationOptions(config) {
        // Setup font options
        const fontSelect = document.getElementById('personalizationFont');
        if (fontSelect && config.allowedFonts) {
            fontSelect.innerHTML = '';
            config.allowedFonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font;
                option.textContent = font;
                fontSelect.appendChild(option);
            });
        }

        // Setup color options
        const colorSelect = document.getElementById('personalizationColor');
        if (colorSelect && config.allowedColors) {
            colorSelect.innerHTML = '';
            config.allowedColors.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = this.getColorName(color);
                colorSelect.appendChild(option);
            });
            this.updateColorPreview();
        }

        // Setup position options
        const positionInputs = document.querySelectorAll('input[name="position"]');
        positionInputs.forEach(input => {
            if (config.allowedPositions && !config.allowedPositions.includes(input.value)) {
                input.closest('.position-option').style.display = 'none';
            }
        });

        // Setup character limit
        const textInput = document.getElementById('personalizationText');
        if (textInput && config.maxChars) {
            textInput.maxLength = config.maxChars;
            textInput.placeholder = `Digite seu texto (máximo ${config.maxChars} caracteres)`;
        }

        this.updateCharCount();
    }

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

    // ========================================
    // PREÇOS E DISPONIBILIDADE
    // ========================================

    updatePricing() {
        if (!this.selectedVariant) return;

        const { price, compareAtPrice } = this.selectedVariant;
        const personalizationPrice = this.getPersonalizationPrice();
        const totalPrice = (price + personalizationPrice) * this.quantity;

        // Current price
        this.updateElement('currentPrice', this.formatPrice(price));

        // Compare price and discount
        if (compareAtPrice && compareAtPrice > price) {
            this.updateElement('comparePrice', this.formatPrice(compareAtPrice));
            document.getElementById('comparePrice').style.display = 'inline';
            
            const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
            this.updateElement('discountBadge', `-${discount}%`);
            document.getElementById('discountBadge').style.display = 'inline-block';
        } else {
            document.getElementById('comparePrice').style.display = 'none';
            document.getElementById('discountBadge').style.display = 'none';
        }

        // Personalization price
        const personalizationElement = document.getElementById('personalizationPrice');
        if (personalizationElement) {
            if (personalizationPrice > 0) {
                personalizationElement.textContent = `+ Personalização: ${this.formatPrice(personalizationPrice)}`;
                personalizationElement.style.display = 'block';
            } else {
                personalizationElement.style.display = 'none';
            }
        }

        // Total price
        this.updateElement('totalPrice', this.formatPrice(totalPrice));

        // Update button text
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            const btnText = addToCartBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = `Adicionar ao Carrinho - ${this.formatPrice(totalPrice)}`;
            }
        }
    }

    getPersonalizationPrice() {
        if (this.personalization.enabled && this.personalization.text.trim()) {
            return this.currentProduct?.metafields?.personalization?.price || 0;
        }
        return 0;
    }

    updateAvailability() {
        const availabilityElement = document.getElementById('availability');
        if (!availabilityElement || !this.selectedVariant) return;

        const { availableForSale, quantityAvailable } = this.selectedVariant;
        const addToCartBtn = document.getElementById('addToCartBtn');
        const buyNowBtn = document.getElementById('buyNowBtn');
        const quantityInput = document.getElementById('quantityInput');

        if (availableForSale && quantityAvailable > 0) {
            availabilityElement.innerHTML = `
                <span class="availability-icon">✓</span>
                <span class="availability-text">Em estoque (${quantityAvailable} disponíveis)</span>
            `;
            availabilityElement.className = 'availability in-stock';
            
            // Enable controls
            if (addToCartBtn) addToCartBtn.disabled = false;
            if (buyNowBtn) buyNowBtn.disabled = false;
            if (quantityInput) {
                quantityInput.disabled = false;
                quantityInput.max = quantityAvailable;
            }
        } else {
            availabilityElement.innerHTML = `
                <span class="availability-icon">✗</span>
                <span class="availability-text">Indisponível</span>
            `;
            availabilityElement.className = 'availability out-of-stock';
            
            // Disable controls
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

    updatePersonalizationPreview() {
        const preview = document.getElementById('personalizationPreview');
        if (!preview) return;

        if (this.personalization.text.trim()) {
            preview.style.display = 'block';
            const container = preview.querySelector('.preview-container');
            if (container) {
                container.innerHTML = `
                    <div class="preview-text" style="
                        font-family: ${this.personalization.font};
                        color: ${this.personalization.color};
                        text-align: ${this.personalization.position};
                        background: ${this.personalization.color === '#FFFFFF' ? '#333' : '#f8f9fa'};
                        padding: 1rem;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                    ">
                        "${this.personalization.text}"
                    </div>
                    <div class="preview-info">
                        <strong>Configuração:</strong><br>
                        Fonte: ${this.personalization.font} | 
                        Cor: ${this.getColorName(this.personalization.color)} | 
                        Posição: ${this.getPositionName(this.personalization.position)}
                    </div>
                `;
            }
        } else {
            preview.style.display = 'none';
        }
        
        this.updatePricing();
    }

    updateCharCount() {
        const charCount = document.getElementById('charCount');
        const maxChars = this.currentProduct?.metafields?.personalization?.maxChars || 30;
        
        if (charCount) {
            const current = this.personalization.text.length;
            charCount.textContent = `${current}/${maxChars}`;
            
            charCount.className = 'char-count';
            if (current > maxChars * 0.8) {
                charCount.classList.add(current > maxChars * 0.9 ? 'danger' : 'warning');
            }
        }
    }

    updateColorPreview() {
        const preview = document.getElementById('colorPreview');
        if (preview) {
            preview.style.backgroundColor = this.personalization.color;
        }
    }

    // ========================================
    // CARRINHO E AÇÕES
    // ========================================

    async addToCart() {
        if (this.isLoading) return;
        
        if (!this.selectedVariant || !this.selectedVariant.availableForSale) {
            this.showNotification('Produto indisponível', 'error');
            return;
        }

        if (this.quantity > this.selectedVariant.quantityAvailable) {
            this.showNotification('Quantidade solicitada não disponível', 'error');
            return;
        }

        const cartItem = this.buildCartItem();
        
        try {
            this.setButtonLoading('addToCartBtn', true);
            
            await this.delay(800); // Simular processamento
            
            const success = this.addItemToCart(cartItem);
            
            if (success) {
                this.showNotification('Produto adicionado ao carrinho!', 'success');
                this.updateCartBadge();
                
                setTimeout(() => {
                    this.showCartModal();
                }, 1000);
            } else {
                this.showNotification('Erro ao adicionar produto ao carrinho', 'error');
            }

        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            this.showNotification('Erro ao adicionar produto ao carrinho', 'error');
        } finally {
            this.setButtonLoading('addToCartBtn', false);
        }
    }

    buildCartItem() {
        const basePrice = this.selectedVariant.price;
        const personalizationPrice = this.getPersonalizationPrice();
        
        const cartItem = {
            id: `${this.currentProduct.handle}-${this.selectedVariant.id}-${Date.now()}`,
            handle: this.currentProduct.handle,
            variantId: this.selectedVariant.id,
            name: this.currentProduct.title,
            basePrice: basePrice,
            image: this.currentProduct.images[0]?.url,
            quantity: this.quantity,
            variant: {
                id: this.selectedVariant.id,
                title: this.selectedVariant.title,
                size: this.getSelectedOptionValue('Tamanho'),
                color: this.getSelectedOptionValue('Cor')
            }
        };

        // Add personalization if configured
        if (this.personalization.enabled && this.personalization.text.trim()) {
            cartItem.personalization = {
                text: this.personalization.text,
                font: this.personalization.font,
                color: this.personalization.color,
                position: this.personalization.position
            };
            cartItem.personalizationPrice = personalizationPrice;
        }

        return cartItem;
    }

    addItemToCart(cartItem) {
        try {
            const cart = this.loadCart();
            
            // Check for existing item
            const existingItemIndex = cart.items.findIndex(item => 
                item.handle === cartItem.handle &&
                item.variantId === cartItem.variantId &&
                JSON.stringify(item.personalization) === JSON.stringify(cartItem.personalization)
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += cartItem.quantity;
            } else {
                cart.items.push(cartItem);
            }

            this.saveCart(cart);
            return true;
        } catch (error) {
            console.error('Erro ao adicionar item ao carrinho:', error);
            return false;
        }
    }

    async buyNow() {
        await this.addToCart();
        setTimeout(() => {
            window.location.href = '../paginas/carrinho.html';
        }, 1500);
    }

    // ========================================
    // PRODUTOS RELACIONADOS
    // ========================================

    renderRelatedProducts() {
        const container = document.getElementById('relatedProductsGrid');
        if (!container) return;

        // Filter out current product
        const currentProductId = this.currentProduct.id;
        const relatedProducts = RELATED_PRODUCTS.filter(product => product.id !== currentProductId);

        container.innerHTML = '';
        
        relatedProducts.slice(0, 3).forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'related-product';
            productElement.innerHTML = `
                <div class="related-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="related-info">
                    <h4 class="related-name">${product.name}</h4>
                    <div class="related-price">${this.formatPrice(product.price)}</div>
                    <a href="produto-individual.html?id=${product.handle}" class="btn-secondary btn-small">
                        Ver Produto
                        <span>→</span>
                    </a>
                </div>
            `;
            container.appendChild(productElement);
        });
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // Quantity controls
        this.setupQuantityControls();
        
        // Action buttons
        this.setupActionButtons();
        
        // Gallery navigation
        this.setupGalleryNavigation();
        
        // Personalization controls
        this.setupPersonalizationListeners();
        
        // Cart badge update
        this.updateCartBadge();
    }

    setupQuantityControls() {
        const quantityInput = document.getElementById('quantityInput');
        const quantityMinus = document.getElementById('quantityMinus');
        const quantityPlus = document.getElementById('quantityPlus');

        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                this.quantity = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
                e.target.value = this.quantity;
                this.updatePricing();
            });
        }

        if (quantityMinus) {
            quantityMinus.addEventListener('click', () => {
                this.quantity = Math.max(1, this.quantity - 1);
                if (quantityInput) quantityInput.value = this.quantity;
                this.updatePricing();
            });
        }

        if (quantityPlus) {
            quantityPlus.addEventListener('click', () => {
                const maxQty = this.selectedVariant?.quantityAvailable || 99;
                this.quantity = Math.min(maxQty, this.quantity + 1);
                if (quantityInput) quantityInput.value = this.quantity;
                this.updatePricing();
            });
        }
    }

    setupActionButtons() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        const buyNowBtn = document.getElementById('buyNowBtn');

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addToCart();
            });
        }

        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.buyNow();
            });
        }
    }

    setupGalleryNavigation() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.selectedImageIndex > 0) {
                    this.selectedImageIndex--;
                    this.renderGallery();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const maxIndex = (this.currentProduct?.images?.length || 1) - 1;
                if (this.selectedImageIndex < maxIndex) {
                    this.selectedImageIndex++;
                    this.renderGallery();
                }
            });
        }
    }

    setupPersonalizationListeners() {
        const textInput = document.getElementById('personalizationText');
        const fontSelect = document.getElementById('personalizationFont');
        const colorSelect = document.getElementById('personalizationColor');
        const positionInputs = document.querySelectorAll('input[name="position"]');

        if (textInput) {
            textInput.addEventListener('input', (e) => {
                this.personalization.text = e.target.value;
                this.updateCharCount();
                this.updatePersonalizationPreview();
            });
        }

        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                this.personalization.font = e.target.value;
                this.updatePersonalizationPreview();
            });
        }

        if (colorSelect) {
            colorSelect.addEventListener('change', (e) => {
                this.personalization.color = e.target.value;
                this.updateColorPreview();
                this.updatePersonalizationPreview();
            });
        }

        positionInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.personalization.position = e.target.value;
                this.updatePersonalizationPreview();
            });
        });
    }

    // ========================================
    // IMAGE ZOOM E TABS
    // ========================================

    setupImageZoom() {
        const mainImage = document.getElementById('mainProductImage');
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

        // Keyboard support for zoom modal
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

    closeImageZoom() {
        const modal = document.getElementById('imageZoomModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    navigateZoomImage(direction) {
        const totalImages = this.currentProduct?.images?.length || 0;
        if (totalImages <= 1) return;

        if (direction > 0 && this.selectedImageIndex < totalImages - 1) {
            this.selectedImageIndex++;
        } else if (direction < 0 && this.selectedImageIndex > 0) {
            this.selectedImageIndex--;
        }

        this.renderGallery();
        this.openImageZoom(); // Update zoom modal image
    }

    setupTabs() {
        const tabHeaders = document.querySelectorAll('.tab-header');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetTab = header.dataset.tab;
                
                // Remove active from all
                tabHeaders.forEach(h => h.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));
                
                // Add active to clicked
                header.classList.add('active');
                const targetPanel = document.getElementById(`tab-${targetTab}`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // ========================================
    // CART E STORAGE
    // ========================================

    loadCart() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            return saved ? JSON.parse(saved) : { items: [], timestamp: Date.now() };
        } catch (error) {
            console.warn('Erro ao carregar carrinho:', error);
            return { items: [], timestamp: Date.now() };
        }
    }

    saveCart(cart) {
        try {
            cart.timestamp = Date.now();
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart));
            
            // Dispatch event for other pages
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: cart }
            }));
        } catch (error) {
            console.error('Erro ao salvar carrinho:', error);
        }
    }

    updateCartBadge() {
        try {
            const cart = this.loadCart();
            const count = cart.items.reduce((total, item) => total + item.quantity, 0);
            
            const badge = document.getElementById('headerCartBadge');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline' : 'none';
            }

            // Update global cart system if available
            if (window.cartSystem) {
                window.cartSystem.updateCartDisplay();
            }
        } catch (error) {
            console.error('Erro ao atualizar badge do carrinho:', error);
        }
    }

    // ========================================
    // MODALS E NOTIFICAÇÕES
    // ========================================

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

        // Styles
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

        const modalActions = modal.querySelector('.modal-actions');
        Object.assign(modalActions.style, {
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            justifyContent: 'center'
        });

        const closeBtn = modal.querySelector('.close-btn');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#999'
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

        // Auto close after 8 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 8000);
    }

    showNotification(message, type = 'info') {
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

        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '1rem 1.5rem',
            background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : 'var(--primary)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            fontSize: '0.9rem',
            fontWeight: '500'
        });

        document.body.appendChild(notification);

        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // ========================================
    // UTILITIES
    // ========================================

    getSelectedOptionValue(optionName) {
        return this.selectedVariant?.selectedOptions?.find(
            opt => opt.name === optionName
        )?.value || '';
    }

    getColorName(colorCode) {
        const colorNames = {
            '#FFFFFF': 'Branco',
            '#000000': 'Preto',
            '#FFD700': 'Dourado',
            '#C0C0C0': 'Prata'
        };
        return colorNames[colorCode] || colorCode;
    }

    getPositionName(position) {
        const positionNames = {
            'center': 'Centro',
            'bottom': 'Inferior',
            'side': 'Lateral'
        };
        return positionNames[position] || position;
    }

    formatPrice(priceInCents) {
        return (priceInCents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

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
            
            // Restore button text
            this.updatePricing();
        }
    }

    showMainLoading(show) {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            if (show) {
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
        }
    }

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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.modernProductManager = new ModernProductManager();
    });
} else {
    window.modernProductManager = new ModernProductManager();
}

// ========================================
// ESTILOS CSS PARA COMPONENTES DINÂMICOS
// ========================================

if (!document.querySelector('#modern-product-styles')) {
    const style = document.createElement('style');
    style.id = 'modern-product-styles';
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

        .modal-header h3 {
            color: var(--primary);
            margin-bottom: 0;
        }

        .modal-body p {
            color: var(--text-light);
            margin-bottom: 1.5rem;
        }

        .error-content h2 {
            color: var(--primary);
            margin-bottom: 1rem;
        }

        .error-content p {
            color: var(--text-light);
            margin-bottom: 2rem;
        }

        .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn-small {
            padding: 0.8rem 1.5rem;
            font-size: 0.9rem;
        }

        .close-btn:hover {
            color: var(--primary);
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// FUNÇÕES GLOBAIS PARA COMPATIBILIDADE
// ========================================

window.addProductToCart = function(productData) {
    try {
        const cart = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{"items":[]}');
        
        const existingItem = cart.items.find(item => 
            item.id === productData.id
        );

        if (existingItem) {
            existingItem.quantity += productData.quantity || 1;
        } else {
            cart.items.push({
                ...productData,
                quantity: productData.quantity || 1,
                timestamp: Date.now()
            });
        }

        localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart));
        
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart: cart }
        }));

        return true;
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        return false;
    }
};

window.getCartCount = function() {
    try {
        const cart = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{"items":[]}');
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
        return 0;
    }
};

// Export for global access
window.ModernProductManager = ModernProductManager;

console.log('Modern Product Manager inicializado completamente');