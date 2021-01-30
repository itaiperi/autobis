LOADING_SELECTOR = "div.SkeletonLoader__Skeleton-z1debk-0.eJsgbS";
DISH_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.MenuDish__DishButton-sc-2y48ut-0.kqYuKm.bResyC";
PRICE_SELECTOR = "div.PriceLabel__Root-tydi84-0.gakfOj";
REMOVE_DISH_SELECTOR = "button.ShoppingCartDishesstyled__RemoveButton-sc-1nxv2vd-20";
ADD_DISH_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.CartButton__CartActionButton-sc-1arq6pq-0.kqYuKm.kklumj.czeTo.cGRdas";
PAYMENT_OVERVIEW_BUTTON_SELECTOR = "div.ShoppingCartDishesstyled__Container-sc-1nxv2vd-4.exDWuJ > div:not(.styled__HideOnDefaultAndAbove-sc-1my4kki-10):not(.cmAjot) > button";
ACTUAL_PAYMENT_BUTTON_SELECTOR = "div.SendOrderSection__Container-sc-7m24wr-1.QuwCR > button";

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
  let paymentOverviewElement = document.querySelector(PAYMENT_OVERVIEW_BUTTON_SELECTOR);
  paymentOverviewElement.click();
  let actualPaymentElement = await waitForElementBySelector(ACTUAL_PAYMENT_BUTTON_SELECTOR);
  actualPaymentElement.click(); // COMMENT THIS IN ONLY IF YOU REALLY WANT TO MAKE PAYMENT!
}
