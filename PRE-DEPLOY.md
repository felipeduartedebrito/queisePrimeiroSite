# ⚠️ AÇÕES NECESSÁRIAS ANTES DO DEPLOY

## 🔴 IMPORTANTE: Alterar Antes de Fazer Deploy

### 1. Editar `assets/js/core/config.js`

**Linha 22:** Alterar `isDevelopment` para `false`

```javascript
export const ENVIRONMENT = {
    isDevelopment: false,  // ⚠️ MUDAR DE true PARA false
    version: '1.0.0',
    debugMode: false  // ⚠️ MUDAR DE true PARA false em produção
};
```

**Linha 35-40:** Verificar credenciais Shopify

```javascript
export const SHOPIFY = {
    domain: 'jkws70-yw.myshopify.com',  // ✅ Verificar se está correto
    storefrontAccessToken: '5d841f990665c317cdef27bbcdf88ab0',  // ✅ Verificar se está correto
    apiVersion: '2024-01',
    // ...
};
```

**Linha 128:** Confirmar personalização desabilitada

```javascript
export const PERSONALIZATION_CONFIG = {
    enabled: false,  // ✅ Confirmar false para lançamento
    // ...
};
```

## ✅ Checklist Rápido

- [ ] Alterar `isDevelopment: false` em `config.js`
- [ ] Alterar `debugMode: false` em `config.js`
- [ ] Verificar credenciais Shopify estão corretas
- [ ] Confirmar `PERSONALIZATION_CONFIG.enabled: false`
- [ ] Testar localmente com `isDevelopment: false`
- [ ] Verificar console do navegador (sem erros)
- [ ] Fazer commit das alterações
- [ ] Fazer deploy na Vercel

## 🧪 Teste Local Antes do Deploy

1. **Alterar `isDevelopment: false`**
2. **Abrir site localmente:**
   ```bash
   python -m http.server 8000
   # ou
   npx serve .
   ```
3. **Testar:**
   - Produtos carregam do Shopify?
   - Adicionar ao carrinho funciona?
   - Checkout URL é gerada?
   - Console sem erros críticos?

## 📝 Após Deploy

Verificar:
- [ ] Site carrega na URL do Vercel
- [ ] Produtos aparecem
- [ ] Carrinho funciona
- [ ] Checkout funciona
- [ ] Console sem erros

## 🔄 Rollback

Se algo der errado:
1. Alterar `isDevelopment: true` novamente
2. Fazer novo deploy
3. Ou promover deployment anterior no Vercel

