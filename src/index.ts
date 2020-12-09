import { createManager } from './utils'

async function gen() {
  const manager = await createManager()
  // manager.regenerateFiles()
}

gen()