// controllers/commitController.js
const CommitModel = require('../models/commitModel');
const aiService = require('../services/aiService');

class CommitController {
    static async checkUserCommits(req, res) {
        const { repoUrl, username } = req.query;

        if (!repoUrl || !username) {
            return res.render('index', { commits: null, summary: null, error: 'Por favor, preencha todos os campos.' });
        }

        let owner, repo;
        try {
            // Tenta dar parse na URL inteira ou no formato "owner/repo"
            let urlToParse = repoUrl;
            if (!repoUrl.startsWith('http')) {
                urlToParse = `https://github.com/${repoUrl}`;
            }
            
            const urlObj = new URL(urlToParse);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            
            if (pathParts.length >= 2) {
                owner = pathParts[0];
                repo = pathParts[1];
            } else {
                throw new Error('URL inválida');
            }
            
            // Remove o .git no final do nome do repo, se existir
            if (repo.endsWith('.git')) {
                repo = repo.slice(0, -4);
            }
        } catch (error) {
            return res.render('index', { commits: null, summary: null, error: 'Link do repositório inválido. Forneça a URL do GitHub.', search: { repoUrl, username } });
        }

        try {
            const allCommits = await CommitModel.getRepoCommits(owner, repo);

            // Filtra os commits onde o autor corresponde ao username digitado
            const userCommits = allCommits.filter(item => {
                // Checa tanto o login do GitHub quanto o nome no git config caso o login falhe
                const authorLogin = item.author?.login?.toLowerCase();
                const commitAuthorName = item.commit?.author?.name?.toLowerCase();
                const searchName = username.toLowerCase();

                return authorLogin === searchName || commitAuthorName === searchName;
            });

            // Mapeia para um formato mais limpo
            const formattedCommits = userCommits.map(item => ({
                sha: item.sha.substring(0, 7),
                message: item.commit.message,
                date: new Date(item.commit.author.date).toLocaleDateString('pt-BR'),
                url: item.html_url
            }));

            // Chama o serviço de IA para resumir
            let summary = null;
            if (formattedCommits.length > 0) {
                // Limita a busca de diffs aos 10 commits mais recentes
                const commitsForAI = formattedCommits.slice(0, 10);
                
                // Busca todas as diffs em paralelo para ficar muito mais rápido
                await Promise.all(commitsForAI.map(async (c) => {
                    const diff = await CommitModel.getCommitDiff(owner, repo, c.sha);
                    if (diff) {
                        c.diff = diff.substring(0, 4000); 
                    }
                }));

                summary = await aiService.generateCommitSummary(commitsForAI, username, repo);
            }

            res.render('index', { commits: formattedCommits, summary, error: null, search: { owner, repo, username, repoUrl } });

        } catch (error) {
            // Adicione essa linha abaixo para ver o log real do erro no terminal do seu VS Code/Prompt
            console.error('Erro detalhado detectado:', error);
            
            res.render('index', { commits: null, summary: null, error: error.message, search: { repoUrl, username } });
        }
    }
}

module.exports = CommitController;
