async function setActiveDaysStateAndListeners() {
  let activeDays = await storageLocalGet('activeDays');
  activeDays = activeDays['activeDays'];

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
      activeDays[dayIndex] = dayElement.checked || false;
      console.log(dayElement.checked);
      console.log('Setting active days', activeDays);
      storageLocalSet({activeDays});
    });
  }
}

setActiveDaysStateAndListeners()
