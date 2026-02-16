/**
 * ============================================
 * SOBRE PAGE - Entry Point
 * ============================================
 * 
 * Ponto de entrada para a página Sobre
 * 
 * @module pages/sobre
 */

import { SobreManager } from '../components/sobre.js';

// Inicializar página Sobre quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        const sobreManager = new SobreManager();
        window.sobreManager = sobreManager; // Para debugging
        
        console.log('✅ Sobre system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize sobre:', error);
    }
});

