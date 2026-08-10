import { test, vi } from "vitest"

import { Client } from "#src/virtualClass/client"
import { Events } from "#src/virtualClass/events"
import { Runtime } from "#src/runtime"

const mockDiscord = () => {
  return {
    Client,
    Events,
  }
}

class Discord {
  private runtime = new Runtime()

  get botClient() {
    return this.runtime.getBotClient()
  }

  createUser = this.runtime.createUser
  createTextChannel = this.runtime.createTextChannel
  sendMessage = this.runtime.sendMessage
}

export const testDiscord = (
  name: string,
  body: (discord: Discord) => Promise<void> | void
) => {
  test(name, async () => {
    vi.resetModules()
    vi.doMock("discord.js", mockDiscord)

    const discord = new Discord()

    try {
      await body(discord)
    } finally {
      vi.doUnmock("discord.js")
      vi.resetModules()
    }
  })
}