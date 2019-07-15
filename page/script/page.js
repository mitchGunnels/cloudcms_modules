define(function(require, exports, module) {
  /*********************
   * Prevent addition of page/page-* documents with duplicate urls of existing documents
   * ******************/


  var $ = require("jquery");
  var duplicateUrlString = "Oh-Oh, it looks like another page is already using that URL."
  var errorColor = "#a94442"
  var saveButtonSelector = ".buttonbar .btn.save, .btn-toolbar .btn.save, .btn.btn-success.wizard-next"
  var urlFieldSelector = ".alpaca-field [data-alpaca-field-name=urlList]"
  var urlTextSelector = ".alpaca-field [name=urlList_0_url]"
  var helpBlockSelector = ".alpaca-helper.help-block"
  var duplicateUrlClass = "duplicate-url-message"
  var duplicateUrlSelector = "." + duplicateUrlClass
  var branch = Ratchet.observable('branch').get()
  var chain = Chain(branch).trap(genericErrorLoggerHalter)
  var latestPagesRequestTime
  var timer = undefined
  var docId = null

  function disableSave() {
    $(saveButtonSelector).attr("disabled", "disabled")
  }
  
  function enableSave() {
    $(saveButtonSelector).removeAttr("disabled")
  }

  function setUrlInvalid() {
    disableSave()
    //preemptively remove to prevent occasional double insertion
    $(urlFieldSelector).find(duplicateUrlSelector).remove()
    //add message text
    $(urlFieldSelector).find(helpBlockSelector).after(
      "<p class='" + duplicateUrlClass + "' style='color: " + errorColor + "'" + 
      errorColor + "'>" + duplicateUrlString + "</p>")
  }

  function setUrlValid() {
    enableSave()
    //remove message text
    $(urlFieldSelector).find(duplicateUrlSelector).remove()
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

  function findIdenticalUrlPages(event) {
    latestPagesRequestTime = new Date().getTime()
    var pagesRequestTime = new Date().getTime()
    var url

    //disable early as response timing varies
    disableSave()

    //cancel previous request if new event comes in before it completes
    if (timer) {
      clearTimeout(timer)
    }

    //schedule scrape of url value after current thread has finished
    //(cut/paste event-driven changes do not reflect until then)
    timer = setTimeout(function() {
      timer = undefined
      url = $(urlTextSelector).val()

      if (url) {
        queryForPages(url).then(function handleQueryResponse() {
          //ensure only final check results in DOM update
          if (pagesRequestTime === latestPagesRequestTime) {
            var identicalUrlPages = this.asArray()
            var pageCount = identicalUrlPages.length
            if (pageCount) {
              setUrlInvalid()
            } else {
              setUrlValid()
            }
          }
        })
      } else {
        setUrlValid()
      }
    }, 100)
  }

  $(document).on('cloudcms-ready', function(event) {
    $(urlTextSelector).off()
    //detect if current page is edit properties
    var pagePattern = /^.*\/documents\/(\w+)\/properties$/
    var isPage = pagePattern.test(location.href)
    if (isPage) {
      docId = location.href.replace(pagePattern, '$1')
      disableSave()
      findIdenticalUrlPages()
    }

    $(document).on('keyup paste cut', urlTextSelector, findIdenticalUrlPages)
  })
});
