/**
 * ============================================
 * CHECKOUT PAGE - Entry Point
 * ============================================
 * 
 * Ponto de entrada para a página de checkout
 * 
 * @module pages/checkout
 */

import { CheckoutManager } from '../components/checkout.js';

// Inicializar checkout quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        const checkoutManager = new CheckoutManager();
        window.checkoutManager = checkoutManager; // Para debugging
        
        console.log('✅ Checkout system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize checkout:', error);
    }
});

