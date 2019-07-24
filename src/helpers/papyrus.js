export const papyrus = {
  getAppLabel: () => 'bot-exchange-rates-telegram',
  getInitialGreeting: () => `Привет 👋\n
Я готов помочь тебе с твоей задачей\n 
Вот, что я могу сделать для тебя: \n
👉 Выбирай валюту и необходимую задачу(продажа/покупка валюты) и я помогу найти банки с самым выгодным для тебя курсом 👌`,
  getChooseCurrency: () => `Выбери валюту 💶, которую желаешь купить/продать 💰`,
  getBuyOrSell: () => `Укажи,что тебя интересует продажа или покупка валюты? 🧐`,
  getChoosenCurrency: currency => `Окей, выбрана валюта - ${currency} 👌 🤝`,
  getChoosenAction: action => `Отлично❕\n
Выбрано - ${action} валюты 😉`,
  getFindBanks: action =>
    `Ну что же, укажи в каком городе тебя интересует ${action} валюты или отправь мне свою геолокацию 🤓`,
  getAlreadyExistCurrency: currency =>
    `Хмм, уже выбрана валюта - ${currency} 🤷‍♂️ \n
Хочешь изменить на другую? 😲`,
  getAlreadyExistAction: action =>
    `Хмм, уже выбрано действие - ${action} валюты 🤷‍♂️ \n
Желаешь изменить свое решение? 😏`,
  errorOnResponse: () => `Хмм, у нас сейчас неполадки, попробуй чуть позже(`,
  getCheckCity: city => `Такс, вы находитесь в ${city}?`,
}
