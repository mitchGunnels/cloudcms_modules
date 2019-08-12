define(function (require, exports, module) {
    const $ = require("jquery");
    require("./diff-match-patch.js");
    require('css!./style.css');

    const dmp = new diff_match_patch();
    const windowHref = window.location.href;
    const dropdownToggleButton = ".dropdown-toggle";
    const dropdownMenu = ".dropdown-menu";
    const newDropdownOption = '<li class="diff-tool"><a title="Compare Text Versions">' +
        '<i class="fa fa-object-group"></i>&nbsp;Compare Text Versions</a></li>';
    const listItem = "li.diff-tool";
    const listItemAnchor = "li.diff-tool a";
    const activeListItem = "active";
    const disabled = "disabled";
    const disabledCursor = "disabled-cursor";
    const enabledCursor = "enabled-cursor";
    const selectedItems = "input.list-check-box:checked";

    function enableDiffTool() {
        $(listItem).removeClass(disabled);
        $(listItem).addClass(activeListItem);
        $(listItemAnchor).addClass(enabledCursor);
    }

    function disableDiffTool() {
        $(listItem).removeClass(activeListItem);
        $(listItem).addClass(disabled);
        $(listItemAnchor).addClass(disabledCursor);
    }

    function isPageDocument() {
        // check list-row-info class innerHTML for anything that contains cricket:page*
        // will return true for "cricket:page", "cricket:page-support", etc
        const arrayOfInfoElements = $('#document-summary .list-row-info a');
        const regex = /cricket:page(-.*)?/;
        return $.grep(arrayOfInfoElements, function (element) {
            return regex.test(element.innerHTML);
        }).length;
    }

    function isVersionsList() {
        return windowHref.indexOf("versions") > -1;
    }

    function isThisPageVersions() {
        return isPageDocument() && isVersionsList();
    }

    function isTwoItemsSelected() {
        return $(selectedItems).length === 2;
    }

    function showModal(title, content) {
        Ratchet.showModalMessage(
            `<div id='diff-modal-title'>${title}</div>`,
            `<div id='diff-modal-content'>${content}</div>`
        );
    }

    function renderDiff(oldDocumentVersion, newDocumentVersion) {
        if (!oldDocumentVersion && newDocumentVersion) {
            return `<div clalss="added-text">${newDocumentVersion}</div>`;
        }
        if (!newDocumentVersion && oldDocumentVersion) {
            return `<div class="removed-text">${oldDocumentVersion}</div>;`
        }
        if (!newDocumentVersion && !oldDocumentVersion) {
            return `<div>Both were empty</div>`
        }

        const delta = dmp.diff_main(oldDocumentVersion, newDocumentVersion);
        // make the diff human readable
        dmp.diff_cleanupSemantic(delta);

        // return an HTML element
        return dmp.diff_prettyHtml(delta);
    }

    function getSelectedItems() {
        // returns an array of the versions user selected
        let selectedItems = [];
        $('.document-versions .table').find('tr td input[type="checkbox"]:checked').closest('tr').filter(function () {
            const $this = $(this);

            const id = $this.attr('id'); // id = 134586:c8dfe996d5910f74ac9e/cf40e11e62dedcfd288d

            selectedItems.push(id);
        });
        return selectedItems;
    }

    function renderSku(options) {
        let modalContent = '';
        const additionalSkuFields = ['active', 'id', 'modelName', 'refurbished', 'skuId', 'title'];

        if (options.newSku.color && options.newSku.color[0]) {
            const colorFields = ['active', 'displayName', 'hexValue', 'id', 'title'];
            const newColor = options.newSku.color[0];
            const oldColor = options.oldSku.color[0];

            colorFields.forEach(field => {
                modalContent += `<div class='field-name'>color:${field}</div>`;
                modalContent += `<div class='field-content'>${renderDiff(oldColor[field], newColor[field])}</div>`;
            });
        }

        additionalSkuFields.forEach((field) => {
            modalContent += renderSkuField({
                type: `SKU:${field}`,
                oldSku: options.oldSku,
                newSku: options.newSku,
                field: field
            });
        });
        return modalContent;
    }

    function renderSkuField(options) {
        let modalContent = '';
        modalContent += `<div class='field-name'>${options.type}</div>`;
        modalContent += `<div class='field-content'>${renderDiff(options.oldSku[options.field], options.newSku[options.field])}</div>`;
        return modalContent;
    }

    function renderModal() {
        Ratchet.observable("document").get()
            // return all document versions on this page, no limit, sort with newest first
            .listVersions({ full: true, limit: -1, sort: { "_system.modified_on.ms": -1 } })
            .then(function () {
                let mainModalContent = '';
                let fieldDiff = '';
                let isError = false;
                const selectedItems = getSelectedItems();
                const versionsList = this.asArray()

                // given the array of all the versions on the page, find the ones we put a checkmark on
                const matchingResults = versionsList.filter(version => selectedItems.includes(version._doc));

                // remove all the superfluous functions and stuff, just give us the JSON
                const newDocumentVersion = matchingResults[0].json();
                const oldDocumentVersion = matchingResults[1].json();

                const modalTitle = newDocumentVersion.title;

                // TODO: delete these console logs
                console.log('new version => ', newDocumentVersion);
                console.log('old version => ', oldDocumentVersion);

                // determine if there is a content object
                if (matchingResults[1].getTypeQName() === 'cricket:page') {

                } else if (matchingResults[1].getTypeQName() === 'cricket:page-shop') {
                    // Print out metadata diffs
                    newDocumentVersion.metadata.forEach((item, index) => {
                        newValue = item.value;
                        newType = item.type;
                        mainModalContent += `<div class='field-name'>${newType}</div>`;
                        mainModalContent += `<div class='field-content'>${renderDiff(oldDocumentVersion.metadata[index].value, newValue)}</div>`;
                    });

                    // Print out Sku diffs
                    newDocumentVersion.skus.forEach((item, index) => {
                        mainModalContent += renderSku({
                            newSku: item,
                            oldSku: oldDocumentVersion.skus[index],
                            index
                        });
                    });

                    // Print out urlList diffs
                    if ((oldDocumentVersion.urlList  && oldDocumentVersion.urlList[0]) ||
                        (newDocumentVersion.urlList  && newDocumentVersion.urlList[0])) {
                        let oldUrl = (oldDocumentVersion.urlList[0] || {}).url;
                        let newUrl = (newDocumentVersion.urlList[0] || {}).url;
                        mainModalContent += `<div class='field-name'>Url List</div>`;
                        mainModalContent += `<div class='field-content'>${renderDiff(oldUrl, newUrl)}</div>`;
                    }

                    if (!isError) {
                        showModal(modalTitle, mainModalContent);
                    }
                }
            });
    }

    $(document).on('click', 'li.diff-tool.active', renderModal);

    $(document).on('cloudcms-ready', function () {
        if (isThisPageVersions()) {
            // insert a new option to the top of the select dropdown
            $(dropdownMenu).prepend(newDropdownOption);

            // detect click on existing dropdown menu and disable or enable our tool based on number of items selected
            $(dropdownToggleButton).on('click', function () {
                if (isTwoItemsSelected()) {
                    enableDiffTool();
                } else {
                    disableDiffTool();
                }
            });
        }
    });
});