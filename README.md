# 🚀 TaskFlow | Full-Stack Project

Uma aplicação web **Full-Stack** moderna desenvolvida para o gerenciamento eficiente de projetos e tarefas em múltiplos workspaces, contando com um painel de controle interativo e sincronização de dados em tempo real.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias e ferramentas:

### **Backend (Servidor & API)**
- **Node.js** com **Express** e **TypeScript** (`tsx`)
- **Prisma ORM** (para modelagem e manipulação segura da base de dados)
- **CORS** e variáveis de ambiente gerenciadas via `dotenv`

### **Frontend (Cliente)**
- **Next.js** (App Router & Turbopack)
- **React** com **Tailwind CSS** (para estilização responsiva e moderna)

### **Banco de Dados & Ferramentas**
- **Banco de Dados Relacional:** PostgreSQL (hospedado na nuvem via **Neon**)
- **Gerenciamento de Dependências:** npm
- **Cliente REST / Testes:** Postman

---

## ⚙️ Pré-requisitos

Antes de começares, certifica-te de que tens instalado na tua máquina:
- **Node.js** (versão 18 ou superior recomendada)
- **npm** (ou yarn/pnpm)
- Uma conta ativa e uma base de dados configurada no **Neon** (PostgreSQL)

---

## 📦 Como Clonar e Executar o Projeto

Segue os passos abaixo para colocar o projeto a correr localmente na tua máquina:

### 1. Clonar o repositório
\`\`\`bash
git clone https://github.com/keison13/taskflow.git
cd taskflow
\`\`\`

### 2. Configurar o Backend (\`server\`)
Acede à pasta do servidor, instala as dependências e configura as variáveis de ambiente:
\`\`\`bash
cd server
npm install
\`\`\`

Cria um ficheiro \`.env\` na raiz da pasta \`server\` com a seguinte estrutura:
\`\`\`env
DATABASE_URL="postgresql://<utilizador>:<password>@<host_neon>/neondb?sslmode=require"
PORT=6543
JWT_SECRET="o_teu_segredo_jwt_aqui"
CLIENT_URL="http://localhost:3000"
\`\`\`

Executa as migrações do Prisma e inicia o servidor:
\`\`\`bash
npx prisma migrate dev
npm run dev
\`\`\`
*(A API do backend iniciará na porta \`6543\`).*

### 3. Configurar o Frontend (\`client\`)
Num novo terminal, abre a pasta do cliente, instala as dependências e configura o ambiente:
\`\`\`bash
cd client
npm install
\`\`\`

Cria um ficheiro chamado \`.env.local\` na raiz da pasta \`client\` definindo a URL da API:
\`\`\`env
NEXT_PUBLIC_API_URL="http://localhost:6543"
\`\`\`

Inicia a aplicação frontend:
\`\`\`bash
npm run dev
\`\`\`
*(O painel web iniciará na porta padrão \`3000\` em \`http://localhost:3000\`).*

---

## 🔌 Endpoints da API (Backend)

Podes utilizar o Postman ou ferramentas similares para testar os principais endpoints da API (lembra-te de incluir o prefixo \`/api\`):

- **Listar ou Criar Projetos:**
  - \`GET /api/projects\`
  - \`POST /api/projects\` *(Body JSON: \`{ "name": "Nome", "description": "Descrição" }\`)*
- **Buscar Projeto por ID:**
  - \`GET /api/projects/{id}\`
- **Listar ou Criar Tarefas de um Projeto:**
  - \`GET /api/projects/{projectId}/tasks\`
  - \`POST /api/projects/{projectId}/tasks\`
- **Atualizar Status de Conclusão da Tarefa:**
  - \`PATCH /api/tasks/{id}\`
- **Eliminar Tarefa:**
  - \`DELETE /api/tasks/{id}\`

---

## 🛠️ Contribuição

1. Faz um *Fork* do projeto.
2. Cria uma nova *Branch* para a tua funcionalidade (\`git checkout -b feature/nova-funcionalidade\`).
3. Faz o *Commit* das tuas alterações (\`git commit -m 'feat: Adiciona nova funcionalidade'\`).
4. Faz o *Push* para a Branch (\`git push origin feature/nova-funcionalidade\`).
5. Abre um *Pull Request*.

---

## 👤 Autor

Desenvolvido por **Keison Raniery** 🚀
