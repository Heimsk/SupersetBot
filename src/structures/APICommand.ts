export interface APICommandInterface {
  name: string;
  name_localizations: unknown;
  description: string;
  description_localizations: unknown;
  options: Array<unknown>;
  default_member_permission: string;
  default_permission: boolean;
  type: string;
  nsfw: boolean;
}
