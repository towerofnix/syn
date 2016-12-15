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
        string: 'string'
      }

      if (!isValidIdentifierChar(syn.code[syn.i])) {
        throw syn.failed('Identifier did not start with a valid character')
      }

      while (syn.code[syn.i] && isValidIdentifierChar(syn.code[syn.i])) {
        syn.i++
      }

      syn.data.string = syn.code.slice(syn.startI, syn.i)
    },

    FunctionCall: syn => {
      syn.data._visual = {
        identifier: 'syn',
        args: 'synArray'
      }

      syn.data.identifier = syn.parsePast('Identifier')

      syn.parsePastString('(')

      syn.parsePast('Whitespace')

      syn.data.args = []

      while (syn.code[syn.i] && syn.code[syn.i] !== ')') {
        const argSyn = syn.parsePast('Expression')
        syn.data.args.push(argSyn)
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
        statements: 'synArray'
      }

      syn.data.statements = []

      while (syn.i < syn.code.length) {
        const statementSyn = syn.parsePast('FunctionCall')
        syn.data.statements.push(statementSyn)
      }
    }
  }
})

const programSyn = parser(
  'bar(baz foo(kaz))' +
  '\nbar(baz(baz(baz(kaj))))'
)
console.log(programSyn)

document.getElementById('target').appendChild(visualSyn(programSyn))
