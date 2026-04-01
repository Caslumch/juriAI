# PRD — Plataforma de Chat com OCR e Extração Jurídica

## 1. Visão Geral

A aplicação será uma plataforma de chat inteligente com OCR, capaz de analisar documentos (PDFs e imagens) e extrair automaticamente informações estruturadas de processos jurídicos e documentos correlatos.

O sistema permitirá que usuários enviem arquivos e recebam, via chat, dados organizados e prontos para uso.

---

## 2. Objetivo do Produto

Automatizar a leitura e extração de informações de documentos jurídicos, reduzindo o tempo de análise manual e aumentando a produtividade operacional.

---

## 3. Público-Alvo

- Escritórios de advocacia
- Times jurídicos internos (in-house)
- Operadores jurídicos (paralegais, assistentes)
- Empresas que lidam com alto volume de processos

---

## 4. Proposta de Valor

- Redução de tempo operacional
- Padronização da extração de dados
- Diminuição de erros humanos
- Escalabilidade no processamento de documentos

---

## 5. Funcionalidades Principais

### 5.1 Chat com IA

- Interface estilo ChatGPT
- Upload de arquivos: PDF, Imagens, Prints
- Respostas estruturadas e conversacionais

### 5.2 OCR + Processamento de Documentos

- Extração de texto via OCR
- Suporte a: PDFs nativos, PDFs escaneados, Imagens (JPEG, PNG)
- Pré-processamento: limpeza de ruído, correção de rotação, normalização

### 5.3 Extração de Dados Estruturados

A IA deverá retornar:

| Campo | Descrição |
|---|---|
| Resumo dos fatos | Síntese do conteúdo |
| Tipo de processo | Classificação do processo |
| Número do processo | Identificador único |
| Data da ocorrência | Data do evento |
| Autor | Parte autora |
| Réu | Parte ré |
| CPF / CNPJ | Documentos das partes |
| Vara | Vara responsável |
| Comarca | Comarca do processo |
| Foro | Foro competente |
| Valor da causa | Valor atribuído à causa |

### 5.4 Extração Avançada (Casos Específicos)

Para documentos como passagens e e-mails:

- Número do voo
- Código IATA
- Origem e destino
- Tipo de ocorrência: Atraso, Cancelamento, Extravio de bagagem
- Tipo de dano: Moral, Material

### 5.5 Sistema de Autenticação
Provider: NextAuth.js (Auth.js v5)
Fase atual (MVP):

- Login com e-mail e senha (credentials provider)
- Sessão persistente via JWT (NextAuth session)
- Controle de acesso por middleware de proteção de rotas

Fase futura (pós-MVP):

- OAuth Google
- Magic Link (removido)
- Microsoft OAuth (removido)
- 2FA / TOTP (removido)

### 5.6 Painel Administrativo

- Gestão de usuários
- Logs de extração
- Monitoramento de uso
- Visualização de documentos processados

### 5.7 Integração com Plataforma Externa

Integração com: [karoz.nantesmello.com](https://karoz.nantesmello.com)

- Preenchimento automático de formulários
- Envio dos dados extraídos
- Possível automação via API ou browser automation

---

## 6. Roadmap — Etapas do Produto

| Fase | Nome | Entregas |
|---|---|---|
| 🥇 Fase 1 | MVP — Extração de Dados | Upload, OCR, extração via IA, retorno estruturado no chat |
| 🥈 Fase 2 | Otimização | Precisão OCR, ajuste de prompts, validação com Zod |
| 🥉 Fase 3 | Automação | Integração externa, auto-preenchimento, fluxos automatizados |

---

## 7. Arquitetura Técnica

### 7.1 Stack Principal

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 + React 19 |
| Backend | API Routes (Next.js) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS |
| Gerenciador | pnpm |

### 7.2 State Management

- **Jotai** → estado global simples
- **React Query** → cache e sincronização server
- ~~Effector~~ — removido (complexidade desnecessária)

### 7.3 Backend

- API Routes (`/app/api`)
- Server Actions
- Axios (client) / Fetch (server)

### 7.4 IA / OCR

- **Vercel AI SDK**
- Providers: OpenAI / Anthropic
- OCR: Tesseract (fallback), Google Vision ou AWS Textract (recomendado)

### 7.5 Armazenamento

- **AWS S3** ou **Vercel Blob** → arquivos
- **Redis (Upstash)** → sessões, cache de respostas, rate limiting

### 7.6 Banco de Dados

> **Recomendado:** PostgreSQL + Prisma

Para armazenar: usuários, documentos, extrações, logs.

### 7.7 Validação

- **Zod** → schemas de extração
- **React Hook Form** → formulários

---

## 8. Arquitetura de Pastas

```
src/
├── app/
│   ├── (chat)/
│   ├── (admin)/
│   ├── api/
│   │   ├── upload/
│   │   ├── ocr/
│   │   ├── extract/
│   │   └── integration/
│   └── actions/
├── lib/
│   ├── ai/
│   ├── ocr/
│   ├── parser/
│   ├── integrations/
│   └── auth/
├── shared/
│   ├── api/
│   ├── schemas/
│   ├── hooks/
│   └── types/
├── components/
├── widgets/
└── providers/
```

---

## 9. Desafios Técnicos

- OCR em imagens de baixa qualidade (prints, PDFs escaneados tortos)
- Ambiguidade de dados (nome vs razão social, CPF/CNPJ misturados)
- Padronização entre diferentes formatos de documentos jurídicos

---

## 10. Estratégia de Precisão

- Prompt engineering estruturado
- Uso de schemas (Zod)
- Validação pós-extração
- Possível RAG com base jurídica

---

## 11. Métricas de Sucesso

- % de campos corretamente extraídos
- Tempo médio de processamento por documento
- Redução de trabalho manual
- Taxa de retrabalho

---

## 12. Segurança

- Criptografia de arquivos
- Controle de acesso por usuário
- Logs de auditoria
- Expiração de arquivos sensíveis
