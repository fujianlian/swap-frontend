import { Currency, ETHER, Token } from '@alayanetwork/uniswap-sdk'

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'ATP'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
