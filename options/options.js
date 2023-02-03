function load_config() {
    browser.storage.sync.get(['child_email', 'locked']).then(
        (res) => {
            let $childUsername = $('#child_username');
            if (res.child_email) {
                $childUsername.val(res.child_email);
            }
            if (res.locked) {
                $childUsername.removeClass("save_config");
                $childUsername.attr('disabled', 'disabled');
                $('#done_modal').hide()
            }
        });
}

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

//listeners
//Onload
document.addEventListener('DOMContentLoaded', load_config);

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
                document.getElementById("error_field").innerHTML = error;
                throw new Error(error);
            } else {
                window.location.href = "../options/confirm.html"
            }
        })
});

$('#done_confirm').click(
    function () {
        //TODO Validate email first is in valid .+\@.+\..+ format
        browser.storage.sync.set({
            locked: 'locked',
        }).then(function () {
            window.location.href = "../options/options.html"
        });
    }
)

