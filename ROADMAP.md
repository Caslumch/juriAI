# Roadmap — Lexia OCR Platform

> Checklist de desenvolvimento. Marque `[x]` conforme cada item for concluído.

---

## FASE 0 — Fundação (Setup do Projeto)

- [x] **0.1** Scaffolding Next.js 16 (pnpm, TypeScript strict, Tailwind CSS, estrutura de pastas do PRD)
- [x] **0.2** Design System Tokens (CSS variables: cores, espaçamento, radius, tipografia, bordas)
- [x] **0.3** Componentes Base — Shell 3 colunas (Sidebar 220px + Chat flex-1 + Data Panel 300px) + responsividade
- [x] **0.4** Infraestrutura (Prisma + PostgreSQL, Redis Upstash, Jotai + React Query providers)
- [x] **0.5** Lint, Formatação, CI (ESLint, Prettier, Husky + lint-staged)

---

## FASE 1 — MVP: Chat + OCR + Extração

### Sprint 1 — Chat Funcional

- [x] **1.1** UI de Chat (bolhas user/IA, avatar "Lx", timestamps mono, animações)
- [x] **1.2** Upload de Arquivos (File Bubble PDF/imagens, drag & drop, preview, validação tipo/tamanho)
- [x] **1.3** Integração Vercel AI SDK (stream de respostas, API route `/api/chat`)
- [x] **1.4** Histórico de Conversas (lista na sidebar, persistência Prisma, truncate + tag de tipo)

### Sprint 2 — OCR + Extração

- [x] **2.1** Pipeline OCR (API route `/api/ocr`, Google Vision / AWS Textract, Tesseract fallback)
- [x] **2.2** Pré-processamento (limpeza de ruído, correção de rotação, normalização)
- [x] **2.3** Extração Estruturada via IA (prompt engineering, 11 campos jurídicos)
- [x] **2.4** Schemas Zod (validação para cada tipo de extração)
- [x] **2.5** OCR Progress UI (ícone spin, progress bar, campos aparecendo progressivamente)

### Sprint 3 — Painel de Dados

- [x] **3.1** Data Panel (tabs Processo/Partes/Voo-Evento, Field Groups, Field Rows com estados ok/warn/error)
- [x] **3.2** Barra de Confiança (% por campo, cores semânticas: success/warning/danger)
- [x] **3.3** Stat Cards (total de campos, % confiança média, campos para revisão)
- [x] **3.4** Sincronização em Tempo Real (painel atualiza conforme extração no chat)
- [ ] **3.5** Armazenamento de Arquivos (upload S3/Vercel Blob, referência no banco)

---

## FASE 2 — Autenticação + Otimização

### Sprint 4 — Autenticação

- [x] **4.1** Instalar e configurar NextAuth.js (Auth.js v5)
- [x] **4.2** Credentials Provider (email + senha com bcrypt)
- [x] **4.3** Sessão persistente via JWT (NextAuth session strategy)
- [x] **4.4** Middleware de proteção de rotas (matcher no middleware.ts)
- [x] **4.5** Páginas de login e cadastro

### Sprint 5 — Precisão e Qualidade

- [x] **5.1** Refinamento de Prompts (iteração para melhorar taxa de extração)
- [x] **5.2** Validação Pós-Extração (Zod + regras de negócio: formato CPF/CNPJ, nº processo CNJ)
- [x] **5.3** Extração Avançada (nº voo, código IATA, origem/destino, tipo de ocorrência/dano)
- [x] **5.4** Edição Manual de Campos (usuário corrige campos extraídos)
- [x] **5.5** Mascaramento de Dados (CPF/CNPJ com máscara: `032.xxx.xxx-41`)

---

## FASE 3 — Admin + Automação

### Sprint 6 — Painel Administrativo

- [x] **6.1** Gestão de Usuários (CRUD, papéis admin/operador, ativação/desativação)
- [x] **6.2** Logs de Extração (histórico de documentos processados com status)
- [x] **6.3** Monitoramento de Uso (dashboard: docs/dia, tempo médio, taxa de acerto)
- [x] **6.4** Visualização de Documentos (viewer de PDFs/imagens processados)

### Sprint 7 — Integração Externa

- [ ] **7.1** Integração karoz.nantesmello.com (mapeamento campos → formulários externos)
- [ ] **7.2** Auto-preenchimento (envio automático via API ou browser automation)
- [ ] **7.3** Fluxos Automatizados (upload → OCR → extração → envio ao Karoz em um clique)

### Sprint 8 — Segurança e Polimento

- [ ] **8.1** Criptografia de Arquivos (encryption at rest para documentos sensíveis)
- [ ] **8.2** Logs de Auditoria (registro de todas as ações: quem, quando, o quê)
- [ ] **8.3** Expiração de Arquivos (TTL configurável para documentos sensíveis)
- [ ] **8.4** Rate Limiting (Redis-based por usuário)
- [ ] **8.5** Queue de OCR e Worker Threads (concorrência para múltiplos usuários simultâneos)

---

> **Progresso:** 32 / 36 itens concluídos
