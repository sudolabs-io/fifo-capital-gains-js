import BigNumber from "bignumber.js";
import { Operation } from '.'
import { consolidateHistory } from './history'


export interface NetSalesOptions {
  /** Net amount to withdraw */
  netWithdrawal: BigNumber
  /** Tax applied to capital gains obtained from selling securities */
  capitalGainsTax: BigNumber
  /** Date of the selling operation(s) */
  date: Date
  /** Security prices at the time of sale. Map of security symbol to price. */
  prices: Record<string, BigNumber>
}

/**
 * Calculates sales needed to obtain a net withdrawal amount.
 * It may return more than one operation, if multiple symbols must be sold.
 * Symbols are sold in the order of their purchase operations, rather than date.
 * If you want to prioritize the sale of certain securities,
 * make sure their purchase operations appear first in the history array.
 *
 * Returns an array of operations containing the new sale(s).
 * @param history Operation history
 * @param options Options
 */
export function calculateSalesForNetWithdrawal(
  history: Operation[],
  options: NetSalesOptions
): Operation[] {
  const { netWithdrawal, capitalGainsTax, date, prices } = options

  const operations: Record<string, Operation> = {}

  const consolidatedHistory = consolidateHistory(history)

  let currentWithdrawal = BigNumber(0)
  let i = 0
  while (currentWithdrawal < netWithdrawal && i < consolidatedHistory.length) {
    const op = consolidatedHistory[i]
    if (op.type === 'BUY' && op.date < date) {
      const price = prices[op.symbol]
      const capitalGainsPerShare =
        price.minus(op.price).lt(0)
          ? price.minus(op.price)
          : price.minus(op.price).multipliedBy(BigNumber(1).minus(capitalGainsTax))
      const netGainsPerShare = capitalGainsPerShare.plus(op.price)
      const amount = BigNumber.min(
        netWithdrawal.minus(currentWithdrawal).div(netGainsPerShare),
        op.amount
      )
      currentWithdrawal = currentWithdrawal.plus(amount.multipliedBy(netGainsPerShare))
      const key = getHashKey({ symbol: op.symbol, date, type: 'SELL' })
      operations[key] = {
        type: 'SELL',
        amount: amount.plus(operations[key] ? operations[key].amount : 0),
        price,
        date,
        symbol: op.symbol,
      }
    }

    i++
  }

  return Object.keys(operations)
    .sort()
    .map((key) => operations[key])
}

function getHashKey(
  operation: Pick<Operation, 'date' | 'type' | 'symbol'>
): string {
  return `${operation.date.toUTCString()}#${operation.type}#${operation.symbol}`
}
