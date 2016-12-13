const parser = Syn.makeParser({
  rootSyn: 'Program',

  syns: {
    Identifier: syn => {
      syn.data._visual = {
        identifierString: 'string'
      }

      while (syn.code[syn.i] && syn.code[syn.i] !== '(') {
        syn.i++
      }

      syn.data.identifierString = syn.code.slice(syn.startI, syn.i)
    },

    FunctionCall: syn => {
      syn.data._visual = {
        identifier: 'syn',
        argSyns: 'synArray'
      }

      syn.data.identifierSyn = syn.parsePast('Identifier')

      syn.i++  // Move past opening function parenthesis

      syn.data.argSyns = []

      const argSyn = syn.parsePast('Expression')
      syn.data.argSyns.push(argSyn)

      syn.i++  // Move past closing function parenthesis
    },

    Expression: syn => {
      let valueSyn

      valueSyn = syn.parsePast('Identifier')

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

const programSyn = parser('Foo(bar)')
console.log(programSyn)

document.getElementById('target').appendChild(visualSyn(programSyn))
