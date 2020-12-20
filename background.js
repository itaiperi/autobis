const AUTOBIS_SCHEDULE_ALARM_NAME = 'AutobisSchedule'
const RESTAURANTS_URLS = {
  shufersal: 'https://www.10bis.co.il/next/restaurants/menu/delivery/26698/',
  victory: 'https://www.10bis.co.il/next/restaurants/menu/delivery/26699/'
}

// taken from https://stackoverflow.com/a/44864966/5259379
async function createTab(url) {
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

async function changeTabURL(tab, url) {
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

async function executeScriptWithPromise(tabId, details) {
  return new Promise(resolve => {
    chrome.tabs.executeScript(tabId, {file: 'utils.js'}, result => {
      chrome.tabs.executeScript(tabId, details, result => {
        resolve(result);
      });
    })
  })
}

async function executeScriptWaitOnMessage(tabId, details, from, additionalScripts) {
  return new Promise(async (resolve, reject) => {
    if (additionalScripts) {
      for (let scriptPath of additionalScripts) {
        await executeScriptWithPromise(tabId, {file: scriptPath});
      };
    }
      const listener = (request, sender, sendResponse) => {
        chrome.runtime.onMessage.removeListener(listener);
        if (request.from != from) {
          reject(request);
        } else {
          resolve(request);
        }
      }
      chrome.runtime.onMessage.addListener(listener);
      chrome.tabs.executeScript(tabId, details);
    });
}

async function getDailyBalance() {
  let tab = await createTab('https://www.10bis.co.il/next/user-report');
  let dailyBalanceResponse = await executeScriptWaitOnMessage(tab.id,
    {file: 'get_daily_balance.js'}, 'getDailyBalance',
    ['utils.js', 'restaurant_handlers/utils.js']);
  let balance = dailyBalanceResponse.balance;
  console.log('Balance:', balance);
  await changeTabURL(tab, RESTAURANTS_URLS['shufersal']);
  let orderAndPayResponse = await executeScriptWaitOnMessage(tab.id,
    {file: 'restaurant_handlers/shufersal_handler.js'}, 'orderAndPay',
    ['utils.js', 'restaurant_handlers/utils.js']);
  let orderAndPayStatus = orderAndPayResponse.status;
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