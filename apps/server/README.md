# Backend Server (`/apps/server`)

Este diretório contém a aplicação backend para o projeto **Controle de Salas Biopark**, desenvolvida com **NestJS**. Ele é responsável por fornecer a API, gerenciar toda a lógica de negócio (DDD) e se comunicar com o banco de dados PostgreSQL.

---

## 🛠️ Tecnologias e Padrões

* **Framework**: `NestJS`
* **Arquitetura**: `Domain-Driven Design (DDD)`, `Arquitetura Limpa`
* **Banco de Dados**: `TypeORM`, `PostgreSQL`
* **Testes**: `Jest`

---

## 🚀 Como Executar (Desenvolvimento)

Para rodar **apenas o backend** e o banco de dados em modo de desenvolvimento (com hot-reload), execute o seguinte comando a partir do **diretório raiz do monorepo**:

```bash
npm run dev:server
```

A API estará disponível em `http://localhost:3001`.

## 🧪 Como Executar os Testes

Para rodar todos os testes (unitários e e2e) específicos do backend, execute o seguinte comando a partir do **diretório raiz do monorepo**:

```bash
npm test --workspace=server
```