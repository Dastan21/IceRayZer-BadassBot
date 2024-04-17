import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

const DEFAULT_DATA = {
  badass_percent: 10,
  features: []
}

export default new LowSync(new JSONFileSync('data.json'), DEFAULT_DATA)
