import config from "./config/index.js";
import app from "./app.js";
import { initDB } from "./db/index.js";

const main = async () => {
  try {
    await initDB();
    app.listen(config.port, () => {
      console.log(`Devpulse listening on port ${config.port}`);
    });
  } catch (error) {
    console.log("server failed to start", error);
  }
};

main();
