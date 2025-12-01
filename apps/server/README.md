# Backend Server (`/apps/server`)

Este diretório contém a aplicação backend para o projeto **Controle de Salas Biopark**, desenvolvida com **NestJS**. Ele é responsável por fornecer a API, gerenciar toda a lógica de negócio (DDD) e se comunicar com o banco de dados PostgreSQL.

---

## 🛠️ Tecnologias e Padrões

- **Framework**: `NestJS`
- **Arquitetura**: `Domain-Driven Design (DDD)`, `Arquitetura Limpa`
- **Banco de Dados**: `TypeORM`, `PostgreSQL`
- **Documentação da API**: `Swagger (OpenAPI)`
- **Testes**: `Jest`

---

## 📄 Documentação da API (Swagger)

Este projeto utiliza Swagger para gerar uma documentação interativa da API. Quando o servidor está em execução, você pode acessar a interface do Swagger para visualizar todos os endpoints, seus parâmetros, e testá-los diretamente no navegador.

- **URL**: **[http://localhost:3001/api-docs](http://localhost:3001/api-docs)**

Para garantir que a documentação permaneça atualizada, utilize os decoradores do pacote `@nestjs/swagger` (ex: `@ApiOperation`, `@ApiResponse`, `@ApiProperty`) em todos os novos controllers e DTOs.

---

## 🚀 Como Executar (Desenvolvimento)

Para rodar **apenas o backend** e o banco de dados em modo de desenvolvimento (com hot-reload), execute o seguinte comando a partir do **diretório raiz do monorepo**:

```bash
npm run dev:server
```

A API estará disponível em `http://localhost:3001`.

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm test --workspace=server

# Testes unitários com coverage
npm test --workspace=server -- --coverage

# Testes e2e
npm run test:e2e --workspace=server

# Testes em modo watch
npm test --workspace=server -- --watch
```

### Estrutura de Testes

- **Unitários**: Localizados junto aos arquivos fonte (`*.spec.ts`)
- **E2E**: Localizados em `test/*.e2e-spec.ts`

### Cobertura

Os relatórios de cobertura são gerados em `coverage/` após executar com `--coverage`.
