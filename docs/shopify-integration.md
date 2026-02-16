# Shopify Integration Guide - QUEISE E-commerce

## Visão Geral

Este documento descreve a integração do projeto QUEISE com a Shopify Storefront API. A integração permite que o frontend se comunique diretamente com a loja Shopify para buscar produtos, gerenciar carrinho e processar checkout.

## Configuração Inicial

### 1. Credenciais Shopify

As credenciais estão configuradas em `assets/js/core/config.js`:

```javascript
export const SHOPIFY = {
    domain: 'jkws70-yw.myshopify.com',
    storefrontAccessToken: '5d841f990665c317cdef27bbcdf88ab0',
    apiVersion: '2024-01',
    // ...
};
```

**Importante:**
- O Storefront Access Token é seguro para expor no frontend
- NUNCA exponha Admin API tokens
- Todos os pagamentos são processados pelo Shopify (PCI Compliant)

### 2. Modo de Desenvolvimento

O sistema suporta dois modos:

- **Desenvolvimento** (`isDevelopment: true`): Usa mock database (localStorage)
- **Produção** (`isDevelopment: false`): Usa Shopify API real

Para alternar, edite `assets/js/core/config.js`:

```javascript
export const ENVIRONMENT = {
    isDevelopment: true,  // false para produção
    // ...
};
```

## Estrutura da Integração

### Arquivos Principais

1. **`assets/js/core/shopify-client.js`**
   - Cliente HTTP com retry logic
   - Tratamento de rate limiting
   - Helpers para otimização de imagens

2. **`config/shopify.config.js`**
   - Todas as queries e mutations GraphQL
   - Documentadas e organizadas por funcionalidade

3. **`assets/js/core/api.js`**
   - Classe `ShopifyAPI` com todos os métodos
   - Transformação de dados Shopify → formato interno
   - Cache integrado

4. **`assets/js/core/cache.js`**
   - Sistema de cache com TTL (5 minutos)
   - Reduz chamadas à API

5. **`assets/js/core/storage.js`**
   - Gerenciamento de Cart ID do Shopify
   - Persistência entre sessões

## Metafields de Personalização

### Estrutura

Os produtos devem ter metafields configurados no Shopify:

- **Namespace:** `custom`
- **Key:** `personalization`
- **Type:** `json`

### Conteúdo do Metafield

```json
{
  "enabled": true,
  "price": 20.00,
  "maxChars": 30,
  "allowedFonts": ["Arial", "Times", "Script", "Bold"],
  "allowedColors": ["#FFFFFF", "#000000", "#FFD700", "#C0C0C0"],
  "allowedPositions": ["center", "bottom", "side"]
}
```

### Configuração no Shopify

1. Acesse: **Settings → Custom data → Metafields**
2. Crie metafield:
   - Namespace: `custom`
   - Key: `personalization`
   - Type: `JSON`
3. Adicione aos produtos que permitem personalização

## CustomAttributes no Carrinho

Quando um produto personalizado é adicionado ao carrinho, os dados são salvos como `customAttributes`:

```javascript
[
  { key: "Tipo de Texto", value: "livre" },
  { key: "Texto Personalizado", value: "Maria" },
  { key: "Fonte", value: "Arial" },
  { key: "Cor", value: "Dourado" },
  { key: "Posição", value: "Centro" }
]
```

Esses atributos aparecem no checkout do Shopify e nos pedidos.

## Cart API

### Fluxo de Uso

1. **Criar/Buscar Carrinho:**
   ```javascript
   const cart = await api.getOrCreateCart();
   ```

2. **Adicionar Item:**
   ```javascript
   await api.addToCart(cartId, [{
     merchandiseId: variantId,
     quantity: 1,
     attributes: customAttributes
   }]);
   ```

3. **Atualizar Quantidade:**
   ```javascript
   await api.updateCartLine(cartId, [{
     id: lineId,
     quantity: 2
   }]);
   ```

4. **Remover Item:**
   ```javascript
   await api.removeCartLine(cartId, [lineId]);
   ```

5. **Checkout:**
   ```javascript
   const checkoutUrl = api.getCheckoutUrl(cartId);
   window.location.href = checkoutUrl;
   ```

### Persistência do Cart ID

O Cart ID é salvo automaticamente no `localStorage` e persistido entre sessões. Se o carrinho expirar (Shopify mantém por ~10 dias), um novo é criado automaticamente.

## Otimização de Imagens

As imagens do Shopify CDN são otimizadas automaticamente:

```javascript
// Thumbnail 400x400
const thumb = getThumbnailUrl(imageUrl);

// Responsivo
const mobile = getResponsiveImageUrl(imageUrl, 'mobile');  // 800px
const desktop = getResponsiveImageUrl(imageUrl, 'desktop'); // 1200px
```

## Cache

O sistema usa cache com TTL de 5 minutos para:
- Produtos individuais
- Listas de produtos
- Coleções

O cache é invalidado automaticamente após expiração.

## Tratamento de Erros

### Rate Limiting

O cliente automaticamente:
- Detecta status 429 (rate limit)
- Aguarda tempo especificado no header `Retry-After`
- Retenta até 3 vezes

### Erros de Rede

- Retry automático com backoff exponencial
- Mensagens amigáveis ao usuário
- Logs detalhados em modo debug

## Testes

### Checklist de Validação

- [ ] Listar produtos (com imagens CDN)
- [ ] Detalhes do produto
- [ ] Adicionar ao carrinho (sem personalização)
- [ ] Adicionar ao carrinho (com personalização)
- [ ] CustomAttributes salvos corretamente
- [ ] Atualizar quantidade
- [ ] Remover item
- [ ] Checkout URL válida
- [ ] Preço de personalização (+R$20) correto
- [ ] Toggle isDevelopment funciona
- [ ] Loading states
- [ ] Tratamento de erros
- [ ] Cache funciona

## Troubleshooting

### Produto não aparece

- Verificar se produto está publicado no Shopify
- Verificar se `availableForSale` é `true`
- Verificar cache (limpar se necessário)

### Carrinho não persiste

- Verificar se `localStorage` está habilitado
- Verificar se Cart ID está sendo salvo
- Carrinho pode ter expirado (Shopify mantém ~10 dias)

### Personalização não aparece no checkout

- Verificar se `customAttributes` estão sendo enviados
- Verificar formato dos atributos
- Verificar no Shopify Admin → Orders

### Erro de Rate Limit

- Reduzir frequência de chamadas
- Aumentar TTL do cache
- Implementar debounce em buscas

## Recursos Adicionais

- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
- [Cart API Reference](https://shopify.dev/docs/api/storefront/2024-01/mutations/cartCreate)
- [Metafields Guide](https://shopify.dev/docs/apps/custom-data/metafields)

