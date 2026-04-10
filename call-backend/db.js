const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const db = new Database(path.join(__dirname, "call.db"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Create accounts table for login
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    name       TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'user',
    user_id    TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// ---- Simple password hashing (SHA-256 + salt) ----
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256").update(salt + password).digest("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const check = crypto.createHash("sha256").update(salt + password).digest("hex");
  return check === hash;
}

// ---- Seed default accounts ----
function seedAccounts() {
  const existing = db.prepare("SELECT COUNT(*) as count FROM accounts").get();
  if (existing.count > 0) return;

  const userAccounts = [
    { username: "user1", password: "password123", name: "Ahmad Fauzi", role: "user" },
    { username: "user2", password: "password123", name: "Siti Nurhaliza", role: "user" },
    { username: "user3", password: "password123", name: "Budi Santoso", role: "user" },
  ];

  const operatorAccounts = [
    { username: "operator", password: "admin123", name: "Operator Admin", role: "operator" },
  ];

  const insertAccount = db.prepare(
    "INSERT INTO accounts (username, password, name, role, user_id) VALUES (?, ?, ?, ?, ?)"
  );

  const allAccounts = [...userAccounts, ...operatorAccounts];

  const insertMany = db.transaction((accounts) => {
    for (const acc of accounts) {
      const userId = `${acc.role}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const hashedPw = hashPassword(acc.password);
      insertAccount.run(acc.username, hashedPw, acc.name, acc.role, userId);
      // Also create the user in the users table
      createUser(userId, acc.name);
    }
  });

  insertMany(allAccounts);
  console.log("✅ Seeded default accounts");
}

// ---- Account helpers ----
function login(username, password) {
  const account = db.prepare("SELECT * FROM accounts WHERE username = ?").get(username);
  if (!account) return null;
  if (!verifyPassword(password, account.password)) return null;
  return {
    id: account.user_id,
    username: account.username,
    name: account.name,
    role: account.role,
  };
}

function getAccountByUserId(userId) {
  return db.prepare("SELECT id, username, name, role, user_id FROM accounts WHERE user_id = ?").get(userId);
}

function getAllAccounts() {
  return db.prepare("SELECT id, username, name, role, user_id, created_at FROM accounts ORDER BY created_at").all();
}

// ---- User helpers ----

function createUser(id, name) {
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)"
  );
  stmt.run(id, name);
  return getUser(id);
}

function getUser(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function getAllUsers() {
  return db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
}

function deleteUser(id) {
  return db.prepare("DELETE FROM users WHERE id = ?").run(id);
}

// Run seed on startup
seedAccounts();

module.exports = { db, createUser, getUser, getAllUsers, deleteUser, login, getAccountByUserId, getAllAccounts };
