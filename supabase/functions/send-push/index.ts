// Sends an Expo push notification to all of a user's registered devices.
// Invoked by authenticated clients via supabase.functions.invoke('send-push', { body }).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const { to_user_id, title, body, data } = await req.json();
    if (!to_user_id || !title) {
      return new Response(JSON.stringify({ error: 'to_user_id and title are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: tokens, error } = await supabase
      .from('device_tokens')
      .select('token')
      .eq('user_id', to_user_id);

    if (error) throw error;
    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      title,
      body: body ?? '',
      sound: 'default',
      data: data ?? {},
    }));

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    const result = await res.json();

    return new Response(JSON.stringify({ sent: tokens.length, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
