import pool from "../db/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT id, full_name, email, phone, password_hash, role, is_active, is_verified, created_at
    FROM users
    WHERE email = $1
    `,
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
};

export const findUserByPhone = async (phone) => {
  const result = await pool.query(
    `
    SELECT id
    FROM users
    WHERE phone = $1
    `,
    [phone]
  );

  return result.rows[0] || null;
};

export const createUser = async ({ full_name, email, phone, passwordHash, role }) => {
  const result = await pool.query(
    `
    INSERT INTO users (full_name, email, phone, password_hash, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, full_name, email, phone, role, is_active, is_verified, created_at
    `,
    [full_name, email.toLowerCase(), phone || null, passwordHash, role]
  );

  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT id, full_name, email, phone, role, is_active, is_verified, created_at, updated_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};