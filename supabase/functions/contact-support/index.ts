import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SmtpClient } from 'npm:nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, message, buildingId } = await req.json();

    // Create transporter
    const transporter = new SmtpClient({
      host: Deno.env.get('SMTP_HOST'),
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASS'),
      },
    });

    // Send email
    await transporter.sendMail({
      from: Deno.env.get('SMTP_FROM'),
      to: 'support@manage.management',
      subject: `Support Request from ${name}`,
      text: `
Support request from building ${buildingId}

From: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
<h2>Support Request</h2>
<p><strong>Building ID:</strong> ${buildingId}</p>
<p><strong>From:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<h3>Message:</h3>
<p>${message}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});