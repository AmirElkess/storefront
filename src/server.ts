import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors"

import productRoutes from "./handlers/product";
import userRoutes from "./handlers/user";
import orderRoutes from "./handlers/order";

const app: express.Application = express();
const port = 3000;
const address: string = `0.0.0.0:${port}`;

app.use(cors())
app.use(bodyParser.json());

app.get("/", function (req: Request, res: Response) {
  res.send("Server is working. go to /products");
});

productRoutes(app);
userRoutes(app);
orderRoutes(app);

app.listen(port, function () {
  console.log(`starting app on: ${address}`);
});

export default app;