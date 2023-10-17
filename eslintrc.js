module.exports = {
  "extends": "airbnb-base",
  "root": true,
  "env": {
    "jest": true,
    "es6": true,
    "node" : true
  },
  "rules": {
    "prefer-destructuring": ["error", {
      "VariableDeclarator": {
        "object": true,
        "array": true,
      },
    }, {
      "enforceForRenamedProperties": false
    }],
    "import/no-cycle": "[0, { maxDepth: 2 }]",
    "max-len": "off",
    "linebreak-style": 0,
    "class-methods-use-this": 0,
    "no-unused-expressions": 0
  },
  "parser": "babel-eslint",
  "parserOptions": {
      "ecmaVersion": 2017,
      "sourceType": "module"
  },
  "globals": {
    "resp": true,
    "body": true,
  }
}