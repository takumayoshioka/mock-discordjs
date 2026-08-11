import { Message } from "#src/virtualClass/message"
import { Runtime } from "#src/runtime"

export class TextChannel {
  constructor(
    readonly id: string,
    readonly name: string,
    private readonly runtime: Runtime
  ) {
  }

  private createFetch = () => {
    const channel = this
    function fetch(): Map<string, Message>
    function fetch(id: string): Message
    function fetch(id?: string) {
      const messages = channel.runtime.getMessagesByChannel(channel)
      if (id === undefined) {
        return messages
      } else {
        const message = messages.get(id)
        if (message === undefined) {
          throw new Error("Unknown message")
        }
        return message
      }
    }
    return fetch
  }

  readonly messages = {
    fetch: this.createFetch()
  }

  get client() {
    return this.runtime.getBotClient()
  }

  send = async (content: string) => {
    const user = this.client.user
    if (user === undefined) {
      throw new Error("Offline bot can send no message")
    }
    this.runtime.sendMessage(user, content, this)
  }
}