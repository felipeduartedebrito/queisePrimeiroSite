# 🧪 GUIA DE TESTES - PRODUTO INDIVIDUAL + INTEGRAÇÃO SHOPIFY

## 📋 Funcionalidades Desenvolvidas para Testar

### ✅ **Desenvolvido nesta sessão:**
1. **Sistema de URLs dinâmicas** - cada produto tem sua própria página
2. **Página produto individual completa** - galeria, personalização, carrinho
3. **Arquitetura preparada para Shopify** - API abstrata + mock database
4. **Links atualizados** na página de produtos

---

## 🔗 TESTE 1: URLs DINÂMICAS DOS PRODUTOS

### **Objetivo:** Verificar se cada produto da listagem leva para sua página específica

#### **Passos do teste:**
1. **Ir para** `paginas/produtos.html`
2. **Clicar no botão "Personalizar"** de produtos diferentes
3. **Verificar a URL** que carrega em cada caso

#### **Resultados esperados:**
- [ ] **Garrafa Stanley** → `produto-individual.html?id=garrafa-stanley-1l`
- [ ] **Copo Térmico** → `produto-individual.html?id=copo-termico-500ml`
- [ ] **Bolsa Térmica** → `produto-individual.html?id=bolsa-termica-20l`
- [ ] **Mochila** → `produto-individual.html?id=mochila-executiva-30l`
- [ ] **Imã** → `produto-individual.html?id=ima-personalizado`
- [ ] **Garrafa Sport** → `produto-individual.html?id=garrafa-sport-600ml`
- [ ] **Bolsa Compacta** → `produto-individual.html?id=bolsa-compacta-8l`
- [ ] **Mala** → `produto-individual.html?id=mala-viagem-60l`
- [ ] **Copo Café** → `produto-individual.html?id=copo-cafe-350ml`

#### **Debug se não funcionar:**
```javascript
// No console, verificar se os links estão corretos
document.querySelectorAll('.btn-product').forEach(btn => {
    console.log(btn.href);
});
```

---

## 📱 TESTE 2: CARREGAMENTO DINÂMICO DO PRODUTO

### **Objetivo:** Verificar se cada URL carrega dados específicos do produto

#### **Passos do teste:**
1. **Acessar diretamente** `produto-individual.html?id=garrafa-stanley-1l`
2. **Verificar se carrega** dados da garrafa Stanley
3. **Acessar** `produto-individual.html?id=copo-termico-500ml`  
4. **Verificar se carrega** dados do copo térmico

#### **Dados que devem mudar:**
- [ ] **Título da página** no navegador
- [ ] **Breadcrumb** (nome do produto)
- [ ] **Nome do produto** na página
- [ ] **Categoria** do produto
- [ ] **Preço base** correto
- [ ] **Descrição** específica
- [ ] **Características** únicas

#### **Debug no console:**
```javascript
// Verificar se o produto carregou
console.log('Produto atual:', ProductApp.productData);

// Verificar ID capturado da URL
console.log('ID da URL:', new URLSearchParams(window.location.search).get('id'));
```

---

## 🎨 TESTE 3: SISTEMA DE PERSONALIZAÇÃO COMPLETO

### **Objetivo:** Testar todas as funcionalidades de personalização

#### **3.1 Campo de Texto**
- [ ] **Digite texto** no campo "Texto Personalizado"
- [ ] **Contador de caracteres** atualiza em tempo real
- [ ] **Limite de 30 caracteres** é respeitado
- [ ] **Preview atualiza** conforme você digita

#### **3.2 Seleção de Fonte**
- [ ] **Marcar "Arial"** → preview muda para Arial
- [ ] **Marcar "Times"** → preview muda para Times New Roman
- [ ] **Marcar "Script"** → preview muda para fonte cursiva
- [ ] **Marcar "Bold"** → preview muda para Arial Bold

#### **3.3 Cor do Texto**
- [ ] **Branco** → texto fica branco no preview
- [ ] **Preto** → texto fica preto no preview
- [ ] **Dourado** → texto fica dourado no preview
- [ ] **Prata** → texto fica prateado no preview

#### **3.4 Posição do Texto**
- [ ] **Centro** → texto se posiciona no centro
- [ ] **Parte Inferior** → texto se move para baixo
- [ ] **Lateral** → texto se move para o lado

#### **Debug da personalização:**
```javascript
// Verificar estado da personalização
console.log('Personalização atual:', ProductApp.selectedVariants);

// Testar preview manualmente
updateTextPreview();
```

---

## 💰 TESTE 4: SISTEMA DE PREÇOS DINÂMICO

### **Objetivo:** Verificar se preços calculam corretamente

#### **Cenários de teste:**

#### **4.1 Sem Personalização**
1. **Não digitar texto** personalizado
2. **Verificar preços:**
   - [ ] Personalização: R$ 0,00
   - [ ] Total: R$ 165,00 (garrafa) ou preço base do produto
   - [ ] Carrinho: R$ 165,00

#### **4.2 Com Personalização**
1. **Digitar qualquer texto**
2. **Verificar preços:**
   - [ ] Personalização: R$ 20,00
   - [ ] Total: R$ 185,00 (garrafa + personalização)
   - [ ] Carrinho: R$ 185,00

#### **4.3 Mudança de Quantidade**
1. **Alterar quantidade para 2**
2. **Verificar preços:**
   - [ ] Personalização: R$ 20,00 (por unidade)
   - [ ] Total: R$ 185,00 (por unidade)
   - [ ] Carrinho: R$ 370,00 (2 × 185)

#### **Debug de preços:**
```javascript
// Verificar cálculo atual
console.log('Preço total:', getCurrentTotalPrice());

// Forçar atualização
updatePricing();
```

---

## 🛒 TESTE 5: SISTEMA DE CARRINHO

### **Objetivo:** Testar adição ao carrinho e persistência

#### **5.1 Adicionar ao Carrinho**
1. **Personalizar produto** (texto, fonte, cor)
2. **Clicar "Adicionar ao Carrinho"**
3. **Verificar feedback:**
   - [ ] Botão muda para "✓ Adicionado!"
   - [ ] Botão fica verde por 2 segundos
   - [ ] Volta ao estado normal

#### **5.2 Persistência no LocalStorage**
1. **Adicionar produto ao carrinho**
2. **Abrir DevTools → Application → Local Storage**
3. **Verificar se existe** `queise_cart`
4. **Conteúdo deve ter:**
   - [ ] Dados do produto
   - [ ] Texto personalizado
   - [ ] Fonte selecionada
   - [ ] Cor do texto
   - [ ] Posição
   - [ ] Quantidade

#### **Debug do carrinho:**
```javascript
// Ver carrinho atual
console.log('Carrinho:', JSON.parse(localStorage.getItem('queise_cart')));

// Limpar carrinho para teste
localStorage.removeItem('queise_cart');
```

---

## ⚙️ TESTE 6: VARIAÇÕES DO PRODUTO

### **Objetivo:** Testar seletores de tamanho e cor

#### **6.1 Seleção de Tamanho**
1. **Selecionar tamanhos diferentes**
2. **Verificar se preço atualiza** (se produto tiver variações)
3. **Ver feedback visual** da seleção

#### **6.2 Seleção de Cor**
1. **Selecionar cores diferentes**
2. **Verificar feedback visual**
3. **Estado salvo** corretamente

#### **Debug de variações:**
```javascript
// Ver variação selecionada
console.log('Variações:', ProductApp.selectedVariants);

// Ver dados do produto carregado
console.log('Produto:', ProductApp.productData);
```

---

## 🖼️ TESTE 7: GALERIA DE IMAGENS

### **Objetivo:** Testar navegação na galeria

#### **Funcionalidades:**
- [ ] **Thumbnails clicáveis** mudam imagem principal
- [ ] **Hover effects** funcionam
- [ ] **Click na imagem principal** mostra hint de zoom
- [ ] **Transições suaves** entre imagens

---

## 📊 TESTE 8: ABAS DE INFORMAÇÕES

### **Objetivo:** Testar navegação nas abas

#### **Abas disponíveis:**
- [ ] **Entrega** → informações de envio
- [ ] **Garantia** → política de garantia
- [ ] **Cuidados** → instruções de uso

#### **Funcionalidade:**
- [ ] **Click muda aba ativa**
- [ ] **Conteúdo muda** corretamente
- [ ] **Estilo visual** da aba ativa

---

## 🔄 TESTE 9: SISTEMA SHOPIFY-READY

### **Objetivo:** Verificar se a arquitetura está preparada

#### **9.1 Modo Desenvolvimento (Atual)**
```javascript
// No console, verificar configuração
console.log('Modo desenvolvimento:', API_CONFIG.isDevelopment); // deve ser true
console.log('API Config:', API_CONFIG);
```

#### **9.2 Mock Database**
```javascript
// Verificar se mock está funcionando
console.log('Products mock:', MOCK_PRODUCTS);

// Testar API mock
productAPI.getProduct('garrafa-stanley-1l').then(result => {
    console.log('Resultado da API mock:', result);
});
```

#### **9.3 Estrutura de Dados**
- [ ] **Handles** corretos (garrafa-stanley-1l)
- [ ] **Preços em centavos** (16500 = R$ 165,00)
- [ ] **Metafields** de personalização
- [ ] **Variants** estruturados
- [ ] **Options** definidas

---

## 🎯 TESTE 10: FLUXO COMPLETO END-TO-END

### **Cenário:** Cliente completo navegando e comprando

#### **Passos:**
1. **Navegar** para `produtos.html`
2. **Filtrar** por categoria (ex: Garrafas)
3. **Clicar** em uma garrafa específica
4. **Verificar** carregamento correto
5. **Personalizar** com texto
6. **Escolher** fonte e cor
7. **Alterar** quantidade
8. **Adicionar** ao carrinho
9. **Verificar** persistência
10. **Voltar** e repetir com produto diferente

#### **Resultados esperados:**
- [ ] **Navegação fluida** sem erros
- [ ] **Cada produto** carrega dados únicos
- [ ] **Personalização** funciona perfeitamente
- [ ] **Carrinho** acumula produtos diferentes
- [ ] **Performance** boa em todos os passos

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### **Produto não carrega:**
- ✅ Verificar se URL tem `?id=` correto
- ✅ Verificar se produto existe em `MOCK_PRODUCTS`
- ✅ Ver console para erros JavaScript

### **Personalização não funciona:**
- ✅ Verificar se `ProductApp.selectedVariants` existe
- ✅ Ver se `updateTextPreview()` é chamada
- ✅ Verificar se preview HTML existe

### **Preços não atualizam:**
- ✅ Verificar se `updatePricing()` é chamada
- ✅ Ver se `ProductApp.productData` existe
- ✅ Conferir se elementos DOM existem

### **Carrinho não salva:**
- ✅ Verificar se localStorage funciona
- ✅ Ver se `saveToCart()` é chamada
- ✅ Verificar estrutura dos dados salvos

---

## 📱 TESTE RESPONSIVO

### **Breakpoints:**
- [ ] **Desktop (1200px+)**: Layout 3 colunas
- [ ] **Tablet (768-1024px)**: Layout 2 colunas
- [ ] **Mobile (<768px)**: Layout coluna única

### **Elementos específicos:**
- [ ] **Galeria** responsiva
- [ ] **Personalização** acessível em mobile
- [ ] **Botões** touch-friendly
- [ ] **Preview** visível em todas as telas

---

## ✅ CHECKLIST FINAL DE APROVAÇÃO

### **Funcionalidades Essenciais:**
- [ ] ✅ URLs dinâmicas funcionam
- [ ] ✅ Cada produto carrega dados únicos
- [ ] ✅ Personalização completa funcional
- [ ] ✅ Preview em tempo real
- [ ] ✅ Carrinho salva corretamente
- [ ] ✅ Sistema preparado para Shopify
- [ ] ✅ Responsivo em todas as telas
- [ ] ✅ Performance satisfatória

### **Integração:**
- [ ] ✅ Links da página produtos funcionam
- [ ] ✅ Navegação entre páginas fluida
- [ ] ✅ Breadcrumb funciona
- [ ] ✅ Voltar para produtos funciona

### **Shopify Ready:**
- [ ] ✅ API abstrata funcionando
- [ ] ✅ Mock database estruturado
- [ ] ✅ Configuração para migração pronta
- [ ] ✅ Metafields de personalização definidos

---

## 🚀 QUANDO TUDO FUNCIONAR

**Parabéns!** O sistema de produto individual está pronto para:

1. **✅ Uso em produção** com dados mock
2. **✅ Migração para Shopify** sem refatoração
3. **✅ Experiência completa** de personalização
4. **✅ Próximas páginas** podem ser desenvolvidas

---

## 📞 DEBUG AVANÇADO

### **Console Commands Úteis:**

```javascript
// Estado completo da aplicação
console.log('ProductApp completo:', ProductApp);

// Testar função específica
clearPersonalization();

// Verificar produto atual
console.log('Produto carregado:', ProductApp.productData?.title);

// Forçar atualização de preços
updatePricing();

// Ver carrinho
console.log('Carrinho:', JSON.parse(localStorage.getItem('queise_cart') || '[]'));

// Simular erro
productAPI.getProduct('produto-inexistente');

// Testar API
productAPI.getProduct('garrafa-stanley-1l').then(console.log);
```

---

*Guia criado para o sistema de Produto Individual + Integração Shopify*  
*Projeto QUEISE - Use Exclusividade*  
*Versão: 2.0 - Incluindo funcionalidades dinâmicas*