import { type GraphState } from "../graph.ts";

// Função para identificar a intenção do usuário com base na última mensagem
export function identifyIntentNode(state: GraphState): GraphState {
  const input = state.messages.at(-1)?.text ?? "";
  const inputLower = input.toLowerCase();

  let command: GraphState["command"] = "unknown";

  // Verifica se a mensagem contém palavras-chave para determinar a intenção
  if (inputLower.includes("upper")) {
    command = "uppercase";
  } else if (inputLower.includes("lower")) {
    command = "lowercase";
  }

  // Retorna o estado atualizado com a intenção identificada e a mensagem de saída
  return {
    ...state,
    command,
    output: input
  };
}
