import { User } from "#src/virtualClass/user"
import { TextChannel } from "#src/virtualClass/textChannel"

export class Message {
  constructor(
    readonly id: string,
    readonly author: User,
    readonly content: string,
    readonly channel: TextChannel
  ) { }
}