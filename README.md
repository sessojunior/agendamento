# Agendamento

Sistema de agendamento para aprendizado de Next.js.

## Estrutura de diretórios (`src/app`)

```
src/app
├── page.tsx              # Landing page pública
├── business/             # Empresa
│   └── [slug]/           # Empresa específica no slug
│       ├── auth/         # Autenticação da empresa
│       ├── panel/        # Área protegida do dono da empresa
│       ├── appointments/ # Agendamentos dos clientes da empresa
│       ├── users/        # Lista de clientes da empresa
│       └── page.tsx      # Página da empresa
├── customer/             # Cliente final
│   ├── auth/             # Autenticação do cliente
│   ├── panel/            # Área protegida do cliente
│   └── appointments/     # Agendamentos realizados por este cliente
├── saas/                 # Proprietário do sistema SaaS
│   ├── auth/             # Autenticação do proprietário SaaS
│   ├── stores/           # Gerenciamento de todas as empresas cadastradas
│   └── users/            # Gerenciamento de todos os usuários cadastrados
```

### Navegação

```
- `/`                     → Página de entrada/landing page pública.
- `business/`             → Ambiente exclusivo de cada empresa.
- `user/`                 → Área do cliente final (usuário comum).
- `saas/`                 → Painel administrativo do dono do sistema SaaS (super admin).
```

### Simular backend

Estou usando o JSON Server para acelerar o desenvolvimento e testes no frontend com dados reais e persistentes em JSON.

O arquivo `db.json` irá conter a estrutura. Criei um alias no `package.json` para facilitar a execução do comando abaixo que irá fornecer uma API:

```
json-server --watch db.json --port 4000
```

É só executar `npm run json-server` ao invés do comando acima. A API rodará em `http://localhost:4000`.

### Estrutura (`db.json`)

```
Recurso:                        Descrição:
saas                            → Informações do sistema
admin                           → Admins do sistema SaaS
customer                        → Usuários finais (clientes de empresas)
business                        → Empresas/barbearias
manager                         → Donos ou gestores da empresa
business_customer               → Relação empresa-cliente (vínculo entre empresa e cliente)
service                         → Serviços oferecidos por cada empresa, com ordenação
employee                        → Funcionários por empresa, serviços prestados, horários de trabalho e períodos bloqueados
appointment                     → Agendamentos com todas as informações relevantes, incluindo status e serviços solicitados
```

### Fluxo de agendamento

1. Usuário acessa uma empresa e vê os dados da empresa
2. Seleciona um serviço dessa empresa, que esteja ativo
3. Seleciona uma data. Depois seleciona um horário disponível. Deve levar em consideração para cada um dos profissionais desta empresa que realizam esse serviço:

- O tempo de funcionamento do profissional (work_time)
- A duração do serviço selecionado (duration)
- Os horário bloqueados (blocked_times). Exemplo: reuniões.
- As datas indisponíveis, onde não há nenhum horário (unavailable_dates). Exemplo: férias, folgas.
- Os agendamentos (appointments) já existentes, já agendados com o profissional e que não estão com o status de cancelado
- Se ao menos um profissional puder atender no horário, o horário fica disponível

4. Seleciona um profissional que esteja disponível e atenda os requisitos anteriores
5. Finaliza o agendamento
