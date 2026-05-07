import localtunnel from 'localtunnel';
import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load existing environment variables
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const PORT = parseInt(process.env.PORT, 10) || 5500;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000; // increased from 10s
const RETRY_DELAY_BASE = 2000; // exponential backoff base

console.log(`\n🌍 Starting Localtunnel on port ${PORT}...`);

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function createTunnelWithRetry() {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      console.log(`🔄 Attempt ${attempt} to create tunnel...`);

      const tunnelPromise = localtunnel({
        port: PORT,
        // Optional: stabilize URL if you want (may fail if taken)
        // subdomain: process.env.LT_SUBDOMAIN,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Localtunnel request timed out')), TIMEOUT_MS)
      );

      const tunnel = await Promise.race([tunnelPromise, timeoutPromise]);

      console.log(`✅ Tunnel created successfully!`);
      console.log(`🔗 Webhook URL: ${tunnel.url}`);
      console.log(`(Injected as APP_BASE_URL)\n`);

      return tunnel;

    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed:`, error);

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

(async () => {
  let tunnel;

  try {
    tunnel = await createTunnelWithRetry();

    process.env.APP_BASE_URL = tunnel.url;

    tunnel.on('close', () => {
      console.log('⚠️ Tunnel closed.');
    });

  } catch (error) {
    console.warn(`\n⚠️ Failed to start tunnel after retries.`);
    console.warn(`Full error:`, error);
    console.warn(`🚀 Falling back to localhost:${PORT}\n`);

    process.env.APP_BASE_URL = `http://localhost:${PORT}`;
  }

  console.log('📦 Starting Nodemon server...\n');

  const serverProcess = spawn('npx', ['nodemon', 'app.js'], {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    if (tunnel) tunnel.close();
    process.exit(code);
  });
})();