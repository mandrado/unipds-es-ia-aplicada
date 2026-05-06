import { END, MessagesZodMeta, START, StateGraph } from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { BaseMessage } from "langchain";
import { z } from "zod/v3";
import { chatResponseNode } from "./nodes/chatResponseNode.ts";
import { fallbackNode } from "./nodes/fallbackNode.ts";
import { identifyIntentNode } from "./nodes/identifyIntentNode.ts";
import { lowerCaseNode } from "./nodes/lowerCaseNode.ts";
import { upperCaseNode } from "./nodes/upperCaseNode.ts";

// Define the schema for the graph state using Zod
const GraphState = z.object({
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta
  ),
  output: z.string(),
  command: z.enum(["uppercase", "lowercase", "unknown"])
});


// Infer the TypeScript type from the Zod schema
export type GraphState = z.infer<typeof GraphState>;

// Function to build the graph workflow
export function buildGraph() {
  const workflow = new StateGraph({
    stateSchema: GraphState,
  });

  // Define the nodes and edges of the graph
  workflow
    // .addNode("identifyIntent", (state: GraphState) => {
    //   return{
    //     ...state,
    //     output: "test"
    //   }
    // })
  // Adicionar os nós ao grafo (definição das funções que serão executadas em cada nó)
  .addNode("identifyIntent", identifyIntentNode)
  .addNode("chatResponse", chatResponseNode)
  .addNode("uppercase", upperCaseNode)
  .addNode("lowercase", lowerCaseNode)
  .addNode("fallback", fallbackNode)
  
  // Definir as transições entre os nós
  .addEdge(START, "identifyIntent")
  // .addEdge("identifyIntent", "chatResponse")
  // Definir as transições condicionais com base no comando identificado
  .addConditionalEdges("identifyIntent", 
    (state: GraphState) => {
      switch (state.command) {
        case "uppercase":
          return "uppercase";
        case "lowercase":
          return "lowercase";
        default:
          return "fallback";
      }
    },
    {
      "uppercase": "uppercase",
      "lowercase": "lowercase",
      "fallback": "fallback"
    }
  )
  // Definir as transições dos nós de resposta para o chatResponse
  .addEdge("uppercase", "chatResponse")
  .addEdge("lowercase", "chatResponse")
  .addEdge("fallback", "chatResponse")

  // Definir as transições dos nós de resposta para o nó final
  .addEdge("chatResponse", END)

  return workflow.compile()
}
