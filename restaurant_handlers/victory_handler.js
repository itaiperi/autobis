async function orderAndPay(maxPrice) {
  if (!maxPrice) {
    return { status: 'failed', detail: 'maxPrice not provided.' };
  }
  await waitForElementBySelector(LOADING_SELECTOR, false, timeout=30000);
  closeAllPopups();
  await asyncSleep(200);
  removeExistingDishes();
  let [dishElement, dishPrice] = chooseDish(maxPrice);
  if (!dishElement) {
    return { status: 'failed', detail: 'No dish to select.' };
  }
  console.log(`Dish price: ${dishPrice}, dish element:`, dishElement);
  await addDishToOrder(dishElement);
  await asyncSleep(300);
  await processPayment();
  return { status: 'success', dishPrice: dishPrice };
}

chrome.runtime.onMessage.addListener(function listener(message, sender, sendResponse) {
  console.log(message);
  chrome.runtime.onMessage.removeListener(listener);
  orderAndPay(message?.maxPrice).then(result => {
    sendResponse(result);
  });
  return true;
});
