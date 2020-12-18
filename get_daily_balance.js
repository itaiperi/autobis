function getDailyBalance() {
  let balanceElement = document.querySelector('.MoneyCardDetail__DetailsBox-q2rq3n-0.ffQfNF > div.MoneyCardDetail__Sum-q2rq3n-1.hqiiyz:nth-of-type(3)');
  let balance = balanceElement?.innerText.match(/\d+/)[0]
  if (balance) {
    balance = parseFloat(balance);
  }
  
  chrome.runtime.sendMessage({from: 'getDailyBalance', balance: balance});
}

getDailyBalance();