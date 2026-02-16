/**
 * ============================================
 * ANIMATIONS.JS - Scroll Animations & Effects
 * ============================================
 * 
 * Componente para gerenciar animações de scroll, parallax e outros efeitos
 * 
 * @module components/Animations
 */

/**
 * Classe para gerenciar animações
 */
export class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }

    /**
     * Inicializa o animation manager
     */
    init() {
        this.setupScrollAnimations();
        this.setupParallax();
    }

    /**
     * Configura animações de scroll (Intersection Observer)
     */
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.observerOptions);

        // Observar todos os elementos com classe scroll-animate
        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Configura efeito parallax para backgrounds geométricos
     */
    setupParallax() {
        let ticking = false;

        const handleParallax = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const geometricBgs = document.querySelectorAll('.geometric-bg');

                    geometricBgs.forEach((element, index) => {
                        const speed = 0.3 + (index * 0.1);
                        const yPos = -(scrolled * speed);
                        element.style.transform = `translateY(${yPos}px)`;
                    });

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleParallax, { passive: true });
    }
}

