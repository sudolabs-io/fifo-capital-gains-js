/* tslint:disable:no-magic-numbers */
import BigNumber from "bignumber.js";
import { Operation } from '..'
import { calculateSalesForNetWithdrawal, NetSalesOptions } from '../net-sales'


describe('calculateSalesForNetWithdrawal', () => {
  it('calculates sale correctly when there are only purchases in the history', () => {
    const history: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(10),
        date: new Date('2021-01-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'BUY',
      },
    ]

    const options: NetSalesOptions = {
      netWithdrawal: BigNumber(4000),
      capitalGainsTax: BigNumber(0.5),
      date: new Date('2022-01-01'),
      prices: { STK1: BigNumber(300) },
    }

    expect(calculateSalesForNetWithdrawal(history, options)).toEqual([
      {
        amount: BigNumber(18),
        date: new Date('2022-01-01'),
        price: BigNumber(300),
        symbol: 'STK1',
        type: 'SELL',
      },
    ])
  })

  it('calculates sale correctly when there are purchases and sales in the history', () => {
    const history: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(5),
        date: new Date('2020-06-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'SELL',
      },
      {
        amount: BigNumber(10),
        date: new Date('2021-01-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'BUY',
      },
    ]

    const options: NetSalesOptions = {
      netWithdrawal: BigNumber(3000),
      capitalGainsTax: BigNumber(0.5),
      date: new Date('2022-01-01'),
      prices: { STK1: BigNumber(300) },
    }

    expect(calculateSalesForNetWithdrawal(history, options)).toEqual([
      {
        amount: BigNumber(13),
        date: new Date('2022-01-01'),
        price: BigNumber(300),
        symbol: 'STK1',
        type: 'SELL',
      },
    ])
  })

  it('calculates sale correctly when there are not enough buys', () => {
    const history: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
    ]

    const options: NetSalesOptions = {
      netWithdrawal: BigNumber(2000),
      capitalGainsTax: BigNumber(0.5),
      date: new Date('2020-03-01'),
      prices: { STK1: BigNumber(200) },
    }

    expect(calculateSalesForNetWithdrawal(history, options)).toEqual([
      {
        amount: BigNumber(10),
        date: new Date('2020-03-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'SELL',
      },
    ])
  })

  it('does not apply capital gains tax when there are negative capital gains', () => {
    const history: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
    ]

    const options: NetSalesOptions = {
      netWithdrawal: BigNumber(400),
      capitalGainsTax: BigNumber(0.5),
      date: new Date('2020-03-01'),
      prices: { STK1: BigNumber(50) },
    }

    expect(calculateSalesForNetWithdrawal(history, options)).toEqual([
      {
        amount: BigNumber(8),
        date: new Date('2020-03-01'),
        price: BigNumber(50),
        symbol: 'STK1',
        type: 'SELL',
      },
    ])
  })

  it('calculates sales correctly when multiple symbols exist', () => {
    const history: Operation[] = [
      {
        amount: BigNumber(10),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(10),
        date: new Date('2021-01-01'),
        price: BigNumber(200),
        symbol: 'STK2',
        type: 'BUY',
      },
      {
        amount: BigNumber(10),
        date: new Date('2021-01-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'BUY',
      },
    ]

    const options: NetSalesOptions = {
      netWithdrawal: BigNumber(4000),
      capitalGainsTax: BigNumber(0.5),
      date: new Date('2022-01-01'),
      prices: { STK1: BigNumber(300), STK2: BigNumber(600) },
    }

    expect(calculateSalesForNetWithdrawal(history, options)).toEqual([
      {
        amount: BigNumber(10),
        date: new Date('2022-01-01'),
        price: BigNumber(300),
        symbol: 'STK1',
        type: 'SELL',
      },
      {
        amount: BigNumber(5),
        date: new Date('2022-01-01'),
        price: BigNumber(600),
        symbol: 'STK2',
        type: 'SELL',
      },
    ])
  })

  it('ignores purchases that are more recent than the sale date', () => {
    const history: Operation[] = [
      {
        amount: BigNumber(5),
        date: new Date('2020-01-01'),
        price: BigNumber(100),
        symbol: 'STK1',
        type: 'BUY',
      },
      {
        amount: BigNumber(10),
        date: new Date('2021-01-01'),
        price: BigNumber(200),
        symbol: 'STK1',
        type: 'BUY',
      },
    ]

    const options: NetSalesOptions = {
      netWithdrawal: BigNumber(3000),
      capitalGainsTax: BigNumber(0.5),
      date: new Date('2020-03-01'),
      prices: { STK1: BigNumber(300) },
    }

    expect(calculateSalesForNetWithdrawal(history, options)).toEqual([
      {
        amount: BigNumber(5),
        date: new Date('2020-03-01'),
        price: BigNumber(300),
        symbol: 'STK1',
        type: 'SELL',
      },
    ])
  })
})
