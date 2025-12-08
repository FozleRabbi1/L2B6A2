import { pool } from "../../config/db";
import bcrypt from "bcryptjs";





const getUsers = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result.rows;
};

const getUserById = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0];
};

const updateUser = async (id: string, name: string, email: string) => {
  const result = await pool.query(
    `UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,
    [name, email, id]
  );
  return result.rows[0];
};

const deleteUser = async (id: string) => {
  const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
  return result;
};

export const userService = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
