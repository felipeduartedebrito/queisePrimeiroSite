/**
 * ============================================
 * PRODUTO-INDIVIDUAL.JS - Página de Detalhe do Produto
 * ============================================
 * 
 * Entry point para página de detalhe do produto
 * Inicializa ProductDetailManager
 * 
 * @module pages/ProdutoIndividual
 */

import { ProductDetailManager } from '../components/product-detail.js';

// Capturar URL IMEDIATAMENTE antes de qualquer modificação
// Executar no topo do módulo, antes de qualquer outra coisa
(function() {
    'use strict';
    const initialUrl = window.location.href;
    const initialSearch = window.location.search;
    const initialHash = window.location.hash;

    console.log('🔍 [produto-individual.js] URL no momento do carregamento do script:');
    console.log('  - href:', initialUrl);
    console.log('  - search:', initialSearch);
    console.log('  - hash:', initialHash);

    // Tentar extrair handle imediatamente
    let capturedHandle = null;
    if (initialSearch) {
        const params = new URLSearchParams(initialSearch);
        capturedHandle = params.get('id');
        console.log('  - handle capturado:', capturedHandle);
        
        // Se encontrou handle, salvar no sessionStorage como fallback
        if (capturedHandle) {
            sessionStorage.setItem('product_handle', capturedHandle);
            console.log('  - handle salvo no sessionStorage');
        }
    }
    
    // Também verificar se há handle no sessionStorage (salvo no clique anterior)
    const storedHandle = sessionStorage.getItem('product_handle');
    if (storedHandle && !capturedHandle) {
        console.log('  - handle encontrado no sessionStorage (do clique anterior):', storedHandle);
        capturedHandle = storedHandle;
    }
    
    // Expor para uso posterior
    window.__capturedProductHandle = capturedHandle;
})();

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se handle foi perdido
    const currentSearch = window.location.search;
    const currentParams = new URLSearchParams(currentSearch);
    const currentHandle = currentParams.get('id');
    
    // Recuperar handle capturado anteriormente
    const capturedHandle = window.__capturedProductHandle || null;
    
    console.log('🔍 [produto-individual.js] URL no momento do DOMContentLoaded:');
    console.log('  - href:', window.location.href);
    console.log('  - search:', currentSearch);
    console.log('  - handle atual:', currentHandle);
    console.log('  - handle capturado anteriormente:', capturedHandle);
    
    // Tentar recuperar do sessionStorage também
    const storedHandle = sessionStorage.getItem('product_handle');
    console.log('  - handle no sessionStorage:', storedHandle);
    
    // Se handle foi perdido, tentar restaurar
    if (!currentHandle) {
        const handleToUse = capturedHandle || storedHandle;
        
        if (handleToUse) {
            console.warn('⚠️ Handle não encontrado na URL! Restaurando...');
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('id', handleToUse);
            window.history.replaceState({}, '', newUrl.toString());
            console.log('  - URL restaurada:', newUrl.toString());
            console.log('  - Handle restaurado:', handleToUse);
        } else {
            console.error('❌ Handle não encontrado em nenhum lugar!');
        }
    }
    
    const productDetailManager = new ProductDetailManager();
    
    console.log('✅ ProductDetailManager inicializado');
    
    // Expor globalmente para debug (opcional)
    window.productDetailManager = productDetailManager;
});

