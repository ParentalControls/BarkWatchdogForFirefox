function load_config() {
    browser.storage.sync.get(['child_email', 'locked']).then(
        (res) => {
            let $childUsername = $('#child_username');
            if (res.child_email) {
                $childUsername.val(res.child_email);
            }
            if (res.locked) {
                $childUsername.removeClass("save_config");
                $childUsername.attr('disabled','disabled');
                $('#done_modal').hide()
            }
        });
}

function save_config() {
    browser.storage.sync.get(['child_email', 'locked']).then(
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
$('.save_config').change(function (e) {
    save_config();
});

$('#done').click(function (e) {
    //TODO Validate email first is in valid .+\@.+\..+ format
    //TODO add confirm that shows email
    browser.storage.sync.set({
        locked: 'locked',
    }).then(load_config);
});

