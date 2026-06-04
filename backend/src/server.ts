import { createApp } from "./app";

const port = Number(process.env.PORT ?? "3000");
const app = createApp();

app.listen(port, () => {
  // Minimal startup log for local dev visibility.
  // eslint-disable-next-line no-console
  console.log(`Backend API running on http://localhost:${port}`);
});
