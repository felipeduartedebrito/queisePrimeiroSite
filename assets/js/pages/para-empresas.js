/**
 * ============================================
 * PARA EMPRESAS PAGE - Entry Point
 * ============================================
 * 
 * Ponto de entrada para a página Para Empresas
 * 
 * @module pages/para-empresas
 */

import { EmpresasManager } from '../components/empresas.js';

// Inicializar página Para Empresas quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        const empresasManager = new EmpresasManager();
        window.empresasManager = empresasManager; // Para debugging
        
        console.log('✅ Empresas system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize empresas:', error);
    }
});

