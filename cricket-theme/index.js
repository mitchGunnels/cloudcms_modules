define((require, exports, module) => {
    const UI = require('ui');

    const moduleId = UI.extractModuleID(module.uri);
    // register the theme: "cricket"
    UI.registerTheme({
        key: 'cricket',
        title: 'Cricket',
        module: `_modules/${moduleId}/cricket-theme.js`
    });
});
