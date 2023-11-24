/* tslint:disable:no-magic-numbers */
import BigNumber from "bignumber.js";
import { Operation } from '..'
import { calculateFIFOCapitalGains } from '../capital-gains'


describe('calculateFIFOCapitalGains', () => {
  it('calculates FIFO capital gains with one symbol', () => {
    const operationHistory: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(10),
        date: new Date('2020-02-01'),
        price: BigNumber(150),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(15),
        date: new Date('2020-03-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'SELL',
      },
    ]

    const capitalGains = calculateFIFOCapitalGains(operationHistory)

    expect(capitalGains).toEqual([
      {
        sale: {
          amount: BigNumber(15),
          date: new Date('2020-03-01'),
          price: BigNumber(200),
          symbol: 'STK1',
          type: 'SELL',
        },
        capitalGains: BigNumber(1250),
      },
    ])
  })

  it('calculates FIFO capital gains with multiple symbols', () => {
    const operationHistory: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(10),
        date: new Date('2020-02-01'),
        price: BigNumber(150),
        symbol: 'STK2',
        type: 'BUY',
      },
      {
        amount: BigNumber(5),
        date: new Date('2020-03-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'SELL',
      },
      {
        amount: BigNumber(10),
        date: new Date('2021-01-01'),
        price: BigNumber(200),
        symbol: 'STK2',
        type: 'SELL',
      },
    ]

    const capitalGains = calculateFIFOCapitalGains(operationHistory)

    expect(capitalGains).toEqual([
      {
        sale: {
          amount: BigNumber(5),
          date: new Date('2020-03-01'),
          price: BigNumber(200),
          symbol: 'STK1',
          type: 'SELL',
        },
        capitalGains: BigNumber(500),
      },
      {
        sale: {
          amount: BigNumber(10),
          date: new Date('2021-01-01'),
          price: BigNumber(200),
          symbol: 'STK2',
          type: 'SELL',
        },
        capitalGains: BigNumber(500),
      },
    ])
  })

  it('calculates FIFO capital gains with intercalated buys and sales', () => {
    const operationHistory: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(10),
        date: new Date('2020-02-01'),
        price: BigNumber(150),
        symbol: 'STK2',
        type: 'BUY',
      },
      {
        amount: BigNumber(5),
        date: new Date('2020-03-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'SELL',
      },
      {
        amount: BigNumber(10),
        date: new Date('2020-04-01'),
        price: BigNumber(250),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(10),
        date: new Date('2021-01-01'),
        price: BigNumber(200),
        symbol: 'STK2',
        type: 'SELL',
      },
      {
        amount: BigNumber(15),
        date: new Date('2022-01-01'),
        price: BigNumber(300),
        symbol: 'STK1',
        type: 'SELL',
      },
    ]

    const capitalGains = calculateFIFOCapitalGains(operationHistory)

    expect(capitalGains).toEqual([
      {
        sale: {
          amount: BigNumber(5),
          date: new Date('2020-03-01'),
          price: BigNumber(200),
          symbol: 'STK1',
          type: 'SELL',
        },
        capitalGains: BigNumber(500),
      },
      {
        sale: {
          amount: BigNumber(10),
          date: new Date('2021-01-01'),
          price: BigNumber(200),
          symbol: 'STK2',
          type: 'SELL',
        },
        capitalGains: BigNumber(500),
      },
      {
        sale: {
          amount: BigNumber(15),
          date: new Date('2022-01-01'),
          price: BigNumber(300),
          symbol: 'STK1',
          type: 'SELL',
        },
        capitalGains: BigNumber(1500),
      },
    ])
  })

  it("throws when a symbol's sales have a bigger amount than its buys", () => {
    const operationHistory: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(15),
        date: new Date('2020-03-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'SELL',
      },
    ]

    expect(() => calculateFIFOCapitalGains(operationHistory)).toThrow()
  })

  it('throws when there are sales, but no buys', () => {
    const operationHistory: Operation[] = [
      {
        amount: BigNumber(15),
        date: new Date('2020-03-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'SELL',
      },
    ]

    expect(() => calculateFIFOCapitalGains(operationHistory)).toThrow()
  })
})
