// server/src/db.js (ESM)
import sqlite3 from "sqlite3";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

sqlite3.verbose();
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "data.sqlite"); // DB file here

export const db = new sqlite3.Database(dbPath);

export const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

export const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

export const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
