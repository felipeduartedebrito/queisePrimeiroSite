// QUEISE - Premium JavaScript

// DOM Elements
const pageLoader = document.getElementById('pageLoader');
const header = document.getElementById('header');

// Page Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        pageLoader.classList.add('hidden');
    }, 1200);
});

// Header Scroll Effect
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Add scrolled class for styling
    if (scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Hide header on scroll down, show on scroll up
    if (scrollY > lastScrollY && scrollY > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScrollY = scrollY;
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll Animations (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all scroll-animate elements
document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el);
});

// Enhanced Card Interactions
const setupCardHovers = () => {
    document.querySelectorAll('.product-card, .collection-card, .featured-main, .featured-side, .empresa-card').forEach(card => {
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
};

// Parallax Effect for Geometric Backgrounds
const setupParallax = () => {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const geometricBgs = document.querySelectorAll('.geometric-bg');

        geometricBgs.forEach((element, index) => {
            const speed = 0.3 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
};

// Button Animation Effects
const setupButtonAnimations = () => {
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
};

// Feature Icon Hover Effects
const setupFeatureHovers = () => {
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
};

// Form Handling Simulation
const setupFormHandling = () => {
    document.querySelectorAll('a[href="#personalizar"], a[href="#contato"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const action = this.getAttribute('href') === '#personalizar' ? 'personalização' : 'contato';

            // Show alert with contact information
            alert(`Funcionalidade de ${action} será implementada. Por enquanto, entre em contato via WhatsApp: (11) 99999-9999 ou email: contato@queise.com.br`);

            // Future implementation options:
            // 1. Open a modal with a contact/personalization form
            // 2. Redirect to a dedicated form page
            // 3. Trigger a chat widget
            // 4. Open email client with pre-filled template
        });
    });
};

// Dynamic Pricing Effects
const setupPricingEffects = () => {
    document.querySelectorAll('.product-price, .featured-price').forEach(price => {
        price.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        price.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });
};

// Image Error Handling
const setupImageFallbacks = () => {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            // Handle image loading errors gracefully
            console.log(`Failed to load image: ${this.src}`);

            // You can implement fallback logic here:
            // 1. Replace with placeholder image
            // 2. Hide the image container
            // 3. Show alternative content

            // Example: Hide failed images
            this.style.display = 'none';
        });
    });
};

// Performance Optimization
const setupPerformanceOptimizations = () => {
    // Throttle scroll events for better performance
    let ticking = false;

    const optimizedScrollHandler = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                // Scroll-dependent animations go here
                ticking = false;
            });
            ticking = true;
        }
    };

    // Use passive listeners for better scroll performance
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
};

// Accessibility Enhancements
const setupAccessibility = () => {
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Add focus indicators for keyboard navigation
            document.body.classList.add('keyboard-navigation');
        }
    });

    // Remove focus indicators for mouse users
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Add ARIA labels and roles where needed
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.setAttribute('role', 'menuitem');
    });

    // Make cards focusable and add keyboard interaction
    const cards = document.querySelectorAll('.product-card, .collection-card');
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
};

// Initialize all functionality
const initializeApp = () => {
    // Setup all interactive elements
    setupCardHovers();
    setupParallax();
    setupButtonAnimations();
    setupFeatureHovers();
    setupFormHandling();
    setupPricingEffects();
    setupImageFallbacks();
    setupPerformanceOptimizations();
    setupAccessibility();

    // Add any additional initialization logic here
    console.log('QUEISE website initialized successfully');
};

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export functions for potential use in other scripts
window.QueiseApp = {
    setupCardHovers,
    setupParallax,
    setupButtonAnimations,
    setupFeatureHovers,
    setupFormHandling,
    setupPricingEffects,
    setupImageFallbacks,
    setupPerformanceOptimizations,
    setupAccessibility
};

// Service Worker Registration (for future PWA implementation)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is ready
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(registrationError => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}