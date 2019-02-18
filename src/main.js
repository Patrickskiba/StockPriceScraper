const { FetchWikiPage } = require('standardandpoorjs')
const fs = require('fs')
const https = require('https')

const url = stock => `https://api.iextrading.com/1.0/stock/${stock.Symbol}/chart/1d?chartInterval=30` 

const date = () => {
  const now = Date.now()
  const d = new Date(now)
  return `${d.getDay()}-${d.getMonth()}-${d.getFullYear()}`
}

const fetchData = stock => new Promise((resolve, reject) => { 
  https.get(url(stock), response => {
    let data = ''
    response.on('data', chunk => (data += chunk))
    response.on('error', error => reject(error))
    response.on('end', () => resolve(data))
  })
})

const writeDataToFile = async (stocks, stream) => {
  return Promise.all(
    stocks.map(async (stock, index, arr) => {
      stream.write(await fetchData(stock))
      if (index !== arr.length - 1) {
        stream.write(',')
      }
    })
  )
}

const RecordStockData = async () => {
  const writeStream = fs.createWriteStream(date())
  writeStream.write('[')
  const stocks = await FetchWikiPage()
  await writeDataToFile(stocks, writeStream)
  writeStream.write(']')
  writeStream.end()
}

module.exports = { RecordStockData }