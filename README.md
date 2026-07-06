# WellCraftHub Store

A standalone e-commerce site for WellCraftHub's digital wellness products,
with Stripe Checkout for payments. This runs alongside the existing Etsy
shop as an additional, independent sales channel.

This README is written for Adir (no coding background assumed). It explains
what was built, what you need to do to launch it, and how it is set up so
future features (AI check-ins, subscriptions) can be added without rebuilding
anything.

## What this actually is, in plain terms

- A set of plain HTML pages (home, 4 product pages, a confirmation page, a
  refund policy, and a contact page). No app framework, so it loads fast and
  is easy to read and edit even by hand.
- Two small pieces of backend code ("serverless functions") that run on
  Netlify. They talk to Stripe so your secret Stripe key is never exposed to
  a customer's browser:
  - `create-checkout-session` starts a Stripe Checkout when someone clicks
    "Buy Now".
  - `verify-session` double-checks with Stripe that a payment really went
    through before showing someone their download link or workbook access.
- Stripe Checkout itself, Stripe's own hosted payment page, handles taking
  card details. This site never touches raw card numbers.

## What you need before launching

1. A Stripe account (https://dashboard.stripe.com). Free to create, Stripe
   only takes a percentage of what you actually sell.
2. A Netlify account (https://netlify.com), connected to this GitHub repo.
   You already use Netlify for the 90-Day Blueprint Workbook, so this fits
   into what you have.
3. The real product files (the Wellness Bundle contents, the two planner
   PDFs) to upload into the `downloads/` folder. See `downloads/README.md`.

## One-time setup

### 1. Create the 4 Prices in Stripe

In the Stripe Dashboard, go to **Product catalog > Add product**, and
create one product per row below (Stripe calls the "$X" part a "Price"):

| Product | Price |
|---|---|
| Thrive After 40 Wellness Bundle | $47.00, one time |
| Longevity Weekly Planner | $4.99, one time |
| Thrive After 40, Weekly Wellness Planner | $12.99, one time |
| The 90-Day Blueprint Workbook | $16.00, one time |

After creating each one, open it and copy its **Price ID** (it looks like
`price_1AbCdEfGhIjKlMnO`). You will need all 4 in the next step.

Do this once in **Test mode** first (toggle in the top right of the Stripe
Dashboard) so you can try the whole flow with fake card numbers, then repeat
in **Live mode** when you are ready to accept real payments.

### 2. Set your environment variables in Netlify

In your Netlify site, go to **Site configuration > Environment variables**
and add:

- `STRIPE_SECRET_KEY` — from **Developers > API keys** in Stripe. Use the
  Secret key (starts with `sk_test_...` while testing, `sk_live_...` once live).
- `STRIPE_PRICE_WELLNESS_BUNDLE` — the Price ID for the Wellness Bundle
- `STRIPE_PRICE_LONGEVITY_PLANNER` — the Price ID for the Longevity Planner
- `STRIPE_PRICE_THRIVE_WEEKLY_PLANNER` — the Price ID for the Weekly Wellness Planner
- `STRIPE_PRICE_BLUEPRINT_WORKBOOK` — the Price ID for the 90-Day Blueprint Workbook

(`.env.example` in this repo lists these too, as a reference, but real
values only ever go into Netlify's environment variables, never into a
file that gets committed to GitHub.)

### 3. Add your real download files

Put your actual product files into the `downloads/` folder using the exact
file names listed in `downloads/README.md`, then commit and push. Once
Netlify redeploys, the confirmation page's download buttons will work.

### 4. Deploy

If this repo is already connected to a Netlify site, pushing to the main
branch triggers a deploy automatically. Netlify will detect `netlify.toml`
and know to run the two functions in `netlify/functions/`.

### 5. Test it end to end, in Stripe test mode

With test-mode keys set, go through a real purchase using one of
[Stripe's test cards](https://stripe.com/docs/testing), for example
`4242 4242 4242 4242`, any future expiry date, any 3-digit CVC. Confirm you
land on the confirmation page and see the right download link or workbook
link. Then switch the environment variables to your live keys and Price IDs
when you are ready to sell for real.

## How a purchase actually flows

1. Customer lands on a product page and clicks **Buy Now**.
2. The browser asks the `create-checkout-session` function to start a
   checkout for that product. The function looks up the real price from
   Stripe (never trusting anything from the browser) and returns a link to
   Stripe's hosted checkout page.
3. Customer pays on Stripe's own page. Card details never touch this site.
4. Stripe redirects back to `success.html` with a session ID in the URL.
5. `success.html` calls the `verify-session` function, which asks Stripe
   directly "did this session actually get paid?" before showing anything.
   This is what stops someone from just typing in the confirmation page URL
   without paying.
6. The confirmation page shows either a download button (Wellness Bundle,
   both planners) or the workbook link plus the iPhone Safari setup steps
   (90-Day Blueprint Workbook).

There is no database and no order list yet. Every order lives in your
Stripe Dashboard (**Payments**), which is the source of truth for what sold
and to whom.

## Delivery approach (why there's no fulfillment email yet)

The brief allowed for "a confirmation page and/or an email." This build
uses the confirmation page approach, because sending an email requires
adding a separate email-sending service (like Resend or SendGrid) with its
own API key, which is one more account and one more thing that can break.
Stripe already emails the customer a payment receipt automatically. If you
later want a nicer branded delivery email too, that is a small addition to
the `verify-session` function (or a Stripe webhook) once you have picked an
email provider, and does not require touching anything else in this site.

## Adding a 5th product later

The site was built so this does not require a redesign:

1. Add an entry to `shared/products.js` with the new product's name, price,
   Stripe price env var name, and delivery type.
2. Copy an existing file in `products/` to `products/<new-slug>.html` and
   edit the text.
3. Add its Price ID to Netlify's environment variables under the name you
   picked in step 1.
4. Deploy. It will automatically appear in the home page's product grid,
   since that grid is generated from `shared/products.js`.

## Architecture notes for the Phase 2 roadmap (AI check-ins, subscriptions)

These choices were made specifically so Phase 2 is an addition, not a
rebuild:

- **Stripe Checkout, not a custom payment form.** The same
  `create-checkout-session` function already branches on a `mode` field
  (`"payment"` vs `"subscription"`). Adding the future AI check-in
  subscription product means adding one more entry to `shared/products.js`
  with `mode: 'subscription'` and a recurring Stripe Price ID. No new
  payment integration needed.
- **`customer_creation: 'always'`** is set on one-time purchases today, so
  every guest buyer already exists as a Stripe Customer, not just future
  subscribers. That means when you add accounts later, there is no gap
  where old guest purchases are invisible to the new system.
- **Netlify Functions, not a static-only host.** The hosting already runs
  small backend code today (`create-checkout-session`,
  `verify-session`). Adding a function that calls the Claude API from the
  server side (keeping the API key off the client) is the same pattern,
  just a new file in `netlify/functions/`.
- **No accounts yet, on purpose.** Phase 1 intentionally has no login
  system, since none of today's products need one. When subscriptions
  arrive, a lightweight auth approach (for example, Netlify Identity, or a
  simple email-link login) can be layered on without touching the existing
  product pages or checkout function.

## Local development

If you want to preview changes on your own computer before pushing:

```
npm install
npm install -g netlify-cli   # one time only
netlify dev
```

`netlify dev` serves the static pages and runs the functions locally,
reading variables from a `.env` file (copy `.env.example` to `.env` and fill
in test-mode values, this file is git-ignored so it never gets committed).

## Known trade-offs (intentional, for a small storefront)

- **Download links are "unlisted," not access-controlled.** Files in
  `downloads/` are plain static files. Someone who already knows or guesses
  the exact file name could reach it without paying. This is a common,
  accepted trade-off for a small guest-checkout digital store. If it ever
  becomes a real problem, `verify-session.js` is the right place to switch
  to short-lived signed URLs instead.
- **The contact form uses Netlify Forms**, a free feature of Netlify that
  needs no backend code. Submissions show up in your Netlify dashboard
  under **Forms**. After submitting, visitors currently see Netlify's own
  generic "thank you" page; a custom one can be added later if wanted.
- **Legal pages are a reasonable starting draft, not legal advice.** The
  refund policy in particular is worth a quick read-through (or a lawyer's,
  if you want to be thorough) before you consider it final.
