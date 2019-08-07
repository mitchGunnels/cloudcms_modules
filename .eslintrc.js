module.exports = {
    "env": {
        "browser": true,
        "es6": false
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        'define': 'readonly',
        'Gitana': 'readonly',
        'Chain': 'readonly',
        'Ratchet': 'readonly',
        'CKEDITOR': 'readonly'
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        'no-unused-vars': 0
    }
};
