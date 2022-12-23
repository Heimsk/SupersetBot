import Client from "../structures/Client";
import { promises as fs } from "fs";
import { BaseManager, BaseManagerInterface } from "../structures/BaseManager";

export default class EventManager
  extends BaseManager
  implements BaseManagerInterface
{
  public constructor(client: Client) {
    super(client, "EventManager");
  }

  async init() {
    for (const dir of await fs.readdir("./src/events")) {
      for (const file of await fs.readdir(`./src/events/${dir}`)) {
        const Event = await import(`../events/${dir}/${file}`);
        const event = new Event.default();

        if (event.trigger) {
          this.client.on(event.trigger, event.execute.bind(null, this.client));
        }
      }
    }

    return true;
  }
}
