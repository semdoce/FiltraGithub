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

        Sua ÚNICA tarefa é transformar esses commits em bullet points de currículo técnico.

        ESTILO DE ESCRITA OBRIGATÓRIO:
        Cada bullet point deve seguir esta estrutura exata:
        "Verbo de ação no passado + o que foi construído/implementado + tecnologia principal + detalhe técnico de como foi feito"
        
        - Use verbos como: Desenvolveu, Implementou, Criou, Estruturou, Integrou, Configurou, Refatorou, Modelou.
        - Nomeie SEMPRE as tecnologias, bibliotecas e padrões concretos encontrados no código (ex: Node.js, Express, JWT, bcrypt, React, Axios, FormData, Prisma, Docker, etc.).
        - O detalhe técnico deve explicar a abordagem: como a tecnologia foi usada, não apenas que foi usada.
        - Proibido usar linguagem vaga como: "melhorou o código", "fez ajustes", "trabalhou em funcionalidades".

        EXEMPLOS DO ESTILO ESPERADO (não copie, use como referência de formato):
        • Desenvolveu a camada de autenticação do backend utilizando Node.js e Express, com validação de credenciais via bcrypt e geração de tokens JWT.
        • Implementou o gerenciamento global de autenticação no frontend com React Context API e Axios, incluindo armazenamento e envio automático do token nas requisições.
        • Desenvolveu a funcionalidade de perfil e upload de foto utilizando FormData, integrando frontend e backend.
        • Modelou o banco de dados relacional com Prisma ORM, definindo schemas e relacionamentos entre entidades de usuário e produto.
        • Configurou pipeline de CI/CD utilizando GitHub Actions, automatizando build, testes e deploy para ambiente de produção.

        REGRAS DE FORMATAÇÃO:
        - Retorne SOMENTE os bullet points, começando cada linha com •.
        - NUNCA escreva introduções, conclusões ou comentários fora dos bullets (ex: "Aqui está o resumo:", "Com base nos commits...").
        - Máximo de 5 bullet points. Agrupe contribuições menores em um único bullet quando possível.
        - OBRIGATÓRIO: separe cada bullet point com uma quebra de linha (\n). Cada • deve estar em sua própria linha.

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
