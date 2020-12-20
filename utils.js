async function asyncSleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

async function waitForElementBySelector(selector, appear=true, timeout=5000, interval=100) {
  let element = document.querySelector(selector);
  let cumtime = 0;
  while (((appear && !element) || (!appear && element)) && cumtime < timeout) {
    await asyncSleep(interval);
    cumtime += interval;
    element = document.querySelector(selector);
  }
  if (cumtime >= timeout) {
    throw `Waiting for element timed out: ${selector}`;
  }
  return element;
}
