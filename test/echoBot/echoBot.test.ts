import { testDiscord } from "@takumayoshioka/mock-discordjs"
import { expect } from "vitest"

testDiscord("echo bot single channel", async (discord) => {
  await import("./echoBot.js")

  const random = discord.createTextChannel()
  const alice = discord.createUser("Alice", false)
  const bob = discord.createUser("Bob", false)
  const carol = discord.createUser("Carol", true)

  await discord.sendMessage(alice, "I'm human", random)
  await discord.sendMessage(bob, "I'm human", random)
  await discord.sendMessage(carol, "I'm human", random)

  const botUser = discord.botClient.user
  const messages = random.messages.fetch()
  const sentMessage = [...messages.values()]
    .filter((message) => message.author === botUser)
    .map((message) => { return message.content })

  expect(sentMessage).toEqual(["Alice: I'm human", "Bob: I'm human"])
})

testDiscord("echo bot single channel before login", async (discord) => {
  const random = discord.createTextChannel()
  const alice = discord.createUser("Alice", false)
  const bob = discord.createUser("Bob", false)
  const carol = discord.createUser("Carol", true)

  await discord.sendMessage(alice, "I'm human", random)

  await import("./echoBot.js")

  await discord.sendMessage(bob, "I'm human", random)
  await discord.sendMessage(carol, "I'm human", random)

  const botUser = discord.botClient.user
  const messages = random.messages.fetch()
  const sentMessage = [...messages.values()]
    .filter((message) => message.author === botUser)
    .map((message) => { return message.content })

  expect(sentMessage).toEqual(["Bob: I'm human"])
})

testDiscord("echo bot two channels before login", async (discord) => {
  await import("./echoBot.js")

  const random = discord.createTextChannel()
  const general = discord.createTextChannel()
  const alice = discord.createUser("Alice", false)
  const bob = discord.createUser("Bob", false)
  const carol = discord.createUser("Carol", true)

  await discord.sendMessage(alice, "I'm Alice", random)
  await discord.sendMessage(bob, "I'm Bob", random)
  await discord.sendMessage(carol, "I'm Carol", random)

  await discord.sendMessage(alice, "I'm human", general)
  await discord.sendMessage(bob, "I'm human", general)
  await discord.sendMessage(carol, "I'm human", general)
  await discord.sendMessage(bob, "Liar", general)

  const botUser = discord.botClient.user
  const randomMessages = random.messages.fetch()
  const randomSentMessage = [...randomMessages.values()]
    .filter((message) => message.author === botUser)
    .map((message) => { return message.content })

  const generalMessages = general.messages.fetch()
  const generalSentMessages = [...generalMessages.values()]
    .filter((message) => message.author === botUser)
    .map((message) => { return message.content })

  expect(randomSentMessage)
    .toEqual(["Alice: I'm Alice", "Bob: I'm Bob"])
  expect(generalSentMessages)
    .toEqual(["Alice: I'm human", "Bob: I'm human", "Bob: Liar"])
})

testDiscord("echo bot two channels", async (discord) => {

  const random = discord.createTextChannel()
  const general = discord.createTextChannel()
  const alice = discord.createUser("Alice", false)
  const bob = discord.createUser("Bob", false)
  const carol = discord.createUser("Carol", true)

  await discord.sendMessage(alice, "I'm Alice", random)
  await discord.sendMessage(bob, "I'm Bob", random)
  await discord.sendMessage(alice, "I'm human", general)

  await import("./echoBot.js")
  await discord.sendMessage(carol, "I'm Carol", random)
  await discord.sendMessage(bob, "I'm human", general)
  await discord.sendMessage(carol, "I'm human", general)
  await discord.sendMessage(bob, "Liar", general)

  const botUser = discord.botClient.user
  const randomMessages = random.messages.fetch()
  const randomSentMessage = [...randomMessages.values()]
    .filter((message) => message.author === botUser)
    .map((message) => { return message.content })

  const generalMessages = general.messages.fetch()
  const generalSentMessages = [...generalMessages.values()]
    .filter((message) => message.author === botUser)
    .map((message) => { return message.content })

  expect(randomSentMessage)
    .toEqual([])
  expect(generalSentMessages)
    .toEqual(["Bob: I'm human", "Bob: Liar"])
})
