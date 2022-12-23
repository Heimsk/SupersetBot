import Client from "./structures/Client";
import "dotenv/config";

(async () => {
  const client = new Client(process.env.TOKEN || "", {
    restMode: true,
    intents: 131071,
  });
  await client.init();
})();
