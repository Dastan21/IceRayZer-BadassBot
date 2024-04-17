import { REST, Routes } from 'discord.js'

const commands = [
  {
    name: 'join',
    description: 'Rejoint le salon vocal.'
  },
  {
    name: 'leave',
    description: 'Quitte le salon vocal.'
  }
]

export default async function () {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN ?? '')
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID ?? ''), { body: commands })
}
