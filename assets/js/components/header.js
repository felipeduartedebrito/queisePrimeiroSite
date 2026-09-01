/**
 * ============================================
 * HEADER.JS - Header Manager
 * ============================================
 *
 * Gerencia: scroll effects, cart badge, search overlay.
 * Login/conta: redireciona para Shopify (/account).
 *
 * @module components/Header
 */

import { ENVIRONMENT } from '../core/config.js';
import { api } from '../core/api.js';
import { formatPrice, debounce } from '../core/utils.js';

// Resolve o prefixo de caminho dependendo do nível da página
const isSubpage = () => window.location.pathname.includes('/paginas/');
const prodPath  = (handle) => isSubpage()
    ? `produto-individual.html?id=${handle}`
    : `paginas/produto-individual.html?id=${handle}`;

export class HeaderManager {
    constructor() {
        this.header      = document.getElementById('header');
        this.lastScrollY = window.scrollY;
        this.searchDebounce = debounce((q) => this._doSearch(q), 320);

        this.init();
    }

    init() {
        if (this.header) this._setupScrollEffect();
        this._syncCartBadge();
        this._setupCartListeners();
        this._setupSearch();
        this._setupCollectionsDropdown();
    }

    // ========================================
    // SCROLL
    // ========================================

    _setupScrollEffect() {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            this.header.classList.toggle('scrolled', y > 80);
            this.header.style.transform = (y > this.lastScrollY && y > 150)
                ? 'translateY(-100%)'
                : 'translateY(0)';
            this.lastScrollY = y;
        }, { passive: true });
    }

    // ========================================
    // CART BADGE
    // ========================================

    _syncCartBadge() {
        const badge = document.getElementById('headerCartBadge');
        if (!badge) return;
        try {
            const raw   = localStorage.getItem('queise_cart');
            const cart  = raw ? JSON.parse(raw) : { items: [] };
            const count = (cart.items || []).reduce((t, i) => t + (i.quantity || 1), 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        } catch (_) {
            badge.style.display = 'none';
        }
    }

    _setupCartListeners() {
        window.addEventListener('cartUpdated',        () => this._syncCartBadge());
        window.addEventListener('storage',            (e) => { if (e.key?.includes('cart')) this._syncCartBadge(); });
        window.addEventListener('pageshow',           (e) => { if (e.persisted) this._syncCartBadge(); });
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this._syncCartBadge(); });
        window.addEventListener('focus',              () => this._syncCartBadge());
    }

    // ========================================
    // SEARCH OVERLAY
    // ========================================

    _setupSearch() {
        const toggle   = document.getElementById('searchToggle');
        const overlay  = document.getElementById('searchOverlay');
        const input    = document.getElementById('searchOverlayInput');
        const closeBtn = document.getElementById('searchOverlayClose');

        if (!toggle || !overlay) return;

        const open = () => {
            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
            setTimeout(() => input?.focus(), 50);
        };
        const close = () => {
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
            if (input) input.value = '';
            const results = document.getElementById('searchResults');
            if (results) results.innerHTML = '';
        };

        toggle.addEventListener('click', () => {
            overlay.classList.contains('open') ? close() : open();
        });
        closeBtn?.addEventListener('click', close);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });

        input?.addEventListener('input', (e) => {
            const q = e.target.value.trim();
            if (q.length >= 2) {
                this.searchDebounce(q);
            } else {
                const results = document.getElementById('searchResults');
                if (results) results.innerHTML = '';
            }
        });
    }

    // ========================================
    // COLLECTIONS MEGA MENU
    // ========================================

    _setupCollectionsDropdown() {
        const li      = document.querySelector('.nav-dropdown');
        const menu    = document.getElementById('collectionsDropdown');
        const trigger = li?.querySelector('.nav-dropdown-trigger');
        if (!li || !menu) return;

        // Inject arrow span into trigger (avoids ::after conflicts)
        if (trigger && !trigger.querySelector('.nav-arrow')) {
            trigger.insertAdjacentHTML('beforeend',
                `<span class="nav-arrow" aria-hidden="true">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                              stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>`
            );
        }

        // JS hover with short delay so mouse can travel from trigger to menu
        let closeTimer = null;
        const open  = () => { clearTimeout(closeTimer); li.classList.add('is-open'); };
        const close = () => { closeTimer = setTimeout(() => li.classList.remove('is-open'), 120); };

        li.addEventListener('mouseenter', open);
        li.addEventListener('mouseleave', close);
        menu.addEventListener('mouseenter', open);
        menu.addEventListener('mouseleave', close);

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') li.classList.remove('is-open');
        });

        // Load collections from Shopify
        const subpage       = window.location.pathname.includes('/paginas/');
        const productsUrl   = subpage ? 'produtos.html'  : 'paginas/produtos.html';
        const collectionsUrl = subpage ? 'colecoes.html' : 'paginas/colecoes.html';

        api.getCollections().then(result => {
            const collections = (result.collections || []).filter(col => col.handle !== 'frontpage');
            if (!collections.length) {
                menu.innerHTML = `<a href="${collectionsUrl}" class="nav-dropdown-item nav-dropdown-all">Ver todas as coleções</a>`;
                return;
            }
            const items = collections.map(col =>
                `<a href="${productsUrl}?colecao=${encodeURIComponent(col.handle)}" class="nav-dropdown-item">${col.title}</a>`
            ).join('');
            menu.innerHTML = items +
                `<a href="${collectionsUrl}" class="nav-dropdown-item nav-dropdown-all">Ver todas →</a>`;
        }).catch(() => {
            menu.innerHTML = `<a href="${collectionsUrl}" class="nav-dropdown-item nav-dropdown-all">Ver todas as coleções</a>`;
        });
    }

    async _doSearch(query) {
        const results = document.getElementById('searchResults');
        if (!results) return;

        results.innerHTML = `<div class="search-loading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
        </div>`;

        try {
            let products = [];

            if (!ENVIRONMENT.isDevelopment) {
                products = await api.searchProducts(query);
            } else {
                const all = await api.getProducts();
                products = all
                    .filter(p => p.title?.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 6)
                    .map(p => ({
                        handle: p.handle,
                        title:  p.title,
                        price:  p.price,
                        image:  p.images?.[0]?.url || ''
                    }));
            }

            if (!products.length) {
                results.innerHTML = `<p class="search-empty">Nenhum produto encontrado para "<strong>${query}</strong>".</p>`;
                return;
            }

            results.innerHTML = `<ul class="search-result-list">
                ${products.map(p => `
                    <li class="search-result-item">
                        <a href="${prodPath(p.handle)}" class="search-result-link">
                            <div class="search-result-img">
                                ${p.image
                                    ? `<img src="${p.image}" alt="${p.title}" loading="lazy">`
                                    : `<div class="search-result-img-placeholder"></div>`}
                            </div>
                            <div class="search-result-info">
                                <span class="search-result-title">${p.title}</span>
                                <span class="search-result-price">${formatPrice(p.price)}</span>
                            </div>
                        </a>
                    </li>
                `).join('')}
            </ul>`;
        } catch (_) {
            results.innerHTML = `<p class="search-empty">Erro ao buscar. Tente novamente.</p>`;
        }
    }
}
