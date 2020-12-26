LOADING_SELECTOR = ".SkeletonLoader__Skeleton-z1debk-0.iVHhNB";
DISH_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.MenuDish__DishButton-sc-2y48ut-0.jcEGx";
PRICE_SELECTOR = "div.PriceLabel__Root-tydi84-0.knULYw";
ADD_DISH_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.CartButton__CartActionButton-sc-1arq6pq-0.hxYjpe";
PAYMENT_OVERVIEW_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.ShoppingCartDishesstyled__PaymentActionButton-sc-1nxv2vd-19.fjiWqc";
ACTUAL_PAYMENT_BUTTON_SELECTOR = "button.Button-sc-11oikyv-0.Button__StyledButton-sc-11oikyv-1.Button__ActionButton-sc-11oikyv-2.iGEsMm";

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
  actualPaymentElement.click(); // COMMENT THIS IN ONLY IF YOU REALLY WANT TO MAKE PAYMENT!
}
