const { GoogleGenAI } = require("@google/genai");

class AiService {
    constructor() {
        // Inicializa o SDK do Gemini. Ele usará automaticamente a variável de ambiente GEMINI_API_KEY
        this.ai = new GoogleGenAI({});
    }

    async generateCommitSummary(commits, username, repo) {
        if (!commits || commits.length === 0) {
            return "Nenhum commit para resumir.";
        }

        // Formata os commits para um texto mais fácil para a IA entender
        const commitsText = commits.map(c => {
            let text = `- [${c.date}] (${c.sha}): ${c.message}`;
            if (c.diff) {
                text += `\n  Diff das alterações:\n\`\`\`diff\n${c.diff}\n\`\`\`\n`;
            }
            return text;
        }).join('\n');

        const prompt = `
        Você é um assistente técnico especializado em análise de código. 
        Abaixo estão os commits recentes do usuário "${username}" no repositório "${repo}".
        Escreva um resumo conciso (em um ou dois parágrafos) do que esse desenvolvedor construiu, consertou ou alterou no projeto. Não se baseie apenas nas mensagens de commit, mas analise o código das diffs (alterações de linhas) fornecidas para entender exatamente o que foi implementado de fato.
        Fale diretamente sobre as principais entregas dele e evite usar jargões muito complexos caso a mensagem seja simples.

        Commits e Diffs:
        ${commitsText}
`;

        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents: prompt
            });
            return response.text;
        } catch (error) {
            console.log("\n--- ERRO NA IA ---");
            console.log(error.message);
            console.log(error.stack);
            console.log("------------------\n");
            return `Não foi possível gerar um resumo com a IA no momento. Motivo: ${error.message || error}`;
        }
    }
}

module.exports = new AiService();
