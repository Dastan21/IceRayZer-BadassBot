async function toggleFeature (feat, value) {
  await fetch(`/features/${feat}/toggle`, {
    method: 'POST',
    body: JSON.stringify({
      toggle: value === 'true'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(r => { if (!r.ok) throw new Error(''); return r })
  location.reload()
}
