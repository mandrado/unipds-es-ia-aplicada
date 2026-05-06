import { END, MessagesZodMeta, START, StateGraph } from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { BaseMessage } from "langchain";
import { z } from "zod/v3";
import { chatResponseNode } from "./nodes/chatResponseNode.ts";
import { identifyIntentNode } from "./nodes/identifyIntentNode.ts";

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
  .addNode("identifyIntent", identifyIntentNode)
  .addNode("chatResponse", chatResponseNode)
  .addEdge(START, "identifyIntent")
  .addEdge("identifyIntent", "chatResponse")
  .addEdge("chatResponse", END)

  return workflow.compile()
}
