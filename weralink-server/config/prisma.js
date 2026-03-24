import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../generated/prisma/index.js";
import { DATABASE_URL } from './env.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;