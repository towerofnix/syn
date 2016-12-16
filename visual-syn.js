const shortCode = function(code) {
  const lines = code.split('\n')
  const firstLine = lines.filter(l => l.trim() !== '')[0]

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

visualSyn.textVis = function(rootSyn) {
  const selectedChars = []
  const selectedLines = []

  const selectedCharStyle = {
    backgroundColor: '#CCF'
  }

  const unselectedCharStyle = {
    backgroundColor: 'transparent'
  }

  const selectedLineStyle = {
    backgroundColor: '#CCF'
  }

  const unselectedLineStyle = {
    backgroundColor: 'red'
  }

  const flatten2d = function(arr) {
    return arr.reduce((a, b) => a.concat(b), [])
  }

  const getChildSyns = function(syn) {
    const childSyns = [syn]

    const visual = syn.data._visual

    if (visual) {
      for (let prop of Object.keys(visual)) {
        let children = []

        if (visual[prop] === 'syn') {
          children = getChildSyns(syn.data[prop])
        } else if (visual[prop] === 'synArray') {
          children = flatten2d(syn.data[prop].map(getChildSyns))
        }

        childSyns.push(...children)
      }
    }

    return childSyns
  }

  const filterSynLinesAtIndex = i => (line => {
    const syn = line.syn
    return (syn.startI <= i && syn.endI > i)
  })

  const unselectAllLines = () => {
    for (let charPart of selectedChars) {
      Object.assign(charPart.style, unselectedCharStyle)
    }

    for (let lineSegmentPart of selectedLines) {
      Object.assign(lineSegmentPart.style, unselectedLineStyle)
    }
  }

  const selectLine = (synLine, selectChars = true) => {
    if (selectChars) {
      selectedChars.push(...synLine.parts.chars)
      for (let charPart of synLine.parts.chars) {
        Object.assign(charPart.style, selectedCharStyle)
      }
    }

    selectedLines.push(...synLine.parts.lineSegments)
    for (let lineSegmentPart of synLine.parts.lineSegments) {
      Object.assign(lineSegmentPart.style, selectedLineStyle)
    }
  }

  const allSyns = getChildSyns(rootSyn)
  const synLines = allSyns.map(syn => ({
    syn: syn,
    parts: {
      container: null,
      lineSegments: [],
      chars: []
    }
  }))

  const code = rootSyn.code

  const codeContainer = document.createElement('div')
  codeContainer.style.fontFamily = 'monospace'
  codeContainer.style.fontSize = '14px'

  let maxH = 0

  for (let charIndex = 0; charIndex < code.length; charIndex++) {
    const synLinesAtIndex = synLines.filter(filterSynLinesAtIndex(charIndex))

    if (!synLinesAtIndex.length) {
      console.warn(`synVis didn't find a syn at index ${charIndex}`)
      continue
    }

    // Space characters don't display well with CSS and aligning and things
    // so we replace them with a non-breaking space (which *looks* the same).
    const nobr = '\u00A0'
    let char = code[charIndex] === ' ' ? nobr : code[charIndex]

    // Newlines should cause line breaks. They're replaced with a more visual
    // line break character.
    if (char === '\n') {
      const lbr = document.createElement('div')
      lbr.style.height = (maxH - 14) + 'px'
      lbr.style.width = '3px'
      lbr.style.backgroundColor = 'blue'
      codeContainer.appendChild(lbr)
      maxH = 0
      char = '¬'
    }

    const charPart = document.createElement('div')
    charPart.classList.add('syn-vis-text')
    charPart.appendChild(document.createTextNode(char === ' ' ? nobr : char))

    // Character size. A little bigger than normal so that the background on
    // the character looks a little nicer.
    charPart.style.width = '1ch'  // 1ch = 1 char width
    charPart.style.height = '1.3em'  // 1em = 1 line height

    // Test background color
    // const testRed = 128 + Math.floor(Math.sin(charIndex / 4) * 128)
    // charPart.style.backgroundColor = `rgb(${testRed}, 128, 128)`

    Object.assign(charPart.style, unselectedCharStyle)

    charPart.addEventListener('mouseover', () => {
      unselectAllLines()

      for (let synLine of synLinesAtIndex) {
        selectLine(synLine, false)
      }

      const chars = synLinesAtIndex[synLinesAtIndex.length - 1].parts.chars
      selectedChars.push(...chars)
      for (let char of chars) {
        Object.assign(char.style, selectedCharStyle)
      }
    })

    const container = document.createElement('div')
    container.style.position = 'relative'
    container.style.display = 'inline-block'
    container.appendChild(charPart)

    let h = 16
    for (let synLine of synLinesAtIndex) {
      h += 2

      const lineSegmentPart = document.createElement('div')
      lineSegmentPart.classList.add('syn-vis-text')
      lineSegmentPart.style.position = 'absolute'
      lineSegmentPart.style.top = h + 'px'
      lineSegmentPart.style.width = '1ch'
      lineSegmentPart.style.height = '1px'
      lineSegmentPart.style.backgroundColor = 'red'
      lineSegmentPart.style.boxSizing = 'border-box'

      const endBorderStyle = '2px solid rgba(0, 0, 0, 0.4)'
      let widthModifier = 0
      if (synLine.syn.startI === charIndex) {
        lineSegmentPart.style.borderLeft = endBorderStyle
        widthModifier++
        lineSegmentPart.style.left = '1px'
      }
      if (synLine.syn.endI === charIndex + 1) {
        lineSegmentPart.style.borderRight = endBorderStyle
        widthModifier++
        lineSegmentPart.style.right = '1px'
      }
      lineSegmentPart.style.width = `calc(1ch - ${widthModifier}px)`
      Object.assign(lineSegmentPart.style, unselectedLineStyle)

      lineSegmentPart.addEventListener('mouseover', () => {
        unselectAllLines()
        selectLine(synLine)
      })

      lineSegmentPart.title = (
        `${synLine.syn.type}\n\n${shortCode(synLine.syn.containedCode)}`
      )

      synLine.parts.lineSegments.push(lineSegmentPart)
      synLine.parts.chars.push(charPart)

      container.appendChild(lineSegmentPart)
    }

    if (h > maxH) maxH = h

    codeContainer.appendChild(container)
  }

  console.log(synLines)

  return codeContainer
}
