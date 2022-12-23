import Client from "./Client";

export interface BaseManagerInterface {
  name: string;
  startsAfterClient: boolean;
  init: () => Promise<boolean>;
}

export class BaseManager {
  public name: string;
  public startsAfterClient: boolean;
  public client: Client;

  public constructor(client: Client, name: string, startsAfterClient = false) {
    this.name = name;
    this.startsAfterClient = startsAfterClient;
    this.client = client;
  }
}
