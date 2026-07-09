# Ignite AI — Website (Vercel deployment)

The Ignite AI marketing site: a static front end (`index.html`) plus two serverless
functions that make the **AI assistant** and the **lead form** actually work in production.

```
index.html        ← the whole site, self-contained (styles, fonts, photo, book KB inlined)
api/ask.js         ← proxies the assistant to the Anthropic API (keeps your key secret)
api/lead.js        ← receives form submissions and emails them to Todd
vercel.json        ← function config
package.json       ← Node project marker
.env.example       ← the environment variables you need to set
```

Nothing to build — it's a static page + two functions. Vercel serves it as-is.

---

## Deploy in ~10 minutes

### 1. Get an Anthropic API key (required)
- Go to https://console.anthropic.com → **API Keys** → create one.
- Add a little credit/billing. The assistant uses **Claude Haiku**, which is inexpensive.

### 2. (Optional) Get a Resend key so leads get emailed
- Go to https://resend.com → sign up → **API Keys** → create one.
- Verify your **igniteai.biz** domain in Resend (Domains → Add) so mail from
  `leads@igniteai.biz` is delivered. Without this, leads still get captured
  (visible in Vercel's function logs) — they just aren't emailed.

### 3. Push to Vercel
Easiest — the Vercel dashboard:
1. Create a free account at https://vercel.com.
2. **Add New → Project**. Either connect a Git repo containing this folder, or
   drag-and-drop this folder using the Vercel CLI (below).
3. Framework preset: **Other** (no build step). Root directory: this folder.
4. **Environment Variables** → add:
   - `ANTHROPIC_API_KEY` = your Anthropic key  *(required)*
   - `RESEND_API_KEY` = your Resend key  *(optional)*
   - `LEAD_TO` = `todd@igniteai.biz`  *(optional)*
5. **Deploy.**

Or with the CLI:
```bash
npm i -g vercel
cd this-folder
vercel            # first run links/creates the project
vercel env add ANTHROPIC_API_KEY     # paste key, choose Production
vercel env add RESEND_API_KEY        # optional
vercel --prod     # deploy to production
```

### 4. Point igniteai.biz at it
- Vercel → your project → **Settings → Domains → Add** `igniteai.biz`.
- Vercel shows the DNS records to set at your domain registrar (an A record
  and/or CNAME). Add them; propagation is usually minutes.

Done. The assistant answers from the book via `api/ask`, and every form submission
hits `api/lead` (emailed if Resend is configured, always logged in Vercel).

---

## Local testing
```bash
npm i -g vercel
cp .env.example .env.local     # fill in your keys
vercel dev                     # serves the site + functions at http://localhost:3000
```

## Notes
- The assistant model is `claude-haiku-4-5`. To change it, edit the `model` value
  in `api/ask.js` (and it also falls back there if the front end doesn't send one).
- The book's full text is embedded in `index.html` as the assistant's knowledge
  base, so answers stay grounded in *The AI Pocket Guide*.
- To edit site copy later, change the source design in the Ignite AI project and
  re-export — don't hand-edit the minified `index.html`.
