import { AIMessage } from "langchain";
import { type GraphState } from "../graph.ts";

// Função para gerar a resposta do chatbot com base na intenção identificada
export function chatResponseNode(state: GraphState): GraphState {
  const responseText = state.output;
  const aiMessage = new AIMessage(responseText);

  // Retorna o estado atualizado com a nova mensagem do chatbot adicionada à lista de mensagens
  return {
    ...state,
    messages: [
      ...state.messages, 
      aiMessage
    ],
  };
}
