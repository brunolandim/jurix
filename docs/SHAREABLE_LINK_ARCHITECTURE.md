# Arquitetura: Links Compartilháveis para Upload de Documentos

> Documento criado em: 29/01/2026
> Status: Implementação atual precisa ser refatorada

---

## Resumo do Problema

A implementação atual **copia** os dados do processo e documentos para dentro do link compartilhável. Isso está incorreto porque:

1. Os dados ficam duplicados e podem ficar desatualizados
2. Quando o cliente faz upload, apenas atualiza o status no link, **não atualiza os documentos reais do processo**
3. O advogado não vê os documentos como "recebidos" no kanban

---

## Arquitetura Correta

### Modelo de Dados

```
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│   ShareableLink     │       │     LegalCase       │       │   DocumentRequest   │
├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
│ id visível          │       │ id                  │       │ id                  │
│ token (único)       │  JOIN │ number              │  JOIN │ name                │
│ caseId ─────────────┼──────►│ title               │◄──────┼─ caseId             │
│ documentIds[]       │       │ description         │       │ status (pending/    │
│ isExpired           │       │ client              │       │         received)   │
│ createdAt           │       │ lawyer {id, name}   │       │ receivedAt          │
│ createdBy {id,name} │       │ ...                 │       │ fileUrl (novo)      │
└─────────────────────┘       └─────────────────────┘       └─────────────────────┘
```

### ShareableLink (tabela/collection)

```typescript
type ShareableLink = {
  id: string;
  token: string;           // Token único para a URL pública
  caseId: string;          // FK para LegalCase (permite JOIN)
  documentIds: string[];   // Array de IDs dos documentos solicitados
  isExpired: boolean;      // true quando todos documentIds estão com status 'received'
  createdAt: string;
  createdBy: { id: string; name: string };
};
```

**Importante:** O link NÃO armazena dados do processo (title, number, etc). Esses dados são obtidos via JOIN.

---

## Fluxo de Funcionamento

### 1. Advogado Gera o Link

```
Advogado clica "Compartilhar com Cliente"
    │
    ▼
Sistema identifica documentos pendentes do caso
    │
    ▼
Cria registro em ShareableLink:
  - token: gerado aleatoriamente
  - caseId: ID do processo
  - documentIds: [doc1, doc2, doc3] (apenas os pendentes)
  - isExpired: false
    │
    ▼
Retorna URL: /case/{token}
```

### 2. Cliente Acessa o Link

```
Cliente acessa /case/{token}
    │
    ▼
API busca ShareableLink pelo token
    │
    ▼
Se não encontrado ou isExpired=true → Erro "Link inválido/expirado"
    │
    ▼
Faz JOIN com LegalCase (via caseId) para obter:
  - caseNumber, caseTitle, caseDescription, lawyerName
    │
    ▼
Faz JOIN com DocumentRequest (via documentIds) para obter:
  - Lista de documentos com nome, descrição e status atual
    │
    ▼
Retorna dados para a página pública
```

### 3. Cliente Faz Upload

```
Cliente seleciona arquivo e clica "Enviar"
    │
    ▼
API recebe: token + documentId + arquivo
    │
    ▼
Valida:
  - Link existe e não está expirado
  - documentId pertence ao link (está em documentIds[])
    │
    ▼
Salva arquivo (storage) e obtém URL
    │
    ▼
ATUALIZA DocumentRequest REAL:
  - status: 'received'
  - receivedAt: new Date()
  - fileUrl: URL do arquivo (opcional)
    │
    ▼
Verifica se TODOS os documentIds do link estão com status 'received':
  - Se sim: atualiza ShareableLink.isExpired = true
    │
    ▼
Retorna { success: true, allCompleted: boolean }
```

---

## O Que Precisa Ser Refatorado

### Arquivos a Modificar

#### 1. `src/types/index.ts`
- Simplificar `ShareableLink` (remover campos duplicados)
- Adicionar `fileUrl?: string` em `DocumentRequest`

```typescript
// ANTES (atual - incorreto)
export type ShareableLink = {
  id: string;
  token: string;
  caseId: string;
  caseNumber: string;      // ❌ Duplicado
  caseTitle: string;       // ❌ Duplicado
  caseDescription?: string; // ❌ Duplicado
  lawyerName?: string;     // ❌ Duplicado
  documentIds: string[];
  isExpired: boolean;
  createdAt: string;
  createdBy: { id: string; name: string };
};

// DEPOIS (correto)
export type ShareableLink = {
  id: string;
  token: string;
  caseId: string;          // ✅ Apenas referência
  documentIds: string[];   // ✅ Apenas IDs
  isExpired: boolean;
  createdAt: string;
  createdBy: { id: string; name: string };
};
```

#### 2. `src/app/api/share-link/store.ts`
- Armazenar apenas ShareableLink simplificado
- Remover duplicação de documentos

#### 3. `src/app/api/share-link/route.ts` (POST - criar link)
- Receber apenas: caseId, documentIds, createdBy
- Não copiar dados do processo

#### 4. `src/app/api/share-link/[token]/route.ts` (GET - buscar link)
- Buscar ShareableLink pelo token
- Fazer "JOIN" com dados do processo (mock: buscar do kanbanService)
- Fazer "JOIN" com documentos (mock: buscar do kanbanService)
- Retornar dados combinados

#### 5. `src/app/api/share-link/[token]/route.ts` (POST - upload)
- Atualizar o DocumentRequest REAL via kanbanService
- Verificar se todos documentIds estão 'received'
- Se sim, marcar link como expirado

#### 6. `src/services/shareable-link-service.ts`
- Ajustar parâmetros do createLink
- Manter o restante (apenas chama as APIs)

#### 7. `src/stores/slices/kanban-slice.ts`
- Ajustar `generateShareLink` para enviar apenas dados necessários

---

## Mock vs Produção

### Ambiente de Desenvolvimento (Mock)

Como não temos banco de dados, o mock precisa:

1. **Compartilhar dados entre API routes e kanban-service**
   - Criar um store global que ambos acessam
   - Ou usar o próprio kanban-service nas API routes

2. **Simular o JOIN**
   - Buscar processo pelo caseId no mock do kanban
   - Buscar documentos pelo caseId no mock do kanban

3. **Atualizar documentos reais**
   - Chamar kanbanService.updateDocumentStatus() na API de upload
   - Isso atualiza o mock que o kanban usa

### Ambiente de Produção (Real)

Com banco de dados:

```sql
-- Buscar link com dados do processo
SELECT
  sl.*,
  lc.number as case_number,
  lc.title as case_title,
  lc.description as case_description,
  l.name as lawyer_name
FROM shareable_links sl
JOIN legal_cases lc ON sl.case_id = lc.id
LEFT JOIN lawyers l ON lc.lawyer_id = l.id
WHERE sl.token = $1;

-- Buscar documentos do link
SELECT dr.*
FROM document_requests dr
WHERE dr.id = ANY($documentIds);

-- Atualizar documento após upload
UPDATE document_requests
SET status = 'received', received_at = NOW(), file_url = $fileUrl
WHERE id = $documentId;

-- Verificar se todos documentos foram recebidos
SELECT COUNT(*) = 0 as all_received
FROM document_requests
WHERE id = ANY($documentIds) AND status = 'pending';

-- Se all_received = true, expirar o link
UPDATE shareable_links SET is_expired = true WHERE id = $linkId;
```

---

## Estrutura de Arquivos Atual

```
src/
├── app/
│   ├── api/
│   │   └── share-link/
│   │       ├── store.ts              # Store em memória (precisa refatorar)
│   │       ├── route.ts              # POST criar link (precisa refatorar)
│   │       └── [token]/
│   │           └── route.ts          # GET buscar / POST upload (precisa refatorar)
│   └── case/
│       └── [token]/
│           └── page.tsx              # Página pública (OK, só ajustar tipos)
├── components/
│   └── dashboard/
│       └── kanban/
│           ├── kanban-board.tsx      # Conecta modal com store (OK)
│           └── modal/
│               └── case-detail-modal.tsx  # Botão compartilhar (OK)
├── services/
│   ├── index.ts                      # Exports (OK)
│   ├── kanban-service.ts             # Mock do kanban (precisa expor métodos)
│   └── shareable-link-service.ts     # Serviço de links (ajustar params)
├── stores/
│   └── slices/
│       └── kanban-slice.ts           # Action generateShareLink (ajustar)
├── types/
│   └── index.ts                      # Tipos (simplificar ShareableLink)
└── messages/
    └── pt-BR.json                    # Traduções (OK)
```

---

## Próximos Passos

1. [ ] Simplificar tipo `ShareableLink` em `types/index.ts`
2. [ ] Expor método para buscar caso por ID no `kanban-service.ts`
3. [ ] Refatorar `store.ts` para armazenar apenas dados do link
4. [ ] Refatorar POST `/api/share-link` para não copiar dados
5. [ ] Refatorar GET `/api/share-link/[token]` para fazer JOIN
6. [ ] Refatorar POST `/api/share-link/[token]` para atualizar documento real
7. [ ] Ajustar `kanban-slice.ts` para enviar dados corretos
8. [ ] Testar fluxo completo

---

## Teste de Validação

Após refatorar, o teste deve ser:

1. Abrir processo no kanban com documentos pendentes
2. Clicar "Compartilhar com Cliente"
3. Copiar link gerado
4. Abrir link em aba anônima
5. Ver dados do processo e documentos pendentes
6. Fazer upload de um documento
7. **Verificar no kanban se o documento aparece como "Recebido"** ← Este é o teste crítico!
8. Fazer upload de todos os documentos
9. Verificar se link expirou
10. Tentar acessar link novamente → deve mostrar "expirado"
