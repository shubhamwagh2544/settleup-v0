import express, { Request, Response } from "express";
import { connect } from "./dbconn/dbconnect";
import { NODE_PORT } from "./config/config";

const app = express();

connect().then(() => console.log("Database connected"));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is Healthy!",
  });
});

app.listen(NODE_PORT, () => {
  console.log("Server is running on port 3000");
});
