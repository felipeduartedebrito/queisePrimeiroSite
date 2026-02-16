# QUEISE E-commerce

E-commerce de produtos personalizados integrado com Shopify Storefront API.

## 🚀 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript Vanilla (ES6 modules)
- **Backend:** Shopify Storefront API (GraphQL)
- **Hospedagem:** Vercel
- **Checkout:** Shopify Hosted Checkout
- **Imagens:** Shopify CDN

## 📋 Pré-requisitos

- Node.js (opcional, apenas para Vercel CLI)
- Conta Shopify com loja ativa
- Storefront Access Token do Shopify

## ⚙️ Configuração

### 1. Credenciais Shopify

Edite `assets/js/core/config.js`:

```javascript
export const SHOPIFY = {
    domain: 'sua-loja.myshopify.com',
    storefrontAccessToken: 'seu-token-aqui',
    apiVersion: '2024-01'
};
```

### 2. Modo de Desenvolvimento

Para alternar entre mock e Shopify API:

```javascript
export const ENVIRONMENT = {
    isDevelopment: true,  // true = mock, false = Shopify API
    // ...
};
```

## 🏃 Executando Localmente

### Opção 1: Servidor HTTP Simples

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Acesse: `http://localhost:8000`

### Opção 2: Vercel Dev

```bash
npm install -g vercel
vercel dev
```

## 📦 Estrutura do Projeto

```
queisePrimeiroSite/
├── assets/
│   ├── css/          # Estilos
│   └── js/
│       ├── core/     # Módulos core (API, config, storage)
│       ├── components/  # Componentes reutilizáveis
│       └── pages/    # Lógica específica de páginas
├── config/
│   └── shopify.config.js  # Queries GraphQL
├── docs/             # Documentação
├── paginas/          # Páginas HTML
└── vercel.json       # Configuração Vercel
```

## 🔧 Desenvolvimento

### Modo Mock (Desenvolvimento)

Com `isDevelopment: true`:
- Usa localStorage para produtos e carrinho
- Não requer conexão com Shopify
- Ideal para desenvolvimento local

### Modo Produção

Com `isDevelopment: false`:
- Usa Shopify Storefront API
- Requer credenciais válidas
- Cache automático (5 minutos TTL)

## 📚 Documentação

- **[Integração Shopify](docs/shopify-integration.md)** - Guia completo de integração
- **[Deploy](docs/deployment.md)** - Guia de deploy na Vercel
- **[Migração](docs/migration-guide.md)** - Checklist de migração para produção

## 🛠️ Funcionalidades

### Produtos
- ✅ Listagem com filtros
- ✅ Busca
- ✅ Detalhes do produto
- ✅ Galeria de imagens
- ✅ Seleção de variantes
- ✅ Imagens otimizadas (CDN)

### Personalização
- ✅ Texto personalizado
- ✅ Seleção de fonte
- ✅ Seleção de cor
- ✅ Seleção de posição
- ✅ Preview em tempo real
- ✅ Preço adicional (+R$20)

### Carrinho
- ✅ Adicionar/remover itens
- ✅ Atualizar quantidades
- ✅ Persistência entre sessões
- ✅ CustomAttributes para personalização

### Checkout
- ✅ Integração com Shopify Checkout
- ✅ Processamento de pagamento seguro
- ✅ CustomAttributes nos pedidos

## 🧪 Testes

Execute os arquivos de teste em `tests/`:

- `test-1-core.html` - Testes dos módulos core
- `test-2-notifications.html` - Sistema de notificações
- `test-3-components.html` - Componentes
- `test-5-personalization.html` - Personalização
- `test-6-product-detail.html` - Detalhes do produto

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy produção
vercel --prod
```

Ou conecte seu repositório GitHub na Vercel para deploy automático.

Veja [docs/deployment.md](docs/deployment.md) para guia completo.

## 🔒 Segurança

- ✅ Storefront Access Token é seguro para expor no frontend
- ✅ Pagamentos processados pelo Shopify (PCI Compliant)
- ✅ NUNCA exponha Admin API tokens
- ✅ Headers de segurança configurados (vercel.json)

## 📊 Performance

- ✅ Cache de produtos (5 minutos TTL)
- ✅ Imagens otimizadas via Shopify CDN
- ✅ Lazy loading de imagens
- ✅ Code splitting (ES6 modules)

## 🐛 Troubleshooting

### Produtos não aparecem
- Verificar se `isDevelopment: false`
- Verificar credenciais Shopify
- Verificar console do navegador

### Carrinho não persiste
- Verificar localStorage habilitado
- Verificar se Cart ID está sendo salvo
- Carrinho Shopify expira após ~10 dias

### Erro de Rate Limit
- Aumentar TTL do cache
- Implementar debounce em buscas
- Verificar se cache está funcionando

Veja [docs/migration-guide.md](docs/migration-guide.md) para mais troubleshooting.

## 📝 Licença

Este projeto é proprietário.

## 🤝 Suporte

Para questões sobre:
- **Shopify:** [Shopify Docs](https://shopify.dev/docs)
- **Vercel:** [Vercel Docs](https://vercel.com/docs)
- **Integração:** Veja `docs/shopify-integration.md`

## 📈 Próximos Passos

- [ ] Analytics (Google Analytics)
- [ ] Search Console
- [ ] A/B Testing
- [ ] Wishlist
- [ ] Reviews de produtos

---

Desenvolvido para QUEISE E-commerce

