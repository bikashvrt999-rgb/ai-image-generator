# AI Image Generator (সম্পূর্ণ ফ্রি)

Pollinations.ai ব্যবহার করে বানানো একটা free AI image generator ওয়েবসাইট। কোনো API key লাগে না, কোনো cost নেই।

## Deploy করা (ফ্রি — Vercel)

1. এই repo GitHub এ push করা আছে
2. vercel.com এ গিয়ে GitHub দিয়ে login করো
3. "New Project" → এই repo select করো → Deploy চাপো
4. কোনো environment variable লাগবে না

## যা যা আছে

- `app/page.js` — মূল UI
- `app/api/generate/route.js` — backend, Pollinations.ai কল করে
- ১৫ সেকেন্ড cooldown per IP, basic banned-word filter, prompt length limit
