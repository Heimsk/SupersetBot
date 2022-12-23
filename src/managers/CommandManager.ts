import { BaseManager, BaseManagerInterface } from "../structures/BaseManager";
import Client from "../structures/Client";
import { promises as fs } from "fs";
import {
  BaseCommandInterface,
  BaseCommandOption,
  BaseCommandOptionChoice,
} from "../structures/BaseCommand";
import Path from "path";
import { APICommandInterface } from "../structures/APICommand";
import { Logger } from "tslog";

export default class CommandManager
  extends BaseManager
  implements BaseManagerInterface
{
  public logger: Logger<string>;

  public constructor(client: Client) {
    super(client, "CommandManager", true);

    this.logger = new Logger({
      name: "CommandManager",
    });
  }

  public async getCommands(path: string): Promise<Array<BaseCommandInterface>> {
    const commands: Array<BaseCommandInterface> = [];

    for (const file of await fs.readdir(path)) {
      const stats = await fs.lstat(`${path}/${file}`);

      if (stats.isDirectory()) {
        const cmds = await this.getCommands(`${path}/${file}`);

        for (const cmd of cmds) {
          commands.push(cmd);
        }
      } else {
        const Command = await import(
          Path.join(__dirname, "../..", `${path}/${file}`)
        );
        const command = new Command.default(this.client);
        commands.push(command);
      }
    }

    return commands;
  }

  public async registerCommand(
    command: BaseCommandInterface,
    guildID?: string
  ) {
    if (guildID) {
      await this.client.requestHandler.request(
        "POST",
        `/applications/${this.client.user.id}/guilds/${guildID}/commands`,
        true,
        command.format()
      );
    }

    this.logger.debug(`Registered command ${command.infos.name}`);
    return true;
  }

  public async getApiCommands(
    guildID?: string
  ): Promise<Array<APICommandInterface>> {
    return (await this.client.requestHandler.request(
      "GET",
      `/applications/${this.client.user.id}/guilds/${guildID}/commands`,
      true
    )) as Array<APICommandInterface>;
  }

  public areCommandsEqual(
    clientCommand:
      | BaseCommandInterface
      | Array<BaseCommandOption>
      | Array<BaseCommandOptionChoice>,
    APICommand:
      | APICommandInterface
      | Array<BaseCommandOption>
      | Array<BaseCommandOptionChoice>
  ): boolean {
    const ignoreList = [
      "id",
      "application_id",
      "version",
      "default_permission",
      "default_member_permissions",
      "guild_id",
    ];

    for (const ignore of ignoreList) {
      delete Object(APICommand)[ignore];
    }

    if (Object.keys(clientCommand).length !== Object.keys(APICommand).length)
      return false;

    for (const entrie of Object.entries(APICommand)) {
      if (!ignoreList.includes(entrie[0])) {
        const cmdEntrie = Object(clientCommand)[entrie[0]];

        if (Array.isArray(cmdEntrie) && Array.isArray(entrie[1])) {
          if (cmdEntrie.length !== entrie[1].length) return false;
          for (const item in cmdEntrie) {
            if (!this.areCommandsEqual(cmdEntrie[item], entrie[1][item]))
              return false;
          }

          return true;
        }

        if (
          cmdEntrie !== entrie[1] ||
          typeof cmdEntrie !== typeof entrie[1] ||
          cmdEntrie.length !== entrie[1].length
        )
          return false;
      }
    }
    return true;
  }

  public async init() {
    this.logger.info("Registering commands");
    const commands = await this.getCommands("./src/commands");
    const apiCommands = await this.getApiCommands(process.env.DEV_GUILD_ID);

    for (const command of commands) {
      if (command.infos.name) {
        const find = apiCommands.find(
          (n: APICommandInterface) => n.name == command.infos.name
        );

        if (find) {
          if (!this.areCommandsEqual(command.format(), find)) {
            await this.registerCommand(command, process.env.DEV_GUILD_ID);
          }
        } else {
          await this.registerCommand(command, process.env.DEV_GUILD_ID);
        }

        this.client.commands.set(command.infos.name, command);
      }
    }

    return true;
  }
}
