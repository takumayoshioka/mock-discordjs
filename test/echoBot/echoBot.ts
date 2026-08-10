import { env } from "./env.js"
import {
  // GatewayIntentBits, 
  Client,
  Events
} from "discord.js"

const client = new Client({
  // TODO: appropriate permission
  intents: [
    //   GatewayIntentBits.Guilds,
    //   GatewayIntentBits.GuildMessages,
    //   GatewayIntentBits.MessageContent,
  ]
})

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) { return }

  await message.channel.send(
    `${message.author.username}: ${message.content}`
  )
})

client.once(Events.ClientReady, () => {
  console.log("Echo bot is ready")
})

await client.login(env.DISCORD_TOKEN)