const toggleInput = document.getElementById('toggleInput')
const toggleRow = document.getElementById('toggleRow')
const statusText = document.getElementById('statusText')
const hostnameEl = document.getElementById('hostnameEl')
const darkWarning = document.getElementById('darkWarning')

let busy = false // debounce guard - prevents double-fire

function updateUI({ enabled, hostname, pageIsDark }) {
  toggleInput.checked = enabled
  toggleRow.classList.toggle('active', enabled)
  toggleRow.classList.toggle('disabled', pageIsDark && !enabled)
  hostnameEl.classList.toggle('active', enabled)
  statusText.textContent = enabled ? 'On for this site' : 'Off for this site'
  hostnameEl.textContent = hostname || '-'

  if (darkWarning) {
    darkWarning.style.display = pageIsDark && !enabled ? 'block' : 'none'
  }
}

// Load initial state
browser.runtime.sendMessage({ type: 'GET_STATE' }).then(updateUI)

// Prevent double toggle events
toggleInput.addEventListener('change', () => {
  if (busy) {
    // Revert the checkbox visually until the async op finishes
    toggleInput.checked = !toggleInput.checked
    return
  }
  busy = true
  toggleInput.disabled = true

  browser.runtime
    .sendMessage({ type: 'TOGGLE' })
    .then((state) => {
      if (state) updateUI(state)
      toggleInput.disabled = false
      busy = false
    })
    .catch(() => {
      toggleInput.disabled = false
      busy = false
    })
})
