# BIOPARK - Sistema de Controle de Salas

Sistema de gerenciamento de crescimento da faculdade para estruturação e organização de salas baseado no número de alunos.

## 🎯 Propósito Principal

Gerar relatórios de tamanho/quantidade de salas baseado em turmas e quantidade de alunos, proporcionando uma previsão de estrutura para a universidade.

## 🏗️ Estrutura Inicial do Projeto

```
apps/web/
├── src/
│   ├── app/
│   │   ├── globals.css      # Estilos globais e variáveis CSS
│   │   ├── layout.tsx       # Layout principal da aplicação
│   │   └── page.tsx         # Página inicial
├── package.json             # Dependências e scripts
├── next.config.js           # Configuração do Next.js
├── tsconfig.json            # Configuração do TypeScript
└── README.md                # Documentação
```

## 🛠️ Tecnologias Base

- **Next.js 14** - Framework React para produção
- **TypeScript** - Linguagem com tipagem estática
- **CSS Variables** - Sistema de cores e design tokens

## 🎨 Design System

### Cores Principais

- **Azul Escuro:** `#233444` (Primary Dark)
- **Vermelho:** `#EB0644` (Primary Red)
- **Branco:** `#FBFBFB` (Primary Light)
- **Azul Secundário:** `#1a2935` (Secondary Dark)
- **Vermelho Claro:** `#ff4d7a` (Accent Red)

### Tipografia

- **Fonte Principal:** Segoe UI, Tahoma, Geneva, Verdana, sans-serif

## � Como Executar

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Executar em modo de desenvolvimento:**

   ```bash
   npm run dev
   ```

3. **Acessar o sistema:**
   - Abrir http://localhost:3000

## 📋 Próximos Passos

Esta é a estrutura inicial do projeto. As seguintes funcionalidades serão desenvolvidas:

### Funcionalidades Planejadas

- [ ] Sistema de autenticação
- [ ] Dashboard com estatísticas
- [ ] Gerenciamento de cursos e turmas
- [ ] Controle de salas por tamanho
- [ ] Cálculos de evasão e previsões
- [ ] Relatórios e exportação

### Critérios de Sucesso

- [ ] Lançamento no prazo (Banca Final)
- [ ] Aprovação da Kelli e agregados (Adesão)
- [ ] Avaliação positiva da Kelli (Satisfação)
- [ ] Entrega da funcionalidade principal: controle de quantidade de salas por tamanho

## � Público-Alvo

### Primários

- Kelli e ajudante

### Secundários

- Diretores
- Coordenadores
- Funcionários das Faculdades Donaduzzi e Luiz Donadozzi

## 📄 Licença

Este projeto é propriedade da BIOPARK e destina-se exclusivamente ao uso interno da instituição.
