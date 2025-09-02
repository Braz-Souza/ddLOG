# ddLOG - Daily Task Logger

## Visão Geral
Aplicação web para gerenciamento de tarefas diárias com foco em produtividade e visualização de progresso através de heatmap, similar ao GitHub contributions.

## Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Chart.js** para visualizações (heatmap)
- **React Hook Form** para formulários
- **Axios** para comunicação HTTP

### Backend
- **Node.js** com Express e TypeScript
- **Better SQLite3** para banco de dados local
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Helmet** e **CORS** para segurança

## Estrutura do Projeto

```
ddLOG/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilitários
│   │   └── contexts/      # Context providers
│   └── public/            # Arquivos estáticos
├── server/                # Backend Express
│   ├── src/
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Lógica de negócio
│   │   ├── middleware/    # Middlewares
│   │   └── database/      # Configuração do banco
├── shared/                # Tipos compartilhados
└── package.json           # Configuração do workspace
```

## User Stories Implementadas

### US1 - Adicionar Tarefas
- **Componente**: TaskForm
- **Rota**: POST /api/tasks
- **Campos**: nome, descrição

### US2 - Marcar Conclusão
- **Componente**: TaskItem (checkbox)
- **Rota**: PATCH /api/tasks/:id
- **Estado**: completed (boolean)

### US3-US4 - Detalhes e Edição
- **Componente**: TaskDetail (modal)
- **Rotas**: 
  - GET /api/tasks/:id
  - PUT /api/tasks/:id
  - DELETE /api/tasks/:id

### US5 - Review Heatmap
- **Componente**: HeatmapChart
- **Rota**: GET /api/tasks/heatmap
- **Visualização**: Calendar-style heatmap

### US6 - Contador de Tarefas Pendentes
- **Componente**: TaskCounter
- **Cálculo**: tasks.filter(t => !t.completed).length

### US7 - Histórico de Tarefas
- **Componente**: TaskHistory
- **Rota**: GET /api/tasks?date=YYYY-MM-DD
- **Agrupamento**: Por data

### US8 - Exportação
- **Componente**: ExportButton
- **Rotas**: 
  - GET /api/export/csv
  - GET /api/export/pdf
- **Formatos**: CSV, PDF

### US10 - Autenticação PIN
- **Componente**: PinLogin, PinSetup
- **Rotas**: 
  - POST /api/auth/setup
  - POST /api/auth/login
- **Segurança**: JWT + Hash bcrypt

### US11 - Persistência Encriptada
- **Implementação**: SQLite com melhor-sqlite3
- **Segurança**: Dados sensíveis hasheados

## Como Executar

### Setup Inicial
```bash
npm run setup
```

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

## Comandos Úteis

### Cliente
- `npm run dev:client` - Servidor de desenvolvimento
- `npm run build:client` - Build para produção
- `npm run lint` - Linting do código
- `npm run type-check` - Verificação de tipos

### Servidor
- `npm run dev:server` - Servidor com hot reload
- `npm run build:server` - Compilar TypeScript
- `npm run start` - Executar versão compilada

## Configuração Ambiental

### Server (.env)
```env
PORT=3001
DATABASE_PATH=./data/ddlog.db
DATABASE_ENCRYPTION_KEY=your-32-character-key
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

## Próximos Passos para Implementação

### 1. Componentes Essenciais
- [ ] PinSetup/PinLogin (US10)
- [ ] TaskForm (US1)
- [ ] TaskList com TaskItem (US2)
- [ ] TaskDetail modal (US3-US4)

### 2. Páginas Principais
- [ ] LoginPage
- [ ] HomePage (dashboard principal)
- [ ] HeatmapPage (US5)
- [ ] HistoryPage (US7)

### 3. APIs Pendentes
- [ ] Routes de autenticação
- [ ] CRUD completo de tasks
- [ ] Endpoint de heatmap
- [ ] Endpoints de exportação

### 4. Funcionalidades Avançadas
- [ ] Heatmap interativo
- [ ] Filtros por data
- [ ] Exportação CSV/PDF
- [ ] Responsividade mobile

## Padrões de Código

### Naming Conventions
- **Componentes**: PascalCase (TaskForm.tsx)
- **Hooks**: camelCase com 'use' (useAuth.ts)
- **Services**: PascalCase classes (AuthService.ts)
- **Types**: PascalCase interfaces (Task, User)

### Estrutura de Componentes
```typescript
interface Props {
  // Props tipadas
}

export const Component: React.FC<Props> = ({ prop }) => {
  // Logic
  
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};
```

### API Response Pattern
```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

## Segurança Implementada

1. **JWT Authentication** com expiração
2. **PIN Hashing** com bcrypt (12 rounds)
3. **CORS** configurado
4. **Helmet** para headers seguros
5. **Input Validation** com Zod
6. **SQL Injection** prevenção com prepared statements

## Performance

1. **Database Indexes** para queries otimizadas
2. **WAL Mode** para melhor concorrência
3. **React.memo** para componentes otimizados
4. **Code Splitting** com lazy loading
5. **Caching** de dados frequentes