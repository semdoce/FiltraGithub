// server.js
require('dotenv').config();
const express = require('express');
const CommitController = require('./controllers/commitController');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

// Rota inicial da View
app.get('/', (req, res) => {
    res.render('index', { commits: null, summary: null, error: null });
});

// Ignorar requisições de favicon para evitar erros de CSP no 404 do Express
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Rota que chama o Controller
app.get('/search', CommitController.checkUserCommits);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
