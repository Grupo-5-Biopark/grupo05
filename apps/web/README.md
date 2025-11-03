# Frontend Web App (`/apps/web`)

Este diretório contém a aplicação frontend para o projeto **Controle de Salas Biopark**, desenvolvida com **Next.js**. Ele é responsável por fornecer a interface do usuário para interagir com a API do backend.

---

## 🛠️ Tecnologias e Padrões

- **Framework**: `Next.js 15` (com App Router)
- **Linguagem**: `TypeScript`
- **Estilização**: `CSS Modules` e `CSS Variables`
- **Testes**: `Jest` com `React Testing Library`

## 🎨 Design System

### Cores Principais

- **Azul Escuro:** `#233444` (Primary Dark)
- **Vermelho:** `#EB0644` (Primary Red)
- **Branco:** `#FBFBFB` (Primary Light)
- **Azul Secundário:** `#1a2935` (Secondary Dark)
- **Vermelho Claro:** `#ff4d7a` (Accent Red)

### Tipografia

- **Fonte Principal:** `Segoe UI`, `Tahoma`, `Geneva`, `Verdana`, `sans-serif`

---

## 🚀 Como Executar (Desenvolvimento)

Para rodar **apenas a aplicação web** em modo de desenvolvimento (com hot-reload), execute o seguinte comando a partir do **diretório raiz do monorepo**:

```bash
npm run dev:web
```

A aplicação estará disponível em `http://localhost:3000`.

## 🧪 Como Executar os Testes

Para rodar os testes específicos do frontend, execute o seguinte comando a partir do **diretório raiz do monorepo**:

```bash
npm test --workspace=web
```
