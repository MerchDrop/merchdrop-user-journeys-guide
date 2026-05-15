import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ArtistConfirmationEmail } from "./_templates/artist-confirmation.tsx";
import { DesignerConfirmationEmail } from "./_templates/designer-confirmation.tsx";
import { UserConfirmationEmail } from "./_templates/user-confirmation.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowlist of acceptable confirmation URL origins
const ALLOWED_ORIGINS = [
  "https://merchdrop.live",
  "https://merchdrop.lovable.app",
  "https://id-preview--aea51037-916d-42eb-8d23-5220971444be.lovable.app",
];

interface EmailRequest {
  email: string;
  userType: 'artist' | 'designer' | 'user';
  displayName?: string;
  confirmationUrl: string;
}

const isUrlAllowed = (url: string): boolean => {
  try {
    const u = new URL(url);
    return ALLOWED_ORIGINS.some((origin) => {
      const o = new URL(origin);
      return u.origin === o.origin || u.hostname.endsWith(".lovable.app");
    });
  } catch {
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, userType, displayName, confirmationUrl }: EmailRequest = await req.json();

    // Caller can only request a confirmation for themselves
    if (!email || email.toLowerCase() !== (authData.user.email ?? "").toLowerCase()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Restrict confirmation URL to known origins
    if (!confirmationUrl || !isUrlAllowed(confirmationUrl)) {
      return new Response(JSON.stringify({ error: "Invalid confirmation URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let emailHtml: string;
    let subject: string;

    switch (userType) {
      case 'artist':
        emailHtml = await renderAsync(
          React.createElement(ArtistConfirmationEmail, { displayName: displayName || email, confirmationUrl })
        );
        subject = "Confirm Your Merchdrop Artist Account";
        break;
      case 'designer':
        emailHtml = await renderAsync(
          React.createElement(DesignerConfirmationEmail, { displayName: displayName || email, confirmationUrl })
        );
        subject = "Confirm Your Merchdrop Designer Account";
        break;
      default:
        emailHtml = await renderAsync(
          React.createElement(UserConfirmationEmail, { displayName: displayName || email, confirmationUrl })
        );
        subject = "Confirm Your Merchdrop Account";
        break;
    }

    const { error } = await resend.emails.send({
      from: "Merchdrop Team <onboarding@resend.dev>",
      to: [email],
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
