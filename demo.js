const isValidIdentifierChar = function(char) {
  return char !== ' ' && char !== '(' && char !== ')'
}

const isWhitespaceChar = function(char) {
  return char === ' ' || char === '\n'
}

const parser = Syn.makeParser({
  rootSyn: 'Program',

  syns: {
    Whitespace: syn => {
      while (syn.code[syn.i] && isWhitespaceChar(syn.code[syn.i])) {
        syn.i++
      }
    },

    Identifier: syn => {
      syn.data._visual = {
        identifierString: 'string'
      }

      if (!isValidIdentifierChar(syn.code[syn.i])) {
        throw syn.failed('Identifier did not start with a valid character')
      }

      while (syn.code[syn.i] && isValidIdentifierChar(syn.code[syn.i])) {
        syn.i++
      }

      syn.data.identifierString = syn.code.slice(syn.startI, syn.i)
    },

    FunctionCall: syn => {
      syn.data._visual = {
        identifierSyn: 'syn',
        argSyns: 'synArray'
      }

      syn.data.identifierSyn = syn.parsePast('Identifier')

      syn.parsePastString('(')

      syn.parsePast('Whitespace')

      syn.data.argSyns = []

      while (syn.code[syn.i] && syn.code[syn.i] !== ')') {
        const argSyn = syn.parsePast('Expression')
        syn.data.argSyns.push(argSyn)
        syn.parsePast('Whitespace')
      }

      syn.parsePastString(')')
    },

    Expression: syn => {
      let valueSyn

      syn.data._visual = {
        valueSyn: 'syn'
      }

      valueSyn = syn.tryToParsePast('FunctionCall', 'Identifier')

      syn.data.valueSyn = valueSyn
    },

    Program: syn => {
      syn.data._visual = {
        statementSyns: 'synArray'
      }

      syn.data.statementSyns = []

      while (syn.i < syn.code.length) {
        const statementSyn = syn.parsePast('FunctionCall')
        syn.data.statementSyns.push(statementSyn)
      }
    }
  }
})

const programSyn = parser('bar(baz foo(kaz))')
console.log(programSyn)

document.getElementById('target').appendChild(visualSyn(programSyn))
