module.exports = {
    env: {
        es6: true,
        node: false,
        mocha: true,
        amd: true,
        browser: true,
        jquery: true
    },
    globals: {
        Chain: true,
        Ratchet: true
    },
    plugins: ['prettier'],
    extends: ['airbnb'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'script',
        ecmaFeatures: {
            impliedStrict: false
        }
    },
    rules: {
        'no-underscore-dangle': "off",
        'space-before-function-paren': 'off',
        'no-restricted-globals': 'warn',
        'prettier/prettier': 'error',
        'prefer-arrow-callback': 'warn',
        strict: ['off'],
        'no-tabs': 'error',
        'import/no-unresolved': 0,
        indent: ['error', 4],
        'linebreak-style': ['off'],
        'comma-dangle': ['off'],
        'no-unused-vars': ['off'],
        'no-console': ['off'],
        'no-trailing-spaces': 'off',
        'max-len': ['error', 240],
        'import/prefer-default-export': 'off',
        'padded-blocks': 'off',
        'lines-between-class-members': 'off',
        'arrow-body-style': ['error', 'always'],
        'class-methods-use-this': 'off'
    }
};
