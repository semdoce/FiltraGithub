const fetch = require('node-fetch');

class CommitModel {
    static async getRepoCommits(owner, repo) {
        const cleanOwner = owner.trim();
        const cleanRepo = repo.trim();
        
        // AQUI ESTÁ A MUDANÇA: Certifique-se de usar crases ` e não aspas simples ou duplas
        const url = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits?per_page=100`;
        
        console.log(`[GitHub API] Buscando URL corrigida: ${url}`);

        const headers = { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/vnd.github.v3+json',
            'Connection': 'keep-alive'
        };

        if (process.env.GITHUB_ACCESS_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        if (response.status === 403) {
            throw new Error('Limite de requisições do GitHub excedido para o seu IP. Aguarde um momento.');
        }

        if (!response.ok) {
            throw new Error(`Erro na API do GitHub (Status: ${response.status}). Verifique se o Dono e o Repositório estão digitados corretamente.`);
        }

        return await response.json();
    }

    static async getCommitDiff(owner, repo, sha) {
        const cleanOwner = owner.trim();
        const cleanRepo = repo.trim();
        
        const url = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${sha}`;
        
        try {
            const headers = { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/vnd.github.v3.diff',
                'Connection': 'keep-alive'
            };

            if (process.env.GITHUB_ACCESS_TOKEN) {
                headers['Authorization'] = `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                return null;
            }

            return await response.text();
        } catch (e) {
            console.error(`Erro ao buscar diff do commit ${sha}:`, e);
            return null;
        }
    }
}

module.exports = CommitModel;
