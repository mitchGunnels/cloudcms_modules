define(function(require, exports, module) {
  /*********************
   * Allow for activation/deactivation of various page types from Dashboard
   * ******************/

  var $ = require("jquery");
  var dashletSelector = ".htmldashlet .body .page-activation"
  var activationStyles = ""

  var typeClass = "activation-page-type"
  var typeSelector = dashletSelector + " ." + typeClass + " select"
  var typeSelect = '<div class="' + typeClass + '"><label for="activation-page-type-select">Page Type</label><select id="activation-page-type-select"><option value="page">Page</option><option value="page-shop">Shop Page</option><option value="page-support-article">Support Article Page</option><option value="page-support-category">Support Category Page</option><option value="page-support-home">Support Home Page</option></select></div>'

  var urlTextClass = "activation-url"
  var urlSelector = dashletSelector + " ." + urlTextClass + " input"
  var urlTextInput = '<div class="' + urlTextClass + '"><label for="activation-url-input"></label><input class="activation-url-input" type="text"></div>'

  var skuTextClass = "activation-sku"
  var skuSelector = dashletSelector + " ." + skuTextClass + " input"
  var skuTextInput = '<div class="' + skuTextClass + '"><label for="activation-sku-input"></label><input class="activation-sku-input" type="text"></div>'

  var activateClass = "activation-activate"
  var activateSelector = dashletSelector + " ." + activateClass + " input"
  var activateButton = '<div class="' + activateClass + '"><input type="button" value="Activate"></div>'

  var deactivateClass = "activation-deactivate"
  var deactivateSelector = dashletSelector + " ." + deactivateClass + " input"
  var deactivateButton = '<div class="' + deactivateClass + '"><input type="button" value="Deactivate"></div>'

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
      },
      active: 'y'
    })
  }

  $(document).on('cloudcms-ready', function(event) {
    //look for dashboard 
    //inject controls
    //select box for type (page, -shop, -support-article, -support-category, -support-home)
    $(dashletSelector).append(typeSelect)
    //text input for URL (-shop)
    $(dashletSelector).append(urlTextInput)
    //text input for SKU (-shop)
    $(dashletSelector).append(skuTextInput)
    //button for Activate
    $(dashletSelector).append(activateButton)
    //button for Deactivate
    $(dashletSelector).append(deactivateButton)
  })

  function handlePageTypeChange() {
    //for shop, provide url/sku fields only
    //for all others, populate select options of page titles
  }

  function handleActivate() {
    //pu
  }

  function handleDeactivate() {
    
  }

  $(document).on('change', typeSelector, handlePageTypeChange)
  $(document).on('click', activateSelector, handleActivate)
  $(document).on('click', deactivateSelector, handleDeactivate)
});
