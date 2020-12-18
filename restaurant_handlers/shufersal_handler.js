let maxPrice = 50;

async function orderAndPay() {
  while (document.querySelector(LOADING_SELECTOR)) {
    await asyncSleep(100);
  }
  let dishElement = chooseDish();
  if (!dishElement) {
    chrome.runtime.sendMessage({from: 'orderAndPay', status: 'failed'});
    return;
  }
  await addDishToOrder(dishElement);
  await asyncSleep(300);
  processPayment();
  chrome.runtime.sendMessage({from: 'orderAndPay', status: 'success'});
}

orderAndPay();
