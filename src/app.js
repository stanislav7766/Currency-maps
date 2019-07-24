import Telegraf from 'telegraf'
import Markup from 'telegraf/markup'
import dotenv from 'dotenv'
// import assert from 'assert'
// import GooglePlaces from 'googleplaces'
import {
  papyrus,
  commands,
  context,
  validation,
  definiteLoggerLevel,
  responsesCollection,
} from './helpers'
import axios from 'axios'
import HtmlTableToJson from 'html-table-to-json'
import moment from 'moment'

dotenv.config()
// const gpConfig = {
//   apiKey: process.env.GOOGLE_PLACES_API_KEY,
//   outputFormat: process.env.GOOGLE_PLACES_OUTPUT_FORMAT,
// }

const PORT = process.env.APP_PORT
const bot = new Telegraf(process.env.BOT_ACCOUNT_TOKEN)
const keyboard = (...args) =>
  Markup.keyboard(...args)
    .oneTime()
    .resize()
    .extra()

try {
  bot.telegram.setWebhook(process.env.EXPOSE_URL)
  bot.startWebhook('/', null, PORT)
} catch (err) {
  console.log(err)
  bot.telegram.deleteWebhook()
}

const cleanEnnecessary = arr => {
  arr.forEach(obj =>
    Object.keys(obj).forEach(
      key => key !== 'Bank' && (obj[key] = obj[key].match(/([0-9]*[.])?[0-9]+/)[0]),
    ),
  )
  return arr
}
bot.start(async ctx => {
  try {
    const reply = (...args) => ctx.reply(...args)
    responsesCollection.has(commands.CONVERSATION_STARTED) &&
      responsesCollection.get(commands.CONVERSATION_STARTED)(reply, keyboard)
  } catch (err) {
    console.log(err)
  }
})
bot.hears('test', async ctx => {
  const response = await axios.get(
    `https://cxrate.com/en/banks/usd/${moment(new Date()).format('YYYY-MM-DD')}`,
  )
  const table = response.data.match(/(<table[^>]*>(?:.|\n)*?<\/table>)/)[1]
  const tableJSON = new HtmlTableToJson(table)
  const rates = cleanEnnecessary(tableJSON.results[0])
})
bot.on('location', async ctx => {
  const reply = (...args) => ctx.reply(...args)

  const { location, from } = ctx.message
  responsesCollection.has(commands.SHARE_LOCATION) &&
    responsesCollection.get(commands.SHARE_LOCATION)(location, reply, keyboard)
  // const parameters = {
  //   location: [location.latitude, location.longitude],
  //   // language: ['en', 'ru'],
  //   // types: 'bank',
  //   // radius: 2000,
  //   // keyword: 'bank',
  // }
  // googlePlaces.placeSearch(parameters, (error, response) => {
  //   if (error) throw error
  //   const parameters = {
  //     location: [location.latitude, location.longitude],
  //     language: ['en', 'ru'],
  //     types: 'bank',
  //     radius: 200000,

  //     // keyword: 'bank',
  //     query: `bank ${response.results[0].name}`,
  //   }
  //   console.log(response.results[0].name)

  //   // console.log(response.results)
  //   googlePlaces.placeSearch(parameters, (error, response) => {
  //     if (error) throw error
  //     console.log(response.results.map(b => b.name))
  //   })
  // })

  // const list = await axios.get(
  //   `https://maps.googleapis.com/maps/api/place/textsearch/json?query=bank+kyiv&sensor=false&key=AIzaSyDEqAOVuB0xYjMjlFElZnvy6xhOCVqn-_M`,
  // )
  // const list = await axios.get(
  //   `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${
  //     location.longitude
  //   }&radius=2000&type=bank&keyword=bank+kyiv&key=AIzaSyDEqAOVuB0xYjMjlFElZnvy6xhOCVqn-_M`,
  // )
  // console.log(list.data.results.map(b => b.name))
})
bot.on('message', async ctx => {
  const reply = (...args) => ctx.reply(...args)

  const { text } = ctx && ctx.message
  if (responsesCollection.has(text)) responsesCollection.get(text)(text, reply, keyboard)
  else if (validation.isCurrency(text))
    responsesCollection.has(commands.CHOOSEN_CURRENCY) &&
      responsesCollection.get(commands.CHOOSEN_CURRENCY)(text, reply, keyboard)
  else if (validation.isBuyOrSell(text))
    responsesCollection.has(commands.CHOOSEN_BUY_OR_SELL) &&
      responsesCollection.get(commands.CHOOSEN_BUY_OR_SELL)(text, reply, keyboard)
})

bot.catch(err => console.log(err))
bot.launch()
