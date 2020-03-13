define((require, exports, module) => {
    /** *******************
     * Prevent addition of page/page-* documents with duplicate urls of existing documents
     * And similar unique-checks for other docs
     * ***************** */

    const $ = require('jquery');
    const duplicatePropertyString = 'Oh-Oh, it looks like another document is already using that value.';
    const validPropertyString = 'The value is not being used elsewhere, you are good to go.';
    const errorColor = '#a94442';
    const validColor = 'rgb(39, 174, 96)';
    const saveButtonSelector = '.buttonbar .btn.save, .btn-toolbar .btn.save, .btn.btn-success.wizard-next';
    const propertyFieldSelector = '.alpaca-field [data-alpaca-field-name=urlList], .alpaca-field [data-alpaca-field-name=errorCode]';
    const propertyTextSelector = '.alpaca-field [name=urlList_0_url], .alpaca-field [name=errorCode]';
    const helpBlockSelector = '.help-block';
    const validPropertyClass = 'valid-property-message';
    const validPropertySelector = `.${validPropertyClass}`;
    const disabled = 'disabled';
    const disabledSelector = `.${disabled}`;
    const hiddenClass = 'hidden';
    const duplicatePropertyClass = 'duplicate-property-message';
    const duplicatePropertySelector = `.${duplicatePropertyClass}`;
    let latestDupeCheckRequestTime;
    let timer;
    let docId = null;
    let isValid = false;

    let typeRegexWithUniqueProperty;
    let uniqueProperty;

    const propertiesList = [
        { regex: 'cricket:page(-.*)?', property: 'urlList.0.url' },
        { regex: 'cricket:error', property: 'errorCode' }
    ];

    function enableSave() {
        // remove clone buttons (placeholders)
        $(saveButtonSelector)
            .filter(disabledSelector)
            .remove();
        // show active buttons
        $(saveButtonSelector).removeClass(hiddenClass);
        // enable submit of form (only for Create dialog)
    }

    function detectTypeAndProperty() {
        // set type matcher/unique prop to undefined
        typeRegexWithUniqueProperty = undefined;
        uniqueProperty = undefined;
        // based on url pattern, set them to specific values
        let regex;
        propertiesList.forEach((prop) => {
            regex = new RegExp(prop.regex);
            if (regex.test(location.href)) {
                typeRegexWithUniqueProperty = prop.regex;
                uniqueProperty = prop.property;
            }
        });
    }

    function disableSave() {
        // clear out changes first
        enableSave();

        // grab all active save buttons
        const saveButtons = $(saveButtonSelector);
        saveButtons.filter(disabledSelector).remove();
        saveButtons.each(function() {
            const button = $(this);
            const disabledButton = button.clone();

            // clone button to disable click submit and hide active button
            disabledButton.attr(disabled, disabled);
            disabledButton.addClass(disabled);

            button.after(disabledButton);
            button.addClass(hiddenClass);
        });
    }

    function clearMessages() {
        $(`${duplicatePropertySelector}, ${validPropertySelector}`).remove();
    }

    function setPropertyInvalid() {
        isValid = false;
        disableSave();
        // preemptively remove to prevent occasional double insertion
        clearMessages();
        // add message text
        $(propertyFieldSelector)
            .find(helpBlockSelector)
            .after(`<p class='${duplicatePropertyClass}' style='color: ${errorColor};'>${duplicatePropertyString}</p>`);
    }

    function setPropertyValid() {
        isValid = true;
        enableSave();
        // remove message text
        clearMessages();
        // add message text
        $(propertyFieldSelector)
            .find(helpBlockSelector)
            .after(`<p class='${validPropertyClass}' style='color: ${validColor};'>${validPropertyString}</p>`);
    }

    function genericErrorLoggerHalter(err) {
        console.error(err);
        return false;
    }

    function queryForDocuments(value) {
        const branch = Ratchet.observable('branch').get();
        const chain = Chain(branch).trap(genericErrorLoggerHalter);
        const queryObject = {
            _type: {
                $regex: typeRegexWithUniqueProperty
            },
            _doc: {
                $ne: docId
            },
            [uniqueProperty]: value
        };
        return chain.queryNodes(queryObject);
    }

    function findIdenticalPropertyDocuments(event) {
        // if not valid and enter key pressed, do not save!
        if (!isValid && event && event.key && event.key === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
        } else {
            latestDupeCheckRequestTime = new Date().getTime();
            const docsRequestTime = new Date().getTime();
            let value;

            // disable early as response timing varies
            disableSave();
            clearMessages();

            // cancel previous request if new event comes in before it completes
            if (timer) {
                clearTimeout(timer);
            }

            // schedule scrape of url value after current thread has finished
            // (cut/paste event-driven changes do not reflect until then)
            timer = setTimeout(() => {
                timer = undefined;
                value = $(propertyTextSelector).val();

                if (value) {
                    queryForDocuments(value).then(function handleQueryResponse() {
                        // ensure only final check results in DOM update
                        if (docsRequestTime === latestDupeCheckRequestTime) {
                            const identicalValueDocs = this.asArray();
                            const docsCount = identicalValueDocs.length;
                            if (docsCount) {
                                setPropertyInvalid();
                            } else {
                                setPropertyValid();
                            }
                        }
                    });
                } else {
                    enableSave();
                }
            }, 100);
        }
    }

    $(document).on('cloudcms-ready', (event) => {
        $(propertyTextSelector).off();
        // detect if current page is edit properties
        const editPropertiesPattern = /^.*\/documents\/(\w+)\/properties$/;
        detectTypeAndProperty();
        const isEditProperties = editPropertiesPattern.test(location.href);
        if (isEditProperties) {
            docId = location.href.replace(editPropertiesPattern, '$1');
            findIdenticalPropertyDocuments();
        } else {
            // if not on edit properties, clear docId
            docId = null;
        }
        $(document).on('keyup keydown paste cut change', propertyTextSelector, findIdenticalPropertyDocuments);
    });
});
