// netlify/functions/oembed.js
exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const postUrl = qs.url;

  if (!postUrl) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Missing ?url=<instagram-post-url>" }),
    };
  }

  try {
    // Wenn APP_ID & APP_SECRET gesetzt sind, echten Meta-oEmbed-Call machen
    if (process.env.APP_ID && process.env.APP_SECRET) {
      const api = `https://graph.facebook.com/v23.0/instagram_oembed?url=${encodeURIComponent(
        postUrl.endsWith("/") ? postUrl : postUrl + "/"
      )}&access_token=${process.env.APP_ID}|${process.env.APP_SECRET}`;

      const r = await fetch(api);
      const data = await r.json();
      return {
        statusCode: r.ok ? 200 : r.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(data),
      };
    }

    // --- MOCK bis zur Freigabe (zeigt echtes Embed via embed.js) ---
    const html = `
<blockquote class="instagram-media" data-instgrm-permalink="${postUrl}" data-instgrm-version="14"></blockquote>
<script async src="https://www.instagram.com/embed.js"></script>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        provider_name: "Instagram",
        version: "1.0",
        author_name: "Demo (Mock bis Freigabe)",
        html,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
