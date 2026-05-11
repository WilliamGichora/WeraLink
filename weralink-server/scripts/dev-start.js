import localtunnel from 'localtunnel';
import ngrok from '@ngrok/ngrok';
import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load existing environment variables
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const PORT = parseInt(process.env.PORT, 10) || 5500;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 40000;
const RETRY_DELAY_BASE = 2000;

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function createLocaltunnel() {
  console.log(`\n🌍 Starting Localtunnel on port ${PORT}...`);
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      console.log(`🔄 Attempt ${attempt} to create localtunnel...`);

      const tunnelPromise = localtunnel({ port: PORT });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Localtunnel request timed out')), TIMEOUT_MS)
      );

      const tunnel = await Promise.race([tunnelPromise, timeoutPromise]);

      console.log(`✅ Localtunnel created successfully!`);
      
      return {
        url: tunnel.url,
        cleanup: () => tunnel.close()
      };
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message || error);

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
        console.log(`⏳ Retrying in ${delay / 1000}s...\n`);
        await wait(delay);
      } else {
        throw error;
      }
    }
  }
}

async function createNgrokTunnel() {
  console.log(`\n🌍 Attempting ngrok fallback on port ${PORT}...`);
  if (!process.env.NGROK_AUTHTOKEN) {
    throw new Error("NGROK_AUTHTOKEN is missing in .env.development.local");
  }

  try {
    const session = await ngrok.forward({
      addr: PORT,
      authtoken: process.env.NGROK_AUTHTOKEN
    });

    console.log(`✅ ngrok tunnel created successfully!`);

    return {
      url: session.url(),
      cleanup: async () => {
        await session.close();
      }
    };
  } catch (error) {
    console.warn(`⚠️ ngrok failed:`, error.message || error);
    throw error;
  }
}

(async () => {
  let activeTunnel = null;

  try {
    try {
      activeTunnel = await createNgrokTunnel();
    } catch (ngrokError) {
      console.warn(`\n❌ Ngrok failed completely or Authtoken missing. Attempting fallback...`);
      // Secondary: Localtunnel
      activeTunnel = await createLocaltunnel();
    }

    process.env.APP_BASE_URL = activeTunnel.url;
    console.log(`🔗 Webhook URL: ${activeTunnel.url}`);
    console.log(`(Injected as APP_BASE_URL)\n`);
  } catch (error) {
    console.warn(`\n⚠️ All tunnel attempts failed.`);
    console.warn(`Full error:`, error.message || error);
    console.warn(`🚀 Falling back to localhost:${PORT}\n`);

    process.env.APP_BASE_URL = `http://localhost:${PORT}`;
  }

  console.log('📦 Starting Nodemon server...\n');

  const serverProcess = spawn('npx', ['nodemon', 'app.js'], {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });

  serverProcess.on('close', async (code) => {
    console.log(`Server process exited with code ${code}`);
    if (activeTunnel && activeTunnel.cleanup) {
      await activeTunnel.cleanup();
    }
    process.exit(code);
  });
})();