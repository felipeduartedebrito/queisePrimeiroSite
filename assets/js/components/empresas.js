/**
 * ============================================
 * EMPRESAS.JS - Para Empresas Page Component
 * ============================================
 * 
 * Componente para gerenciar a página Para Empresas
 * 
 * @module components/Empresas
 */

import { validateEmail, validatePhone, validateCNPJ } from '../core/utils.js';
import { Notification } from './notification.js';
import { debounce } from '../core/utils.js';

/**
 * Classe para gerenciar página Para Empresas
 */
export class EmpresasManager {
    constructor() {
        this.formOrcamento = document.getElementById('formOrcamento');
        this.btnSubmit = document.querySelector('.btn-submit');
        this.showcaseCards = document.querySelectorAll('.showcase-card');
        this.beneficioItems = document.querySelectorAll('.beneficio-item');
        this.stepItems = document.querySelectorAll('.step-item');
        
        this.init();
    }

    init() {
        this.setupFormHandling();
        this.setupAnimations();
        this.setupCNPJMask();
        this.setupPhoneMask();
        this.setupScrollAnimations();
        this.setupContactButtons();
        this.setupFormEnhancements();
        
        console.log('✅ Página Para Empresas inicializada com sucesso');
    }

    // ========================================
    // INTERAÇÕES DE CARDS
    // ========================================

    setupCardInteractions() {
        this.showcaseCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
            
            // Atrasos de animação escalonados
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Adicionar interações aos itens de benefício
        this.beneficioItems.forEach((item, index) => {
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
            
            // Atrasos de animação escalonados
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // ========================================
    // TRATAMENTO DE FORMULÁRIO
    // ========================================

    setupFormHandling() {
        if (!this.formOrcamento) return;

        this.formOrcamento.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Validação em tempo real
        const requiredFields = this.formOrcamento.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', (e) => this.validateField(e));
            field.addEventListener('input', (e) => this.clearFieldError(e));
        });
        
        // Validação de email
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', (e) => this.validateEmail(e));
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        // Mostrar estado de loading
        if (this.btnSubmit) {
            this.btnSubmit.classList.add('loading');
            this.btnSubmit.disabled = true;
        }
        
        try {
            const formData = this.collectFormData();
            
            // Simular chamada à API (substituir por endpoint real)
            await this.submitToWhatsApp(formData);
            
            // Feedback de sucesso
            Notification.success('Solicitação enviada com sucesso! Nossa equipe entrará em contato em até 2 horas úteis.');
            this.formOrcamento.reset();
            
            // Limpar dados salvos
            this.clearSavedFormData();
            
            // Track conversion
            this.trackFormSubmission(formData);
            
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            Notification.error('Erro ao enviar formulário. Tente novamente ou entre em contato via WhatsApp.');
        } finally {
            // Resetar estado de loading
            if (this.btnSubmit) {
                this.btnSubmit.classList.remove('loading');
                this.btnSubmit.disabled = false;
            }
        }
    }

    collectFormData() {
        const formData = new FormData(this.formOrcamento);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    async submitToWhatsApp(data) {
        const message = this.formatWhatsAppMessage(data);
        const phoneNumber = '5511999999999'; // Substituir por número real
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        // Abrir WhatsApp em nova aba
        window.open(whatsappURL, '_blank');
        
        // Simular delay para UX
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    formatWhatsAppMessage(data) {
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

    // ========================================
    // VALIDAÇÃO
    // ========================================

    validateForm() {
        let isValid = true;
        const requiredFields = this.formOrcamento.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField({ target: field })) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(event) {
        const field = event.target;
        const value = field.value.trim();
        
        // Limpar erro anterior
        this.clearFieldError(event);
        
        // Validação de campo obrigatório
        if (field.required && !value) {
            this.showFieldError(field, 'Este campo é obrigatório');
            return false;
        }
        
        // Validações específicas
        switch (field.type) {
            case 'email':
                return this.validateEmail(event);
            case 'tel':
                return this.validatePhone(event);
            default:
                return true;
        }
    }

    validateEmail(event) {
        const field = event.target;
        const email = field.value.trim();
        
        if (email && !validateEmail(email)) {
            this.showFieldError(field, 'E-mail inválido');
            return false;
        }
        
        return true;
    }

    validatePhone(event) {
        const field = event.target;
        const phone = field.value.replace(/\D/g, '');
        
        if (phone && phone.length < 10) {
            this.showFieldError(field, 'Telefone inválido');
            return false;
        }
        
        return true;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#e74c3c';
        
        // Remover mensagem de erro existente
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Adicionar mensagem de erro
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

    clearFieldError(event) {
        const field = event.target;
        field.style.borderColor = '';
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // ========================================
    // MÁSCARAS DE INPUT
    // ========================================

    setupCNPJMask() {
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

    setupPhoneMask() {
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

    // ========================================
    // ANIMAÇÕES
    // ========================================

    setupAnimations() {
        // Animação escalonada para showcase cards
        this.showcaseCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.animation = `fadeInUp 0.8s ease ${index * 0.1}s forwards`;
        });
        
        // Animação escalonada para itens de benefício
        this.beneficioItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.animation = `fadeInUp 0.8s ease ${index * 0.1 + 0.3}s forwards`;
        });
        
        // Adicionar keyframes se não existirem
        this.addAnimationKeyframes();
    }

    addAnimationKeyframes() {
        if (document.getElementById('fadeInUp-keyframes')) return;
        
        const style = document.createElement('style');
        style.id = 'fadeInUp-keyframes';
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

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animação especial para steps
                    if (entry.target.classList.contains('processo-steps')) {
                        this.animateSteps();
                    }
                }
            });
        }, observerOptions);

        // Observar seções
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

    animateSteps() {
        this.stepItems.forEach((step, index) => {
            setTimeout(() => {
                step.style.opacity = '0';
                step.style.transform = 'translateY(30px)';
                step.style.animation = `fadeInUp 0.6s ease forwards`;
            }, index * 200);
        });
    }

    // ========================================
    // BOTÕES DE CONTATO
    // ========================================

    setupContactButtons() {
        const contactButtons = document.querySelectorAll('.contato-btn');
        
        contactButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const type = button.classList.contains('whatsapp') ? 'whatsapp' : 'email';
                this.trackContactClick(type);
            });
        });
    }

    // ========================================
    // MELHORIAS DE FORMULÁRIO
    // ========================================

    setupFormEnhancements() {
        // Auto-salvar dados do formulário no localStorage
        const formFields = this.formOrcamento?.querySelectorAll('input, select, textarea');
        
        formFields?.forEach(field => {
            // Carregar dados salvos
            const savedValue = localStorage.getItem(`empresas_form_${field.name}`);
            if (savedValue && field.type !== 'password') {
                field.value = savedValue;
            }
            
            // Salvar ao digitar
            field.addEventListener('input', () => {
                localStorage.setItem(`empresas_form_${field.name}`, field.value);
            });
        });
    }

    clearSavedFormData() {
        const formFields = this.formOrcamento?.querySelectorAll('input, select, textarea');
        formFields?.forEach(field => {
            localStorage.removeItem(`empresas_form_${field.name}`);
        });
    }

    // ========================================
    // ANALYTICS
    // ========================================

    trackFormSubmission(data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'B2B Lead',
                event_label: 'Orcamento Empresas',
                value: 1
            });
        }
        
        console.log('Form submission tracked:', data.empresa);
    }

    trackContactClick(type) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_click', {
                event_category: 'B2B Contact',
                event_label: type,
                value: 1
            });
        }
    }
}

