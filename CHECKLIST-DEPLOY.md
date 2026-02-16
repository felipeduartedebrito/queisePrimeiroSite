# ✅ Checklist Final - Deploy Vercel + Shopify

## 📋 Pré-Deploy

### 1. Configuração do Código

- [x] Integração Shopify Storefront API implementada
- [x] Cache layer implementado
- [x] Retry logic e rate limiting
- [x] Personalização desabilitada (em breve)
- [ ] **ALTERAR:** `ENVIRONMENT.isDevelopment: false` em `config.js`
- [ ] **VERIFICAR:** Credenciais Shopify corretas em `config.js`
- [ ] **VERIFICAR:** `PERSONALIZATION_CONFIG.enabled: false`

### 2. Arquivos de Configuração

- [x] `vercel.json` criado
- [x] `.gitignore` configurado
- [x] Documentação criada
- [ ] **REVISAR:** `vercel.json` (ajustar se necessário)

### 3. Testes Locais

- [ ] Testar modo desenvolvimento (mock) localmente
- [ ] Testar modo produção (Shopify) localmente
- [ ] Verificar console do navegador (sem erros)
- [ ] Testar adicionar produto ao carrinho
- [ ] Testar checkout URL
- [ ] Verificar imagens carregando
- [ ] Testar página "em breve" de personalização

## 🚀 Deploy na Vercel

### Opção 1: Via GitHub (Recomendado)

1. **Preparar repositório:**
   ```bash
   git add .
   git commit -m "Preparar para deploy - integração Shopify"
   git push origin main
   ```

2. **Conectar na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Conecte repositório GitHub
   - Configurações:
     - **Framework Preset:** Other
     - **Root Directory:** . (raiz)
     - **Build Command:** (deixar vazio)
     - **Output Directory:** . (raiz)
     - **Install Command:** (deixar vazio)

3. **Deploy:**
   - Vercel detecta automaticamente
   - Primeiro deploy pode levar 1-2 minutos
   - URL temporária: `https://queise-xxxxx.vercel.app`

### Opção 2: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy de desenvolvimento
vercel

# Deploy de produção
vercel --prod
```

## ✅ Pós-Deploy

### 1. Testes na URL Temporária

- [ ] Acessar URL do Vercel
- [ ] Verificar se site carrega
- [ ] Testar navegação entre páginas
- [ ] Verificar produtos carregando do Shopify
- [ ] Testar adicionar ao carrinho
- [ ] Verificar checkout URL
- [ ] Testar em mobile
- [ ] Verificar console (sem erros críticos)

### 2. Configuração de Domínio

**Fase 1: Subdomínio de Teste (Opcional)**

- [ ] Adicionar subdomínio na Vercel (ex: `novo.dominio.com.br`)
- [ ] Configurar DNS no Registro.br:
  - Tipo: CNAME
  - Nome: `novo`
  - Valor: `cname.vercel-dns.com`
- [ ] Aguardar propagação (até 48h)
- [ ] Testar subdomínio

**Fase 2: Domínio Principal**

- [ ] Adicionar domínio na Vercel
- [ ] Obter IPs da Vercel
- [ ] Configurar DNS no Registro.br:
  - Tipo A: `@` → IP da Vercel
  - Tipo CNAME: `www` → `cname.vercel-dns.com`
- [ ] Aguardar propagação DNS
- [ ] Verificar SSL automático
- [ ] Testar domínio principal

### 3. Validações Finais

- [ ] Google Analytics configurado (se aplicável)
- [ ] Search Console configurado (se aplicável)
- [ ] Testar performance (PageSpeed Insights)
- [ ] Verificar SEO básico
- [ ] Testar em diferentes navegadores
- [ ] Testar em diferentes dispositivos

## 🔧 Configurações Importantes

### Antes do Deploy

**Editar `assets/js/core/config.js`:**

```javascript
export const ENVIRONMENT = {
    isDevelopment: false,  // ⚠️ MUDAR PARA false
    version: '1.0.0',
    debugMode: false  // ⚠️ MUDAR PARA false em produção
};

export const SHOPIFY = {
    domain: 'jkws70-yw.myshopify.com',  // ✅ Verificar se está correto
    storefrontAccessToken: '5d841f990665c317cdef27bbcdf88ab0',  // ✅ Verificar se está correto
    apiVersion: '2024-01'
};

export const PERSONALIZATION_CONFIG = {
    enabled: false,  // ✅ Confirmar false para lançamento
    // ...
};
```

## 🐛 Troubleshooting

### Site não carrega

- Verificar logs no Vercel Dashboard
- Verificar console do navegador
- Verificar se `vercel.json` está correto

### Produtos não aparecem

- Verificar credenciais Shopify em `config.js`
- Verificar se `isDevelopment: false`
- Verificar console para erros de API
- Verificar se produtos existem no Shopify

### Checkout não funciona

- Verificar se cart ID está sendo salvo
- Verificar se checkout URL está sendo gerada
- Verificar logs no console

### Imagens não carregam

- Verificar se produtos têm imagens no Shopify
- Verificar URLs das imagens no console
- Verificar CORS (Shopify permite por padrão)

## 📝 Notas Importantes

1. **Personalização:** Está desabilitada no lançamento. Para habilitar depois:
   - Alterar `PERSONALIZATION_CONFIG.enabled: true`
   - Configurar metafields no Shopify
   - Fazer novo deploy

2. **Credenciais:** Storefront Access Token é seguro para estar no código (é público). Admin tokens NUNCA devem estar no código.

3. **Cache:** Cache de produtos tem TTL de 5 minutos. Pode ajustar em `cache.js` se necessário.

4. **Rate Limiting:** Shopify tem limite de 2 requests/segundo. O código já tem retry logic implementado.

## 🎯 Próximos Passos Após Deploy

1. Monitorar primeiras semanas
2. Coletar feedback de usuários
3. Ajustar performance conforme necessário
4. Habilitar personalização nas próximas semanas
5. Configurar analytics e monitoramento

## 📞 Suporte

- [Vercel Docs](https://vercel.com/docs)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Documentação do Projeto](./docs/)

