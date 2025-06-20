# 🧪 GUIA DE TESTES - PROJETO QUEISE

## 📋 Checklist Inicial

### 1. 🗂️ Estrutura de Arquivos

Verifique se sua pasta está organizada assim:

```
projeto-queise/
├── index.html          # ✅ Arquivo atualizado
├── styles.css          # ✅ Já existe
├── script.js           # ✅ Já existe
├── imagens/            # ✅ Já existe
│   └── (suas imagens)
├── paginas/            # 🆕 CRIAR ESTA PASTA
│   └── produtos.html   # 🆕 COLOCAR AQUI
├── css/                # 🆕 CRIAR ESTA PASTA
│   └── produtos.css    # 🆕 COLOCAR AQUI
└── js/                 # 🆕 CRIAR ESTA PASTA
    └── produtos.js     # 🆕 COLOCAR AQUI
```

### 2. 🌐 Configurar Servidor Local

**⚠️ IMPORTANTE: NÃO abra direto no navegador (file://)**

#### Opção A - VS Code (Recomendado)
1. Instale a extensão **"Live Server"**
2. Clique com botão direito no `index.html`
3. Selecione **"Open with Live Server"**
4. Abre automaticamente em `http://127.0.0.1:5500`

#### Opção B - Python
```bash
# Na pasta do projeto:
python -m http.server 8000
# Abra: http://localhost:8000
```

#### Opção C - Node.js
```bash
npx http-server
# Abra: http://localhost:8080
```

---

## ✅ TESTES OBRIGATÓRIOS

### 🏠 TESTE 1: Página Inicial (index.html)

- [ ] Página carrega sem erros
- [ ] Menu superior aparece corretamente
- [ ] Hero section com grid de produtos
- [ ] Seções rolam suavemente ao clicar no menu
- [ ] Footer completo na parte inferior
- [ ] **CRÍTICO:** Abra DevTools (F12) → Console deve estar limpo (sem erros vermelhos)

### 🔗 TESTE 2: Navegação Entre Páginas

- [ ] Clicar **"Produtos"** no menu → vai para `paginas/produtos.html`
- [ ] Clicar **"Personalizar Já"** → vai para `paginas/personalizar.html`
- [ ] Clicar **"Ver Produtos"** no hero → vai para `paginas/produtos.html`
- [ ] Links do footer funcionam (mesmo que páginas não existam ainda)
- [ ] Breadcrumb na página produtos volta para home

### 📱 TESTE 3: Página de Produtos (PRINCIPAL)

#### 3.1 Carregamento Básico
- [ ] Página carrega sem erros de CSS/JS
- [ ] Header idêntico à home aparece
- [ ] Hero section azul com breadcrumb
- [ ] Sidebar de filtros à esquerda
- [ ] Grid com 9 produtos visível
- [ ] Footer idêntico à home

#### 3.2 Sistema de Filtros
- [ ] **Categorias:** Marcar/desmarcar checkboxes
- [ ] **Preços:** Filtros por faixa funcionam
- [ ] **Características:** Premium, Térmico, etc.
- [ ] **Range personalizado:** Campos min/max funcionam
- [ ] **Contador:** "Mostrando X produtos" atualiza
- [ ] **Botão Limpar:** Remove todos os filtros

#### 3.3 Sistema de Busca
- [ ] Digite "stanley" → filtra produtos em tempo real
- [ ] Digite "copo" → mostra produtos relacionados
- [ ] Campo vazio → mostra todos novamente
- [ ] Busca funciona em nome, categoria e descrição

#### 3.4 Sistema de Ordenação
- [ ] **Nome A-Z:** Produtos reorganizam alfabeticamente
- [ ] **Nome Z-A:** Ordem reversa
- [ ] **Menor Preço:** R$ 25,00 aparece primeiro
- [ ] **Maior Preço:** R$ 350,00 aparece primeiro
- [ ] **Relevância:** Volta à ordem original

#### 3.5 Toggle de Visualização
- [ ] **Botão Grid (⊞):** Ativo por padrão, cards em grade
- [ ] **Botão List (☰):** Muda para layout horizontal
- [ ] Alternar entre os dois funciona perfeitamente

#### 3.6 Animações
- [ ] Produtos aparecem com animação ao rolar a página
- [ ] Hover effects nos cards funcionam
- [ ] Transições suaves nos filtros

### 📱 TESTE 4: Responsividade

#### Desktop (1200px+)
- [ ] Sidebar à esquerda, grid 3-4 colunas
- [ ] Todos os elementos visíveis

#### Tablet (768px-1024px)
- [ ] Sidebar movida para cima
- [ ] Grid com 2 colunas
- [ ] Menu adaptado

#### Mobile (até 768px)
- [ ] Layout em coluna única
- [ ] Sidebar responsiva
- [ ] Toggle de view escondido
- [ ] Menu hamburger (se implementado)

---

## 🔍 TESTES AVANÇADOS

### JavaScript Console Tests

Abra DevTools (F12) → Console e digite:

```javascript
// 1. Verificar se app carregou
ProductsApp
// Deve mostrar objeto com dados

// 2. Ver filtros atuais
ProductsApp.currentFilters

// 3. Ver produtos filtrados
ProductsApp.filteredProducts.length

// 4. Testar função
clearAllFilters()
```

### Teste de Performance

- [ ] Página carrega em menos de 3 segundos
- [ ] Filtros respondem instantaneamente
- [ ] Scroll suave sem travamentos
- [ ] Animações não causam lag

### Teste de Erros Comuns

#### CSS não carrega
- ✅ Arquivo está em `css/produtos.css`
- ✅ Link correto: `<link rel="stylesheet" href="../css/produtos.css">`

#### JavaScript não funciona
- ✅ Arquivo está em `js/produtos.js`
- ✅ Script no final: `<script src="../js/produtos.js"></script>`
- ✅ Console sem erros vermelhos

#### Imagens não aparecem
- ✅ Imagens na pasta `imagens/`
- ✅ Caminhos corretos nos HTMLs

---

## 🎯 FLUXO COMPLETO DO USUÁRIO

### Teste End-to-End (Faça na ordem):

1. **Abrir home** → deve carregar perfeitamente
2. **Clicar "Produtos"** → ir para página de produtos
3. **Buscar "garrafa"** → deve filtrar produtos
4. **Marcar filtro "Premium"** → reduzir mais resultados
5. **Ordenar por "Menor Preço"** → reorganizar produtos
6. **Toggle para List view** → mudar layout
7. **Limpar filtros** → voltar ao normal
8. **Clicar "Personalizar"** → ir para página personalização
9. **Voltar pelo breadcrumb** → retornar à home

### ✅ Sinais de Sucesso

- Console DevTools limpo (sem erros vermelhos)
- Filtros respondem em tempo real
- Contadores atualizam corretamente
- Animações suaves ao rolar
- Responsivo funciona em todas as telas
- Performance boa (carrega rápido)

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema: Página em branco
**Solução:** Verificar se está usando servidor local, não file://

### Problema: CSS não aparece
**Solução:** Verificar caminhos relativos (`../css/produtos.css`)

### Problema: Filtros não funcionam
**Solução:** 
1. Abrir Console (F12)
2. Verificar se `ProductsApp` existe
3. Ver se há erros de JavaScript

### Problema: Links quebrados
**Solução:** Verificar se arquivos estão nas pastas corretas

### Problema: Imagens não carregam
**Solução:** Verificar se imagens estão em `imagens/` e caminhos estão corretos

---

## 📊 FERRAMENTAS DE DEBUG

### DevTools (F12)

#### Console Tab
- Ver erros JavaScript
- Testar funções manualmente
- Debug interativo

#### Network Tab  
- Ver se arquivos carregaram (200 OK)
- Vermelho = erro 404 (não encontrado)

#### Elements Tab
- Inspecionar CSS aplicado
- Verificar classes corretas

#### Responsive Design Mode
- Testar diferentes tamanhos de tela
- Verificar breakpoints

---

## 🚀 CHECKLIST FINAL

Antes de considerar concluído:

- [ ] ✅ Todos os testes básicos passaram
- [ ] ✅ Console limpo sem erros
- [ ] ✅ Responsivo em todas as telas
- [ ] ✅ Filtros e busca funcionais
- [ ] ✅ Navegação entre páginas funciona
- [ ] ✅ Performance satisfatória
- [ ] ✅ Fluxo completo do usuário executado com sucesso

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verificar estrutura de arquivos** primeiro
2. **Usar servidor local** obrigatoriamente  
3. **Checar Console** para erros
4. **Comparar com exemplos** do guia
5. **Documentar o erro** específico encontrado

**Status:** Quando todos os testes passarem, a página de produtos está pronta para produção! 🎉

---

*Guia criado para o Projeto QUEISE - Use Exclusividade*  
*Versão: 1.0 - Data: Junho 2025*