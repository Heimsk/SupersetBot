import Client from "./Client";
import { CommandContext } from "./CommandContext";

export type COMMAND_OPTION_TYPES = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type COMMAND_TYPES = 1 | 2 | 3;

export interface BaseCommandInterface {
  client: Client;
  id: number;
  infos: BaseCommandInfos;
  options: Array<BaseCommandOption>;

  execute: (ctx: CommandContext) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format: () => any;
}

export interface BaseCommandInfos {
  name: string;
  description: string;
  type?: COMMAND_TYPES;
  nsfw?: boolean;
}

export interface BaseCommandOption {
  type?: COMMAND_OPTION_TYPES;
  name: string;
  description: string;
  required?: boolean;
  choices?: Array<BaseCommandOptionChoice>;
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
}

export interface BaseCommandOptionChoice {
  name: string;
  value: unknown;
}

export class BaseCommand {
  public client: Client;
  public id: number;
  public infos: BaseCommandInfos;
  public options: Array<BaseCommandOption>;

  public constructor(
    client: Client,
    infos: BaseCommandInfos,
    options?: Array<BaseCommandOption>
  ) {
    this.client = client;
    this.id = Math.floor(Math.random() * 999999);
    this.infos = infos;
    this.options = options || [];
  }

  public format() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedCommand: any = {};

    for (const info of Object.entries(this.infos)) {
      formattedCommand[info[0]] = info[1];
    }

    if (!formattedCommand.type) formattedCommand.type = 1;
    if (!formattedCommand.nsfw) formattedCommand.nsfw = false;

    for (const Option of this.options) {
      if (!formattedCommand.options) formattedCommand.options = [];
      const option: BaseCommandOption = {
        type: Option.type || 3,
        name: Option.name,
        description: Option.description,
      };

      if (Option.choices && Option.choices.length > 0)
        option.choices = Option.choices;
      if (Option.max_length) option.max_length = Option.max_length;
      if (Option.max_value) option.max_value = Option.max_value;
      if (Option.min_length) option.min_length = Option.min_length;
      if (Option.min_value) option.min_value = Option.min_value;
      if (Option.required != undefined) option.required = Option.required;

      formattedCommand.options.push(option);
    }

    return formattedCommand;
  }
}
