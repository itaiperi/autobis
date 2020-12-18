LOADING_SELECTOR = ".SkeletonLoader__Skeleton-z1debk-0.iVHhNB";
DISH_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.MenuDish__DishButton-sc-2y48ut-0.jcEGx";
PRICE_SELECTOR = "div.PriceLabel__Root-tydi84-0.knULYw";
ADD_DISH_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.CartButton__CartActionButton-sc-1arq6pq-0.hxYjpe";
PAYMENT_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.ShoppingCartDishesstyled__PaymentActionButton-sc-1nxv2vd-19.fjiWqc";

let maxPrice = 50;

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

  let addDishElement = null;
  // wait for add-dish-to-selection modal to appear
  while (!addDishElement) {
    addDishElement = document.querySelector(ADD_DISH_BUTTON_SELECTOR);
    await asyncSleep(100);
  }
  addDishElement.click();
  // wait for add-dish-to-selection modal to disappear
  while(addDishElement) {
    addDishElement = document.querySelector(ADD_DISH_BUTTON_SELECTOR);
    await asyncSleep(100);
  }
}

function processPayment() {
  let paymentElement = document.querySelector(PAYMENT_BUTTON_SELECTOR);
  paymentElement.click();
}

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
