import { User } from "#src/virtualClass/user"
import { getRuntime } from "#src/runtime"

type VirtualListener = (...args: unknown[]) => unknown
type VirtualListenerEntry = {
  listener: VirtualListener, once: boolean
}

export class Client {
  user: User | undefined
  private readonly listeners = new Map<string, VirtualListenerEntry[]>()

  constructor() {
    getRuntime().register(this)
  }

  on = (eventName: string, listener: VirtualListener) => {
    this.addListener(eventName, listener, false)
    return this
  }

  once = (eventName: string, listener: VirtualListener) => {
    this.addListener(eventName, listener, true)
    return this
  }

  login = async (token: string) => {
    this.user =
      getRuntime().createUser(getRuntime().getBotClientName(), true)
    await this.subscribe("clientReady", this)

    return `virtual: ${token}`
  }

  subscribe = async (eventName: string, ...args: unknown[]) => {
    const entries = this.listeners.get(eventName) ?? []
    const snapshot = [...entries]

    this.listeners.set(eventName, entries.filter((entry) => !entry.once))

    for (const entry of snapshot) {
      await entry.listener(...args)
    }
  }

  private addListener = (
    eventName: string,
    listener: VirtualListener,
    once: boolean
  ) => {
    const registeredEntries = this.listeners.get(eventName) ?? []
    registeredEntries.push({ listener, once })
    this.listeners.set(eventName, registeredEntries)
  }
}
