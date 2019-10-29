define(function (require, exports, module) {
    
    const UI = require('ui');
    const $ = require('jquery');
    
    const documentsToTraverse = [];
    
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
        
        Chain(repository.getCluster())
            .waitForJobCompletion(jobId, (job) => {
                // all done
                $('body').css('pointer-events', 'all');
                
                Ratchet.unblock();
                
                Ratchet.showModalMessage(`Executed Snapshot Creation from: ${branch.getTitle().toUpperCase()}`,
                    `<div style="text-align:center"> Finished: ${job.getJobTitle()}</div>`
                );
                next();
            });
    }
    
    function copyDocumentAndChildren(sourceBranch, targetBranchId, nodeIds, next) {
        
        const sourceBranchId = sourceBranch.getId();
        const repositoryId = sourceBranch.getRepository().getId();
        sourceBranch.queryNodes({
            _doc: {$in: documentsToTraverse}
        }, {
            limit: -1
        })
            .trap(e => errorHandler(e, next))
            .then(function () {
                const nodes = this;
                const nodesAsJson = nodes.json();
                nodeIds = scanForIds(nodesAsJson);
                
                console.log(`Will copy ${nodeIds.length} documents from ${sourceBranchId} to ${targetBranchId}`);
                
                Chain(sourceBranch.getRepository()).startCopyFrom(sourceBranchId, targetBranchId, {
                    repositoryId: repositoryId,
                    branchId: sourceBranchId,
                    targetRepositoryId: repositoryId,
                    targetBranchId: targetBranchId,
                    nodeIds: nodeIds
                }, function (jobId) {
                    
                    // You can wait for the job to finish or just quit the application, the job will still be running.
                    console.log(`The job is now running (${jobId}) - Please wait for it to complete`);
                    waitForJob(jobId, sourceBranch, next);
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
                    
                    
                } else if (Array.isArray(value)) {
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
            let listOfBranchesOptions = '';
            
            listOfBranches.forEach(workspace => {
                listOfBranchesOptions += `<option value="${workspace.id}">${workspace.title}</option>`;
            });
            let listOfBranchesHTML = `<div>Select the workspace to Copy From: <br><select id ="listOfBranches">${listOfBranchesOptions}</select><div>Please Enter the nodes to copy (csv, no spaces)<input type="text" required id="nodeList"></div></div>`;
            
            let nodeIds = [];
            let sourceBranchId = '';
            $('#listOfBranches').on('change', function () {
                sourceBranchId = $(this).find(':selected').val();
            });
            
            $('#nodeList').on('keyup', function () {
                // Makes sure that we remove everything in the array before adding more items
                nodeIds = [];
                const values = this.value;
                console.log(values);
                values.split(',').forEach(node => {
                    node = node.replace(/\s+/g, '');
                    if (node.length) {
                        nodeIds.push(node);
                    }
                });
            });
            
            Ratchet.fadeModalConfirm(
                '<div style="text-align:center">Let\'s move content!</div>',
                listOfBranchesHTML,
                'OK',
                'btn btn-default',
                () => {
                    let listOfNodesHTML = '<ol id="orderedListOfNodes"></ol>';
                    targetBranch.getRepository().readBranch(sourceBranchId).queryNodes({
                        $in: nodeIds
                    }, {limit: -1}).each((docId, doc) => {
                        $('#orderedListOfNodes').append(`<li>${doc.getTitle()}</li>`);
                    }).then(() => {
                        Ratchet.fadeModalConfirm('<div style="text-align:center">Please Confirm</div>',
                            `<div style="text-align:center">Are you sure you want to copy these files ${targetBranch.getRepository().readBranch(sourceBranchId).getTitle()} to ${targetBranch.getTitle()} ?</div><br><div>${listOfNodesHTML}</div>`,
                            'Yes',
                            'btn btn-default',
                            () => {
                                
                                // blocking clicks
                                
                                $('body').css('pointer-events', 'none');
                                
                                Ratchet.block('Working...', 'Creating the Snapshot', () => {
                                    
                                    copyDocumentAndChildren(targetBranch, sourceBranchId, nodeIds, next);
                                    
                                });
                                
                            }
                        );
                    });
                });
            
        }
    };
});
