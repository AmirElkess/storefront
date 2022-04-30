import express from "express";
import jwt from "jsonwebtoken";

const verifyAuthToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { TOKEN_SECRET } = process.env;
    const authorizationHeader = req.headers.authorization as unknown as string;
    const token = authorizationHeader.split(" ")[1];
    const decoded = jwt.verify(authorizationHeader, TOKEN_SECRET as string);
    
    if (!decoded) {
      new Error("Could not verify token")
    }

    next();
  } catch (error) {
    res.status(401);
    res.json("invalid token")
  }
};

export default verifyAuthToken;
