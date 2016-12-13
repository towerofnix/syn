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

    newSyn.synCode = newSyn.code.slice(newSyn.startI, newSyn.endI)

    return newSyn
  }

  static makeParser(lang) {
    return function(code) {
      const syn = new Syn('Root', code, 0, lang)
      return syn.parsePast(lang.rootSyn)
    }
  }
}
