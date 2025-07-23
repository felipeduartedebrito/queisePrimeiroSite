// PÁGINA DE COLEÇÕES - QUEISE JavaScript

// DOM Elements
const collectionCards = document.querySelectorAll('.collection-card');
const subcollectionsDropdown = document.querySelector('.subcollections-dropdown');
const garrafasCard = document.querySelector('.collection-card[data-category="garrafas"]');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeCollections();
    setupCollectionInteractions();
    setupSubcollectionsDropdown();
    setupScrollAnimations();
    setupAnalytics();
});

// Initialize collections functionality
function initializeCollections() {
    // Add click handlers to collection cards
    collectionCards.forEach(card => {
        card.addEventListener('click', handleCollectionClick);
        card.addEventListener('mouseenter', handleCollectionHover);
        card.addEventListener('mouseleave', handleCollectionLeave);
    });

    // Add keyboard navigation
    collectionCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', handleKeyboardNavigation);
    });

    console.log('Collections page initialized with', collectionCards.length, 'collections');
}

// Handle collection card clicks
function handleCollectionClick(event) {
    const card = event.currentTarget;
    const category = card.dataset.category;
    const link = card.querySelector('.collection-link');
    
    // Don't navigate if clicking on subcollections dropdown
    if (event.target.closest('.subcollections-dropdown')) {
        return;
    }

    // Add loading state
    card.classList.add('loading');
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        if (link) {
            window.location.href = link.href;
        }
    }, 300);

    // Track analytics
    trackCollectionClick(category);
}

// Handle collection hover effects
function handleCollectionHover(event) {
    const card = event.currentTarget;
    const category = card.dataset.category;
    
    // Add enhanced hover state
    card.style.transform = 'translateY(-12px) scale(1.02)';
    
    // Show tooltip for subcollections
    if (category === 'garrafas') {
        showSubcollectionsTooltip(card);
    }
}

function handleCollectionLeave(event) {
    const card = event.currentTarget;
    
    // Reset hover state
    card.style.transform = '';
    
    // Hide tooltip
    hideSubcollectionsTooltip();
}

// Keyboard navigation support
function handleKeyboardNavigation(event) {
    const card = event.currentTarget;
    
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
    }
    
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        focusNextCollection(card);
    }
    
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusPreviousCollection(card);
    }
}

function focusNextCollection(currentCard) {
    const cards = Array.from(collectionCards);
    const currentIndex = cards.indexOf(currentCard);
    const nextIndex = (currentIndex + 1) % cards.length;
    cards[nextIndex].focus();
}

function focusPreviousCollection(currentCard) {
    const cards = Array.from(collectionCards);
    const currentIndex = cards.indexOf(currentCard);
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    cards[prevIndex].focus();
}

// Enhanced subcollections dropdown functionality
function setupSubcollectionsDropdown() {
    if (!garrafasCard) return;

    const dropdown = garrafasCard.querySelector('.subcollections-dropdown');
    const subcollectionItems = dropdown?.querySelectorAll('.subcollection-item');
    
    if (!dropdown || !subcollectionItems.length) return;

    // Add enhanced interactions to subcollection items
    subcollectionItems.forEach((item, index) => {
        // Stagger animation delays
        item.style.animationDelay = `${index * 0.1}s`;
        
        // Add click handlers
        item.addEventListener('click', handleSubcollectionClick);
        
        // Add hover effects
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(8px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    });

    // Handle dropdown visibility on mobile
    if (window.innerWidth <= 768) {
        setupMobileSubcollections();
    }
}

function handleSubcollectionClick(event) {
    event.stopPropagation();
    const item = event.currentTarget;
    const subcategory = item.href.split('subcategoria=')[1];
    
    // Add loading state
    item.style.opacity = '0.7';
    item.style.pointerEvents = 'none';
    
    // Track analytics
    trackSubcollectionClick(subcategory);
    
    // Navigate after brief delay
    setTimeout(() => {
        window.location.href = item.href;
    }, 200);
}

// Mobile subcollections handling
function setupMobileSubcollections() {
    if (!garrafasCard) return;

    const dropdown = garrafasCard.querySelector('.subcollections-dropdown');
    if (!dropdown) return;

    // Show dropdown by default on mobile
    dropdown.style.position = 'static';
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'none';
    dropdown.style.marginTop = '1rem';

    // Add toggle functionality
    const toggleButton = document.createElement('button');
    toggleButton.className = 'subcollections-toggle';
    toggleButton.innerHTML = 'Ver Subcoleções <span>▼</span>';
    toggleButton.style.cssText = `
        width: 100%;
        padding: 1rem;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    garrafasCard.querySelector('.collection-content').appendChild(toggleButton);

    let isExpanded = false;
    toggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        
        dropdown.style.display = isExpanded ? 'block' : 'none';
        toggleButton.querySelector('span').textContent = isExpanded ? '▲' : '▼';
        toggleButton.innerHTML = `${isExpanded ? 'Ocultar' : 'Ver'} Subcoleções <span>${isExpanded ? '▲' : '▼'}</span>`;
    });

    // Initially hide dropdown
    dropdown.style.display = 'none';
}

// Tooltip functionality
function showSubcollectionsTooltip(card) {
    // Only show on desktop
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
        background: var(--text-dark);
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

function hideSubcollectionsTooltip() {
    const tooltip = document.querySelector('.collections-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            tooltip.remove();
        }, 300);
    }
}

// Scroll animations
function setupScrollAnimations() {
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

    // Observe collection cards
    collectionCards.forEach(card => {
        observer.observe(card);
    });

    // Observe banner sections
    const bannerSections = document.querySelectorAll('.banner-section');
    bannerSections.forEach(banner => {
        observer.observe(banner);
    });
}

// Performance optimizations
function setupPerformanceOptimizations() {
    // Lazy load images when they come into view
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Analytics tracking
function setupAnalytics() {
    // Track page view
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: 'Coleções',
            page_location: window.location.href
        });
    }

    // Track time spent on page
    const startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackTimeSpent('collections', timeSpent);
    });
}

function trackCollectionClick(category) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'collection_click', {
            event_category: 'Collections',
            event_label: category,
            value: 1
        });
    }
    
    console.log(`Collection clicked: ${category}`);
}

function trackSubcollectionClick(subcategory) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'subcollection_click', {
            event_category: 'Collections',
            event_label: subcategory,
            value: 1
        });
    }
    
    console.log(`Subcollection clicked: ${subcategory}`);
}

function trackTimeSpent(page, seconds) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'time_spent', {
            event_category: 'Engagement',
            event_label: page,
            value: seconds
        });
    }
}

// Search functionality for collections
function setupCollectionSearch() {
    const searchInput = document.getElementById('collections-search');
    if (!searchInput) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterCollections(e.target.value.toLowerCase());
        }, 300);
    });
}

function filterCollections(query) {
    collectionCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        const matches = title.includes(query) || description.includes(query);
        
        card.style.display = matches ? 'block' : 'none';
        
        if (matches) {
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        }
    });
    
    // Track search
    if (query) {
        trackCollectionSearch(query);
    }
}

function trackCollectionSearch(query) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
            search_term: query,
            event_category: 'Collections'
        });
    }
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('Collections page error:', event.error);
    
    // Track errors for debugging
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Responsive handling
window.addEventListener('resize', debounce(() => {
    // Reinitialize mobile subcollections if needed
    if (window.innerWidth <= 768) {
        setupMobileSubcollections();
    } else {
        // Remove mobile-specific elements on desktop
        const toggleButton = document.querySelector('.subcollections-toggle');
        if (toggleButton) {
            toggleButton.remove();
        }
        
        // Reset dropdown styles
        const dropdown = document.querySelector('.subcollections-dropdown');
        if (dropdown) {
            dropdown.style.cssText = '';
        }
    }
}, 250));

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCollections,
        handleCollectionClick,
        setupSubcollectionsDropdown,
        trackCollectionClick,
        filterCollections
    };
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCollections);
} else {
    initializeCollections();
}