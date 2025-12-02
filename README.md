# Controle de Salas Biopark

[![Continuous Integration](https://github.com/Grupo-5-Biopark/grupo05/actions/workflows/ci.yml/badge.svg)](https://github.com/Grupo-5-Biopark/grupo05/actions/workflows/ci.yml)

Aplicação full-stack para gerenciar e prever a necessidade de salas de aula e laboratórios com base na projeção de alunos para o Biopark Educação.

---

### Conteúdo

- [Visão Geral do Projeto](#-visão-geral-do-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Documentação Adicional](#-documentação-adicional)

---

## 📖 Visão Geral do Projeto

Este projeto utiliza uma arquitetura de monorepo para abrigar tanto o backend quanto o frontend da aplicação. O objetivo é criar um sistema robusto e escalável, seguindo princípios de desenvolvimento profissional como Domain-Driven Design (DDD), Arquitetura Limpa e Test-Driven Development (TDD).

---

## 🏗️ Princípios SOLID Aplicados

O projeto segue rigorosamente os princípios SOLID para garantir código manutenível, testável e extensível:

<details>
<summary><strong>S - Single Responsibility Principle (Princípio da Responsabilidade Única)</strong></summary>

Cada classe tem uma única responsabilidade. Os Use Cases são um exemplo claro:

```typescript
// Cada Use Case tem apenas uma responsabilidade
CreateUserUseCase    → Apenas criar usuários
DeleteUserUseCase    → Apenas deletar usuários
FindUserByIdUseCase  → Apenas buscar usuário por ID
```

**Localização**: `apps/server/src/modules/*/application/use-cases/`

</details>

<details>
<summary><strong>O - Open/Closed Principle (Princípio Aberto/Fechado)</strong></summary>

Classes abertas para extensão, fechadas para modificação. Utilizamos interfaces que permitem novas implementações sem alterar código existente:

```typescript
// Interface define o contrato
interface IHashingService {
  hash(value: string): Promise<string>;
  compare(value: string, hashedValue: string): Promise<boolean>;
}

// Implementação pode ser substituída sem modificar quem usa
class BcryptHashingService implements IHashingService { ... }
// Futuro: class ArgonHashingService implements IHashingService { ... }
```

**Localização**: `apps/server/src/modules/users/domain/services/`

</details>

<details>
<summary><strong>L - Liskov Substitution Principle (Princípio da Substituição de Liskov)</strong></summary>

Subtipos podem substituir seus tipos base. Qualquer implementação de `IHashingService` funciona onde a interface é esperada:

```typescript
// O UserRepository aceita qualquer implementação de IHashingService
constructor(
  @Inject(HASHING_SERVICE)
  private readonly hashingService: IHashingService,
) {}
```

</details>

<details>
<summary><strong>I - Interface Segregation Principle (Princípio da Segregação de Interfaces)</strong></summary>

Interfaces pequenas e específicas ao invés de uma interface "god object":

```typescript
// ✅ Interfaces segregadas e focadas
interface IHashingService {
  hash(value: string): Promise<string>;
  compare(value: string, hashedValue: string): Promise<boolean>;
}

// Cada repositório expõe apenas os métodos necessários para seu domínio
```

</details>

<details>
<summary><strong>D - Dependency Inversion Principle (Princípio da Inversão de Dependência)</strong></summary>

Módulos de alto nível não dependem de módulos de baixo nível. Ambos dependem de abstrações:

```typescript
// Token de injeção (abstração)
export const HASHING_SERVICE = 'HASHING_SERVICE';

// Configuração no módulo - a implementação concreta é injetada
@Module({
  providers: [
    {
      provide: HASHING_SERVICE,
      useClass: BcryptHashingService, // Pode trocar sem alterar os consumidores
    },
  ],
})
```

**Localização**: `apps/server/src/modules/users/users.module.ts`

</details>

---

## 🛠️ Tecnologias Utilizadas

- **Monorepo**: `npm Workspaces`
- **Backend**: `NestJS`, `TypeORM`, `PostgreSQL`, `Swagger`
- **Frontend**: `Next.js`, `React`, `TypeScript`
- **Containerização**: `Docker`, `Docker Compose`
- **Qualidade de Código**: `ESLint`, `Prettier`, `Husky`, `SonarQube`
- **CI/CD**: `GitHub Actions`

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento local.

### 1. Pré-requisitos

Certifique-se de que você tem os seguintes softwares instalados:

- Node.js (v24.7.0+) - _Recomendamos o uso do [nvm](https://github.com/nvm-sh/nvm). Basta rodar `nvm use` na raiz do projeto para usar a versão correta._
- Docker e Docker Compose

### 2. Instalação e Configuração

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/Grupo-5-Biopark/grupo05.git](https://github.com/Grupo-5-Biopark/grupo05.git)
    cd grupo05
    ```

2.  **Configure as variáveis de ambiente:**
    Crie uma cópia do arquivo `.env.example`, renomeie para `.env` e preencha com suas credenciais.
    - **Linux / macOS:**
      ```bash
      cp .env.example .env
      ```
    - **Windows (Command Prompt):**
      ```bash
      copy .env.example .env
      ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

### 3. Executando a Aplicação

- **Para iniciar o ambiente de desenvolvimento (com hot-reload):**

  ```bash
  npm run dev
  ```

  - A API do servidor estará disponível em `http://localhost:3001`
  - A aplicação web estará disponível em `http://localhost:3000`

- **Para iniciar o ambiente de produção (apenas com Docker):**
  ```bash
  npm run start:prod
  ```

---

## 📂 Estrutura do Projeto

Este monorepo está organizado da seguinte forma:

```

/
├── apps/               \# Contém as aplicações deployáveis
│   ├── server/         \# A aplicação backend em NestJS
│   └── web/            \# A aplicação frontend em Next.js
├── packages/           \# Pacotes compartilhados entre as aplicações
│   └── shared-types/   \# Tipos e DTOs do TypeScript
├── .github/            \# Configurações de CI (GitHub Actions)
└── .husky/             \# Configurações de Git Hooks

```

---

## 📜 Scripts Disponíveis

<details>
<summary>Clique para ver todos os scripts</summary>

| Script                | Descrição                                                              |
| :-------------------- | :--------------------------------------------------------------------- |
| `npm run dev`         | Inicia o ambiente completo de desenvolvimento com Docker e hot-reload. |
| `npm run stop`        | Para e remove todos os containers do ambiente de desenvolvimento.      |
| `npm run dev:server`  | Inicia apenas o backend (`server`) e o banco de dados.                 |
| `npm run dev:web`     | Inicia apenas o frontend (`web`).                                      |
| `npm run start:prod`  | Constrói as imagens de produção e inicia o ambiente.                   |
| `npm run stop:prod`   | Para e remove todos os containers do ambiente de produção.             |
| `npm run lint`        | Executa o linter para verificar e corrigir a qualidade do código.      |
| `npm run format`      | Formata todo o código do projeto com o Prettier.                       |
| `npm run test`        | Executa todos os testes (unitários e e2e) de todas as aplicações.      |
| `npm run test:cov`    | Executa todos os testes com relatório de cobertura.                    |
| `npm run build`       | Executa o build de produção para todas as aplicações.                  |
| `npm run sonar:start` | Inicia o servidor SonarQube para análise de código (porta 9000).       |
| `npm run sonar:scan`  | Executa testes com cobertura e envia análise para o SonarQube.         |
| `npm run sonar:stop`  | Para o servidor SonarQube.                                             |

</details>

### 🔍 Análise de Código com SonarQube

O SonarQube analisa a qualidade do código, cobertura de testes e vulnerabilidades de segurança. Ele usa **Docker Compose profiles** para rodar apenas quando necessário.

**Primeiro uso:**

```bash
npm run sonar:start        # Aguarde ~90 segundos
# Acesse http://localhost:9000 (login: admin/admin)
# Gere um token em: My Account → Security → Generate Tokens
# Adicione ao .env: SONAR_TOKEN=seu_token_aqui
```

**Analisar código:**

```bash
npm run sonar:scan         # Roda testes + análise
# Veja resultados em http://localhost:9000
```

**Parar SonarQube:**

```bash
npm run sonar:stop         # Libera ~2GB de RAM
```

#### Analisar código:

```bash
npm run sonar:scan
```

- Executa todos os testes com cobertura
- Envia a análise para o SonarQube
- Visualize os resultados em http://localhost:9000

#### Parar SonarQube:

```bash
npm run sonar:stop
```

- Para o servidor e libera aproximadamente 2GB de RAM

> **⚠️ Importante:** O SonarQube NÃO inicia automaticamente com `npm run dev` e NÃO roda em produção. Ele só é executado quando você solicita explicitamente através dos comandos acima.

---

## 📚 Documentação Adicional

- **[Guia de Contribuição](CONTRIBUTING.md)**: Aprenda como contribuir com o projeto, incluindo padrões de commit e fluxo de desenvolvimento.
- **[Wiki do Projeto](https://github.com/Grupo-5-Biopark/grupo05/wiki)**: Detalhes sobre regras de negócio e arquitetura.
- **[Documentação da API (Swagger)](http://localhost:3001/api-docs)**: Disponível quando o ambiente de desenvolvimento está em execução.
