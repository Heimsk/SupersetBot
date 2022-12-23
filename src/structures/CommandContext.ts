import { AnyGuildChannel, Guild, Member, User } from "eris";
import { BaseCommandInterface } from "./BaseCommand";
import Client from "./Client";

export type RESPONSE_TYPES = 1 | 4 | 5 | 6 | 7 | 8 | 9;
export interface ResponseData {
  tts?: boolean;
  content?: string;
  embeds?: Array<unknown>;
  flags?: number;
  components?: Array<unknown>;
  attachments?: Array<unknown>;
}

export class CommandContext {
  #client: Client;

  public rawData: unknown;
  public token: string;
  public id: string;
  public guild?: Guild;
  public guildID?: string;
  public channelID?: string;
  public channel?: AnyGuildChannel;
  public authorID: string;
  public member?: Member;
  public author?: User;
  public command?: BaseCommandInterface;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(packet: any, client: Client) {
    const data = packet.d;
    this.#client = client;

    this.rawData = data;
    this.token = data.token;
    this.id = data.id;
    this.authorID = data.member.user.id;
    this.author = this.#client.users.get(this.authorID);
    this.command = this.#client.commands.get(
      data.data.name
    ) as BaseCommandInterface;

    if (data.guild_id) {
      this.guildID = data.guild_id;
      this.guild = this.#client.guilds.get(this.guildID as string);
    }
    if (data.channel_id) {
      this.channelID = data.channel_id;

      if (this.guild) {
        this.channel = this.guild.channels.get(this.channelID as string);
      }
    }

    if (this.guild) {
      this.member = this.guild.members.get(this.authorID);
    }
  }

  public async loadData() {
    if (this.guildID && !this.guild) {
      this.guild = await this.#client.getRESTGuild(this.guildID as string);
    }

    if (this.guild && this.channelID && !this.channel) {
      this.channel = await (
        await this.guild.getRESTChannels()
      ).find((ch) => ch.id == this.channelID);
    }

    if (!this.member && this.guild) {
      this.member = await this.guild?.getRESTMember(this.authorID);
    }

    if (!this.author) {
      this.author = await this.#client.getRESTUser(this.authorID);
    }
  }

  public async reply(data: ResponseData, type?: RESPONSE_TYPES) {
    return await this.#client.requestHandler.request(
      "POST",
      `/interactions/${this.id}/${this.token}/callback`,
      true,
      {
        type: type || 4,
        data: { ...data },
      }
    );
  }
}
