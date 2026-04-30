import { config } from "./config.ts";
import { OpenRouterService } from "./openrouterService.ts";
import { createServer } from "./server.ts";

const routerService = new OpenRouterService(config);

// Start the server
const app = createServer(routerService);

// Listen on port 3000 and bind to all network interfaces
await app.listen({ port: config.port, host: '0.0.0.0' })

console.log("Server is running on http://localhost:3000");

// Test the /chat endpoint using app.inject
// app.inject({
//     method: 'POST',
//     url: '/chat',
//     body: {
//         question: "What is rate limiting for LLMs?"
//     }
// }).then(response => {
//     console.log("Response status:", response.statusCode);
//     console.log("Response body:", response.body);
// }).catch(error => {
//     console.error("Error during test request:", error);
// });
