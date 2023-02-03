const API_URL = 'https://urls.bark.us';

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
      console.log(e)
    });
  }

  //Call As Chrome
  call('jcocgejjjlnfddlhpbecfapicaajdibb');

//TODO watchdog in own script
  call('agknpiliocimoiokabdfecmgilemoich');
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

//TODO
//importScripts("watchdog.js")

browser.action.onClicked.addListener(function () {
  browser.runtime.openOptionsPage();
});