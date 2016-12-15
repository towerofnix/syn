const logEl = document.createElement('div')
Object.assign(logEl.style, {
  backgroundColor: '#EEFFAA',
  padding: '8px',
  marginTop: '12px',
  marginBottom: '12px',
  border: '1px solid black',
  boxShadow: '0 0 4px rgba(0, 0, 0, 0.8)',

  whiteSpace: 'pre',
  fontFamily: 'monospace'
})
document.body.appendChild(logEl)

const oldConsoleLog = window.console.log

window.console.log = function(...args) {
  // Overridden, heh.
  // See tutorials/util/console-log-in-document.js!

  const str = args.map(x => (
    (typeof x === 'object')
    ? JSON.stringify(x, null, 2)
    : String(x)
  )).join(' ')

  const el = document.createElement('div')
  Object.assign(el.style, {
    padding: '8px 0',
    borderBottom: '1px solid rgba(0, 0, 0, 0.2)'
  })
  el.appendChild(document.createTextNode(str))
  logEl.appendChild(el)

  oldConsoleLog(...args)
}
