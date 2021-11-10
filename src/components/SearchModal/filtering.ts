// import { isAddress } from '../../utils'
import { isBech32Address } from '@alayanetwork/web3-utils'
import { ChainId, Token } from '@alayanetwork/uniswap-sdk'

export function filterTokens(tokens: Token[], search: string): Token[] {
  if (search.length === 0) return tokens

  const chainId: ChainId = parseInt(process.env.REACT_APP_CHAIN_ID ?? '201018')
  const hrp = chainId.toString() === '201030' ? 'atp' : 'atx'
  const searchingAddress = isBech32Address(search) && search.startsWith(hrp) ? search : false

  if (searchingAddress) {
    return tokens.filter(token => token.address === searchingAddress)
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter(s => s.length > 0)

  if (lowerSearchParts.length === 0) {
    return tokens
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)

    return lowerSearchParts.every(p => p.length === 0 || sParts.some(sp => sp.startsWith(p) || sp.endsWith(p)))
  }

  return tokens.filter(token => {
    const { symbol, name } = token

    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name))
  })
}
