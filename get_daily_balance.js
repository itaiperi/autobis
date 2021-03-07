const BALANCE_SELECTOR = 'div[class*=MoneyCardDetails__MoneyCardDetailWrapper] div[type=balance]:nth-of-type(3) > div[class*=PriceLabel__Root]';

function getDailyBalance() {
  let balanceElement = document.querySelector(BALANCE_SELECTOR);
  let balance = balanceElement?.innerText.match(/\d+/)[0];
  if (balance) {
    balance = parseFloat(balance);
  }
  
  return balance;
}

chrome.runtime.onMessage.addListener(function listener(message, sender, sendResponse) {
  if (message != 'getDailyBalance') {
    return;
  }
  chrome.runtime.onMessage.removeListener(listener);
  balance = getDailyBalance();
  sendResponse(balance);
});
