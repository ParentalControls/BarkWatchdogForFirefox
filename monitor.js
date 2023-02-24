const API_URL = 'https://urls.bark.us';

const DISPOSITION_URL = 'https://www.bark.us/connections/report-disposition';

const CHROME_WATCHDOG = 'agknpiliocimoiokabdfecmgilemoich';
const CHROME_MONITOR = 'jcocgejjjlnfddlhpbecfapicaajdibb';
const EDGE_MONITOR = 'pjbpapmfoaplcoaohhdfgdkffdfebmkd';
const EDGE_WATCHDOG = 'ildciggibamcpacfimbhbkaajnaphljd';

const FIREFOX_WATCH_DOG = 'bark.us@watchdog.fi';
const FIREFOX_MONITOR = 'bark.us@bark.fi';

const BARK_EXTENSION_IDS = [
  FIREFOX_MONITOR, //Unofficial
  FIREFOX_WATCH_DOG, //Unofficial
  CHROME_MONITOR, // Chrome Monitor production
  CHROME_WATCHDOG, // Chrome Watchdog production
  EDGE_MONITOR, // Edge Monitor production
  EDGE_WATCHDOG, // Edge Watchdog production
];

// I remap the unofficial ids to an official variant to allow support.
function resolveOfficialId(id, useChrome = true) {
  let reportFor;
  if(useChrome) {
    if (id == FIREFOX_WATCH_DOG) {
      reportFor = CHROME_WATCHDOG;
    } else if (id == FIREFOX_MONITOR) {
      reportFor = CHROME_MONITOR;
    } else {
      //TODO decide what to send here.
      reportFor = CHROME_MONITOR;
    }
  } else {
    if (id == FIREFOX_WATCH_DOG) {
      reportFor = EDGE_WATCHDOG;
    } else if (id == FIREFOX_MONITOR) {
      reportFor = EDGE_MONITOR;
    } else {
      //TODO decide what to send here.
      reportFor = EDGE_MONITOR;
    }
  }
  return reportFor;
}


function sendUrl(email, title, url) {
  const data = {
    title: title,
    url: url,
  };
  const json = JSON.stringify(data);

  function call(value) {
    const headers = new Headers();
    headers.append('X-Bark-Email', email);
    headers.append('X-Bark-Extension', value);
    headers.append('Content-Type', 'application/json;charset=UTF-8');

    fetch(API_URL, {
      method: 'POST',
      credentials: 'omit',
      cache: 'no-store',
      body: json,
      headers: headers,
    }).catch(function (e) {
      console.debug(e)
    });
  }

  //Call As Chrome
  call(resolveOfficialId(browser.runtime.id));
}

const changedTabs = {};

//todo move to onload as needed
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Firefox fires individual events for every property change so we need to
  // accumulate those changes to send as a single navigation event to the
  // backend.

  let changes = changedTabs[tab.id] || {};
  changes = { ...changes, ...changeInfo };
  changedTabs[tab.id] = changes;

  if (changeInfo.status == 'complete') {
    // AJAX may trigger a 'loading' status after the page has loaded but before
    // the title is known. Keep track if we _ever_ completed loading the tab.
    changes.completed = true;
  }

  // If we have the info we need, schedule a message for posting to the
  // backend.
  if (changes.completed) {
    // SPAs do not always fire status change events in order or set the title
    // before the status is complete. A short delay allows the page to finish its
    // work so we can get the final url & title.
    if (changes.timeout) {
      clearTimeout(changes.timeout);
    }

    // If the title change hasn't come through yet, give it a bit more time
    const delay = 'title' in changes ? 500 : 10000;

    changes.timeout = setTimeout(function () {
      delete changedTabs[tab.id];

      browser.storage.sync.get(['child_email']).then(function (res) {
        const email = res.child_email;

        if (!email) {
          return;
        }

        const title = changes.title;
        const url = changes.url;

        sendUrl(email, title, url);
      });
    }, delay);
  }
});

browser.action.onClicked.addListener(function () {
  browser.runtime.openOptionsPage();
});

function dispositionReportUrl(disposition, id, email) {
  const url = new URL(DISPOSITION_URL);
  let reportFor = resolveOfficialId(id);

  url.searchParams.append('email', email);
  url.searchParams.append('disposition', disposition);
  url.searchParams.append('reporter', resolveOfficialId(browser.runtime.id));
  url.searchParams.append('extension', reportFor);

  return url;
}

function reportDisposition(disposition, id, silent) {
  if (BARK_EXTENSION_IDS.indexOf(id) == -1) return;

  browser.storage.sync.get(['child_email']).then(function (res) {
    const email = res.child_email;
    const url = dispositionReportUrl(disposition, id, email );

    if (silent) {
      console.debug("Silent Report for [", url, "]");
      const uri = new URL(url);
      uri.searchParams.append('silent', true);

      fetch(uri.toString(), {
        credentials: 'omit',
        mode: 'no-cors',
        cache: 'no-store',
      });
    } else {
      browser.windows.create({
        url: url.toString(),
        focused: true,
        type: 'normal',
      });
    }
  });
}

function setUninstallURL() {
    browser.storage.sync.get(['child_email']).then(function (res) {
        const email = res.child_email;

        if (!email) {
            console.debug("No Email Set Yet, showing ui");
            //child email not set, prompt to configure
            setTimeout(
                function () {
                    browser.runtime.openOptionsPage();
                },
                1000 //1 seconds
            )
        } else {
            const url = dispositionReportUrl(
                'uninstalled',
                browser.runtime.id,
                email
            );
            browser.runtime.setUninstallURL(url.toString());

            console.debug("Set Personalized Uninstall URL");
        }
    });
}

function useManagementPermissions() {
  const pendingDisableds = {};

  function addManagementListener(disposition) {
    return function (info) {
      if (pendingDisableds[info.id]) clearTimeout(pendingDisableds[info.id]);

      reportDisposition(disposition, info.id, true);
    };
  }

  browser.management.onDisabled.addListener(function (info) {
    if (pendingDisableds[info.id]) clearTimeout(pendingDisableds[info.id]);

    reportDisposition('disabled', info.id, true);

    pendingDisableds[info.id] = setTimeout(function () {
      reportDisposition('disabled', info.id);
    }, 200);
  });

  browser.management.onEnabled.addListener(addManagementListener('enabled'));

  browser.management.onUninstalled.addListener(addManagementListener('uninstalled'));

  console.debug("Management Monitor started")
}

browser.permissions.contains(
    { permissions: ['management'] },
    function (result) {
      if (result) useManagementPermissions();
    }
);

setUninstallURL();