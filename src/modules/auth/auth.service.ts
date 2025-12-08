import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config";



const createUser = async (payload: Record<string, unknown>) => {
  const { name, email, role, password, phone } = payload;
  if (!password || typeof password !== "string" || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  const hashPass = await bcrypt.hash(password as string, 8);
  const result = await pool.query(
    `INSERT INTO users(name, email, role, password, phone)
     VALUES($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email, role, hashPass, phone]
  );

  return result.rows[0];
};


const login = async (payload: { email: string; password: string }) => {
    const userData = await pool.query(`SELECT * FROM users WHERE email = $1`, [payload.email]);
    const data = userData.rows[0];

    if (!data) {
        throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(payload.password, data.password);

    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: data.id, email: data.email, role : data.role }, config.jwt_secret as string, { expiresIn: "1h" });

    return {token, data : { id: data.id, name: data.name, email: data.email, phone : data.phone , role: data.role }} ;
}



export const AuthService = {
    createUser,
    login,
};
