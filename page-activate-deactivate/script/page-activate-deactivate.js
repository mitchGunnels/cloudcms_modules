define(function(require, exports, module) {
  /*********************
   * Allow for activation/deactivation of various page types 
   * and associated documents from Dashboard
   * ******************/

  var $ = require("jquery");
  var dashletSelector = ".htmldashlet .body .cricket-activation-deactivation"

  var activeClass = "active"
  var activeSelector = "." + activeClass

  var typeClass = "activation-page-type"
  var typeSelector = dashletSelector + " ." + typeClass
  var typeSelectSelector = typeSelector + " select"
  var typeSelect = '<div class="' + typeClass + '"><label>Page Type<select><option value="page">Page</option><option value="page-support-article">Support Article Page</option><option value="page-support-category">Support Category Page</option><option value="page-support-home">Support Home Page</option></select></label></div>'

  var pageListClass = "activation-page-list"
  var pageListSelector = dashletSelector + " ." + pageListClass
  var pageListSelectSelector = pageListSelector + " select"

  var activateClass = "activation-activate"
  var activateSelector = dashletSelector + " ." + activateClass
  var activateButtonSelector = activateSelector + " input"
  var activateButton = '<div class="' + activateClass + '"><input type="button" value="Activate" /></div>'

  var deactivateClass = "activation-deactivate"
  var deactivateSelector = dashletSelector + " ." + deactivateClass
  var deactivateButtonSelector = deactivateSelector + " input"
  var deactivateButton = '<div class="' + deactivateClass + '"><input type="button" value="Deactivate" /></div>'

  var messageClass = "activation-message"
  var messageSelector = dashletSelector + " ." + messageClass
  var message = '<div class=' + messageClass + '></div>'
  var errorMessageClass = "errorMessage"
  var errorMessageSelector = messageSelector + "." + errorMessageClass
  var successMessageClass = "successMessage"
  var successMessageSelector = messageSelector + "." + successMessageClass

  var buttonsClass = "activation-buttons"
  var buttonsSelector = dashletSelector + " ." + buttonsClass
  var buttons = '<div class="' + buttonsClass + '">' + activateButton + deactivateButton + '</div>'

  var contentClass = "content"
  var contentSelector = dashletSelector + " ." + contentClass
  var content = '<div class="' + contentClass + '"></div>'

  var activationStyles = contentSelector + " { background: #fff; border: 1px solid #ccc; padding: 10px; }" +
    buttonsSelector + " { background: #fff; border-top: none; text-align: right; }" +
    activateSelector + ", " + deactivateSelector + " { display: inline-block; margin: 10px 0 0 10px; }" +
    dashletSelector + " label { width: 100%; display: flex; flex-direction: column; }" +
    errorMessageSelector + " { color: #a94442; }" +
    successMessageSelector + " { color: rgb(39, 174, 96); }"


  function genericErrorLoggerHalter(err) {
    console.error(err);
    return false;
  }

  function genericMessagingErrorLoggerHalter(err) {
    setMessage("There was a problem. Please contact the CMS team about the document(s) you are trying to modify", errorMessageClass)
    enableButtons()
    console.error(err)
    return false
  }

  function getChain() {
    var branch = Ratchet.observable('branch').get()
    var chain = Chain(branch)
    return chain;
  }

  function disableButtons() {
    $(activateButtonSelector + ", " + deactivateButtonSelector).attr("disabled", "disabled")
  }

  function enableButtons() {
    $(activateButtonSelector + ", " + deactivateButtonSelector).removeAttr("disabled")
  }

  function setMessage(msg, msgClass) {
    clearMessage()
    $(messageSelector).addClass(msgClass).text(msg)
  }

  function clearMessage() {
    $(messageSelector).removeClass([errorMessageClass, successMessageClass].join(" ")).empty()
  }

  function getPages() {
    var chain = getChain()
    var pageType = $(typeSelectSelector).val()
    var query = {
      "_type": "cricket:" + pageType,
    }

    disableButtons()
    if (chain.queryNodes) {
      chain.trap(genericErrorLoggerHalter).queryNodes(query).then(function () {
        var pages = this.asArray()
        populateSelect(pages)
        enableButtons()
      })
    }
  }

  function populateSelect(pages) {
    var pageListSelect = '<div class="' + pageListClass + '"><label>Page Title<select name="">'
    var pageList = $(pageListSelector)

    //populate options inside select
    pages.forEach(function (page, index) {
      pageListSelect += '<option value="' + page._doc + '">' + page.title + '</option>'
    })
    pageListSelect += '</select></label></div>'

    //remove the old list
    pageList.remove()
    //insert into DOM
    $(typeSelector).after(pageListSelect)
    //enable buttons
    enableButtons()
  }

  function populateDashlet() {
    $(dashletSelector).append("<style>" + activationStyles + "</style>")
    $(dashletSelector).append(content)

    var contentElem = $(contentSelector)
    contentElem.append(typeSelect)
    contentElem.append(message)
    contentElem.append(buttons)
    //populate initial page title select
    getPages()
  }

  $(document).on('cloudcms-ready', function(event) {
    var branch
    if (Ratchet) {
      branch = Ratchet.observable('branch').get()
    }
    //only inject form if user is on branch
    if (branch && !branch.isMaster()) {
      populateDashlet()
    }
  })

  function activateDeactivatePage(options) {
    /***
     * update page only
     */
    var pageType = $(typeSelectSelector).val()
    var query = {"_type": "cricket:" + pageType}

    var docId = $(pageListSelectSelector).val()
    query._doc = docId

    options.chain.trap(function (err) {
      //page not found
      console.error(err)
      setMessage("Page not found", errorMessageClass)
      enableButtons()
    }).queryOne(query).then(function() {
      var page = Chain(this)
      page.active = options.activeVal
      page.trap(genericMessagingErrorLoggerHalter).update().then(function () {
        setMessage(this.title + " has been " + options.updateVerb + " successfully", successMessageClass)
        enableButtons()
      })
    })
  }

  function handleActivateDeactivate() {
    var options = {
      chain: getChain(),
      activeVal: "Activate" === $(this).val() ? "y": "n",
      updateVerb: "Activate" === $(this).val() ? "activated" : "deactivated"
    }

    clearMessage()
    disableButtons()

    activateDeactivatePage(options)
  }

  $(document).on('change', typeSelectSelector, getPages)
  $(document).on('click', activateButtonSelector + ', ' + deactivateButtonSelector, handleActivateDeactivate)
});
