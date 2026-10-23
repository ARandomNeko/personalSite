---
title: 'Polymarket Bot'
date: '2026-02-07'
tags: ['project']
description: 'A Rust prediction-market bot with SQLite paper trades and a separate WebSocket streamer.'
published: true
---

I built a Rust bot for short-duration BTC prediction markets. It polls prices, tracks positions, and records paper trades in SQLite.

## The trading loop

Each cycle fetches the current market’s YES and NO prices, checks open positions for exits, then considers new entries. Successful cycles run sixty seconds apart; errors are logged and retried after thirty seconds.

The entry rule selects a side priced above 0.50 and below 0.80. The code calls this “momentum,” but it uses a single price snapshot. It does not measure a trend.

An exit is triggered when the configured return target is reached or a position has been held for fifteen minutes. Both conditions are checked during polling, so an exit can happen after the time limit.

## Records and loose ends

Paper mode records the market, side, amount, price, and timestamp in SQLite. A statistics command summarizes those records. A separate WebSocket executable handles price, trade, and order-book messages; it does not drive the trading loop.

Positions are keyed by market and side. Entering the same pair again can overwrite the existing position in memory. That needs fixing before the position count can serve as an exposure limit.

Balance accounting and fill confirmation also need work. The code has a live-order path, but this remains a prototype. The next step is to reconcile positions, trades, and balances throughout a paper run.
