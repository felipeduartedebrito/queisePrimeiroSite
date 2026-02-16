# Guia de Migração - QUEISE E-commerce

## Checklist de Migração para Produção

Use este checklist para garantir uma migração suave do modo desenvolvimento para produção com Shopify.

## Pré-Migração

### 1. Configuração Shopify

- [ ] Loja Shopify criada e ativa
- [ ] Storefront Access Token gerado
- [ ] Produtos cadastrados (~77 produtos)
- [ ] Imagens dos produtos carregadas
- [ ] Coleções criadas (4 categorias)
- [ ] Variantes configuradas corretamente
- [ ] Preços configurados
- [ ] Estoque atualizado
- [ ] **NOTA:** Metafields de personalização podem ser configurados depois (funcionalidade será habilitada nas próximas semanas)

### 2. Testes em Desenvolvimento

- [ ] Listar produtos funciona
- [ ] Detalhes do produto carrega
- [ ] Imagens aparecem corretamente
- [ ] Variantes funcionam
- [ ] Adicionar ao carrinho funciona
- [ ] Atualizar quantidade no carrinho
- [ ] Remover item do carrinho
- [ ] Checkout URL gerada corretamente
- [ ] **NOTA:** Testes de personalização serão feitos quando funcionalidade for habilitada

### 3. Validação de Dados

- [ ] Todos os produtos têm imagens
- [ ] Todos os produtos têm variantes
- [ ] Preços estão em BRL
- [ ] Handles dos produtos são únicos
- [ ] Handles das coleções são únicos
- [ ] **NOTA:** Validação de metafields de personalização será feita quando funcionalidade for habilitada

## Migração

### 1. Atualizar Configuração

- [ ] Editar `assets/js/core/config.js`
- [ ] Alterar `isDevelopment: false`
- [ ] Verificar credenciais Shopify corretas
- [ ] Verificar domínio Shopify correto
- [ ] **Confirmar:** `PERSONALIZATION_CONFIG.enabled: false` (personalização desabilitada no lançamento)

### 2. Deploy

- [ ] Fazer commit das alterações
- [ ] Push para repositório
- [ ] Deploy na Vercel (ou servidor)
- [ ] Verificar se deploy foi bem-sucedido

### 3. Testes Pós-Deploy

- [ ] Acessar site em produção
- [ ] Verificar console do navegador (sem erros)
- [ ] Testar listagem de produtos
- [ ] Testar detalhes do produto
- [ ] Testar adicionar ao carrinho
- [ ] Testar checkout completo
- [ ] Verificar se imagens carregam (CDN)
- [ ] Verificar se cache funciona
- [ ] Testar em diferentes navegadores
- [ ] Testar em mobile

## Validação de Funcionalidades

### Produtos

- [ ] Lista de produtos carrega
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Paginação funciona
- [ ] Imagens otimizadas carregam rápido
- [ ] Preços exibidos corretamente

### Detalhes do Produto

- [ ] Galeria de imagens funciona
- [ ] Seleção de variantes funciona
- [ ] Adicionar ao carrinho funciona
- [ ] **NOTA:** Personalização está desabilitada no lançamento inicial

### Carrinho

- [ ] Carrinho carrega itens
- [ ] Quantidades podem ser atualizadas
- [ ] Itens podem ser removidos
- [ ] Preços calculados corretamente
- [ ] Carrinho persiste entre sessões
- [ ] **NOTA:** Personalização não aparece (funcionalidade desabilitada)

### Checkout

- [ ] Botão checkout funciona
- [ ] Redireciona para Shopify
- [ ] Preços corretos no checkout
- [ ] Processo de pagamento funciona
- [ ] **NOTA:** CustomAttributes não aparecem (personalização desabilitada)

## Monitoramento

### Primeiras 24 Horas

- [ ] Monitorar logs do Vercel
- [ ] Verificar erros no console
- [ ] Monitorar taxa de conversão
- [ ] Verificar pedidos no Shopify
- [ ] Validar que pedidos são criados corretamente

### Primeira Semana

- [ ] Analisar performance
- [ ] Verificar taxa de erro
- [ ] Coletar feedback de usuários
- [ ] Ajustar cache se necessário
- [ ] Otimizar queries se necessário

## Troubleshooting

### Problemas Comuns

#### Produtos não aparecem

**Causa:** Produtos não publicados ou `availableForSale: false`

**Solução:**
- Verificar no Shopify Admin → Products
- Garantir que produtos estão publicados
- Verificar se variantes têm estoque

#### Carrinho vazio após refresh

**Causa:** Cart ID não está sendo salvo ou expirou

**Solução:**
- Verificar `localStorage` no navegador
- Verificar se `CartStorage.saveCartId()` está sendo chamado
- Carrinho Shopify expira após ~10 dias (comportamento normal)

#### Personalização não aparece no checkout

**Causa:** Funcionalidade está desabilitada no lançamento inicial

**Solução:**
- Isso é esperado. Personalização será habilitada nas próximas semanas
- Para habilitar: alterar `PERSONALIZATION_CONFIG.enabled: true` em `config.js`
- Verificar se metafields estão configurados nos produtos

#### Erro de Rate Limit

**Causa:** Muitas requisições à API

**Solução:**
- Aumentar TTL do cache
- Implementar debounce em buscas
- Verificar se cache está funcionando

#### Imagens não carregam

**Causa:** URLs incorretas ou CORS

**Solução:**
- Verificar URLs das imagens no console
- Verificar se imagens existem no Shopify
- Verificar configurações de CORS no Shopify

## Rollback

Se necessário reverter para modo desenvolvimento:

1. **Editar `config.js`:**
   ```javascript
   isDevelopment: true
   ```

2. **Fazer deploy:**
   ```bash
   git commit -am "Revert to development mode"
   git push
   ```

3. **Verificar:**
   - Site volta a usar localStorage
   - Mock database funciona
   - Nenhuma chamada à Shopify API

## Checklist Final

Antes de considerar migração completa:

- [ ] Todos os testes passaram
- [ ] Nenhum erro crítico nos logs
- [ ] Performance aceitável
- [ ] Usuários conseguem fazer pedidos
- [ ] Checkout funciona end-to-end
- [ ] Monitoramento configurado
- [ ] Documentação atualizada
- [ ] **Confirmado:** Personalização desabilitada (`PERSONALIZATION_CONFIG.enabled: false`)

## Próximos Passos

Após migração bem-sucedida:

1. **Lançamento Inicial:**
   - Monitorar primeiras semanas
   - Coletar feedback de usuários
   - Ajustar performance conforme necessário

2. **Próximas Semanas - Habilitar Personalização:**
   - Configurar metafields de personalização nos produtos
   - Alterar `PERSONALIZATION_CONFIG.enabled: true` em `config.js`
   - Testar funcionalidade completa
   - Validar customAttributes nos pedidos

3. **Otimização:**
   - Ajustar TTL do cache baseado em uso
   - Otimizar queries GraphQL
   - Implementar lazy loading de imagens

4. **Melhorias:**
   - Adicionar analytics
   - Implementar A/B testing
   - Adicionar wishlist (se necessário)

5. **Manutenção:**
   - Monitorar performance
   - Atualizar dependências
   - Revisar logs regularmente

## Suporte

Em caso de problemas:

1. Verificar logs do Vercel
2. Verificar console do navegador
3. Verificar Shopify Admin → Settings → Notifications
4. Consultar documentação:
   - `docs/shopify-integration.md`
   - `docs/deployment.md`
   - [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)

## Notas Importantes

- **Cart ID:** Persiste por ~10 dias no Shopify. Após expirar, novo carrinho é criado automaticamente.
- **Cache:** TTL de 5 minutos. Produtos podem não atualizar imediatamente.
- **Rate Limits:** Shopify tem limites de requisições. Cache ajuda a evitar problemas.
- **CustomAttributes:** Aparecem nos pedidos e podem ser usados para produção.

