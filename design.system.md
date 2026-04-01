# Design System — Lexia OCR Platform

> Guia definitivo de design e componentes para a plataforma de chat com OCR e extração jurídica.

---

## 1. Princípios de Design

| Princípio | Descrição |
|---|---|
| **Precisão** | A UI reflete a natureza técnica do produto — dados estruturados, campos bem definidos, tipografia densa e legível |
| **Confiança** | Escala de confiança (%) visível em todos os campos extraídos. O usuário sempre sabe o nível de certeza da IA |
| **Eficiência** | Densidade informacional alta sem poluição visual. Cada pixel tem função |
| **Profissionalismo** | Tom jurídico-corporativo. Nenhum elemento decorativo sem propósito |

---

## 2. Paleta de Cores

### Cores Primárias

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#185FA5` | CTAs principais, botão primário, links |
| `--color-primary-light` | `#378ADD` | Ícones ativos, progress bars, highlights |
| `--color-primary-bg` | `#E6F1FB` | Fundo de badges informativos, mensagens do usuário |

### Semânticas

| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#1D9E75` | Campos extraídos com alta confiança (≥ 85%) |
| `--color-success-bg` | `#E1F5EE` | Fundo de campos validados |
| `--color-warning` | `#BA7517` | Campos com confiança média (60–84%) |
| `--color-warning-bg` | `#FAEEDA` | Fundo de campos para revisão |
| `--color-danger` | `#A32D2D` | Campos com confiança baixa (< 60%), erros |
| `--color-danger-bg` | `#FCEBEB` | Fundo de ícone PDF, erros de extração |

### Neutras (modo claro)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg-primary` | `#FFFFFF` | Área de chat, cards de campos |
| `--color-bg-secondary` | `#F7F7F5` | Sidebar, painel de dados, header de grupos |
| `--color-text-primary` | `#1A1A18` | Valores extraídos, títulos |
| `--color-text-secondary` | `#5F5E5A` | Labels de campos, mensagens da IA |
| `--color-text-tertiary` | `#888780` | Timestamps, placeholders, metadados |
| `--color-border` | `rgba(0,0,0,0.10)` | Todas as bordas padrão (0.5px) |

### Tags de tipo de processo

| Tipo | Background | Texto |
|---|---|---|
| Cível | `#E6F1FB` | `#185FA5` |
| Trabalhista | `#EAF3DE` | `#3B6D11` |
| Consumidor | `#FAEEDA` | `#854F0B` |
| Criminal | `#FCEBEB` | `#A32D2D` |
| Previdenciário | `#EEEDFE` | `#534AB7` |
| Tributário | `#E1F5EE` | `#0F6E56` |

---

## 3. Tipografia

### Famílias

| Papel | Família | Uso |
|---|---|---|
| Interface | `--font-sans` (sistema) | Navegação, labels, mensagens, botões |
| Dados | `--font-mono` | Valores extraídos, nº processo, CPF/CNPJ, timestamps |
| Display | `--font-sans` peso 500 | Títulos de seção, nome do produto |

### Escala

| Nome | Size | Weight | Line-height | Uso |
|---|---|---|---|---|
| `display` | 22px | 500 | 1.2 | Títulos de página |
| `heading` | 16px | 500 | 1.3 | Títulos de painel, grupos |
| `subheading` | 14px | 500 | 1.4 | Nome de conversas, labels de nav |
| `body` | 13px | 400 | 1.6 | Mensagens, descrições |
| `small` | 12px | 400 | 1.5 | Valores de campos (mono), metadados |
| `caption` | 11px | 400 | 1.4 | Labels de campos, percentuais, timestamps |
| `micro` | 10px | 400 | 1.3 | Badges, tags de tipo, headers de grupo |

> Regra: nunca usar peso 600 ou 700. Diferenciação hierárquica via tamanho e cor, não apenas peso.

---

## 4. Espaçamento

Sistema baseado em múltiplos de 4px:

| Token | Valor | Uso |
|---|---|---|
| `--space-1` | 4px | Gap interno de badges |
| `--space-2` | 8px | Gap entre ícone e texto em nav |
| `--space-3` | 12px | Padding interno de cards |
| `--space-4` | 16px | Padding de headers, painéis |
| `--space-5` | 20px | Padding de áreas de mensagem |
| `--space-6` | 24px | Separação entre seções |

---

## 5. Border Radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 4px | Tags, badges, progress bar |
| `--radius-md` | 8px | Botões, inputs, nav items |
| `--radius-lg` | 12px | Cards de campo, painel, shell |
| `--radius-pill` | 999px | Avatar, status dot |
| `--radius-bubble` | `14px 14px 2px 14px` | Mensagem do usuário |
| `--radius-bubble-ai` | `2px 14px 14px 14px` | Mensagem da IA |

---

## 6. Layout

### Shell Principal (3 colunas)

```
┌──────────────┬───────────────────────────┬──────────────────┐
│   Sidebar    │       Chat Area           │   Data Panel     │
│   220px      │       flex: 1             │   300px          │
│              │                           │                  │
│  Logo        │  Header                   │  Panel Header    │
│  Nav         │  Messages                 │  Tabs            │
│  Conv List   │  Input                    │  Field Groups    │
│  User        │                           │  Actions         │
└──────────────┴───────────────────────────┴──────────────────┘
```

### Larguras de referência

| Área | Min | Default | Max |
|---|---|---|---|
| Sidebar | 200px | 220px | 260px |
| Chat | 400px | flex-1 | ilimitado |
| Data Panel | 260px | 300px | 340px |

### Responsividade

- **< 1024px**: Data Panel colapsa em drawer (abre ao clicar nos campos do chat)
- **< 768px**: Sidebar colapsa em bottom tab bar
- **< 480px**: View de chat fullscreen + botão flutuante para dados

---

## 7. Componentes

### 7.1 Mensagem do Usuário

```
Estrutura: .msg-user > .bubble + .msg-time
Alinhamento: flex-end
Max-width: 80%
Bubble: background primary-bg, color primary, border-radius bubble
Fonte: body (13px)
Timestamp: 10px mono, color tertiary, text-align right
```

### 7.2 Mensagem da IA

```
Estrutura: .msg-ai > (.ai-avatar + div > (.bubble-ai + .msg-time))
Alinhamento: flex-start, gap 8px
Avatar: 24px círculo, mono "Lx", bg secondary, border tertiary
Bubble: bg secondary, border tertiary, border-radius bubble-ai
Max-width: 88%
```

### 7.3 Campo Extraído (Field Row)

```
Estrutura: .field-row > (.field-label + .field-value)
Padding: 7px 12px
Border-bottom: 0.5px tertiary (exceto último)
Label: 11px, color tertiary
Value: 12px mono, font-weight 500

Estados:
  .ok    → color success (#0F6E56) — confiança ≥ 85%
  .warn  → color warning (#854F0B) — confiança 60–84%
  .error → color danger  (#A32D2D) — confiança < 60%
```

### 7.4 Barra de Confiança

```
Estrutura: .confidence-bar > (.conf-label + .conf-track > .conf-fill) + .conf-pct
Altura da track: 2px
Fill: cor varia por nível
  ≥ 85% → #1D9E75 (success)
  60–84% → #BA7517 (warning)
  < 60% → #A32D2D (danger)
Percentual: 10px mono, color tertiary
```

### 7.5 Stat Card (métricas do painel)

```
Estrutura: .stat-card > .stat-val + .stat-label
Background: bg primary
Border: 0.5px tertiary
Border-radius: md
Padding: 8px 10px
Valor: 18px mono, weight 500
Label: 10px, color tertiary
Cores do valor: neutro / success / warning conforme significado
```

### 7.6 Tag de Tipo de Processo

```
Display: inline-block
Font: 10px mono
Padding: 1px 5px
Border-radius: 3px
Cores: conforme tabela de tipos (seção 2)
Uso: conv list, header do chat
```

### 7.7 Botão de Ação (Action Row)

```
Variantes:
  Default:  bg primary, border secondary, color text-primary
  Primary:  bg #185FA5, border #185FA5, color #E6F1FB
  Danger:   bg danger-bg, border danger, color danger

Padding: 7px
Border-radius: md
Font: 11px, weight 500
Largura: flex: 1 (distribuídos na action row)
```

### 7.8 Upload de Arquivo (File Bubble)

```
Estrutura: .file-bubble > (.file-icon-wrap + div > (.file-name + .file-size))
Alinhamento: flex-end (como mensagem do usuário)
Ícone: 32x32, bg danger-bg (#FCEBEB), cor danger para PDFs
Nome: 12px, weight 500, color primary
Size: 11px mono, color tertiary
```

### 7.9 OCR Progress (dentro do bubble da IA)

```
Layout: flex, align-center, gap 8px
Ícone: SVG animado (spin), cor primary-light
Label: "OCR em andamento..." — 12px mono, color secondary
Progress bar: 80px x 3px, bg border-tertiary, fill primary-light
Percentual: 12px mono, color tertiary

Campos em extração (preview ao vivo):
  Fonte: 11px mono
  Key: color tertiary, min-width fixed (tabulação visual)
  Value: color primary, weight 500
  Check: "✓" color success, 10px
```

---

## 8. Navegação (Sidebar)

### Nav Item

```
Padding: 7px 8px
Border-radius: md
Estado default: color secondary, sem background
Estado ativo: bg primary, border 0.5px tertiary, color primary, weight 500
Ícone: 16x16 SVG, opacity 0.7
Gap ícone-texto: 8px
```

### Conversation Item

```
Padding: 7px 8px
Border-radius: md
Estado ativo: bg primary, border 0.5px tertiary
Título: 12px, weight 500, truncate com ellipsis
Meta: 11px, color tertiary (tag + tempo relativo)
```

---

## 9. Painel de Dados

### Abas (Tabs)

```
Container: padding 8px 10px, border-bottom tertiary
Tab padrão: 11px, color secondary, border-radius md, padding 4px 10px
Tab ativa: bg primary, border 0.5px tertiary, color text-primary, weight 500
Tabs disponíveis: Processo | Partes | Voo/Evento
```

### Field Group

```
Estrutura: .field-group > .field-group-header + N × .field-row
Header: 11px, weight 500, uppercase, letter-spacing 0.6px, bg secondary
Border-radius: md
Border: 0.5px tertiary
```

---

## 10. Estados e Feedback

### Confiança de extração

| Faixa | Label | Cor | Ação recomendada |
|---|---|---|---|
| 90–100% | Alta | `--color-success` | Nenhuma — pronto para uso |
| 75–89% | Boa | `--color-success` leve | Revisão opcional |
| 60–74% | Média | `--color-warning` | Revisão recomendada |
| 40–59% | Baixa | `--color-danger` leve | Revisão obrigatória |
| < 40% | Falha | `--color-danger` | Re-processar documento |

### Status do processo

| Estado | Indicador visual |
|---|---|
| OCR em andamento | Ícone spin + progress bar + % |
| Extração em tempo real | Campos aparecem progressivamente no bubble |
| Concluído | Status dot verde no header + "11/11 campos" |
| Erro | Status dot vermelho + mensagem de erro no bubble |
| Aguardando revisão | Status dot amarelo + badge "1 campo para revisar" |

---

## 11. Iconografia

Todos os ícones são SVG inline (nunca font-icons). Tamanhos padrão:

| Contexto | Tamanho |
|---|---|
| Navegação (sidebar) | 16×16 |
| Inline em texto | 12×12 |
| Botões de ação | 14×14 |
| Avatar/logo | 24–28px |
| Ícone de arquivo | 16×16 (em wrapper 32px) |

Espessura de stroke: 1.2px para ícones de interface, 1.4px para ícones de destaque.
Sempre `stroke-linecap: round` e `stroke-linejoin: round`.

---

## 12. Animações

| Elemento | Animação | Duração |
|---|---|---|
| OCR progress fill | `width` de 0 → 100% | 3–8s linear |
| Ícone de loading | `rotate` 360° infinito | 1s linear |
| Campos aparecendo | `opacity` 0→1 + `translateY` 4px→0 | 150ms ease-out |
| Nav item hover | `background` | 100ms |
| Botão primário hover | `brightness(1.1)` | 100ms |
| Bubble de mensagem | `scale(0.95)→(1)` + fade | 200ms ease-out |

> Regra: animações funcionais apenas. Nada puramente decorativo.

---

## 13. Acessibilidade

- Contraste mínimo AA (4.5:1) em todos os pares texto/fundo
- Todos os campos com `aria-label` descritivo
- Indicação de estado não depende apenas de cor (sempre + ícone ou texto)
- Focus rings visíveis em todos os elementos interativos
- Mensagens de loading anunciadas via `aria-live="polite"`
- Campos de confiança baixa marcados com `aria-invalid="true"`

---

## 14. Tokens de Borda

```css
--border-default:  0.5px solid rgba(0,0,0,0.10);   /* padrão universal */
--border-hover:    0.5px solid rgba(0,0,0,0.20);   /* hover em cards */
--border-active:   0.5px solid rgba(0,0,0,0.30);   /* foco / selecionado */
--border-info:     0.5px solid #B5D4F4;             /* destaque informativo */
--border-success:  0.5px solid #9FE1CB;             /* campo validado */
--border-warning:  0.5px solid #FAC775;             /* campo para revisão */
--border-danger:   0.5px solid #F7C1C1;             /* campo com erro */
```

---

## 15. Regras de Uso

### Faça ✅

- Use `font-family: var(--font-mono)` para todos os valores extraídos (CPF, CNPJ, nº processo, valores monetários, datas)
- Mostre sempre o percentual de confiança junto do campo
- Use tags coloridas para categorizar tipo de processo
- Mantenha o painel de dados sincronizado em tempo real com a extração
- Exiba preview dos campos sendo extraídos no próprio bubble do chat

### Não faça ❌

- Não use gradientes — paleta é flat por definição
- Não omita o percentual de confiança em campos extraídos
- Não misture pesos 600/700 — apenas 400 e 500
- Não use mais de 2 cores de destaque na mesma seção
- Não exiba CPF/CNPJ completo sem máscara (`032.xxx.xxx-41`)
- Não use bordas com border-radius em bordas de acento unilateral (border-left apenas)

---

*Design System v1.0 — Lexia OCR Platform*
*Última atualização: Março 2026*
