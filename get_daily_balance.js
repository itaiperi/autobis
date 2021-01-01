const BALANCE_SELECTOR = '.MoneyCardDetail__Sum-q2rq3n-2.cKFbSo > div.PriceLabel__Root-tydi84-0.bbEcHU';

function getDailyBalance() {
  let balanceElement = document.querySelectorAll(BALANCE_SELECTOR)[1];
  let balance = balanceElement?.innerText.match(/\d+/)[0];
  if (balance) {
    balance = parseFloat(balance);
  }
  
  chrome.runtime.sendMessage({from: 'getDailyBalance', balance: balance});
}

getDailyBalance();