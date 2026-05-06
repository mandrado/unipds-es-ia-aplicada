import { type GraphState } from "../graph.ts";

// Função para transformar a mensagem de saída em letras maiúsculas
export function upperCaseNode(state: GraphState): GraphState {
  const responseText = state.output.toUpperCase();

  // Retorna o estado atualizado com a mensagem de saída transformada em letras maiúsculas
  return {
    ...state,
    output: responseText,
  };
}
