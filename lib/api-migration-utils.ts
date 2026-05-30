/**
 * API Migration Utilities
 * Provides backward compatibility mapping for Deriv Legacy API to New API migration
 */

export interface ActiveSymbolLegacy {
  symbol: string
  display_name: string
  market: string
  market_display_name: string
  pip: number
  [key: string]: any
}

export interface ActiveSymbolNew {
  underlying_symbol: string
  underlying_symbol_name: string
  market: string
  underlying_symbol_type: string
  pip_size: number
  exchange_is_open: number
  is_trading_suspended: number
  [key: string]: any
}

/**
 * Converts Legacy active_symbols response to new format
 * Used for mapping old API responses to new interface
 */
export function mapActiveSymbolLegacyToNew(symbol: any): ActiveSymbolNew {
  return {
    underlying_symbol: symbol.underlying_symbol || symbol.symbol,
    underlying_symbol_name: symbol.underlying_symbol_name || symbol.display_name,
    market: symbol.market,
    underlying_symbol_type: symbol.underlying_symbol_type || symbol.symbol_type,
    pip_size: symbol.pip_size ?? symbol.pip,
    exchange_is_open: symbol.exchange_is_open ?? 1,
    is_trading_suspended: symbol.is_trading_suspended ?? 0,
  }
}

/**
 * Gets symbol identifier from either legacy or new format
 */
export function getSymbolId(symbol: any): string {
  return symbol.underlying_symbol || symbol.symbol || ""
}

/**
 * Gets symbol display name from either legacy or new format
 */
export function getSymbolName(symbol: any): string {
  return symbol.underlying_symbol_name || symbol.display_name || getSymbolId(symbol)
}

/**
 * Gets market display name from either legacy or new format
 */
export function getMarketName(symbol: any): string {
  return symbol.market_display_name || symbol.market || "Unknown"
}

/**
 * Gets pip size from either legacy or new format
 */
export function getPipSize(symbol: any): number {
  return symbol.pip_size ?? symbol.pip ?? 0.0001
}

/**
 * Validates tick data and handles optional fields
 * New API always includes tick, quote, epoch, symbol
 * pip_size is optional
 */
export function validateTickData(tick: any): {
  quote: number
  epoch: number
  symbol: string
  ask?: number
  bid?: number
  pipSize?: number
} {
  if (!tick) {
    throw new Error("Tick data is required")
  }

  if (!tick.quote || !tick.epoch || !tick.symbol) {
    throw new Error("Required tick fields missing: quote, epoch, symbol")
  }

  return {
    quote: tick.quote,
    epoch: tick.epoch,
    symbol: tick.symbol,
    ask: tick.ask,
    bid: tick.bid,
    pipSize: tick.pip_size,
  }
}

/**
 * Handles tick history response with guaranteed prices/times
 * New API guarantees these fields exist when history object is present
 */
export function validateTickHistory(history: any): {
  prices: number[]
  times: number[]
} {
  if (!history) {
    throw new Error("History object is required")
  }

  if (!Array.isArray(history.prices) || !Array.isArray(history.times)) {
    throw new Error("History must contain prices and times arrays")
  }

  if (history.prices.length !== history.times.length) {
    console.warn("[v0] Warning: prices and times array lengths do not match")
  }

  return {
    prices: history.prices,
    times: history.times,
  }
}

/**
 * Maps contract type response from new API
 * Removes fields that no longer exist
 */
export function mapContractType(contract: any): any {
  return {
    contract_type: contract.contract_type,
    contract_category: contract.contract_category,
    barriers: contract.barriers,
    exchange_name: contract.exchange_name,
    expiry_type: contract.expiry_type,
    market: contract.market,
    sentiment: contract.sentiment,
    submarket: contract.submarket,
    underlying_symbol: contract.underlying_symbol,
    // Note: contract_display, contract_category_display, barrier_category no longer available
  }
}

/**
 * Creates a proposal request with new API format
 * Removes currency parameter (determined by account)
 */
export function formatProposalRequest(params: any): any {
  const formatted: any = {
    proposal: 1,
    underlying_symbol: params.underlying_symbol || params.symbol,
    contract_type: params.contract_type,
    amount: params.amount,
    basis: params.basis || "stake",
    duration: params.duration,
    duration_unit: params.duration_unit,
  }

  // Remove legacy parameters not supported in new API
  delete formatted.currency
  delete formatted.landing_company
  delete formatted.landing_company_short
  delete formatted.product_type
  delete formatted.loginid

  // Add optional barrier if provided
  if (params.barrier !== undefined) {
    formatted.barrier = params.barrier
  }

  return formatted
}

/**
 * Checks if API response has new format
 */
export function isNewAPIResponse(response: any): boolean {
  // Check for new field names
  if (response.active_symbols?.[0]?.underlying_symbol !== undefined) {
    return true
  }
  if (response.contracts_for?.available?.[0]?.underlying_symbol !== undefined) {
    return true
  }
  if (response.tick?.epoch !== undefined && response.tick?.quote !== undefined) {
    return true
  }
  return false
}

/**
 * Logs API changes for debugging
 */
export function logAPIChange(endpoint: string, oldFormat: any, newFormat: any): void {
  console.log(`[v0] API Migration: ${endpoint}`, {
    old: oldFormat,
    new: newFormat,
  })
}
