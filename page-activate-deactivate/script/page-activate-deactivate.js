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
  var tabContentContentPhoneClass = tabContentContentClass + " phone"
  var tabContentContentAccessoryClass = tabContentContentClass + " accessory"
  var tabContentContentPageClass = tabContentContentClass + " page"
  var tabContent = '<div class="' + tabContentClass + '"><div class="' + tabContentContentPhoneClass + ' ' + activeClass + '"></div><div class="' + tabContentContentAccessoryClass + '"></div><div class="' + tabContentContentPageClass + '"></div></div>'

  var typeClass = "activation-page-type"
  var typeSelector = dashletSelector + " ." + typeClass + " select"
  var typeSelect = '<div class="' + typeClass + '"><label>Page Type<select><option value="page">Page</option><option value="page-shop">Shop Page</option><option value="page-support-article">Support Article Page</option><option value="page-support-category">Support Category Page</option><option value="page-support-home">Support Home Page</option></select></label></div>'

  var pageListClass = "activation-page-list"
  var pageListSelector = dashletSelector + " ." + pageListClass

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
    activateSelector + ", " + deactivateSelector + " { display: inline-block; margin-left: 10px }" +
    dashletSelector + " label { width: 100%; display: flex; flex-direction: column; }"
    

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
    var pageUrl = $(urlTextPageSelector)

    //remove select from DOM
    $(pageListSelector).remove()
    //and hide url field
    pageUrl.hide()

    chain.queryNodes(query).then(function () {
      var pages = this.asArray()
      populateSelect(pages)
    })
  }

  //activate/deactivate
  function update() {
    //show error message if sku/details url missing
    //get sku
    //get page(s)
    //get product if parent page entered (not for accessories) or if product associated 
    //(ensure that pages and sku are connected, potentially by way of product)
    //set active flag 
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
    $(dashletSelector).append(buttons)
    //populate initial page title select
    getPages()
  })

  function handleTabChange() {
    var activeTab = $(this)
    var tabs = $(tabsTabSelector)
    var activeIndex = tabs.index(activeTab)
    var contents = $(tabContentContentSelector)

    tabs.removeClass(activeClass)
    activeTab.addClass(activeClass)
    contents.removeClass(activeClass)
    contents.eq(activeIndex).addClass(activeClass)
  }

  function handlePageTypeChange() {
    var pageType = $(this).val()
    var pageList = $(pageListSelector)
    var pageUrl = $(urlTextPageSelector)

    if ("page-shop" === pageType) {
    //for shop, provide url field
      pageList.hide()
      pageUrl.show()
    } else {
    //for all others, populate select options with page titles
      getPages()
    }
  }

  function handleActivate() {

  }

  function handleDeactivate() {
    
  }

  $(document).on('click', tabsTabSelector, handleTabChange)
  $(document).on('change', typeSelector, handlePageTypeChange)
  $(document).on('click', activateButtonSelector, handleActivate)
  $(document).on('click', deactivateButtonSelector, handleDeactivate)
});
