import Playlist from '../models/playlist.js'

const playlist = new Playlist()

export async function addFilePlaylist (file) {
  if (file == null) throw new Error('Audio requis')
  
  await playlist.add(file)
}

export async function getPlaylistData () {
  return {
    audios: playlist.queue
  }
}

export async function addYoutubePlaylist (url) {
  if (url == null) throw new Error('URL non renseignée')

  await playlist.add(url)
}

export async function pausePlaylist () {
  playlist.pause()
}

export async function resumePlaylist () {
  playlist.resume()
}


export async function removePlaylist (id) {
  playlist.remove(id)
}

