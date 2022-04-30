import bcrypt from "bcrypt";
import Client from "../database";

const { BCRYPT_PASSWORD, SALT_ROUNDS } = process.env;

export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
};

export type UpdateUser = {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
};

export type AuthUser = {
  username: string;
  password: string;
};

export class UserStore {
  async index(): Promise<User[]> {
    try {
      const sql = "SELECT * FROM users";
      const conn = await Client.connect();
      const result = await conn.query(sql);
      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`);
    }
  }

  async del(id: number) {
    try {
      const conn = await Client.connect();
      const sql = "DELETE FROM users WHERE id=($1)";
      await conn.query(sql, [id]);
      conn.release();
      return true;
    } catch (err) {
      throw new Error(`Could not delete user ${id}. Error: ${err}`);
    }
  }

  async update(user: UpdateUser): Promise<User> {
    const { id, username, firstName, lastName } = user;

    try {
      const conn = await Client.connect();
      const sql =
        "UPDATE users SET username = $1,firstname = $2, lastname = $3 WHERE id = $4 RETURNING *";
      const res = await conn.query(sql, [username, firstName, lastName, id]);

      conn.release();

      return res.rows[0];
    } catch (err) {
      throw new Error(`Could not update user with ID: ${id}. Error: ${err}`);
    }
  }

  async read(id: number): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM USERS WHERE id = $1";
      const result = await conn.query(sql, [id]);
      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not get user with ID: ${id}. Error: ${err}`);
    }
  }

  async create(user: User): Promise<User> {
    const { username, firstName, lastName, password } = user;

    try {
      const conn = await Client.connect();
      const sql =
        "INSERT INTO users (username, firstname, lastname, password_digest) VALUES($1, $2, $3, $4) RETURNING *";

      // @ts-ignore
      const hash = bcrypt.hashSync(password + BCRYPT_PASSWORD, parseInt(SALT_ROUNDS));

      const result = await conn.query(sql, [
        username,
        firstName,
        lastName,
        hash,
      ]);
      const user = result.rows[0];

      conn.release();

      return user;
    } catch (err) {
      throw new Error(`Could not create user ${username}. Error: ${err}`);
    }
  }

  async authenticate(auth: AuthUser): Promise<User | null> {
    const conn = await Client.connect();
    const sql = "SELECT id, password_digest FROM users WHERE username=($1)";

    const result = await conn.query(sql, [auth.username]);

    if (result.rows.length) {
      const user = result.rows[0];

      if (
        bcrypt.compareSync(
          auth.password + BCRYPT_PASSWORD,
          user.password_digest
        )
      ) {
        return user;
      }
    }

    return null;
  }
}
