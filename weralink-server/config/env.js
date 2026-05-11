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
    DARAJA_SHORTCODE,
    DARAJA_CONSUMER_KEY,
    DARAJA_CONSUMER_SECRET,
    DARAJA_PASSKEY,
    APP_BASE_URL,
    DARAJA_SECURITY_CREDENTIAL,
    DARAJA_INITIATOR_NAME,
    DARAJA_B2C_PARTY_A
} = process.env

export const USE_MOCK_MPESA = false;
export const ENABLE_DEMO_CHEATSHEET = process.env.ENABLE_DEMO_CHEATSHEET === 'true';

export const isDevelopment = NODE_ENV === 'development'
export const isProduction = NODE_ENV === 'production'
export const isTest = NODE_ENV === 'test'