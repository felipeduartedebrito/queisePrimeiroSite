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

// Popup "Página em Desenvolvimento"
(function () {
    const style = document.createElement('style');
    style.textContent = `
        .queise-dev-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 99999;
            align-items: center;
            justify-content: center;
        }
        .queise-dev-overlay.ativo { display: flex; }
        .queise-dev-popup {
            background: #fff;
            border-radius: 20px;
            padding: 48px 40px 40px;
            max-width: 420px;
            width: 90%;
            text-align: center;
            box-shadow: 0 24px 64px rgba(0,0,0,0.18);
            animation: queisePopupIn .25s ease;
        }
        @keyframes queisePopupIn {
            from { opacity:0; transform: scale(.92) translateY(12px); }
            to   { opacity:1; transform: scale(1)  translateY(0); }
        }
        .queise-dev-popup .dev-icon { font-size: 3rem; margin-bottom: 16px; }
        .queise-dev-popup h3 {
            font-size: 1.4rem;
            font-weight: 700;
            color: #4682B4;
            margin-bottom: 12px;
        }
        .queise-dev-popup p {
            color: #6c757d;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 28px;
        }
        .queise-dev-close {
            background: linear-gradient(135deg, #4682B4, #5F9EA0);
            color: #fff;
            border: none;
            border-radius: 50px;
            padding: 12px 32px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform .2s, box-shadow .2s;
        }
        .queise-dev-close:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(70,130,180,.35);
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'queise-dev-overlay';
    overlay.innerHTML = `
        <div class="queise-dev-popup">
            <div class="dev-icon">🚧</div>
            <h3>Página em Desenvolvimento</h3>
            <p>Estamos trabalhando nessa área para trazer a melhor experiência para você. Em breve estará disponível!</p>
            <button class="queise-dev-close">Entendido</button>
        </div>
    `;
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(overlay);
        overlay.querySelector('.queise-dev-close').addEventListener('click', () => overlay.classList.remove('ativo'));
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('ativo'); });
    });

    window.showDevModal = () => overlay.classList.add('ativo');
}());

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

