// PÁGINA PERSONALIZAR - QUEISE JavaScript

// State Management
const personalizationState = {
    currentStep: 1,
    selectedProduct: null,
    variants: {
        tamanho: '1L',
        cor: 'azul'
    },
    personalization: {
        type: 'texto',
        text: 'SEU TEXTO',
        font: 'Arial',
        color: '#FFFFFF',
        position: 'center'
    },
    pricing: {
        basePrice: 165,
        personalizationPrice: 20,
        total: 185
    }
};

// Products Configuration (Configurável - quais são personalizáveis)
const PERSONALIZABLE_PRODUCTS = {
    'garrafa-stanley-1l': {
        name: 'Garrafa Stanley 1L',
        description: 'Garrafa térmica premium com isolamento superior',
        basePrice: 165,
        personalizationPrice: 20,
        variants: {
            tamanho: ['500ml', '1L', '1.2L'],
            cor: ['azul', 'preto', 'branco', 'verde']
        },
        personalizationConfig: {
            maxChars: 20,
            allowedFonts: ['Arial', 'Times', 'Script', 'Bold'],
            allowedColors: ['#FFFFFF', '#000000', '#FFD700', '#C0C0C0'],
            allowedPositions: ['center', 'bottom', 'side']
        }
    },
    'copo-termico-500ml': {
        name: 'Copo Térmico 500ml',
        description: 'Perfeito para seu café ou chá favorito',
        basePrice: 80,
        personalizationPrice: 20,
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
        basePrice: 45,
        personalizationPrice: 15,
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
        basePrice: 35,
        personalizationPrice: 10,
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

// DOM Elements
const progressSteps = document.querySelectorAll('.progress-step');
const progressFill = document.querySelector('.progress-fill');
const wizardSteps = document.querySelectorAll('.wizard-step');
const btnNext = document.querySelectorAll('.btn-next');
const btnBack = document.querySelectorAll('.btn-back');
const produtoCards = document.querySelectorAll('.produto-card');
const previewText = document.getElementById('previewText');
const customTextInput = document.getElementById('customText');
const charCount = document.getElementById('charCount');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializePersonalizationPage();
    setupProductSelection();
    setupVariantSelection();
    setupPersonalizationControls();
    setupPreviewControls();
    setupWizardNavigation();
    setupFinalizationActions();
    loadSavedState();
    updatePreview();
});

// Initialize personalization page
function initializePersonalizationPage() {
    updateProgressBar();
    updateStepVisibility();
    updatePricing();
    
    console.log('Página de personalização inicializada');
}

// Product Selection (Step 1)
function setupProductSelection() {
    produtoCards.forEach(card => {
        card.addEventListener('click', () => {
            handleProductSelection(card);
        });
        
        // Add keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProductSelection(card);
            }
        });
        
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
    });
}

function handleProductSelection(card) {
    // Remove previous selection
    produtoCards.forEach(c => c.classList.remove('selected'));
    
    // Select current card
    card.classList.add('selected');
    
    // Update state
    const productId = card.dataset.product;
    personalizationState.selectedProduct = productId;
    
    // Update pricing
    const product = PERSONALIZABLE_PRODUCTS[productId];
    if (product) {
        personalizationState.pricing.basePrice = product.basePrice;
        personalizationState.pricing.personalizationPrice = product.personalizationPrice;
        personalizationState.pricing.total = product.basePrice + product.personalizationPrice;
        
        updatePricing();
    }
    
    // Enable next button
    const nextBtn = document.querySelector('[data-step="1"] .btn-next');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
    
    // Save state
    saveState();
    
    // Track selection
    trackProductSelection(productId);
}

// Variant Selection (Step 2)
function setupVariantSelection() {
    const variantOptions = document.querySelectorAll('.variacao-option, .variacao-color');
    
    variantOptions.forEach(option => {
        option.addEventListener('click', () => {
            handleVariantSelection(option);
        });
    });
}

function handleVariantSelection(option) {
    const variantType = option.dataset.variant;
    const variantValue = option.dataset.value;
    
    // Remove active from siblings
    const siblings = option.parentNode.querySelectorAll(`[data-variant="${variantType}"]`);
    siblings.forEach(sibling => sibling.classList.remove('active'));
    
    // Add active to current
    option.classList.add('active');
    
    // Update state
    personalizationState.variants[variantType] = variantValue;
    
    // Update preview
    updateProductVariant(variantType, variantValue);
    
    // Save state
    saveState();
}

function updateProductVariant(type, value) {
    const productShape = document.querySelector('.product-shape');
    
    if (type === 'cor') {
        const colorMap = {
            'azul': '#4682B4',
            'preto': '#2C3E50',
            'branco': '#FFFFFF',
            'verde': '#27AE60'
        };
        
        if (productShape && colorMap[value]) {
            productShape.style.background = colorMap[value];
            
            // Adjust text color for contrast
            if (value === 'branco') {
                productShape.style.border = '1px solid #ddd';
            } else {
                productShape.style.border = 'none';
            }
        }
    }
}

// Personalization Controls (Step 3)
function setupPersonalizationControls() {
    // Text input
    if (customTextInput) {
        customTextInput.addEventListener('input', handleTextChange);
        customTextInput.addEventListener('keyup', updateCharCounter);
    }
    
    // Control tabs
    const controlTabs = document.querySelectorAll('.control-tab');
    controlTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            handleTypeChange(tab);
        });
    });
    
    // Font options
    const fontOptions = document.querySelectorAll('.font-option');
    fontOptions.forEach(option => {
        option.addEventListener('click', () => {
            handleFontChange(option);
        });
    });
    
    // Color options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            handleColorChange(option);
        });
    });
    
    // Position options
    const positionOptions = document.querySelectorAll('.position-option');
    positionOptions.forEach(option => {
        option.addEventListener('click', () => {
            handlePositionChange(option);
        });
    });
}

function handleTextChange(event) {
    const text = event.target.value;
    personalizationState.personalization.text = text || 'SEU TEXTO';
    
    updatePreview();
    updateCharCounter();
    saveState();
}

function handleTypeChange(tab) {
    // Remove active from siblings
    const siblings = tab.parentNode.querySelectorAll('.control-tab');
    siblings.forEach(sibling => sibling.classList.remove('active'));
    
    // Add active to current
    tab.classList.add('active');
    
    // Update state
    const type = tab.dataset.type;
    personalizationState.personalization.type = type;
    
    // Update placeholder and max length based on type
    updateTextInputConfig(type);
    
    saveState();
}

function updateTextInputConfig(type) {
    if (!customTextInput) return;
    
    const config = {
        'texto': { placeholder: 'Digite seu texto...', maxLength: 20 },
        'nome': { placeholder: 'Digite seu nome...', maxLength: 15 },
        'frase': { placeholder: 'Digite uma frase...', maxLength: 30 }
    };
    
    const typeConfig = config[type] || config['texto'];
    customTextInput.placeholder = typeConfig.placeholder;
    customTextInput.maxLength = typeConfig.maxLength;
    
    updateCharCounter();
}

function handleFontChange(option) {
    // Remove active from siblings
    const siblings = option.parentNode.querySelectorAll('.font-option');
    siblings.forEach(sibling => sibling.classList.remove('active'));
    
    // Add active to current
    option.classList.add('active');
    
    // Update state
    const font = option.dataset.font;
    personalizationState.personalization.font = font;
    
    updatePreview();
    saveState();
}

function handleColorChange(option) {
    // Remove active from siblings
    const siblings = option.parentNode.querySelectorAll('.color-option');
    siblings.forEach(sibling => sibling.classList.remove('active'));
    
    // Add active to current
    option.classList.add('active');
    
    // Update state
    const color = option.dataset.color;
    personalizationState.personalization.color = color;
    
    updatePreview();
    saveState();
}

function handlePositionChange(option) {
    // Remove active from siblings
    const siblings = option.parentNode.querySelectorAll('.position-option');
    siblings.forEach(sibling => sibling.classList.remove('active'));
    
    // Add active to current
    option.classList.add('active');
    
    // Update state
    const position = option.dataset.position;
    personalizationState.personalization.position = position;
    
    updatePreview();
    saveState();
}

function updateCharCounter() {
    if (!customTextInput || !charCount) return;
    
    const current = customTextInput.value.length;
    const max = customTextInput.maxLength;
    
    charCount.textContent = current;
    charCount.parentNode.innerHTML = `<span id="charCount">${current}</span>/${max} caracteres`;
    
    // Color coding
    if (current > max * 0.9) {
        charCount.style.color = '#e74c3c';
    } else if (current > max * 0.7) {
        charCount.style.color = '#f39c12';
    } else {
        charCount.style.color = '';
    }
}

// Preview Controls
function setupPreviewControls() {
    const previewBtns = document.querySelectorAll('.preview-btn');
    
    previewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            handlePreviewViewChange(btn);
        });
    });
}

function handlePreviewViewChange(btn) {
    // Remove active from siblings
    const siblings = btn.parentNode.querySelectorAll('.preview-btn');
    siblings.forEach(sibling => sibling.classList.remove('active'));
    
    // Add active to current
    btn.classList.add('active');
    
    // Update preview view
    const view = btn.dataset.view;
    updatePreviewView(view);
}

function updatePreviewView(view) {
    const previewProduct = document.getElementById('productPreview');
    
    if (previewProduct) {
        // Add view-specific classes or transformations
        previewProduct.className = `preview-product view-${view}`;
        
        // Could add 3D transformations here
        switch (view) {
            case 'front':
                previewProduct.style.transform = 'rotateY(0deg)';
                break;
            case 'side':
                previewProduct.style.transform = 'rotateY(-15deg)';
                break;
            case 'back':
                previewProduct.style.transform = 'rotateY(180deg)';
                break;
        }
    }
}

// Update Preview
function updatePreview() {
    if (!previewText) return;
    
    const { text, font, color, position } = personalizationState.personalization;
    
    // Update text content
    previewText.textContent = text;
    
    // Update font
    const fontMap = {
        'Arial': 'Arial, sans-serif',
        'Times': '"Times New Roman", serif',
        'Script': '"Brush Script MT", cursive',
        'Bold': 'Arial, sans-serif'
    };
    
    previewText.style.fontFamily = fontMap[font] || 'Arial, sans-serif';
    previewText.style.fontWeight = font === 'Bold' ? '700' : '600';
    
    // Update color
    previewText.style.color = color;
    
    // Update position
    updateTextPosition(position);
    
    // Update final preview if visible
    updateFinalPreview();
}

function updateTextPosition(position) {
    if (!previewText) return;
    
    const positions = {
        'center': {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        },
        'bottom': {
            top: 'auto',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)'
        },
        'side': {
            top: '50%',
            left: 'auto',
            right: '10%',
            transform: 'translateY(-50%)'
        }
    };
    
    const pos = positions[position] || positions['center'];
    
    Object.assign(previewText.style, pos);
}

// Final Preview (Step 4)
function updateFinalPreview() {
    const finalPreviewText = document.getElementById('finalPreviewText');
    const finalProduct = document.getElementById('finalProduct');
    const finalColor = document.getElementById('finalColor');
    const finalText = document.getElementById('finalText');
    const finalFont = document.getElementById('finalFont');
    const finalPosition = document.getElementById('finalPosition');
    
    if (finalPreviewText) {
        // Copy preview styles
        const { text, font, color, position } = personalizationState.personalization;
        
        finalPreviewText.textContent = text;
        finalPreviewText.style.fontFamily = previewText.style.fontFamily;
        finalPreviewText.style.fontWeight = previewText.style.fontWeight;
        finalPreviewText.style.color = color;
        
        // Update position for final preview
        updateFinalTextPosition(position, finalPreviewText);
    }
    
    // Update product info
    if (personalizationState.selectedProduct) {
        const product = PERSONALIZABLE_PRODUCTS[personalizationState.selectedProduct];
        
        if (finalProduct) finalProduct.textContent = product.name;
        if (finalColor) finalColor.textContent = personalizationState.variants.cor;
        if (finalText) finalText.textContent = `"${personalizationState.personalization.text}"`;
        if (finalFont) finalFont.textContent = personalizationState.personalization.font;
        if (finalPosition) finalPosition.textContent = getPositionLabel(personalizationState.personalization.position);
    }
}

function updateFinalTextPosition(position, element) {
    const positions = {
        'center': {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        },
        'bottom': {
            top: 'auto',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)'
        },
        'side': {
            top: '50%',
            left: 'auto',
            right: '8%',
            transform: 'translateY(-50%)'
        }
    };
    
    const pos = positions[position] || positions['center'];
    Object.assign(element.style, pos);
}

function getPositionLabel(position) {
    const labels = {
        'center': 'Centro',
        'bottom': 'Inferior',
        'side': 'Lateral'
    };
    return labels[position] || 'Centro';
}

// Pricing Updates
function updatePricing() {
    const summaryProduct = document.getElementById('summaryProduct');
    const summaryPersonalization = document.getElementById('summaryPersonalization');
    const summaryTotal = document.getElementById('summaryTotal');
    const basePrice = document.getElementById('basePrice');
    const personalizationPrice = document.getElementById('personalizationPrice');
    const totalPrice = document.getElementById('totalPrice');
    
    const { pricing, selectedProduct } = personalizationState;
    
    if (selectedProduct) {
        const product = PERSONALIZABLE_PRODUCTS[selectedProduct];
        
        if (summaryProduct) summaryProduct.textContent = product.name;
        if (summaryPersonalization) summaryPersonalization.textContent = `+ R$ ${pricing.personalizationPrice.toFixed(2).replace('.', ',')}`;
        if (summaryTotal) summaryTotal.textContent = `R$ ${pricing.total.toFixed(2).replace('.', ',')}`;
        
        if (basePrice) basePrice.textContent = `R$ ${pricing.basePrice.toFixed(2).replace('.', ',')}`;
        if (personalizationPrice) personalizationPrice.textContent = `R$ ${pricing.personalizationPrice.toFixed(2).replace('.', ',')}`;
        if (totalPrice) totalPrice.textContent = `R$ ${pricing.total.toFixed(2).replace('.', ',')}`;
    }
}

// Wizard Navigation
function setupWizardNavigation() {
    // Next buttons
    btnNext.forEach(btn => {
        btn.addEventListener('click', () => {
            nextStep();
        });
    });
    
    // Back buttons
    btnBack.forEach(btn => {
        btn.addEventListener('click', () => {
            previousStep();
        });
    });
}

function nextStep() {
    if (personalizationState.currentStep < 4) {
        personalizationState.currentStep++;
        updateWizardState();
        trackStepCompletion(personalizationState.currentStep - 1);
    }
}

function previousStep() {
    if (personalizationState.currentStep > 1) {
        personalizationState.currentStep--;
        updateWizardState();
    }
}

function updateWizardState() {
    updateProgressBar();
    updateStepVisibility();
    updatePricing();
    saveState();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressBar() {
    const { currentStep } = personalizationState;
    
    // Update progress steps
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update progress bar fill
    const progressPercentage = (currentStep / 4) * 100;
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }
}

function updateStepVisibility() {
    wizardSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        if (stepNumber === personalizationState.currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Finalization Actions (Step 4)
function setupFinalizationActions() {
    // Add to cart
    const btnCarrinho = document.querySelector('.btn-carrinho');
    if (btnCarrinho) {
        btnCarrinho.addEventListener('click', handleAddToCart);
    }
    
    // Buy now
    const btnComprar = document.querySelector('.btn-comprar');
    if (btnComprar) {
        btnComprar.addEventListener('click', handleBuyNow);
    }
    
    // Save design
    const btnSalvar = document.querySelector('.btn-salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', handleSaveDesign);
    }
    
    // New product
    const btnNovoProduto = document.querySelector('.btn-novo-produto');
    if (btnNovoProduto) {
        btnNovoProduto.addEventListener('click', handleNewProduct);
    }
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            handleShare(btn.dataset.platform);
        });
    });
}

async function handleAddToCart() {
    const cartItem = createCartItem();
    
    try {
        // Add loading state
        const btn = document.querySelector('.btn-carrinho');
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        
        // Add to cart (localStorage for now, Shopify later)
        addToCart(cartItem);
        
        // Success feedback
        showSuccessMessage('Produto adicionado ao carrinho!');
        
        // Track conversion
        trackAddToCart(cartItem);
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = '../paginas/carrinho.html';
        }, 1500);
        
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        showErrorMessage('Erro ao adicionar produto. Tente novamente.');
    }
}

async function handleBuyNow() {
    const cartItem = createCartItem();
    
    try {
        // Add loading state
        const btn = document.querySelector('.btn-comprar');
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        
        // Add to cart and redirect to checkout
        addToCart(cartItem);
        
        // Track conversion
        trackBuyNow(cartItem);
        
        // Redirect to checkout
        window.location.href = '../paginas/checkout.html';
        
    } catch (error) {
        console.error('Erro na compra:', error);
        showErrorMessage('Erro ao processar compra. Tente novamente.');
    }
}

function handleSaveDesign() {
    const design = createDesignObject();
    
    try {
        // Save to localStorage
        const savedDesigns = JSON.parse(localStorage.getItem('queise_saved_designs') || '[]');
        savedDesigns.push(design);
        localStorage.setItem('queise_saved_designs', JSON.stringify(savedDesigns));
        
        showSuccessMessage('Design salvo com sucesso!');
        trackSaveDesign(design);
        
    } catch (error) {
        console.error('Erro ao salvar design:', error);
        showErrorMessage('Erro ao salvar design. Tente novamente.');
    }
}

function handleNewProduct() {
    // Reset state
    personalizationState.currentStep = 1;
    personalizationState.selectedProduct = null;
    
    // Clear selections
    document.querySelectorAll('.produto-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset form
    if (customTextInput) {
        customTextInput.value = 'SEU TEXTO';
    }
    
    // Update wizard
    updateWizardState();
    updatePreview();
    
    trackNewProductClick();
}

function handleShare(platform) {
    const shareData = createShareData();
    
    switch (platform) {
        case 'whatsapp':
            shareToWhatsApp(shareData);
            break;
        case 'facebook':
            shareToFacebook(shareData);
            break;
        case 'copy':
            copyShareLink(shareData);
            break;
    }
    
    trackShare(platform);
}

// Helper Functions
function createCartItem() {
    const { selectedProduct, variants, personalization, pricing } = personalizationState;
    const product = PERSONALIZABLE_PRODUCTS[selectedProduct];
    
    return {
        id: `${selectedProduct}_${Date.now()}`,
        productId: selectedProduct,
        name: product.name,
        basePrice: pricing.basePrice,
        personalizationPrice: pricing.personalizationPrice,
        totalPrice: pricing.total,
        variants: { ...variants },
        personalization: { ...personalization },
        quantity: 1,
        createdAt: new Date().toISOString()
    };
}

function createDesignObject() {
    return {
        id: Date.now(),
        ...createCartItem(),
        savedAt: new Date().toISOString()
    };
}

function createShareData() {
    const { selectedProduct, personalization } = personalizationState;
    const product = PERSONALIZABLE_PRODUCTS[selectedProduct];
    
    return {
        title: `Meu produto personalizado - ${product.name}`,
        text: `Olha que legal! Personalizei um "${product.name}" com o texto "${personalization.text}" na QUEISE!`,
        url: window.location.href
    };
}

function addToCart(item) {
    const cart = JSON.parse(localStorage.getItem('queise_cart') || '[]');
    cart.push(item);
    localStorage.setItem('queise_cart', JSON.stringify(cart));
}

function shareToWhatsApp(data) {
    const message = encodeURIComponent(`${data.text} ${data.url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

function shareToFacebook(data) {
    const url = encodeURIComponent(data.url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyShareLink(data) {
    navigator.clipboard.writeText(data.url).then(() => {
        showSuccessMessage('Link copiado para a área de transferência!');
    }).catch(() => {
        showErrorMessage('Erro ao copiar link. Tente manualmente.');
    });
}

// State Management
function saveState() {
    localStorage.setItem('queise_personalization_state', JSON.stringify(personalizationState));
}

function loadSavedState() {
    const saved = localStorage.getItem('queise_personalization_state');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            Object.assign(personalizationState, savedState);
            
            // Restore UI state
            restoreUIState();
        } catch (error) {
            console.error('Erro ao carregar estado salvo:', error);
        }
    }
}

function restoreUIState() {
    // Restore product selection
    if (personalizationState.selectedProduct) {
        const productCard = document.querySelector(`[data-product="${personalizationState.selectedProduct}"]`);
        if (productCard) {
            productCard.classList.add('selected');
        }
    }
    
    // Restore text input
    if (customTextInput) {
        customTextInput.value = personalizationState.personalization.text;
    }
    
    // Restore active states for controls
    restoreControlStates();
}

function restoreControlStates() {
    // Restore font selection
    const fontOption = document.querySelector(`[data-font="${personalizationState.personalization.font}"]`);
    if (fontOption) {
        fontOption.classList.add('active');
    }
    
    // Restore color selection
    const colorOption = document.querySelector(`[data-color="${personalizationState.personalization.color}"]`);
    if (colorOption) {
        colorOption.classList.add('active');
    }
    
    // Restore position selection
    const positionOption = document.querySelector(`[data-position="${personalizationState.personalization.position}"]`);
    if (positionOption) {
        positionOption.classList.add('active');
    }
}

// Feedback Messages
function showSuccessMessage(message) {
    const alert = createAlert(message, 'success');
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

function showErrorMessage(message) {
    const alert = createAlert(message, 'error');
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 4000);
}

function createAlert(message, type) {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    alert.textContent = message;
    
    return alert;
}

// Analytics
function trackProductSelection(productId) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'product_select', {
            event_category: 'Personalization',
            event_label: productId,
            value: 1
        });
    }
}

function trackStepCompletion(step) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'wizard_step_complete', {
            event_category: 'Personalization',
            event_label: `step_${step}`,
            value: step
        });
    }
}

function trackAddToCart(item) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: 'BRL',
            value: item.totalPrice,
            items: [{
                item_id: item.productId,
                item_name: item.name,
                category: 'Personalized',
                quantity: 1,
                price: item.totalPrice
            }]
        });
    }
}

function trackBuyNow(item) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', {
            currency: 'BRL',
            value: item.totalPrice,
            items: [{
                item_id: item.productId,
                item_name: item.name,
                category: 'Personalized',
                quantity: 1,
                price: item.totalPrice
            }]
        });
    }
}

function trackSaveDesign(design) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'save_design', {
            event_category: 'Personalization',
            event_label: design.productId,
            value: 1
        });
    }
}

function trackShare(platform) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            method: platform,
            content_type: 'personalized_product'
        });
    }
}

function trackNewProductClick() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'new_product_click', {
            event_category: 'Personalization',
            value: 1
        });
    }
}

// Error Handling
window.addEventListener('error', (event) => {
    console.error('Personalization page error:', event.error);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        personalizationState,
        PERSONALIZABLE_PRODUCTS,
        handleProductSelection,
        updatePreview,
        createCartItem
    };
}