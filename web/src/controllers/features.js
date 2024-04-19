import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { isFeatureEnabled, loadFeature, unloadFeature } from '../../../bot/src/utils/feature.js'

const FEATURES_PATH = '../bot/src/features'

export async function getFeatures () {
  const metas = []
  const featsDir = await readdir(FEATURES_PATH)
  for (const feat of featsDir) {
    const meta = await readFile(path.join(FEATURES_PATH, feat, 'meta.json'), { encoding: 'utf-8' }).then(data => JSON.parse(data))
    metas.push({
      id: meta.id,
      name: meta.name,
      description: meta.description,
      enabled: isFeatureEnabled(feat)
    })
  }

  return metas
}

export async function getFeature (feat) {
  const features = await getFeatures()
  return features.find(f => f.id === feat)
}

export async function toggleFeature (feature, value) {
  if (value) {
    loadFeature(feature)
  } else {
    unloadFeature(feature)
  }
}
