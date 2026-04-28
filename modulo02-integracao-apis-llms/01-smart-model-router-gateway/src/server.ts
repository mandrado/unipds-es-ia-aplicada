import Fastify from "fastify";

// createServer function that initializes and configures the Fastify application
export const createServer = () => {
    const app = Fastify({ logger: false });

    // metodo POST para o endpoint /chat
    app.post('/chat', {
        schema: {
            body: {
                type: "object",
                required: ["question"],
                properties: {
                    question: { type: "string", minLength: 5 },
                }
            }
        }

    }, async (request, reply) => {
        try {
            const { question } = request.body as { question: string };
            return reply.send({ answer: `The question was: ${question}` })
        } catch (error) {
            console.error("Error handling /chat request:", error);
            return reply.code(500).send({ error: "Internal Server Error" });
        }
    }
    )

    return app;
}
