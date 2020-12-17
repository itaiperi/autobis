const AUTOBIS_SCHEDULE_ALARM_NAME = 'AutobisSchedule'
const RESTAURANTS_URLS = {
  shufersal: 'https://www.10bis.co.il/next/restaurants/menu/delivery/26698/'
}

// taken from https://stackoverflow.com/a/44864966/5259379
async function createTab (url) {
  return new Promise(resolve => {
      chrome.tabs.create({
        url,
        active: true
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

async function changeTabURL (tab, url) {
  console.log('change url');
  return new Promise(resolve => {
      chrome.tabs.update(tab.id, {
        url
      }, tab => {
          chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
              if (info.status === 'complete' && tabId === tab.id) {
                console.log('complete');
                  chrome.tabs.onUpdated.removeListener(listener);
                  resolve(tab);
              }
          });
      });
  });
}

async function executeScriptWithPromise(tabId, details) {
  return new Promise(resolve => {
    chrome.tabs.executeScript(tabId, {file: 'utils.js'}, result => {
      chrome.tabs.executeScript(tabId, details, result => {
        resolve(result);
      });
    })
  })
}

async function getDailyBalance() {
  let tab = await createTab('https://www.10bis.co.il/next/user-report');
  let balanceArray = await executeScriptWithPromise(tab.id, {file: 'get_daily_balance.js'});
  let balance = balanceArray[0];
  console.log(balance);
  await changeTabURL(tab, RESTAURANTS_URLS['shufersal']);
  await executeScriptWithPromise(tab.id, {file: 'restaurant_handlers/shufersal_handler.js'});
  chrome.tabs.remove(tab.id);
}

function createAutobisSchedule() {
  var now = new Date();
  var timestamp = +new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 18, 0, 0);

  chrome.alarms.create(AUTOBIS_SCHEDULE_ALARM_NAME, {
      when: +new Date(),
      periodInMinutes: 60 * 24 // 1 full day
  });
}

// Listen
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === AUTOBIS_SCHEDULE_ALARM_NAME) {
      console.log(new Date());
      getDailyBalance()
  }
});

createAutobisSchedule();