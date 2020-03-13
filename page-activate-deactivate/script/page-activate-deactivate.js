define((require, exports, module) => {
    /** *******************
     * Allow for activation/deactivation of various page types
     * and associated documents from Dashboard
     * ***************** */

    const $ = require('jquery');
    const dashletSelector = '.htmldashlet .body .cricket-activation-deactivation';

    const activeClass = 'active';
    const activeSelector = `.${activeClass}`;

    const typeClass = 'activation-page-type';
    const typeSelector = `${dashletSelector} .${typeClass}`;
    const typeSelectSelector = `${typeSelector} select`;
    const typeSelect = `<div class=${typeClass}"><label>Page Type<select><option value="page">Page</option><option value="page-support-article">Support Article Page</option><option value="page-support-category">Support Category Page</option><option value="page-support-home">Support Home Page</option></select></label></div>`;

    const pageListClass = 'activation-page-list';
    const pageListSelector = `${dashletSelector} .${pageListClass}`;
    const pageListSelectSelector = `${pageListSelector} select`;

    const activateClass = 'activation-activate';
    const activateSelector = `${dashletSelector} .${activateClass}`;
    const activateButtonSelector = `${activateSelector} input`;
    const activateButton = `<div class="${activateClass}"><input type="button" value="Activate" /></div>`;

    const deactivateClass = 'activation-deactivate';
    const deactivateSelector = `${dashletSelector} .${deactivateClass}`;
    const deactivateButtonSelector = `${deactivateSelector} input`;
    const deactivateButton = `<div class="${deactivateClass}"><input type="button" value="Deactivate" /></div>`;

    const messageClass = 'activation-message';
    const messageSelector = `${dashletSelector} .${messageClass}`;
    const message = `<div class=${messageClass}></div>`;
    const errorMessageClass = 'errorMessage';
    const errorMessageSelector = `${messageSelector}.${errorMessageClass}`;
    const successMessageClass = 'successMessage';
    const successMessageSelector = `${messageSelector}.${successMessageClass}`;

    const buttonsClass = 'activation-buttons';
    const buttonsSelector = `${dashletSelector} .${buttonsClass}`;
    const buttons = `<div class="${buttonsClass}">${activateButton}${deactivateButton}</div>`;

    const contentClass = 'content';
    const contentSelector = `${dashletSelector} .${contentClass}`;
    const content = `<div class="${contentClass}"></div>`;

    const activationStyles = `${contentSelector} { background: #fff; border: 1px solid #ccc; padding: 10px; }${buttonsSelector} { background: #fff; border-top: none; text-align: right; }${activateSelector}, ${deactivateSelector} { display: inline-block; margin: 10px 0 0 10px; }${dashletSelector} label { width: 100%; display: flex; flex-direction: column; }${errorMessageSelector} { color: #a94442; }${successMessageSelector} { color: rgb(39, 174, 96); }`;

    function genericErrorLoggerHalter(err) {
        console.error(err);
        return false;
    }

    function genericMessagingErrorLoggerHalter(err) {
        setMessage('There was a problem. Please contact the CMS team about the document(s) you are trying to modify', errorMessageClass);
        enableButtons();
        console.error(err);
        return false;
    }

    function getChain() {
        const branch = Ratchet.observable('branch').get();
        const chain = Chain(branch);
        return chain;
    }

    function disableButtons() {
        $(`${activateButtonSelector}, ${deactivateButtonSelector}`).attr('disabled', 'disabled');
    }

    function enableButtons() {
        $(`${activateButtonSelector}, ${deactivateButtonSelector}`).removeAttr('disabled');
    }

    function setMessage(msg, msgClass) {
        clearMessage();
        $(messageSelector)
            .addClass(msgClass)
            .text(msg);
    }

    function clearMessage() {
        $(messageSelector)
            .removeClass([errorMessageClass, successMessageClass].join(' '))
            .empty();
    }

    function getPages() {
        const chain = getChain();
        const pageType = $(typeSelectSelector).val();
        const query = {
            _type: `cricket:${pageType}`
        };

        disableButtons();
        if (chain.queryNodes) {
            chain
                .trap(genericErrorLoggerHalter)
                .queryNodes(query)
                .then(function() {
                    const pages = this.asArray();
                    populateSelect(pages);
                    enableButtons();
                });
        }
    }

    function populateSelect(pages) {
        let pageListSelect = `<div class="${pageListClass}"><label>Page Title<select name="">`;
        const pageList = $(pageListSelector);

        // populate options inside select
        pages.forEach((page, index) => {
            pageListSelect += `<option value="${page._doc}">${page.title}</option>`;
        });
        pageListSelect += '</select></label></div>';

        // remove the old list
        pageList.remove();
        // insert into DOM
        $(typeSelector).after(pageListSelect);
        // enable buttons
        enableButtons();
    }

    function populateDashlet() {
        $(dashletSelector).append(`<style>${activationStyles}</style>`);
        $(dashletSelector).append(content);

        const contentElem = $(contentSelector);
        contentElem.append(typeSelect);
        contentElem.append(message);
        contentElem.append(buttons);
        // populate initial page title select
        getPages();
    }

    $(document).on('cloudcms-ready', (event) => {
        let branch;
        if (Ratchet) {
            branch = Ratchet.observable('branch').get();
        }
        // only inject form if user is on branch
        if (branch && !branch.isMaster()) {
            populateDashlet();
        }
    });

    function activateDeactivatePage(options) {
        /** *
         * update page only
         */
        const pageType = $(typeSelectSelector).val();
        const query = { _type: `cricket:${pageType}` };

        const docId = $(pageListSelectSelector).val();
        query._doc = docId;

        options.chain
            .trap((err) => {
                // page not found
                console.error(err);
                setMessage('Page not found', errorMessageClass);
                enableButtons();
            })
            .queryOne(query)
            .then(function() {
                const page = Chain(this);
                page.active = options.activeVal;
                page.trap(genericMessagingErrorLoggerHalter)
                    .update()
                    .then(function() {
                        setMessage(`${this.title} has been ${options.updateVerb} successfully`, successMessageClass);
                        enableButtons();
                    });
            });
    }

    function handleActivateDeactivate() {
        const options = {
            chain: getChain(),
            activeVal: $(this).val() === 'Activate' ? 'y' : 'n',
            updateVerb: $(this).val() === 'Activate' ? 'activated' : 'deactivated'
        };

        clearMessage();
        disableButtons();

        activateDeactivatePage(options);
    }

    $(document).on('change', typeSelectSelector, getPages);
    $(document).on('click', `${activateButtonSelector}, ${deactivateButtonSelector}`, handleActivateDeactivate);
});
