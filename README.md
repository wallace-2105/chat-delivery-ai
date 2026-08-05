# Delivery AI Assistant

Assistente de delivery conversacional que transforma linguagem natural em pedidos revisáveis. O projeto combina uma interface React já existente com uma arquitetura AWS serverless: o usuário conversa, confere o resumo, confirma o pedido e acompanha a operação.

> Sem `VITE_API_BASE_URL`, a aplicação funciona em modo demonstração com dados mockados. Ao configurar a URL do API Gateway, a mesma interface usa a API AWS.

## Objetivo

Demonstrar uma solução de portfólio com React, TypeScript, Amazon Bedrock e serviços serverless. A separação entre interface, API, orquestração e persistência deixa o fluxo testável e pronto para evoluir sem alterar a experiência visual.

## Tecnologias

| Camada          | Tecnologia                                       | Por que foi escolhida                                                                               |
| --------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Front-end       | React 19, TypeScript, Vite, Tailwind e shadcn/ui | Desenvolvimento tipado, rápido e consistente com os componentes existentes.                         |
| API             | Amazon API Gateway REST                          | Expõe endpoints HTTP gerenciados, com CORS e escala sob demanda, sem manter servidor.               |
| Computação      | AWS Lambda + AWS SDK v3                          | Funções pequenas e independentes; o SDK modular reduz dependências carregadas.                      |
| Orquestração    | AWS Step Functions Express                       | Mostra cada transição do pedido e permite retries/erros; Express responde ao chat de modo síncrono. |
| IA              | Amazon Bedrock                                   | Interpreta mensagens abertas sem hospedar ou operar um modelo de IA.                                |
| Dados           | Amazon DynamoDB                                  | Banco serverless de baixa latência, com GSI para consultar o histórico por data.                    |
| Observabilidade | CloudWatch e X-Ray                               | Logs por Lambda e rastros entre API, funções e workflow.                                            |
| Segurança       | IAM                                              | Cada função recebe apenas as permissões de que precisa.                                             |

## Arquitetura

```mermaid
flowchart LR
  U[Cliente] --> R[React]
  R --> G[API Gateway]
  G --> S[Lambda: startOrder]
  S --> W[Step Functions Express]
  W --> P[Lambda: parseOrder]
  P --> B[Amazon Bedrock]
  W --> V[Lambda: validateProducts]
  W --> C[Lambda: calculatePrice]
  W --> D[Lambda: saveOrder]
  D --> DB[(DynamoDB Orders)]
  W --> F[Lambda: confirmOrder]
  F --> R
  S -. logs/traces .-> O[CloudWatch + X-Ray]
  W -. logs/traces .-> O
```

O POST de prévia processa a conversa até o cálculo do total. A confirmação reenfileira o resumo no workflow, valida os SKUs novamente e só então persiste o pedido. Isso evita confiar em preço ou item que venha diretamente do navegador.

## Fluxo do Step Functions

```mermaid
stateDiagram-v2
  [*] --> InterpretOrder
  InterpretOrder --> ValidateProducts
  ValidateProducts --> ProductExists
  ProductExists --> ReturnInvalidProduct: produto inválido
  ProductExists --> CalculatePrice: válido
  CalculatePrice --> IsConfirmation
  IsConfirmation --> ReturnPreview: prévia
  IsConfirmation --> SaveOrder: confirmar
  SaveOrder --> ConfirmOrder
  ConfirmOrder --> [*]
  ReturnPreview --> [*]
```

O arquivo executável do fluxo fica em [backend/statemachine/order-workflow.asl.json](backend/statemachine/order-workflow.asl.json). A timeline na tela Assistente usa os mesmos nomes de etapas e está preparada para receber eventos reais no futuro.

## Endpoints

| Método | Rota           | Uso                                                                                                            |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `POST` | `/orders`      | Envia `{ prompt, currentSummary }` para obter a prévia; envia `{ action: "confirm", summary }` para confirmar. |
| `GET`  | `/orders`      | Lista pedidos; aceita `limit`, `cursor` e `pagination=true`.                                                   |
| `GET`  | `/orders/{id}` | Retorna um pedido pelo identificador.                                                                          |
| `GET`  | `/dashboard`   | Retorna métricas e série dos últimos sete dias.                                                                |

## Executar o front-end

```bash
bun install
bun run dev
```

Ou use `npm install` e `npm run dev`. A aplicação abre em `http://localhost:8080`.

Para conectá-la à AWS, crie `.env.local` na raiz:

```env
VITE_API_BASE_URL=https://SEU_API_ID.execute-api.SUA_REGIAO.amazonaws.com/prod
```

Reinicie o Vite depois de alterar a variável. Não coloque credenciais AWS no front-end.

## Configurar e fazer deploy AWS

Pré-requisitos: AWS CLI autenticada, [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html), Node.js 20 e acesso ao modelo do Bedrock na região escolhida.

```bash
cd backend
npm install
cd ..
sam build
sam deploy --guided --parameter-overrides AllowedOrigin=http://localhost:8080
```

Durante o deploy, anote o output `ApiUrl` e configure-o em `VITE_API_BASE_URL`. O SAM cria a tabela, o GSI `byCreatedAt`, API Gateway, Lambdas, roles IAM e State Machine. Não é necessário criar a tabela manualmente.

### Habilitar o Amazon Bedrock

1. Abra o console Amazon Bedrock na mesma região do deploy.
2. Em **Model access**, solicite/ative acesso ao modelo configurado em `BedrockModelId` (o padrão é Claude 3 Haiku).
3. Se sua região não oferecer esse modelo, passe um ID disponível e compatível com o formato Anthropic ao `sam deploy`:

```bash
sam deploy --parameter-overrides BedrockModelId=SEU_MODELO AllowedOrigin=https://seu-dominio.com
```

O IAM de `parseOrder` fica restrito ao ARN desse modelo. Esse detalhe é proposital: permissões mínimas limitam o alcance da função.

## Estrutura

```text
src/                           # interface React
  components/                  # chat, resumo, timeline e layout
  routes/                      # Home, Assistente, Dashboard, Pedidos, Arquitetura e Sobre
  services/api.ts              # gateway entre UI, mocks locais e API Gateway
backend/
  src/domain/                  # DTOs e catálogo
  src/services/                # integração Bedrock via AWS SDK v3
  src/repositories/            # persistência DynamoDB
  src/handlers/                # Lambdas independentes
  statemachine/                # definição ASL
template.yaml                  # infraestrutura SAM/IAM/API/DynamoDB/Step Functions
```

## Screenshots

Após executar o projeto, registre as telas em `docs/` para completar o portfólio:

| Assistente            | Dashboard            | Arquitetura AWS        |
| --------------------- | -------------------- | ---------------------- |
| `docs/assistente.png` | `docs/dashboard.png` | `docs/arquitetura.png` |

## Qualidade e segurança

- Tipos e DTOs na borda de cada Lambda; catálogo e cálculo de preço são autoritativos no servidor.
- Repositório DynamoDB isolado da regra de negócio.
- Step Functions contém os caminhos de decisão e retry de integrações Lambda.
- Lambdas registram erros no CloudWatch e recebem tracing X-Ray.
- CORS deve ser restringido ao domínio publicado em produção; evite usar `*` fora de desenvolvimento.

## Roadmap

- [ ] Autenticação de clientes com Amazon Cognito.
- [ ] Eventos reais do Step Functions na timeline (WebSocket/SSE).
- [ ] Catálogo administrativo em DynamoDB.
- [ ] Agregados diários via DynamoDB Streams para dashboard de grande volume.
- [ ] Integração com pagamento, cozinha e notificações.
- [ ] Testes unitários e de contrato das Lambdas.

## Licença

MIT. Consulte a política da sua organização antes de usar chaves, dados de clientes ou modelos de IA em produção.
