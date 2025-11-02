/**
 * ============================================
 * NOTIFICATION.JS - Sistema de Notificações
 * ============================================
 * 
 * Componente reutilizável para exibir notificações toast
 * Suporta: success, error, warning, info
 * 
 * @module components/Notification
 */

import { NOTIFICATION_CONFIG, ANIMATION_CONFIG } from '../core/config.js';
import { createElement } from '../core/utils.js';

// ========================================
// CLASSE NOTIFICATION
// ========================================

/**
 * Classe para gerenciar notificações toast
 */
export class Notification {
    /**
     * Cria uma nova notificação
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duração em ms (opcional)
     */
    constructor(message, type = 'info', duration = null) {
        this.message = message;
        this.type = type;
        this.duration = duration || NOTIFICATION_CONFIG.duration;
        this.element = null;
        this.timeoutId = null;
        
        this.create();
        this.show();
    }

    /**
     * Cria elemento DOM da notificação
     */
    create() {
        const config = NOTIFICATION_CONFIG.types[this.type] || NOTIFICATION_CONFIG.types.info;
        
        // Container principal
        this.element = createElement('div', {
            'data-notification-type': this.type
        }, ['notification', `notification-${this.type}`]);

        // Conteúdo
        const content = createElement('div', {}, 'notification-content');
        
        // Ícone
        const icon = createElement('span', {
            textContent: config.icon
        }, 'notification-icon');
        
        // Mensagem
        const messageEl = createElement('span', {
            textContent: this.message
        }, 'notification-message');
        
        // Botão fechar
        const closeBtn = createElement('button', {
            textContent: '×',
            'aria-label': 'Fechar notificação'
        }, 'notification-close');
        
        closeBtn.addEventListener('click', () => this.hide());
        
        // Montar estrutura
        content.appendChild(icon);
        content.appendChild(messageEl);
        this.element.appendChild(content);
        this.element.appendChild(closeBtn);
        
        // Aplicar estilos inline (para funcionar sem CSS externo)
        this.applyStyles(config);
    }

    /**
     * Aplica estilos inline à notificação
     * @param {Object} config - Configuração de cores
     */
    applyStyles(config) {
        Object.assign(this.element.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            minWidth: '300px',
            maxWidth: '500px',
            padding: '1rem 1.5rem',
            background: config.color,
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            zIndex: '10000',
            transform: 'translateX(120%)',
            transition: `transform ${ANIMATION_CONFIG.duration.normal}ms ease`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '500',
            fontFamily: 'Inter, system-ui, sans-serif'
        });

        // Estilos do conteúdo
        const content = this.element.querySelector('.notification-content');
        Object.assign(content.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1'
        });

        // Estilos do ícone
        const icon = this.element.querySelector('.notification-icon');
        Object.assign(icon.style, {
            fontSize: '1.3rem',
            fontWeight: '700'
        });

        // Estilos da mensagem
        const message = this.element.querySelector('.notification-message');
        Object.assign(message.style, {
            flex: '1'
        });

        // Estilos do botão fechar
        const closeBtn = this.element.querySelector('.notification-close');
        Object.assign(closeBtn.style, {
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0.8',
            transition: 'opacity 0.2s ease'
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.opacity = '1';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.opacity = '0.8';
        });
    }

    /**
     * Exibe a notificação com animação
     */
    show() {
        // Adicionar ao DOM
        document.body.appendChild(this.element);

        // Animar entrada
        setTimeout(() => {
            this.element.style.transform = 'translateX(0)';
        }, 10);

        // Auto-fechar após duração
        this.timeoutId = setTimeout(() => {
            this.hide();
        }, this.duration);
    }

    /**
     * Esconde a notificação com animação
     */
    hide() {
        // Limpar timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Animar saída
        this.element.style.transform = 'translateX(120%)';

        // Remover do DOM após animação
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, ANIMATION_CONFIG.duration.normal);
    }
}

// ========================================
// MÉTODOS ESTÁTICOS (ATALHOS)
// ========================================

/**
 * Exibe notificação de sucesso
 * @param {string} message - Mensagem
 * @param {number} duration - Duração em ms (opcional)
 * @returns {Notification}
 */
Notification.success = function(message, duration) {
    return new Notification(message, 'success', duration);
};

/**
 * Exibe notificação de erro
 * @param {string} message - Mensagem
 * @param {number} duration - Duração em ms (opcional)
 * @returns {Notification}
 */
Notification.error = function(message, duration) {
    return new Notification(message, 'error', duration);
};

/**
 * Exibe notificação de aviso
 * @param {string} message - Mensagem
 * @param {number} duration - Duração em ms (opcional)
 * @returns {Notification}
 */
Notification.warning = function(message, duration) {
    return new Notification(message, 'warning', duration);
};

/**
 * Exibe notificação de informação
 * @param {string} message - Mensagem
 * @param {number} duration - Duração em ms (opcional)
 * @returns {Notification}
 */
Notification.info = function(message, duration) {
    return new Notification(message, 'info', duration);
};

// ========================================
// GERENCIADOR DE NOTIFICAÇÕES
// ========================================

/**
 * Gerenciador para controlar múltiplas notificações
 */
export class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 3;
    }

    /**
     * Adiciona nova notificação
     * @param {string} message - Mensagem
     * @param {string} type - Tipo da notificação
     * @param {number} duration - Duração
     * @returns {Notification}
     */
    add(message, type = 'info', duration) {
        // Se atingiu o máximo, remove a mais antiga
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            oldest.hide();
        }

        // Criar nova notificação
        const notification = new Notification(message, type, duration);
        this.notifications.push(notification);

        // Ajustar posicionamento
        this.repositionAll();

        return notification;
    }

    /**
     * Reposiciona todas as notificações
     */
    repositionAll() {
        this.notifications.forEach((notification, index) => {
            const offset = index * 90; // 90px entre cada notificação
            notification.element.style.top = `${20 + offset}px`;
        });
    }

    /**
     * Remove todas as notificações
     */
    clearAll() {
        this.notifications.forEach(notification => notification.hide());
        this.notifications = [];
    }

    /**
     * Métodos atalho
     */
    success(message, duration) {
        return this.add(message, 'success', duration);
    }

    error(message, duration) {
        return this.add(message, 'error', duration);
    }

    warning(message, duration) {
        return this.add(message, 'warning', duration);
    }

    info(message, duration) {
        return this.add(message, 'info', duration);
    }
}

// ========================================
// INSTÂNCIA GLOBAL
// ========================================

/**
 * Instância global do gerenciador de notificações
 */
export const notificationManager = new NotificationManager();

// ========================================
// EXPORTAÇÕES
// ========================================

export default Notification;

// Disponibilizar globalmente para uso fácil
if (typeof window !== 'undefined') {
    window.Notification = Notification;
    window.notificationManager = notificationManager;
}
