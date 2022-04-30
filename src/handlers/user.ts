import express from "express";
import { User, AuthUser, UpdateUser, UserStore } from "../models/user";
import jwt from "jsonwebtoken";
import verifyAuthToken from "../middleware/verifyAuthToken";

const store = new UserStore();
const { TOKEN_SECRET } = process.env;

const index = async (req: express.Request, res: express.Response) => {

  try {
    const users: User[] = await store.index();
    res.json(users);
  } catch (err) {
    res.status(400);
    res.json(`Could not index users. Error: ${err}`);
  }
};

const create = async (req: express.Request, res: express.Response) => {
  const username = req.body.username as unknown as string;
  const firstName = req.body.firstname as unknown as string;
  const lastName = req.body.lastname as unknown as string;
  const password = req.body.password as unknown as string;

  const user: User = {
    username,
    firstName,
    lastName,
    password,
  };

  try {
    const newUser = await store.create(user);
    var token = jwt.sign({ user: newUser }, TOKEN_SECRET as string);
    res.json(token);
  } catch (err) {
    res.status(400);
    res.json(`Could not verify ${user}. Error: ${err}`);
  }
};

const read = async (req: express.Request, res: express.Response) => {
  const id = req.params.id as unknown as number;

  try {
    const user: User = await store.read(id);
    res.json(user);
  } catch (err) {
    res.status(400);
    res.json(`Could not read user with ID: ${id}. Error: ${err}`);
  }
};

const update = async (req: express.Request, res: express.Response) => {
  const id = req.params.id as unknown as number;
  const username = req.body.username as unknown as string;
  const firstName = req.body.firstname as unknown as string;
  const lastName = req.body.lastname as unknown as string;

  try {
    const user: UpdateUser = {
      id,
      username,
      firstName,
      lastName,
    };

    const updatedUser: User = await store.update(user);

    res.json(updatedUser);
  } catch (err) {
    res.status(400);
    res.json(`Could not update user with ID: ${id}. Error: ${err}`);
  }
};

const authenticate = async (req: express.Request, res: express.Response) => {
  const username = req.body.username as unknown as string;
  const password = req.body.password as unknown as string;

  try {
    const user: AuthUser = { username, password };
    const Autheduser: User | null = await store.authenticate(user);


    if (user === null) {
      res.status(401);
      res.send(`could not authenticate ${username}.`);
      return false;
    }

    var token = jwt.sign({ user: Autheduser }, TOKEN_SECRET as string);

    res.json({
      id: Autheduser?.id,
      token,
    });
  } catch (e) {
    res.status(400);
    res.json(e);
  }
};

const del = async (req: express.Request, res: express.Response) => {
  const id = req.params.id as unknown as number;

  try {
    await store.del(id);

    res.send(`Deleted user with id: ${id}`);
  } catch (err) {
    res.status(400);
    res.json(`Could not delete user with ID: ${id}. Error: ${err}`);
  }
};

function userRoutes(app: express.Application) {
  app.get("/users", verifyAuthToken, index); //done //tested
  app.post("/users", create); //done //tested
  app.get("/users/:id", verifyAuthToken, read); //done //tested
  app.put("/users/:id", verifyAuthToken, update); //done //tested
  app.delete("/users/:id", verifyAuthToken, del); //done
  app.post("/users/authenticate", authenticate); //done //tested
}

export default userRoutes;
