// Deno/Supabase Edge Function for generating QR code images
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import QRCode from "https://esm.sh/qrcode@1.5.3";

serve(async (req: Request) => {
  const { record } = await req.json();
  const { id, reward_code } = record;

  // Set up Supabase client (service role key)
  // @ts-ignore
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    // @ts-ignore
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Generate QR code image (PNG buffer)
  const qrBuffer = await QRCode.toBuffer(reward_code, { type: "png", width: 512 });

  // Upload to storage
  const filePath = `qr-codes/${id}.png`;
  const { error: uploadError } = await supabase.storage
    .from("qr-codes")
    .upload(filePath, qrBuffer, { contentType: "image/png", upsert: true });

  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("qr-codes")
    .getPublicUrl(filePath);

  // Update user_rewards row: qr_code = image URL
  await supabase
    .from("user_rewards")
    .update({ qr_code: publicUrlData.publicUrl })
    .eq("id", id);

  return new Response(JSON.stringify({ success: true, url: publicUrlData.publicUrl }), { status: 200 });
}); 