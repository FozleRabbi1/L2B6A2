import { pool } from "../../config/db";

const getUsers = async () => {
  const query = `
    SELECT id, name, email, phone, role
    FROM users;
  `;

  const result = await pool.query(query);
  return result.rows;
};

const getUserById = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0];
};


const updateUser = async (userId: string, payload: Record<string, unknown>) => {
    const id = Number(userId);
    if (isNaN(id)) throw new Error("Invalid user ID");

    const allowed = ["name", "email", "phone", "role"];
    const entries = Object.entries(payload).filter(([key]) =>
        allowed.includes(key)
    );

    if (entries.length === 0) {
        throw new Error("No valid fields provided for update");
    }
    const setQuery = entries
        .map(([key], i) => `${key} = $${i + 1}`)
        .join(", ");

    const values = entries.map(([, value]) => value);

    const query = `
        UPDATE users
        SET ${setQuery}
        WHERE id = $${entries.length + 1}
        RETURNING id, name, email, phone, role
    `;
    const result = await pool.query(query, [...values, id]);
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
