### FiltraGithub
---
*OBS: Não é nenhum projeto importante, apenas pedi à IA para fazer. Eu só alterei o URL e depois pedi para usar concorrência na leitura das diffs.*  

Essa é uma aplicação bem simples, que tem como finalidade resumir o que um usuário fez em um determinado repositório. Ela consome a message e a diff retornadas da API do Github para gerar o resumo.  


Você precisa ter uma [chave do Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key?hl=pt-br) para rodar o projeto
- A .env.example deve ser renomeada para .env
- O campo <your-gemini-ai-studio-api-key> deve ser alterado para a sua chave.

Você pode alterar a variável "prompt" em aiService.js para pedir um resumo diferente, menor, em outra língua, etc. Também pode alterar o modelo em services... Eu acho.
<img width="775" height="1271" alt="example" src="https://github.com/user-attachments/assets/f44a6ef2-45d1-45d9-8430-62bb5bcefa63" />
