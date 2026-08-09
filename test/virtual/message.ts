import { User } from "#test/virtual/user"
import { TextChannel } from "#test/virtual/textChannel"

export class Message {
  constructor(
    readonly id: string,
    readonly author: User,
    readonly content: string,
    readonly channel: TextChannel
  ) { }
}