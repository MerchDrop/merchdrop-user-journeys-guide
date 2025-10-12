import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { DesignerApprovalEmail } from "./_templates/designer-approval.tsx";
import { DesignerRejectionEmail } from "./_templates/designer-rejection.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  email: string;
  displayName: string;
  status: 'approved' | 'rejected';
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, status, reason }: ApprovalEmailRequest = await req.json();

    console.log("Sending designer approval/rejection email to:", email, "Status:", status);

    let emailHtml: string;
    let subject: string;

    if (status === 'approved') {
      emailHtml = await renderAsync(
        React.createElement(DesignerApprovalEmail, {
          displayName,
          dashboardUrl: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'https://merchdrop.live'}/designer/dashboard`,
        })
      );
      subject = "Your Designer Application Has Been Approved! 🎉";
    } else {
      emailHtml = await renderAsync(
        React.createElement(DesignerRejectionEmail, {
          displayName,
          reason,
        })
      );
      subject = "Update on Your Designer Application";
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

    console.log("Designer approval/rejection email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-designer-approval-email function:", error);
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
