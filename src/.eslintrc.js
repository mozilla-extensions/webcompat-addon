"use strict";

module.exports = {
  "parserOptions": {
    "ecmaVersion": 8
  },
  "env": {
    "browser": true,
    "es6": true
  },
  "globals": {
    "Components": true,
    "chrome": true
  },
  "plugins": [
    "mozilla",
    "json",
    "promise"
  ],
  "rules": {
    "arrow-spacing": "error",
    "block-spacing": "error",
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "comma-spacing": ["error", {"after": true, "before": false}],
    "comma-style": "error",
    "complexity": ["error", 32],
    "computed-property-spacing": ["error", "never"],
    "consistent-return": "error",
    "dot-notation": "error",
    "eol-last": "error",
    "func-call-spacing": "error",
    "key-spacing": ["error", {
      "afterColon": true,
      "beforeColon": false,
      "mode": "minimum"
    }],
    "keyword-spacing": "error",
    "linebreak-style": ["error", "unix"],
    "max-depth": "off",
    "max-nested-callbacks": ["error", 10],
    "mozilla/avoid-nsISupportsString-preferences": "error",
    "mozilla/avoid-removeChild": "error",
    "mozilla/import-browser-window-globals": "error",
    "mozilla/import-globals": "error",
    "mozilla/no-import-into-var-and-global": "error",
    "mozilla/no-useless-parameters": "error",
    "mozilla/no-useless-removeEventListener": "error",
    "mozilla/use-default-preference-values": "error",
    "mozilla/use-ownerGlobal": "error",
    "no-array-constructor": "error",
    "no-class-assign": "error",
    "no-cond-assign": "error",
    "no-const-assign": "error",
    "no-control-regex": "error",
    "no-debugger": "error",
    "no-delete-var": "error",
    "no-dupe-args": "error",
    "no-dupe-class-members": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-else-return": "error",
    "no-empty": ["error", {"allowEmptyCatch": true}],
    "no-empty-character-class": "error",
    "no-empty-pattern": "error",
    "no-eval": "error",
    "no-ex-assign": "error",
    "no-extra-bind": "error",
    "no-extra-boolean-cast": "error",
    "no-extra-semi": "error",
    "no-func-assign": "error",
    "no-implied-eval": "error",
    "no-invalid-regexp": "error",
    "no-irregular-whitespace": "error",
    "no-iterator": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    "no-lonely-if": "error",
    "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
    "no-multi-spaces": ["error", { exceptions: {
      "ArrayExpression": true,
      "AssignmentExpression": true,
      "ObjectExpression": true,
      "VariableDeclarator": true
    } }],
    "no-native-reassign": "error",
    "no-nested-ternary": "error",
    "no-new-object": "error",
    "no-new-wrappers": "error",
    "no-obj-calls": "error",
    "no-octal": "error",
    "no-redeclare": "error",
    "no-regex-spaces": "error",
    "no-return-await": "error",
    "no-self-assign": "error",
    "no-self-compare": "error",
    "no-shadow-restricted-names": "error",
    "no-sparse-arrays": "error",
    "no-tabs": "error",
    "no-trailing-spaces": "error",
    "no-undef": "error",
    "no-unexpected-multiline": "error",
    "no-unneeded-ternary": "error",
    "no-unreachable": "error",
    "no-unsafe-finally": "error",
    "no-unsafe-negation": "error",
    "no-unused-vars": ["error", {
      "args": "none",
      "vars": "local",
      "varsIgnorePattern": "^Cc|Ci|Cu|Cr|EXPORTED_SYMBOLS"
    }],
    "no-useless-call": "error",
    "no-useless-concat": "error",
    "no-useless-return": "error",
    "no-whitespace-before-property": "error",
    "no-with": "error",
    "object-shorthand": ["error", "always", { "avoidQuotes": true }],
    "quotes": ["error", "double", {
      "allowTemplateLiterals": true,
      "avoidEscape": true
    }],
    "rest-spread-spacing": "error",
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", "never"],
    "space-infix-ops": ["error", { "int32Hint": true }],
    "space-unary-ops": ["error", {
      "nonwords": false,
      "overrides": {
        "typeof": false
      },
      "words": true
    }],
    "spaced-comment": "error",
    "use-isnan": "error",
    "valid-typeof": "error"
  }
};
