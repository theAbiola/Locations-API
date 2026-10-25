import "dotenv/config";
import { connectDB } from "./db/db.js";
import { createApp } from "./app.js";
import { bootstrapAdmin } from "./services/bootstrapAdmin.js";

const PORT = process.env.API_PORT;

await connectDB();
await bootstrapAdmin();

export const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on port http://localhost:${PORT}`);
});
