#### Supertrend + Stoch RSI

This is a combination of the [supertrend](https://www.tradingview.com/script/r6dAP7yi/) and Stoch RSI Indicators

**Supertrend Parameters:** `<br>`
Indicator time frame: 1 minute `<br>`
ATR Period: 27 `<br>`
Source: hl2 `<br>`
ATR Multiplier: 3.9 `<br>`
Script/Formula: https://www.tradingview.com/script/r6dAP7yi/ `<br>`

**Stoch RSI Parameters** `<br>`
Indicator time frame: 1 minute `<br>`
K (Blue Line): 5 `<br>`
D (Red Line): 5 `<br>`
RSI Length: 14 `<br>`
Stochastic Length: 14 `<br>`
RSI Source: close `<br>`
Script/Formula: https://www.tradingview.com/scripts/stochasticrsi/?script_access=all&solution=43000502333/ `<br>`

**Settings & Configuration On Trading View**

1. Load the indicator on trading view

   [Link to the indicator](https://www.tradingview.com/script/W18Jw6ra-Supertrend-Stoch-RSI/)

2. Ensure you are on 1 minute candle
3. Ensure you are on HA candle type
4. Setup an Alert pressing (ALT + A ) on you keyboard
5. On the alert dialog box on the condition input field select Supertrend + Stoch RSI
6. Below that select SuperTrend Buy to set a long signal
7. Under Options: select , once per bar close.
8. Under Alert Actions select: Webhook URL, (Note you can select/check other options if you want to receive alerts in those options)
9. On the webhook url paste the backend url(link to the backend server) below

   http://147.182.230.59/cryptometer/api/v1/orders/new

10. On the Alert Name: Give it an appropriate title like: Symbol Name LONG e.g BTCUSDT LONG ALERT
11. on message field, find token key. update token key value to your token which was send to you.

    NOTES On the Token.

    Token is an important field which is unique and is used to indentify users and their associated accounts.

    It also ensures that orders get placed to the authorized users account. You can't place an order without the token.
