define(function(require, exports, module) {
  /*********************
   * Allow for activation/deactivation of various page types 
   * and associated documents from Dashboard
   * ******************/

  var $ = require("jquery");
  var dashletSelector = ".htmldashlet .body .cricket-activation-deactivation"

  var activeClass = "active"
  var activeSelector = "." + activeClass
  var textInput = '<input type="text" />'

  var tabsClass = "activation-tabs"
  var tabsTabClass = "tab"
  var tabsSelector = dashletSelector + " ." + tabsClass
  var tabsTabSelector = tabsSelector + " ." + tabsTabClass
  var tabs = '<div class="' + tabsClass + '"><div class="' + tabsTabClass + ' ' + activeClass + ' phone">Phone</div><div class="' + tabsTabClass + ' accessory">Accessory</div><div class="tab page">Page</div></div>'

  var tabContentClass = "tab-content"
  var tabContentSelector = dashletSelector + " ." + tabContentClass
  var tabContentContentClass = "content"
  var tabContentContentSelector = tabContentSelector + " ." + tabContentContentClass
  var tabContentContentActiveSelector = tabContentContentSelector + activeSelector
  var tabContentContentPhoneClass = "phone"
  var tabContentContentAccessoryClass = "accessory"
  var tabContentContentPageClass = "page"
  var tabContent = '<div class="' + tabContentClass + '"><div class="' + tabContentContentClass + ' ' + tabContentContentPhoneClass + ' ' + activeClass + '"></div><div class="' + tabContentContentClass + ' ' +tabContentContentAccessoryClass + '"></div><div class="' + tabContentContentClass + ' ' + tabContentContentPageClass + '"></div></div>'

  var typeClass = "activation-page-type"
  var typeSelector = dashletSelector + " ." + typeClass
  var typeSelectSelector = typeSelector + " select"
  var typeSelect = '<div class="' + typeClass + '"><label>Page Type<select><option value="page">Page</option><option value="page-shop">Shop Page</option><option value="page-support-article">Support Article Page</option><option value="page-support-category">Support Category Page</option><option value="page-support-home">Support Home Page</option></select></label></div>'

  var pageListClass = "activation-page-list"
  var pageListSelector = dashletSelector + " ." + pageListClass
  var pageListSelectSelector = pageListSelector + " select"

  var urlTextClass = "activation-url"
  var detailsClass = "details"
  var parentClass = "parent"
  var pageClass = "page"
  var urlTextPageSelector = dashletSelector + " ." + urlTextClass + "." + pageClass
  var urlTextInput = '<div class="' + urlTextClass + '"><label>URL' + textInput + '</label></div>'

  var skuTextClass = "activation-sku"
  var skuSelector = dashletSelector + " ." + skuTextClass + " input"
  var skuTextInput = '<div class="' + skuTextClass + '"><label>Phone or Accessory SKU' + textInput + '</label></div>'

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


  var activationStyles = tabsSelector + " { position: relative; top: 1px; }" +
    tabsSelector + " .tab { display: inline-block; padding: 10px; cursor: pointer; background: #e9e9e9; border: 1px solid #ccc; border-bottom: none; }" +
    tabsSelector + " .tab" + activeSelector + " { background: #fff; border-bottom: 1px solid #fff; }" +
    tabContentSelector + " { background: #fff; border: 1px solid #ccc; border-bottom: none; padding: 10px; }" +
    tabContentSelector + " .content { display: none; }" +
    tabContentSelector + " .content" + activeSelector + " { display: block; }" +
    buttonsSelector + " { background: #fff; border: 1px solid #ccc; border-top: none; padding: 0 10px 10px; text-align: right; }" +
    activateSelector + ", " + deactivateSelector + " { display: inline-block; margin: 10px 0 0 10px; }" +
    dashletSelector + " label { width: 100%; display: flex; flex-direction: column; }" +
    messageSelector + " { border: 1px solid #ccc; border-width: 0 1px; padding: 0 10px; }" +
    errorMessageSelector + " { color: #a94442; }" +
    successMessageSelector + " { color: rgb(39, 174, 96); }"


  function genericErrorLoggerHalter(err) {
    console.error(err);
    return false;
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
      _type: "cricket:" + pageType,
    }
    var pageUrl = $(urlTextPageSelector)

    disableButtons()
    //remove select from DOM
    $(pageListSelector).remove()
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

    //populate options inside select
    pages.forEach(function (page, index) {
      pageListSelect += '<option value="' + page._doc + '">' + page.title + '</option>'
    })
    pageListSelect += '</select></label></div>'

    //insert into DOM
    $(typeSelector).after(pageListSelect)
    //enable buttons
    enableButtons()
  }

  $(document).on('cloudcms-ready', function(event) {
    //inject styles
    $(dashletSelector).append("<style>" + activationStyles + "</style>")

    //inject controls

    //tabs to change modes
    $(dashletSelector).append(tabs)

    //tab content areas
    $(dashletSelector).append(tabContent)

    //in first tab...
    var tab = $(dashletSelector).find(".content.phone")
    tab.append(skuTextInput)
    var details = $(urlTextInput).addClass(detailsClass)
    details.find("label").html("Details URL" + textInput)
    tab.append(details)
    var parent = $(urlTextInput).addClass(parentClass)
    parent.find("label").html("Parent URL" + textInput)
    tab.append(parent)

    //in second tab...
    tab = $(dashletSelector).find(".content.accessory")
    tab.append(skuTextInput)
    var details = $(urlTextInput).addClass(detailsClass)
    details.find("label").html("Details URL" + textInput)
    tab.append(details)

    //in third tab...
    tab = $(dashletSelector).find(".content.page")
    tab.append(typeSelect)
    var pageUrl = $(urlTextInput).addClass(pageClass)
    tab.append(pageUrl)

    //after tab contents...
    $(dashletSelector).append(message)
    $(dashletSelector).append(buttons)
    //populate initial page title select
    getPages()
  })

  function handleTabChange() {
    var activeTab = $(this)
    if (activeTab.hasClass(tabContentContentPageClass)) {
      hideShowUrlFieldForPageType()
    }
    var tabs = $(tabsTabSelector)
    var activeIndex = tabs.index(activeTab)
    var contents = $(tabContentContentSelector)

    tabs.removeClass(activeClass)
    activeTab.addClass(activeClass)
    contents.removeClass(activeClass)
    contents.eq(activeIndex).addClass(activeClass)

    clearMessage()
  }

  function handlePageTypeChange() {
    hideShowUrlFieldForPageType()
  }

  function isShopPage() {
    var pageType = $(typeSelectSelector).val()
    return "page-shop" === pageType
  }

  function hideShowUrlFieldForPageType() {
    var pageList = $(pageListSelector)
    var pageUrl = $(urlTextPageSelector)

    if (isShopPage()) {
    //for shop, provide url field
      pageList.hide()
      pageUrl.show()
    } else {
    //for all others, populate select options with page titles
      pageUrl.hide()
      getPages()
    }
  }

  function handleActivateDeactivate() {
    var chain = getChain()
    var activeVal = "Activate" === $(this).val() ? "y": "n"
    var activeTabContentContent = $(tabContentContentActiveSelector) 
    var updateVerb = ("y" === activeVal) ? "activated" : "deactivated"

    clearMessage()

    //for page tab
    if (activeTabContentContent.hasClass(tabContentContentPageClass)) {
      var pageType = $(typeSelectSelector).val()
      var query = {_type: "cricket:" + pageType}

      if (isShopPage()) {
        var url = $(urlTextPageSelector).find("input").val()
        query.urlList = {
          $elemMatch: {
            url: url
          }
        }
      } else {
        var docId = $(pageListSelectSelector).val()
        query._doc = docId
      }

      chain.trap(function (err) {
        //error messaging for page not found
        console.error(err)

      }).queryOne(query).then(function() {
        var page = Chain(this)
        disableButtons()
        page.active = activeVal
        page.trap(function(err) {
          //error messaging for failed update
          //handle err.message 
          console.error(err)
          //TODO handle /validation/.test(err.message)) differently?
          setMessage("There was a problem. Please contact the CMS team about the document(s) you are trying to modify", errorMessageClass)
          enableButtons()
        }).update().then(function () {
          //success messaging
          setMessage(this.title + " has been " + updateVerb + " successfully", successMessageClass)
          enableButtons()
        })
      })
    }
    //for accessory tab
    if (activeTabContentContent.hasClass(tabContentContentAccessoryClass)) {
      
    }
    //for phone tab
    if (activeTabContentContent.hasClass(tabContentContentPhoneClass)) {
      
    }
  }

  $(document).on('click', tabsTabSelector, handleTabChange)
  $(document).on('change', typeSelectSelector, handlePageTypeChange)
  $(document).on('click', activateButtonSelector + ', ' + deactivateButtonSelector, handleActivateDeactivate)
});
