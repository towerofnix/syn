function visualSyn(syn) {
  console.log('Visuaizing a ' + syn.type)

  const synEl = document.createElement('div')
  synEl.classList.add('syn-vis', 'syn')

  const typeEl = document.createElement('span')
  typeEl.classList.add('syn-vis', 'type')
  typeEl.appendChild(document.createTextNode(syn.type))
  synEl.appendChild(typeEl)

  const codeEl = document.createElement('div')
  codeEl.classList.add('syn-vis', 'code')
  codeEl.appendChild(document.createTextNode(
    `(${syn.startI} -> ${syn.endI}) ${syn.synCode}`
  ))
  synEl.appendChild(codeEl)

  const propConfig = syn.data._visual

  if (propConfig) {
    const propsEl = document.createElement('div')
    propsEl.classList.add('syn-vis', 'props')

    for (let prop of Object.keys(propConfig)) {
      const value = syn.data[prop]
      const displayType = propConfig[prop]

      const propEl = document.createElement('div')
      propEl.classList.add('syn-vis', 'prop')

      const propLabelEl = document.createElement('span')
      propLabelEl.classList.add('syn-vis', 'prop-label')
      propLabelEl.appendChild(document.createTextNode(prop))
      propEl.appendChild(propLabelEl)

      if (displayType === 'synArray') {
        propLabelEl.appendChild(document.createTextNode(' (Syn array)'))
        propEl.classList.add('syn-array')

        for (let childSyn of value) {
          propEl.appendChild(visualSyn(childSyn))
        }
      } else if (displayType === 'syn') {
        propLabelEl.appendChild(document.createTextNode(' (Syn)'))
        propEl.appendChild(visualSyn(value))
      } else if (displayType === 'string') {
        propEl.appendChild(document.createTextNode(`: ${value}`))
      }

      propsEl.appendChild(propEl)
    }

    synEl.appendChild(propsEl)
  }

  return synEl
}
