// Cloudflare Pages Function - Data Sync API
// Requires KV namespace binding: FITNESS_DATA

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get data from KV
    const data = await env.FITNESS_DATA.get(`user:${userId}`, 'json');

    if (!data) {
      return new Response(JSON.stringify({ data: null, message: 'No data found' }), {
        status: 200,
        headers: corsHeaders()
      });
    }

    return new Response(JSON.stringify({ data, lastSync: data._lastSync }), {
      status: 200,
      headers: corsHeaders()
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return new Response(JSON.stringify({ error: 'Missing userId or data' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Add sync timestamp
    data._lastSync = new Date().toISOString();

    // Save to KV (expires in 1 year)
    await env.FITNESS_DATA.put(`user:${userId}`, JSON.stringify(data), {
      expirationTtl: 31536000
    });

    return new Response(JSON.stringify({
      success: true,
      lastSync: data._lastSync
    }), {
      status: 200,
      headers: corsHeaders()
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
