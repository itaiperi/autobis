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
const DB_TRIGGER_TIME_KEY = 'triggerTime';
const DEFAULT_TRIGGER_TIME = '23:00';

async function getActiveDays() {
  let activeDays = await storageLocalGet(DB_ACTIVE_DAYS_KEY);
  if (!activeDays.hasOwnProperty(DB_ACTIVE_DAYS_KEY)) {
    activeDays = DEFAULT_ACTIVE_DAYS;
    await storageLocalSet({[DB_ACTIVE_DAYS_KEY]: activeDays});
  }
  else {
    activeDays = activeDays[DB_ACTIVE_DAYS_KEY];
  }
  return activeDays;
}

async function getTriggerTime() {
  let triggerTime = await storageLocalGet(DB_TRIGGER_TIME_KEY);
  if (!triggerTime.hasOwnProperty(DB_TRIGGER_TIME_KEY)) {
    triggerTime = DEFAULT_TRIGGER_TIME;
    await storageLocalSet({[DB_TRIGGER_TIME_KEY]: triggerTime});
  }
  else {
    triggerTime = triggerTime[DB_TRIGGER_TIME_KEY];
  }
  return triggerTime;
}

async function orderCoupon() {
  let selectedRestaurant = (await storageLocalGet(['selectedRestaurant']))['selectedRestaurant'];
  if (!selectedRestaurant || !(selectedRestaurant in RESTAURANTS_URLS)) {
    throw `Selected restaurant ${selectedRestaurant} doesn\'t exist`;
  }

  let tab = await createTab('https://www.10bis.co.il/next/user-report');
  for (let filePath of ['utils.js', 'restaurant_handlers/utils.js', 'get_daily_balance.js']) {
    await executeScriptPromise(tab.id, {file: filePath});
  }
  let balance = await sendMessagePromise(tab.id);
  if (!balance) {
    console.log('Couldn\'t fetch balance, aborting.');
    throw 'Couldn\'t fetch balance, aborting.';
  }
  console.log('Fetched balance is:', balance);
  
  await changeTabURL(tab, RESTAURANTS_URLS[selectedRestaurant]);
  for (let filePath of ['utils.js', 'restaurant_handlers/utils.js', 'restaurant_handlers/shufersal_handler.js']) {
    await executeScriptPromise(tab.id, {file: filePath});
  }
  let orderAndPayResponse = await sendMessagePromise(tab.id, {maxPrice: balance});
  if (orderAndPayResponse.status == 'failed') {
    console.log(orderAndPayResponse.detail);
    throw 'Couldn\'t order and pay for coupon, aborting.'
  } else {
    console.log('Ordered dish successfully, price:', orderAndPayResponse.dishPrice);
  }
  chrome.tabs.remove(tab.id);
}

async function createAutobisSchedule() {
  let now = new Date();
  let triggerTime = await getTriggerTime();
  let triggerHour = parseInt(triggerTime.split(':')[0]);
  let triggerMinute = parseInt(triggerTime.split(':')[1]);
  let triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), triggerHour, triggerMinute, 0, 0);
  console.log(`Setting up trigger to ${triggerTime}`)

  chrome.alarms.create(AUTOBIS_SCHEDULE_ALARM_NAME, {
      when: +triggerDate,
      periodInMinutes: 60 * 24 // 1 full day
  });
}

chrome.runtime.onInstalled.addListener(function (object) {
  if(object.reason !== 'install') {
    return;
  }
  chrome.tabs.create({url: "options.html"});
});

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
      if (response) {
        resolve(response);
      }
      else {
        reject(response);
      }
    });
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
    chrome.storage.local.set(keys, () => {
      resolve();
    });
  });
}
