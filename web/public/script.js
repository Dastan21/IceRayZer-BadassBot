Array.from(document.querySelectorAll('button[data-delete-input]')).forEach($btn => {
  $btn.onclick = () => $btn.parentElement.remove()
})

Array.from(document.querySelectorAll('button[data-hide]')).forEach($btn => {
  $btn.nextElementSibling.style.display = 'none'
  $btn.onclick = () => $btn.nextElementSibling.style.display = $btn.nextElementSibling.style.display === 'none' ? 'flex' : 'none'
})

Array.from(document.querySelectorAll('audio[data-volume-control]')).forEach($audio => {
  const $volume = $audio.nextElementSibling
  if ($volume.tagName !== 'INPUT' || $volume.type !== 'range') return
  $audio.volume = $volume.valueAsNumber / 100
  $volume.oninput = (event) => {
    const val = event.target.valueAsNumber
    $audio.volume = val / 100
  }
})
