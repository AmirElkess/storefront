import express from "express";
import verifyAuthToken from "../middleware/verifyAuthToken";
import { Product, ProductStore } from "../models/product";

const store = new ProductStore();

const index = async (req: express.Request, res: express.Response) => {
  try {
    const products: Product[] = await store.index();
    res.json(products);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const create = async (req: express.Request, res: express.Response) => {
  try {
    const name = req.body.name as unknown as string;
    const price = req.body.price as unknown as number;
    const category = req.body.category as unknown as string;

    const product: Product = await store.create({ name, price, category });

    res.json(product);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const read = async (req: express.Request, res: express.Response) => {
  try {
    const id = req.params.id as unknown as number;
    const product: Product = await store.read(id);

    res.json(product);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const del = async (req: express.Request, res: express.Response) => {
  try {
    const id = req.params.id as unknown as number;

    const product: Product = await store.del(id);

    res.json(product);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const update = async (req: express.Request, res: express.Response) => {
  try {
    const id = req.params.id as unknown as number;
    const name = req.body.name as unknown as string;
    const price = req.body.price as unknown as number;
    const category = req.body.category as unknown as string;

    //updatedProduct contains the original product id, and the updated parameters (name, price, category)
    const updatedProduct: Product = {
      id,
      name,
      price,
      category,
    };

    const product: Product = await store.update(updatedProduct);

    res.json(product);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

function productRoutes(app: express.Application) {
  app.get("/products", index); //tested
  app.post("/products/create", verifyAuthToken, create); //tested
  app.get("/products/:id", read); //tested
  app.put("/products/:id", update); //tested
  app.delete("/products/:id", del); //tested
}

export default productRoutes;
