define(function(require, exports, module) {
  /*********************
   * Allow for activation/deactivation of various page types from Dashboard
   * ******************/

  var $ = require("jquery");
  var dashletSelector = ".htmldashlet .body .cricket-activation-deactivation"
  var successMessage = "The page was successfully updated."
  var failureMessage = "There was an error."
  var checkUrlSkuMessage = "Double-check the URL and SKU."
  var errorColor = "#a94442"
  var validColor = "rgb(39, 174, 96)"

  var tabsClass = "activation-tabs"
  var tabsSelector = dashletSelector + " ." + tabsClass
  var tabs = '<div class="' + tabsClass + '"><div class="tab active device">Device</div><div class="tab page">Page</div></div>'

  var tabContentClass = "tab-content"
  var tabContentSelector = dashletSelector + " ." + tabContentClass
  var tabContent = '<div class="' + tabContentClass + '"><div class="content active device"></div><div class="content page"></div></div>'

  var typeClass = "activation-page-type"
  var typeSelector = dashletSelector + " ." + typeClass + " select"
  var typeSelect = '<div class="' + typeClass + '"><label for="activation-page-type-select">Page Type</label><select id="activation-page-type-select"><option value="page">Page</option><option value="page-shop">Shop Page</option><option value="page-support-article">Support Article Page</option><option value="page-support-category">Support Category Page</option><option value="page-support-home">Support Home Page</option></select></div>'

  var pageListClass = "activation-page-list"
  var pageListSelector = dashletSelector + " ." + pageListClass

  var urlTextClass = "activation-url"
  var urlSelector = dashletSelector + " ." + urlTextClass + " input"
  var urlTextInput = '<div class="' + urlTextClass + '"><label for="activation-url-input">URL</label><input id="activation-url-input" type="text"></div>'

  var skuTextClass = "activation-sku"
  var skuSelector = dashletSelector + " ." + skuTextClass + " input"
  var skuTextInput = '<div class="' + skuTextClass + '"><label for="activation-sku-input">SKU</label><input id="activation-sku-input" type="text"></div>'

  var activateClass = "activation-activate"
  var activateSelector = dashletSelector + " ." + activateClass
  var activateButtonSelector = activateSelector + " input"
  var activateButton = '<div class="' + activateClass + '"><input type="button" value="Activate" /></div>'

  var deactivateClass = "activation-deactivate"
  var deactivateSelector = dashletSelector + " ." + deactivateClass
  var deactivateButtonSelector = deactivateSelector + " input"
  var deactivateButton = '<div class="' + deactivateClass + '"><input type="button" value="Deactivate" /></div>'

  var buttonsClass = "activation-buttons"
  var buttonsSelector = dashletSelector + " ." + buttonsClass
  var buttons = '<div class="' + buttonsClass + '">' + activateButton + deactivateButton + '</div>'

  var activationStyles = tabsSelector + " { position: relative; top: 1px; }" +
    tabsSelector + " .tab { display: inline-block; padding: 10px; cursor: pointer; background: #ccc; border: 1px solid #ccc; border-bottom: none; }" +
    tabsSelector + " .tab.active { background: #fff; }" +
    tabContentSelector + " { background: #fff; border: 1px solid #ccc; border-bottom: none; padding: 10px; }" +
    tabContentSelector + " .content { display: none; }" +
    tabContentSelector + " .content.active { display: block; }" +
    buttonsSelector + " { background: #fff; border: 1px solid #ccc; border-top: none; padding: 0 10px 10px; text-align: right; }" +
    activateSelector + ", " + deactivateSelector + " { display: inline-block; margin-left: 10px }"
    

  function genericErrorLoggerHalter(err) {
    console.error(err);
    return false;
  }

  function getPages() {
    var branch = Ratchet.observable('branch').get()
    var chain = Chain(branch).trap(genericErrorLoggerHalter)
    var pageType = $(typeSelector).val()
    var query = {
      _type: "cricket:" + pageType,
    }

    //remove select from DOM
    $(pageListSelector).remove()

    chain.queryNodes(query).then(function () {
      var pages = this.asArray()
      var pageListSelect = '<div class="' + pageListClass + '"><label for="activation-page-list-select">Page Title</label><select id="activation-page-list-select" name="">'

      //populate options inside select
      pages.forEach(function (page, index) {
        pageListSelect += '<option value="' + page._doc + '">' + page.title + '</option>'
      })
      pageListSelect += '</select></div>'

      //insert into DOM
      $(typeSelector).after(pageListSelect)
    })
  }

  function updatePage(isActive) {
    var branch = Ratchet.observable('branch').get()
    var chain = Chain(branch).trap(genericErrorLoggerHalter)
    var pageType = $(typeSelector).val()
    var url = $(urlSelector).val()
    var sku = $(skuSelector).val()
    var query = {
      _type: "cricket:" + pageType,
    }

    if ("page-shop" === pageType) {
      query.urlList = {
        $elemMatch: {
          url: url
        }
      }
    } else {
      query._doc = docId
    }
  }

  function populateSelect() {
    
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
    var tab = $(dashletSelector).find(".content.device")
    //text input for SKU (-shop)
    tab.append(skuTextInput)
    //text input for URL (-shop)
    var details = $(urlTextInput).addClass("details")
    details.find("label").text("Details URL")
    tab.append(details)
    var parent = $(urlTextInput).addClass("parent")
    parent.find("label").text("Parent URL")
    tab.append(parent)

    //in second tab...
    tab = $(dashletSelector).find(".content.page")
    tab.append(urlTextInput)

    //after tab contents...
    $(dashletSelector).append(buttons)
  })

  function handleTabChange() {
    debugger
  }

  function handlePageTypeChange() {
    var pageType = $(this).val()
    if ("page-shop" === pageType) {
    //for shop, provide url/sku fields only

    } else {
    //for all others, populate select options of page titles
      
    }
  }

  function handleActivate() {
    //pu
  }

  function handleDeactivate() {
    
  }

  $(document).on('click', tabsSelector + " .tab", handleTabChange)
  $(document).on('change', typeSelector, handlePageTypeChange)
  $(document).on('click', activateButtonSelector, handleActivate)
  $(document).on('click', deactivateButtonSelector, handleDeactivate)
});
