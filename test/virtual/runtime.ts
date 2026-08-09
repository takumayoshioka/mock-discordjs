import { Events } from "#test/virtual/events"
import { User } from "#test/virtual/user"
import { Message } from "#test/virtual/message"
import { Client } from "#test/virtual/client"
import { TextChannel } from "#test/virtual/textChannel"

let runtime: Runtime | undefined

export const getRuntime = () => {
  if (runtime === undefined) {
    throw new Error("Discord is not initialized")
  }

  return runtime
}

export class Runtime {
  private botClient: Client | undefined = undefined
  private readonly usersByID = new Map<string, User>()
  private readonly channelsByID = new Map<string, TextChannel>()
  private readonly messageByChannel =
    new Map<string, Map<string, Message>>()

  constructor() {
    runtime = this
  }

  private lastID = 0
  createID = () => {
    this.lastID += 1
    return this.lastID.toString()
  }

  register = (client: Client) => {
    if (this.botClient === undefined) {
      this.botClient = client
    } else {
      throw new Error("Bot client is already registered.")
    }
  }

  getBotClient = () => {
    if (this.botClient === undefined) {
      throw new Error("Bot client is not online")
    }

    return this.botClient
  }

  createUser = (name: string, bot: boolean) => {
    const id = this.createID()
    const user = new User(id, name, bot)
    this.usersByID.set(id, user)
    return user
  }

  createTextChannel = () => {
    const id = this.createID()
    const channel = new TextChannel(id, this)
    this.channelsByID.set(id, channel)
    this.messageByChannel.set(id, new Map<string, Message>())
    return channel
  }

  publish = async (eventName: string, ...args: unknown[]) => {
    if (this.botClient === undefined) { return }
    await this.botClient.subscribe(eventName, ...args)
  }

  sendMessage = async (
    author: User, content: string, channel: TextChannel
  ) => {
    const message = new Message(
      this.createID(), author, content, channel
    )
    const messageMap = this.messageByChannel.get(message.channel.id)
    if (messageMap === undefined) {
      throw new Error("Cannot send any message to non-existing channel")
    }
    messageMap.set(message.id, message)
    this.messageByChannel.set(message.channel.id, messageMap)
    await this.publish(Events.MessageCreate, message)
  }

  getChannelByID = (id: string) => {
    return this.channelsByID.get(id)
  }

  getMessagesByChannel = (channel: TextChannel) => {
    const messages = this.messageByChannel.get(channel.id)
    if (messages === undefined) {
      throw new Error(`${TextChannel.name} does not exist`)
    }
    return messages
  }
}
