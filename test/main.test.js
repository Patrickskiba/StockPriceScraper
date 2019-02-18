const nock = require('nock')

const mockResponse = [
  {
    date: '20181217',
    minute: '09:30',
    label: '09:30 AM',
    high: 166.4,
    low: 165.35,
    average: 165.948,
    volume: 7477,
    notional: 1240790.71,
    numberOfTrades: 70,
    marketHigh: 166.42,
    marketLow: 165.31,
    marketAverage: 165.551,
    marketVolume: 1067295,
    marketNotional: 176691826.7991,
    marketNumberOfTrades: 2636,
    open: 165.51,
    close: 166.4,
    marketOpen: 165.45,
    marketClose: 165.42,
    changeOverTime: 0,
    marketChangeOverTime: 0,
  },
  {
    date: '20181217',
    minute: '09:31',
    label: '09:31 AM',
    high: 166.45,
    low: 165.96,
    average: 166.203,
    volume: 12160,
    notional: 2021033.4,
    numberOfTrades: 87,
    marketHigh: 166.47,
    marketLow: 165.42,
    marketAverage: 166.152,
    marketVolume: 205933,
    marketNotional: 34216208.113,
    marketNumberOfTrades: 1539,
    open: 166.395,
    close: 166.07,
    marketOpen: 166.39,
    marketClose: 166.118,
    changeOverTime: 0.0015366259310145073,
    marketChangeOverTime: 0.0036303012364769715,
  },
]


const generateHappyMockAPI = () => {
  nock('https://api.iextrading.com/1.0/stock/ATVI').get('/chart/1d?chartInterval=30').reply(200, mockResponse)
  nock('https://api.iextrading.com/1.0/stock/ADBE').get('/chart/1d?chartInterval=30').reply(200, mockResponse)
  nock('https://api.iextrading.com/1.0/stock/AMD').get('/chart/1d?chartInterval=30').reply(200, mockResponse)
  nock('https://api.iextrading.com/1.0/stock/AAPL').get('/chart/1d?chartInterval=30').reply(200, mockResponse)
}

jest.mock('standardandpoorjs', () => {
  return {
    FetchWikiPage: () => new Promise(resolve =>
      resolve([
        {
          Symbol: 'ATVI',
          Name: 'Activision Blizzard',
          Sector: 'Communication Services',
        },
        {
          Symbol: 'ADBE',
          Name: 'Adobe Systems Inc',
          Sector: 'Information Technology',
        },
        {
          Symbol: 'AMD',
          Name: 'Advanced Micro Devices Inc',
          Sector: 'Information Technology',
        },
        {
          Symbol: 'AAPL',
          Name: 'Apple Inc.',
          Sector: 'Information Technology',
        },
      ])
    )
  }
})

jest.mock('fs', () => ({
  createWriteStream: jest.fn().mockReturnValue({
    write: jest.fn(),
    end: jest.fn()
  })
}))


describe('get stock data', async () => {
  it('writes 4 entries of stock price data to the file system given a list of 4 stocks with proper open/close tags and commas', async () => {
    generateHappyMockAPI()
    const mockFs = require('fs')

    const { RecordStockData } = require('../src/main')
    await RecordStockData()

    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[0][0]).toEqual('[')
    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[1][0]).toEqual(JSON.stringify(mockResponse))
    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[2][0]).toEqual(',')
    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[3][0]).toEqual(JSON.stringify(mockResponse))
    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[4][0]).toEqual(',')
    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[5][0]).toEqual(JSON.stringify(mockResponse))
    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[6][0]).toEqual(',')
    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[7][0]).toEqual(JSON.stringify(mockResponse))
    expect(mockFs.createWriteStream.mock.results[0].value.write.mock.calls[8][0]).toEqual(']')
  })

  it('creates a file with the correct date as the title', async () => {
    global.Date.now = jest.fn(() => 1487076708000)
    generateHappyMockAPI()
    const mockFs = require('fs')

    const { RecordStockData } = require('../src/main')
    await RecordStockData()

    expect(mockFs.createWriteStream).toHaveBeenCalledWith('2-1-2017')
  })

})