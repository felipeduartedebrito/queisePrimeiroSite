/**
 * ============================================
 * PERSONALIZAR.JS - Página de Personalização
 * ============================================
 * 
 * Entry point para página de personalização
 * Inicializa PersonalizationManager
 * 
 * @module pages/Personalizar
 */

import { PERSONALIZATION_CONFIG } from '../core/config.js';

// Verificação imediata - se personalização está desabilitada, não importar PersonalizationManager
let PersonalizationManager = null;
if (PERSONALIZATION_CONFIG.enabled) {
    // Só importar se estiver habilitado
    import('../components/personalization.js').then(module => {
        PersonalizationManager = module.PersonalizationManager;
    });
}

/**
 * Mostra página "em breve" quando personalização está desabilitada
 * DEFINIDA PRIMEIRO para garantir que está disponível quando chamada
 */
function showComingSoonPage() {
    console.log('📄 Mostrando página "em breve"...');
    
    // Ocultar loader primeiro
    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
        pageLoader.style.display = 'none';
        console.log('✅ Loader ocultado');
    }

    const container = document.querySelector('.personalizar-container');
    if (!container) {
        console.warn('⚠️ Container .personalizar-container não encontrado, tentando criar...');
        // Se container não existe, criar um
        const body = document.querySelector('body');
        if (body) {
            const newContainer = document.createElement('section');
            newContainer.className = 'personalizar-container';
            // Inserir após o breadcrumb ou no início do body
            const breadcrumb = document.querySelector('.breadcrumb');
            if (breadcrumb && breadcrumb.nextSibling) {
                body.insertBefore(newContainer, breadcrumb.nextSibling);
            } else {
                body.appendChild(newContainer);
            }
            console.log('✅ Container criado');
            // Tentar novamente após um pequeno delay
            setTimeout(() => showComingSoonPage(), 50);
            return;
        } else {
            console.error('❌ Body não encontrado!');
            return;
        }
    }
    
    console.log('✅ Container encontrado, substituindo conteúdo...');

    // Substituir conteúdo do container
    container.innerHTML = `
        <div class="coming-soon-page">
            <div class="coming-soon-content">
                <div class="coming-soon-icon-large">✨</div>
                <h1>Personalização em Breve!</h1>
                <p class="coming-soon-description">
                    Estamos trabalhando para trazer a funcionalidade de personalização de produtos. 
                    Em breve você poderá criar produtos únicos com textos, fontes e cores personalizadas!
                </p>
                
                <div class="coming-soon-features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">✍️</div>
                        <h3>Texto Personalizado</h3>
                        <p>Adicione nomes, frases ou mensagens especiais aos seus produtos</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">🎨</div>
                        <h3>Escolha de Fontes e Cores</h3>
                        <p>Personalize a aparência com diferentes fontes e cores disponíveis</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">👁️</div>
                        <h3>Preview em Tempo Real</h3>
                        <p>Veja como ficará seu produto personalizado antes de finalizar</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">📍</div>
                        <h3>Posicionamento</h3>
                        <p>Escolha onde a personalização aparecerá no produto</p>
                    </div>
                </div>

                <div class="coming-soon-actions">
                    <p class="coming-soon-note">
                        Enquanto isso, você pode explorar nossos produtos e adicioná-los ao carrinho normalmente!
                    </p>
                    <div class="coming-soon-buttons">
                        <a href="produtos.html" class="btn-primary">Ver Produtos</a>
                        <a href="../index.html" class="btn-secondary">Voltar ao Início</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Adicionar estilos inline se necessário (ou usar CSS existente)
    if (!document.getElementById('personalization-coming-soon-styles')) {
        const style = document.createElement('style');
        style.id = 'personalization-coming-soon-styles';
        style.textContent = `
            .coming-soon-page {
                min-height: 60vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
            }
            
            .coming-soon-content {
                max-width: 900px;
                width: 100%;
                text-align: center;
            }
            
            .coming-soon-icon-large {
                font-size: 5rem;
                margin-bottom: 2rem;
                animation: pulse 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.8;
                }
            }
            
            .coming-soon-content h1 {
                font-family: 'Playfair Display', serif;
                font-size: 2.5rem;
                color: var(--primary, #2F4F6F);
                margin-bottom: 1.5rem;
                font-weight: 600;
            }
            
            .coming-soon-description {
                font-size: 1.1rem;
                color: var(--text-light, #666);
                line-height: 1.8;
                margin-bottom: 3rem;
                max-width: 700px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .coming-soon-features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 2rem;
                margin: 3rem 0;
            }
            
            .feature-card {
                background: linear-gradient(135deg, rgba(226, 236, 245, 0.7) 0%, rgba(246, 248, 251, 0.92) 100%);
                border: 1px solid var(--border-subtle, #e0e0e0);
                border-radius: 20px;
                padding: 2rem 1.5rem;
                transition: all 0.3s ease;
            }
            
            .feature-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(47, 79, 111, 0.15);
            }
            
            .feature-card .feature-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .feature-card h3 {
                font-size: 1.2rem;
                color: var(--primary, #2F4F6F);
                margin-bottom: 0.75rem;
                font-weight: 600;
            }
            
            .feature-card p {
                font-size: 0.95rem;
                color: var(--text-light, #666);
                line-height: 1.6;
            }
            
            .coming-soon-actions {
                margin-top: 3rem;
                padding-top: 3rem;
                border-top: 1px solid var(--border-subtle, #e0e0e0);
            }
            
            .coming-soon-note {
                font-size: 1rem;
                color: var(--text-muted, #999);
                font-style: italic;
                margin-bottom: 2rem;
            }
            
            .coming-soon-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .coming-soon-buttons .btn-primary,
            .coming-soon-buttons .btn-secondary {
                padding: 1rem 2rem;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
                display: inline-block;
            }
            
            .coming-soon-buttons .btn-primary {
                background: var(--primary, #2F4F6F);
                color: white;
            }
            
            .coming-soon-buttons .btn-primary:hover {
                background: var(--primary-dark, #1e3447);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(47, 79, 111, 0.3);
            }
            
            .coming-soon-buttons .btn-secondary {
                background: white;
                color: var(--primary, #2F4F6F);
                border: 2px solid var(--primary, #2F4F6F);
            }
            
            .coming-soon-buttons .btn-secondary:hover {
                background: var(--primary, #2F4F6F);
                color: white;
            }
            
            @media (max-width: 768px) {
                .coming-soon-content h1 {
                    font-size: 2rem;
                }
                
                .coming-soon-features-grid {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                
                .coming-soon-buttons {
                    flex-direction: column;
                }
                
                .coming-soon-buttons .btn-primary,
                .coming-soon-buttons .btn-secondary {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Página "em breve" exibida com sucesso!');
}

// Inicializar quando DOM estiver pronto
// Verificação imediata primeiro
if (!PERSONALIZATION_CONFIG.enabled) {
    // Se desabilitado, mostrar "em breve" o mais rápido possível
    const showImmediately = () => {
        const container = document.querySelector('.personalizar-container');
        if (container) {
            console.log('⚠️ Personalização desabilitada - mostrando página "em breve"');
            showComingSoonPage();
        } else {
            // Tentar novamente em breve
            setTimeout(showImmediately, 50);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showImmediately);
    } else {
        showImmediately();
    }
} else {
    // Personalização habilitada - inicializar normalmente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPersonalizationPage);
    } else {
        initPersonalizationPage();
    }
}

function initPersonalizationPage() {
    console.log('🔍 Verificando personalização...', PERSONALIZATION_CONFIG.enabled);
    
    // Verificar se personalização está habilitada
    if (!PERSONALIZATION_CONFIG.enabled) {
        console.log('⚠️ Personalização desabilitada - mostrando página "em breve"');
        // Aguardar um pouco para garantir que DOM está pronto
        setTimeout(() => {
            showComingSoonPage();
        }, 100);
        return;
    }

    console.log('✅ Personalização habilitada - inicializando normalmente');
    
    // Personalização habilitada - inicializar normalmente
    // Aguardar importação dinâmica se necessário
    if (!PersonalizationManager) {
        import('../components/personalization.js').then(module => {
            PersonalizationManager = module.PersonalizationManager;
            const personalizationManager = new PersonalizationManager({
                storageKey: 'queise_personalization_state',
                maxSteps: 4
            });
            console.log('✅ PersonalizationManager inicializado');
            window.personalizationManager = personalizationManager;
        });
    } else {
        const personalizationManager = new PersonalizationManager({
            storageKey: 'queise_personalization_state',
            maxSteps: 4
        });
        console.log('✅ PersonalizationManager inicializado');
        window.personalizationManager = personalizationManager;
    }
}

