/**
 * ============================================
 * APP.JS - Main Application Entry Point
 * ============================================
 * 
 * Ponto de entrada principal da aplicação
 * Inicializa todos os componentes do site
 * 
 * @module app
 */

import { HeaderManager } from './components/header.js';
import { AnimationManager } from './components/animations.js';
import { InteractionManager } from './components/interactions.js';
import { AccessibilityManager } from './components/accessibility.js';
import { initPersonalizationGuard } from './core/personalization-guard.js';

/**
 * Classe principal da aplicação
 */
class QueiseApp {
    constructor() {
        this.headerManager = null;
        this.animationManager = null;
        this.interactionManager = null;
        this.accessibilityManager = null;
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        // Inicializar page loader
        this.initPageLoader();

        // Inicializar componentes
        this.headerManager = new HeaderManager();
        this.animationManager = new AnimationManager();
        this.interactionManager = new InteractionManager();
        this.accessibilityManager = new AccessibilityManager();

        // Inicializar guard de personalização (oculta/desabilita links se desabilitado)
        initPersonalizationGuard();

        // Otimizações de performance
        this.setupPerformanceOptimizations();

        console.log('✅ QUEISE website initialized successfully');
    }

    /**
     * Inicializa page loader
     */
    initPageLoader() {
        const pageLoader = document.getElementById('pageLoader');
        if (pageLoader) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    pageLoader.classList.add('hidden');
                }, 1200);
            });
        }
    }

    /**
     * Configura otimizações de performance
     */
    setupPerformanceOptimizations() {
        // Throttle scroll events para melhor performance
        let ticking = false;

        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Animações dependentes de scroll vão aqui
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Usar listeners passivos para melhor performance de scroll
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }
}

// Inicializar aplicação quando DOM estiver pronto
const app = new QueiseApp();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    app.init();
}

// Exportar para uso global se necessário
window.QueiseApp = app;

// Service Worker Registration (para futura implementação PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Descomentar quando service worker estiver pronto
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(registrationError => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}

export default app;

