import { createApp } from "./app";
import { config } from "./config/env";

const app = createApp();

app.listen(config.port, () => {
  console.log(`[MiniLedger API] Server listening on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`[MiniLedger API] Health check available at http://localhost:${config.port}/api/health`);
});
