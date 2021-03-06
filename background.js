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

const NOTIFICATIONS_ENABLED_DB_KEY = 'notificationsEnabled';
const DEFAULT_NOTIFICATIONS_ENABLED = true;

async function getActiveDays() {
  return await storageLocalGetWithDefault(DB_ACTIVE_DAYS_KEY, DEFAULT_ACTIVE_DAYS);
}

async function getTriggerTime() {
  return await storageLocalGetWithDefault(DB_TRIGGER_TIME_KEY, DEFAULT_TRIGGER_TIME);
}

async function getNotificationsEnabled() {
  return await storageLocalGetWithDefault(NOTIFICATIONS_ENABLED_DB_KEY, DEFAULT_NOTIFICATIONS_ENABLED);
}

function isLoggedIn() {
  userCookieRegex = /(^|; )uid=\S*(;|$)/;
  return userCookieRegex.test(document.cookie);
}

async function orderCoupon() {
  let notificationsEnabled = await getNotificationsEnabled();
  let notifier = new Notifier(notificationsEnabled);
  if (!isLoggedIn()) {
    console.log('User is not logged in, cannot order coupon');
    notifier.notify('You are not logged into the 10bis website, cannot order coupon');
    return;
  }
  let selectedRestaurant = (await storageLocalGet(['selectedRestaurant']))['selectedRestaurant'];
  if (!selectedRestaurant || !(selectedRestaurant in RESTAURANTS_URLS)) {
    notifier.notify(`Selected restaurant ${selectedRestaurant} doesn't exist!`)
    throw `Selected restaurant ${selectedRestaurant} doesn\'t exist`;
  }

  let tab = await createTab('https://www.10bis.co.il/next/user-report');
  for (let filePath of ['utils.js', 'restaurant_handlers/utils.js', 'get_daily_balance.js']) {
    await executeScriptPromise(tab.id, {file: filePath});
  }
  let balance = await sendMessagePromise(tab.id);
  if (!balance) {
    console.log(`Balance is ${balance}, not ordering.`);
    notifier.notify(`Seems like you've used up all your 10bis for the day! Your daily balance is ${balance}.`);
    chrome.tabs.remove(tab.id);
    return;
  }
  console.log('Fetched balance is:', balance);
  
  await changeTabURL(tab, RESTAURANTS_URLS[selectedRestaurant]);
  for (let filePath of ['utils.js', 'restaurant_handlers/utils.js', 'restaurant_handlers/shufersal_handler.js']) {
    await executeScriptPromise(tab.id, {file: filePath});
  }

  // after order, page is redirected to an "order success page"
  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
    if (tabId == tab.id && changeInfo.url && changeInfo.url.includes('order-success')) {
      chrome.tabs.onUpdated.removeListener(listener);
      // close tab since ordering process is finished
      chrome.tabs.remove(tab.id);
    }
  });

  let orderAndPayResponse = await sendMessagePromise(tab.id, {maxPrice: balance});
  if (orderAndPayResponse.status == 'failed') {
    console.log(orderAndPayResponse.detail);
    notifier.notify(`Failed to order coupon! Reason: ${orderAndPayResponse.detail}`);

    chrome.tabs.remove(tab.id);
    throw 'Couldn\'t order and pay for coupon, aborting.'
  } else {
    console.log('Ordered dish successfully, price:', orderAndPayResponse.dishPrice);
    notifier.notify(`Coupon of ${orderAndPayResponse.dishPrice}₪ ordered successfully!`);
  }
}

async function createAutobisSchedule() {
  let now = new Date();
  let triggerTime = await getTriggerTime();
  let triggerHour = parseInt(triggerTime.split(':')[0]);
  let triggerMinute = parseInt(triggerTime.split(':')[1]);
  let triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), triggerHour, triggerMinute, 0, 0);
  if (triggerDate < now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }
  console.log(`Setting up trigger to ${triggerTime}`);

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

getNotificationsEnabled().then(notificationsEnabled => {
  console.log('Notifications enabled:', notificationsEnabled);
})

createAutobisSchedule();
