const CHROME_MONITOR_PROD = 'jcocgejjjlnfddlhpbecfapicaajdibb';
const DISPOSITION_URL = 'https://www.bark.us/connections/report-disposition';

function load_config() {
    function getUninstalledURL(res) {
        const url = new URL(DISPOSITION_URL);

        url.searchParams.append('email', res.child_email);
        url.searchParams.append('disposition', 'uninstalled');
        url.searchParams.append('reporter', CHROME_MONITOR_PROD);
        url.searchParams.append('extension', CHROME_MONITOR_PROD);

        return url;
    }

    document.getElementById('version').innerText = "Version\xa0" + browser.runtime.getManifest().version;//\xa0 is &nbsp;

    browser.storage.sync.get(['child_email', 'locked']).then(
        (res) => {
            let childUsername = document.getElementById('child_username');

            if (res.child_email) {
                childUsername.value = res.child_email;
            }

            if (res.locked) {
                childUsername.disabled = true;
                if(childUsername.classList){
                    childUsername.classList.remove("save_config");
                }

                let doneModal = document.getElementById('done_modal');
                if(doneModal){
                    doneModal.remove()
                }

                let unlockModal = document.getElementById('unlock_modal');
                let unlockButton = document.getElementById("unlock");
                if (unlockModal && unlockButton) {
                    if(unlockModal.classList){
                        unlockModal.classList.remove("hidden")
                    }

                    let uninstalledURL = null;
                    unlockButton.addEventListener('click', function () {
                        browser.storage.sync.get(['child_email', 'locked'])
                        .then(function (res) {
                            if (!res.locked) {
                                console.error("Already Unlocked.", res);
                                return Promise.reject("Already Unlocked");
                            }

                            uninstalledURL = getUninstalledURL(res);
                            const uri = new URL(uninstalledURL);
                            uri.searchParams.append('silent', true);
                            return fetch(uri.toString(), {
                                credentials: 'omit',
                                mode: 'no-cors',
                                cache: 'no-store',
                            });
                        }).then(function (fetchRes){
                            return browser.storage.sync.remove('locked')
                        }).then(function (deleted) {
                            window.location.href = uninstalledURL;
                        }).catch(function (err) {
                            console.error("Unable to unlock", err);
                        });
                    });
                }
            } else {
                let unlockModal = document.getElementById('unlock_modal');
                if(unlockModal) {
                    unlockModal.remove();
                }
//ADD LISTENERS

function save_config() {
    return browser.storage.sync.get(['child_email', 'locked']).then(
        (res) => {
            if (!res.locked) {
                let childUsername = document.getElementById('child_username');
                let childEmail = childUsername.value;

                browser.storage.sync.set({
                    child_email: childEmail,
                });
            }
        });
}

//On change
childUsername.addEventListener('change',function () {
    save_config();
});

let doneButton = document.getElementById('done');
if(doneButton) {
    doneButton.addEventListener('click', function () {
        save_config()
        .then(function () {
            return browser.storage.sync.get(['child_email', 'locked'])
        })
        .then(function (res) {
            let error = null;
            if (res.locked) {
                error = "Cannot change config while locked";
            } else if (!res.child_email) {
                error = "You have not yet set your childs email address.";
            }
            if (error) {
                document.getElementById("error_field").innerText = error;
                throw new Error(error);
            } else {
                window.location.href = "../options/confirm.html"
            }
        })
    });
}

let doneConfirmedButton = document.getElementById('done_confirm');
if(doneConfirmedButton) {
    function setupUninstallMonitorFirstRun(res) {
        const url = getUninstalledURL(res);
        browser.runtime.setUninstallURL(url.toString());

        console.log("Set First-Time Personalized Uninstall URL");
    }

    function validateEmail(res) {
        let error = null;
        if (!res.child_email) {
            error = "You have not yet set your child's email address. Please press the 'Go Back' button.";
        }

        //TODO Validate email first is in valid .+\@.+\..+ format

        return error;
    }

    doneConfirmedButton.addEventListener('click', function () {
        browser.storage.sync.get(['child_email'])
        .then(function (res) {
            let error = validateEmail(res);
            if (error) {
                document.getElementById("error_field").innerText = error;
                throw new Error(error);
            } else {
                setupUninstallMonitorFirstRun(res);

                browser.storage.sync.set({
                    locked: 'locked',
                }).then(function () {
                    console.log("Locked in email of [", res.child_email, "]");
                    window.location.href = "../options/options.html"
                });
            }
        });
    });
}


            } // end of not locked else
        }); //end of promise.then from storage
}// end of load_config

//listeners
//Onload
document.addEventListener('DOMContentLoaded', load_config);