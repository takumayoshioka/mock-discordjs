import { test, vi } from "vitest"

import { Client } from "#src/virtualClass/client"
import { Events } from "#src/virtualClass/events"
import { Runtime } from "#src/runtime"
import {
  runScenario,
  type Scenario,
  type ScenarioChannel,
  type ScenarioUser,
} from "#src/scenario"

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

export { defineScenario } from "#src/scenario"
export const testScenario = <
  Channels extends readonly ScenarioChannel[],
  Users extends readonly ScenarioUser[],
>(
  boot: () => Promise<unknown>,
  scenario: Scenario<Channels, Users>,
  testBody: (
    messages:
      Map<Channels[number]["name"], [Users[number]["name"], string][]>
  ) => void,
) => {
  test(scenario.name, async () => {
    vi.resetModules()
    vi.doMock("discord.js", mockDiscord)
    const runtime = new Runtime()

    try {
      await runScenario(scenario, boot, runtime)

      const messages =
        new Map<Channels[number]["name"],
          [Users[number]["name"], string][]>()
      for (const ch of scenario.channels) {
        const channel = runtime.getChannelByName(ch.name)
        if (channel === undefined) {
          throw new Error(
            `${ch.name} was not created in running scenario`
          )
        }
        const messageAtChannel: [Users[number]["name"], string][] = []
        for (const message of runtime.getMessagesByChannel(channel).values()) {
          messageAtChannel.push(
            [message.author.username, message.content]
          )
        }

        messages.set(ch.name, messageAtChannel)
      }

      testBody(messages)
    } finally {
      vi.doUnmock("discord.js")
      vi.resetModules()
    }
  })
}

