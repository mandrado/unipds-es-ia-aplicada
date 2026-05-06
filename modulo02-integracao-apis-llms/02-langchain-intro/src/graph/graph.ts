import { END, MessagesZodMeta, START, StateGraph } from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { BaseMessage } from "langchain";
import { z } from "zod/v3";

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
    .addNode("identifyIntent", (state: GraphState) => {
      return{
        ...state,
        output: "test"
      }
    })
  .addEdge(START, "identifyIntent")
  .addEdge("identifyIntent", END)

  return workflow.compile()
}
