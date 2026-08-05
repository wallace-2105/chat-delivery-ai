# Delivery AI Assistant

Interface (front-end apenas) de um assistente inteligente para pedidos de delivery.
**Slogan:** _Seu assistente inteligente para pedidos de delivery._

> ⚠️ Este repositório contém **somente a camada de apresentação**. Não há backend, banco de dados
> nem chamadas HTTP reais — todos os dados são mockados na camada de serviço (`src/services/api.ts`),
> pronta para ser substituída por uma API REST em AWS (API Gateway + Lambda + Step Functions +
> Amazon Bedrock + DynamoDB).

## Tecnologias

- React 19 + TypeScript
- Vite
- TanStack Router (roteamento file-based — este template não usa React Router)
- Tailwind CSS v4
- shadcn/ui
- Lucide Icons
- React Hook Form
- Recharts (gráficos)
- Sonner (toasts)

## Identidade visual

| Token       | Valor     |
| ----------- | --------- |
| Primária    | `#FF5A1F` |
| Secundária  | `#111827` |
| Neutras     | Branco / cinza claro / cinza escuro |

Bordas arredondadas, animações suaves, tema claro e escuro (toggle na navbar) e layout responsivo
(desktop, tablet e mobile).

## Páginas

| Rota          | Descrição |
| ------------- | --------- |
| `/`           | Home com hero, descrição, botão **Começar** e cards de funcionalidades |
| `/assistente` | Chat estilo ChatGPT + card lateral de **Resumo do Pedido** |
| `/historico`  | Tabela de pedidos simulados com filtros e busca |
| `/dashboard`  | Cards de métricas e gráfico com dados fictícios |

## Como executar

```bash
bun install     # ou npm install
bun run dev     # ou npm run dev
```

A aplicação abre em `http://localhost:8080`.

Outros scripts: `bun run build`, `bun run preview`, `bun run lint`.

## Estrutura do projeto

```
src/
├─ assets/                 # imagens e mídias
├─ components/
│  ├─ chat/                # ChatPanel, MessageBubble, TypingIndicator
│  ├─ layout/              # Navbar, AppSidebar, Footer
│  ├─ ui/                  # shadcn/ui (button, card, dialog, table, skeleton, sonner...)
│  ├─ EmptyState.tsx
│  ├─ OrderCard.tsx
│  ├─ OrderSummaryCard.tsx
│  ├─ StatCard.tsx
│  └─ StatusBadge.tsx
├─ hooks/                  # use-assistant, use-theme, use-mobile
├─ lib/                    # utils, formatação de moeda/data
├─ routes/                 # páginas (index, assistente, historico, dashboard, __root)
├─ services/               # api.ts (mock) + mock-data.ts
├─ types/                  # tipagem de domínio (Order, ChatMessage, DashboardData...)
└─ styles.css              # design system (tokens, tema claro/escuro, utilitários)
```

## Camada de serviço

Todas as funções retornam `Promise` com dados mockados e latência simulada:

```ts
getAssistantSession(); // GET  /assistant/session
sendOrder(prompt, summary); // POST /orders
confirmOrder(summary); // POST /orders/confirm
getHistory(); // GET  /orders
getDashboard(); // GET  /dashboard
```

Para integrar com o backend, substitua o corpo de cada função por um `fetch` para `API_BASE_URL`
mantendo as mesmas assinaturas e tipos.

## Imagens (placeholders)

| Tela      | Preview |
| --------- | ------- |
| Home      | `![Home](./docs/home.png)` |
| Assistente| `![Assistente](./docs/assistente.png)` |
| Histórico | `![Histórico](./docs/historico.png)` |
| Dashboard | `![Dashboard](./docs/dashboard.png)` |

## Próximos passos

1. Expor endpoints REST em AWS API Gateway.
2. Orquestrar o fluxo do pedido com Step Functions.
3. Interpretar a mensagem do cliente com Amazon Bedrock.
4. Persistir pedidos no DynamoDB.
