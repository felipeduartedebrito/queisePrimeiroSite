/**
 * ============================================
 * HEADER.JS - Header Scroll Effects + Cart Badge
 * ============================================
 *
 * Componente para gerenciar efeitos de scroll do header
 * e manter o badge do carrinho sempre sincronizado com o localStorage.
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
        if (this.header) {
            this.setupScrollEffect();
        } else {
            console.warn('Header element not found - scroll effects disabled');
        }

        // Badge do carrinho: atualiza imediatamente e fica escutando eventos
        this.syncCartBadge();
        this.setupCartListeners();
    }

    /**
     * Lê o número real de itens direto do localStorage e atualiza o badge.
     * Leitura direta (sem módulos) para garantir que sempre funciona.
     */
    syncCartBadge() {
        const badge = document.getElementById('headerCartBadge');
        if (!badge) return;

        try {
            const raw   = localStorage.getItem('queise_cart');
            const cart  = raw ? JSON.parse(raw) : { items: [] };
            const count = (cart.items || []).reduce((total, item) => total + (item.quantity || 1), 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        } catch (e) {
            badge.style.display = 'none';
        }
    }

    /**
     * Escuta eventos de atualização do carrinho em qualquer página
     */
    setupCartListeners() {
        // Evento interno disparado ao adicionar/remover itens
        window.addEventListener('cartUpdated', () => this.syncCartBadge());

        // Evento do navegador para mudanças no localStorage de outras abas
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('cart')) {
                this.syncCartBadge();
            }
        });

        // bfcache: restauração pelo botão voltar/avançar do browser
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) this.syncCartBadge();
        });

        // Quando o usuário volta para esta aba ou janela
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.syncCartBadge();
        });
        window.addEventListener('focus', () => this.syncCartBadge());
    }

    /**
     * Configura efeito de scroll
     */
    setupScrollEffect() {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            if (scrollY > this.scrollThreshold) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            if (scrollY > this.lastScrollY && scrollY > this.hideThreshold) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }

            this.lastScrollY = scrollY;
        }, { passive: true });
    }

}

