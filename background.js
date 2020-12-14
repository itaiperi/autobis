const AUTOBIS_SCHEDULE_ALARM_NAME = 'AutobisSchedule'

function createAutobisSchedule() {
  var now = new Date();
  var timestamp = +new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0, 0);

  chrome.alarms.create(AUTOBIS_SCHEDULE_ALARM_NAME, {
      when: timestamp,
      periodInMinutes: 60 * 24 // 1 full day
  });
}

// Listen
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === AUTOBIS_SCHEDULE_ALARM_NAME) {
      console.log(new Date());
  }
});

createAutobisSchedule();