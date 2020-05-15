import { aggregateByYear, calculateFIFOCapitalGains, Operation } from '../index'

describe('calculateFIFOCapitalGains', () => {
  it('calculates FIFO capital gains with one symbol', () => {
    const operationHistory: Operation[] = [
      {
        amount: 10,
        date: new Date('2020-01-01'),
        price: 100,
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: 10,
        date: new Date('2020-02-01'),
        price: 150,
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: 15,
        date: new Date('2020-03-01'),
        price: 200,
        symbol: 'STK1',
        type: 'SELL',
      },
    ]

    const capitalGains = calculateFIFOCapitalGains(operationHistory)

    expect(capitalGains).toEqual([
      {
        sale: {
          amount: 15,
          date: new Date('2020-03-01'),
          price: 200,
          symbol: 'STK1',
          type: 'SELL',
        },
        capitalGains: 1250,
      },
    ])
  })

  it('calculates FIFO capital gains with multiple symbols', () => {
    const operationHistory: Operation[] = [
      {
        amount: 10,
        date: new Date('2020-01-01'),
        price: 100,
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: 10,
        date: new Date('2020-02-01'),
        price: 150,
        symbol: 'STK2',
        type: 'BUY',
      },
      {
        amount: 5,
        date: new Date('2020-03-01'),
        price: 200,
        symbol: 'STK1',
        type: 'SELL',
      },
      {
        amount: 10,
        date: new Date('2021-01-01'),
        price: 200,
        symbol: 'STK2',
        type: 'SELL',
      },
    ]

    const capitalGains = calculateFIFOCapitalGains(operationHistory)

    expect(capitalGains).toEqual([
      {
        sale: {
          amount: 5,
          date: new Date('2020-03-01'),
          price: 200,
          symbol: 'STK1',
          type: 'SELL',
        },
        capitalGains: 500,
      },
      {
        sale: {
          amount: 10,
          date: new Date('2021-01-01'),
          price: 200,
          symbol: 'STK2',
          type: 'SELL',
        },
        capitalGains: 500,
      },
    ])
  })

  it('calculates FIFO capital gains with intercalated buys and sales', () => {
    const operationHistory: Operation[] = [
      {
        amount: 10,
        date: new Date('2020-01-01'),
        price: 100,
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: 10,
        date: new Date('2020-02-01'),
        price: 150,
        symbol: 'STK2',
        type: 'BUY',
      },
      {
        amount: 5,
        date: new Date('2020-03-01'),
        price: 200,
        symbol: 'STK1',
        type: 'SELL',
      },
      {
        amount: 10,
        date: new Date('2020-04-01'),
        price: 250,
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: 10,
        date: new Date('2021-01-01'),
        price: 200,
        symbol: 'STK2',
        type: 'SELL',
      },
      {
        amount: 15,
        date: new Date('2022-01-01'),
        price: 300,
        symbol: 'STK1',
        type: 'SELL',
      },
    ]

    const capitalGains = calculateFIFOCapitalGains(operationHistory)

    expect(capitalGains).toEqual([
      {
        sale: {
          amount: 5,
          date: new Date('2020-03-01'),
          price: 200,
          symbol: 'STK1',
          type: 'SELL',
        },
        capitalGains: 500,
      },
      {
        sale: {
          amount: 10,
          date: new Date('2021-01-01'),
          price: 200,
          symbol: 'STK2',
          type: 'SELL',
        },
        capitalGains: 500,
      },
      {
        sale: {
          amount: 15,
          date: new Date('2022-01-01'),
          price: 300,
          symbol: 'STK1',
          type: 'SELL',
        },
        capitalGains: 1500,
      },
    ])
  })

  it("throws when a symbol's sales have a bigger amount than its buys", () => {
    const operationHistory: Operation[] = [
      {
        amount: 10,
        date: new Date('2020-01-01'),
        price: 100,
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: 15,
        date: new Date('2020-03-01'),
        price: 200,
        symbol: 'STK1',
        type: 'SELL',
      },
    ]

    expect(() => calculateFIFOCapitalGains(operationHistory)).toThrow()
  })

  it('throws when there are sales, but no buys', () => {
    const operationHistory: Operation[] = [
      {
        amount: 15,
        date: new Date('2020-03-01'),
        price: 200,
        symbol: 'STK1',
        type: 'SELL',
      },
    ]

    expect(() => calculateFIFOCapitalGains(operationHistory)).toThrow()
  })
})

describe('aggregateByYear calculates the aggregation correctly', () => {
  it('when there is only one operation', () => {
    expect(
      aggregateByYear([
        {
          sale: {
            amount: 1,
            date: new Date('2020-03-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 1250,
        },
      ])
    ).toEqual({
      2020: 1250,
    })
  })

  it('when operations span over multiple years', () => {
    expect(
      aggregateByYear([
        {
          sale: {
            amount: 1,
            date: new Date('2020-03-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 500,
        },
        {
          sale: {
            amount: 1,
            date: new Date('2021-01-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 500,
        },
        {
          sale: {
            amount: 1,
            date: new Date('2022-06-07'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 300,
        },
      ])
    ).toEqual({
      2020: 500,
      2021: 500,
      2022: 300,
    })
  })

  it('when there are multiple operations in one year', () => {
    expect(
      aggregateByYear([
        {
          sale: {
            amount: 1,
            date: new Date('2020-03-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 500,
        },
        {
          sale: {
            amount: 1,
            date: new Date('2021-01-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 500,
        },
        {
          sale: {
            amount: 1,
            date: new Date('2021-04-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 700,
        },
        {
          sale: {
            amount: 1,
            date: new Date('2022-06-07'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 300,
        },
      ])
    ).toEqual({
      2020: 500,
      2021: 1200,
      2022: 300,
    })
  })

  it('when operations have negative capital gains', () => {
    expect(
      aggregateByYear([
        {
          sale: {
            amount: 1,
            date: new Date('2020-03-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: -500,
        },
        {
          sale: {
            amount: 1,
            date: new Date('2020-06-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 300,
        },
        {
          sale: {
            amount: 1,
            date: new Date('2021-01-01'),
            price: 2000,
            symbol: 'STK1',
            type: 'SELL',
          },
          capitalGains: 500,
        },
      ])
    ).toEqual({
      2020: -200,
      2021: 500,
    })
  })
})
