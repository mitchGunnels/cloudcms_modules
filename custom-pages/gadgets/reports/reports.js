define(function (require, exports, module) {
    
    require('css!./styles/reports.css');
    const html = require('text!./templates/reports.html');
    
    const Empty = require('ratchet/dynamic/empty');
    
    const UI = require('ui');
    const $ = require('jquery')

    const [PAGE, PRODUCT, SKU, PRICESHEET] = [
        'page',
        'product',
        'sku',
        'price-sheet'
    ]
    const ReportBtnClasses = [PAGE, PRODUCT, SKU, PRICESHEET]

    const QueryTypes = {
        PAGE: {
            "$regex": "cricket:page(-.+)?"
        },
        PRODUCT: "cricket:product"
    }
    
    let branch;
    let platform;

    function buildQuery(reportType) {
        let query = { }
        switch (reportType) {
            case PAGE:
                query._type = QueryTypes.PAGE,
                query._fields = {
                    title: 1,
                    _type: 1,
                    "urlList.0.url": 1,
                    active: 1,
                    "_system.created_on": 1,
                    "_system.created_by": 1,
                    "_system.edited_on": 1,
                    "_system.edited_by": 1
                }
                break
            case PRODUCT:
                query._type = QueryTypes.PRODUCT
                break
            
            default:
                console.error('Invalid report type provided')
        }

        if (query._type) {
            return query
        } else {
            return false
        }
    }

    function genericErrorLoggerHalter(err) {
        console.error(err)
        return false
    }

    function exportReport(reportType) {
        let query = buildQuery(reportType)
        if (query) {
            let nodes
            let exportId

            Chain(branch).trap(genericErrorLoggerHalter).queryNodes(query, {limit: -1}).then(function() {
                nodes = this
                this.subchain(platform).trap(genericErrorLoggerHalter).runExport(nodes, {
                    package: "CSV",
                    includeMetadata: true,
                    fields: [                        
                        "title",
                        "_type",
                        "urlList[0]/url",
                        "active",
                        "_system/created_on/timestamp",
                        "_system/created_by",
                        "_system/edited_on/timestamp",
                        "_system/edited_by"
                    ]
                }, function (_exportId, _status) {
                    window.location.href = "/proxy/ref/exports/" + _exportId + "/download?a=true&download=" + reportType + ".csv"
                })

            })
        }
    }

    function handleReportButtonClick() {
        if(branch) {
            let btn = $(this)
            let report
            ReportBtnClasses.forEach(function (reportClass) {
                if (btn.hasClass(reportClass)) {
                    report = reportClass
                }
            })
            if (report) {
                exportReport(report)
            } else {
                console.error('Invalid report type provided')
            }
        }
    }

    $(document).on('click', '.reports-btn-group .btn', handleReportButtonClick)
    
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
            platform = branch.getRepository().getPlatform()
            
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
                
            });
        }
        
    }));
    
});



