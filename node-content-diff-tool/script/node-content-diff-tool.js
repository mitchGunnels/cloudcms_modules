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
        // attach a specific class name

        Ratchet.showModal({
            title: `<div id='diff-modal-title'>${title}</div>`,
            body: `<div id='diff-modal-content'>${content}</div>`
        });
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
                modalContent += `<div class='field-name'>SKU:color:${field}</div>`;
                modalContent += `<div class='field-content'>${renderDiff(oldColor[field], newColor[field])}</div>`;
            });
        }

        additionalSkuFields.forEach(field => {
            modalContent += renderSkuField({
                type: `SKU${options.index}:${field}`,
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

    function buildPageContent(options) {
        if (options.newDocumentVersion.typeQName === 'cricket:header') {
            let modalContent = '';
            modalContent += `<div class='field-name'>${options.nodeKey}:${options.nodeIndex}:title</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.title, options.newDocumentVersion.title)}</div>`;
            modalContent += `<div class='field-name'>${options.nodeKey}:${options.nodeIndex}:header</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.header, options.newDocumentVersion.header)}</div>`;
            modalContent += `<div class='field-name'>${options.nodeKey}:${options.nodeIndex}:active</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.active, options.newDocumentVersion.active)}</div>`;
            return modalContent;
        } else if (options.newDocumentVersion.typeQName === 'cricket:paragraph') {
            let modalContent = '';
            modalContent += `<div class='field-name'>${options.nodeKey}:${options.nodeIndex}:paragraph</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.paragraph, options.newDocumentVersion.paragraph)}</div>`;
            return modalContent;
        } else if (options.newDocumentVersion.typeQName === 'cricket:link') {
            let modalContent = '';
            modalContent += `<div class='field-name'>${options.nodeKey}:node:${options.nodeIndex}:link title</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.title, options.newDocumentVersion.title)}</div>`;
            if (options.oldDocumentVersion.linkNodeReference) {
                modalContent += `<div class='field-name'>${options.nodeKey}:node:${options.nodeIndex}:linkNodeReference title</div>`;
                modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.linkNodeReference.title, options.newDocumentVersion.linkNodeReference.title)}</div>`;
            }
            return modalContent;
        } else if (options.newDocumentVersion.typeQName === 'cricket:view-multi') {
            let modalContent = '';
            // TODO add top level slot fields from old and new, then run diff on them, push to modalContent
            if (options.newDocumentVersion.view) {
                options.newDocumentVersion.view.node.forEach((item, index) => {
                    modalContent += buildPageContent({
                        newDocumentVersion: item,
                        oldDocumentVersion: ((options.oldDocumentVersion.view || {}).node || [])[index] || '',
                        modalContent: modalContent,
                        isRoot: false,
                        nodeKey: options.nodeKey+":view-multi",
                        nodeIndex: index
                    });
                });
            }
            return modalContent;
        } else if (options.isRoot) {
            let modalContent = '';

            Object.keys(options.newDocumentVersion).forEach((key, index) => {
                if (options.newDocumentVersion[key].node) {
                    if (Array.isArray(options.newDocumentVersion[key].node)) {
                        options.newDocumentVersion[key].node.forEach((node, nodeIndex) => {
                            modalContent += buildPageContent({
                                newDocumentVersion: node,
                                oldDocumentVersion: options.oldDocumentVersion[key].node[nodeIndex],
                                nodeKey: key,
                                parentIndex: index,
                                nodeIndex: nodeIndex,
                                isRoot: false
                            });
                        });
                    } else {
                        modalContent += buildPageContent({
                            newDocumentVersion: options.newDocumentVersion[key].node,
                            oldDocumentVersion: options.oldDocumentVersion[key].node,
                            nodeKey: key,
                            nodeIndex: '',
                            isRoot: false
                        });
                    }
                }
            });
            return modalContent;
        }
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

                // Print diff of page title
                mainModalContent +=  mainModalContent += `<div class='field-name'>Page Title</div>`;
                mainModalContent += `<div class='field-content'>${renderDiff(newDocumentVersion.title, oldDocumentVersion.title)}</div>`;

                 // Print out metadata diffs
                 newDocumentVersion.metadata.forEach((item, index) => {
                    newValue = item.value;
                    newType = item.type;
                    mainModalContent += `<div class='field-name'>Metadata: ${newType}</div>`;
                    mainModalContent += `<div class='field-content'>${renderDiff(oldDocumentVersion.metadata[index].value, newValue)}</div>`;
                });

                // Print out urlList diffs
                let oldUrl = (oldDocumentVersion.urlList[0] || {}).url;
                let newUrl = (newDocumentVersion.urlList[0] || {}).url;
                mainModalContent += `<div class='field-name'>url list</div>`;
                mainModalContent += `<div class='field-content'>${renderDiff(oldUrl, newUrl)}</div>`;

                // adding a black divider
                mainModalContent += `<div class="content-diff-modal-divider"></div>`;

                // determine if there is a content object
                if (matchingResults[1].getTypeQName() === 'cricket:page') {
                    mainModalContent += buildPageContent({
                        newDocumentVersion: newDocumentVersion,
                        oldDocumentVersion: oldDocumentVersion,
                        isRoot: true
                    });
                } else if (matchingResults[1].getTypeQName() === 'cricket:page-shop') {
                    // Print out Sku diffs
                    newDocumentVersion.skus.forEach((item, index) => {
                        mainModalContent += renderSku({
                            newSku: item,
                            oldSku: oldDocumentVersion.skus[index],
                            index
                        });
                    });
                } else if (matchingResults[1].getTypeQName() === 'cricket:page-support-article') {
                    mainModalContent += buildPageContent({
                        newDocumentVersion: newDocumentVersion,
                        oldDocumentVersion: oldDocumentVersion,
                        isRoot: true
                    });
                } else if (matchingResults[1].getTypeQName() === 'cricket:page-support-category') {
                    mainModalContent += buildPageContent({
                        newDocumentVersion: newDocumentVersion,
                        oldDocumentVersion: oldDocumentVersion,
                        isRoot: true
                    });
                } else if (matchingResults[1].getTypeQName() === 'cricket:page-support-home') {
                    mainModalContent += buildPageContent({
                        newDocumentVersion: newDocumentVersion,
                        oldDocumentVersion: oldDocumentVersion,
                        isRoot: true
                    });
                }

                if (!isError) {
                    showModal(modalTitle, mainModalContent);
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