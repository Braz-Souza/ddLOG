# ddLOG - Daily Task Logger

Aplicação web para gerenciamento de tarefas diárias com visualização de progresso através de heatmap.

## Setup Inicial

```bash
# Instalar todas as dependências
npm run setup

# Criar arquivo de ambiente
cp server/.env.example server/.env
# Editar server/.env com suas configurações

# Executar em modo desenvolvimento
npm run dev
```

## Acesso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Características

- ✅ Autenticação por PIN de 6 dígitos
- ✅ Gerenciamento CRUD de tarefas
- ✅ Heatmap de progresso
- ✅ Histórico de tarefas
- ✅ Exportação CSV/PDF
- ✅ Dados encriptados
- ✅ Interface responsiva

## Tecnologias

- React + TypeScript
- Node.js + Express
- SQLite + Encryption
- Tailwind CSS
- Chart.js

Para mais detalhes, consulte `Claude.md`.