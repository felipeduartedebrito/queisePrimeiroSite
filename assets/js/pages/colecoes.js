/**
 * ============================================
 * COLEÇÕES PAGE - Entry Point
 * ============================================
 * 
 * Ponto de entrada para a página de coleções
 * 
 * @module pages/colecoes
 */

import { CollectionsManager } from '../components/collections.js';

// Inicializar coleções quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        const collectionsManager = new CollectionsManager();
        window.collectionsManager = collectionsManager; // Para debugging
        
        console.log('✅ Collections system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize collections:', error);
    }
});

