const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do arquivo do banco
const dbPath = path.resolve(__dirname, '..', 'database.sqlite');

// Cria/abre o banco
const db = new sqlite3.Database(dbPath);

// Cria a tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pessoas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      data_nascimento TEXT
    )
  `);
});

module.exports = db;
