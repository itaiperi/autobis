let maxPrice = 50;

async function orderAndPay(maxPrice) {
  if (!maxPrice) {
    chrome.runtime.sendMessage({from: 'orderAndPay', status: 'failed',
      detail: 'maxPrice not provided.'});
    return;
  }
  await waitForElementBySelector(LOADING_SELECTOR, false, timeout=30000);
  let [dishElement, dishPrice] = chooseDish(maxPrice);
  if (!dishElement) {
    chrome.runtime.sendMessage({from: 'orderAndPay', status: 'failed',
      detail: 'No dish to to select'});
    return;
  }
  console.log(`Dish price: ${dishPrice}, dish element:`, dishElement);
  await addDishToOrder(dishElement);
  await asyncSleep(300);
  await processPayment();
  chrome.runtime.sendMessage({from: 'orderAndPay', status: 'success', dishPrice: dishPrice});
}

orderAndPay(maxPrice);
