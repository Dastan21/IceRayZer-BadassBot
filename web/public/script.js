Array.from(document.querySelectorAll('button[data-delete-input]')).forEach($btn => {
  $btn.onclick = () => $btn.parentElement.remove()
})

Array.from(document.querySelectorAll('button[data-hide]')).forEach($btn => {
  $btn.nextElementSibling.style.display = 'none'
  $btn.onclick = () => $btn.nextElementSibling.style.display = $btn.nextElementSibling.style.display === 'none' ? 'flex' : 'none'
})
