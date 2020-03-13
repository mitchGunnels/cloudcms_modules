define((require, exports, module) => {
    const currentDate = new Date(Date.now());
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    const currentYear = currentDate.getFullYear();
    const currentHours = currentDate.getHours();
    const currentMins = currentDate.getMinutes();
    const UI = require('ui');

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

    /**
     * Create a new snapshot using the currently selected branch
     * @param branch
     * @param next
     */
    function createSnapshot(branch, next) {
        if (typeof next !== 'function') {
            console.error('Need to be a function');
        }

        const newBranchTitle = `Created from: "${branch.getTitle()}" on ${currentMonth}.${currentDay}.${currentYear} @ ${currentHours}:${currentMins}`;

        Chain(branch.getRepository())
            .trap((e) => {
                return errorHandler(e, next);
            })
            .startCreateBranch(
                branch.getId(),
                branch.getTip(),
                {
                    title: newBranchTitle,
                    snapshot: true
                },
                (jobId) => {
                    waitForJob(jobId, branch, next);
                }
            );
    }

    return {
        /**
         * Kicks off the process to create a new snapshot, from the currently selected branch
         * @param next
         */
        run: (next) => {
            const branch = Ratchet.observable('branch').get();

            Ratchet.fadeModalConfirm('<div style="text-align:center">Please Confirm</div>', `<div style="text-align:center">Are you sure you want to create a snapshot from ${branch.getTitle()} ?</div>`, 'Yes', 'btn btn-default', () => {
                // blocking clicks

                $('body').css('pointer-events', 'none');

                Ratchet.block('Working...', 'Creating the Snapshot', () => {
                    createSnapshot(branch, next);
                });
            });
        }
    };
});
