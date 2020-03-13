/**
 * @license Copyright (c) 2014-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/license
 */

(function() {
    'use strict';

    CKEDITOR.plugins.a11ychecker.quickFixes.get({
        langCode: 'en',
        name: 'QuickFix',
        callback(QuickFix) {
            /**
             * QuickFix adding a caption in the `table` element.
             *
             * @member CKEDITOR.plugins.a11ychecker.quickFix
             * @class TableHeaders
             * @constructor
             * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue QuickFix is created for.
             */
            function TableHeaders(issue) {
                QuickFix.call(this, issue);
            }

            TableHeaders.prototype = new QuickFix();

            TableHeaders.prototype.constructor = TableHeaders;

            TableHeaders.prototype.display = function(form) {
                const { lang } = this;

                form.setInputs({
                    position: {
                        type: 'select',
                        label: lang.positionLabel,
                        value: 'row',
                        options: {
                            both: lang.positionBoth,
                            row: lang.positionHorizontally,
                            col: lang.positionVertically
                        }
                    }
                });
            };

            /**
             * @param {Object} formAttributes Object containing serialized form inputs. See
             * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
             * @param {Function} callback Function to be called when a fix was applied. Gets QuickFix object
             * as a first parameter.
             */
            TableHeaders.prototype.fix = function(formAttributes, callback) {
                const table = this.issue.element;
                const headers = formAttributes.position;
                let newCell;
                let row;
                let i;
                // Following code copied from CKEditor plugins/table/dialogs/table.js file.

                // Should we make all first cells in a row TH?
                if (headers == 'col' || headers == 'both') {
                    for (row = 0; row < table.$.rows.length; row++) {
                        if (!table.$.rows[row].cells.length) {
                            continue;
                        }

                        newCell = new CKEDITOR.dom.element(table.$.rows[row].cells[0]);
                        newCell.renameNode('th');
                        newCell.setAttribute('scope', 'row');
                    }
                }

                if (!table.$.tHead && (headers == 'row' || headers == 'both')) {
                    const thead = new CKEDITOR.dom.element(table.$.createTHead());
                    const tbody = table.getElementsByTag('tbody').getItem(0);
                    const theRow = tbody.getElementsByTag('tr').getItem(0);

                    // Change TD to TH:
                    for (i = 0; i < theRow.getChildCount(); i++) {
                        const th = theRow.getChild(i);
                        // Skip bookmark nodes. (#6155)
                        if (th.type == CKEDITOR.NODE_ELEMENT && !th.data('cke-bookmark')) {
                            th.renameNode('th');
                            th.setAttribute('scope', 'col');
                        }
                    }
                    thead.append(theRow.remove());
                }

                if (callback) {
                    callback(this);
                }
            };

            TableHeaders.prototype.lang = {
                positionLabel: 'Position',
                positionHorizontally: 'Horizontally',
                positionVertically: 'Vertically',
                positionBoth: 'Both'
            };
            CKEDITOR.plugins.a11ychecker.quickFixes.add('en/TableHeaders', TableHeaders);
        }
    });
})();
