import { BaseCommand, BaseCommandInterface } from "../structures/BaseCommand";
import Client from "../structures/Client";
import { CommandContext } from "../structures/CommandContext";

export default class PingCommand
  extends BaseCommand
  implements BaseCommandInterface
{
  public constructor(client: Client) {
    super(client, {
      name: "ping",
      description: "Check the Bot latency.",
    });
  }

  public async execute(ctx: CommandContext): Promise<boolean> {
    await ctx.reply({
      content: `All systems operational ~ WS **${ctx.guild?.shard.latency}**ms`,
    });

    return true;
  }
}
