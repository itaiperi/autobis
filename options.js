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
  let triggerTime = (await storageLocalGet('triggerTime'))['triggerTime'];
  let triggerTimeElement = document.querySelector('input#time_in_day');
  triggerTimeElement.value = triggerTime;
  
  triggerTimeElement.addEventListener('change', async () => {
    let triggerTime = triggerTimeElement.value;
    storageLocalSet({triggerTime});
    
    // Set up new alarm
    let now = new Date();
    let triggerHour = parseInt(triggerTime.split(':')[0]);
    let triggerMinute = parseInt(triggerTime.split(':')[1]);
    let triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), triggerHour, triggerMinute, 0, 0);
    if (triggerDate < now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }
    console.log(`Setting up trigger to ${triggerTime}`)

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
