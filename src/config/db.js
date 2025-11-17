import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,     // 👈 corregido
  database: process.env.DB_NAME,     // 👈 corregido
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('Conexión a la base de datos exitosa');
