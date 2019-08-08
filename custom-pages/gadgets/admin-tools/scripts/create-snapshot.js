define(function (require, exports, module) {
    
    let branch = Ratchet.observable('branch').get();
    let repository = branch.getRepository();
    const currentDate = new Date(Date.now());
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    const currentYear = currentDate.getFullYear();
    const currentHours = currentDate.getHours();
    const currentMins = currentDate.getMinutes();
    const UI = require('ui');
    
    
    exports.run = (callback) => {
        
        // eslint-disable-next-line no-undef
        $(el).find('.btn.btn-primary').click(() => {
            
            Ratchet.fadeModalConfirm('<div style="text-align:center">Please Confirm</div>',
                `<div style="text-align:center">Are you sure you want to create a snapshot from ${branch.getTitle()} ?</div>`,
                'Yes',
                'btn btn-default',
                () => {
                    
                    // blocking clicks
                    
                    $('body').css('pointer-events', 'none');
                    
                    Ratchet.block('Working...', 'Creating the Snapshot', () => {
                        
                        Chain(repository).trap((error) => {
                            UI.showError(`Failed creating a snapshot of:${branch.getTitle()}`, `<div style="text-align:center">${error}</div>`, () => {
                                callback();
                            });
                        }).startCreateBranch(branch.getId(), branch.getTip(), {
                            title: `From: "${branch.getTitle()}" - ${currentMonth}.${currentDay}.${currentYear} @ ${currentHours}:${currentMins}`,
                            snapshot: true
                        }, (jobId) => {
                            
                            
                            Chain(repository.getCluster()).waitForJobCompletion(jobId, (job) => {
                                // all done
                                $('body').css('pointer-events', 'all');
                                
                                Ratchet.unblock();
                                
                                Ratchet.showModalMessage(`Executed Snapshot Creation from: ${branch.getTitle().toUpperCase()}`,
                                    `<div style="text-align:center"> Finished: ${job.getJobTitle()}</div>`
                                );
                                
                                callback();
                            });
                            
                        });
                    });
                    
                }
            );
        });
    };
});