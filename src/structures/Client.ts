import { Client as ErisClient, ClientOptions, Collection } from "eris";
import { promises as fs } from "fs";
import { BaseCommand } from "./BaseCommand";
import { BaseManagerInterface } from "./BaseManager";
import { Logger } from "tslog";

export default class Client extends ErisClient {
  public commands: Collection<BaseCommand>;
  public logger: Logger<string>;

  public constructor(token: string, options?: ClientOptions) {
    super(token, options);

    this.logger = new Logger({
      name: "Client",
    });
    this.commands = new Collection(BaseCommand);
  }

  public async loadManagers() {
    const managers = await fs.readdir("./src/managers");
    const scheduledManagers: Array<BaseManagerInterface> = [];
    this.logger.info("Loading managers");

    if (managers.length > 0) {
      for (const imanager of managers) {
        const Manager = await import(`../managers/${imanager}`);
        const manager = new Manager.default(this);

        if (manager.startsAfterClient) {
          scheduledManagers.push(manager);
        } else {
          await manager.init();
          this.logger.debug(`Manager ${manager.name} loaded.`);
        }
      }
    }

    super.on("ready", async () => {
      this.logger.info("Loading scheduled managers.");
      for (const manager of scheduledManagers) {
        await manager.init();
        this.logger.debug(`Manager ${manager.name} loaded.`);
      }
    });
  }

  public async init() {
    await this.loadManagers();
    this.logger.info("Initializing websocket connection.");
    await this.connect();
  }
}
