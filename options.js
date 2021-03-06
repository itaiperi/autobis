function timeToDateObj(time) {
  // time format is HH:mm
  let now = new Date();
  let timeHour = parseInt(time.split(':')[0]);
  let timeMinute = parseInt(time.split(':')[1]);
  let timeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeHour, timeMinute, 0, 0);
  return timeDate;
}

function checkTimeBetweenTimes(desiredTime, minTime, maxTime) {
  let desiredDate = timeToDateObj(desiredTime);
  let minDate = timeToDateObj(minTime);
  let maxDate = timeToDateObj(maxTime);
  return desiredDate > minDate && desiredDate < maxDate;
}

async function setNotificationStateAndListeners() {
  let notificationsEnabled = (await storageLocalGet('notificationsEnabled'))['notificationsEnabled'];

  let notificationsElement = document.querySelector('div.notifications > input');
  notificationsElement.checked = notificationsEnabled;

  notificationsElement.addEventListener('change', () => {
    storageLocalSet({notificationsEnabled: notificationsElement.checked});
  });
}

async function setActiveDaysStateAndListeners() {
  let activeDays = (await storageLocalGet('activeDays'))['activeDays'];

  for (let [dayIndex, isActive] of Object.entries(activeDays)) {
    let dayElement = document.querySelector(`div.active-day > input[value="${dayIndex}"]`);
    if (isActive) {
      dayElement.checked = true;
    }
    else {
      dayElement.checked = false;
    }
    dayElement.addEventListener('change', async () => {
      let activeDays = await storageLocalGet(['activeDays']);
      activeDays = activeDays['activeDays'];
      activeDays[dayIndex] = dayElement.checked;
      storageLocalSet({activeDays});
    });
  }
}

async function setTriggerTimeStateAndListeners() {
  function setTimeValidityIcon(time) {
    let triggerTimeValidIcon = document.querySelector('img#time_validity_icon');
    let timeValid = checkTimeBetweenTimes(time, '07:00', '23:45');
    if (timeValid) {
      triggerTimeValidIcon.classList.remove('x-mark');
      triggerTimeValidIcon.classList.add('check-mark');
    }
    else {
      triggerTimeValidIcon.classList.remove('check-mark');
      triggerTimeValidIcon.classList.add('x-mark');
    }
  }
  
  let triggerTime = (await storageLocalGet('triggerTime'))['triggerTime'];
  let triggerTimeElement = document.querySelector('input#time_in_day');
  triggerTimeElement.value = triggerTime;
  setTimeValidityIcon(triggerTime);

  triggerTimeElement.addEventListener('change', async () => {
    let triggerTime = triggerTimeElement.value;
    setTimeValidityIcon(triggerTime);
    storageLocalSet({triggerTime});
    
    // Set up new alarm
    let now = new Date();
    let triggerHour = parseInt(triggerTime.split(':')[0]);
    let triggerMinute = parseInt(triggerTime.split(':')[1]);
    let triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), triggerHour, triggerMinute, 0, 0);
    if (triggerDate < now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }
    console.log(`Setting up trigger to ${triggerTime}`);

    chrome.alarms.create('AutobisSchedule', {
        when: +triggerDate,
        periodInMinutes: 60 * 24 // 1 full day
    });
  });
}

async function setRestaurantsStateAndListeners() {
  let selectedRestaurant = (await storageLocalGet('selectedRestaurant'))['selectedRestaurant'];
  let restaurantsElements = document.querySelectorAll('div.restaurant > input');
  for (let restaurantElement of restaurantsElements) {
    let restaurantName = restaurantElement.value;
    if (restaurantName == selectedRestaurant) {
      restaurantElement.checked = true;
    }
    else {
      restaurantElement.checked = false;
    }
    restaurantElement.onclick = () => {
      console.log('Selected restaurant:', restaurantName);
      storageLocalSet({selectedRestaurant: restaurantName});
    };
  }
}

setRestaurantsStateAndListeners();
setTriggerTimeStateAndListeners();
setActiveDaysStateAndListeners();
setNotificationStateAndListeners();
