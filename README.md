# ◈ Etsy Fee Calculator

> **Know exactly what you keep — before you list.**

A free, fast, single-file web tool that helps Etsy sellers calculate listing fees, transaction fees, payment processing costs, and real net profit — instantly, with no signup required.

🔗 **Live Demo:** (https://hexwright.github.io/etsyfeecalculator/)

---

## Screenshot

```
┌─────────────────────────────────────────────────────┐
│  ◈ EtsyCalc                          ☽ Dark  ↺ Reset│
├──────────────────────┬──────────────────────────────┤
│  Listing Details     │  ✓ Profitable listing         │
│                      │                               │
│  Product Price  $25  │  Gross Revenue   Net Profit   │
│  Shipping       $5   │  $30.00          $17.63       │
│  Product Cost   $5   │                               │
│  Ship Cost      $2   │  Profit Margin ████░░  58.8%  │
│                      │                               │
│  🇺🇸 United States   │  Fee Breakdown                │
│                      │  Listing Fee        $0.20     │
│  ⚙ Show fee rates    │  Transaction Fee    $1.95     │
│                      │  Payment Processing $1.15     │
│                      │  Total Etsy Fees    $3.30     │
└──────────────────────┴──────────────────────────────┘
```

---

## Features

- **Live calculations** — results update as you type, no button needed
- **Full fee breakdown** — listing fee, transaction fee, payment processing
- **Profit status indicator** — green (profitable), yellow (low margin), red (loss)
- **CSS bar chart** — visual revenue split with no libraries
- **Editable fee rates** — update rates instantly if Etsy changes them
- **5 currencies** — USD, GBP, CAD, AUD, EUR
- **6 seller countries** — US, UK, Canada, Australia, EU, Other
- **Dark mode** — toggle + remembers your preference
- **Mobile responsive** — works on all screen sizes
- **Zero dependencies** — no React, no Bootstrap, no npm, no build step
- **Single file** — everything in one `index.html`

---

## Fee Rates Used

| Fee | Rate |
|-----|------|
| Listing Fee | $0.20 per item |
| Transaction Fee | 6.5% of sale price + shipping |
| Payment Processing | 3% + $0.25 per transaction |

> Rates are editable inside the app via the **⚙ Show fee rates** button.

---

## Formula

```
Gross Revenue    = Product Price + Shipping Charged
Transaction Fee  = Gross Revenue × 6.5%
Payment Fee      = Gross Revenue × 3% + $0.25
Total Etsy Fees  = Listing Fee + Transaction Fee + Payment Fee
Net Profit       = Gross Revenue − Product Cost − Shipping Cost − Total Fees
Profit Margin    = (Net Profit ÷ Gross Revenue) × 100
```

---

## How to Use

1. Enter your **product price** and **shipping charged to customer**
2. Enter your **product cost** and **shipping cost to you**
3. Select your **country**
4. Results appear **instantly** — no button needed
5. Optionally click **⚙ Show fee rates** to customize the fee percentages

---

## Tech Stack

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (ES5 compatible)
- No frameworks, no libraries, no build tools

---

## Project Structure

```
etsy-fee-calculator/
└── index.html      ← entire app (HTML + CSS + JS in one file)
└── README.md       ← this file
```

---

## License

MIT — free to use, modify, and share.

---

## Disclaimer

This tool provides estimates based on standard Etsy fee rates. Always verify current rates at [etsy.com/legal/fees](https://www.etsy.com/legal/fees) before making pricing decisions.
