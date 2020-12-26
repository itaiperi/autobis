const AUTOBIS_SCHEDULE_ALARM_NAME = 'AutobisSchedule'
const RESTAURANTS_URLS = {
  shufersal: 'https://www.10bis.co.il/next/restaurants/menu/delivery/26698/',
  victory: 'https://www.10bis.co.il/next/restaurants/menu/delivery/26699/'
}
const DB_ACTIVE_DAYS_KEY = 'activeDays';
const DEFAULT_ACTIVE_DAYS = {
  0: true,
  1: true,
  2: true,
  3: true,
  4: true,
  5: false,
  6: false,
}

async function getActiveDays() {
  let activeDays = await storageLocalGet(DB_ACTIVE_DAYS_KEY);
  if (!activeDays.hasOwnProperty(DB_ACTIVE_DAYS_KEY)) {
    activeDays = DEFAULT_ACTIVE_DAYS;
    await storageLocalSet({[DB_ACTIVE_DAYS_KEY]: activeDays});
  }
  return activeDays;
}

async function orderCoupon() {
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
  if (orderAndPayResponse.status == 'failed') {
    console.log(orderAndPayResponse.detail);
  } else {
    console.log('Ordered dish successfully');
  }
  chrome.tabs.remove(tab.id);
}

function createAutobisSchedule() {
  let now = new Date();
  let timestamp = +new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0, 0);

  chrome.alarms.create(AUTOBIS_SCHEDULE_ALARM_NAME, {
      when: timestamp,
      periodInMinutes: 60 * 24 // 1 full day
  });
}

chrome.alarms.onAlarm.addListener(async alarm => {
  let activeDays = await getActiveDays();
  let currentDay = new Date().getDay();

  if (alarm.name === AUTOBIS_SCHEDULE_ALARM_NAME) {
    if (activeDays[currentDay]) {
      console.log(new Date(), 'Autobis activated via scheduled event');
      orderCoupon();
    } else {
      console.log('Autobis is turned off for today.');
    }
  }
});

getActiveDays().then(activeDays => {
  // let trueActiveDays = Array();
  // for (let [day, isActive] of Object.entries(activeDays)) {
  //   if (isActive) {
  //     trueActiveDays.push(day);
  //   }
  // }
  console.log(activeDays);
  let trueActiveDays = Object.entries(activeDays)
    .filter(entry => entry[1]) // entry[1] is active status
    .map(entry => entry[0]); // entry[0] is day number
  trueActiveDays = trueActiveDays.map(dayNum => ["Sunday", "Monday", "Tuesday",
    "Wednesday", "Thursday", "Friday", "Saturday"][dayNum]);
  console.log('Active days are:', trueActiveDays.join(', '));
})


createAutobisSchedule();

/****** Utilities ******/
// taken from https://stackoverflow.com/a/44864966/5259379
async function createTab(url) {
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

async function storageLocalGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, result => {
      resolve(result);
    });
  });
}

async function storageLocalSet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, () => {
      resolve();
    });
  });
}
