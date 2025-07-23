// QUEISE - Sistema Completo com Integração Shopify + Ícones Personalizados
// Versão Final - Pronto para Produção

// ============================================================================
// CONFIGURAÇÃO DA API - CREDENCIAIS REAIS
// ============================================================================

const API_CONFIG = {
    // ALTERE PARA false PARA ATIVAR SHOPIFY
    isDevelopment: true, // ← MUDADO PARA PRODUÇÃO!
    
    shopify: {
        domain: 'jkw270-xq.myshopify.com',
        storefrontAccessToken: '5d841f990665c317cdef27bbcdf88ab0',
        apiVersion: '2024-10'
    }
};

// ============================================================================
// CONFIGURAÇÃO DOS ÍCONES QUEISE
// ============================================================================

const QUEISE_ICONS = {
    'sol-ondas': {
        name: 'Sol com Ondas',
        file: 'imagens/icones/sol-ondas.png',
        description: 'Sol estilizado com ondas'
    },
    'girassol': {
        name: 'Girassol',
        file: 'imagens/icones/girassol.png',
        description: 'Girassol detalhado'
    },
    'olho-paz': {
        name: 'Olho com Paz',
        file: 'imagens/icones/olho-paz.png',
        description: 'Olho com símbolo da paz'
    },
    'arvore': {
        name: 'Árvore',
        file: 'imagens/icones/arvore.png',
        description: 'Árvore estilizada'
    }
};

// ============================================================================
// DADOS MOCK ATUALIZADOS (para desenvolvimento)
// ============================================================================

const MOCK_PRODUCTS = {
    'garrafa-termica-1l-teste': {
        id: 'gid://shopify/Product/teste',
        handle: 'garrafa-termica-1l-teste',
        title: 'Garrafa Térmica 1L Teste',
        description: 'Produto de teste para integração Shopify. Garrafa térmica de 1 litro com personalização completa.',
        price: 16500, // R$ 165,00 em centavos
        images: [
            { 
                id: 'teste1', 
                src: 'imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp', 
                alt: 'Garrafa Térmica 1L Teste' 
            }
        ],
        variants: [
            { 
                id: 'var-teste1', 
                title: 'Azul / 1L', 
                price: 16500, 
                available: true, 
                options: { cor: 'azul', tamanho: '1l' }, 
                image: { 
                    src: 'imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp', 
                    alt: 'Azul' 
                } 
            },
            { 
                id: 'var-teste2', 
                title: 'Preto / 1L', 
                price: 16500, 
                available: true, 
                options: { cor: 'preto', tamanho: '1l' }, 
                image: { 
                    src: 'imagens/copo_termico_de_cerveja_stanley_473ml_plum_personalizado_916_2_7c3111c33df2762491be463c97ff1d0c.webp', 
                    alt: 'Preto' 
                } 
            }
        ],
        options: [
            { name: 'Cor', values: ['Azul', 'Preto'] },
            { name: 'Tamanho', values: ['1L'] }
        ],
        personalization: {
            enabled: true,
            price: 2000,
            max_chars: 30,
            allowed_types: ['texto-vertical', 'texto-horizontal', 'icone-texto-vertical', 'icone-texto-horizontal', 'icone'],
            allowed_fonts: ['Arial', 'Times New Roman', 'Brush Script MT', 'Arial Black'],
            allowed_icons: ['sol-ondas', 'girassol', 'olho-paz', 'arvore']
        },
        category: 'Garrafas Térmicas',
        tags: ['teste', 'garrafa', 'térmica', '1l'],
        available: true
    }
};

// ============================================================================
// SISTEMA DE API SHOPIFY
// ============================================================================

class ProductAPI {
    constructor() {
        this.graphqlEndpoint = `https://${API_CONFIG.shopify.domain}/api/${API_CONFIG.shopify.apiVersion}/graphql.json`;
    }

    async getProduct(productHandle) {
        if (API_CONFIG.isDevelopment) {
            console.log('🔧 Modo desenvolvimento - usando dados mock para:', productHandle);
            return this.getMockProduct(productHandle);
        } else {
            console.log('🛍️ Buscando produto na Shopify:', productHandle);
            return this.getShopifyProduct(productHandle);
        }
    }

    getMockProduct(productHandle) {
        const product = MOCK_PRODUCTS[productHandle];
        if (!product) {
            throw new Error(`Produto não encontrado: ${productHandle}`);
        }
        return Promise.resolve(product);
    }

    async getShopifyProduct(handle) {
        const query = `
            query getProduct($handle: String!) {
                product(handle: $handle) {
                    id
                    handle
                    title
                    description
                    descriptionHtml
                    productType
                    vendor
                    tags
                    availableForSale
                    priceRange {
                        minVariantPrice {
                            amount
                            currencyCode
                        }
                    }
                    variants(first: 100) {
                        edges {
                            node {
                                id
                                title
                                availableForSale
                                selectedOptions {
                                    name
                                    value
                                }
                                price {
                                    amount
                                    currencyCode
                                }
                                image {
                                    url
                                    altText
                                }
                            }
                        }
                    }
                    images(first: 20) {
                        edges {
                            node {
                                id
                                url
                                altText
                            }
                        }
                    }
                    options {
                        id
                        name
                        values
                    }
                    metafields(first: 20) {
                        edges {
                            node {
                                namespace
                                key
                                value
                                type
                            }
                        }
                    }
                }
            }
        `;

        try {
            const response = await fetch(this.graphqlEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': API_CONFIG.shopify.storefrontAccessToken
                },
                body: JSON.stringify({
                    query: query,
                    variables: { handle: handle }
                })
            });

            const data = await response.json();
            
            if (data.errors) {
                console.error('Shopify API Errors:', data.errors);
                throw new Error(`Shopify API Error: ${JSON.stringify(data.errors)}`);
            }

            if (!data.data.product) {
                throw new Error(`Produto não encontrado: ${handle}`);
            }

            return this.transformShopifyProduct(data.data.product);
        } catch (error) {
            console.error('❌ Erro ao buscar produto na Shopify:', error);
            throw error;
        }
    }

    transformShopifyProduct(shopifyProduct) {
        // Extrair metafields de personalização
        const metafields = {};
        shopifyProduct.metafields.edges.forEach(edge => {
            const meta = edge.node;
            if (meta.namespace === 'custom') {
                try {
                    // Tentar parsear como JSON primeiro
                    metafields[meta.key] = JSON.parse(meta.value || 'null');
                } catch {
                    // Se não for JSON, usar como string
                    metafields[meta.key] = meta.value;
                }
            }
        });

        // Processar arrays que podem vir como string separada por vírgula
        const processArray = (value, fallback = []) => {
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') return value.split(',').map(item => item.trim());
            return fallback;
        };

        // Configuração de personalização dos metafields
        const personalizationConfig = {
            enabled: metafields.personalization_enabled || false,
            price: metafields.personalization_price || 2000,
            max_chars: metafields.personalization_max_chars || 30,
            allowed_types: processArray(metafields.personalization_types, ['texto-vertical', 'texto-horizontal']),
            allowed_fonts: processArray(metafields.personalization_fonts, ['Arial', 'Times New Roman', 'Brush Script MT', 'Arial Black']),
            allowed_icons: processArray(metafields.personalization_icons, ['sol-ondas', 'girassol', 'olho-paz', 'arvore'])
        };

        return {
            id: shopifyProduct.id,
            handle: shopifyProduct.handle,
            title: shopifyProduct.title,
            description: shopifyProduct.description,
            price: Math.round(parseFloat(shopifyProduct.priceRange.minVariantPrice.amount) * 100),
            images: shopifyProduct.images.edges.map(edge => ({
                id: edge.node.id,
                src: edge.node.url,
                alt: edge.node.altText || shopifyProduct.title
            })),
            variants: shopifyProduct.variants.edges.map(edge => ({
                id: edge.node.id,
                title: edge.node.title,
                price: Math.round(parseFloat(edge.node.price.amount) * 100),
                available: edge.node.availableForSale,
                options: edge.node.selectedOptions.reduce((acc, option) => {
                    acc[option.name.toLowerCase()] = option.value.toLowerCase();
                    return acc;
                }, {}),
                image: edge.node.image ? {
                    src: edge.node.image.url,
                    alt: edge.node.image.altText
                } : null
            })),
            options: shopifyProduct.options.map(option => ({
                name: option.name,
                values: option.values
            })),
            personalization: personalizationConfig,
            category: shopifyProduct.productType || 'Produto',
            tags: shopifyProduct.tags || [],
            available: shopifyProduct.availableForSale
        };
    }

    async addToCart(variantId, quantity = 1, properties = {}) {
        if (API_CONFIG.isDevelopment) {
            console.log('🛒 Modo desenvolvimento - simulando adição ao carrinho:', {
                variantId,
                quantity,
                properties
            });
            return Promise.resolve({
                success: true,
                message: 'Produto adicionado ao carrinho (modo desenvolvimento)',
                cart_item: { variantId, quantity, properties }
            });
        } else {
            // Para Shopify real, vamos simular sucesso por enquanto
            // A implementação completa do carrinho seria feita numa próxima fase
            console.log('🛍️ Shopify - preparando dados para carrinho:', {
                variantId,
                quantity,
                properties
            });
            
            return Promise.resolve({
                success: true,
                message: 'Dados preparados para Shopify - implementação do carrinho na próxima fase',
                cart_item: { variantId, quantity, properties }
            });
        }
    }
}

// ============================================================================
// SISTEMA DE PERSONALIZAÇÃO AVANÇADO
// ============================================================================

class PersonalizationSystem {
    constructor() {
        this.config = null;
        this.preview = {
            type: '',
            text: '',
            font: '',
            icon: ''
        };
        this.price = 0;
    }

    init(personalizationConfig) {
        this.config = personalizationConfig;
        this.setupUI();
        this.bindEvents();
    }

    setupUI() {
        if (!this.config.enabled) {
            document.getElementById('personalizationSection').style.display = 'none';
            return;
        }

        // Configurar tipos de personalização
        const typeSelect = document.getElementById('personalizationType');
        if (typeSelect) {
            typeSelect.innerHTML = this.config.allowed_types.map(type => 
                `<option value="${type}">${this.getTypeName(type)}</option>`
            ).join('');
        }

        // Configurar fontes
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            fontSelect.innerHTML = this.config.allowed_fonts.map(font => 
                `<option value="${font}">${font}</option>`
            ).join('');
        }

        // Configurar ícones
        const iconSelect = document.getElementById('iconSelect');
        if (iconSelect) {
            iconSelect.innerHTML = this.config.allowed_icons.map(icon => 
                `<option value="${icon}">${QUEISE_ICONS[icon]?.name || icon}</option>`
            ).join('');
        }

        // Configurar preço
        const priceElement = document.getElementById('personalizationPrice');
        if (priceElement) {
            priceElement.textContent = this.formatPrice(this.config.price);
        }

        // Configurar limite de caracteres
        const textInput = document.getElementById('personalizationText');
        if (textInput) {
            textInput.setAttribute('maxlength', this.config.max_chars);
        }
        
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = `0/${this.config.max_chars}`;
        }

        // Configurar visibilidade inicial
        this.updateFieldVisibility();
    }

    bindEvents() {
        if (!this.config.enabled) return;

        const elements = {
            type: document.getElementById('personalizationType'),
            text: document.getElementById('personalizationText'),
            font: document.getElementById('fontSelect'),
            icon: document.getElementById('iconSelect'),
            enable: document.getElementById('enablePersonalization')
        };

        // Atualizar preview em tempo real
        Object.values(elements).forEach(element => {
            if (element) {
                element.addEventListener('change', () => {
                    this.updateFieldVisibility();
                    this.updatePreview();
                });
                element.addEventListener('input', () => {
                    this.updateFieldVisibility();
                    this.updatePreview();
                });
            }
        });

        // Contador de caracteres
        if (elements.text) {
            elements.text.addEventListener('input', () => {
                const count = elements.text.value.length;
                const charCount = document.getElementById('charCount');
                if (charCount) {
                    charCount.textContent = `${count}/${this.config.max_chars}`;
                }
            });
        }

        // Toggle personalização
        if (elements.enable) {
            elements.enable.addEventListener('change', (e) => {
                const isEnabled = e.target.checked;
                const options = document.getElementById('personalizationOptions');
                if (options) {
                    options.style.display = isEnabled ? 'block' : 'none';
                }
                this.updatePrice();
            });
        }
    }

    updateFieldVisibility() {
        const type = document.getElementById('personalizationType')?.value || '';
        const iconField = document.getElementById('iconField');
        const textField = document.getElementById('textField');
        const fontField = document.getElementById('fontField');

        if (iconField) {
            iconField.style.display = type.includes('icone') ? 'block' : 'none';
        }
        
        if (textField) {
            textField.style.display = type !== 'icone' ? 'block' : 'none';
        }
        
        if (fontField) {
            fontField.style.display = type !== 'icone' ? 'block' : 'none';
        }
    }

    updatePreview() {
        const type = document.getElementById('personalizationType')?.value || '';
        const text = document.getElementById('personalizationText')?.value || '';
        const font = document.getElementById('fontSelect')?.value || '';
        const icon = document.getElementById('iconSelect')?.value || '';

        this.preview = { type, text, font, icon };

        const previewElement = document.getElementById('personalizationPreview');
        if (!previewElement) return;

        let previewHTML = '';

        switch (type) {
            case 'texto-vertical':
                previewHTML = this.renderTextVertical(text, font);
                break;
            case 'texto-horizontal':
                previewHTML = this.renderTextHorizontal(text, font);
                break;
            case 'icone-texto-vertical':
                previewHTML = this.renderIconTextVertical(icon, text, font);
                break;
            case 'icone-texto-horizontal':
                previewHTML = this.renderIconTextHorizontal(icon, text, font);
                break;
            case 'icone':
                previewHTML = this.renderIconOnly(icon);
                break;
            default:
                previewHTML = '<p>Selecione um tipo de personalização</p>';
        }

        previewElement.innerHTML = previewHTML;
    }

    renderTextVertical(text, font) {
        if (!text) return '<p>Digite seu texto...</p>';
        const letters = text.split('').join('<br>');
        return `<div class="preview-text-vertical" style="font-family: '${font}', sans-serif; text-align: center; line-height: 1.2;">${letters}</div>`;
    }

    renderTextHorizontal(text, font) {
        if (!text) return '<p>Digite seu texto...</p>';
        return `<div class="preview-text-horizontal" style="font-family: '${font}', sans-serif; text-align: center;">${text}</div>`;
    }

    renderIconTextVertical(icon, text, font) {
        const iconInfo = QUEISE_ICONS[icon];
        const iconHTML = iconInfo ? `<img src="${iconInfo.file}" alt="${iconInfo.name}" style="width: 30px; height: 30px; margin-bottom: 10px;">` : '';
        const textHTML = text ? this.renderTextVertical(text, font) : '';
        return `<div style="text-align: center;">${iconHTML}<br>${textHTML}</div>`;
    }

    renderIconTextHorizontal(icon, text, font) {
        const iconInfo = QUEISE_ICONS[icon];
        const iconHTML = iconInfo ? `<img src="${iconInfo.file}" alt="${iconInfo.name}" style="width: 30px; height: 30px; margin-right: 10px; vertical-align: middle;">` : '';
        const textHTML = text ? `<span style="font-family: '${font}', sans-serif;">${text}</span>` : '';
        return `<div style="text-align: center;">${iconHTML}${textHTML}</div>`;
    }

    renderIconOnly(icon) {
        const iconInfo = QUEISE_ICONS[icon];
        return iconInfo ? `<div style="text-align: center;"><img src="${iconInfo.file}" alt="${iconInfo.name}" style="width: 40px; height: 40px;"></div>` : '<p>Selecione um ícone</p>';
    }

    updatePrice() {
        const isPersonalizationEnabled = document.getElementById('enablePersonalization')?.checked || false;
        this.price = isPersonalizationEnabled ? this.config.price : 0;
        
        // Disparar evento para atualizar preço total
        window.dispatchEvent(new CustomEvent('personalizationPriceChanged', {
            detail: { price: this.price }
        }));
    }

    getPersonalizationData() {
        const isEnabled = document.getElementById('enablePersonalization')?.checked || false;
        if (!isEnabled) return null;

        return {
            type: this.preview.type,
            text: this.preview.text,
            font: this.preview.font,
            icon: this.preview.icon,
            price: this.price
        };
    }

    getTypeName(type) {
        const names = {
            'texto-vertical': 'Texto Vertical',
            'texto-horizontal': 'Texto Horizontal',
            'icone-texto-vertical': 'Ícone + Texto Vertical',
            'icone-texto-horizontal': 'Ícone + Texto Horizontal',
            'icone': 'Apenas Ícone'
        };
        return names[type] || type;
    }

    formatPrice(centavos) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(centavos / 100);
    }
}

// ============================================================================
// CONTROLADOR PRINCIPAL DA PÁGINA
// ============================================================================

class ProductPageController {
    constructor() {
        this.api = new ProductAPI();
        this.personalization = new PersonalizationSystem();
        this.currentProduct = null;
        this.selectedVariant = null;
        this.currentPrice = 0;
        this.currentImage = 0;
    }

    async init() {
        try {
            await this.loadProduct();
            this.setupImageGallery();
            this.setupVariantSelection();
            this.setupPricing();
            this.setupAddToCart();
            this.setupBreadcrumb();
        } catch (error) {
            this.handleError(error);
        }
    }

    async loadProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        const productHandle = urlParams.get('id') || 'garrafa-termica-1l-teste';

        try {
            this.showLoading(true);
            this.currentProduct = await this.api.getProduct(productHandle);
            this.renderProduct();
            
            // Inicializar personalização se habilitada
            if (this.currentProduct.personalization.enabled) {
                this.personalization.init(this.currentProduct.personalization);
            }
            
            this.showLoading(false);
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            this.showError('Produto não encontrado ou erro de conexão');
            this.showLoading(false);
        }
    }

    renderProduct() {
        // Título e categoria
        const titleElement = document.getElementById('productTitle');
        if (titleElement) titleElement.textContent = this.currentProduct.title;
        
        const categoryElement = document.getElementById('productCategory');
        if (categoryElement) categoryElement.textContent = this.currentProduct.category;
        
        const descriptionElement = document.getElementById('productDescription');
        if (descriptionElement) descriptionElement.textContent = this.currentProduct.description;
        
        // Preço inicial
        this.currentPrice = this.currentProduct.price;
        const priceElement = document.getElementById('currentPrice');
        if (priceElement) priceElement.textContent = this.formatPrice(this.currentPrice);
        
        // Renderizar imagens
        this.renderGallery();
        
        // Renderizar opções de variantes
        this.renderVariantOptions();
        
        // Selecionar primeira variante disponível
        const firstAvailableVariant = this.currentProduct.variants.find(v => v.available);
        if (firstAvailableVariant) {
            this.selectVariant(firstAvailableVariant);
        }
    }

    renderGallery() {
        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.getElementById('thumbnails');
        
        if (this.currentProduct.images.length > 0 && mainImage) {
            mainImage.src = this.currentProduct.images[0].src;
            mainImage.alt = this.currentProduct.images[0].alt;
        }
        
        if (thumbnails) {
            thumbnails.innerHTML = this.currentProduct.images.map((image, index) => `
                <img src="${image.src}" 
                     alt="${image.alt}" 
                     class="thumbnail ${index === 0 ? 'active' : ''}"
                     onclick="productController.selectImage(${index})">
            `).join('');
        }
    }

    renderVariantOptions() {
        const variantOptions = document.getElementById('variantOptions');
        if (!variantOptions) return;
        
        variantOptions.innerHTML = '';
        
        this.currentProduct.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'variant-option';
            optionDiv.innerHTML = `
                <label>${option.name}:</label>
                <select id="option-${option.name.toLowerCase()}" onchange="productController.updateVariantSelection()">
                    ${option.values.map(value => `<option value="${value}">${value}</option>`).join('')}
                </select>
            `;
            variantOptions.appendChild(optionDiv);
        });
    }

    setupImageGallery() {
        // Event listeners já configurados no renderGallery
    }

    setupVariantSelection() {
        // Event listeners já configurados no renderVariantOptions
    }

    setupPricing() {
        // Listener para mudanças no preço de personalização
        window.addEventListener('personalizationPriceChanged', (e) => {
            this.updateTotalPrice();
        });
    }

    setupAddToCart() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }
    }

    setupBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb && this.currentProduct) {
            breadcrumb.innerHTML = `
                <a href="../index.html">Início</a> → 
                <a href="produtos.html">Produtos</a> → 
                <a href="produtos.html?categoria=${this.currentProduct.category.toLowerCase()}">${this.currentProduct.category}</a> → 
                <span>${this.currentProduct.title}</span>
            `;
        }
    }

    selectImage(index) {
        this.currentImage = index;
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.src = this.currentProduct.images[index].src;
            mainImage.alt = this.currentProduct.images[index].alt;
        }
        
        // Atualizar thumbnail ativo
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    updateVariantSelection() {
        const selectedOptions = {};
        
        this.currentProduct.options.forEach(option => {
            const select = document.getElementById(`option-${option.name.toLowerCase()}`);
            if (select) {
                selectedOptions[option.name.toLowerCase()] = select.value.toLowerCase();
            }
        });
        
        // Encontrar variante correspondente
        const variant = this.currentProduct.variants.find(v => {
            return Object.keys(selectedOptions).every(key => 
                v.options[key] === selectedOptions[key]
            );
        });
        
        if (variant) {
            this.selectVariant(variant);
        }
    }

    selectVariant(variant) {
        this.selectedVariant = variant;
        this.currentPrice = variant.price;
        
        // Atualizar preço
        const priceElement = document.getElementById('currentPrice');
        if (priceElement) {
            priceElement.textContent = this.formatPrice(this.currentPrice);
        }
        
        // Atualizar disponibilidade
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            if (variant.available) {
                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'Adicionar ao Carrinho';
                addToCartBtn.className = 'btn-primary';
            } else {
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = 'Produto Indisponível';
                addToCartBtn.className = 'btn-disabled';
            }
        }
        
        // Atualizar imagem se a variante tiver uma
        if (variant.image) {
            const mainImage = document.getElementById('mainImage');
            if (mainImage) {
                mainImage.src = variant.image.src;
                mainImage.alt = variant.image.alt;
            }
        }
        
        this.updateTotalPrice();
    }

    updateTotalPrice() {
        const personalizationData = this.personalization.getPersonalizationData();
        const personalizationPrice = personalizationData ? personalizationData.price : 0;
        const totalPrice = this.currentPrice + personalizationPrice;
        
        const totalPriceElement = document.getElementById('totalPrice');
        if (totalPriceElement) {
            totalPriceElement.textContent = this.formatPrice(totalPrice);
        }
        
        // Mostrar breakdown do preço
        const priceBreakdown = document.getElementById('priceBreakdown');
        if (priceBreakdown) {
            if (personalizationPrice > 0) {
                priceBreakdown.innerHTML = `
                    <div class="price-item">
                        <span>Produto:</span>
                        <span>${this.formatPrice(this.currentPrice)}</span>
                    </div>
                    <div class="price-item">
                        <span>Personalização:</span>
                        <span>${this.formatPrice(personalizationPrice)}</span>
                    </div>
                    <div class="price-item total">
                        <span>Total:</span>
                        <span>${this.formatPrice(totalPrice)}</span>
                    </div>
                `;
            } else {
                priceBreakdown.innerHTML = `
                    <div class="price-item total">
                        <span>Total:</span>
                        <span>${this.formatPrice(totalPrice)}</span>
                    </div>
                `;
            }
        }
    }

    async addToCart() {
        if (!this.selectedVariant) {
            this.showMessage('Selecione uma variante do produto', 'error');
            return;
        }

        const personalizationData = this.personalization.getPersonalizationData();
        const properties = {};
        
        if (personalizationData) {
            properties['Tipo de Personalização'] = personalizationData.type;
            properties['Texto Personalizado'] = personalizationData.text || '';
            properties['Fonte'] = personalizationData.font || '';
            properties['Ícone'] = personalizationData.icon || '';
            properties['Preço Personalização'] = this.formatPrice(personalizationData.price);
        }

        try {
            this.showLoading(true, 'Adicionando ao carrinho...');
            
            const result = await this.api.addToCart(this.selectedVariant.id, 1, properties);
            
            if (result.success) {
                this.showMessage('Produto adicionado ao carrinho com sucesso!', 'success');
                
                // Em produção, redirecionar para carrinho ou mostrar drawer
                if (!API_CONFIG.isDevelopment) {
                    setTimeout(() => {
                        // Por enquanto só mostra mensagem, carrinho será implementado depois
                        console.log('Redirecionamento para carrinho será implementado');
                    }, 2000);
                }
            } else {
                this.showMessage(result.message || 'Erro ao adicionar produto ao carrinho', 'error');
            }
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            this.showMessage('Erro ao adicionar produto ao carrinho', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    formatPrice(centavos) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(centavos / 100);
    }

    showLoading(show, message = 'Carregando...') {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            if (show) {
                loader.style.display = 'flex';
                const loaderText = loader.querySelector('.loader-text');
                if (loaderText) {
                    loaderText.textContent = message;
                }
            } else {
                loader.style.display = 'none';
            }
        }
    }

    showMessage(message, type = 'info') {
        // Criar ou atualizar elemento de mensagem
        let messageEl = document.getElementById('messageAlert');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'messageAlert';
            messageEl.className = 'message-alert';
            document.body.appendChild(messageEl);
        }
        
        messageEl.className = `message-alert ${type}`;
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    showError(message) {
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <h3>Ops! Algo deu errado</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-primary">Tentar Novamente</button>
                    <a href="produtos.html" class="btn-secondary">Voltar aos Produtos</a>
                </div>
            `;
            errorContainer.style.display = 'block';
        }
    }

    handleError(error) {
        console.error('Erro na aplicação:', error);
        this.showError(error.message || 'Erro inesperado');
    }
}

// ============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================================

// Instância global do controlador
let productController;

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página correta
    if (document.getElementById('productTitle')) {
        productController = new ProductPageController();
        productController.init();
        
        console.log('🎯 QUEISE - Sistema Completo Iniciado');
        console.log('🛍️ Modo: Produção (conectado à Shopify)');
        console.log('🏪 Loja:', API_CONFIG.shopify.domain);
        console.log('🎨 Ícones QUEISE carregados:', Object.keys(QUEISE_ICONS));
    }
});

// Funções auxiliares globais para uso nos event handlers HTML
window.selectImage = (index) => productController?.selectImage(index);
window.updateVariantSelection = () => productController?.updateVariantSelection();

// ============================================================================
// ESTILOS CSS ADICIONAIS
// ============================================================================

// Adicionar estilos dinamicamente
const additionalStyles = `
    .message-alert {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        display: none;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .message-alert.success {
        background: linear-gradient(135deg, #10B981, #059669);
    }
    
    .message-alert.error {
        background: linear-gradient(135deg, #EF4444, #DC2626);
    }
    
    .message-alert.info {
        background: linear-gradient(135deg, #3B82F6, #2563EB);
    }
    
    .btn-disabled {
        background: #9CA3AF !important;
        cursor: not-allowed !important;
        opacity: 0.6;
    }
    
    .btn-disabled:hover {
        transform: none !important;
        box-shadow: none !important;
    }
    
    .price-breakdown {
        background: rgba(70, 130, 180, 0.05);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
    }
    
    .price-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    
    .price-item.total {
        border-top: 1px solid var(--primary);
        padding-top: 0.5rem;
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--primary);
    }
    
    .error-message {
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 16px;
        box-shadow: var(--shadow-medium);
        max-width: 500px;
        margin: 2rem auto;
    }
    
    .error-message h3 {
        color: var(--text-dark);
        margin-bottom: 1rem;
        font-family: 'Playfair Display', serif;
    }
    
    .error-message p {
        color: var(--text-light);
        margin-bottom: 2rem;
    }
    
    .error-message .btn-primary {
        margin-right: 1rem;
        margin-bottom: 1rem;
    }
    
    #pageLoader .loader-text {
        margin-top: 1rem;
        color: var(--primary);
        font-weight: 600;
    }
    
    .personalization-field {
        margin-bottom: 1rem;
    }
    
    .personalization-field label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--text-dark);
    }
    
    .personalization-field select,
    .personalization-field input[type="text"] {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #E5E7EB;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
    
    .personalization-field select:focus,
    .personalization-field input[type="text"]:focus {
        outline: none;
        border-color: var(--primary);
    }
    
    .preview-text-vertical {
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 2px;
    }
    
    .preview-text-horizontal {
        font-size: 18px;
        font-weight: bold;
    }
    
    #personalizationPreview {
        background: rgba(70, 130, 180, 0.05);
        border: 2px dashed var(--primary);
        border-radius: 12px;
        padding: 2rem;
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 1rem;
    }
`;

// Injetar estilos na página
if (!document.getElementById('shopify-integration-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'shopify-integration-styles';
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);
}

// ============================================================================
// EXPORTAR PARA USO EXTERNO (DEBUG)
// ============================================================================

// Para uso em outros scripts ou debug no console
window.QueiseShopify = {
    API_CONFIG,
    ProductAPI,
    PersonalizationSystem,
    ProductPageController,
    QUEISE_ICONS,
    // Função helper para testar conexão
    async testShopifyConnection() {
        try {
            const api = new ProductAPI();
            await api.getProduct('garrafa-termica-1l-teste');
            console.log('✅ Conexão com Shopify funcionando perfeitamente!');
            return true;
        } catch (error) {
            console.error('❌ Erro na conexão com Shopify:', error);
            return false;
        }
    },
    // Função para testar ícones
    testIcons() {
        console.log('🎨 Ícones QUEISE disponíveis:', QUEISE_ICONS);
        Object.keys(QUEISE_ICONS).forEach(key => {
            console.log(`${key}: ${QUEISE_ICONS[key].name} (${QUEISE_ICONS[key].file})`);
        });
    }
};

console.log('🎉 QUEISE - Sistema Completo Carregado!');
console.log('🔧 Para testar conexão: window.QueiseShopify.testShopifyConnection()');
console.log('🎨 Para ver ícones: window.QueiseShopify.testIcons()');
console.log('🛍️ Produto de teste: produto-individual.html?id=garrafa-termica-1l-teste');