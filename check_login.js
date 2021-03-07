function checkLogin() {
  userCookieRegex = /(^|; )uid=\S*(;|$)/;
  return userCookieRegex.test(document.cookie);
}

chrome.runtime.onMessage.addListener(function listener(message, sender, sendResponse) {
  if (message != 'checkLogin') {
    return;
  }
  chrome.runtime.onMessage.removeListener(listener);
  let isLoggedIn = checkLogin();
  sendResponse(isLoggedIn);
});
