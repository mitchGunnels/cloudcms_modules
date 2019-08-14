define(function (require, exports, module) {

    //TODO reduce size of includes via lib
    require('css!./styles/reports.css');
    const XLSX = require('../../../lib/xlsx.js')
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
        [PAGE]: {
            "$regex": "cricket:page(-.+)?"
        },
        [PRODUCT]: "cricket:product",
        [SKU]: "cricket:sku",
        [PRICESHEET]: "cricket:price-list"
    }

    const TypeFields = {
        [PAGE]: [                        
            "title",
            "_type",
            "urlList[0]/url",
            "active",
            "_system/created_on/timestamp",
            "_system/created_by",
            "_system/edited_on/timestamp",
            "_system/edited_by"
        ],
        [PRODUCT]: [
            "title",
            "sol",
            "soli",
            "eol",
            "eoli",
            "active",
            "_system/created_on/timestamp",
            "_system/created_by",
            "_system/edited_on/timestamp",
            "_system/edited_by"
        ],
        [SKU]: [
            "title",
            "skuId",
            "sol",
            "soli",
            "eol",
            "eoli",
            "color[0]/hexValue",
            "color[0]/displayName",
            "active",
            "_system/created_on/timestamp",
            "_system/created_by",
            "_system/edited_on/timestamp",
            "_system/edited_by"
        ],
        [PRICESHEET]: [
            "title",
            "priceSkuList[0]/price[0]/priceType",
            "priceSkuList[0]/price[0]/priceValue",
            "priceSkuList[0]/price[1]/priceType",
            "priceSkuList[0]/price[1]/priceValue",
            "priceSkuList[0]/price[2]/priceType",
            "priceSkuList[0]/price[2]/priceValue",
            "priceSkuList[0]/sku[0]/sol",
            "priceSkuList[0]/sku[0]/soli",
            "priceSkuList[0]/sku[0]/eol",
            "priceSkuList[0]/sku[0]/eoli",
            "active",
            "_system/created_on/timestamp",
            "_system/created_by",
            "_system/edited_on/timestamp",
            "_system/edited_by"
        ]
    }
    
    let branch;
    let platform;

    function buildQuery(reportType) {
        let query = { }
        if (reportType in QueryTypes) {
            query._type = QueryTypes[reportType]
        } else {
            console.error('Invalid report type provided')
        }

        if (query._type) {
            return query
        } else {
            return false
        }
    }

    function buildFields(reportType, nodes) {
        let extendedFields = []
        if (PRODUCT === reportType) {
            let maxSkus = 0
            nodes.asArray().forEach(function (node) {
                if (node.skus.length > maxSkus) {
                    maxSkus = node.skus.length
                }
            })
            for(let index = 0; index < maxSkus; index++ ) {
                extendedFields.push(`skus[${index}]/skuId`)
            }
        }

        let fields = (TypeFields[reportType] || []).concat(extendedFields)
        return fields
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
                let fields = buildFields(reportType, nodes)
                this.subchain(platform).trap(genericErrorLoggerHalter).runExport(nodes, {
                    package: "CSV",
                    includeMetadata: true,
                    fields: fields
                }, function (_exportId, _status) {
                    Ratchet.unblock()
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
                Ratchet.block('Generating Report', 'This may take a while...', () => {
                    exportReport(report)
                })
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



