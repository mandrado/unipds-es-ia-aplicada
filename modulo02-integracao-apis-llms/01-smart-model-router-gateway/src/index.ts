import { createServer } from "./server.ts";

// Start the server
const app = createServer();

// Listen on port 3000 and bind to all network interfaces
await app.listen({ port: 3000, host: '0.0.0.0'})

console.log("Server is running on http://localhost:3000");

// Test the /chat endpoint using app.inject
app.inject({
    method: 'POST',
    url: '/chat',
    body: {
        question: "What is the capital of France?"
    }
}).then(response => {
    console.log("Response status:", response.statusCode);s
    console.log("Response body:", response.body);
}).catch(error => {
    console.error("Error during test request:", error);
});
