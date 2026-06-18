import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

const db: DatabaseType = new Database('test.db', {
  readonly: false,
  fileMustExist: false,
  timeout: 5000,
});

const createSchema = `
  CREATE TABLE IF NOT EXISTS docs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    total_token INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token VARCHAR(35) UNIQUE NOT NULL,
    phonetic_token VARCHAR(12),
    alt_phonetic_token VARCHAR(12),
    idf_score REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS scores (
    token_id INTEGER NOT NULL,
    doc_id INTEGER NOT NULL,
    tf_score REAL NOT NULL,
    position BLOB,
  
    PRIMARY KEY (token_id, doc_id),
    FOREIGN KEY (token_id) REFERENCES vocabulary(id),
    FOREIGN KEY (doc_id) REFERENCES docs(id)
  );

  CREATE INDEX IF NOT EXISTS idx_vocabulary_phonetic ON vocabulary(phonetic_token);
`;

db.exec(createSchema);

export default db;
