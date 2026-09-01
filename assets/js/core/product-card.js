import { formatPrice } from './utils.js';

function _cardColorToHex(name) {
    const map = {
        'preto': '#1a1a1a', 'black': '#1a1a1a',
        'branco': '#f0f0f0', 'white': '#f0f0f0',
        'prata': '#a8a8a8', 'silver': '#a8a8a8',
        'dourado': '#c9a84c', 'gold': '#c9a84c',
        'azul': '#2563eb', 'blue': '#2563eb',
        'azul claro': '#93c5fd', 'light blue': '#93c5fd',
        'azul marinho': '#1e3a5f', 'navy': '#1e3a5f', 'navy blue': '#1e3a5f',
        'azul petróleo': '#0f4c5c', 'teal': '#0f766e',
        'verde': '#16a34a', 'green': '#16a34a',
        'verde claro': '#86efac', 'light green': '#86efac',
        'verde escuro': '#14532d', 'dark green': '#14532d',
        'verde militar': '#4b5320', 'olive': '#4b5320',
        'vermelho': '#dc2626', 'red': '#dc2626',
        'rosa': '#f472b6', 'pink': '#f472b6',
        'rosa claro': '#fbcfe8', 'light pink': '#fbcfe8',
        'rosa bebê': '#fce7f3',
        'salmão': '#fa8072', 'salmon': '#fa8072',
        'laranja': '#f97316', 'orange': '#f97316',
        'amarelo': '#facc15', 'yellow': '#facc15',
        'roxo': '#7c3aed', 'purple': '#7c3aed',
        'lilás': '#c4b5fd', 'lilac': '#c4b5fd',
        'lavanda': '#e9d5ff', 'lavender': '#e9d5ff',
        'vinho': '#7f1d1d', 'burgundy': '#7f1d1d', 'wine': '#7f1d1d',
        'marrom': '#92400e', 'brown': '#92400e',
        'bege': '#d4b896', 'beige': '#d4b896',
        'cinza': '#9ca3af', 'gray': '#9ca3af', 'grey': '#9ca3af',
        'cinza claro': '#e5e7eb', 'light gray': '#e5e7eb',
        'cinza escuro': '#374151', 'dark gray': '#374151',
        'terracota': '#c1674a', 'terracotta': '#c1674a',
        'cobre': '#b87333', 'copper': '#b87333',
    };
    return map[name.toLowerCase()] || '#888888';
}

/**
 * @param {Object} product - produto transformado pela API
 * @param {Object} opts
 * @param {string} opts.placeholderSrc - caminho relativo para imagem placeholder
 * @param {string} opts.detailUrlPrefix - prefixo da URL da página de detalhe, ex: 'produto-individual.html?id='
 */
export function createProductElement(product, {
    placeholderSrc = '../imagens/placeholder-product.svg',
    detailUrlPrefix = 'produto-individual.html?id='
} = {}) {
    const firstCollection = product.collections?.[0];
    const categoryLabel = product.productType || firstCollection?.title || product._collectionTitle || '';
    const categoryValue = categoryLabel.toLowerCase();

    const handle = product.handle || product.id || '';
    const detailUrl = `${detailUrlPrefix}${encodeURIComponent(handle)}`;

    const article = document.createElement('article');
    article.className = 'product-item';
    article.setAttribute('data-category', categoryValue || 'outros');
    article.setAttribute('data-price', Math.round(product.price / 100));
    article.setAttribute('data-product-handle', handle);
    article.style.cursor = 'pointer';

    const navigateToDetail = () => {
        if (handle) sessionStorage.setItem('product_handle', handle);
        window.location.href = detailUrl;
    };

    const defaultImageUrl = product.images?.[0]?.url || placeholderSrc;
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';
    imageContainer.addEventListener('click', navigateToDetail);

    const img = document.createElement('img');
    img.className = 'product-main-img';
    img.src = defaultImageUrl;
    img.alt = product.title || 'Produto';
    img.loading = 'lazy';
    img.onerror = function() { this.src = placeholderSrc; };
    imageContainer.appendChild(img);

    const swatchRow = document.createElement('div');
    swatchRow.className = 'product-card-swatches';

    const colorOption = product.options?.find(o => /^cor$/i.test(o.name.trim()));
    if (colorOption && product.variants?.length) {
        const colorImageMap = {};
        colorOption.values.forEach(colorName => {
            const variant = product.variants.find(v =>
                v.selectedOptions?.some(o => /^cor$/i.test(o.name.trim()) && o.value === colorName)
            );
            colorImageMap[colorName] = variant?.image?.url || defaultImageUrl;
        });

        Object.values(colorImageMap).forEach(url => {
            if (url && url !== defaultImageUrl) {
                const preload = new Image();
                preload.src = url;
            }
        });

        const MAX_SHOWN = 5;
        const shown = colorOption.values.slice(0, MAX_SHOWN);
        const extra = colorOption.values.length - MAX_SHOWN;

        shown.forEach(colorName => {
            const hex = _cardColorToHex(colorName);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'product-card-swatch';
            btn.style.background = hex;
            btn.title = colorName;
            btn.setAttribute('aria-label', colorName);
            btn.style.boxShadow = `0 0 0 2px #fff, 0 0 0 3.5px #d0d0d0`;

            btn.addEventListener('mouseenter', () => {
                const imgUrl = colorImageMap[colorName];
                if (imgUrl) img.src = imgUrl;
            });
            btn.addEventListener('mouseleave', () => { img.src = defaultImageUrl; });
            btn.addEventListener('click', e => { e.stopPropagation(); navigateToDetail(); });

            swatchRow.appendChild(btn);
        });

        if (extra > 0) {
            const more = document.createElement('span');
            more.className = 'product-card-swatches-more';
            more.textContent = `+${extra}`;
            swatchRow.appendChild(more);
        }
    }

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.title;
    name.addEventListener('click', navigateToDetail);

    const priceEl = document.createElement('div');
    priceEl.className = 'price-main';
    priceEl.textContent = formatPrice(product.price);
    priceEl.addEventListener('click', navigateToDetail);

    article.appendChild(imageContainer);
    article.appendChild(swatchRow);
    article.appendChild(name);
    article.appendChild(priceEl);

    return article;
}
