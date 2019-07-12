define(function(require, exports, module) {
  var $ = require("jquery");
  var saveButtonSelector = ".buttonbar .btn.save, .btn-toolbar .btn.save, .btn.btn-success.wizard-next"
  var urlFieldSelector = ".alpaca-field [data-alpaca-field-name=urlList_0_url]"
  var urlTextSelector = ".alpaca-field [name=urlList_0_url]"
  var createContentButtonSelector = ".list-button-create-content"
  var branch = Ratchet.observable('branch').get()
  var chain = Chain(branch).trap(genericErrorLoggerHalter)
  var latestPagesRequestTime
  var typing = false
  var docId = null

  function setInvalidUrl() {
    $(saveButtonSelector).attr("disabled", "disabled")
  }
  
  function setValidUrl() {
    $(saveButtonSelector).removeAttr("disabled")
  }

  function genericErrorLoggerHalter(err) {
    console.error(err);
    return false;
  }

  function queryForPages(url) {
    return chain.queryNodes({
      _type: {
        $regex: "cricket:page(-.*)?"
      },
      _doc: {
        $ne: docId
       
      },
      urlList: {
        $elemMatch: {
          url: url
        }
      },
      active: 'y'
    })
  }

  function findIdenticalUrlPages() {
    latestPagesRequestTime = new Date().getTime()
    var pagesRequestTime = new Date().getTime()
    var url = $(urlTextSelector).val()

    queryForPages(url).then(function () {
      //ensure only final check results in DOM update
      if (pagesRequestTime === latestPagesRequestTime) {
        var identicalUrlPages = this.asArray()
        var pageCount = identicalUrlPages.length
        if (pageCount) {
          setInvalidUrl()
        } else {
          setValidUrl()
        }
      }
    })
  }

  $(document).on('cloudcms-ready', function(event) {
    $(urlTextSelector).off()
    //detect if current page is edit properties
    var pagePattern = /^.*\/documents\/(\w+)\/properties$/
    var isPage = pagePattern.test(location.href)
    if (isPage) {
      docId = location.href.replace(pagePattern, '$1')
      setInvalidUrl()
      findIdenticalUrlPages()
    }

    $(document).on('keyup paste', urlTextSelector, findIdenticalUrlPages)
  })
});
