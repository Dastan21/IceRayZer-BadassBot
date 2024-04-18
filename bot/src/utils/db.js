import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import path from 'node:path'

const DEFAULT_DATA = {
  features: {}
}

export default new LowSync(new JSONFileSync(path.join(import.meta.dirname, '../bot.json')), DEFAULT_DATA)
