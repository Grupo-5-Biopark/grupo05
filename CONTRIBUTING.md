# How to Contribute

Obrigado por contribuir com o projeto Controle de Salas Biopark! Este guia irá ajudá-lo a entender o processo de contribuição.

---

## 📋 Índice

- [Processo de Contribuição](#-processo-de-contribuição)
- [Criando um Novo Módulo](#-criando-um-novo-módulo)
- [Padrões de Commit](#-padrões-de-commit)
- [Code Review](#-code-review)

---

## 🔄 Processo de Contribuição

1. **Fork o repositório** e clone localmente
2. **Crie uma branch** a partir de `development`:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/nome-da-funcionalidade
   ```
3. **Faça suas alterações** seguindo os padrões do projeto
4. **Execute os testes** e o linter:
   ```bash
   npm run lint
   npm run test
   ```
5. **Faça commits** seguindo o padrão Conventional Commits
6. **Envie sua branch** para o repositório:
   ```bash
   git push origin feature/nome-da-funcionalidade
   ```
7. **Abra um Pull Request** para a branch `development`

---

## 🏗️ Criando um Novo Módulo

Todas as novas funcionalidades de negócio devem ser criadas como módulos independentes dentro do diretório `/apps/server/src/modules`. Cada novo módulo deve seguir nossa estrutura de Clean Architecture:

* **/domain**: Contém a lógica de negócio principal, agregados e interfaces de repositório.
* **/application**: Contém os controllers e casos de uso que orquestram a lógica de domínio.
* **/infrastructure**: Contém as implementações concretas, como repositórios TypeORM.

### Usando o Gerador de Features

Para facilitar a criação de novos módulos, utilize nosso gerador automático:

```bash
npm run g:feature -- nome-do-modulo
```

Este comando criará toda a estrutura necessária seguindo os padrões do projeto.

---

## 📝 Padrões de Commit

Este projeto utiliza **Conventional Commits** para manter um histórico padronizado e legível.

### Como Fazer um Commit

**Método Recomendado** - Usando Commitizen (interativo):

```bash
git add .
npm run commit
```

O Commitizen irá guiá-lo através de um processo interativo para criar um commit válido.

**Método Manual** - Seguindo o formato:

```bash
git commit -m "tipo(escopo): descrição"
```

### Estrutura do Commit

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos de Commit Disponíveis

| Tipo | Quando Usar | Exemplo |
|------|-------------|---------|
| `feat` | Nova funcionalidade | `feat: adicionar endpoint de autenticação` |
| `fix` | Correção de bug | `fix: corrigir validação de email` |
| `docs` | Apenas documentação | `docs: atualizar README` |
| `style` | Formatação de código | `style: aplicar prettier` |
| `refactor` | Refatoração de código | `refactor: reorganizar estrutura de pastas` |
| `perf` | Melhoria de performance | `perf: otimizar query do banco` |
| `test` | Adição/correção de testes | `test: adicionar testes para UserService` |
| `build` | Mudanças em dependências | `build: atualizar typescript para v5.9` |
| `ci` | Mudanças no CI/CD | `ci: adicionar workflow de deploy` |
| `chore` | Tarefas de manutenção | `chore: configurar husky` |

### ✅ Exemplos Corretos

```bash
feat: adicionar módulo de cálculo de salas
fix(auth): corrigir validação de token JWT
docs: atualizar guia de contribuição
test(courses): adicionar testes e2e
refactor(users): simplificar lógica de autenticação
```

### ❌ Exemplos Incorretos

```bash
Feat: adicionar login          # ❌ Tipo em maiúsculo
fix: corrigido                 # ❌ Descrição muito vaga
adicionar nova funcionalidade  # ❌ Sem tipo
feat: Adicionar autenticação   # ❌ Descrição começa com maiúscula
fix: corrigir bug.             # ❌ Ponto final na descrição
```

### Breaking Changes

Para mudanças que quebram compatibilidade, use `!` após o tipo:

```bash
feat!: migrar autenticação para OAuth2

BREAKING CHANGE: A autenticação básica foi removida.
Todos os usuários devem migrar para OAuth2.
```

### Validações Automáticas

O projeto possui hooks automáticos configurados com Husky:

- **Pre-commit**: Executa ESLint e Prettier automaticamente
- **Commit-msg**: Valida se a mensagem segue o padrão Conventional Commits

Se seu commit for rejeitado, corrija a mensagem de acordo com o erro exibido.

---

## 🔍 Code Review

### Checklist para Pull Requests

Antes de abrir um PR, certifique-se de que:

- [ ] O código segue os padrões do projeto (Clean Architecture, DDD)
- [ ] Todos os testes estão passando (`npm run test`)
- [ ] O código está formatado corretamente (`npm run lint`)
- [ ] Os commits seguem o padrão Conventional Commits
- [ ] A documentação foi atualizada (se necessário)
- [ ] Não há conflitos com a branch `development`

### O que Esperamos no Code Review

- **Clareza**: O código deve ser fácil de entender
- **Testes**: Novas funcionalidades devem ter testes
- **Documentação**: Mudanças significativas devem ser documentadas
- **Consistência**: Siga os padrões existentes no projeto

---

## 🤝 Precisa de Ajuda?

- Consulte a [Wiki do Projeto](https://github.com/Grupo-5-Biopark/grupo05/wiki)
- Verifique issues abertas no GitHub
- Entre em contato com os mantenedores do projeto

**Obrigado por contribuir! 🎉**
