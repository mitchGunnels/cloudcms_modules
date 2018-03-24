define(function(require, exports, module) {

    require("css!./flesch-kincaid.css");
    var html = require("text!./flesch-kincaid.html");

    var Empty = require("ratchet/dynamic/empty");

    var UI = require("ui");

    return UI.registerGadget("flesch-kincaid", Empty.extend({

        TEMPLATE: html,

        /**
         * Binds this gadget to the /flesch-kincaid route
         */
        setup: function() {
            this.get("/projects/{projectId}/flesch-kincaid", this.index);
        },

        /**
         * Puts variables into the model for rendering within our template.
         * Once we've finished setting up the model, we must fire callback().
         *
         * @param el
         * @param model
         * @param callback
         */
        prepareModel: function(el, model, callback) {

            // get the current project
            //var repository = this.observable("repository").get();
            var project = this.observable("project").get();
            var branch = this.observable("branch").get();
            var repository = branch.getRepository();

            console.log(Gitana.MergeConflict(repository));

            console.log('project', project);
            console.log('branch ', branch);
            console.log('repository ', repository);
            console.log('model', model);

            repository.queryChangesets({
                "branch": branch._doc
            }).each(function() {
                console.log("Found changeset: " + this.getId());

                var changesetId = this.getId();

                repository.listChangesetChildren(changesetId).each(function() {
                    console.log("The changeset: " + changesetId + " has child: " + this.getId());
                });

                // branch.readNode("8bc807d9b2fcf6621df3").then(function() {
                //     console.log("Found node: " + this.get("title"));
                // });


            });


            // call into base method and then set up the model
            this.base(el, model, function() {

                //model.project = project._doc;
                //model.branch = branch._doc;


                //console.log('repo', this.observable("repository")._doc);
                //console.log('repo', this.observable("repository").id);

                // assume we have a repository
                //var repository = "fe6166ac8042240542f8";
                // here is our branch id
                //var branchId = branch._doc;


                callback();

                // query for catalog:product instances
                // branch.queryNodes({ "_type": "catalog:product" }).then(function() {

                //     // store "products" on the model (as a list) and then fire callback
                //     model.products = this.asArray();

                //     // add "imageUrl" attribute to each product
                //     // add "browseUrl" attribute to each product
                //     for (var i = 0; i < model.products.length; i++)
                //     {
                //         var product = model.products[i];

                //         product.imageUrl256 = "/preview/repository/" + product.getRepositoryId() + "/branch/" + product.getBranchId() + "/node/" + product.getId() + "/default?size=256&name=preview256&force=true";
                //         product.imageUrl128 = "/preview/repository/" + product.getRepositoryId() + "/branch/" + product.getBranchId() + "/node/" + product.getId() + "/default?size=128&name=preview128&force=true";
                //         product.browseUrl = "/#/projects/" + project._doc + "/documents/" + product._doc;
                //     }

                //     callback();
                // });
            });
        },

        /**
         * This method gets called before the rendered DOM element is injected into the page.
         *
         * @param el the dom element
         * @param model the model used to render the template
         * @param callback
         */
        /*
        beforeSwap: function(el, model, callback)
        {
            this.base(el, model, function() {
                callback();
            });
        },
        */

        /**
         * This method gets called after the rendered DOM element has been injected into the page.
         *
         * @param el the new dom element (in page)
         * @param model the model used to render the template
         * @param originalContext the dispatch context used to inject
         * @param callback
         */
        afterSwap: function(el, model, originalContext, callback) {
            this.base(el, model, originalContext, function() {

                // find all .media-popups and attach to a lightbox
                // $(el).find(".media-popup").click(function(e) {

                //     e.preventDefault();

                //     var productIndex = $(this).attr("data-media-index");
                //     var product = model.products[productIndex];

                //     UI.showPopupModal({
                //         "title": "Viewing: " + product.title,
                //         "body": "<div style='text-align:center'><img src='" + product.imageUrl256 + "'></div>"
                //     });
                // });

                callback();
            });
        }

    }));

});