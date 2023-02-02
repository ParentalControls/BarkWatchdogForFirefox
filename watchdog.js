const BARK_EXTENSION_IDS = [
  'jcocgejjjlnfddlhpbecfapicaajdibb', // Chrome Monitor production
  'agknpiliocimoiokabdfecmgilemoich', // Chrome Watchdog production
  'pjbpapmfoaplcoaohhdfgdkffdfebmkd', // Edge Monitor production
  'ildciggibamcpacfimbhbkaajnaphljd', // Edge Watchdog production

  // Update locally as needed
  'cfjjjelgblfefpldkbpmldjakoohoohb', // Chrome Monitor debug
  'pifhhmbdoikllhpofdknanfcddaajpfk', // Chrome Watchdog debug
  'bnhgbicldegoglomikgnenecboibaepp', // Edge Monitor debug
  'haklcjflhpomkecolmkjfllofddcigab', // Edige Watchdog debug
];

const DISPOSITION_URL = 'https://www.bark.us/connections/report-disposition';

function dispositionReportUrl(disposition, id, email) {
  const url = new URL(DISPOSITION_URL);
  url.searchParams.append('email', email);
  url.searchParams.append('disposition', disposition);
  url.searchParams.append('reporter', chrome.runtime.id);
  url.searchParams.append('extension', id);

  return url;
}

function reportDisposition(disposition, id, silent) {
  if (BARK_EXTENSION_IDS.indexOf(id) == -1) return;

  chrome.identity.getProfileUserInfo(function (userInfo) {
    const url = dispositionReportUrl(disposition, id, userInfo.email);

    if (silent) {
      const uri = new URL(url);
      uri.searchParams.append('silent', true);

      fetch(uri.toString(), {
        credentials: 'omit',
        mode: 'no-cors',
      });
    } else {
      chrome.windows.create({
        url: url.toString(),
        focused: true,
        type: 'normal',
      });
    }
  });
}

chrome.identity.getProfileUserInfo(function (userInfo) {
  const url = dispositionReportUrl(
    'uninstalled',
    chrome.runtime.id,
    userInfo.email
  );
  chrome.runtime.setUninstallURL(url.toString());
});

function useManagementPermissions() {
  const pendingDisableds = {};
  chrome.management.onDisabled.addListener(function (info) {
    if (pendingDisableds[info.id]) clearTimeout(pendingDisableds[info.id]);

    reportDisposition('disabled', info.id, true);

    pendingDisableds[info.id] = setTimeout(function () {
      reportDisposition('disabled', info.id);
    }, 200);
  });

  chrome.management.onEnabled.addListener(function (info) {
    if (pendingDisableds[info.id]) clearTimeout(pendingDisableds[info.id]);

    reportDisposition('enabled', info.id, true);
  });

  chrome.management.onUninstalled.addListener(function (id) {
    if (pendingDisableds[id]) clearTimeout(pendingDisableds[id]);

    reportDisposition('uninstalled', id, true);
  });
}

chrome.permissions.contains(
  { permissions: ['management'] },
  function (result) {
    if (result) useManagementPermissions();
  }
);
