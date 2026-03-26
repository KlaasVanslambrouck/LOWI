const REPO = 'KlaasVanslambrouck/LOWI';
const BRANCH = 'main';

export default async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const githubHeaders = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'LOWI-site',
  };

  // Voeg token toe als die beschikbaar is
  if (process.env.GITHUB_TOKEN) {
    githubHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Haal lijst van bestanden op
    const listRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/transmissies?ref=${BRANCH}`,
      { headers: githubHeaders }
    );

    if (!listRes.ok) throw new Error(`GitHub API error: ${listRes.status}`);

    const files = await listRes.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md')).reverse();

    // Haal inhoud van elk bestand op
    const transmissies = await Promise.all(
      mdFiles.map(async (f) => {
        try {
          const fileRes = await fetch(f.download_url, { headers: githubHeaders });
          const content = await fileRes.text();
          return { slug: f.name, content };
        } catch {
          return { slug: f.name, content: '' };
        }
      })
    );

    return new Response(JSON.stringify({ transmissies }), { headers });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, transmissies: [] }),
      { status: 500, headers }
    );
  }
};

export const config = { path: '/.netlify/functions/transmissies' };
