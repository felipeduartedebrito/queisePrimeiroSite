/**
 * ============================================
 * HEADER.JS - Header Scroll Effects
 * ============================================
 * 
 * Componente para gerenciar efeitos de scroll do header
 * 
 * @module components/Header
 */

/**
 * Classe para gerenciar header scroll effects
 */
export class HeaderManager {
    constructor() {
        this.header = document.getElementById('header');
        this.lastScrollY = window.scrollY;
        this.scrollThreshold = 100;
        this.hideThreshold = 200;
        
        this.init();
    }

    /**
     * Inicializa o header manager
     */
    init() {
        // Só configura scroll effect se houver header
        if (this.header) {
            this.setupScrollEffect();
        } else {
            console.warn('Header element not found - scroll effects disabled');
        }
    }

    /**
     * Configura efeito de scroll
     */
    setupScrollEffect() {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            // Adicionar classe 'scrolled' para estilização
            if (scrollY > this.scrollThreshold) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            // Esconder header ao rolar para baixo, mostrar ao rolar para cima
            if (scrollY > this.lastScrollY && scrollY > this.hideThreshold) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }

            this.lastScrollY = scrollY;
        }, { passive: true });
    }

}

