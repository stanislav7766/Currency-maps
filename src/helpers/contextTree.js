import { ctxTree } from './context'
import { commands, markup } from './markup'
import { papyrus } from './papyrus'

ctxTree.insert({
  command: commands.CONVERSATION_STARTED,
  keyboard: markup.initialKeyboard(),
  papyrus: papyrus.getInitialGreeting(),
})
ctxTree.insert(
  {
    command: commands.CHOOSE_CURRENCY,
    keyboard: markup.chooseCurrency(),
    papyrus: papyrus.getChooseCurrency(),
  },
  commands.CONVERSATION_STARTED,
)
ctxTree.insert(
  {
    command: commands.EXIST_CURRENCY,
    keyboard: markup.alreadyExistCurrency(),
    papyrus: currency => papyrus.getAlreadyExistCurrency(currency),
  },
  commands.CONVERSATION_STARTED,
)
ctxTree.insert(
  {
    command: commands.BUY_OR_SELL,
    keyboard: markup.chooseBuyOrSell(),
    papyrus: papyrus.getBuyOrSell(),
  },
  commands.CONVERSATION_STARTED,
)
ctxTree.insert(
  {
    command: commands.EXIST_ACTION,
    keyboard: markup.alreadyExistAction(),
    papyrus: action => papyrus.getAlreadyExistAction(action),
  },
  commands.CONVERSATION_STARTED,
)
ctxTree.insert(
  {
    command: commands.CHOOSEN_CURRENCY,
    keyboard: markup.goBack(),
    papyrus: currency => papyrus.getChoosenCurrency(currency),
  },
  commands.CONVERSATION_STARTED,
)
ctxTree.insert(
  {
    command: commands.CHOOSEN_BUY_OR_SELL,
    keyboard: markup.goBack(),
    papyrus: action => papyrus.getChoosenAction(action),
  },
  commands.CONVERSATION_STARTED,
)
ctxTree.insert(
  {
    command: commands.FIND_BANKS,
    keyboard: [],
    papyrus: action => papyrus.getFindBanks(action),
  },
  commands.CONVERSATION_STARTED,
)
ctxTree.insert(
  {
    command: commands.CHECK_CITY,
    keyboard: markup.checkCity(),
    papyrus: city => papyrus.getCheckCity(city),
  },
  commands.FIND_BANKS,
)

export const contextTree = ctxTree
