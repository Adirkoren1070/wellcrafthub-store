# Downloads folder

This folder is where the real product files go so customers can download
them after payment. Add your files here with exactly these names (these
names are already wired up in `shared/products.js` and the confirmation
page), then commit and deploy:

- `thrive-after-40-wellness-bundle.zip` — should contain the guide PDF, the
  planner PDF, and the Notion template (a PDF/text file with the Notion
  template link works well, since Notion templates are duplicated via a link
  rather than a file).
- `longevity-weekly-planner.pdf`
- `thrive-after-40-weekly-planner.pdf`

The 90-Day Blueprint Workbook does not need a file here. It delivers a link
to the existing workbook at wellcrafthub.netlify.app instead.

## A note on how this delivers files

These files are served as regular static files on the site. Someone would
need the exact file name to reach one directly without paying, and these
names aren't linked anywhere except the post-purchase confirmation page, but
this is "unlisted," not truly private. That is an intentional, documented
trade-off for a small storefront with no accounts or database. If this ever
becomes a concern, the fix is to move these files to private storage and
generate a short-lived signed download link inside `verify-session.js`
instead of a plain `/downloads/...` URL. See the main README for more.
