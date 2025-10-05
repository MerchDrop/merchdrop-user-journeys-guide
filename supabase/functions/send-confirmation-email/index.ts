import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

interface EmailRequest {
  email: string;
  userType: 'artist' | 'designer' | 'user';
  displayName?: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userType, displayName, confirmationUrl }: EmailRequest = await req.json();

    console.log("Sending confirmation email to:", email, "Type:", userType);

    let emailHtml: string;
    let subject: string;

    // Select template based on user type
    switch (userType) {
      case 'artist':
        emailHtml = await renderAsync(
          React.createElement(ArtistConfirmationEmail, {
            displayName: displayName || email,
            confirmationUrl,
          })
        );
        subject = "Confirm Your Merchdrop Artist Account";
        break;
      
      case 'designer':
        emailHtml = await renderAsync(
          React.createElement(DesignerConfirmationEmail, {
            displayName: displayName || email,
            confirmationUrl,
          })
        );
        subject = "Confirm Your Merchdrop Designer Account";
        break;
      
      default:
        emailHtml = await renderAsync(
          React.createElement(UserConfirmationEmail, {
            displayName: displayName || email,
            confirmationUrl,
          })
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

    console.log("Email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
