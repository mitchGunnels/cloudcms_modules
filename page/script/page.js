define(function(require, exports, module) {
  /*********************
   * Prevent addition of page/page-* documents with duplicate urls of existing documents
   * ******************/


  var $ = require("jquery");
  var duplicateUrlString = "Oh-Oh, it looks like another page is already using that URL."
  var validUrlString = "The URL is not being used, you are good to go."
  var errorColor = "#a94442"
  var validColor = "rgb(39, 174, 96)"
  var saveButtonSelector = ".buttonbar .btn.save, .btn-toolbar .btn.save, .btn.btn-success.wizard-next"
  var urlFieldSelector = ".alpaca-field [data-alpaca-field-name=urlList]"
  var urlTextSelector = ".alpaca-field [name=urlList_0_url]"
  var helpBlockSelector = ".alpaca-helper.help-block"
  var validUrlClass = "valid-url-message"
  var validUrlSelector = "." + validUrlClass
  var disabled = "disabled"
  var disabledSelector = "." + disabled
  var hiddenClass = "hidden"
  var duplicateUrlClass = "duplicate-url-message"
  var duplicateUrlSelector = "." + duplicateUrlClass
  var latestPagesRequestTime
  var timer = undefined
  var docId = null
  var isValid = false

  function disableSave() {
    //clear out changes first
    enableSave()

    //grab all active save buttons
    var saveButtons = $(saveButtonSelector)
    saveButtons.filter(disabledSelector).remove()
    saveButtons.each(function () {
      var button = $(this)
      var disabledButton = button.clone()

      //clone button to disable click submit and hide active button
      disabledButton.attr(disabled, disabled)
      disabledButton.addClass(disabled)

      button.after(disabledButton)
      button.addClass(hiddenClass)
    })
  }
  
  function enableSave() {
    //remove clone buttons (placeholders)
    $(saveButtonSelector).filter(disabledSelector).remove()
    //show active buttons
    $(saveButtonSelector).removeClass(hiddenClass)
    //enable submit of form (only for Create dialog)
  }

  function clearMessages() {
    $(duplicateUrlSelector + ", " + validUrlSelector).remove()
  }

  function setUrlInvalid() {
    isValid = false
    disableSave()
    //preemptively remove to prevent occasional double insertion
    clearMessages()
    //add message text
    $(urlFieldSelector).find(helpBlockSelector).after(
      "<p class='" + duplicateUrlClass + "' style='color: " + errorColor + ";'>" + duplicateUrlString + "</p>")
  }

  function setUrlValid() {
    isValid = true
    enableSave()
    //remove message text
    clearMessages()
    //add message text
    $(urlFieldSelector).find(helpBlockSelector).after(
      "<p class='" + validUrlClass + "' style='color: " + validColor + ";'>" + validUrlString + "</p>")
  }

  function genericErrorLoggerHalter(err) {
    console.error(err);
    return false;
  }

  function queryForPages(url) {
    var branch = Ratchet.observable('branch').get()
    var chain = Chain(branch).trap(genericErrorLoggerHalter)
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
      }
    })
  }

  function findIdenticalUrlPages(event) {
    //if not valid and enter key pressed, do not save!
    if (!isValid && event && event.key && "Enter" === event.key) {
      event.stopPropagation()
      event.preventDefault()
    } else {
      latestPagesRequestTime = new Date().getTime()
      var pagesRequestTime = new Date().getTime()
      var url

      //disable early as response timing varies
      disableSave()
      clearMessages()

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
          enableSave()
        }
      }, 100)
    }
  }

  $(document).on('cloudcms-ready', function(event) {
    $(urlTextSelector).off()
    //detect if current page is edit properties
    var editPropertiesPattern = /^.*\/documents\/(\w+)\/properties$/
    var isEditProperties = editPropertiesPattern.test(location.href)
    if (isEditProperties) {
      docId = location.href.replace(editPropertiesPattern, '$1')
      findIdenticalUrlPages()
    } else {
      //if not on edit properties, clear docId
      docId = null
    }

    $(document).on('keyup keydown paste cut change', urlTextSelector, findIdenticalUrlPages)
  })
});
