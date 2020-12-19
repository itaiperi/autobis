LOADING_SELECTOR = ".SkeletonLoader__Skeleton-z1debk-0.iVHhNB";
DISH_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.MenuDish__DishButton-sc-2y48ut-0.jcEGx";
PRICE_SELECTOR = "div.PriceLabel__Root-tydi84-0.knULYw";
ADD_DISH_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.CartButton__CartActionButton-sc-1arq6pq-0.hxYjpe";
PAYMENT_OVERVIEW_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.ShoppingCartDishesstyled__PaymentActionButton-sc-1nxv2vd-19.fjiWqc";
ACTUAL_PAYMENT_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.iGEsMm";

async function waitForElementBySelector(selector, appear=true, timeout=5000, interval=100) {
  let element = document.querySelector(selector);
  let cumtime = 0;
  while (((appear && !element) || (!appear && element)) && cumtime < timeout) {
    await asyncSleep(interval);
    cumtime += interval;
    element = document.querySelector(selector);
  }
  return element;
}

function chooseRelevantDish(dishesPrices, maxPrice) {
  let relativePrices = dishesPrices.map(num => maxPrice - num);
  let relevantPrices = relativePrices.filter(num => num >= 0);
  if (relevantPrices.length === 0) {
    return -1;
  }
  let selectedDishIndex = relevantPrices.map((x, i) => [x, i]).reduce(
    (prev, curr) => curr[0] < prev[0] ? curr[1] : prev[1]
  );
  return selectedDishIndex;
}

function chooseDish() {
  let dishesElements = document.querySelectorAll(DISH_BUTTON_SELECTOR);
  let dishesPrices = Array.from(dishesElements).map(ele => {
    price_matches = ele.querySelector(PRICE_SELECTOR)?.innerText.match(/[\d\.]+/);
    if (price_matches) {
      return parseFloat(price_matches[0]);
    }
  });
  let selectedDishIndex = chooseRelevantDish(dishesPrices, maxPrice);
  if (selectedDishIndex < 0) {
    console.log('No dish found');
    return null;
  }
  let selectedDishElement = dishesElements[selectedDishIndex];
  return selectedDishElement;
}

async function addDishToOrder(dishElement) {
  dishElement.click();

  let addDishElement = await waitForElementBySelector(ADD_DISH_BUTTON_SELECTOR, true);
  addDishElement.click();
  await waitForElementBySelector(ADD_DISH_BUTTON_SELECTOR, false);
}

async function processPayment() {
  let paymentOverviewElement = document.querySelector(PAYMENT_OVERVIEW_BUTTON_SELECTOR);
  paymentOverviewElement.click();
  let actualPaymentElement = await waitForElementBySelector(ACTUAL_PAYMENT_BUTTON_SELECTOR);
  console.log(actualPaymentElement);
  // actualPaymentElement.click(); // COMMENT THIS IN ONLY IF YOU REALLY WANT TO MAKE PAYMENT!
}
