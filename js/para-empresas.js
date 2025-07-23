// PÁGINA PARA EMPRESAS - QUEISE JavaScript

// DOM Elements
const formOrcamento = document.getElementById('formOrcamento');
const btnSubmit = document.querySelector('.btn-submit');
const showcaseCards = document.querySelectorAll('.showcase-card');
const beneficioItems = document.querySelectorAll('.beneficio-item');
const stepItems = document.querySelectorAll('.step-item');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeEmpresasPage();
    setupFormHandling();
    setupAnimations();
    setupCNPJMask();
    setupPhoneMask();
    setupScrollAnimations();
    setupAnalytics();
});

// Initialize empresas page functionality
function initializeEmpresasPage() {
    // Add hover effects to showcase cards
    showcaseCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        // Stagger animation delays
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Add interactions to benefit items
    beneficioItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            const icon = item.querySelector('.beneficio-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(-5deg)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const icon = item.querySelector('.beneficio-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
        
        // Stagger animation delays
        item.style.animationDelay = `${index * 0.1}s`;
    });

    console.log('Página Para Empresas inicializada com sucesso');
}

// Form handling
function setupFormHandling() {
    if (!formOrcamento) return;

    formOrcamento.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const requiredFields = formOrcamento.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
    
    // Email validation
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', validateEmail);
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    btnSubmit.classList.add('loading');
    btnSubmit.disabled = true;
    
    try {
        const formData = collectFormData();
        
        // Simulate API call (replace with actual endpoint)
        await submitToWhatsApp(formData);
        
        // Success feedback
        showSuccessMessage();
        formOrcamento.reset();
        
        // Track conversion
        trackFormSubmission(formData);
        
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        showErrorMessage('Erro ao enviar formulário. Tente novamente ou entre em contato via WhatsApp.');
    } finally {
        // Reset loading state
        btnSubmit.classList.remove('loading');
        btnSubmit.disabled = false;
    }
}

// Collect form data
function collectFormData() {
    const formData = new FormData(formOrcamento);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Submit to WhatsApp
async function submitToWhatsApp(data) {
    const message = formatWhatsAppMessage(data);
    const phoneNumber = '5511999999999'; // Replace with actual number
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
    
    // Simulate delay for UX
    await new Promise(resolve => setTimeout(resolve, 1500));
}

// Format WhatsApp message
function formatWhatsAppMessage(data) {
    return `🏢 *SOLICITAÇÃO DE ORÇAMENTO B2B - QUEISE*

👤 *Dados do Solicitante:*
• Nome: ${data.nome}
• E-mail: ${data.email}
• Telefone: ${data.telefone}
• Cargo: ${data.cargo}

🏛️ *Dados da Empresa:*
• Empresa: ${data.empresa}
• CNPJ: ${data.cnpj}

📊 *Detalhes do Projeto:*
• Quantidade: ${data.quantidade || 'Não informado'}
• Prazo: ${data.prazo || 'Não informado'}
• Ocasião: ${data.ocasiao || 'Não informado'}
• Como conheceu: ${data.conheceu || 'Não informado'}

💬 *Comentários:*
${data.comentarios}

---
Enviado via site QUEISE - Para Empresas`;
}

// Form validation
function validateForm() {
    let isValid = true;
    const requiredFields = formOrcamento.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Clear previous error
    clearFieldError(event);
    
    // Required field validation
    if (field.required && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    // Specific validations
    switch (field.type) {
        case 'email':
            return validateEmail(event);
        case 'tel':
            return validatePhone(event);
        default:
            return true;
    }
}

function validateEmail(event) {
    const field = event.target;
    const email = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showFieldError(field, 'E-mail inválido');
        return false;
    }
    
    return true;
}

function validatePhone(event) {
    const field = event.target;
    const phone = field.value.replace(/\D/g, '');
    
    if (phone && phone.length < 10) {
        showFieldError(field, 'Telefone inválido');
        return false;
    }
    
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = '#e74c3c';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 0.3rem;
    `;
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(event) {
    const field = event.target;
    field.style.borderColor = '';
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Input masks
function setupCNPJMask() {
    const cnpjField = document.getElementById('cnpj');
    if (!cnpjField) return;
    
    cnpjField.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 14) {
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        }
        
        e.target.value = value;
    });
}

function setupPhoneMask() {
    const phoneField = document.getElementById('telefone');
    if (!phoneField) return;
    
    phoneField.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 10) {
                value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
        }
        
        e.target.value = value;
    });
}

// Success and error messages
function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'form-message success';
    successMessage.style.cssText = `
        background: #2ecc71;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
    `;
    successMessage.innerHTML = `
        ✅ Solicitação enviada com sucesso!<br>
        <small>Nossa equipe entrará em contato em até 2 horas úteis.</small>
    `;
    
    formOrcamento.insertBefore(successMessage, formOrcamento.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
    
    // Scroll to message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'form-message error';
    errorMessage.style.cssText = `
        background: #e74c3c;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
    `;
    errorMessage.innerHTML = `❌ ${message}`;
    
    formOrcamento.insertBefore(errorMessage, formOrcamento.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        errorMessage.remove();
    }, 5000);
    
    // Scroll to message
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Animations and scroll effects
function setupAnimations() {
    // Stagger animation for showcase cards
    showcaseCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.animation = `fadeInUp 0.8s ease ${index * 0.1}s forwards`;
    });
    
    // Stagger animation for benefit items
    beneficioItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.animation = `fadeInUp 0.8s ease ${index * 0.1 + 0.3}s forwards`;
    });
    
    // Add keyframes if not exists
    addAnimationKeyframes();
}

function addAnimationKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Special animation for steps
                if (entry.target.classList.contains('processo-steps')) {
                    animateSteps();
                }
            }
        });
    }, observerOptions);

    // Observe sections
    const sectionsToObserve = [
        '.beneficios-b2b',
        '.linha-b2b',
        '.processo-steps',
        '.orcamento-section'
    ];
    
    sectionsToObserve.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            observer.observe(element);
        }
    });
}

function animateSteps() {
    stepItems.forEach((step, index) => {
        setTimeout(() => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(30px)';
            step.style.animation = `fadeInUp 0.6s ease forwards`;
        }, index * 200);
    });
}

// Analytics tracking
function setupAnalytics() {
    // Track page view
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: 'Para Empresas',
            page_location: window.location.href
        });
    }

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track milestones
            if ([25, 50, 75, 90].includes(scrollPercent)) {
                trackScrollDepth(scrollPercent);
            }
        }
    });

    // Track form interactions
    const formFields = formOrcamento?.querySelectorAll('input, select, textarea');
    formFields?.forEach(field => {
        field.addEventListener('focus', () => {
            trackFormFieldFocus(field.name);
        });
    });
}

function trackFormSubmission(data) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            event_category: 'B2B Lead',
            event_label: 'Orcamento Empresas',
            value: 1
        });
    }
    
    // Track company size based on quantity
    const quantity = data.quantidade;
    if (quantity) {
        trackCompanySize(quantity);
    }
    
    console.log('Form submission tracked:', data.empresa);
}

function trackScrollDepth(percent) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'scroll', {
            event_category: 'Engagement',
            event_label: `${percent}%`,
            value: percent
        });
    }
}

function trackFormFieldFocus(fieldName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_field_focus', {
            event_category: 'Form Interaction',
            event_label: fieldName
        });
    }
}

function trackCompanySize(quantity) {
    let size = 'small';
    if (quantity.includes('500') || quantity.includes('1000+')) {
        size = 'large';
    } else if (quantity.includes('101') || quantity.includes('501')) {
        size = 'medium';
    }
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'company_size', {
            event_category: 'B2B Qualification',
            event_label: size,
            value: 1
        });
    }
}

// Contact button interactions
function setupContactButtons() {
    const contactButtons = document.querySelectorAll('.contato-btn');
    
    contactButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const type = button.classList.contains('whatsapp') ? 'whatsapp' : 'email';
            trackContactClick(type);
        });
    });
}

function trackContactClick(type) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_click', {
            event_category: 'B2B Contact',
            event_label: type,
            value: 1
        });
    }
}

// Enhanced form UX
function setupFormEnhancements() {
    // Auto-save form data to localStorage
    const formFields = formOrcamento?.querySelectorAll('input, select, textarea');
    
    formFields?.forEach(field => {
        // Load saved data
        const savedValue = localStorage.getItem(`empresas_form_${field.name}`);
        if (savedValue && field.type !== 'password') {
            field.value = savedValue;
        }
        
        // Save on input
        field.addEventListener('input', () => {
            localStorage.setItem(`empresas_form_${field.name}`, field.value);
        });
    });
    
    // Clear saved data on successful submission
    formOrcamento?.addEventListener('submit', () => {
        formFields?.forEach(field => {
            localStorage.removeItem(`empresas_form_${field.name}`);
        });
    });
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('Empresas page error:', event.error);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Initialize contact buttons and form enhancements
document.addEventListener('DOMContentLoaded', () => {
    setupContactButtons();
    setupFormEnhancements();
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        formatWhatsAppMessage,
        collectFormData,
        trackFormSubmission
    };
}