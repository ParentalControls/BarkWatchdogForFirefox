const CHROME_MONITOR_PROD = 'jcocgejjjlnfddlhpbecfapicaajdibb';
const DISPOSITION_URL = 'https://www.bark.us/connections/report-disposition';

function load_config() {
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
            }else{
//ADD LISTENERS

function save_config() {
    return browser.storage.sync.get(['child_email', 'locked']).then(
        (res) => {
            if (!res.locked) {
                let childEmail = $('#child_username').val();

                browser.storage.sync.set({
                    child_email: childEmail,
                });
            }
        });
}

//On change
$('.save_config').change(function () {
    save_config();
});

$('#done').click(function () {

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

$('#done_confirm').click(function () {
    function setupUninstallMonitorFirstRun(res) {
        const url = new URL(DISPOSITION_URL);

        url.searchParams.append('email', res.child_email);
        url.searchParams.append('disposition', 'uninstalled');
        url.searchParams.append('reporter', CHROME_MONITOR_PROD);
        url.searchParams.append('extension', CHROME_MONITOR_PROD);
        browser.runtime.setUninstallURL(url.toString());

        console.log("Set First-Time Personalized Uninstall URL");
    }

    function validateEmail(res) {
        let error = null;
        if (!res.child_email) {
            error = "You have not yet set your childs email address. Please press the 'Go Back' button.";
        }

        //TODO Validate email first is in valid .+\@.+\..+ format

        return error;
    }

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
                console.log("Locked in email of [",res.child_email,"]");
                window.location.href = "../options/options.html"
            });
        }
    });
});

document.getElementById('version').innerText = browser.runtime.getManifest().version;
            }
        });
}

//listeners
//Onload
document.addEventListener('DOMContentLoaded', load_config);