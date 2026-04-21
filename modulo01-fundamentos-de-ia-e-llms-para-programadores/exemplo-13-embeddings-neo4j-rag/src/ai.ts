export class AI {
    async answerQuestion(question: string): Promise<string> {
        return `Resposta para a pergunta: "${question}"`;
    }
}
