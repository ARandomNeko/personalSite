---
title: 'Polymarket Bot'
date: '2026-02-07'
tags: ['project']
description: 'A Rust trading-bot prototype with a polling loop, paper-trade records, and a separate market-data streamer.'
published: true
---

My Polymarket bot is a Rust project built around a short holding window for BTC prediction-market positions. The code brings together an API client, a small entry-and-exit strategy, position tracking, and a paper-trading mode backed by SQLite.

The most useful way to describe it is as a prototype for the machinery around an automated strategy. A rule that says when to buy is only one piece; the program also needs to remember what it holds, decide when to close it, and leave a record of what happened.

## Following a trading cycle

The main loop resolves a market, requests its current YES and NO prices, checks existing positions for exits, and then considers new entries. After a successful cycle it waits sixty seconds. If a cycle returns an error, it logs the error and waits thirty seconds before trying again.

The entry rule is deliberately small: it selects a side whose quoted price is above 0.50 and below 0.80. The code calls this a momentum strategy, but that label needs some care. The rule reads a price snapshot; it doesn't calculate a trend from a history of BTC prices.

For an open position, the exit rule checks the percentage change from the entry price and the elapsed holding time. It signals an exit when the configured target is reached or fifteen minutes have passed. Since those checks happen during polling, the time limit is evaluated at each cycle rather than enforced by a separate timer.

Those are rules the program attempts to follow. A configured profit target is an input to that logic, not a measured return.

## Making a run inspectable

Paper mode follows the same strategy path but records simulated trades instead of submitting orders. The database stores fields such as the market, side, amount, price, and timestamp. A statistics command reads the stored history and summarizes it.

That gives the project an inspection layer: a run can leave more than terminal output behind. It also creates another part of the system to check. Recorded balances and profit calculations need to agree with the trade quantities and cash movements before the statistics can support conclusions about a strategy.

The repository also contains a separate WebSocket data-streamer executable. It has handlers for price, trade, and order-book messages. That experiment is separate from the bot's polling loop; the trading decisions in this version are not driven by the stream.

## Where the prototype ends

The source includes a live-order path, but its presence alone doesn't demonstrate reliable live execution or profitable trading. The implementation still leaves questions around repeated entries, balance accounting, and the distinction between submitting an order and confirming a fill.

For example, positions are keyed by market and side. Reusing that key for another entry can replace the previous position in memory. That is a concrete reason to examine the position lifecycle before treating a limit on the map's size as a reliable exposure limit.

This project puts several concerns in the same small codebase: external data, decision rules, execution, and persistent records. The next meaningful improvement would be to make those records reconcile with the position state throughout a run, then evaluate the strategy against clearly stated simulation assumptions.
