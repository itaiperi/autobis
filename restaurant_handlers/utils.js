LOADING_SELECTOR = "div[class*=DiagonalHeaderView__Header] > div[class*=SkeletonLoader__Skeleton]";
POPUPS_SELECTOR = "button[class*=Modal__CloseButton]";
DISH_BUTTON_SELECTOR = "button[class*=MenuDish__DishButton]";
PRICE_SELECTOR = "div[id^=dishPrice]";
REMOVE_DISH_SELECTOR = "button[class*=ShoppingCartDishesstyled__RemoveButton]";
ADD_DISH_BUTTON_SELECTOR = "button[class*=CartButton__CartActionButton]";
PAYMENT_OVERVIEW_BUTTON_SELECTOR = "div[class*=ShoppingCartDishesstyled__Container] > div:nth-of-type(1) > button:enabled";
ACTUAL_PAYMENT_BUTTON_SELECTOR = "button[class*=CheckoutSubmit__SubmitButton]:enabled";

function closeAllPopups() {
  let popupCloseElements = document.querySelectorAll(POPUPS_SELECTOR);
  for (const element of popupCloseElements) {
    element.click();
  }
}

function chooseRelevantDish(dishesPrices, maxPrice) {
  let relativePrices = dishesPrices.map(num => maxPrice - num);
  let relevantPrices = relativePrices.filter(num => num >= 0);
  if (relevantPrices.length === 0) {
    return -1;
  }
  let selectedDishIndex = relevantPrices.map((price, i) => [price, i]).reduce(
    (prev, curr) => curr[0] < prev[0] ? curr : prev
  )[1];
  return selectedDishIndex;
}

function chooseDish(maxPrice) {
  let dishesElements = document.querySelectorAll(DISH_BUTTON_SELECTOR);
  let dishesPrices = Array.from(dishesElements).map(ele => {
    price_matches = ele.querySelector(PRICE_SELECTOR)?.innerText.match(/[\d\.]+/);
    if (price_matches) {
      return parseFloat(price_matches[0]);
    }
  });
  let selectedDishIndex = chooseRelevantDish(dishesPrices, maxPrice);
  if (selectedDishIndex < 0) {
    console.log(`No appropriate dish found. budget: ${maxPrice}, minimum dish price: ${Math.min(...dishesPrices)}`);
    return [null, null];
  }
  let selectedDishElement = dishesElements[selectedDishIndex];
  let selectedDishPrice = dishesPrices[selectedDishIndex]
  return [selectedDishElement, selectedDishPrice];
}

function removeExistingDishes() {
  let removeDishElements = document.querySelectorAll(REMOVE_DISH_SELECTOR);
  Array.from(removeDishElements).forEach(ele => ele.click());
}

async function addDishToOrder(dishElement) {
  dishElement.click();

  let addDishElement = await waitForElementBySelector(ADD_DISH_BUTTON_SELECTOR, true);
  addDishElement.click();
  await waitForElementBySelector(ADD_DISH_BUTTON_SELECTOR, false);
}

async function processPayment() {
  let paymentOverviewElement = await waitForElementBySelector(PAYMENT_OVERVIEW_BUTTON_SELECTOR);
  paymentOverviewElement.click();
  let actualPaymentElement = await waitForElementBySelector(ACTUAL_PAYMENT_BUTTON_SELECTOR);
  actualPaymentElement.click(); // COMMENT THIS IN ONLY IF YOU REALLY WANT TO MAKE PAYMENT!
}
