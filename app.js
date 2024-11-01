
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Dados de exemplo para autenticação
const users = {
    usuario1: 'senha1',
    user2: 'senha2'
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'mySecret', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));


app.use(express.static(path.join(__dirname)));

// Rota inicial
app.get('/', (req, res) => {
    res.send(`
        <link rel="stylesheet" href="/style.css">
        <div class="container">
            <h1>Bem-vindo ao Sistema de Autenticação</h1>
            <a href="/login" class="button">Login</a>
        </div>
    `);
});

// Rota de Login
app.get('/login', (req, res) => {
    res.send(`
        <link rel="stylesheet" href="/style.css">
        <div class="container">
            <h2>Login</h2>
            <form action="/login" method="POST" class="form">
                <input type="text" name="username" placeholder="Username" required class="input">
                <input type="password" name="password" placeholder="Senha" required class="input">
                <button type="submit" class="button">Login</button>
            </form>
        </div>
    `);
});

// Rota de Logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Rota de Login (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username] === password) {
        req.session.user = username; // Armazena o usuário na sessão
        return res.redirect('/protected');
    }
    res.send(`
        <link rel="stylesheet" href="/style.css">
        <div class="container">
            <p>Usuário ou senha inválidos.</p>
            <a href="/login" class="button">Tente novamente</a>
        </div>
    `);
});

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Rota Protegida
app.get('/protected', authMiddleware, (req, res) => {
    res.send(`
        <link rel="stylesheet" href="/style.css">
        <div class="container">
            <h1>Bem-vindo, ${req.session.user}!</h1>
            <form action="/logout" method="POST">
                <button type="submit" class="button">Logout</button>
            </form>
        </div>
    `);
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
