// === JAVASCRIPT DA PÁGINA SOBRE - QUEISE ===

document.addEventListener('DOMContentLoaded', function() {
    // Configuração de animações de scroll
    initScrollAnimations();
    
    // Animação de números (contador)
    initCounterAnimations();
    
    // Animação da timeline
    initTimelineAnimations();
    
    // Efeitos de hover nos cards
    initCardHoverEffects();
    
    // Parallax suave no hero
    initParallaxEffect();
    
    // Loading das imagens placeholder
    initImagePlaceholders();
});

// === ANIMAÇÕES DE SCROLL ===
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Animação específica para grids
                if (entry.target.classList.contains('mvv-grid') || 
                    entry.target.classList.contains('diferenciais-grid') || 
                    entry.target.classList.contains('certificacoes-grid')) {
                    animateGridItems(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observar todas as seções animáveis
    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
}

// === ANIMAÇÃO DE GRID ITEMS ===
function animateGridItems(gridContainer) {
    const items = gridContainer.children;
    Array.from(items).forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// === ANIMAÇÃO DE CONTADORES ===
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString('pt-BR') + 
                                 (element.textContent.includes('+') ? '+' : '') +
                                 (element.textContent.includes('%') ? '%' : '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString('pt-BR') + 
                                 (element.textContent.includes('+') ? '+' : '') +
                                 (element.textContent.includes('%') ? '%' : '');
        }
    };
    
    requestAnimationFrame(updateCounter);
}

// === ANIMAÇÕES DA TIMELINE ===
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                
                // Animação especial para o ano
                const yearElement = entry.target.querySelector('.timeline-year');
                if (yearElement) {
                    setTimeout(() => {
                        yearElement.style.transform = 'scale(1)';
                        yearElement.style.opacity = '1';
                    }, 200);
                }
            }
        });
    }, { threshold: 0.3 });

    timelineItems.forEach((item, index) => {
        // Posicionamento inicial para animação
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `all 0.6s ease ${index * 0.2}s`;
        
        const yearElement = item.querySelector('.timeline-year');
        if (yearElement) {
            yearElement.style.transform = 'scale(0.8)';
            yearElement.style.opacity = '0';
            yearElement.style.transition = 'all 0.4s ease';
        }
        
        timelineObserver.observe(item);
    });
}

// === EFEITOS DE HOVER NOS CARDS ===
function initCardHoverEffects() {
    // MVV Cards
    const mvvCards = document.querySelectorAll('.mvv-card');
    mvvCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 25px 60px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        });
    });

    // Diferencial Cards
    const diferencialCards = document.querySelectorAll('.diferencial-card');
    diferencialCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.diferencial-icon');
            if (icon) {
                icon.style.transform = 'rotate(5deg) scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.diferencial-icon');
            if (icon) {
                icon.style.transform = 'rotate(0deg) scale(1)';
            }
        });
    });

    // Certificação Cards
    const certCards = document.querySelectorAll('.certificacao-item');
    certCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.cert-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.boxShadow = '0 10px 25px rgba(70, 130, 180, 0.3)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.cert-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
                icon.style.boxShadow = 'none';
            }
        });
    });
}

// === EFEITO PARALLAX ===
function initParallaxEffect() {
    const heroSection = document.querySelector('.hero-sobre');
    
    if (heroSection && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.3;
            
            heroSection.style.transform = `translateY(${parallax}px)`;
        });
    }
}

// === PLACEHOLDERS DE IMAGEM ===
function initImagePlaceholders() {
    const placeholders = document.querySelectorAll('.image-placeholder');
    
    placeholders.forEach(placeholder => {
        // Adicionar efeito de loading
        placeholder.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            this.style.opacity = '1';
            this.style.transform = 'scale(1.02)';
        });
        
        placeholder.addEventListener('mouseleave', function() {
            this.style.animation = 'pulse 2s infinite';
            this.style.transform = 'scale(1)';
        });
    });
}

// === SMOOTH SCROLL PARA LINKS INTERNOS ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// === OBSERVADOR DE MUDANÇA DE SEÇÃO PARA NAVEGAÇÃO ===
function initSectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                // Remover classe active de todos os links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Adicionar classe active ao link correspondente
                const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-20% 0px -20% 0px'
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// === OTIMIZAÇÃO DE PERFORMANCE ===
let ticking = false;

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
    }
}

function updateAnimations() {
    // Aqui podem ser adicionadas animações que dependem do scroll
    ticking = false;
}

// === LAZY LOADING PARA FUTURAS IMAGENS ===
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// === FUNCÕES DE UTILIDADE ===
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// === INICIALIZAÇÃO ADICIONAL ===
window.addEventListener('load', () => {
    // Remover animações de loading
    document.body.classList.add('loaded');
    
    // Inicializar lazy loading
    initLazyLoading();
    
    // Inicializar observador de seções
    initSectionObserver();
});

// === RESPONSIVIDADE DINÂMICA ===
window.addEventListener('resize', debounce(() => {
    // Recalcular animações se necessário
    if (window.innerWidth <= 768) {
        // Desabilitar parallax em mobile
        const heroSection = document.querySelector('.hero-sobre');
        if (heroSection) {
            heroSection.style.transform = 'none';
        }
    }
}, 250));

// === ACCESSIBILIDADE ===
document.addEventListener('keydown', (e) => {
    // Navegação por teclado aprimorada
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// === ANALYTICS E TRACKING (preparado para futuro) ===
function trackUserInteraction(action, section) {
    // Placeholder para analytics
    console.log(`User action: ${action} in section: ${section}`);
    
    // Futuro: Google Analytics, Facebook Pixel, etc.
    // gtag('event', action, { section: section });
}