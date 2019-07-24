import dotenv from 'dotenv'
import { commands } from './markup'
import { papyrus } from './papyrus'
import { definiteLoggerLevel } from './logger'
import { context } from './context'
import { contextTree } from './contextTree'
import { validation } from './validation'
import moment from 'moment'
import axios from 'axios'
import HtmlTableToJson from 'html-table-to-json'
import { includesBanksVariant } from './includesBanksVariant'
var urlencode = require('urlencode')

dotenv.config()
// const errorOnResponse = res => /^[4|5]\d{2,2}$/i.test(res)
const cleanEnnecessary = arr => {
  arr.forEach(obj =>
    Object.keys(obj).forEach(
      key => key !== 'Bank' && (obj[key] = obj[key].match(/([0-9]*[.])?[0-9]+/)[0]),
    ),
  )
  return arr
}
const cleanEnnecessaryCity = arr => {
  console.log(typeof arr[0]['Population (2014 estimate)'], arr[0]['Population (2014 estimate)'])

  return arr.map(obj => ({
    city_name: obj['City name'],
    city_population: Number(obj['Population (2014 estimate)'].replace(/,/g, '.')),
  }))
}
const TemplateResponse = async (command, fn, keyboard) => {
  try {
    const ctx = contextTree.getCurrentCtx(command)
    context.emit('changeContext', ctx)
    await fn(ctx.papyrus, keyboard(ctx.keyboard))
  } catch (err) {
    console.log(err)
  }
}
const TemplateResponseWithInput = async (command, input, fn, keyboard) => {
  try {
    const ctx = contextTree.getCurrentCtx(command)
    context.emit('changeContext', ctx)
    await fn(ctx.papyrus(input), keyboard(ctx.keyboard))
  } catch (err) {
    console.log(err)
  }
}

const BackResponse = async (fn, keyboard) => {
  try {
    const curCtx = context.getContext()
    let ctx = {}
    if (validation.isEmpty(curCtx.command) || curCtx.command === commands.CONVERSATION_STARTED) {
      TemplateResponse(commands.CONVERSATION_STARTED, fn, keyboard)
    } else {
      ctx = contextTree.getParentOfCurContext(curCtx.command)
      await fn(ctx.papyrus, keyboard(ctx.keyboard))
    }
  } catch (err) {
    console.log(err)
  }
}

const ConversationStarted = async (fn, keyboard) => {
  try {
    TemplateResponse(commands.CONVERSATION_STARTED, fn, keyboard)
  } catch (err) {
    console.log(err)
  }
}

const FindBanksResponse = async (command, fn, keyboard) => {
  try {
    if (validation.isEmpty(context.getCurrency()) || validation.isEmpty(context.getAction())) {
      TemplateResponse(
        validation.isEmpty(context.getCurrency()) ? commands.CHOOSE_CURRENCY : commands.BUY_OR_SELL,
        fn,
        keyboard,
      )
    } else {
      TemplateResponseWithInput(command, context.getAction(), fn, keyboard)
      // context.emit('changeContext', contextTree.getCurrentCtx(commands.CONVERSATION_STARTED))
    }
  } catch (err) {
    console.log(err)
  }
}
const ChooseBuyOrSellResponse = async (command, fn, keyboard) => {
  try {
    !validation.isEmpty(context.getAction()) && validation.isBuyOrSell(context.getAction())
      ? TemplateResponseWithInput(commands.EXIST_ACTION, context.getAction(), fn, keyboard)
      : TemplateResponse(command, fn, keyboard)
  } catch (err) {
    console.log(err)
  }
}
const ChooseCurrencyResponse = async (command, fn, keyboard) => {
  try {
    !validation.isEmpty(context.getCurrency()) && validation.isCurrency(context.getCurrency())
      ? TemplateResponseWithInput(commands.EXIST_CURRENCY, context.getCurrency(), fn, keyboard)
      : TemplateResponse(command, fn, keyboard)
  } catch (err) {
    console.log(err)
  }
}
const ChangeCurrencyResponse = async (fn, keyboard) => {
  try {
    TemplateResponse(commands.CHOOSE_CURRENCY, fn, keyboard)
  } catch (err) {
    console.log(err)
  }
}
const ChangeActionResponse = async (fn, keyboard) => {
  try {
    TemplateResponse(commands.BUY_OR_SELL, fn, keyboard)
  } catch (err) {
    console.log(err)
  }
}

function toRad(Value) {
  /** Converts numeric degrees to radians */
  return (Value * Math.PI) / 180
}
function distFrom(lat1, lng1, lat2, lng2) {
  let earthRadius = 6371000 //meters
  var dLat = toRad(lat2 - lat1)
  var dLng = toRad(lng2 - lng1)
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var dist = Number(earthRadius * c)

  return dist
}
const ChoosenCurrencyResponse = async (currency, fn, keyboard) => {
  try {
    if (validation.isCurrency(currency)) context.setCurrency(currency)
    TemplateResponseWithInput(commands.CHOOSEN_CURRENCY, currency, fn, keyboard)
  } catch (err) {
    console.log(err)
  }
}
const ChoosenActionResponse = async (action, fn, keyboard) => {
  try {
    if (validation.isBuyOrSell(action)) context.setAction(action)
    TemplateResponseWithInput(commands.CHOOSEN_BUY_OR_SELL, action, fn, keyboard)
  } catch (err) {
    console.log(err)
  }
}
const notIncludes = (str, arr) =>
  !validation.isEmpty(includesBanksVariant[str]) &&
  arr.every(elem =>
    includesBanksVariant[str].every(e => {
      const regexp = new RegExp(`[\s"-?!#$%^&*()'ʹ\w]*(${e})`, 'ig')

      if (regexp.test(elem.name))
        if (
          distFrom(
            context.getLocation().latitude,
            context.getLocation().longitude,
            elem.geometry.location.lat,
            elem.geometry.location.lng,
          ) <= 20000
        )
          return false
        else {
          console.log(
            elem.name,
            '>=20000',
            distFrom(
              context.getLocation().latitude,
              context.getLocation().longitude,
              elem.geometry.location.lat,
              elem.geometry.location.lng,
            ),
          )
          return true
        }
      else {
        return true
      }
    }),
  )
// const notIncludes = (str, arr) =>
//   !validation.isEmpty(includesBanksVariant[str]) &&
//   includesBanksVariant[str].every(elem => {
//     // !arr.includes(elem)
//     console.log('regexp', elem)
//     console.log(arr)
//     const regexp = new RegExp(`[\s"-?!#$%^&*()'ʹ\w]*(${elem})`, 'ig')

//     return console.log(arr.find(value => regexp.test(value)) ? false : true)
//   })
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const makeRequest = async (token, res) => {
  console.log(token)

  let response = {}
  if (token === 'start') {
    await sleep(2000)
    response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=banks+${context.getCity()}&inputtype=textquery&fields=photos,formatted_address,name,opening_hours,rating&locationbias=circle:10000@${
        context.getLocation().l
      },-122.2226413&key=YOUR_API_KEY
      `,
      // `https://maps.googleapis.com/maps/api/place/textsearch/json?query=banks+${context.getCity()}&location=${
      //   context.getLocation().latitude
      // },${context.getLocation().longitude}&radius=10000&key=${process.env.GOOGLE_PLACES_API_KEY}`,
    )
  } else if (token) {
    await sleep(2000)
    response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
        context.getLocation().latitude
      },${
        context.getLocation().longitude
      }&radius=10000&type=bank&keyword=${context.getCity()}&key=${
        process.env.GOOGLE_PLACES_API_KEY
      }&pagetoken=${token}`,
      // `https://maps.googleapis.com/maps/api/place/textsearch/json?query=banks+${context.getCity()}&location=${
      //   context.getLocation().latitude
      // },${context.getLocation().longitude}&radius=10000&key=${
      //   process.env.GOOGLE_PLACES_API_KEY
      // }&pagetoken=${token}`,
    )
  } else {
    return res
  }

  // console.log('response', response.data)

  response.data && response.data.results.map(o => res.push(o.name))
  return response.data.next_page_token ? makeRequest(response.data.next_page_token, res) : res
}

async function delayed(banks_api, test) {
  const responsesName = []
  await makeRequest('start', responsesName)
  console.log(responsesName)
}

async function delayedLog(bank, test) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Ukraine+${context.getCity()}&key=${
      process.env.GOOGLE_PLACES_API_KEY
    }`,
  )
  console.log(response.data.results[0])

  // const response = await axios.get(
  //   `https://maps.googleapis.com/maps/api/place/textsearch/json?query=bank+${urlencode(
  //     includesBanksVariant[bank.Bank][0],
  //     'gbk',
  //   )}+${context.getCity()}&location=${context.getLocation().latitude},${
  //     context.getLocation().longitude
  //   }&radius=20000&key=${process.env.GOOGLE_PLACES_API_KEY}`,
  // )
  // console.log('---------------------------\n', response.data)
  // console.log(response./data)

  if (!validation.isEmpty(response.data.results)) {
    // const distance = distFrom(
    //   context.getLocation().latitude,
    //   context.getLocation().longitude,
    //   response.data.results[0].geometry.location.lat,
    //   response.data.results[0].geometry.location.lng,
    // )
    // console.log(distance)

    console.log(bank, '------------', response.data.results.map(o => o.name))
    console.log(!notIncludes(bank.Bank, await response.data.results))
    if (!notIncludes(bank.Bank, await response.data.results)) {
      test.push(bank)
    } else console.log(bank.Bank, 'empty res')
  }
  // const response = await axios.get(
  //   `https://maps.googleapis.com/maps/api/place/textsearch/json?query=bank+${urlencode(
  //     includesBanksVariant[bank.Bank][0],
  //     'gbk',
  //   )}&location=${context.getLocation().latitude},${
  //     context.getLocation().longitude
  //   }&radius=2000&key=${process.env.GOOGLE_PLACES_API_KEY}`,
  // )
  // console.log(await response.data)

  // console.log(await response.data.results.map(o => o.name))
  // if (!validation.isEmpty(response.data.results)) {
  //   if (!notIncludes(bank.Bank, await response.data.results.map(o => o.name))) {
  //     test.push(bank)
  //   } else {
  //     console.log('not include', bank.Bank, '=====', await response.data.results.map(o => o.name))
  //   }
  // }
}

const mapRates = async banks => {
  const test = []

  async function processArray(array) {
    // console.log('banks before', banks.length, banks)

    try {
      // await delayed(banks, test)
      for (const item of array) {
        await delayedLog(item, test)
      }
      console.log('Done!')
      console.log('test', test.length, test)
      console.log('banks', banks.length, banks)
    } catch (err) {
      console.log('err', err)
    }
  }
  processArray(banks)
}

const ContinueFindBanksResponse = async (fn, keyboard) => {
  try {
    const response = await axios.get(
      `https://cxrate.com/en/banks/${context.getCurrency().toLowerCase()}/${moment(
        new Date(),
      ).format('YYYY-MM-DD')}`,
    )
    const table = response.data.match(/(<table[^>]*>(?:.|\n)*?<\/table>)/)[1]
    const tableJSON = new HtmlTableToJson(table)
    const banks = cleanEnnecessary(tableJSON.results[0])
    // console.log(banks)
    await mapRates(banks)

    // const responseWiki = await axios.get(`https://en.wikipedia.org/wiki/List_of_cities_in_Ukraine`)
    // const tableCity = responseWiki.data.match(/(<table[^>]*>(?:.|\n)*?<\/table>)/)[1]
    // console.log('table', tableCity)

    // const tableCityJSON = new HtmlTableToJson(tableCity)
    // const cities = cleanEnnecessaryCity(tableCityJSON.results[0])

    // console.log(cities)
  } catch (err) {
    console.log(err)
  }
}
const ShareLocationResponse = async (location, fn, keyboard) => {
  try {
    ;(context.getLocation().latitude === '' || context.getLocation.longitude === '') &&
      context.setLocation(location)

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${
        location.longitude
      }&radius=2000&key=${process.env.GOOGLE_PLACES_API_KEY}`,
    )
    const city = response.data.results[0].name
    !validation.isEmpty(city) && context.setCity(city)
    TemplateResponseWithInput(commands.CHECK_CITY, city, fn, keyboard)
  } catch (err) {
    context.emit('changeContext', contextTree.getCurrentCtx(commands.CONVERSATION_STARTED))
    fn(papyrus.errorOnResponse(), context.getContext().keyboard)
  }
}

const responsesCollection = new Map()

responsesCollection.set(commands.GO_BACK, (command, fn, keyboard) => BackResponse(fn, keyboard))
responsesCollection.set(commands.CONVERSATION_STARTED, (fn, keyboard) =>
  ConversationStarted(fn, keyboard),
)
responsesCollection.set(commands.CHOOSE_CURRENCY, (command, fn, keyboard) =>
  ChooseCurrencyResponse(command, fn, keyboard),
)
responsesCollection.set(commands.BUY_OR_SELL, (command, fn, keyboard) =>
  ChooseBuyOrSellResponse(command, fn, keyboard),
)
responsesCollection.set(commands.CHOOSEN_CURRENCY, (currency, fn, keyboard) =>
  ChoosenCurrencyResponse(currency, fn, keyboard),
)
responsesCollection.set(commands.CHOOSEN_BUY_OR_SELL, (action, fn, keyboard) =>
  ChoosenActionResponse(action, fn, keyboard),
)
responsesCollection.set(commands.FIND_BANKS, (command, fn, keyboard) =>
  FindBanksResponse(command, fn, keyboard),
)
responsesCollection.set(commands.CHANGE_CURRENCY, (command, fn, keyboard) =>
  ChangeCurrencyResponse(fn, keyboard),
)
responsesCollection.set(commands.CHANGE_ACTION, (command, fn, keyboard) =>
  ChangeActionResponse(fn, keyboard),
)
responsesCollection.set(commands.SHARE_LOCATION, (location, fn, keyboard) =>
  ShareLocationResponse(location, fn, keyboard),
)
responsesCollection.set(commands.CONFIRM_CITY, (command, fn, keyboard) =>
  ContinueFindBanksResponse(fn, keyboard),
)

export { responsesCollection }
