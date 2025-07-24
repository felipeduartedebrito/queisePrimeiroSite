// SOBRE JS - QUEISE

// Configurações específicas da página Sobre
const SOBRE_CONFIG = {
    animations: {
        counterSpeed: 2000,
        counterStep: 50,
        timelineDelay: 200,
        statsDelay: 100
    },
    selectors: {
        counters: '.stat-number',
        timelineItems: '.timeline-item',
        mvvCards: '.mvv-card',
        equipeMember: '.equipe-member',
        diferencialCard: '.diferencial-card',
        certificacaoItem: '.certificacao-item',
        processSteps: '.step'
    }
};

// Contador animado para estatísticas
class AnimatedCounter {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = this.parseTarget(target);
        this.duration = duration;
        this.current = 0;
        this.increment = this.target / (duration / 16);
        this.hasAnimated = false;
    }

    parseTarget(target) {
        // Remove caracteres não numéricos, exceto pontos para decimais
        const cleanTarget = target.replace(/[^\d.]/g, '');
        return parseFloat(cleanTarget) || 0;
    }

    formatNumber(num) {
        const originalText = this.element.textContent;
        
        // Se contém %, mantém a formatação
        if (originalText.includes('%')) {
            return Math.round(num) + '%';
        }
        
        // Se contém +, mantém a formatação
        if (originalText.includes('+')) {
            return this.formatWithSeparator(Math.round(num)) + '+';
        }
        
        // Formatação padrão com separadores
        return this.formatWithSeparator(Math.round(num));
    }

    formatWithSeparator(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    animate() {
        if (this.hasAnimated) return;
        
        this.hasAnimated = true;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            
            // Ease-out animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.current = this.target * easeOut;
            
            this.element.textContent = this.formatNumber(this.current);
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                this.element.textContent = this.formatNumber(this.target);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// Timeline animada
class TimelineAnimation {
    constructor() {
        this.timelineItems = document.querySelectorAll(SOBRE_CONFIG.selectors.timelineItems);
        this.setupTimeline();
    }

    setupTimeline() {
        this.timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-50px)';
            item.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
        });
    }

    animateTimeline() {
        this.timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * SOBRE_CONFIG.animations.timelineDelay);
        });
    }
}

// Animação de hover para cards da equipe
class EquipeAnimations {
    constructor() {
        this.setupEquipeHovers();
    }

    setupEquipeHovers() {
        const equipeMembers = document.querySelectorAll(SOBRE_CONFIG.selectors.equipeMember);
        
        equipeMembers.forEach(member => {
            const photo = member.querySelector('.member-photo');
            const info = member.querySelector('.member-info');
            
            member.addEventListener('mouseenter', () => {
                photo.style.transform = 'scale(1.05)';
                info.style.transform = 'translateY(-5px)';
            });
            
            member.addEventListener('mouseleave', () => {
                photo.style.transform = 'scale(1)';
                info.style.transform = 'translateY(0)';
            });
        });
    }
}

// Animações dos cards MVV (Missão, Visão, Valores)
class MVVAnimations {
    constructor() {
        this.setupMVVCards();
    }

    setupMVVCards() {
        const mvvCards = document.querySelectorAll(SOBRE_CONFIG.selectors.mvvCards);
        
        mvvCards.forEach((card, index) => {
            // Hover effect personalizado
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.icon-shape');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                    icon.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.icon-shape');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                    icon.style.boxShadow = 'none';
                }
            });
        });
    }
}

// Animação dos steps do processo
class ProcessStepsAnimation {
    constructor() {
        this.steps = document.querySelectorAll(SOBRE_CONFIG.selectors.processSteps);
        this.setupSteps();
    }

    setupSteps() {
        this.steps.forEach((step, index) => {
            step.style.opacity = '0';
            step.style.transform = 'translateX(-30px)';
            step.style.transition = 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
        });
    }

    animateSteps() {
        this.steps.forEach((step, index) => {
            setTimeout(() => {
                step.style.opacity = '1';
                step.style.transform = 'translateX(0)';
            }, index * 150);
        });
    }
}

// Animação das certificações
class CertificacoesAnimation {
    constructor() {
        this.setupCertificacoes();
    }

    setupCertificacoes() {
        const certificacoes = document.querySelectorAll(SOBRE_CONFIG.selectors.certificacaoItem);
        
        certificacoes.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
            
            // Hover effect especial
            item.addEventListener('mouseenter', () => {
                const icon = item.querySelector('.cert-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(10deg)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                const icon = item.querySelector('.cert-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    animateCertificacoes() {
        const certificacoes = document.querySelectorAll(SOBRE_CONFIG.selectors.certificacaoItem);
        
        certificacoes.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Observer para animações ao scroll
class SobreScrollObserver {
    constructor() {
        this.counters = [];
        this.timelineAnimation = new TimelineAnimation();
        this.processStepsAnimation = new ProcessStepsAnimation();
        this.certificacoesAnimation = new CertificacoesAnimation();
        this.setupCounters();
        this.setupObserver();
    }

    setupCounters() {
        const counterElements = document.querySelectorAll(SOBRE_CONFIG.selectors.counters);
        
        counterElements.forEach(element => {
            const target = element.textContent;
            this.counters.push(new AnimatedCounter(element, target, SOBRE_CONFIG.animations.counterSpeed));
        });
    }

    setupObserver() {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleIntersection(entry.target);
                }
            });
        }, observerOptions);

        // Observar seções específicas
        const sectionsToObserve = [
            '.historia-stats',
            '.nossa-historia',
            '.processo-criacao',
            '.certificacoes'
        ];

        sectionsToObserve.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                observer.observe(element);
            }
        });
    }

    handleIntersection(target) {
        // Animar contadores quando a seção de estatísticas entra em vista
        if (target.classList.contains('historia-stats')) {
            this.counters.forEach((counter, index) => {
                setTimeout(() => {
                    counter.animate();
                }, index * SOBRE_CONFIG.animations.statsDelay);
            });
        }

        // Animar timeline quando a seção de história entra em vista
        if (target.classList.contains('nossa-historia')) {
            this.timelineAnimation.animateTimeline();
        }

        // Animar steps do processo
        if (target.classList.contains('processo-criacao')) {
            this.processStepsAnimation.animateSteps();
        }

        // Animar certificações
        if (target.classList.contains('certificacoes')) {
            this.certificacoesAnimation.animateCertificacoes();
        }
    }
}

// Parallax suave para elementos de fundo
class SobreParallax {
    constructor() {
        this.geometricBgs = document.querySelectorAll('.geometric-bg');
        this.setupParallax();
    }

    setupParallax() {
        if (this.geometricBgs.length === 0) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            
            this.geometricBgs.forEach((element, index) => {
                const speed = 0.2 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px) translateZ(0)`;
            });
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }
}

// Loading e reveal das imagens placeholder
class ImagePlaceholderEffects {
    constructor() {
        this.setupPlaceholderAnimations();
    }

    setupPlaceholderAnimations() {
        const placeholders = document.querySelectorAll('.image-placeholder, .photo-placeholder');
        
        placeholders.forEach((placeholder, index) => {
            // Adicionar efeito de loading suave
            placeholder.style.opacity = '0';
            placeholder.style.transform = 'scale(0.95)';
            placeholder.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
            
            // Animar entrada com delay
            setTimeout(() => {
                placeholder.style.opacity = '1';
                placeholder.style.transform = 'scale(1)';
            }, index * 200);
            
            // Hover effect
            placeholder.addEventListener('mouseenter', () => {
                placeholder.style.transform = 'scale(1.02)';
            });
            
            placeholder.addEventListener('mouseleave', () => {
                placeholder.style.transform = 'scale(1)';
            });
        });
    }
}

// Smooth scroll para links internos (se houver)
class SobreSmoothScroll {
    constructor() {
        this.setupSmoothScroll();
    }

    setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Sistema de feedback visual para interações
class SobreFeedbackSystem {
    constructor() {
        this.setupCardFeedback();
        this.setupButtonFeedback();
    }

    setupCardFeedback() {
        const interactiveCards = document.querySelectorAll(`
            ${SOBRE_CONFIG.selectors.mvvCards},
            ${SOBRE_CONFIG.selectors.equipeMember},
            ${SOBRE_CONFIG.selectors.diferencialCard},
            ${SOBRE_CONFIG.selectors.certificacaoItem}
        `);
        
        interactiveCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.cursor = 'pointer';
                this.addRippleEffect(card);
            });
        });
    }

    setupButtonFeedback() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createClickFeedback(e, button);
            });
        });
    }

    addRippleEffect(element) {
        // Efeito sutil de borda que aparece no hover
        const existingBorder = element.querySelector('.hover-border');
        if (existingBorder) return;
        
        const border = document.createElement('div');
        border.className = 'hover-border';
        border.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid var(--primary);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(border);
        
        // Mostrar borda
        setTimeout(() => {
            border.style.opacity = '0.3';
        }, 10);
        
        // Remover quando mouse sair
        element.addEventListener('mouseleave', () => {
            border.style.opacity = '0';
            setTimeout(() => {
                if (border.parentNode) {
                    border.parentNode.removeChild(border);
                }
            }, 300);
        });
    }

    createClickFeedback(event, button) {
        // Efeito de clique nos botões
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            left: ${x}px;
            top: ${y}px;
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;
        
        // Adicionar keyframes se ainda não existirem
        if (!document.querySelector('#ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes rippleEffect {
                    to {
                        transform: translate(-50%, -50%) scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // Remover após animação
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
}

// Performance monitor para a página
class SobrePerformanceMonitor {
    constructor() {
        this.setupPerformanceOptimizations();
    }

    setupPerformanceOptimizations() {
        // Lazy loading para imagens (quando implementadas)
        this.setupImageLazyLoading();
        
        // Debounce para eventos de scroll
        this.setupScrollOptimization();
        
        // Prefetch para páginas relacionadas
        this.setupPrefetch();
    }

    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }

    setupScrollOptimization() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(() => {
                // Código que precisa rodar após o scroll parar
                this.optimizeVisibleElements();
            }, 150);
        }, { passive: true });
    }

    setupPrefetch() {
        // Prefetch para páginas que o usuário provavelmente visitará
        const prefetchLinks = [
            '../paginas/produtos.html',
            '../paginas/contato.html',
            '../paginas/personalizar.html'
        ];
        
        prefetchLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
        });
    }

    optimizeVisibleElements() {
        // Otimizar elementos que estão visíveis na viewport
        const viewport = {
            top: window.pageYOffset,
            bottom: window.pageYOffset + window.innerHeight
        };
        
        // Implementar otimizações baseadas na viewport se necessário
    }
}

// Inicialização da página Sobre
class SobrePageManager {
    constructor() {
        this.isInitialized = false;
        this.initializePage();
    }

    initializePage() {
        if (this.isInitialized) return;
        
        try {
            // Aguardar DOM estar pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        } catch (error) {
            console.error('Erro na inicialização da página Sobre:', error);
        }
    }

    setup() {
        // Inicializar todos os componentes
        this.scrollObserver = new SobreScrollObserver();
        this.equipeAnimations = new EquipeAnimations();
        this.mvvAnimations = new MVVAnimations();
        this.parallax = new SobreParallax();
        this.imagePlaceholders = new ImagePlaceholderEffects();
        this.smoothScroll = new SobreSmoothScroll();
        this.feedbackSystem = new SobreFeedbackSystem();
        this.performanceMonitor = new SobrePerformanceMonitor();
        
        this.isInitialized = true;
        
        // Log para desenvolvimento
        console.log('Página Sobre inicializada com sucesso');
        
        // Emitir evento personalizado
        window.dispatchEvent(new CustomEvent('sobrePageReady', {
            detail: { timestamp: Date.now() }
        }));
    }

    // Método público para reinicializar se necessário
    reinitialize() {
        this.isInitialized = false;
        this.initializePage();
    }
}

// Auto-inicialização
const sobrePageManager = new SobrePageManager();

// Exportar para uso global se necessário
window.SobrePageManager = SobrePageManager;
window.sobrePageManager = sobrePageManager;