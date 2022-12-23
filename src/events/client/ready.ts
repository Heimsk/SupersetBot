import { BaseEvent, BaseEventInterface } from "../../structures/BaseEvent";
import Client from "../../structures/Client";

export default class ReadyEvent
  extends BaseEvent
  implements BaseEventInterface
{
  public constructor() {
    super("ready");
  }

  async execute(client: Client) {
    client.logger.debug(
      `Websocket connection initialized,logged in as ${client.user.username}`
    );
    return true;
  }
}
