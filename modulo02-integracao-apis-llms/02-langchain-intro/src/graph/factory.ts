// Factory module
import { buildGraph } from "./graph.ts";

// Export a function that returns the graph instance
export const graph = () => {
    return buildGraph();
}
