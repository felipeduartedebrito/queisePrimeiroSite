/**
 * ============================================
 * ACCESSIBILITY.JS - Accessibility Features
 * ============================================
 * 
 * Componente para melhorias de acessibilidade
 * 
 * @module components/Accessibility
 */

/**
 * Classe para gerenciar recursos de acessibilidade
 */
export class AccessibilityManager {
    constructor() {
        this.init();
    }

    /**
     * Inicializa o accessibility manager
     */
    init() {
        this.setupKeyboardNavigation();
        this.setupARIALabels();
        this.setupCardAccessibility();
    }

    /**
     * Configura navegação por teclado
     */
    setupKeyboardNavigation() {
        // Adicionar indicadores de foco para navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        // Remover indicadores de foco para usuários de mouse
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Configura labels e roles ARIA
     */
    setupARIALabels() {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            if (!link.getAttribute('role')) {
                link.setAttribute('role', 'menuitem');
            }
        });
    }

    /**
     * Configura acessibilidade para cards
     */
    setupCardAccessibility() {
        const cards = document.querySelectorAll('.product-card, .collection-card');
        cards.forEach(card => {
            // Tornar cards focáveis
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
            
            if (!card.getAttribute('role')) {
                card.setAttribute('role', 'button');
            }

            // Adicionar interação por teclado
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }
}

