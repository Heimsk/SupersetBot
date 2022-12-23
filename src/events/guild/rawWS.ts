import { BaseEvent, BaseEventInterface } from "../../structures/BaseEvent";
import Client from "../../structures/Client";
import { CommandContext } from "../../structures/CommandContext";

export default class rawWS extends BaseEvent implements BaseEventInterface {
  public constructor() {
    super("rawWS");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(client: Client, event: any): Promise<boolean> {
    if (event.t !== "INTERACTION_CREATE") return false;
    const ctx = new CommandContext(event, client);
    await ctx.loadData();

    if (ctx.command) {
      await ctx.command.execute(ctx);
    }

    return true;
  }
}
