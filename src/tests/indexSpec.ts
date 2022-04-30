import supertest from "supertest";
import app from "../server";
import { User, AuthUser, UpdateUser, UserStore } from "../models/user";
import { Product, ProductStore } from "../models/product";
import { Order, OrderStore, Order_Product } from "../models/order";

const request = supertest(app);
let TOKEN: string; // for storing token returned during test user creation
let ID: number; //id of the created test user
let PRODUCT_ID: number;
let ORDER_ID: number;
const TEST_USER = {
  username: "test_3",
  firstname: "test_first",
  lastname: "test_last",
  password: "test_password_123",
};
const TEST_PRODUCT = {
  name: "test_product1",
  price: 12.432,
  category: "test_category",
};
let TEST_ORDER;

describe("Endpoints Testing Suite", () => {
  describe("Test user endpoints", () => {
    it("POSTs a new test user", async () => {
      const response = await request.post("/users").send(TEST_USER);
      TOKEN = response.body;
      expect(TOKEN).toBeDefined();
    });

    it("POSTs /users/authenticate", async () => {
      const response = await request
        .post("/users/authenticate")
        .send(TEST_USER);
      ID = response.body.id;
      expect(response.status).toBe(200);
    });

    it("GETs users index", async () => {
      const response = await request.get("/users").set("Authorization", TOKEN);
      expect(response.status).toBe(200);
    });

    it("GETs a specific user ", async () => {
      const response = await request
        .get(`/users/${ID}`)
        .set("Authorization", TOKEN);
      expect(response.body).toBeInstanceOf(Object);
    });

    it("PUTs updated user", async () => {
      const updated_user = {
        username: "updated_test",
        firstname: "updated_fname",
        lastname: "updated_lname",
      };
      const response = await request
        .put(`/users/${ID}`)
        .set("Authorization", TOKEN)
        .send(updated_user);

      expect(response.body.id).toBe(ID);
      expect(response.body.username).toBe(updated_user.username);
      expect(response.body.firstname).toBe(updated_user.firstname);
      expect(response.body.lastname).toBe(updated_user.lastname);
    });
  });

  describe("Test product endpoints", () => {
    it("GETs /products (products index)", async () => {
      const response = await request.get("/products");

      expect(response.status).toBe(200);
    });

    it("POSTs /products/create", async () => {
      const response = await request
        .post("/products/create")
        .set("Authorization", TOKEN)
        .send(TEST_PRODUCT);
      PRODUCT_ID = response.body.id;
      expect(response.body.name).toBe(TEST_PRODUCT.name);
      expect(response.body.price).toBe(TEST_PRODUCT.price.toString());
      expect(response.body.category).toBe(TEST_PRODUCT.category);

      expect(response.status).toBe(200);
    });

    it("GETs /products/:id", async () => {
      const response = await request.get(`/products/${PRODUCT_ID}`);

      expect(response.status).toBe(200);
    });

    it("PUTs /products/:id", async () => {
      const updated_product = {
        name: "updated_test_product",
        price: 15,
        category: "test_category",
      };
      const response = await request
        .put(`/products/${PRODUCT_ID}`)
        .send(updated_product);

      expect(response.body.name).toBe(updated_product.name);
      expect(Number(response.body.price)).toBe(updated_product.price);

      expect(response.status).toBe(200);
    });
  });

  describe("Test order endpoints", () => {
    it("POSTs /order", async () => {
      TEST_ORDER = {
        user_id: ID,
        products: [
          {
            product_id: PRODUCT_ID,
            quantity: 12,
          },
        ],
      };
      const response = await request.post(`/order`).send(TEST_ORDER);
      expect(response.status).toBe(200);
    });

    it("GETs /user/:id/order (get products by user)", async () => {
      const response = await request.get(`/user/${ID}/order`).send({
        status: "active",
      }).set("Authorization", TOKEN);

      ORDER_ID = response.body.id;
      expect(response.status).toBe(200);
    });
  });

  describe("DELETEs created test entries", () => {
    it("DELETEs created order", async () => {
      const response = await request.delete(`/order/${ORDER_ID}`);
      expect(response.status).toBe(200);
    });

    it("DELETEs created product", async () => {
      const response = await request.delete(`/products/${PRODUCT_ID}`);
      expect(response.status).toBe(200);
    });

    it("DELETEs created user", async () => {
      const response = await request
        .delete(`/users/${ID}`)
        .set("Authorization", TOKEN);
      expect(response.status).toBe(200);
    });
  });
});

describe("Models Testing Suite", () => {
  const userStore = new UserStore();
  const orderStore = new OrderStore();
  const productStore = new ProductStore();
  let modelOrderId: number;

  const model_user: User = {
    username: TEST_USER.username,
    firstName: TEST_USER.firstname,
    lastName: TEST_USER.lastname,
    password: TEST_USER.password,
  };

  const model_product: Product = {
    name: "model_test_product",
    price: 12.25,
    category: "model_test_category",
  };

  describe("Test user models", () => {
    it("creates a new test user", async () => {
      const response = await userStore.create(model_user);
      model_user.id = response.id as unknown as number;
      expect(response).toBeInstanceOf(Object);
    });

    it("gets users index", async () => {
      const response = await userStore.index();
      expect(response).toBeInstanceOf(Object);
    });

    it("gets the created test user ", async () => {
      const response = await userStore.read(model_user.id as unknown as number);
      expect(response).toBeInstanceOf(Object);
    });

    it("gets user authentication token", async () => {
      const auth: AuthUser = {
        username: TEST_USER.username,
        password: TEST_USER.password,
      };
      const response = await userStore.authenticate(auth);
      expect(response).toBeInstanceOf(Object);
    });

    it("PUTs updated user", async () => {
      const updated_user: UpdateUser = {
        id: model_user.id as unknown as number,
        username: "updated_test",
        firstName: "updated_fname",
        lastName: "updated_lname",
      };
      const response = await userStore.update(updated_user);
      expect(response).toBeInstanceOf(Object);
    });
  });

  describe("Test product models", () => {
    it("gets products index", async () => {
      const response = await productStore.index();
      expect(response).toBeInstanceOf(Object);
    });

    it("creates product", async () => {
      const response = await productStore.create(model_product);
      model_product.id = response.id as unknown as number;
      expect(response).toBeInstanceOf(Object);
    });

    it("gets product using id", async () => {
      const response = await productStore.read(
        model_product.id as unknown as number
      );
      expect(response).toBeInstanceOf(Object);
    });

    it("updates product", async () => {
      const updated_product: Product = {
        id: model_product.id,
        name: "model_test_product",
        price: model_product.price,
        category: model_product.category,
      };
      const response = await productStore.update(updated_product);

      expect(response.name).toBe(updated_product.name);
    });
  });

  describe("Test order models", () => {
    it("creates a new order", async () => {
      const model_order_product: Order_Product = {
        product_id: model_product.id as unknown as number,
        quantity: 12,
      };

      const model_order: Order = {
        products: [model_order_product],
        status: "active",
        user_id: model_user.id as unknown as number,
      };
      const response = await orderStore.create(model_order);
      model_order.id = response.id;
      modelOrderId = response.id as unknown as number;
      expect(response).toBeInstanceOf(Object);
    });

    it("gets products ordered by user", async () => {
      const user_id = model_user.id as unknown as number;
      const response = await orderStore.getOrderByUser(user_id, "active");

      expect(response).toBeInstanceOf(Object);
    });
  });

  describe("deletes created model test entries", () => {
    it("deletes created order", async () => {
      const res = await orderStore.deleteOrder(
        modelOrderId as unknown as number
      );
      expect(res).toBeInstanceOf(Object)
    });

    it("DELETEs created product", async () => {
      const res = await productStore.del(
        model_product.id as unknown as number
      );
      expect(res).toBeInstanceOf(Object);
    });

    it("DELETEs created user", async () => {
      const res = await userStore.del(model_user.id as unknown as number);
      expect(res).toBeTruthy();
    });
  });
});
