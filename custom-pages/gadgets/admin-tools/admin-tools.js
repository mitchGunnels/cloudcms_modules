define(function (require, exports, module) {
    
    require('css!./styles/admin-tools.css');
    const html = require('text!./templates/admin-tools.html');
    
    const Empty = require('ratchet/dynamic/empty');
    
    const UI = require('ui');
    
    let branch;
    
    return UI.registerGadget('admin-tools', Empty.extend({
        
        TEMPLATE: html,
        
        /**
         * Binds this gadget to the /admin-tools route
         */
        setup: function () {
            console.log('setup()');
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
                    
                    if (!branch.isMaster()) {
                        const repository = branch.getRepository();
                        
                        repository.readBranch('master').then(function () {
                            branch = this;
                        });
                    }
                    const repository = branch.getRepository();
                    const currentApplyDate = new Date(Date.now()).toISOString();
                    Chain(repository).trap((error) => {
                        UI.showError({
                            'title': 'Failed creating a snapshot of: ' + branch.getTitle(),
                            'body': `<div style="text-align:center">${error}</div>`
                        });
                        callback();
                    }).createSnapshot(branch.getTip(), {
                        title: currentApplyDate,
                        workspace: false
                    });
                    
                    UI.showModal({
                        'title': `Executed Snapshot Creation from: ${branch.getTitle().toUpperCase()}`,
                        'body': `<div style="text-align:center"> Please check the branches in a minute </div>`
                    });
                    callback();
                });
            });
            
        }
    }));
    
});