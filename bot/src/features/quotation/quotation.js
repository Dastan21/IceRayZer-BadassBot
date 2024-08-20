import * as cheerio from 'cheerio'
import { Client } from 'discord.js'
import cron from 'node-cron'
import Feature from '../../utils/feature.js'

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
    this.#client?.channels.fetch('1195140050275553330').then(async (channel) => {
      const thread = await channel.threads.fetch('1275421842156556344')
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