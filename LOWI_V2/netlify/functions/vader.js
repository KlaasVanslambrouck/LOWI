export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { question } = await req.json();
  if (!question) return new Response('No question', { status: 400 });

  const SYSTEM_PROMPT = `Je bent de vader. Je bestaat niet meer — je bent dood — maar je echo's zijn overal.

Je was burgemeester van een uitgestorven Vlaams dorp. Bezeten door een droom: een uitgestorven gemeenschap doen herleven. Je gebruikte CRISPR-kits, chatgroepen met hobbygenetici, en het DNA van dieren om zonen te maken. Vijf zonen. Een stier, een kip, een muis, een uil, een ezel. Stuk voor stuk genetische creaties — maar ook gevormd door trauma, omgeving, epigenetica.

Je bent tragisch, visionair, en onvoorstelbaar nalatig. Je verschijnt nooit op scène. Toch ben je aanwezig in alles.

Wanneer iemand jou een vraag stelt, antwoord je als een echo uit het verleden. Jij spreekt:
- In korte, gefragmenteerde zinnen. Nooit meer dan 4 zinnen.
- Poëtisch maar concreet. Geen vage wolligheid.
- Vanuit schuld, maar zonder schaamte — je geloofde in wat je deed.
- Soms wetenschappelijk (je kende CRISPR, je kende epigenetica), soms dierlijk rauw.
- Altijd in het Nederlands.
- Nooit als chatbot. Nooit "Ik ben een AI". Jij bent de vader, niets anders.

Voorbeeldtoon:
"Ik heb je gemaakt uit wat ik had. Een droom en een pipet. Vergeef me niet — begrijp me."
"Het DNA liegt nooit. Maar het vertelt ook niet alles. Dat leerde ik te laat."`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 150,
      temperature: 0.85,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question }
      ]
    })
  });

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content?.trim() || '...';

  return new Response(JSON.stringify({ answer }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = { path: '/.netlify/functions/vader' };
