import BigNumber from "bignumber.js";

export interface Operation {
  /**
   * Symbol that identifies the underlying security. It is used only for differentation between
   * operations of different securities. Can be the stock ticker or any other identifier that
   * is different from other securities'.
   */
  symbol: string

  /**
   * Date when the operation took place
   */
  date: Date

  /**
   * Price of the security when the operation took place.
   * If it is a buy operation, this is the buying price; if a sell operation,
   * then this is the selling price.
   */
  price: BigNumber

  /**
   * Number of units transacted.
   */
  amount: BigNumber

  /**
   * Type of the operation
   */
  type: 'BUY' | 'SELL'
}
