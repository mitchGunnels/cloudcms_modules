define((require, exports, module) => {
    const UI = require('ui');
    const $ = require('jquery');

    /**
     * In case any errors are found, this will handle them
     * @param error
     * @param next
     */
    function errorHandler(error, next) {
        UI.showError('Failed creating when trying to create the snapshot', `<div style="text-align:center">${error}</div>`, () => {
            next();
        });
    }

    /**
     * Waits for the Job to complete
     * Once it finishes, then the spinner will go away a a message will show up
     * @param jobId
     * @param branch
     * @param next
     */
    function waitForJob(jobId, branch, next) {
        if (typeof next !== 'function') {
            console.error('Need to be a function');
        }
        const repository = branch.getRepository();

        Chain(repository.getCluster()).waitForJobCompletion(jobId, (job) => {
            // all done
            $('body').css('pointer-events', 'all');

            Ratchet.unblock();

            Ratchet.showModalMessage(`Executed Snapshot Creation from: ${branch.getTitle().toUpperCase()}`, `<div style="text-align:center"> Finished: ${job.getJobTitle()}</div>`);
            next();
        });
    }

    function copyDocumentAndChildren(sourceBranch, targetBranch, nodeIds, next) {
        const sourceBranchId = sourceBranch.getId();
        const repositoryId = sourceBranch.getRepository().getId();
        let nodesListHTML = '<ol id="nodeList">';
        sourceBranch
            .queryNodes(
                {
                    _doc: { $in: nodeIds }
                },
                {
                    limit: -1
                }
            )
            .trap((e) => {
                return errorHandler(e, next);
            })
            .then(function() {
                const nodes = this;
                const nodesAsJson = nodes.json();
                const fullListOfNodeIds = scanForIds(nodesAsJson);

                sourceBranch
                    .queryNodes(
                        {
                            _doc: {
                                $in: fullListOfNodeIds
                            }
                        },
                        { limit: -1 }
                    )
                    .trap((e) => {
                        return errorHandler(e, next);
                    })
                    .each((docId, doc) => {
                        nodesListHTML += `<li>${doc.getTitle()}</li>`;
                    })
                    .then(() => {
                        nodesListHTML += '</ol>';

                        Ratchet.fadeModalConfirm(
                            '<div style="text-align:center">Please Confirm</div>',
                            `<div style="text-align:center">Are you sure these are the correct files to copy ?</div><br><div>${nodesListHTML}</div>`,
                            'Yes',
                            'btn btn-default',
                            () => {
                                console.log(`Will copy ${nodeIds.length} documents from ${sourceBranch.getTitle()} to ${targetBranch.getTitle()}`);

                                // blocking clicks

                                $('body').css('pointer-events', 'none');

                                Ratchet.block('Working...', 'Copying the nodes from one branch to another', () => {
                                    Chain(sourceBranch.getRepository()).startCopyFrom(
                                        sourceBranchId,
                                        targetBranch.getId(),
                                        {
                                            repositoryId,
                                            branchId: sourceBranchId,
                                            targetRepositoryId: repositoryId,
                                            targetBranchId: targetBranch.getId(),
                                            nodeIds: fullListOfNodeIds
                                        },
                                        (jobId) => {
                                            // You can wait for the job to finish or just quit the application, the job will still be running.
                                            console.log(`The job is now running (${jobId}) - Please wait for it to complete`);
                                            waitForJob(jobId, sourceBranch, next);
                                        }
                                    );
                                });
                            }
                        );
                    });
            });
    }

    function scanForIds(obj) {
        if (isObj(obj) || Array.isArray(obj)) {
            return Object.values(obj).reduce((idList, value) => {
                if (isObj(value)) {
                    if (Object.prototype.hasOwnProperty.call(value, 'id')) {
                        idList.push(value.id);
                    } else if (Object.prototype.hasOwnProperty.call(value, '_doc')) {
                        idList.push(value._doc);
                    }

                    return [...idList, ...scanForIds(value)];
                }
                if (Array.isArray(value)) {
                    idList = [...idList, ...scanForIds(value)];
                }

                // makes sure to return unique ids only
                return [...new Set(idList)];
            }, []);
        }

        return [];
    }

    function isObj(obj) {
        return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
    }

    return {
        /**
         * Kicks off the process to create a new snapshot, from the currently selected branch
         * @param next
         */
        run: (next) => {
            const listOfBranches = Ratchet.observable('workspaces').get();
            const targetBranch = Ratchet.observable('branch').get();
            let nodeIds = [];
            let sourceBranchId = 'master';
            let listOfBranchesOptions = '<option value="master">Master</option>';

            listOfBranches.forEach((workspace) => {
                listOfBranchesOptions += `<option value="${workspace.id}">${workspace.title}</option>`;
            });
            const listOfBranchesHTML = `<div>Select the workspace to Copy From: <br><select id ="listOfBranches">${listOfBranchesOptions}</select><div>Please Enter the nodes to copy (csv, no spaces)<input type="text" required id="nodeList"></div></div>`;
            const bodySelector = $('body');
            bodySelector.on('change', '#listOfBranches', function() {
                sourceBranchId = $(this)
                    .find(':selected')
                    .val();
            });

            bodySelector.on('keyup', '#nodeList', function() {
                // Makes sure that we remove everything in the array before adding more items
                nodeIds = [];
                const values = this.value;
                values.split(',').forEach((node) => {
                    node = node.replace(/\s+/g, '');
                    if (node.length) {
                        nodeIds.push(node);
                    }
                });
            });

            Ratchet.fadeModalConfirm('<div style="text-align:center">Let\'s move content!</div>', listOfBranchesHTML, 'OK', 'btn btn-default', () => {
                if (nodeIds.length) {
                    Chain(targetBranch)
                        .getRepository()
                        .readBranch(sourceBranchId)
                        .then(function() {
                            const sourceBranch = this;
                            Ratchet.fadeModalConfirm(
                                '<div style="text-align:center">Please Confirm</div>',
                                `<div style="text-align:center">Are you sure you want to copy files from ${sourceBranch.getTitle()} to ${targetBranch.getTitle()} ?</div>`,
                                'Yes',
                                'btn btn-default',
                                () => {
                                    copyDocumentAndChildren(sourceBranch, targetBranch, nodeIds, next);
                                }
                            );
                        });
                }
            });
        }
    };
});
