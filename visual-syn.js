const shortCode = function(code) {
  const lines = code.split('\n')
  const firstLine = lines[0]

  let msg = ''

  if (firstLine.length > 20) {
    msg += firstLine.slice(0, 20)
    msg += `...`
  } else {
    msg += firstLine
  }

  if (lines.length > 1) {
    msg += ` (+ ${lines.length - 1} lines)`
  }

  return msg
}

function visualSyn(syn, meta={}) {
  //console.log('Visuaizing a ' + syn.type, Object.keys(meta))

  const code = syn.containedCode

  const synEl = document.createElement('div')
  synEl.classList.add('syn-vis', 'syn')

  synEl.title = syn.type

  synEl.title += '\n\nCode: ' + shortCode(code)

  if (meta.ancesterLines) {
    synEl.title += '\n\nStack: -------------\n'
    synEl.title += meta.ancesterLines.join('\n')
  }

  const typeEl = document.createElement('span')
  typeEl.classList.add('syn-vis', 'type-label')
  typeEl.appendChild(document.createTextNode(syn.type))
  synEl.appendChild(typeEl)

  const codeEl = document.createElement('div')
  codeEl.classList.add('syn-vis', 'code')
  codeEl.appendChild(document.createTextNode(
    `(${syn.startI} -> ${syn.endI}) ${code}`
  ))
  synEl.appendChild(codeEl)

  const propConfig = syn.data._visual

  if (propConfig) {
    const propsEl = document.createElement('div')
    propsEl.classList.add('syn-vis', 'props')

    for (let prop of Object.keys(propConfig)) {
      const value = syn.data[prop]
      const displayType = propConfig[prop]

      if (typeof value === 'undefined') {
        console.warn(
          `visualSyn didn't get a value for property ${prop} in a ` +
          `${syn.type} syn`
        )
        continue
      }

      const propEl = document.createElement('div')
      propEl.classList.add('syn-vis', 'prop')

      const propLabelEl = document.createElement('span')
      propLabelEl.classList.add('syn-vis', 'prop-label')
      propLabelEl.appendChild(document.createTextNode(prop))
      propEl.appendChild(propLabelEl)

      if (displayType === 'synArray') {
          propLabelEl.appendChild(document.createTextNode(' (Syn array)'))
          propEl.classList.add('syn-array')

        if (Array.isArray(value)) {
          for (let childSyn of value) {
            propEl.appendChild(visualSyn(childSyn, Object.assign({}, meta, {
              ancesterLines: (meta.ancesterLines || []).concat([
                `${syn.type} -> ${prop} (array #${value.indexOf(childSyn)})`
              ])
            })))
          }
        } else {
          console.warn(
            `visualSyn didn't get an array for property ${prop} (synArray)` +
            ` in a ${syn.type} syn`
          )
        }
      } else if (displayType === 'syn') {
        propLabelEl.appendChild(document.createTextNode(' (Syn)'))

        if (value instanceof Syn) {
          propEl.appendChild(visualSyn(value, Object.assign({}, meta, {
            ancesterLines: (meta.ancesterLines || []).concat([
              `${syn.type} -> ${prop}`
            ])
          })))
        } else {
          console.warn(
            `visualSyn didn't get a syn for property ${prop} (syn) in a` +
            ` ${syn.type} syn`
          )
        }
      } else if (displayType === 'string') {
        propEl.appendChild(document.createTextNode(`: ${value}`))
      }

      propsEl.appendChild(propEl)
    }

    synEl.appendChild(propsEl)
  }

  return synEl
}
