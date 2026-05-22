;(function () {
  const LINK_ID = '__ldmv_css__'

  function isDarkPage() {
    // Sample bg color of html + body to detect already-dark pages
    function getLuma(el) {
      if (!el) return 255
      const bg = window.getComputedStyle(el).backgroundColor
      const m = bg.match(/\d+/g)
      if (!m || m.length < 3) return 255
      // Relative luminance approximation
      return 0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]
    }
    const htmlLuma = getLuma(document.documentElement)
    const bodyLuma = getLuma(document.body)
    // Both below 60 out of 255 = dark page
    return htmlLuma < 60 && bodyLuma < 60
  }

  function inject() {
    if (document.getElementById(LINK_ID)) return
    const link = document.createElement('link')
    link.id = LINK_ID
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = browser.runtime.getURL('styles/dark.css')
    document.documentElement.appendChild(link)
  }

  function eject() {
    const el = document.getElementById(LINK_ID)
    if (el) el.remove()
  }

  function isEnabled() {
    return !!document.getElementById(LINK_ID)
  }

  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ENABLE') {
      inject()
      return Promise.resolve({ ok: true })
    }
    if (msg.type === 'DISABLE') {
      eject()
      return Promise.resolve({ ok: true })
    }
    if (msg.type === 'GET_DOM_STATE') {
      return Promise.resolve({
        enabled: isEnabled(),
        pageIsDark: isDarkPage()
      })
    }
  })

  // Auto-apply on load from storage
  browser.storage.local.get(location.hostname).then((result) => {
    if (result[location.hostname] === true) inject()
  })
})()
