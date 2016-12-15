# Syn

**Let's let you make the parser (but maybe with a bit less repetition.)**

Syn is another parser framework that lets you do the parsing. It aims to let
you make the best parser *you* can, without being limited in any way, without
so much of the pain that comes with typing out the same blocks of code
whenever you want to do should-be simple tasks such as parsing past a
definition you already made.

It's also a handy general toolkit for you to use as you make your parser,
since it comes with an easy-to-use visualizer and catches relatively common
mistakes you might make (typos!).

## Quick Start

### Getting Started

Syn is *really* easy to use - here's a simple demo:

```js
const isValidIdentifierChar = function(char) {
  if (char === ' ') {
    return false
  }

  return true
}

const parser = Syn.makeParser({
  rootSyn: 'Identifier',

  syns: {
    Identifier: syn => {
      while (syn.code[syn.i] && isValidIdentifierChar(syn.code[syn.i])) {
        syn.i++
      }

      syn.data.string = syn.code.slice(syn.startI, syn.i)
    }
  }
})

console.log(parser('abc'))
```

(Demo/file [here](examples/tutorial/01.html))

If you run that anywhere where `Syn` is defined (you can get that by
including the `syn.js` script in your webpage), you should get an object that
looks something like this:

```js
Syn {
  type: 'Identifier',
  containedCode: 'abc',
  startI: 0,
  endI: 3,
  data: {
    string: 'abc'
  }
}
```

In that demo, we created a basic parser that parses past one *Identifier*
(that's why we put `'Identifier'` as the `rootSyn`). An *Identifier* is just
a piece of syntax we defined inside our program, and its logic is easy to
follow, since it's *just normal JavaScript code*:

```js
while (syn.code[syn.i] && isValidIdentifierChar(syn.code[syn.i])) {
  syn.i++
}

syn.data.string = syn.code.slice(syn.startI, syn.i)
```

First we parse past each valid identifier character - that really just means
we move the parser's index (`syn.i`) - only stopping if a character isn't a
valid identifier character (or there's no character there!). (Note that we
defined `isValidIdentifierChar` at the very top of the script. If you look at
it again, you'll see that it's just checking that the given character isn't
a space - so *Identifier*s can keep going on until you end up at a space!)

Then we get the actual string contents of that identifier by
[`slice`][string-slice]-ing the part of the code that we parsed past. We
can use the start index (provided by `syn`) and the current index (that we
manipulated) as the start and end of where we'll slice from the given piece
of code. We store that inside of `syn.data.string` - you should always store
data about the definition you made inside of `syn.data`.

[string-slice]: <https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/slice>
  (String.prototype.slice)

### Using parsePast

However, of course, most programming languages don't have programs that are
made out of *one* identifier. So let's make it use multiple!

```js

// You know where this goes.
syns: {
  Identifier: syn => { /* .. */ }

  Program: syn => {
    syn.data.identifiers = []

    while (syn.code[syn.i]) {
      syn.data.identifiers.push(syn.parsePast('Identifier'))
      syn.parsePastString(' ')
    }
  }
}

// Don't forget to change the rootSyn!
rootSyn: 'Program'

// And now a new test program
console.log(parser('Foo bar baz kaz '))
```

(Demo/file [here](examples/tutorial/02.html).)

That should get you an object that looks something like this:

```js
Syn (Program) {
  containedCode: 'Foo bar baz kaz ',
  data: {
    identifiers: [
      Syn (Expression) { containedCode: 'Foo' },
      Syn (Expression) { containedCode: 'bar' },
      Syn (Expression) { containedCode: 'baz' },
      Syn (Expression) { containedCode: 'kaz' }
    ]
  }
}
```

### Using visualSyn

But.. that's not what you see in your console. *This* is what you see in you
console:

[![A bit big](http://i.imgur.com/NkjX540.png)](http://i.imgur.com/lx6xGea.png)

And that's a problem. So here's what saves you: `visualSyn`!

Let's show you how to use it:

```js
syns: {
  Identifier: syn => {
    syn.data._visual = {
      string: 'string'
    }

    // The rest of our Identifier code
  },

  Program: syn => {
    syn.data._visual = {
      identifiers: 'synArray'
    }
  }
}

// Time to change how we look at the Program syn.. this should be at the
// bottom of the program, replacing the old console.log.
const program = parser('Foo bar baz kaz ')
console.log(program)
document.getElementById('target').appendChild(visualSyn(program))
```

(Demo/file [here](examples/tutorial/03.html).)

And that looks much better:

[![Better](http://i.imgur.com/UAyBx6m.png)](http://i.imgur.com/oJrcS3R.png)

(Future designs may look *very* different!)

### Using tryToParsePast

Now you've made your super simple programming language parser that works by
splitting up its given code multiple Identifiers (i.e. pieces of text
separated by spaces) into a Program. That's great, but you can't *do* much
with it - besides expand it, of course!

Let's make another kind of thing you can give to a Program - a "VariableSet".

```js
// Only the gist of the changes are in this snippet - see the actual document
// for more info!

syns: {
  // The Identifier code

  VariableSet: syn => {
    syn.data._visual = {
      identifier: 'syn',
      value: 'syn'
    }

    syn.data.identifier = syn.parsePast('Identifier')
    syn.parsePastString('=')
    syn.data.value = syn.parsePast('Identifier')
  },

  Program: syn => {
    // The rest of the Program code

    while (syn.code[syn.i]) {
      const statement = syn.tryToParsePast('VariableSet', 'Identifier')
      syn.data.statements.push(statement)

      syn.parsePastString(' ')
    }
  }
}
```

(Demo/file [here](exampels/tutorials/04.html).)

Most important are these two lines:

```js
const statement = syn.tryToParsePast('VariableSet', 'Identifier')
syn.data.statements.push(statement)
```

That's a new function - `tryToParsePast`. It makes an attempt to parse past
each of the given syn types, in order (left to right), and either returns the
successfully parsed syn or an error (since it couldn't parse *any* of them).

So, in our parser, we try to parse past a VariableSet, or, if that fails, an
Identifier, and then we add that to the `syn.data.statements` array.

`tryToParsePast` is useful for whenever you want to use any choice from a
selection of syntaxes. That's handy, for example, in an Expression
definition, or a Statement definition (after all - you'll probably want to
use Expressions and Statements more than one time in a parser).

## API Reference

### `Syn`

The general class that represents a piece of syntax. Constructed (usually) by
various methods of Syn.

#### `Syn.makeParser(lang)`

Makes a simple function that can be called with a piece of code (a string) to
get a syn from that code.

It expects a single object argument, `lang`, which should follow this general
syntax:

```js
lang = {
  rootSyn: /* The definition string of the syn that should be parsed past as
              the "root" syn. */

  syns: {
    /* definition name - should be UpperCamelCase */: syn => {
      /* Code that manipulates the syn object, which is a new instance of Syn
         specifically designed to be used by this function. */
    }
  }
}
```

#### `(Syn instance).parsePast(synType)`

Moves the parser index past a syn definition, according to that definition's
function, and returns the resulting syn after calling the definition's
function with a new syn.

#### `(Syn instance).parsePastString(string)`

Moves the parser index past a string, if the parser index is currently placed
immediately behind that string; otherwise errors.

#### `(Syn instance).tryToParsePast(...tries)`

Attempts to parse past each of the passed syn types, until one is successful,
at which point it returns the syn made. If none are successful, errors.

#### `(Syn instance).failed(msg)`

Returns a `SynError` object with the given message, customized to this syn.
**Does not throw the error** - that needs to be done outside of `.failed`:

```js
if (syn.code[syn.i] !== '(') {
  throw syn.failed('Missing parenthesis')
}
```

### `SynError` (extends `Error`)

A subclass of `Error` customized to use a more meaningful message related to
a `Syn` instance. Created by `(Syn instance).failed`.
