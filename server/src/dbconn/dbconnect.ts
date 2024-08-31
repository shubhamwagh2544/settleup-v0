import { Sequelize } from "sequelize-typescript";
import { POSTGRES_URL } from "../config/config";

const sequelize = new Sequelize(POSTGRES_URL as string);

export async function connect() {
  try {
    await sequelize.authenticate();
  } catch (error) {
    await sequelize.close();
    console.error("Unable to connect to the database:", error);
  }
}
