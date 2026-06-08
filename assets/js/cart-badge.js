/**
 * cart-badge.js
 * Script standalone (não-módulo) para manter o badge do carrinho
 * sempre sincronizado com o localStorage.
 * Carregado com `defer` em todas as páginas — sem dependências externas.
 */
(function () {
    var CART_KEY = 'queise_cart';

    function getCount() {
        try {
            var raw  = localStorage.getItem(CART_KEY);
            var cart = raw ? JSON.parse(raw) : { items: [] };
            return (cart.items || []).reduce(function (total, item) {
                return total + (item.quantity || 1);
            }, 0);
        } catch (e) {
            return 0;
        }
    }

    function sync() {
        var badge = document.getElementById('headerCartBadge');
        if (!badge) return;
        var count = getCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Sincroniza imediatamente (DOM já pronto graças ao `defer`)
    sync();

    // Atualiza quando o carrinho muda (evento disparado pelo app)
    window.addEventListener('cartUpdated', sync);

    // Atualiza quando o usuário volta via botão voltar/avançar (bfcache)
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) sync();
    });

    // Atualiza quando o usuário retorna a esta aba
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') sync();
    });

    // Atualiza quando localStorage muda em outra aba
    window.addEventListener('storage', function (e) {
        if (e.key === CART_KEY) sync();
    });
})();
