// Deno/Supabase Edge Function for redemption page
// When a cashier scans the QR code, this page auto-claims the code and displays it
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// HTML template for the redemption page
function renderPage(content: {
  success: boolean;
  code?: string;
  prizeName?: string;
  prizeDescription?: string;
  sponsorLogo?: string;
  sponsorName?: string;
  errorMessage?: string;
  alreadyClaimed?: boolean;
}): string {
  const { success, code, prizeName, prizeDescription, sponsorLogo, sponsorName, errorMessage, alreadyClaimed } = content;

  if (!success) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenDoors - Reward Error</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 24px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .error-icon {
      width: 80px;
      height: 80px;
      background: #fee2e2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
    }
    h1 { color: #dc2626; font-size: 24px; margin-bottom: 12px; }
    p { color: #6b7280; font-size: 16px; line-height: 1.5; }
    .brand { margin-top: 32px; color: #9ca3af; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">❌</div>
    <h1>Unable to Redeem</h1>
    <p>${errorMessage || 'This reward code is not valid.'}</p>
    <p class="brand">OpenDoors</p>
  </div>
</body>
</html>`;
  }

  // Different styling for already claimed vs new claim
  const bgGradient = alreadyClaimed
    ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
    : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
  const badgeColor = alreadyClaimed ? '#d97706' : '#22c55e';
  const badgeText = alreadyClaimed ? '⚠ Previously Redeemed' : '✓ Verified Reward';
  const codeBoxBg = alreadyClaimed ? '#fffbeb' : '#f0fdf4';
  const codeBoxBorder = alreadyClaimed ? '#d97706' : '#22c55e';
  const codeColor = alreadyClaimed ? '#92400e' : '#166534';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenDoors - ${alreadyClaimed ? 'Previously Redeemed' : 'Redeem Reward'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${bgGradient};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 24px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .success-badge {
      background: ${badgeColor};
      color: white;
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 20px;
    }
    .logo {
      width: 100px;
      height: 100px;
      border-radius: 20px;
      object-fit: contain;
      margin-bottom: 20px;
      background: #f3f4f6;
      padding: 10px;
    }
    .sponsor-name {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
    }
    h1 { color: #111827; font-size: 24px; margin-bottom: 8px; }
    .description { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .code-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .code-box {
      background: ${codeBoxBg};
      border: 3px dashed ${codeBoxBorder};
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .code {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 32px;
      font-weight: 700;
      color: ${codeColor};
      letter-spacing: 2px;
      word-break: break-all;
    }
    .instructions {
      background: #fef3c7;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .instructions p {
      color: #92400e;
      font-size: 14px;
      line-height: 1.5;
    }
    .warning-note {
      background: #fef2f2;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .warning-note p {
      color: #b91c1c;
      font-size: 14px;
      line-height: 1.5;
    }
    .brand { color: #9ca3af; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-badge">${badgeText}</div>
    ${sponsorLogo ? `<img src="${sponsorLogo}" alt="${sponsorName || 'Sponsor'}" class="logo">` : ''}
    ${sponsorName ? `<p class="sponsor-name">${sponsorName}</p>` : ''}
    <h1>${prizeName || 'Reward'}</h1>
    ${prizeDescription ? `<p class="description">${prizeDescription}</p>` : ''}

    <p class="code-label">Redemption Code</p>
    <div class="code-box">
      <div class="code">${code}</div>
    </div>

    ${alreadyClaimed ? `
    <div class="warning-note">
      <p><strong>Note:</strong> This reward was already redeemed. If there's an issue, please contact support.</p>
    </div>
    ` : `
    <div class="instructions">
      <p><strong>Cashier:</strong> Enter this code into the register to complete the redemption.</p>
    </div>
    `}

    <p class="brand">Powered by OpenDoors</p>
  </div>
</body>
</html>`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Parse the prize_code_id from the URL path
  // URL format: /redeem/{prize_code_id}
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // The path should be like /redeem/uuid or just /uuid if the function is mounted at /redeem
  let prizeCodeId = pathParts[pathParts.length - 1];

  // Remove 'redeem' if it's in the path
  if (prizeCodeId === "redeem" && pathParts.length > 1) {
    prizeCodeId = pathParts[pathParts.length - 1];
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!prizeCodeId || !uuidRegex.test(prizeCodeId)) {
    return new Response(
      renderPage({ success: false, errorMessage: "Invalid reward code" }),
      {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  // Set up Supabase client with service role key for full access
  // @ts-ignore
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    // @ts-ignore
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Call the claim_prize_code RPC function
  const { data, error } = await supabase.rpc("claim_prize_code", {
    p_code_id: prizeCodeId,
  });

  if (error) {
    console.error("RPC error:", error);
    return new Response(
      renderPage({ success: false, errorMessage: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  // The RPC returns a single row with success, error_message, code, prize_name, etc.
  const result = data?.[0];

  if (!result || !result.success) {
    return new Response(
      renderPage({
        success: false,
        errorMessage: result?.error_message || "This reward code is not valid.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  // Success! Render the redemption page with the code
  return new Response(
    renderPage({
      success: true,
      code: result.code,
      prizeName: result.prize_name,
      prizeDescription: result.prize_description,
      sponsorLogo: result.sponsor_logo,
      sponsorName: result.sponsor_name,
      alreadyClaimed: result.already_claimed || false,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
});
