import localtunnel from 'localtunnel';
import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load existing environment variables
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const PORT = parseInt(process.env.PORT, 10) || 5500;

console.log(`\n🌍 Starting Localtunnel on port ${PORT}...`);

(async () => {
  let tunnel;
  try {
    // Attempt to start localtunnel with a timeout
    const tunnelPromise = localtunnel({ port: PORT });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Localtunnel request timed out')), 10000)
    );

    tunnel = await Promise.race([tunnelPromise, timeoutPromise]);
    
    console.log(`✅ Tunnel created successfully!`);
    console.log(`🔗 Webhook URL: ${tunnel.url}`);
    console.log(`(This URL will be automatically injected as APP_BASE_URL)\n`);
    
    process.env.APP_BASE_URL = tunnel.url;

    tunnel.on('close', () => {
      console.log('⚠️ Tunnel closed.');
    });

  } catch (error) {
    console.warn(`\n⚠️ Failed to start tunnel: ${error.message}`);
    console.warn(`🚀 Starting server on localhost:${PORT} without external webhook support.\n`);
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
