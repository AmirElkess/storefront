import Client from "../database";

export type Order_Product = {
  product_id: number;
  quantity: number;
};

export type Order = {
  id?: number;
  products: Order_Product[];
  status?: string;
  user_id: number;
};

export class OrderStore {
  async create(order: Order): Promise<Order> {
    const conn = await Client.connect();

    const order_sql =
      "INSERT INTO orders (status, user_id) VALUES ('active', $1) RETURNING *";
    const order_res = await conn.query(order_sql, [order.user_id]);
    const order_id = order_res.rows[0].id;

    const order_products_sql =
      "INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *";

    let added_products: Order_Product[] = [];
    for (let product of order.products) {
      let prod = await conn.query(order_products_sql, [
        product.quantity,
        order_id,
        product.product_id,
      ]);
      added_products.push(prod.rows[0]);
    }

    conn.release();

    const full_order: Order = {
      id: order_id,
      products: added_products,
      status: order_res.rows[0].status,
      user_id: order_res.rows[0].user_id,
    };

    return full_order;
  }

  async deleteOrder(order_id: number): Promise<Order> {
    try {
      const conn = await Client.connect();
      const sql1 = "DELETE FROM order_products WHERE order_id=($1)"
      const sql2 = "DELETE FROM orders WHERE id=($1) RETURNING *"
      await conn.query(sql1, [order_id])
      const res = await conn.query(sql2, [order_id])
      conn.release();
      return res.rows[0]
    } catch (err) {
      throw new Error(`Could not delete order ${order_id}. Error: ${err}`)
    }
  }

  async getOrderByUser(user_id: number, status: string): Promise<Order> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM orders WHERE user_id=$1 AND status=$2";
      const res = await conn.query(sql, [user_id, status]);
      const order = res.rows[0];

      if (order == undefined) {
        console.log("order undefined");
      }

      const products_sql =
        "SELECT product_id, quantity FROM order_products WHERE order_id=($1)";
      const products_res = await conn.query(products_sql, [order.id]);

      conn.release();

      const order_result: Order = {
        id: order.id,
        products: products_res.rows,
        status: order.status,
        user_id,
      };

      return order_result;
    } catch (err) {
      throw new Error(`Could not get ${status} order by user id: ${user_id}. Error: ${err}`)

    }
  }
}
