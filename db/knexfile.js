const HtmlTableToJson = require('html-table-to-json')
const axios = require('axios')
const moment = require('moment')
var urlencode = require('urlencode')
const includesBanksVariant = require('../src/helpers/includesBanksVariant')
// const { context } from './context'
// import { contextTree } from './contextTree'
// import { validation } from './validation'
const options = {
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: '1212',
    password: '1212',
    database: 'currency_city_bot',
  },
}
const dotenv = require('dotenv')

dotenv.config()

const knex = require('knex')(options)

const calcRadius = population => {
  const prop = (population + '').length

  const obj = {
    2: 500,
    3: 1000,
    4: 3000,
    5: 5000,
    6: 7000,
    7: 10000,
    8: 15000,
  }
  return Object.keys(obj).includes(prop.toString()) ? obj[prop] : 0
}

const cleanEnnecessaryCity = arr =>
  arr.map(obj => ({
    city: obj['City name'],
    population: Number(obj['Population (2014 estimate)'].replace(/,/g, '')),
    radius: calcRadius(Number(obj['Population (2014 estimate)'].replace(/,/g, ''))),
  }))

const cleanEnnecessaryUsd = arr =>
  arr.map(obj => ({
    bank_name: obj['Bank'],
    usd_buy: obj['Buy'].match(/([0-9]*[.])?[0-9]+/)[0],
    usd_sell: obj['Sell'].match(/([0-9]*[.])?[0-9]+/)[0],
  }))
const cleanEnnecessaryEur = arr =>
  arr.map(obj => ({
    bank_name: obj['Bank'],
    eur_buy: obj['Buy'].match(/([0-9]*[.])?[0-9]+/)[0],
    eur_sell: obj['Sell'].match(/([0-9]*[.])?[0-9]+/)[0],
  }))
const cleanEnnecessaryRub = arr =>
  arr.map(obj => ({
    bank_name: obj['Bank'],
    rub_buy: obj['Buy'].match(/([0-9]*[.])?[0-9]+/)[0],
    rub_sell: obj['Sell'].match(/([0-9]*[.])?[0-9]+/)[0],
  }))
const cleanEnnecessaryPln = arr =>
  arr.map(obj => ({
    bank_name: obj['Bank'],
    pln_buy: obj['Buy'].match(/([0-9]*[.])?[0-9]+/)[0],
    pln_sell: obj['Sell'].match(/([0-9]*[.])?[0-9]+/)[0],
  }))
const cleanEnnecessaryGbp = arr =>
  arr.map(obj => ({
    bank_name: obj['Bank'],
    gbp_buy: obj['Buy'].match(/([0-9]*[.])?[0-9]+/)[0],
    gbp_sell: obj['Sell'].match(/([0-9]*[.])?[0-9]+/)[0],
  }))
// const createCity = () => {
//   knex.schema
//     .createTable('city', table => {
//       table.increments('city_id').primary()
//       table.string('city', 70)
//       table.integer('population', 8)
//       table.integer('radius', 5)
//     })
//     .then(() => console.log('table city created'))
//     .catch(err => {
//       console.log(err)
//       throw err
//     })
//     .finally(() => {
//       knex.destroy()
//     })
// }

// function insertOrUpdate(tableName, data) {
//   const firstData = data[0] ? data[0] : data
//   return knex.raw(
//     knex(tableName)
//       .insert(data)
//       .toQuery() +
//       ' ON DUPLICATE KEY UPDATE ' +
//       Object.getOwnPropertyNames(firstData)
//         .map(field => `${field}=VALUES(${field})`)
//         .join(', '),
//   )
// }

// const insertOrUpdate = async (tableName, rows) => {
//   return knex.transaction(async trx => {
//     const queries = rows.map(async tuple => {
//       const insert = trx(tableName)
//         .insert(tuple)
//         .toString()
//       const update = trx(tableName)
//         .update(tuple)
//         .toString()
//         .replace(/^update(.*?)set\s/gi, '')

//       return trx.raw(`${insert} ON DUPLICATE KEY UPDATE ${update}`).transacting(trx)
//     })

//     return await Promise.all(queries)
//       .then(trx.commit)
//       .catch(trx.rollback)
//   })
// }
const insertCity = async () => {
  const responseWiki = await axios.get(`https://en.wikipedia.org/wiki/List_of_cities_in_Ukraine`)
  const tableCity = responseWiki.data.match(/(<table[^>]*>(?:.|\n)*?<\/table>)/)[1]

  const tableCityJSON = new HtmlTableToJson(tableCity)
  const cities = cleanEnnecessaryCity(tableCityJSON.results[0])
  // insertOrUpdate('city', cities)
  knex('city')
    .insert(cities)
    .then(() => console.log('data inserted'))
    .catch(err => {
      console.log(err)
      throw err
    })
    .finally(() => {
      knex.destroy()
    })
}
const queryBank = cur =>
  axios
    .get(`https://cxrate.com/en/banks/${cur}/${moment(new Date()).format('YYYY-MM-DD')}`)
    .then(
      bankResponse =>
        new HtmlTableToJson(bankResponse.data.match(/(<table[^>]*>(?:.|\n)*?<\/table>)/)[1]),
      err => console.log(err),
    )

const usd = () => queryBank('usd').then(r     es => cleanEnnecessaryUsd(res.results[0]))
const eur = () => queryBank('eur').then(res => cleanEnnecessaryEur(res.results[0]))
const rub = () => queryBank('rub').then(res => cleanEnnecessaryRub(res.results[0]))
const pln = () => queryBank('usd').then(res => cleanEnnecessaryPln(res.results[0]))
const gbp = () => queryBank('gbp').then(res => cleanEnnecessaryGbp(res.results[0]))

const prepareTotal = Totalobj => {
  const cFind = (arr, bank) => arr.find(obj => obj.bank_name === bank)
  const mixin = (bank, cur) => (cFind(Totalobj[cur], bank) ? cFind(Totalobj[cur], bank) : {})

  return Totalobj['usd'].map(obj => {
    Object.keys(Totalobj).forEach(key => Object.assign(obj, mixin(obj.bank_name, key)))
    return obj
  })
}

const insertBanks = async () => {
  const totalObj = await Promise.all([usd(), eur(), rub(), pln(), gbp()]).then(res => ({
    usd: res[0],
    eur: res[1],
    rub: res[2],
    pln: res[3],
    gbp: res[4],
  }))

  const bank = await prepareTotal(totalObj)
  bank[0].gbp_buy = 1.1
  // insertOrUpdate('bank', bank)

  knex('bank')
    .insert(bank)
    .then(() => console.log('data inserted'))
    .catch(err => {
      console.log(err)
      throw err
    })
    .finally(() => {
      knex.destroy()
    })

  // knex('city')
  //   .insert(cities)
  //   .then(() => console.log('data inserted'))
  //   .catch(err => {
  //     console.log(err)
  //     throw err
  //   })
  //   .finally(() => {
  //     knex.destroy()
  //   })
}
// insertBanks()
// createCity()

const getCities = async () =>
  knex('city')
    .select('*')
    .then(res => res)
    .catch(err => {
      console.log(err)
      throw err
    })
    .finally(() => {
      knex.destroy()
    })

const getBanks = async () =>
  knex('bank')
    .select('*')
    .then(res => res)
    .catch(err => {
      console.log(err)
      throw err
    })
    .finally(() => {
      knex.destroy()
    })

const insertCityBank = async () => {
  const totalObj = await Promise.all([getCities(), getBanks()]).then(res => ({
    cities: res[0],
    banks: res[1],
  }))
  mapRates(totalObj.banks, totalObj.cities)
}

// insertCity()
insertCityBank()

// knex.schema
//   .createTable('city', table => {
//     table.increments('city_id')
//     table.string('city', 70)
//     table.integer('population', 8)
//     table.integer('radius', 5)
//   })
//   .then(() => console.log('table city created'))
//   .catch(err => {
//     console.log(err)
//     throw err
//   })
//   .finally(() => {
//     knex.destroy()
//   })

// knex.schema
//   .createTable('banks', table => {
//     table.increments('bank_id')
//     table.string('bank_name',50)
//     table.enum(currency, ['usd', 'rub', 'eur', 'pln', 'gbp'])
//     table.decimal('usd_sell', 10, 2)
//     table.decimal('usd_buy', 10, 2)
//     table.decimal('rub_sell', 10, 2)
//     table.decimal('rub_buy', 10, 2)
//     table.decimal('eur_sell', 10, 2)
//     table.decimal('eur_buy', 10, 2)
//     table.decimal('pln_sell', 10, 2)
//     table.decimal('pln_buy	', 10, 2)
//     table.decimal('gbp_sell', 10, 2)
//     table.decimal('gbp_buy', 10, 2)
//     table.timestamp('updated_at')
//   })
//   .then(() => console.log('table created'))
//   .catch(err => {
//     console.log(err)
//     throw err
//   })
//   .finally(() => {
//     knex.destroy()
//   })

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


const mapRates = async (banks, cities) => {
  cities.forEach(city => {
    const test = []
    async function processArray(banks, city) {
      try {
        for (const bank of banks) {
          await delayedLog(bank, city, test)
        }
        console.log('Done!')
        console.log('test', test.length, test)
        console.log('banks', banks.length, banks)
      } catch (err) {
        console.log('err', err)
      }
    }
    processArray(banks, city)
  })
}

async function delayedLog(bank, city, test) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=bank+${urlencode(
      includesBanksVariant[bank.bank_name][0],
      'gbk',
    )}+${city.city}&location=${context.getLocation().latitude},${
      context.getLocation().longitude
    }&radius=${city.radius}&key=${process.env.GOOGLE_PLACES_API_KEY}`,
  )

  if (!validation.isEmpty(response.data.results)) {
    console.log(bank, '------------', response.data.results.map(o => o.name))
    console.log(!notIncludes(bank.Bank, await response.data.results))
    if (!notIncludes(bank.Bank, await response.data.results)) {
      test.push(bank)
    } else console.log(bank.Bank, 'empty res')
  }
}
