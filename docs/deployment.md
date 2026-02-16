# Guia de Deploy - QUEISE E-commerce

## Visão Geral

Este guia descreve o processo de deploy do projeto QUEISE na Vercel e configuração do domínio no Registro.br.

## Pré-requisitos

- Conta na Vercel (gratuita)
- Conta no Registro.br
- Acesso ao painel DNS do domínio
- Git configurado

## Deploy na Vercel

### Opção 1: Via CLI

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy de desenvolvimento:**
   ```bash
   vercel
   ```

4. **Deploy de produção:**
   ```bash
   vercel --prod
   ```

### Opção 2: Via GitHub (Recomendado)

1. **Conectar repositório:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Conecte seu repositório GitHub
   - Vercel detecta automaticamente as configurações

2. **Configurações do projeto:**
   - Framework Preset: Other
   - Build Command: (deixar vazio)
   - Output Directory: . (raiz)
   - Install Command: (deixar vazio)

3. **Deploy automático:**
   - Cada push para `main` faz deploy automático
   - Pull requests geram preview deployments

## Configuração de Domínio

### Fase 1: Teste com URL Temporária

1. Após deploy, você receberá uma URL: `https://queise.vercel.app`
2. Teste todas as funcionalidades nesta URL
3. Valide integração Shopify funcionando

### Fase 2: Subdomínio de Teste

1. **No Registro.br:**
   - Acesse painel DNS
   - Adicione registro CNAME:
     - **Nome:** `novo`
     - **Valor:** `cname.vercel-dns.com`
     - **TTL:** 3600

2. **Na Vercel:**
   - Settings → Domains → Add Domain
   - Digite: `novo.dominio.com.br`
   - Aguarde SSL automático (~1h)

3. **Teste:**
   - Acesse: `https://novo.dominio.com.br`
   - Valide com usuários reais

### Fase 3: Domínio Principal (Go Live)

**⚠️ IMPORTANTE: Faça backup das configurações DNS antes!**

1. **Escolha horário de baixo tráfego** (ex: 3h da manhã)

2. **No Registro.br:**
   - Adicione/Atualize registros:
     ```
     Tipo    Nome    Valor
     ────────────────────────────────────────
     A       @       76.76.21.21
     CNAME   www     cname.vercel-dns.com
     ```
   - **Nota:** Os IPs corretos aparecem ao adicionar domínio na Vercel

3. **Na Vercel:**
   - Settings → Domains → Add Domain
   - Digite: `dominio.com.br`
   - Adicione também: `www.dominio.com.br`

4. **Aguardar propagação:**
   - Normalmente: 2-4 horas
   - Máximo: 48 horas
   - Verificar: [whatsmydns.net](https://www.whatsmydns.net)

5. **SSL automático:**
   - Vercel configura SSL automaticamente (Let's Encrypt)
   - Renovação automática

## Configurações Importantes

### Emails (@dominio.com.br)

- **NÃO são afetados** pela migração
- Registros MX são separados
- Mantenha registros MX existentes

### Backup

- **Mantenha servidor antigo ativo por 7 dias** após migração
- Facilita rollback se necessário

## Configuração do Vercel

O arquivo `vercel.json` já está configurado com:

- Headers de segurança
- Cache para assets estáticos
- Rewrites para SPA

### Variáveis de Ambiente (Opcional)

Se preferir usar variáveis de ambiente ao invés de `config.js`:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Adicione:
   - `SHOPIFY_DOMAIN`
   - `SHOPIFY_STOREFRONT_TOKEN`
3. Atualize `config.js` para ler de `process.env` (requer build step)

## Monitoramento

### Vercel Analytics

- Ative Vercel Analytics no dashboard
- Monitore performance e erros

### Logs

- Acesse: Vercel Dashboard → Project → Deployments → [Deployment] → Functions
- Veja logs em tempo real

## Rollback

Se necessário reverter:

1. Vercel Dashboard → Deployments
2. Encontre deployment anterior
3. Clique em "..." → "Promote to Production"

## Limites Gratuitos

- **Bandwidth:** 100GB/mês (~40k visitas)
- **Build time:** 100 horas/mês
- **Domínios:** Ilimitados
- **SSL:** Automático e gratuito
- **Deploys:** Ilimitados

## Troubleshooting

### Domínio não resolve

- Verificar propagação DNS: [whatsmydns.net](https://www.whatsmydns.net)
- Aguardar até 48h
- Verificar registros DNS no Registro.br

### SSL não funciona

- Aguardar até 1h após adicionar domínio
- Verificar se domínio aponta para Vercel
- Verificar certificado: [ssllabs.com](https://www.ssllabs.com/ssltest/)

### 404 em rotas

- Verificar `vercel.json` rewrites
- Verificar se arquivos HTML existem
- Verificar configuração de SPA

### Build falha

- Verificar logs no Vercel
- Verificar se não há erros de sintaxe
- Verificar dependências (se houver)

## Próximos Passos

Após deploy bem-sucedido:

1. Configurar Google Analytics
2. Configurar Search Console
3. Testar performance (PageSpeed Insights)
4. Configurar monitoramento de erros (Sentry, etc.)

## Suporte

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Registro.br Suporte](https://registro.br/atendimento/)

