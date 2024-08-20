Array.from(document.querySelectorAll('button[data-delete-input]')).forEach($btn => {
  $btn.onclick = () => $btn.parentElement.remove()
})

Array.from(document.querySelectorAll('button[data-hide]')).forEach($btn => {
  $btn.parentElement.nextElementSibling.style.display = 'none'
  $btn.onclick = () => $btn.parentElement.nextElementSibling.style.display = $btn.parentElement.nextElementSibling.style.display === 'none' ? 'flex' : 'none'
})

Array.from(document.querySelectorAll('button[data-copy]')).forEach($btn => {
  $btn.onclick = () => {
    navigator.clipboard.writeText($btn.getAttribute('data-copy')).catch((err) => console.error(err))
  }
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

const $alert = document.getElementById('alert')
if ($alert != null) {
  const delay = $alert.classList.contains('success') ? 3000 : 10000

  setTimeout(() => {
    $alert?.remove()
  }, delay)
}