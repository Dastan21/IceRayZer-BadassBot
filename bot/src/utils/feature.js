import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { client } from '../bot.js'
import db from './db.js'

const FEATURES_PATH = path.join(import.meta.dirname, '../features')

export const features = {}

export default class Feature {
  /** @type {LowSync} data */
  #data = null

  constructor (defaultData) {
    this.#data = new LowSync(new JSONFileSync(path.join(FEATURES_PATH, this.id, 'data.json')), defaultData)
    this.#data.read()
    this.#data.write()
  }

  get data () {
    this.#data.read()
    return this.#data.data
  }

  set data (value) {
    this.#data.data = value
    this.#data.write()
  }

  get id () {
    return this.constructor.name.toLowerCase()
  }

  load () { }
  unload () { }
  beforeLeave () { }
  startSpeak () { }
}

export async function loadFeatures () {
  const dirs = await readdir(FEATURES_PATH)
  db.read()
  for (const feat of dirs) {
    if (db.data.features[feat] === false) continue

    await loadFeature(feat).catch((err) => {
      console.warn(`Failed to load feature '${feat}':\n`, err.message)
    })
  }
}

export async function loadFeature (feat) {
  if (features[feat] != null) return

  const featPath = path.join(FEATURES_PATH, feat, `${feat}.js`)
  const featStat = await stat(featPath).catch(() => {})
  if (featStat == null || !featStat.isFile()) throw new Error(`File '${featPath}' not found`)

  import(`../features/${feat}/${feat}.js`).then((module) => {
    // eslint-disable-next-line new-cap
    const featModule = new module.default()
    featModule.load(client)
    features[feat] = featModule

    db.data.features[feat] = true
    db.write()
    console.info(`Loaded feature '${feat}'`)
  })
}

export function unloadFeature (feat) {
  if (features[feat] == null) return

  const featModule = features[feat]
  featModule.unload(client)

  db.data.features[feat] = false
  db.write()
  delete features[feat]
  console.info(`Unloaded feature '${feat}'`)
}

export function isFeatureEnabled (feat) {
  db.read()
  return db.data.features[feat]
}
