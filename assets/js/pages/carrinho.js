/**
 * ============================================
 * CARRINHO.JS - Página do Carrinho
 * ============================================
 * 
 * Página wrapper para inicializar o componente de carrinho
 * 
 * @module pages/carrinho
 */

import { CartManager } from '../components/cart.js';

// ========================================
// INICIALIZAÇÃO
// ========================================

/**
 * Inicializa a página do carrinho
 */
function initializeCartPage() {
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cartManager = new CartManager();
        });
    } else {
        window.cartManager = new CartManager();
    }
}

// Inicializar automaticamente
initializeCartPage();

// Exportar para uso global se necessário
if (typeof window !== 'undefined') {
    window.CartManager = CartManager;
}

