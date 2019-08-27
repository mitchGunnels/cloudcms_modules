define(function (require, exports, module) {
    let XLSX = {}
    let wb

    //TODO reduce size of includes via lib
    require('css!./styles/reports.css');
    require(['./lib/dist/xlsx.full.min.js'], function() {
        //global function defined in dependency
        make_xlsx_lib(XLSX) //eslint-disable-line no-undef
    });
    const html = require('text!./templates/reports.html');
    
    const Empty = require('ratchet/dynamic/empty');
    
    const UI = require('ui');
    const $ = require('jquery')
    const OneTeam = require('oneteam')

    const [PAGE, PRODUCT, SKU, PRICESHEET] = [
        'page',
        'product',
        'sku',
        'price-sheet'
    ]
    const ReportTypes = [PAGE, PRODUCT, SKU, PRICESHEET]

    const QueryTypes = {
        [PAGE]: {
            "$regex": "cricket:page(-.+)?"
        },
        [PRODUCT]: "cricket:product",
        [SKU]: "cricket:sku",
        [PRICESHEET]: "cricket:price-list"
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

    function genericErrorLoggerHalter(err) {
        console.error(err)
        return false
    }

    const UniversalFields = ["title", "active"]
    const LifeCycleFields = ["sol", "soli", "eol", "eoli"]
    const HeaderStrings = {
        CREATEDON: "Created On",
        EDITEDON: "Edited On",
        CREATEDBY: "Created By",
        EDITEDBY: "Edited By",
        URL: "URL",
        SKUID: "SKU",
        HEXVALUE: "Hex Value",
        DISPLAYNAME: "Display Name",
        TITLE: "Title",
        ACTIVE: "Active",
        TYPE: "Type",
        SOL: "Start of Life",
        SOLI: "Start of Life Immediate",
        EOL: "End of Life",
        EOLI: "End of Life Immediate"
    }

    function buildWorksheet({nodes, reportType}) {
        let header = []
        let filteredNodes = []

        function formatDate(date) {
            var d = new Date(date.ms)
            return OneTeam.formatDateTime4(d)
        }

        header = header.concat([HeaderStrings.TYPE, HeaderStrings.TITLE, HeaderStrings.ACTIVE, HeaderStrings.CREATEDON, HeaderStrings.CREATEDBY, HeaderStrings.EDITEDON, HeaderStrings.EDITEDBY])

        if (PAGE === reportType) {
            header.push(HeaderStrings.URL)
        }
        if (SKU === reportType) {
            header = header.concat([HeaderStrings.SKUID, HeaderStrings.HEXVALUE, HeaderStrings.DISPLAYNAME])
        }

        nodes = nodes.map((record) => {
            let rec = {}

            //copy common fields
            rec[HeaderStrings.TYPE] = record.getTypeQName()
            rec[HeaderStrings.TITLE] = record.title
            rec[HeaderStrings.ACTIVE] = record.active
            let meta = record.getSystemMetadata()
            rec[HeaderStrings.CREATEDON] = formatDate(meta.getCreatedOn())
            rec[HeaderStrings.CREATEDBY] = meta.getCreatedBy()
            //switch to our timezone
            rec[HeaderStrings.EDITEDON] = formatDate(meta.edited_on)
            rec[HeaderStrings.EDITEDBY] = meta.edited_by

            LifeCycleFields.forEach((fieldName) => {
                if (record[fieldName]) {
                    let headerString = HeaderStrings[fieldName.toUpperCase()]
                    rec[headerString] = record[fieldName]
                    if (-1 === header.indexOf(HeaderStrings.SOL)) {
                        header = header.concat([HeaderStrings.SOL, HeaderStrings.SOLI, HeaderStrings.EOL, HeaderStrings.EOLI])
                    }
                }
            })

            //copy all skus' .skuId to top-level prop on rec
            if (PRODUCT === reportType) {
                record.skus.forEach(function (sku, index) {
                    let field = `Sku ${index}`
                    rec[field] = sku.skuId

                    if (-1 === header.indexOf(field)) {
                        header.push(field)
                    }
                })
            }

            //copy over product page.urlList[0].url
            if (PAGE === reportType) {
                if (record.urlList && record.urlList[0]) {
                    rec[HeaderStrings.URL] = record.urlList[0].url
                }
            }

            //copy over sku.color[0].hexValue and displayName
            if (SKU === reportType) {
                rec[HeaderStrings.SKUID] = record.skuId

                if (record.color && record.color[0]) {
                    rec[HeaderStrings.HEXVALUE] = record.color[0].hexValue
                    rec[HeaderStrings.DISPLAYNAME] = record.color[0].displayName
                }
            }

            //copy over priceSkuList[0].price[ 0-2 ].priceType and priceValue
            if (PRICESHEET === reportType) {
                if (record.priceSkuList && record.priceSkuList[0]) {
                    record.priceSkuList[0].price.forEach(function (price, index) {
                        let priceIndex = `Price ${index}`
                        let priceTypeField = `${priceIndex} Type`
                        let priceValueField = `${priceIndex} Value`

                        rec[priceTypeField] = price.priceType
                        rec[priceValueField] = price.priceValue

                        if (-1 === header.indexOf(priceTypeField)) {
                            header = header.concat([priceTypeField, priceValueField])
                        }
                    })
                }
            }

            return rec
        })

        return XLSX.utils.json_to_sheet(nodes, { header: header })
    }

    function queryNodesThen(query, callback) {
        Chain(branch).trap(genericErrorLoggerHalter).queryNodes(query, {limit: -1}).then(callback)
    }

    function exportHolisticReport() {
        let workbook = XLSX.utils.book_new()

        Ratchet.block('Generating Report', 'This may take a while...', () => {
            ReportTypes.forEach((reportType) => {
                let query = buildQuery(reportType)
                if (query) {
                    queryNodesThen(query, function () {
                        workbook.SheetNames.push(reportType)
                        workbook.Sheets[reportType] = buildWorksheet({
                            reportType: reportType,
                            nodes: this.asArray()
                        })

                        if (ReportTypes.length === workbook.SheetNames.length) {
                            XLSX.writeFile(workbook, `holistic.xlsx`)
                            Ratchet.unblock()
                        }
                    })

                }
            })

        })
    }

    function exportReport(reportType) {
        Ratchet.block('Generating Report', 'This may take a while...', () => {
            let query = buildQuery(reportType)
            if (query) {
                queryNodesThen(query, function() {
                    let workbook = XLSX.utils.book_new()
                    workbook.SheetNames.push(reportType)
                    workbook.Sheets[reportType] = buildWorksheet({
                        reportType: reportType,
                        nodes: this.asArray()
                    })

                    XLSX.writeFile(workbook, `${reportType}.xlsx`)
                    Ratchet.unblock()
                })
            }

        })
    }

    function handleReportButtonClick() {
        if(branch) {
            let btn = $(this)
            let reportType
            ReportTypes.forEach(function (reportTypeClass) {
                if (btn.hasClass(reportTypeClass)) {
                    reportType = reportTypeClass
                }
            })
            if (btn.hasClass('holistic')) {
                exportHolisticReport()
            } else if (reportType) {
                exportReport(reportType)
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
})
