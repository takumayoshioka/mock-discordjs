import { defineScenario, testScenario } from "@takumayoshioka/mock-discordjs"
import { expect } from "vitest"

const scenario1 = defineScenario("echo bot single channel")
  .channels([{ name: "random" }])
  .users([
    { name: "Alice", bot: false },
    { name: "Bob", bot: false },
    { name: "Carol", bot: true },
    { name: "My Bot", bot: true },
  ])
  .steps(({ message, botLogin }) => {
    botLogin({ name: "My Bot" })

    message({
      author: "Alice", content: "I'm human", channel: "random"
    })

    message({
      author: "Bob", content: "I'm human", channel: "random"
    })

    message({
      author: "Carol", content: "I'm human", channel: "random"
    })
  })

testScenario(
  async () => await import("./echoBot.js"), scenario1,
  (messages) => {
    expect(
      messages.get("random")?.filter(([author, _]) => {
        return author === "My Bot"
      })
        .map(([_, message]) => { return message })
    ).toEqual(
      ["Alice: I'm human", "Bob: I'm human"]
    )
  })

const scenario2 = defineScenario("echo bot single channel before login")
  .channels([{ name: "random" }])
  .users([
    { name: "Alice", bot: false },
    { name: "Bob", bot: false },
    { name: "Carol", bot: true },
    { name: "My Bot", bot: true },
  ])
  .steps(({ message, botLogin }) => {
    message({
      author: "Alice", content: "I'm human", channel: "random"
    })

    botLogin({ name: "My Bot" })

    message({
      author: "Bob", content: "I'm human", channel: "random"
    })

    message({
      author: "Carol", content: "I'm human", channel: "random"
    })
  })

testScenario(
  async () => await import("./echoBot.js"), scenario2,
  (messages) => {
    expect(
      messages.get("random")?.filter(([author, _]) => {
        return author === "My Bot"
      })
        .map(([_, message]) => { return message })
    ).toEqual(
      ["Bob: I'm human"]
    )
  })

const scenario3 = defineScenario("echo bot two channels")
  .channels([
    { name: "random" },
    { name: "general" }
  ])
  .users([
    { name: "Alice", bot: false },
    { name: "Bob", bot: false },
    { name: "Carol", bot: true },
    { name: "My Bot", bot: true },
  ])
  .steps(({ message, botLogin }) => {
    botLogin({ name: "My Bot" })

    message({
      author: "Alice", content: "I'm Alice", channel: "random",
    })
    message({
      author: "Bob", content: "I'm Bob", channel: "random",
    })
    message({
      author: "Carol", content: "I'm Carol", channel: "random",
    })


    message({
      author: "Alice", content: "I'm human", channel: "general",
    })
    message({
      author: "Bob", content: "I'm human", channel: "general",
    })
    message({
      author: "Carol", content: "I'm human", channel: "general",
    })
    message({
      author: "Bob", content: "Liar", channel: "general",
    })
  })

testScenario(
  async () => await import("./echoBot.js"), scenario3,
  (messages) => {
    expect(
      messages.get("random")?.filter(([author, _]) => {
        return author === "My Bot"
      })
        .map(([_, message]) => { return message })
    ).toEqual(
      ["Alice: I'm Alice", "Bob: I'm Bob"]
    )

    expect(
      messages.get("general")?.filter(([author, _]) => {
        return author === "My Bot"
      })
        .map(([_, message]) => { return message })
    ).toEqual(
      ["Alice: I'm human", "Bob: I'm human", "Bob: Liar"]
    )
  }
)

const scenario4 = defineScenario("echo bot two channels")
  .channels([
    { name: "random" },
    { name: "general" }
  ])
  .users([
    { name: "Alice", bot: false },
    { name: "Bob", bot: false },
    { name: "Carol", bot: true },
    { name: "My Bot", bot: true },
  ])
  .steps(({ message, botLogin }) => {
    message({
      author: "Alice", content: "I'm Alice", channel: "random",
    })
    message({
      author: "Bob", content: "I'm Bob", channel: "random",
    })
    message({
      author: "Alice", content: "I'm human", channel: "general",
    })

    botLogin({ name: "My Bot" })

    message({
      author: "Carol", content: "I'm Carol", channel: "random",
    })
    message({
      author: "Bob", content: "I'm human", channel: "general",
    })
    message({
      author: "Carol", content: "I'm human", channel: "general",
    })
    message({
      author: "Bob", content: "Liar", channel: "general",
    })
  })

testScenario(
  async () => await import("./echoBot.js"), scenario4,
  (messages) => {
    expect(
      messages.get("random")?.filter(([author, _]) => {
        return author === "My Bot"
      })
        .map(([_, message]) => { return message })
    ).toEqual(
      []
    )

    expect(
      messages.get("general")?.filter(([author, _]) => {
        return author === "My Bot"
      })
        .map(([_, message]) => { return message })
    ).toEqual(
      ["Bob: I'm human", "Bob: Liar"]
    )
  }
)
