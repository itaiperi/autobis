/*** General utilities ***/
async function asyncSleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

class Notifier {
  constructor(notificationsEnabled) {
    this.enabled = notificationsEnabled;
  }

  notify(message) {
    if (!this.enabled) {
      return;
    }

    let options = {
      type: 'basic',
      iconUrl: 'resources/icons/icon_128.png',
      title: 'Autobis',
      message: message
    }
    chrome.notifications.create(options=options);
  }
}

/*** DB utilities ***/
async function storageLocalGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, result => {
      resolve(result);
    });
  });
}

async function storageLocalSet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(keys, () => {
      resolve();
    });
  });
}

async function storageLocalGetWithDefault(key, defaultValue) {
  return new Promise(async function(resolve, reject) {
    let valueObj = await storageLocalGet(key);
    if (!valueObj.hasOwnProperty(key)) {
      value = defaultValue;
      await storageLocalSet({[key]: value});
    }
    else {
      value = valueObj[key];
    }
    resolve(value);
  });
}

/*** Scraping utilities ***/
async function waitForElementBySelector(selector, appear=true, timeout=5000, interval=100) {
  let element = document.querySelector(selector);
  let cumtime = 0;
  while (((appear && !element) || (!appear && element)) && cumtime < timeout) {
    await asyncSleep(interval);
    cumtime += interval;
    element = document.querySelector(selector);
  }
  if (cumtime >= timeout) {
    throw `Waiting for element timed out: ${selector}`;
  }
  return element;
}

/*** Cross-tab utilities ***/
async function createTab(url) {
  // taken from https://stackoverflow.com/a/44864966/5259379
  return new Promise(resolve => {
      chrome.tabs.create({
        url,
        active: false
      }, async tab => {
          chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
              if (info.status === 'complete' && tabId === tab.id) {
                  chrome.tabs.onUpdated.removeListener(listener);
                  resolve(tab);
              }
          });
      });
  });
}

async function changeTabURL(tab, url) {
  // Taken from https://stackoverflow.com/a/51389953/5259379
  return new Promise(resolve => {
      chrome.tabs.update(tab.id, {
        url
      }, tab => {
          chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
              if (info.status === 'complete' && tabId === tab.id) {
                  chrome.tabs.onUpdated.removeListener(listener);
                  resolve(tab);
              }
          });
      });
  });
}

async function executeScriptPromise(tabId, details) {
  return new Promise(resolve => {
    chrome.tabs.executeScript(tabId, details, result => {
      resolve(result);
    });
  });
}

async function sendMessagePromise(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, response => {
      if (response != undefined && response != null) {
        resolve(response);
      }
      else {
        reject(response);
      }
    });
  });
}
