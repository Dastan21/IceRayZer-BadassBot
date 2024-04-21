export function getAudioFileName (name) {
  return Buffer.from(name, 'latin1').toString('utf-8').match(/(.+?)(\.[^.]*$|$)/)[1]?.toLowerCase().replace(/ /g, '_').replace(/'|"/g, '').trim()
}
