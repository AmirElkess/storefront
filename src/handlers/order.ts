import express from "express";
import verifyAuthToken from "../middleware/verifyAuthToken";
import { OrderStore, Order, Order_Product } from "../models/order";

const store = new OrderStore();

const orderByUser = async (req: express.Request, res: express.Response) => {
  //Current Order by user (args: user id)[token required]
  try {
    const user_id = req.params.id as unknown as number;
    const status = req.body.status as unknown as string;

    const order = await store.getOrderByUser(user_id, status);
    res.json(order);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const create = async (req: express.Request, res: express.Response) => {
  const user_id = req.body.user_id as number;
  const products = req.body.products as Order_Product[];

  const order: Order = {
    products,
    user_id,
  };

  try {
    const created_order: Order = await store.create(order);
    res.json(created_order);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const del = async (req: express.Request, res: express.Response) => {
  const order_id = req.params.id as unknown as number;

  try {
    const deleted_order: Order = await store.deleteOrder(order_id)
    res.json(deleted_order)
  } catch (err) {
    res.status(400)
    res.json(err)
  }


}

function orderRoutes(app: express.Application) {
  app.get("/user/:id/order", verifyAuthToken, orderByUser); //handles active and completed orders
  app.post("/order", create); //done
  app.delete("/order/:id", del) //del by product id
}

export default orderRoutes;
