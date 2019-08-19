define(function (require, exports, module) {
    
    require('css!./styles/reports.css');
    const html = require('text!./templates/reports.html');
    
    const Empty = require('ratchet/dynamic/empty');
    
    const UI = require('ui');
    
    let branch;
    
    return UI.registerGadget('reports', Empty.extend({
        
        TEMPLATE: html,
        
        /**
         * Binds this gadget to the /admin-tools route
         */
        setup: function () {
            console.log('setup()');
            this.get('/projects/{projectId}/reports', this.index);
        },
        
        /**
         * Puts variables into the model for rendering within our template.
         * Once we've finished setting up the model, we must fire callback().
         *
         * @param el
         * @param model
         * @param callback
         */
        prepareModel: function (el, model, callback) {
            
            // get the current project
            branch = this.observable('branch').get();
            
            // call into base method and then set up the model
            this.base(el, model, function () {
                console.log('prepareModel()');
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
        beforeSwap: function (el, model, callback) {
            this.base(el, model, function () {
                console.log('beforeSwap()');
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
        afterSwap: function (el, model, originalContext, callback) {
            this.base(el, model, originalContext, function () {
                console.log('afterSwap()');
                
                // eslint-disable-next-line no-undef
                $(el).find('.btn.btn-primary').click(function (e) {
                    
                    e.preventDefault();
                    
                    UI.showPopupModal({
                        'title': 'Running report for: ' + branch.getTitle().toUpperCase(),
                        'body': '<div style="text-align:center">I am fancy</div>'
                    });
                    callback();
                });
            });
        }
        
    }));
    
});