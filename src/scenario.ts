import { Runtime } from "#src/runtime"

export type ScenarioChannel = { name: string }
export type ScenarioUser = { name: string, bot: boolean }

// extract names of channels/users
type NameOf<Names extends readonly { name: string }[]> =
  Names[number]["name"]

// means that "author" sends "content" to "channel"
type MessageAction<
  ChannelName extends string,
  UserName extends string,
> = {
  kind: "message",
  author: UserName,
  channel: ChannelName,
  content: string,
}

type MessageInput<
  ChannelName extends string,
  UserName extends string,
> = Pick<
  MessageAction<ChannelName, UserName>,
  "author" | "channel" | "content"
>

type BotLoginAction<
  UserName extends string
> = {
  kind: "bot-login",
  name: UserName
}

type BotLoginInput<
  UserName extends string,
> = Pick<
  BotLoginAction<UserName>,
  "name"
>

type ScenarioAction<
  ChannelName extends string,
  UserName extends string,
> =
  | MessageAction<ChannelName, UserName>
  | BotLoginAction<UserName>

type ActionAPI<
  ChannelName extends string,
  UserName extends string,
> = {
  message: (input: MessageInput<ChannelName, UserName>) => void,
  botLogin: (input: BotLoginInput<UserName>) => void
}

const createActionAPI = <
  const ChannelName extends string,
  const UserName extends string,
>(
  actions: ScenarioAction<ChannelName, UserName>[]
): ActionAPI<ChannelName, UserName> => {
  let botLogin = false

  return {
    message: (input) => {
      actions.push({
        kind: "message",
        ...input
      })
    },

    botLogin: (input) => {
      if (botLogin) {
        throw new Error("Bot can login at most once in one scenario")
      }

      botLogin = true

      actions.push({
        kind: "bot-login",
        ...input
      })
    }
  }
}

export type Scenario<
  Channels extends readonly ScenarioChannel[],
  Users extends readonly ScenarioUser[]
> = {
  name: string,
  channels: Channels
  users: Users
  actions: readonly ScenarioAction<
    NameOf<Users>,
    NameOf<Channels>
  >[]
}

class ScenarioBuilder<
  Channels extends readonly ScenarioChannel[] | undefined,
  Users extends readonly ScenarioUser[] | undefined,
> {
  constructor(
    private name: string,
    private readonly channelDefs: Channels,
    private readonly userDefs: Users,
  ) { }

  static create = (name: string) => {
    return new ScenarioBuilder(name, undefined, undefined)
  }

  channels<
    const NextChannels extends readonly ScenarioChannel[]
  >(
    this: ScenarioBuilder<undefined, undefined>,
    channels: NextChannels
  ) {
    return new ScenarioBuilder(this.name, channels, undefined)
  }

  users<
    const DefinedChannels extends readonly ScenarioChannel[],
    const NextUsers extends readonly ScenarioUser[]
  >(
    this: ScenarioBuilder<DefinedChannels, undefined>,
    users: NextUsers
  ) {
    return new ScenarioBuilder(this.name, this.channelDefs, users)
  }

  steps<
    const DefinedChannels extends readonly ScenarioChannel[],
    const DefinedUsers extends readonly ScenarioUser[]
  >(
    this: ScenarioBuilder<DefinedChannels, DefinedUsers>,
    build: (
      step: ActionAPI<NameOf<DefinedChannels>, NameOf<DefinedUsers>>
    ) => void
  ): Scenario<DefinedChannels, DefinedUsers> {
    const actions: ScenarioAction<
      NameOf<DefinedChannels>, NameOf<DefinedUsers>
    >[] = []

    build(createActionAPI(actions))
    return {
      name: this.name,
      channels: this.channelDefs,
      users: this.userDefs,
      actions: actions
    }
  }
}

export const defineScenario = (name: string) => {
  return ScenarioBuilder.create(name)
}

const runScenarioAction = async (
  action: ScenarioAction<string, string>,
  boot: () => Promise<unknown>,
  runtime: Runtime
) => {
  switch (action.kind) {
    case "message":
      const author = runtime.getUserByName(action.author)
      if (author === undefined) {
        throw new Error(`${action.author} does not exist`)
      }
      const channel = runtime.getChannelByName(action.channel)
      if (channel === undefined) {
        throw new Error(`${action.channel} does not exist`)
      }
      await runtime.sendMessage(author, action.content, channel)
      break

    case "bot-login":
      runtime.setBotClientName(action.name)
      await boot()
      break

    default:
      const { }: never = action
      break
  }
}

export const runScenario = async (
  scenario: Scenario<readonly ScenarioChannel[], readonly ScenarioUser[]>,
  boot: () => Promise<unknown>,
  runtime: Runtime,
) => {
  for (const channel of scenario.channels) {
    await runtime.createTextChannel(channel.name)
  }

  for (const user of scenario.users) {
    await runtime.createUser(user.name, user.bot)
  }

  for (const action of scenario.actions) {
    await runScenarioAction(action, boot, runtime)
  }
}
