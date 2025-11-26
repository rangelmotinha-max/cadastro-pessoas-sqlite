const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// ========== MIDDLEWARES BÁSICOS ==========

// Para ler JSON (usado na API)
app.use(express.json());

// Para ler dados de formulários (login: application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Sessão
app.use(
  session({
    secret: 'night-123-super-secreto', // em produção use algo mais forte
    resave: false,
    saveUninitialized: false
  })
);

// ========== ROTAS DE AUTENTICAÇÃO (NÃO EXIGEM LOGIN) ==========

// Página de login (primeira tela ao acessar o site)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Processar login
app.post('/login', (req, res) => {
  const { login, senha } = req.body;

  // Credenciais fixas por enquanto
  if (login === 'night' && senha === '123') {
    req.session.autenticado = true;
    return res.redirect('/cadastro');
  }

  // Se der errado, volta para login com indicador de erro
  return res.redirect('/?erro=1');
});

// Logout (opcional, já deixo pronto)
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ========== ARQUIVOS ESTÁTICOS (CSS, JS, HTML etc.) ==========
app.use(express.static(path.join(__dirname, '..', 'public')));

// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========

function autenticar(req, res, next) {
  if (req.session && req.session.autenticado) {
    return next();
  }
  return res.redirect('/');
}

// ========== PÁGINA DE CADASTRO (PROTEGIDA) ==========

// Só acessa /cadastro se estiver autenticado
app.get('/cadastro', autenticar, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Todas as rotas que começam com /api exigem login
app.use('/api', autenticar);

// ========== ROTAS DA API (CRUD PESSOAS + BUSCA) ==========

// Listar todas as pessoas
app.get('/api/pessoas', (req, res) => {
  db.all('SELECT * FROM pessoas ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      console.error('ERRO AO LISTAR PESSOAS:', err);
      return res.status(500).json({ error: 'Erro ao listar pessoas' });
    }
    res.json(rows);
  });
});

// Buscar pessoas por nome (filtro)
// Exemplo: GET /api/pessoas/busca?nome=jo
app.get('/api/pessoas/busca', (req, res) => {
  const { nome } = req.query; // pega ?nome=...
  const termo = (nome || '').trim();

  if (!termo) {
    // Se não vier nome, devolve lista vazia
    return res.json([]);
  }

  const sql = `
    SELECT *
    FROM pessoas
    WHERE nome LIKE ?
    ORDER BY id ASC
  `;

  const parametro = `%${termo}%`;

  db.all(sql, [parametro], (err, rows) => {
    if (err) {
      console.error('ERRO SQLITE NA BUSCA:', err);
      return res.status(500).json({
        error: 'Erro ao buscar pessoas por nome',
        details: err.message || String(err)
      });
    }
    res.json(rows);
  });
});

// Buscar uma pessoa por ID
app.get('/api/pessoas/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM pessoas WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('ERRO AO BUSCAR PESSOA POR ID:', err);
      return res.status(500).json({ error: 'Erro ao buscar pessoa' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }
    res.json(row);
  });
});

// Incluir pessoa
app.post('/api/pessoas', (req, res) => {
  const { nome, email, telefone, data_nascimento } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const sql = `
    INSERT INTO pessoas (nome, email, telefone, data_nascimento)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [nome, email, telefone, data_nascimento], function (err) {
    if (err) {
      console.error('ERRO AO INCLUIR PESSOA:', err);
      return res.status(500).json({ error: 'Erro ao incluir pessoa' });
    }

    res.status(201).json({
      id: this.lastID,
      nome,
      email,
      telefone,
      data_nascimento
    });
  });
});

// Alterar pessoa
app.put('/api/pessoas/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, data_nascimento } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const sql = `
    UPDATE pessoas
    SET nome = ?, email = ?, telefone = ?, data_nascimento = ?
    WHERE id = ?
  `;

  db.run(sql, [nome, email, telefone, data_nascimento, id], function (err) {
    if (err) {
      console.error('ERRO AO ALTERAR PESSOA:', err);
      return res.status(500).json({ error: 'Erro ao alterar pessoa' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json({
      id,
      nome,
      email,
      telefone,
      data_nascimento
    });
  });
});

// Excluir pessoa
app.delete('/api/pessoas/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM pessoas WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('ERRO AO EXCLUIR PESSOA:', err);
      return res.status(500).json({ error: 'Erro ao excluir pessoa' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json({ success: true });
  });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
