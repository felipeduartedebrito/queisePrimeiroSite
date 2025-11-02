/**
 * ============================================
 * CARTBUTTON.JS - Botão do Carrinho com Contador
 * ============================================
 * 
 * Componente para exibir botão do carrinho com contador
 * Atualiza automaticamente quando carrinho muda
 * 
 * @module components/CartButton
 */

import { ROUTES, STORAGE_KEYS } from '../core/config.js';
import { CartStorage } from '../core/storage.js';
import { formatPrice, createElement } from '../core/utils.js';

// ========================================
// CLASSE CARTBUTTON
// ========================================

/**
 * Classe para gerenciar botão do carrinho
 */
export class CartButton {
    /**
     * Cria um novo botão de carrinho
     * @param {HTMLElement|string} container - Container ou seletor
     * @param {Object} options - Opções de exibição
     */
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container)
            : container;
        
        if (!this.container) {
            console.error('Container do CartButton não encontrado');
            return;
        }

        this.options = {
            showCount: true,
            showTotal: false,
            showIcon: true,
            animate: true,
            icon: '🛒',
            ...options
        };

        this.element = null;
        this.countBadge = null;
        this.totalElement = null;

        this.create();
        this.update();
        this.setupEventListeners();
    }

    /**
     * Cria o elemento DOM do botão
     */
    create() {
        // Container principal do botão
        this.element = createElement('a', {
            href: ROUTES.cart,
            'aria-label': 'Ir para o carrinho'
        }, ['cart-button']);

        // Ícone do carrinho
        if (this.options.showIcon) {
            const icon = createElement('span', {
                textContent: this.options.icon
            }, 'cart-icon');
            this.element.appendChild(icon);
        }

        // Badge com contador
        if (this.options.showCount) {
            this.countBadge = createElement('span', {
                textContent: '0'
            }, 'cart-count');
            this.element.appendChild(this.countBadge);
        }

        // Total (opcional)
        if (this.options.showTotal) {
            this.totalElement = createElement('span', {
                textContent: formatPrice(0)
            }, 'cart-total');
            this.element.appendChild(this.totalElement);
        }

        // Aplicar estilos inline
        this.applyStyles();

        // Adicionar ao container
        this.container.appendChild(this.element);
    }

    /**
     * Aplica estilos inline ao botão
     */
    applyStyles() {
        // Estilos do botão principal
        Object.assign(this.element.style, {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            color: 'inherit',
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        });

        // Hover effect
        this.element.addEventListener('mouseenter', () => {
            this.element.style.background = 'rgba(0,0,0,0.05)';
        });

        this.element.addEventListener('mouseleave', () => {
            this.element.style.background = 'transparent';
        });

        // Estilos do ícone
        const icon = this.element.querySelector('.cart-icon');
        if (icon) {
            Object.assign(icon.style, {
                fontSize: '1.5rem',
                lineHeight: '1'
            });
        }

        // Estilos do badge contador
        if (this.countBadge) {
            Object.assign(this.countBadge.style, {
                position: 'absolute',
                top: '0',
                right: '0',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
                background: '#dc3545',
                color: 'white',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translate(25%, -25%)',
                transition: 'transform 0.3s ease'
            });
        }

        // Estilos do total
        if (this.totalElement) {
            Object.assign(this.totalElement.style, {
                fontSize: '0.9rem',
                fontWeight: '600'
            });
        }
    }

    /**
     * Atualiza contador e total
     */
    update() {
        const count = CartStorage.getCount();
        const total = CartStorage.getTotal();

        // Atualizar contador
        if (this.countBadge) {
            this.countBadge.textContent = count;
            
            // Mostrar/esconder badge
            if (count > 0) {
                this.countBadge.style.display = 'flex';
                
                // Animação de pulse
                if (this.options.animate) {
                    this.animateBadge();
                }
            } else {
                this.countBadge.style.display = 'none';
            }
        }

        // Atualizar total
        if (this.totalElement) {
            this.totalElement.textContent = formatPrice(total);
        }
    }

    /**
     * Anima o badge quando contador muda
     */
    animateBadge() {
        // Animação de pulse
        this.countBadge.style.transform = 'translate(25%, -25%) scale(1.3)';
        
        setTimeout(() => {
            this.countBadge.style.transform = 'translate(25%, -25%) scale(1)';
        }, 200);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Escutar mudanças no carrinho
        window.addEventListener('cartUpdated', () => {
            this.update();
        });

        // Escutar mudanças no localStorage (de outras abas)
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.cart) {
                this.update();
            }
        });

        // Atualizar ao carregar página
        document.addEventListener('DOMContentLoaded', () => {
            this.update();
        });
    }

    /**
     * Força atualização manual
     */
    refresh() {
        this.update();
    }

    /**
     * Remove o botão do DOM
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// ========================================
// CLASSE CARTDRAWER (MINI CARRINHO)
// ========================================

/**
 * Mini carrinho que abre ao passar mouse/clicar
 */
export class CartDrawer extends CartButton {
    constructor(container, options = {}) {
        super(container, {
            showPreview: true,
            maxItems: 3,
            ...options
        });

        this.drawer = null;
        this.isOpen = false;

        this.createDrawer();
        this.setupDrawerListeners();
    }

    /**
     * Cria drawer (mini carrinho)
     */
    createDrawer() {
        this.drawer = createElement('div', {}, 'cart-drawer');

        // Header
        const header = createElement('div', {}, 'cart-drawer-header');
        const title = createElement('h3', {
            textContent: 'Meu Carrinho'
        });
        header.appendChild(title);

        // Items container
        this.itemsContainer = createElement('div', {}, 'cart-drawer-items');

        // Footer com total
        const footer = createElement('div', {}, 'cart-drawer-footer');
        
        this.drawerTotal = createElement('div', {}, 'cart-drawer-total');
        const totalLabel = createElement('span', {
            textContent: 'Total:'
        });
        this.drawerTotalValue = createElement('span', {
            textContent: formatPrice(0)
        }, 'total-value');
        this.drawerTotal.appendChild(totalLabel);
        this.drawerTotal.appendChild(this.drawerTotalValue);

        const viewCartBtn = createElement('a', {
            href: ROUTES.cart,
            textContent: 'Ver Carrinho Completo'
        }, ['btn', 'btn-primary']);

        footer.appendChild(this.drawerTotal);
        footer.appendChild(viewCartBtn);

        // Montar drawer
        this.drawer.appendChild(header);
        this.drawer.appendChild(this.itemsContainer);
        this.drawer.appendChild(footer);

        // Estilos do drawer
        Object.assign(this.drawer.style, {
            position: 'absolute',
            top: '100%',
            right: '0',
            width: '320px',
            maxHeight: '400px',
            background: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            borderRadius: '12px',
            marginTop: '0.5rem',
            padding: '1rem',
            display: 'none',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: '1000'
        });

        // Adicionar drawer ao container
        this.container.style.position = 'relative';
        this.container.appendChild(this.drawer);
    }

    /**
     * Setup listeners do drawer
     */
    setupDrawerListeners() {
        // Abrir ao hover
        this.element.addEventListener('mouseenter', () => {
            this.openDrawer();
        });

        // Fechar ao sair
        this.container.addEventListener('mouseleave', () => {
            this.closeDrawer();
        });

        // Atualizar drawer quando carrinho mudar
        window.addEventListener('cartUpdated', () => {
            this.updateDrawer();
        });
    }

    /**
     * Abre drawer
     */
    openDrawer() {
        this.updateDrawer();
        this.drawer.style.display = 'flex';
        this.isOpen = true;
    }

    /**
     * Fecha drawer
     */
    closeDrawer() {
        this.drawer.style.display = 'none';
        this.isOpen = false;
    }

    /**
     * Atualiza conteúdo do drawer
     */
    updateDrawer() {
        const cart = CartStorage.get();
        
        // Limpar items
        this.itemsContainer.innerHTML = '';

        if (cart.items.length === 0) {
            const empty = createElement('p', {
                textContent: 'Seu carrinho está vazio'
            }, 'cart-empty');
            this.itemsContainer.appendChild(empty);
        } else {
            // Mostrar apenas primeiros X items
            const itemsToShow = cart.items.slice(0, this.options.maxItems);
            
            itemsToShow.forEach(item => {
                const itemEl = this.createDrawerItem(item);
                this.itemsContainer.appendChild(itemEl);
            });

            // Se tem mais itens
            if (cart.items.length > this.options.maxItems) {
                const more = createElement('p', {
                    textContent: `+ ${cart.items.length - this.options.maxItems} itens`
                }, 'cart-more-items');
                this.itemsContainer.appendChild(more);
            }
        }

        // Atualizar total
        this.drawerTotalValue.textContent = formatPrice(CartStorage.getTotal());
    }

    /**
     * Cria item do drawer
     * @param {Object} item - Item do carrinho
     * @returns {HTMLElement}
     */
    createDrawerItem(item) {
        const itemEl = createElement('div', {}, 'cart-drawer-item');

        // Imagem
        const img = createElement('img', {
            src: item.image || '../imagens/placeholder-product.jpg',
            alt: item.name
        });
        Object.assign(img.style, {
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '8px'
        });

        // Info
        const info = createElement('div', {}, 'item-info');
        const name = createElement('div', {
            textContent: item.name
        });
        const price = createElement('div', {
            textContent: `${item.quantity}x ${formatPrice(item.basePrice)}`
        });
        Object.assign(price.style, {
            fontSize: '0.85rem',
            color: '#666'
        });

        info.appendChild(name);
        info.appendChild(price);

        itemEl.appendChild(img);
        itemEl.appendChild(info);

        Object.assign(itemEl.style, {
            display: 'flex',
            gap: '0.75rem',
            padding: '0.5rem',
            borderBottom: '1px solid #eee'
        });

        return itemEl;
    }

    /**
     * Override do update para também atualizar drawer
     */
    update() {
        super.update();
        if (this.isOpen) {
            this.updateDrawer();
        }
    }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default CartButton;

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
    window.CartButton = CartButton;
    window.CartDrawer = CartDrawer;
}
