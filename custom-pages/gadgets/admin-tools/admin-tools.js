define((require, exports, module) => {
    require('css!./styles/admin-tools.css');
    const html = require('text!./templates/admin-tools.html');

    const Empty = require('ratchet/dynamic/empty');

    const UI = require('ui');
    const $ = require('jquery');
    const createSnapshot = require('./scripts/create-snapshot.js');

    const copyFrom = require('./scripts/copy.document.and.children.js');

    return UI.registerGadget(
        'admin-tools',
        Empty.extend({
            TEMPLATE: html,

            /**
             * Binds this gadget to the /admin-tools route
             */
            setup() {
                this.get('/projects/{projectId}/admin-tools', this.index);
            },

            /**
             * Puts variables into the model for rendering within our template.
             * Once we've finished setting up the model, we must fire callback().
             *
             * @param el
             * @param model
             * @param callback
             */
            prepareModel(el, model, callback) {
                // call into base method and then set up the model
                this.base(el, model, () => {
                    callback();
                });
            },

            /**
             * This method gets called before the rendered DOM element is injected into the page.
             *
             * @param el the dom element
             * @param model the model used to render the template
             * @param callback
             */
            beforeSwap(el, model, callback) {
                this.base(el, model, () => {
                    callback();
                });
            },

            /**
             * This method gets called after the rendered DOM element has been injected into the page.
             *
             * @param el the new dom element (in page)
             * @param model the model used to render the template
             * @param originalContext the dispatch context used to inject
             * @param callback
             */
            afterSwap(el, model, originalContext, callback) {
                this.base(el, model, originalContext, () => {
                    // Creates a snapshot
                    $(el)
                        .find('.btn.btn-primary')
                        .click(() => {
                            createSnapshot.run(callback);
                        });

                    $(el)
                        .find('.btn.btn-default')
                        .click(() => {
                            copyFrom.run(callback);
                        });
                });
            }
        })
    );
});
