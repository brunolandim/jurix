# Especificação do Backend - Jurix

Este documento mapeia as tabelas do banco de dados baseado na análise do frontend Next.js existente.

---

## Diagrama de Relacionamentos (ERD)

```
┌─────────────────────┐
│   organizations     │  (escritórios de advocacia)
├─────────────────────┤
│ id (PK)             │
│ name                │
│ document (CNPJ)     │
│ email               │
│ phone               │
│ logo                │
│ active              │
│ created_at          │
│ updated_at          │
└─────────────────────┘
          │
          │ has many
          ▼
┌─────────────────────┐
│      lawyers        │  (usuários do sistema)
├─────────────────────┤
│ id (PK)             │
│ organization_id(FK) │───► organizations
│ name                │
│ email (UNIQUE)      │
│ password_hash       │
│ phone               │
│ photo               │
│ oab (UNIQUE)        │
│ specialty           │
│ role                │  ← 'owner' | 'admin' | 'lawyer'
│ active              │
│ created_at          │
│ updated_at          │
└─────────────────────┘
          │
          │ has many
          ├─────────────────────────────────────┐
          ▼                                     │
┌─────────────────┐       ┌─────────────────┐   │
│    columns      │       │   legal_cases   │   │
├─────────────────┤       ├─────────────────┤   │
│ id (PK)         │◄──────│ column_id (FK)  │   │
│ organization_id │───►   │ id (PK)         │   │
│ title           │       │ number          │   │
│ key             │       │ title           │   │
│ is_default      │       │ description     │   │
│ order           │       │ client          │   │
│ created_at      │       │ priority        │   │
└─────────────────┘       │ order           │   │
                          │ assigned_to(FK) │───┼──► lawyers
                          │ created_by (FK) │───┘
                          │ created_at      │
                          │ updated_at      │
                          └─────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ document_requests│   │ case_notifications│   │ shareable_links │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ id (PK)         │   │ id (PK)         │   │ id (PK)         │
│ case_id (FK)    │   │ case_id (FK)    │   │ token (UNIQUE)  │
│ name            │   │ type            │   │ case_id (FK)    │
│ description     │   │ message         │   │ is_expired      │
│ status          │   │ date            │   │ created_by (FK) │──► lawyers
│ file_url        │   │ lawyer_id (FK)  │──►│ created_at      │
│ requested_at    │   │ is_read         │   └─────────────────┘
│ uploaded_at     │   │ read_at         │           │
│ received_at     │   │ is_sent         │           │
│ rejected_at     │   │ sent_at         │           ▼
│ rejection_reason│   │ created_at      │   ┌─────────────────┐
│ rejection_note  │   └─────────────────┘   │ link_documents  │
└─────────────────┘                         ├─────────────────┤
        ▲                                   │ link_id (FK)    │
        │                                   │ document_id(FK) │
        └───────────────────────────────────└─────────────────┘
```

---

## Tabelas

### 1. `organizations` - Escritórios de Advocacia

| Coluna     | Tipo         | Constraints            | Descrição                    |
|------------|--------------|------------------------|------------------------------|
| id         | UUID         | PK                     | Identificador único          |
| name       | VARCHAR(255) | NOT NULL               | Nome do escritório           |
| document   | VARCHAR(20)  | NOT NULL, UNIQUE       | CNPJ do escritório           |
| email      | VARCHAR(255) | NULL                   | Email de contato             |
| phone      | VARCHAR(20)  | NULL                   | Telefone de contato          |
| logo       | VARCHAR(500) | NULL                   | URL do logo                  |
| active     | BOOLEAN      | NOT NULL, DEFAULT TRUE | Status ativo                 |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Data de criação              |
| updated_at | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Data de atualização          |

**Índices:**
- `idx_organizations_document` em `document`
- `idx_organizations_active` em `active`

---

### 2. `lawyers` - Advogados (Usuários do Sistema)

| Coluna          | Tipo         | Constraints                    | Descrição                    |
|-----------------|--------------|--------------------------------|------------------------------|
| id              | UUID         | PK                             | Identificador único          |
| organization_id | UUID         | FK → organizations, NOT NULL   | Escritório vinculado         |
| name            | VARCHAR(255) | NOT NULL                       | Nome completo                |
| email           | VARCHAR(255) | NOT NULL, UNIQUE               | Email de acesso              |
| password_hash   | VARCHAR(255) | NOT NULL                       | Senha criptografada          |
| phone           | VARCHAR(20)  | NULL                           | Telefone de contato          |
| photo           | VARCHAR(500) | NULL                           | URL da foto de perfil        |
| oab             | VARCHAR(20)  | NOT NULL, UNIQUE               | Número OAB                   |
| specialty       | VARCHAR(100) | NULL                           | Especialidade jurídica       |
| role            | ENUM         | NOT NULL, DEFAULT 'lawyer'     | Papel no sistema             |
| active          | BOOLEAN      | NOT NULL, DEFAULT TRUE         | Status ativo                 |
| created_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW          | Data de criação              |
| updated_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW          | Data de atualização          |

**ENUM `lawyer_role`:** `'owner', 'admin', 'lawyer'`

**Índices:**
- `idx_lawyers_organization_id` em `organization_id`
- `idx_lawyers_email` em `email`
- `idx_lawyers_oab` em `oab`
- `idx_lawyers_role` em `role`
- `idx_lawyers_active` em `active`

**Permissões por Role:**
- `owner`: Dono do escritório. Pode gerenciar organização, criar/editar/excluir advogados e admins
- `admin`: Pode criar/editar/excluir advogados, gerenciar casos e colunas do escritório
- `lawyer`: Pode gerenciar seus próprios casos, colunas e documentos

---

### 3. `columns` - Colunas do Kanban (Compartilhadas)

| Coluna          | Tipo         | Constraints                   | Descrição                    |
|-----------------|--------------|-------------------------------|------------------------------|
| id              | UUID         | PK                            | Identificador único          |
| organization_id | UUID         | FK → organizations, NOT NULL  | Organização dona das colunas |
| title           | VARCHAR(100) | NOT NULL                      | Título da coluna             |
| key             | VARCHAR(50)  | NULL                          | Chave de tradução (i18n)     |
| is_default      | BOOLEAN      | NOT NULL, DEFAULT FALSE       | Se é coluna padrão           |
| order           | INTEGER      | NOT NULL                      | Ordem de exibição            |
| created_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW         | Data de criação              |

**Índices:**
- `idx_columns_organization_id` em `organization_id`
- `idx_columns_order` em `organization_id, order`

**Regras de negócio:**
- Colunas são compartilhadas entre todos os advogados da organização
- Colunas com `is_default = true` não podem ser excluídas
- Colunas padrão são criadas automaticamente para novas organizações: "Novo", "Em Andamento", "Concluído"

---

### 4. `legal_cases` - Processos/Casos Jurídicos

| Coluna      | Tipo         | Constraints              | Descrição                    |
|-------------|--------------|-------------------------|------------------------------|
| id          | UUID         | PK                      | Identificador único          |
| column_id   | UUID         | FK → columns, NOT NULL  | Coluna atual no kanban       |
| number      | VARCHAR(50)  | NOT NULL, UNIQUE        | Número do processo           |
| title       | VARCHAR(255) | NOT NULL                | Título do caso               |
| description | TEXT         | NULL                    | Descrição detalhada          |
| client      | VARCHAR(255) | NOT NULL                | Nome do cliente              |
| priority    | ENUM         | NOT NULL, DEFAULT 'medium' | Prioridade                |
| order       | FLOAT        | NOT NULL                | Ordem na coluna (drag-drop)  |
| assigned_to | UUID         | FK → lawyers, NULL      | Advogado responsável         |
| created_by  | UUID         | FK → lawyers, NOT NULL  | Quem criou o caso            |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW   | Data de criação              |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW   | Data de atualização          |

**ENUM `priority`:** `'low', 'medium', 'high', 'urgent'`

**Índices:**
- `idx_legal_cases_column_id` em `column_id`
- `idx_legal_cases_assigned_to` em `assigned_to`
- `idx_legal_cases_number` em `number`
- `idx_legal_cases_priority` em `priority`
- `idx_legal_cases_created_by` em `created_by`

---

### 5. `document_requests` - Solicitações de Documentos

| Coluna           | Tipo         | Constraints                  | Descrição                    |
|------------------|--------------|------------------------------|------------------------------|
| id               | UUID         | PK                           | Identificador único          |
| case_id          | UUID         | FK → legal_cases, NOT NULL   | Caso relacionado             |
| name             | VARCHAR(100) | NOT NULL                     | Nome do documento            |
| description      | TEXT         | NULL                         | Descrição/instruções         |
| status           | ENUM         | NOT NULL, DEFAULT 'pending'  | Status atual                 |
| file_url         | VARCHAR(500) | NULL                         | URL do arquivo enviado       |
| requested_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW        | Data da solicitação          |
| uploaded_at      | TIMESTAMP    | NULL                         | Data do upload pelo cliente  |
| received_at      | TIMESTAMP    | NULL                         | Data de aprovação            |
| rejected_at      | TIMESTAMP    | NULL                         | Data de rejeição             |
| rejection_reason | ENUM         | NULL                         | Motivo da rejeição           |
| rejection_note   | TEXT         | NULL                         | Observações da rejeição      |

**ENUM `document_status`:** `'pending', 'pending_approval', 'rejected', 'received'`

**ENUM `rejection_reason`:** `'low_quality', 'wrong_document', 'incomplete', 'illegible', 'other'`

**Índices:**
- `idx_document_requests_case_id` em `case_id`
- `idx_document_requests_status` em `status`

**Fluxo de status:**
```
pending → pending_approval → received
                ↓
            rejected → pending_approval (re-upload)
```

---

### 6. `case_notifications` - Notificações de Casos

| Coluna     | Tipo         | Constraints                  | Descrição                    |
|------------|--------------|------------------------------|------------------------------|
| id         | UUID         | PK                           | Identificador único          |
| case_id    | UUID         | FK → legal_cases, NOT NULL   | Caso relacionado             |
| lawyer_id  | UUID         | FK → lawyers, NULL           | Advogado destinatário        |
| type       | ENUM         | NOT NULL                     | Tipo da notificação          |
| message    | TEXT         | NULL                         | Mensagem personalizada       |
| date       | TIMESTAMP    | NOT NULL                     | Data/hora do evento          |
| is_read    | BOOLEAN      | NOT NULL, DEFAULT FALSE      | Lida no sistema              |
| read_at    | TIMESTAMP    | NULL                         | Quando foi lida              |
| is_sent    | BOOLEAN      | NOT NULL, DEFAULT FALSE      | Enviada por email/SMS        |
| sent_at    | TIMESTAMP    | NULL                         | Quando foi enviada           |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW        | Data de criação              |

**ENUM `notification_type`:** `'hearing', 'deadline', 'meeting', 'task', 'other'`

**Índices:**
- `idx_case_notifications_case_id` em `case_id`
- `idx_case_notifications_lawyer_id` em `lawyer_id`
- `idx_case_notifications_date` em `date`
- `idx_case_notifications_is_read` em `lawyer_id, is_read`
- `idx_case_notifications_is_sent` em `is_sent, date`

---

### 7. `shareable_links` - Links Compartilháveis

| Coluna     | Tipo         | Constraints                  | Descrição                    |
|------------|--------------|------------------------------|------------------------------|
| id         | UUID         | PK                           | Identificador único          |
| token      | VARCHAR(64)  | NOT NULL, UNIQUE             | Token de acesso público      |
| case_id    | UUID         | FK → legal_cases, NOT NULL   | Caso relacionado             |
| is_expired | BOOLEAN      | NOT NULL, DEFAULT FALSE      | Se expirou                   |
| created_by | UUID         | FK → lawyers, NOT NULL       | Quem criou o link            |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW        | Data de criação              |

**Índices:**
- `idx_shareable_links_token` em `token`
- `idx_shareable_links_case_id` em `case_id`

**Regra de negócio:**
- O link expira automaticamente (`is_expired = true`) quando todos os documentos vinculados têm `status = 'received'`

---

### 8. `link_documents` - Documentos do Link (Tabela Associativa)

| Coluna      | Tipo | Constraints                      | Descrição                    |
|-------------|------|----------------------------------|------------------------------|
| link_id     | UUID | FK → shareable_links, NOT NULL   | Link compartilhável          |
| document_id | UUID | FK → document_requests, NOT NULL | Documento solicitado         |

**Primary Key:** `(link_id, document_id)`

**Índices:**
- `idx_link_documents_link_id` em `link_id`
- `idx_link_documents_document_id` em `document_id`

---

## Endpoints da API

### Autenticação

| Método | Endpoint                    | Descrição                    | Permissão |
|--------|-----------------------------|------------------------------|-----------|
| POST   | /api/auth/login             | Login com email/senha        | Público   |
| POST   | /api/auth/logout            | Logout                       | Auth      |
| GET    | /api/auth/me                | Advogado autenticado         | Auth      |
| POST   | /api/auth/forgot-password   | Solicitar reset de senha     | Público   |
| POST   | /api/auth/reset-password    | Resetar senha                | Público   |

### Organizações

| Método | Endpoint              | Descrição                    | Permissão |
|--------|-----------------------|------------------------------|-----------|
| GET    | /api/organization     | Obter minha organização      | Auth      |
| PUT    | /api/organization     | Atualizar organização        | Owner     |
| POST   | /api/organization/logo| Upload do logo               | Owner     |

### Advogados

| Método | Endpoint              | Descrição                    | Permissão   |
|--------|-----------------------|------------------------------|-------------|
| GET    | /api/lawyers          | Listar advogados ativos      | Auth        |
| GET    | /api/lawyers/all      | Listar todos os advogados    | Admin/Owner |
| GET    | /api/lawyers/:id      | Buscar advogado por ID       | Auth        |
| POST   | /api/lawyers          | Criar advogado               | Admin/Owner |
| PUT    | /api/lawyers/:id      | Atualizar advogado           | Admin/Owner |
| DELETE | /api/lawyers/:id      | Excluir advogado             | Admin/Owner |

### Kanban (Colunas)

| Método | Endpoint              | Descrição                    | Permissão   |
|--------|-----------------------|------------------------------|-------------|
| GET    | /api/columns          | Listar colunas com casos     | Auth        |
| POST   | /api/columns          | Criar coluna                 | Admin/Owner |
| PUT    | /api/columns/:id      | Atualizar coluna             | Admin/Owner |
| DELETE | /api/columns/:id      | Excluir coluna vazia         | Admin/Owner |

### Casos Jurídicos (Colaborativo)

| Método | Endpoint                    | Descrição                    | Permissão |
|--------|-----------------------------|------------------------------|-----------|
| GET    | /api/cases                  | Listar casos                 | Auth      |
| GET    | /api/cases/:id              | Buscar caso por ID           | Auth      |
| POST   | /api/cases                  | Criar caso                   | Auth      |
| PUT    | /api/cases/:id              | Atualizar caso               | Auth      |
| PATCH  | /api/cases/:id/move         | Mover caso entre colunas     | Auth      |
| PATCH  | /api/cases/:id/assign       | Atribuir advogado ao caso    | Auth      |
| DELETE | /api/cases/:id              | Excluir caso                 | Auth      |

### Documentos

| Método | Endpoint                                    | Descrição                    | Permissão |
|--------|---------------------------------------------|------------------------------|-----------|
| GET    | /api/cases/:caseId/documents                | Listar documentos do caso    | Auth      |
| POST   | /api/cases/:caseId/documents                | Solicitar documento          | Auth      |
| PUT    | /api/cases/:caseId/documents/:id            | Atualizar documento          | Auth      |
| DELETE | /api/cases/:caseId/documents/:id            | Excluir documento            | Auth      |
| POST   | /api/cases/:caseId/documents/:id/approve    | Aprovar documento            | Auth      |
| POST   | /api/cases/:caseId/documents/:id/reject     | Rejeitar documento           | Auth      |

### Notificações

| Método | Endpoint                          | Descrição                    | Permissão |
|--------|-----------------------------------|------------------------------|-----------|
| GET    | /api/notifications                | Listar minhas notificações   | Auth      |
| POST   | /api/cases/:caseId/notifications  | Criar notificação            | Auth      |
| PUT    | /api/notifications/:id/read       | Marcar como lida             | Auth      |
| PUT    | /api/notifications/read-all       | Marcar todas como lidas      | Auth      |
| DELETE | /api/notifications/:id            | Excluir notificação          | Auth      |

### Links Compartilháveis

| Método | Endpoint                             | Descrição                    | Permissão |
|--------|--------------------------------------|------------------------------|-----------|
| POST   | /api/share-link                      | Criar link compartilhável    | Auth      |
| GET    | /api/share-link/:token               | Obter dados do link          | Público   |
| POST   | /api/share-link/:token/upload/:docId | Upload de documento          | Público   |

---

## Migrations SQL (PostgreSQL)

```sql
-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMs
CREATE TYPE lawyer_role AS ENUM ('owner', 'admin', 'lawyer');
CREATE TYPE priority_type AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE document_status AS ENUM ('pending', 'pending_approval', 'rejected', 'received');
CREATE TYPE rejection_reason AS ENUM ('low_quality', 'wrong_document', 'incomplete', 'illegible', 'other');
CREATE TYPE notification_type AS ENUM ('hearing', 'deadline', 'meeting', 'task', 'other');

-- Tabela: organizations (escritórios de advocacia)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    logo VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_document ON organizations(document);
CREATE INDEX idx_organizations_active ON organizations(active);

-- Tabela: lawyers (usuários do sistema)
CREATE TABLE lawyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    photo VARCHAR(500),
    oab VARCHAR(20) NOT NULL UNIQUE,
    specialty VARCHAR(100),
    role lawyer_role NOT NULL DEFAULT 'lawyer',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lawyers_organization_id ON lawyers(organization_id);
CREATE INDEX idx_lawyers_email ON lawyers(email);
CREATE INDEX idx_lawyers_oab ON lawyers(oab);
CREATE INDEX idx_lawyers_role ON lawyers(role);
CREATE INDEX idx_lawyers_active ON lawyers(active);

-- Tabela: columns (compartilhadas por organização)
CREATE TABLE columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    key VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_columns_organization_id ON columns(organization_id);
CREATE INDEX idx_columns_order ON columns(organization_id, "order");

-- Tabela: legal_cases
CREATE TABLE legal_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    column_id UUID NOT NULL REFERENCES columns(id) ON DELETE RESTRICT,
    number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client VARCHAR(255) NOT NULL,
    priority priority_type NOT NULL DEFAULT 'medium',
    "order" FLOAT NOT NULL,
    assigned_to UUID REFERENCES lawyers(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES lawyers(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_legal_cases_column_id ON legal_cases(column_id);
CREATE INDEX idx_legal_cases_assigned_to ON legal_cases(assigned_to);
CREATE INDEX idx_legal_cases_number ON legal_cases(number);
CREATE INDEX idx_legal_cases_priority ON legal_cases(priority);
CREATE INDEX idx_legal_cases_created_by ON legal_cases(created_by);

-- Tabela: document_requests
CREATE TABLE document_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status document_status NOT NULL DEFAULT 'pending',
    file_url VARCHAR(500),
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    uploaded_at TIMESTAMP,
    received_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason rejection_reason,
    rejection_note TEXT
);

CREATE INDEX idx_document_requests_case_id ON document_requests(case_id);
CREATE INDEX idx_document_requests_status ON document_requests(status);

-- Tabela: case_notifications
CREATE TABLE case_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES lawyers(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    message TEXT,
    date TIMESTAMP NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_case_notifications_case_id ON case_notifications(case_id);
CREATE INDEX idx_case_notifications_lawyer_id ON case_notifications(lawyer_id);
CREATE INDEX idx_case_notifications_date ON case_notifications(date);
CREATE INDEX idx_case_notifications_is_read ON case_notifications(lawyer_id, is_read);
CREATE INDEX idx_case_notifications_is_sent ON case_notifications(is_sent, date);

-- Tabela: shareable_links
CREATE TABLE shareable_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(64) NOT NULL UNIQUE,
    case_id UUID NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
    is_expired BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES lawyers(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shareable_links_token ON shareable_links(token);
CREATE INDEX idx_shareable_links_case_id ON shareable_links(case_id);

-- Tabela: link_documents (associativa)
CREATE TABLE link_documents (
    link_id UUID NOT NULL REFERENCES shareable_links(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
    PRIMARY KEY (link_id, document_id)
);

CREATE INDEX idx_link_documents_link_id ON link_documents(link_id);
CREATE INDEX idx_link_documents_document_id ON link_documents(document_id);

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lawyers_updated_at
    BEFORE UPDATE ON lawyers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_cases_updated_at
    BEFORE UPDATE ON legal_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: updated_at para organizations
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed: Criar organização e advogado owner inicial
INSERT INTO organizations (id, name, document, email)
VALUES (
    uuid_generate_v4(),
    'Escritório Exemplo',
    '00.000.000/0001-00',
    'contato@exemplo.com.br'
);

INSERT INTO lawyers (organization_id, name, email, password_hash, oab, role)
VALUES (
    (SELECT id FROM organizations LIMIT 1),
    'Administrador',
    'admin@jurix.com',
    '$2b$10$...', -- Substituir pelo hash real da senha
    'ADM000000',
    'owner'
);
```

---

## Stack Sugerida para Backend

### Opção 1: Node.js (compatível com frontend)
- **Framework:** NestJS ou Fastify
- **ORM:** Prisma ou TypeORM
- **Auth:** JWT + Passport
- **Validação:** class-validator / zod
- **DB:** PostgreSQL

### Opção 2: Python
- **Framework:** FastAPI
- **ORM:** SQLAlchemy + Alembic
- **Auth:** python-jose (JWT)
- **Validação:** Pydantic
- **DB:** PostgreSQL

### Opção 3: Go
- **Framework:** Fiber ou Gin
- **ORM:** GORM ou sqlc
- **Auth:** golang-jwt
- **DB:** PostgreSQL

---

## Considerações de Implementação

1. **Multi-tenancy por Organização:** Todas as queries devem filtrar por `organization_id` do advogado logado. Advogados só veem dados da sua organização.

2. **Controle de Acesso por Role:**
   - `owner`: Gerencia organização, cria/edita/exclui advogados
   - `admin`: Cria/edita/exclui advogados (exceto owner), gerencia colunas
   - `lawyer`: Acesso básico ao sistema

3. **Kanban Colaborativo (estilo Trello):** Todos os advogados da organização podem:
   - Ver todos os casos
   - Criar novos casos
   - Mover casos entre colunas
   - Se atribuir a qualquer caso (ou atribuir outro advogado)
   - Gerenciar documentos e notificações de qualquer caso

4. **Ordenação Kanban:** Usar `FLOAT` para `order` permite inserções eficientes entre posições

5. **Upload de Arquivos:** Considerar S3/Cloudflare R2 para armazenamento (logo da org, foto do advogado, documentos)

6. **Jobs Assíncronos:** Implementar worker para envio de notificações (email/SMS)

7. **Expiração de Links:** Trigger/job que verifica se todos documentos do link foram recebidos

8. **Auditoria:** Considerar tabela de `audit_logs` para rastrear alterações em casos

9. **Colunas Padrão:** Ao criar nova organização, trigger ou service deve criar as 3 colunas padrão (compartilhadas entre todos advogados)

10. **Onboarding:** Fluxo de criação de conta deve criar organização + colunas padrão + advogado owner juntos
