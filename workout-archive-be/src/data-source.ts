import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import dotenv from "dotenv";

// 환경변수 로드
dotenv.config();

console.log("DB_PASSWORD loaded:", process.env.DB_PASSWORD ? "YES (Type: " + typeof process.env.DB_PASSWORD + ")" : "NO");

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: ["src/entities/**/*.ts"],
  namingStrategy: new SnakeNamingStrategy(), // 인스턴스를 직접 설정
});

