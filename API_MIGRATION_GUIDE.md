# Deriv API Migration Guide - Legacy to New API

## Overview
This document outlines the systematic migration from Deriv Legacy API to the New API (v4).

## Breaking Changes Summary

### 1. Active Symbols Endpoint
**Legacy Field Names → New Field Names:**
- `symbol` → `underlying_symbol`
- `display_name` → `underlying_symbol_name`
- `symbol_type` → `underlying_symbol_type`
- `pip` → `pip_size`

**Removed Parameters:**
- `product_type`
- `landing_company_short`

**Removed Response Fields:**
- `spot`, `spot_age`, `spot_percentage_change`, `spot_time`
- `market_display_name`, `subgroup_display_name`, `submarket_display_name`
- `allow_forward_starting`, `close_only`, `display_order`, `exchange_name`, `delay_amount`

### 2. Contracts For Endpoint
**Legacy Request Parameters → Changes:**
- `currency` → **REMOVED** (currency determined by account)
- `landing_company`, `landing_company_short`, `product_type`, `loginid` → **REMOVED**

**Removed Response Fields:**
- `contract_display` (e.g., "Higher", "Lower")
- `contract_category_display` (e.g., "Up/Down")
- `barrier_category`, `start_type`
- `spot`, `open`, `close`, `feed_license`

### 3. Ticks Endpoint
**Changes:**
- `subscribe` parameter now accepts `0` (single tick) or `1` (continuous stream)
- `tick` object is now **REQUIRED** in response
- Required fields in tick: `epoch`, `quote`, `symbol`
- `pip_size` is now **OPTIONAL**
- `echo_req` is now **OPTIONAL**

### 4. Ticks History Endpoint
**Changes:**
- `subscribe` and `adjust_start_time` now accept `0` or `1`
- `granularity` no longer has enum restrictions (any integer accepted)
- `echo_req` is now **OPTIONAL**
- `prices` and `times` are now **REQUIRED** when history object exists

## Migration Checklist

- [ ] Update TypeScript interfaces in `/lib/deriv-api.ts`
- [ ] Update API request methods to remove old parameters
- [ ] Update field name mappings in components using symbols
- [ ] Update tick handling to check for required fields
- [ ] Update error handling for optional fields
- [ ] Test all endpoints in development environment
- [ ] Update documentation strings
- [ ] Deploy and monitor

## Files Requiring Updates

### Core API Files
- `/lib/deriv-api.ts` - Update interfaces and methods
- `/lib/deriv-websocket-manager.ts` - Check WebSocket handling
- `/lib/tick-history-manager.ts` - Update tick history logic

### Component Files Affected
- `/components/market-selector.tsx` - Symbol display
- `/components/price-display.tsx` - Tick data handling
- `/components/tabs/trading-tab.tsx` - Trading logic
- `/hooks/use-deriv.ts` - Deriv hook logic

## Field Mapping Reference

### ActiveSymbol Interface Migration
```typescript
// LEGACY
{
  symbol: "frxEURUSD",
  display_name: "EUR/USD",
  market: "forex",
  market_display_name: "Forex",
  pip: 0.0001
}

// NEW
{
  underlying_symbol: "frxEURUSD",
  underlying_symbol_name: "EUR/USD",
  market: "forex",
  underlying_symbol_type: "forex",
  pip_size: 0.0001,
  exchange_is_open: 1,
  is_trading_suspended: 0,
  subgroup: "major_pairs",
  submarket: "major_pairs",
  trade_count: 0
}
```

### TickData Interface Migration
```typescript
// LEGACY
{
  symbol: "frxEURUSD",
  quote: 1.08500,
  epoch: 1234567890
}

// NEW (required fields)
{
  symbol: "frxEURUSD",
  quote: 1.08500,
  epoch: 1234567890,
  ask: 1.08501,
  bid: 1.08499,
  pip_size?: 5 // optional
}
```

## Testing Recommendations

1. **Unit Tests**: Update field name assertions
2. **Integration Tests**: Verify API responses match new structure
3. **E2E Tests**: Test complete trading workflows
4. **Performance**: Monitor for any performance changes
5. **Error Handling**: Test edge cases with optional fields

## Rollback Plan

If issues arise:
1. Keep legacy API endpoint available temporarily
2. Add feature flag to switch between APIs
3. Monitor error rates closely after deployment
4. Have rollback procedure ready

## Timeline

- Phase 1: Core API updates (deriv-api.ts, interfaces)
- Phase 2: Component updates (field name usage)
- Phase 3: Testing and validation
- Phase 4: Deployment and monitoring
