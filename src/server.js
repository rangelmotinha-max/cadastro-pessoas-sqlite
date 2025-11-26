const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware para JSON (para ler body das requisições)
app.use(express.json());

// Servir arquivos estáticos (front-end)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ROTAS API

// Listar todas as pessoas
app.get('/api/pessoas', (req, res) => {
  db.all('SELECT * FROM pessoas ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao listar pessoas' });
    }
    res.json(rows);
  });
});

// Buscar uma pessoa por ID
app.get('/api/pessoas/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM pessoas WHERE id = ?', [id], (err, row) => {
    if (err) {
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
      return res.status(500).json({ error: 'Erro ao excluir pessoa' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json({ success: true });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
