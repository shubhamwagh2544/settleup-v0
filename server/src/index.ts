import express, { Request, Response } from "express";
const app = express();

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is Healthy!",
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
