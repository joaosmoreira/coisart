# 🎨 Coisart — Mercado Vivo de Artes & Artesanato

> **Coisart** é uma plataforma e-commerce moderna e acolhedora desenvolvida à medida para feiras de artesanato, mercados locais e criadores independentes em Portugal. Une a sensibilidade do artesanato feito à mão à eficiência de um e-commerce contemporâneo com backoffice de gestão completo.

---

## 🚀 Tecnologias Utilizadas

### **Frontend**
- **React 19** & **TypeScript** — Interface reativa, modular e tipada.
- **TailwindCSS v4** & **Vanilla CSS** — Design system artesanal, responsivo e acolhedor (tons creme, rosa `#DE7B91`, limão e tinta).
- **Lucide React** — Ícones vetoriais modernos.
- **Zustand** — Gestão de estado global leve para o carrinho de compras.
- **React Router 7** — Navegação SPA fluida sem recarregamentos de página.

### **Backend & Base de Dados**
- **Node.js** & **Express** — API RESTful rápida e modular.
- **MongoDB** & **Mongoose ODM** — Armazenamento flexível de artigos, artesãos, clientes e encomendas.
- **Bcrypt.js** & **JSON Web Tokens (JWT)** — Autenticação segura de administradores e vendedores.
- **HTML5 Canvas Image Compression** — Otimização automática cliente-lado para fotos de perfil e artigos (máx 5MB).

---

## ✨ Principais Funcionalidades

### 🛒 **Loja Pública**
- **Homepage Editorial**: Hero envolvente, cartões oficiais do ponto de recolha parceiro (**Ah Coisas ~ Concept Store em Vila das Aves**), destaques de artesãos (máx. 3) e grelha com 24 peças artesanais.
- **Diretório de Artesãos (`/artesaos`)**:
  - Navegação interativa por disciplinas (*Pintura, Ilustração, Cerâmica, Bordados, Macramé, etc.*).
  - Suporte a **Drag-to-Scroll** com o rato, setas de navegação lateral, contagem de artesãos por técnica, seletor *dropdown* e modo grelha expandida (*"Ver Todas"*).
- **Banca do Artesão (`/banca/:slug`)**: Perfil completo do criador com foto/avatar artesanal, biografia, links de Instagram/redes e coleção exclusiva de artigos.
- **Página de Produto (`/produto/:slug`)**: Galeria de fotografia, detalhes de materiais, especificações e cartão do artesão criador.
- **Carrinho & Checkout**: Seleção entre levantamento no ponto de recolha parceiro ou envio ao domicílio.

### 🛡️ **Painel de Administração / Backoffice (`/admin`)**
- **Gestão de Artesãos/Vendedores**:
  - Sistema **Drag & Drop** para foto de perfil com compressão automática e limite de 5MB.
  - Seleção fácil dos 3 artesãos em destaque na Homepage com barra de pesquisa e botão de alternância.
- **Gestão de Produtos**: Listagem organizada por banca, criação/edição com galeria de fotos e controlo de stock.
- **Gestão de Encomendas & Clientes (CRM)**: Criação manual de encomendas, pesquisa de clientes e acompanhamento de estados de pagamento/entrega.

---

## 🛠️ Instalação e Execução Local

### **Pré-requisitos**
- Node.js (v18+)
- MongoDB Local ou conta no MongoDB Atlas

### **1. Clonar o repositório e instalar dependências**
```bash
git clone <URL_DO_REPOSITORIO>
cd coisart
npm install
```

### **2. Configurar variáveis de ambiente (`.env`)**
Crie um ficheiro `.env` na raiz do projeto com o seguinte conteúdo:
```env
PORT=5005
MONGODB_URI=mongodb://127.0.0.1:27017/coisart
JWT_SECRET=coisart_chave_secreta_local
```

### **3. Popular a Base de Dados (Seed)**
Execute o script de *seed* para criar 80 produtos artesanais com *slugs* 100% coincidentes, 25 artesãos e categorias:
```bash
npm run seed
```

### **4. Iniciar em modo de Desenvolvimento**
Em terminais separados:
```bash
# Servidor Backend (Porta 5005)
npm run dev:server

# Servidor Frontend (Porta 3000)
npm run dev
```

---

## 🌐 Publicação em Produção (Render.com + MongoDB Atlas)

O servidor Express está pré-configurado para servir a API e a build estática do React na mesma porta em ambiente de produção.

### **1. Seed no MongoDB Atlas**
```bash
MONGODB_URI="mongodb+srv://UTILIZADOR:PALAVRA_PASSE@SEU_CLUSTER.mongodb.net/coisart?retryWrites=true&w=majority" npm run seed
```

### **2. Deploy no Render.com**
1. Crie um **Web Service** ligado ao repositório no Render.
2. Defina os comandos:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Adicione as Variáveis de Ambiente no Render:
   - `MONGODB_URI` = `mongodb+srv://...`
   - `JWT_SECRET` = `coisart_chave_producao`

---

## 📝 Licença

**Proprietária e Confidencial** — Copyright © 2026 João Moreira. Todos os Direitos Reservados.

É estritamente proibida qualquer cópia, reprodução, redistribuição ou reutilização comercial deste código-fonte sem autorização expressa por escrito do titular dos direitos de autor.
