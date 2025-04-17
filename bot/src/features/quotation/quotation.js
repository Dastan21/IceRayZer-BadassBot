import * as cheerio from 'cheerio'
import { Client } from 'discord.js'
import cron from 'node-cron'
import Feature from '../../utils/feature.js'

const QUOTATION_CHANNEL = process.env.QUOTATION_CHANNEL

export default class Badass extends Feature {
  /** @type {Client<boolean>} client */
  #client = null

  constructor () {
    super()

    this.sendQuotation = this.sendQuotation.bind(this)
    this.schedule = cron.schedule('0 10 * * *', this.sendQuotation, { scheduled: false })
  }

  load (client) {
    this.#client = client
    this.schedule.start()
  }

  unload () {
    this.#client = null
    this.schedule.stop()
  }
  
  async sendQuotation () {
    this.#client?.channels.fetch().then(async (channel) => {
      const thread = await channel.threads.fetch(QUOTATION_CHANNEL)
      thread.send(await this.getQuotation())
    }).catch((err) => {
      console.error(err)
    })
  }

  async getQuotation () {
    return fetch('https://kalendrier.ouest-france.fr/citation-du-jour.html').then(async (r) => {
      if (!r.ok) throw new Error('Failed to get citation')
      const $ = cheerio.load(await r.text())
      const quotation = $('#contentCitation > .manuscrit').text().trim()
      const author = $('#contentCitation > .auteurCitation').text().trim()
      return `> ${quotation}\n\\${author}`
    })
  }
}