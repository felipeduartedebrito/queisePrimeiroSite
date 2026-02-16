/**
 * ============================================
 * PERSONALIZATION-GUARD.JS - Guard para Links de Personalização
 * ============================================
 * 
 * Gerencia links e botões de personalização quando funcionalidade está desabilitada
 * Substitui links por comportamento "em breve" ou desabilita
 * 
 * @module personalization-guard
 */

import { PERSONALIZATION_CONFIG } from './config.js';

/**
 * Inicializa guard de personalização
 * Deve ser chamado em todas as páginas que têm links para personalização
 */
export function initPersonalizationGuard() {
    if (PERSONALIZATION_CONFIG.enabled) {
        // Personalização habilitada - não fazer nada
        return;
    }

    // Personalização desabilitada - modificar links
    const personalizationLinks = document.querySelectorAll(
        'a[href*="personalizar"], a[href*="personalize"], ' +
        'a[href*="Personalizar"], a[href*="Personalize"]'
    );

    personalizationLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Verificar se é link para página de personalização
        if (href && (href.includes('personalizar') || href.includes('personalize'))) {
            // Adicionar classe para estilização
            link.classList.add('personalization-disabled');
            
            // Adicionar tooltip
            link.setAttribute('title', 'Personalização em breve!');
            
            // Garantir que o link aponta para a página de personalização
            // A página mostrará "em breve" automaticamente quando carregada
            // Não precisamos interceptar o clique - deixar redirecionar normalmente
            // A página personalizar.html já tem a verificação e mostra "em breve"
        }
    });
}

/**
 * Mostra notificação "em breve"
 */
function showComingSoonNotification() {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'personalization-coming-soon-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">✨</div>
            <div class="notification-text">
                <strong>Personalização em Breve!</strong>
                <p>Estamos trabalhando para trazer essa funcionalidade. Em breve você poderá personalizar seus produtos!</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Adicionar estilos
    if (!document.getElementById('personalization-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'personalization-notification-styles';
        style.textContent = `
            .personalization-coming-soon-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                max-width: 400px;
                animation: slideInRight 0.3s ease-out;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification-content {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                padding: 1.5rem;
                position: relative;
            }
            
            .notification-icon {
                font-size: 2rem;
                flex-shrink: 0;
            }
            
            .notification-text {
                flex: 1;
            }
            
            .notification-text strong {
                display: block;
                color: #2F4F6F;
                font-size: 1.1rem;
                margin-bottom: 0.5rem;
            }
            
            .notification-text p {
                color: #666;
                font-size: 0.9rem;
                margin: 0;
                line-height: 1.5;
            }
            
            .notification-close {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #999;
                cursor: pointer;
                padding: 0.25rem 0.5rem;
                line-height: 1;
                transition: color 0.2s;
            }
            
            .notification-close:hover {
                color: #333;
            }
            
            .personalization-disabled {
                position: relative;
                opacity: 0.9;
            }
            
            .personalization-disabled::after {
                content: ' (Em breve)';
                font-size: 0.85em;
                color: #999;
                font-style: italic;
                margin-left: 0.25rem;
            }
            
            @media (max-width: 768px) {
                .personalization-coming-soon-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Adicionar ao body
    document.body.appendChild(notification);

    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Auto-inicializar quando módulo é importado
 */
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPersonalizationGuard);
    } else {
        initPersonalizationGuard();
    }
}

export default {
    initPersonalizationGuard,
    showComingSoonNotification
};

