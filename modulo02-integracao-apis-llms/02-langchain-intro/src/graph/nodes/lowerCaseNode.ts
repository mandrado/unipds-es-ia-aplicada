import { type GraphState } from "../graph.ts";

// Função para transformar a mensagem de saída em letras minúsculas
export function lowerCaseNode(state: GraphState): GraphState {
  const responseText = state.output.toLowerCase();

  // Retorna o estado atualizado com a mensagem de saída transformada em letras minúsculas
  return {
    ...state,
    output: responseText,
  };
}
