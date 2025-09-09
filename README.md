# ddLOG - Daily Task Logger

Aplicação web monolítica para gerenciamento de tarefas diárias com visualização de progresso através de heatmap.

## Setup Inicial

```bash
# Instalar todas as dependências
npm install

# Criar arquivo de ambiente (opcional)
cp .env.example .env
# Editar .env com suas configurações se necessário

# Executar em modo desenvolvimento (recomendado)
npm run dev
```

## Comandos Disponíveis

```bash
# Desenvolvimento com auto-reload
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start

# Verificação de tipos TypeScript
npm run type-check

# Linting do código
npm run lint
```

## Acesso

- **Aplicação Completa**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **API Endpoints**: http://localhost:3000/api/*

## Características

- ✅ Autenticação por PIN de 6 dígitos
- ✅ Gerenciamento CRUD de tarefas
- ✅ Heatmap de progresso
- ✅ Histórico de tarefas
- ✅ Exportação CSV/PDF
- ✅ Dados encriptados
- ✅ Interface responsiva

## Arquitetura

Este projeto foi convertido de uma arquitetura cliente/servidor separada para uma **aplicação monolítica** que serve tanto o frontend React quanto a API Express a partir de um único servidor.

### Estrutura do Projeto

```
src/
├── components/          # Componentes React
├── pages/              # Páginas React
├── hooks/              # React Hooks customizados
├── services/           # Serviços de API do cliente
├── server/             # Código do servidor Express
│   ├── database/       # Conexão e schema do banco
│   ├── routes/         # Rotas da API
│   ├── services/       # Serviços do servidor
│   └── middleware/     # Middlewares Express
├── types.ts            # Tipos TypeScript compartilhados
├── main.tsx            # Ponto de entrada React
└── server.ts           # Ponto de entrada do servidor
```

## Tecnologias

### Frontend
- React + TypeScript
- Tailwind CSS
- Chart.js
- React Hook Form
- React Router DOM
- Vite (build tool)

### Backend
- Node.js + Express
- SQLite + better-sqlite3
- JWT para autenticação
- Criptografia para dados
- TypeScript

### Desenvolvimento
- TSX para desenvolvimento com hot-reload
- ESLint para linting
- Vite para build do frontend

## Banco de Dados

O banco SQLite é criado automaticamente com as tabelas necessárias. Os arquivos são salvos em:
- **Desenvolvimento**: `src/data/ddlog.db`
- **Produção**: `dist/data/ddlog.db`

Para mais detalhes técnicos, consulte `Claude.md`.