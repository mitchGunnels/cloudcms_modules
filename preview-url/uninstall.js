define((require) => {
    const r = {};

    r.uninstall = function(observableHolder, project, callback) {
        callback();
    };

    return r;
});
