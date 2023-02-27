import "reflect-metadata"
import { DataSource } from "typeorm"
import { MovieORM } from "./movie.js"
import { 
  DATABASE_URL,
  PGPASSWORD,
  PGPORT,
  PGUSER,
  PGDATABASE,
  PGHOST
} from "./envVars.js"
//

export const AppDataSource = new DataSource({
  url: process.env.DATABASE_URL || DATABASE_URL,
  type: "postgres",
  host: process.env.PGHOST || PGHOST,
  port: parseInt(process.env.PGPORT) || parseInt(PGPORT),
  username: process.env.PGUSER || PGUSER,
  password: process.env.PGPASSWORD || PGPASSWORD,
  database: process.env.PGDATABASE || PGDATABASE,
  synchronize: false,
  logging: true,
  entities: [MovieORM],
  migrations: [],
  subscribers: [],
})