class SynError extends Error {
  constructor(syn, msg) {
    let errorMsg = `Failed in ${syn.type}`
    if (msg) {
      errorMsg += ` (${msg})`
    }
    super(errorMsg)

    this.syn = syn
  }
}

class Syn {
  constructor(type, code, i, lang) {
    this.type = type
    this.code = code
    this.i = i
    this.lang = lang

    this.startI = i

    this.endI = null
    this.data = {}
  }

  parsePast(synType) {
    if (!(synType in this.lang.syns)) {
      throw new Error(`No syn definition for "${synType}"`)
    }

    const synFunction = this.lang.syns[synType]
    const newSyn = new Syn(synType, this.code, this.i, this.lang)
    synFunction(newSyn)

    newSyn.endI = newSyn.i

    this.i = newSyn.i

    newSyn.containedCode = newSyn.code.slice(newSyn.startI, newSyn.endI)

    return newSyn
  }

  parsePastString(str) {
    if (this.code.slice(this.i, this.i + str.length) !== str) {
      throw this.failed(`Couldn\'t parse past string "${str}"`)
    }

    this.i += str.length
  }

  failed(msg) {
    return new SynError(this, msg ? msg : '')
  }

  tryToParsePast(...tries) {
    let syn

    for (let attempt of tries) {
      if (!this.lang.syns.hasOwnProperty(attempt)) {
        throw new Error(
          `tryToParsePast was given syn type ${attempt}, which has no` +
          ' definition'
        )
      }
    }

    for (let attempt of tries) {
      let syn

      try {
        syn = this.parsePast(attempt)
      } catch(e) {
        console.log('(tryToParsePast) ' + e.message)
      }

      if (syn) {
        return syn
      }
    }

    if (!syn) {
      throw this.failed('tryToParsePast did not find a successful syn')
    }
  }

  static makeParser(lang) {
    return function(code) {
      const syn = new Syn('Root', code, 0, lang)
      return syn.parsePast(lang.rootSyn)
    }
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Syn
}
