import Client from "./Client";

export interface BaseEventInterface {
  trigger: string;
  execute: (client: Client, ...args: never[]) => Promise<boolean>;
}

export class BaseEvent {
  public trigger: string;

  public constructor(trigger: string) {
    this.trigger = trigger;
  }
}
