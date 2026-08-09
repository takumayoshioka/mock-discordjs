import { Runtime } from "#test/virtual/runtime"

export class Discord {
  private runtime = new Runtime()

  get botClient() {
    return this.runtime.getBotClient()
  }
  createUser = this.runtime.createUser
  createTextChannel = this.runtime.createTextChannel
  sendMessage = this.runtime.sendMessage
}