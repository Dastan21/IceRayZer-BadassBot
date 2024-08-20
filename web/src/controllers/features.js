import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isFeatureEnabled, loadFeature, unloadFeature } from '../../../bot/src/utils/feature.js'

const FEATURES_PATH = '../bot/src/features'

export async function getFeatures () {
  const features = []

  const featsDir = await readdir(FEATURES_PATH)
  for (const feat of featsDir) {
    features.push({
      ...(await getFeatureMeta(feat)),
      enabled: isFeatureEnabled(feat),
      data: await getFeatureData(feat)
    })
  }

  return features
}

export async function toggleFeature (feat, value) {
  if (value) {
    loadFeature(feat)
  } else {
    unloadFeature(feat)
  }
}

export async function updateFeatureConfig (feat, req) {
  const featMod = await import(`./config/${feat}.js`).catch(() => {})
  await featMod?.saveConfig(req)
}

export async function getFeatureMeta (feat) {
  return await readFile(path.join(FEATURES_PATH, feat, 'meta.json'), { encoding: 'utf-8' }).then(data => JSON.parse(data))
}

export async function getFeatureData (feat) {
  const data = JSON.parse(await readFile(path.join(FEATURES_PATH, feat, 'data.json'), { encoding: 'utf-8' }).catch(() => '{}'))
  const featMod = await import(`./config/${feat}.js`).catch(() => {})
  return await featMod?.loadConfig(data) ?? {}
}

export async function setFeatureData (feat, data) {
  await writeFile(path.join(FEATURES_PATH, feat, 'data.json'), JSON.stringify(data, null, 2)).catch(() => {})
}
