// model
import Client from "../database";

export type Product = {
  id?: number;
  name: string;
  price: number;
  category: string;
};

export class ProductStore {
  async index(): Promise<Product[]> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM products";

      const result = await conn.query(sql);

      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(`Could not get products. Error: ${err}`);
    }
  }

  async create(product: Product): Promise<Product> {
    const { name, price, category } = product;
    try {
      const conn = await Client.connect();
      const sql =
        "INSERT INTO products (name, price, category) VALUES($1, $2, $3) RETURNING *";
      const result = await conn.query(sql, [name, price, category]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create product. Error: ${err}`);
    }
  }

  async read(id: number): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM products WHERE id=($1)";
      const result = await conn.query(sql, [id]);
      conn.release();

      return result.rows[0];
    } catch (err) {
      console.log(err);
      throw new Error(`Could not find product ${id}. Error: ${err}`);
    }
  }

  async update(product: Product): Promise<Product> {
    const { id, name, price, category } = product;

    try {
      const conn = await Client.connect();
      const sql =
        "UPDATE products SET name = $1, price = $2, category = $3 WHERE id = $4 RETURNING *";
      const result = await conn.query(sql, [name, price, category, id]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update product ${id}. Error: ${err}`);
    }
  }

  async del (id: number): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql =
        "DELETE FROM products WHERE id = $1 RETURNING *";
      const result = await conn.query(sql, [id]);
      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete product ${id}. Error: ${err}`);
    }
  }
}
