import { SFNClient, StartSyncExecutionCommand } from "@aws-sdk/client-sfn";

import type { OrderSummary, WorkflowInput } from "../domain/order.js";
import { parseBody, response, type ApiEvent } from "./http.js";

const stepFunctions = new SFNClient({});
const stateMachineArn = process.env.ORDER_WORKFLOW_ARN!;

type CreateOrderRequest = {
  action?: "confirm";
  prompt?: string;
  currentSummary?: OrderSummary;
  summary?: OrderSummary;
  customer?: string;
};

/**
 * The API Lambda contains no business orchestration: Step Functions owns it.
 * This keeps HTTP concerns separate from retries, state transitions and audit history.
 */
export const handler = async (event: ApiEvent) => {
  try {
    const body = parseBody<CreateOrderRequest>(event.body);
    const action = body.action === "confirm" ? "confirm" : "preview";
    if (action === "preview" && !body.prompt?.trim())
      return response(400, { message: "Informe o pedido em texto." });
    if (action === "confirm" && !body.summary?.items.length)
      return response(400, { message: "Não é possível confirmar um pedido vazio." });

    const input: WorkflowInput = {
      action,
      prompt: body.prompt,
      currentSummary: body.currentSummary,
      summary: body.summary,
      customer: body.customer,
    };
    const execution = await stepFunctions.send(
      new StartSyncExecutionCommand({ stateMachineArn, input: JSON.stringify(input) }),
    );
    if (execution.status !== "SUCCEEDED" || !execution.output) {
      console.error("Order workflow failed", {
        status: execution.status,
        error: execution.error,
        cause: execution.cause,
      });
      return response(422, {
        message: "Não foi possível processar o pedido. Revise os itens e tente novamente.",
      });
    }
    return response(200, JSON.parse(execution.output));
  } catch (error) {
    console.error("StartOrder failed", error);
    return response(500, {
      message: "O assistente está indisponível no momento. Tente novamente.",
    });
  }
};
