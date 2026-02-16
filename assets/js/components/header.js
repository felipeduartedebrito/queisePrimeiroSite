/**
 * ============================================
 * HEADER.JS - Header Scroll Effects
 * ============================================
 * 
 * Componente para gerenciar efeitos de scroll do header
 * 
 * @module components/Header
 */

/**
 * Classe para gerenciar header scroll effects
 */
export class HeaderManager {
    constructor() {
        this.header = document.getElementById('header');
        this.lastScrollY = window.scrollY;
        this.scrollThreshold = 100;
        this.hideThreshold = 200;
        
        this.init();
    }

    /**
     * Inicializa o header manager
     */
    init() {
        // Sempre configura interceptação de links de contato, mesmo sem header
        this.setupContactLinks();
        
        // Só configura scroll effect se houver header
        if (this.header) {
            this.setupScrollEffect();
        } else {
            console.warn('Header element not found - scroll effects disabled');
        }
    }

    /**
     * Configura efeito de scroll
     */
    setupScrollEffect() {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            // Adicionar classe 'scrolled' para estilização
            if (scrollY > this.scrollThreshold) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            // Esconder header ao rolar para baixo, mostrar ao rolar para cima
            if (scrollY > this.lastScrollY && scrollY > this.hideThreshold) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }

            this.lastScrollY = scrollY;
        }, { passive: true });
    }

    /**
     * Configura interceptação de links de contato
     */
    setupContactLinks() {
        // Interceptar cliques em links de contato
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Verificar se é um link de contato (mais específico para evitar falsos positivos)
            // Verifica se contém 'contato.html' ou termina com '/contato' ou é apenas 'contato.html'
            // Exclui emails (contato@) e outros links que possam conter a palavra "contato"
            // Normaliza o href para comparação (remove query strings e hashes)
            const normalizedHref = href.split('?')[0].split('#')[0].toLowerCase().trim();
            
            // Verifica se é um link de contato (diferentes formatos possíveis)
            const isContactLink = 
                // Links que terminam com contato.html (relativos ou absolutos)
                (normalizedHref.endsWith('contato.html') && !normalizedHref.includes('@')) ||
                // Links que terminam com /contato (sem .html)
                (normalizedHref.endsWith('/contato') && !normalizedHref.includes('@')) ||
                // Links exatos
                (normalizedHref === 'contato.html') ||
                (normalizedHref === 'paginas/contato.html') ||
                (normalizedHref === '../paginas/contato.html');

            if (isContactLink) {
                e.preventDefault();
                e.stopPropagation();
                this.showContactModal();
            }
        });
    }

    /**
     * Mostra modal de contato em desenvolvimento
     */
    showContactModal() {
        // Verificar se já existe um modal aberto
        const existingModal = document.getElementById('contactModal');
        if (existingModal) {
            return;
        }

        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'contact-modal-overlay';
        overlay.id = 'contactModal';

        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'contact-modal';

        modal.innerHTML = `
            <div class="contact-modal-content">
                <button class="contact-modal-close" aria-label="Fechar modal">×</button>
                <div class="contact-modal-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
                    </svg>
                </div>
                <h2 class="contact-modal-title">Página em Desenvolvimento</h2>
                <p class="contact-modal-message">
                    A página de contato está sendo desenvolvida. 
                    Entre em contato conosco pelo telefone:
                </p>
                <div class="contact-modal-phone">
                    <a href="tel:(xx)xxxx-xxxx" class="contact-phone-link">
                        (xx) xxxx-xxxx
                    </a>
                </div>
                <button class="contact-modal-button">Entendi</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animar entrada
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Fechar modal
        const closeModal = () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 300);
        };

        // Event listeners para fechar
        modal.querySelector('.contact-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.contact-modal-button').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });

        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
}

