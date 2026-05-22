// Inject content script into tab if not already present, then send message
async function ensureContentScriptAndSend(tabId, message) {
  // Try messaging first, fallback to injection
  try {
    const res = await browser.tabs.sendMessage(tabId, message)
    return res
  } catch {
    // Content script not ready - inject it, then retry once
    try {
      await browser.tabs.executeScript(tabId, { file: 'content.js' })
    } catch {
      return null // Can't inject (e.g. about: pages)
    }
    try {
      const res = await browser.tabs.sendMessage(tabId, message)
      return res
    } catch {
      return null
    }
  }
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'TOGGLE') {
    ;(async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tab?.url) {
        sendResponse(null)
        return
      }

      let hostname
      try {
        hostname = new URL(tab.url).hostname
      } catch {
        sendResponse(null)
        return
      }

      const result = await browser.storage.local.get(hostname)
      const nowEnabled = !(result[hostname] === true)
      await browser.storage.local.set({ [hostname]: nowEnabled })

      await ensureContentScriptAndSend(tab.id, {
        type: nowEnabled ? 'ENABLE' : 'DISABLE'
      })
      sendResponse({ enabled: nowEnabled, hostname })
    })()
    return true
  }

  if (msg.type === 'GET_STATE') {
    ;(async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tab?.url) {
        sendResponse({ enabled: false, hostname: '', pageIsDark: false })
        return
      }

      let hostname
      try {
        hostname = new URL(tab.url).hostname
      } catch {
        sendResponse({ enabled: false, hostname: '', pageIsDark: false })
        return
      }

      const stored = await browser.storage.local.get(hostname)
      const enabled = stored[hostname] === true

      // Ask content script for live DOM state + dark page detection
      const domState = await ensureContentScriptAndSend(tab.id, {
        type: 'GET_DOM_STATE'
      })
      const pageIsDark = domState?.pageIsDark ?? false

      sendResponse({ enabled, hostname, pageIsDark })
    })()
    return true
  }
})
