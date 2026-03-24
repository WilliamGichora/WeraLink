import { config } from 'dotenv'

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` })

export const {
    NODE_ENV,
    PORT,
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
} = process.env

export const isDevelopment = NODE_ENV === 'development'
export const isProduction = NODE_ENV === 'production'
export const isTest = NODE_ENV === 'test'