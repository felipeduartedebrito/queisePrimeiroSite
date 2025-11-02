/**
 * ============================================
 * PRODUCTCARD.JS - Card de Produto Reutilizável
 * ============================================
 * 
 * Componente para renderizar cards de produtos
 * Usado em: listagem de produtos, busca, relacionados, etc.
 * 
 * @module components/ProductCard
 */

import { ROUTES } from '../core/config.js';
import { formatPrice, truncate, createElement } from '../core/utils.js';
import { CartStorage, RecentlyViewedStorage } from '../core/storage.js';
import { Notification } from './Notification.js';

// ========================================
// CLASSE PRODUCTCARD
// ========================================

/**
 * Classe para criar cards de produtos
 */
export class ProductCard {
    /**
     * Cria um novo card de produto
     * @param {Object} product - Dados do produto
     * @param {Object} options - Opções de exibição
     */
    constructor(product, options = {}) {
        this.product = product;
        this.options = {
            showQuickAdd: true,
            showCompare: false,
            showWishlist: false,
            imageSize: 'medium', // small, medium, large
            layout: 'grid', // grid, list
            ...options
        };
        
        this.element = null;
        this.create();
    }

    /**
     * Cria o elemento DOM do card
     */
    create() {
        // Container principal
        this.element = createElement('article', {
            'data-product-id': this.product.id,
            'data-product-handle': this.product.handle
        }, ['product-card', `product-card-${this.options.layout}`]);

        // Link principal (envolve imagem e info)
        const link = createElement('a', {
            href: `${ROUTES.productDetail}?id=${this.product.handle}`,
            'aria-label': `Ver detalhes de ${this.product.title}`
        }, 'product-card-link');

        // Imagem
        const imageContainer = this.createImageContainer();
        
        // Informações
        const info = this.createInfo();

        // Montar estrutura
        link.appendChild(imageContainer);
        link.appendChild(info);
        this.element.appendChild(link);

        // Ações (botões)
        if (this.options.showQuickAdd) {
            const actions = this.createActions();
            this.element.appendChild(actions);
        }

        // Event listeners
        this.attachEventListeners();

        return this.element;
    }

    /**
     * Cria container de imagem
     * @returns {HTMLElement}
     */
    createImageContainer() {
        const container = createElement('div', {}, 'product-card-image');

        // Imagem
        const img = createElement('img', {
            src: this.product.images?.[0]?.url || '../imagens/placeholder-product.jpg',
            alt: this.product.title,
            loading: 'lazy'
        }, 'product-image');

        container.appendChild(img);

        // Badges (novo, desconto, etc)
        const badges = this.createBadges();
        if (badges) {
            container.appendChild(badges);
        }

        return container;
    }

    /**
     * Cria badges (etiquetas)
     * @returns {HTMLElement|null}
     */
    createBadges() {
        const badgesContainer = createElement('div', {}, 'product-badges');
        let hasBadges = false;

        // Badge de desconto
        if (this.product.compareAtPrice && this.product.compareAtPrice > this.product.price) {
            const discount = Math.round(
                ((this.product.compareAtPrice - this.product.price) / this.product.compareAtPrice) * 100
            );
            
            const badge = createElement('span', {
                textContent: `-${discount}%`
            }, ['product-badge', 'badge-discount']);
            
            badgesContainer.appendChild(badge);
            hasBadges = true;
        }

        // Badge novo (produtos com menos de 30 dias)
        if (this.product.createdAt) {
            const daysSinceCreation = Math.floor(
                (Date.now() - new Date(this.product.createdAt)) / (1000 * 60 * 60 * 24)
            );
            
            if (daysSinceCreation < 30) {
                const badge = createElement('span', {
                    textContent: 'Novo'
                }, ['product-badge', 'badge-new']);
                
                badgesContainer.appendChild(badge);
                hasBadges = true;
            }
        }

        // Badge personalizado
        if (this.product.tags?.includes('Premium')) {
            const badge = createElement('span', {
                textContent: 'Premium'
            }, ['product-badge', 'badge-premium']);
            
            badgesContainer.appendChild(badge);
            hasBadges = true;
        }

        return hasBadges ? badgesContainer : null;
    }

    /**
     * Cria seção de informações
     * @returns {HTMLElement}
     */
    createInfo() {
        const info = createElement('div', {}, 'product-card-info');

        // Categoria/Vendor
        if (this.product.vendor) {
            const vendor = createElement('span', {
                textContent: this.product.vendor
            }, 'product-vendor');
            info.appendChild(vendor);
        }

        // Título
        const title = createElement('h3', {
            textContent: truncate(this.product.title, 60)
        }, 'product-title');
        info.appendChild(title);

        // Descrição (apenas no layout list)
        if (this.options.layout === 'list' && this.product.description) {
            const description = createElement('p', {
                textContent: truncate(this.product.description, 120)
            }, 'product-description');
            info.appendChild(description);
        }

        // Preços
        const priceContainer = this.createPriceContainer();
        info.appendChild(priceContainer);

        // Avaliações (se disponível)
        if (this.product.rating) {
            const rating = this.createRating();
            info.appendChild(rating);
        }

        return info;
    }

    /**
     * Cria container de preços
     * @returns {HTMLElement}
     */
    createPriceContainer() {
        const container = createElement('div', {}, 'product-price-container');

        // Preço atual
        const price = createElement('span', {
            textContent: formatPrice(this.product.price)
        }, 'product-price');
        container.appendChild(price);

        // Preço comparativo (se houver)
        if (this.product.compareAtPrice && this.product.compareAtPrice > this.product.price) {
            const comparePrice = createElement('span', {
                textContent: formatPrice(this.product.compareAtPrice)
            }, 'product-compare-price');
            container.appendChild(comparePrice);
        }

        return container;
    }

    /**
     * Cria indicador de avaliação
     * @returns {HTMLElement}
     */
    createRating() {
        const container = createElement('div', {}, 'product-rating');

        // Estrelas
        const stars = createElement('span', {
            textContent: '★'.repeat(Math.round(this.product.rating))
        }, 'rating-stars');
        container.appendChild(stars);

        // Número de avaliações
        if (this.product.reviewCount) {
            const count = createElement('span', {
                textContent: `(${this.product.reviewCount})`
            }, 'rating-count');
            container.appendChild(count);
        }

        return container;
    }

    /**
     * Cria seção de ações (botões)
     * @returns {HTMLElement}
     */
    createActions() {
        const actions = createElement('div', {}, 'product-card-actions');

        // Botão adicionar ao carrinho
        const addToCartBtn = createElement('button', {
            textContent: 'Adicionar ao Carrinho',
            type: 'button'
        }, ['btn', 'btn-add-cart']);

        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.addToCart();
        });

        actions.appendChild(addToCartBtn);

        // Botão wishlist (se habilitado)
        if (this.options.showWishlist) {
            const wishlistBtn = createElement('button', {
                innerHTML: '♡',
                type: 'button',
                'aria-label': 'Adicionar aos favoritos'
            }, ['btn', 'btn-wishlist']);

            wishlistBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleWishlist();
            });

            actions.appendChild(wishlistBtn);
        }

        return actions;
    }

    /**
     * Adiciona produto ao carrinho
     */
    async addToCart() {
        try {
            // Criar item do carrinho
            const cartItem = {
                id: `${this.product.id}-${Date.now()}`,
                handle: this.product.handle,
                name: this.product.title,
                basePrice: this.product.price,
                image: this.product.images?.[0]?.url,
                quantity: 1,
                variant: this.product.variants?.[0] || {}
            };

            // Adicionar ao storage
            const success = CartStorage.addItem(cartItem);

            if (success) {
                // Notificação de sucesso
                Notification.success('Produto adicionado ao carrinho!');

                // Disparar evento customizado para atualizar contador
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { count: CartStorage.getCount() }
                }));

                // Feedback visual no botão
                const btn = this.element.querySelector('.btn-add-cart');
                const originalText = btn.textContent;
                btn.textContent = '✓ Adicionado!';
                btn.classList.add('success');

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('success');
                }, 2000);
            } else {
                throw new Error('Falha ao adicionar ao carrinho');
            }

        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            Notification.error('Não foi possível adicionar ao carrinho');
        }
    }

    /**
     * Toggle wishlist
     */
    toggleWishlist() {
        // TODO: Implementar funcionalidade de wishlist
        Notification.info('Funcionalidade em desenvolvimento');
    }

    /**
     * Anexa event listeners
     */
    attachEventListeners() {
        // Ao clicar no card, adicionar aos visualizados recentemente
        this.element.addEventListener('click', () => {
            RecentlyViewedStorage.add({
                id: this.product.id,
                handle: this.product.handle,
                title: this.product.title,
                price: this.product.price,
                image: this.product.images?.[0]?.url
            });
        });

        // Hover effects já são gerenciados por CSS
    }

    /**
     * Retorna o elemento DOM
     * @returns {HTMLElement}
     */
    getElement() {
        return this.element;
    }

    /**
     * Atualiza dados do produto
     * @param {Object} newData - Novos dados
     */
    update(newData) {
        this.product = { ...this.product, ...newData };
        
        // Re-criar card
        const parent = this.element.parentNode;
        const nextSibling = this.element.nextSibling;
        
        parent.removeChild(this.element);
        this.create();
        
        if (nextSibling) {
            parent.insertBefore(this.element, nextSibling);
        } else {
            parent.appendChild(this.element);
        }
    }

    /**
     * Remove o card do DOM
     */
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// ========================================
// MÉTODO ESTÁTICO PARA RENDERIZAÇÃO EM LOTE
// ========================================

/**
 * Renderiza múltiplos cards de produtos
 * @param {Array} products - Array de produtos
 * @param {HTMLElement} container - Container onde renderizar
 * @param {Object} options - Opções de renderização
 */
ProductCard.renderMany = function(products, container, options = {}) {
    // Limpar container
    container.innerHTML = '';

    // Criar e adicionar cards
    const cards = products.map(product => {
        const card = new ProductCard(product, options);
        return card;
    });

    // Adicionar ao container
    cards.forEach(card => {
        container.appendChild(card.getElement());
    });

    return cards;
};

// ========================================
// EXPORTAÇÕES
// ========================================

export default ProductCard;
