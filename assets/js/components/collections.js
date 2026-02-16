/**
 * ============================================
 * COLLECTIONS.JS - Collections Page Component
 * ============================================
 * 
 * Componente para gerenciar a página de coleções
 * 
 * @module components/Collections
 */

import { debounce } from '../core/utils.js';

/**
 * Classe para gerenciar página de coleções
 */
export class CollectionsManager {
    constructor() {
        this.collectionCards = document.querySelectorAll('.collection-card');
        this.garrafasCard = document.querySelector('.collection-card[data-category="garrafas"]');
        
        this.init();
    }

    init() {
        this.setupCollectionInteractions();
        this.setupSubcollectionsDropdown();
        this.setupScrollAnimations();
        this.setupResponsiveHandling();
        
        console.log('✅ Collections page initialized with', this.collectionCards.length, 'collections');
    }

    // ========================================
    // INTERAÇÕES DE COLEÇÕES
    // ========================================

    setupCollectionInteractions() {
        this.collectionCards.forEach(card => {
            card.addEventListener('click', (e) => this.handleCollectionClick(e));
            card.addEventListener('mouseenter', (e) => this.handleCollectionHover(e));
            card.addEventListener('mouseleave', (e) => this.handleCollectionLeave(e));
            
            // Keyboard navigation
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        });
    }

    handleCollectionClick(event) {
        const card = event.currentTarget;
        const category = card.dataset.category;
        const link = card.querySelector('.collection-link');
        
        // Não navegar se clicando no dropdown de subcoleções
        if (event.target.closest('.subcollections-dropdown')) {
            return;
        }

        // Adicionar estado de loading
        card.classList.add('loading');
        
        // Simular delay de loading para melhor UX
        setTimeout(() => {
            if (link) {
                window.location.href = link.href;
            }
        }, 300);

        // Track analytics
        this.trackCollectionClick(category);
    }

    handleCollectionHover(event) {
        const card = event.currentTarget;
        const category = card.dataset.category;
        
        // Adicionar estado de hover aprimorado
        card.style.transform = 'translateY(-12px) scale(1.02)';
        
        // Mostrar tooltip para subcoleções
        if (category === 'garrafas') {
            this.showSubcollectionsTooltip(card);
        }
    }

    handleCollectionLeave(event) {
        const card = event.currentTarget;
        
        // Resetar estado de hover
        card.style.transform = '';
        
        // Esconder tooltip
        this.hideSubcollectionsTooltip();
    }

    handleKeyboardNavigation(event) {
        const card = event.currentTarget;
        
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            card.click();
        }
        
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            this.focusNextCollection(card);
        }
        
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.focusPreviousCollection(card);
        }
    }

    focusNextCollection(currentCard) {
        const cards = Array.from(this.collectionCards);
        const currentIndex = cards.indexOf(currentCard);
        const nextIndex = (currentIndex + 1) % cards.length;
        cards[nextIndex].focus();
    }

    focusPreviousCollection(currentCard) {
        const cards = Array.from(this.collectionCards);
        const currentIndex = cards.indexOf(currentCard);
        const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
        cards[prevIndex].focus();
    }

    // ========================================
    // DROPDOWN DE SUBCOLEÇÕES
    // ========================================

    setupSubcollectionsDropdown() {
        if (!this.garrafasCard) return;

        const dropdown = this.garrafasCard.querySelector('.subcollections-dropdown');
        const subcollectionItems = dropdown?.querySelectorAll('.subcollection-item');
        
        if (!dropdown || !subcollectionItems.length) return;

        // Adicionar interações aprimoradas aos itens de subcoleção
        subcollectionItems.forEach((item, index) => {
            // Atrasos de animação escalonados
            item.style.animationDelay = `${index * 0.1}s`;
            
            // Adicionar handlers de clique
            item.addEventListener('click', (e) => this.handleSubcollectionClick(e));
            
            // Adicionar efeitos de hover
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(8px) scale(1.02)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
            });
        });

        // Lidar com visibilidade do dropdown em mobile
        if (window.innerWidth <= 768) {
            this.setupMobileSubcollections();
        }
    }

    handleSubcollectionClick(event) {
        event.stopPropagation();
        const item = event.currentTarget;
        const subcategory = item.href.split('subcategoria=')[1];
        
        // Adicionar estado de loading
        item.style.opacity = '0.7';
        item.style.pointerEvents = 'none';
        
        // Track analytics
        this.trackSubcollectionClick(subcategory);
        
        // Navegar após breve delay
        setTimeout(() => {
            window.location.href = item.href;
        }, 200);
    }

    setupMobileSubcollections() {
        if (!this.garrafasCard) return;

        const dropdown = this.garrafasCard.querySelector('.subcollections-dropdown');
        if (!dropdown) return;

        // Mostrar dropdown por padrão em mobile
        dropdown.style.position = 'static';
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.transform = 'none';
        dropdown.style.marginTop = '1rem';

        // Adicionar funcionalidade de toggle
        const toggleButton = document.createElement('button');
        toggleButton.className = 'subcollections-toggle';
        toggleButton.innerHTML = 'Ver Subcoleções <span>▼</span>';
        toggleButton.style.cssText = `
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #4682B4 0%, #5F9EA0 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        const content = this.garrafasCard.querySelector('.collection-content');
        if (content) {
            content.appendChild(toggleButton);
        }

        let isExpanded = false;
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            
            dropdown.style.display = isExpanded ? 'block' : 'none';
            toggleButton.querySelector('span').textContent = isExpanded ? '▲' : '▼';
            toggleButton.innerHTML = `${isExpanded ? 'Ocultar' : 'Ver'} Subcoleções <span>${isExpanded ? '▲' : '▼'}</span>`;
        });

        // Inicialmente esconder dropdown
        dropdown.style.display = 'none';
    }

    // ========================================
    // TOOLTIP
    // ========================================

    showSubcollectionsTooltip(card) {
        // Apenas mostrar em desktop
        if (window.innerWidth <= 768) return;

        const existingTooltip = document.querySelector('.collections-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'collections-tooltip';
        tooltip.innerHTML = '7 subcoleções disponíveis';
        tooltip.style.cssText = `
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            white-space: nowrap;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;

        card.style.position = 'relative';
        card.appendChild(tooltip);

        // Fade in tooltip
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 100);
    }

    hideSubcollectionsTooltip() {
        const tooltip = document.querySelector('.collections-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.remove();
            }, 300);
        }
    }

    // ========================================
    // ANIMAÇÕES DE SCROLL
    // ========================================

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar cards de coleção
        this.collectionCards.forEach(card => {
            observer.observe(card);
        });

        // Observar seções de banner
        const bannerSections = document.querySelectorAll('.banner-section');
        bannerSections.forEach(banner => {
            observer.observe(banner);
        });
    }

    // ========================================
    // RESPONSIVIDADE
    // ========================================

    setupResponsiveHandling() {
        window.addEventListener('resize', debounce(() => {
            // Reinicializar subcoleções mobile se necessário
            if (window.innerWidth <= 768) {
                this.setupMobileSubcollections();
            } else {
                // Remover elementos específicos de mobile no desktop
                const toggleButton = document.querySelector('.subcollections-toggle');
                if (toggleButton) {
                    toggleButton.remove();
                }
                
                // Resetar estilos do dropdown
                const dropdown = document.querySelector('.subcollections-dropdown');
                if (dropdown) {
                    dropdown.style.cssText = '';
                }
            }
        }, 250));
    }

    // ========================================
    // ANALYTICS
    // ========================================

    trackCollectionClick(category) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'collection_click', {
                event_category: 'Collections',
                event_label: category,
                value: 1
            });
        }
        
        console.log(`Collection clicked: ${category}`);
    }

    trackSubcollectionClick(subcategory) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'subcollection_click', {
                event_category: 'Collections',
                event_label: subcategory,
                value: 1
            });
        }
        
        console.log(`Subcollection clicked: ${subcategory}`);
    }
}

