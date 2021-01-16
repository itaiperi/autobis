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

setActiveDaysStateAndListeners();
setRestaurantsStateAndListeners();
