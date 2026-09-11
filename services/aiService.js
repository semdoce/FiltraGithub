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
        Você é um redator técnico especializado em currículos de engenharia de software.
        Abaixo estão os commits do usuário "${username}" no repositório "${repo}", com as diffs do código modificado.

        Sua ÚNICA tarefa é transformar esses commits em bullet points curtos de currículo técnico.

        ESTILO DE ESCRITA OBRIGATÓRIO:
        Cada bullet point deve seguir esta estrutura:
        "Verbo de ação + o que foi construído + tecnologia usada + breve detalhe de como"
        
        - Use verbos como: Desenvolveu, Implementou, Criou, Estruturou, Integrou, Configurou.
        - Cite as tecnologias e bibliotecas principais (Node.js, Express, React, Mongoose, JWT, etc.).
        - Seja ALTO NÍVEL: não mencione nomes de campos, códigos HTTP, nomes de arquivos, nem detalhes granulares de implementação.
        - CADA BULLET DEVE TER NO MÁXIMO 30 PALAVRAS. Se passar de 30 palavras, reescreva de forma mais curta.

        EXEMPLOS DO TAMANHO ESPERADO (siga este comprimento):
        • Desenvolveu a camada de autenticação do backend utilizando Node.js e Express, com validação via bcrypt e tokens JWT.
        • Implementou o gerenciamento global de autenticação no frontend com React Context API e Axios.
        • Desenvolveu a funcionalidade de upload de foto utilizando FormData, integrando frontend e backend.

        REGRAS DE FORMATAÇÃO:
        - Retorne SOMENTE os bullet points, começando cada linha com •.
        - NUNCA escreva introduções, conclusões ou comentários fora dos bullets.
        - Máximo de 4 bullet points. Agrupe contribuições menores em um único bullet.
        - Cada • deve estar em sua própria linha, separado por quebra de linha.

        Commits e Diffs a serem analisados:
        ${commitsText}
`;

        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
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
