/**
 * ============================================
 * INTERACTIONS.JS - Interactive Elements
 * ============================================
 * 
 * Componente para gerenciar interações de cards, botões, features, etc.
 * 
 * @module components/Interactions
 */

/**
 * Classe para gerenciar interações
 */
export class InteractionManager {
    constructor() {
        this.init();
    }

    /**
     * Inicializa o interaction manager
     */
    init() {
        this.setupCardHovers();
        this.setupButtonAnimations();
        this.setupFeatureHovers();
        this.setupPricingEffects();
        this.setupSmoothScrolling();
        this.setupFormHandling();
        this.setupImageFallbacks();
    }

    /**
     * Configura hover effects para cards
     */
    setupCardHovers() {
        const cardSelectors = '.product-card, .collection-card, .featured-main, .featured-side, .empresa-card';
        
        document.querySelectorAll(cardSelectors).forEach(card => {
            card.addEventListener('mouseenter', function () {
                if (this.classList.contains('product-card')) {
                    this.style.transform = 'translateY(-15px) scale(1.03)';
                } else if (this.classList.contains('empresa-card')) {
                    this.style.transform = 'translateY(-8px)';
                } else {
                    this.style.transform = 'translateY(-8px)';
                }
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    /**
     * Configura animações de botões
     */
    setupButtonAnimations() {
        document.querySelectorAll('.btn-primary, .btn-secondary, .btn-white').forEach(btn => {
            btn.addEventListener('mouseenter', function () {
                const span = this.querySelector('span');
                if (span) {
                    span.style.transform = 'translateX(4px)';
                    span.style.transition = 'transform 0.3s ease';
                }
            });

            btn.addEventListener('mouseleave', function () {
                const span = this.querySelector('span');
                if (span) {
                    span.style.transform = 'translateX(0)';
                }
            });
        });
    }

    /**
     * Configura hover effects para features
     */
    setupFeatureHovers() {
        document.querySelectorAll('.feature, .empresa-feature').forEach(feature => {
            feature.addEventListener('mouseenter', function () {
                const icon = this.querySelector('.feature-icon, .empresa-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });

            feature.addEventListener('mouseleave', function () {
                const icon = this.querySelector('.feature-icon, .empresa-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    /**
     * Configura efeitos de preço
     */
    setupPricingEffects() {
        document.querySelectorAll('.product-price, .featured-price').forEach(price => {
            price.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'transform 0.3s ease';
            });

            price.addEventListener('mouseleave', function () {
                this.style.transform = 'scale(1)';
            });
        });
    }

    /**
     * Configura smooth scrolling para links âncora
     */
    setupSmoothScrolling() {
        const header = document.getElementById('header');
        const headerHeight = header ? header.offsetHeight : 0;

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const targetPosition = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Configura tratamento de formulários
     */
    setupFormHandling() {
        document.querySelectorAll('a[href="#personalizar"], a[href="#contato"]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                const action = this.getAttribute('href') === '#personalizar' ? 'personalização' : 'contato';

                // Mostrar alerta com informações de contato
                alert(`Funcionalidade de ${action} será implementada. Por enquanto, entre em contato via WhatsApp: (11) 99999-9999 ou email: contato@queise.com.br`);

                // Opções futuras de implementação:
                // 1. Abrir modal com formulário de contato/personalização
                // 2. Redirecionar para página de formulário dedicada
                // 3. Acionar widget de chat
                // 4. Abrir cliente de email com template pré-preenchido
            });
        });
    }

    /**
     * Configura fallbacks para imagens
     */
    setupImageFallbacks() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function () {
                // Tratar erros de carregamento de imagem graciosamente
                console.log(`Failed to load image: ${this.src}`);

                // Você pode implementar lógica de fallback aqui:
                // 1. Substituir por imagem placeholder
                // 2. Esconder o container da imagem
                // 3. Mostrar conteúdo alternativo

                // Exemplo: Esconder imagens que falharam
                this.style.display = 'none';
            });
        });
    }
}

