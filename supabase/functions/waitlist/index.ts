import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SmtpClient } from 'npm:nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, role, buildingName, buildingAddress, unitNumber, companyName } = await req.json();

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

    // Send email to admin
    await transporter.sendMail({
      from: Deno.env.get('SMTP_FROM'),
      to: 'waitlist@manage.management',
      subject: `New Waitlist Registration: ${role}`,
      text: `
New waitlist registration:

Name: ${firstName} ${lastName}
Email: ${email}
Role: ${role}
${buildingName ? `Building Name: ${buildingName}` : ''}
${buildingAddress ? `Building Address: ${buildingAddress}` : ''}
${unitNumber ? `Unit Number: ${unitNumber}` : ''}
${companyName ? `Company Name: ${companyName}` : ''}
      `,
      html: `
<h2>New Waitlist Registration</h2>
<p><strong>Name:</strong> ${firstName} ${lastName}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Role:</strong> ${role}</p>
${buildingName ? `<p><strong>Building Name:</strong> ${buildingName}</p>` : ''}
${buildingAddress ? `<p><strong>Building Address:</strong> ${buildingAddress}</p>` : ''}
${unitNumber ? `<p><strong>Unit Number:</strong> ${unitNumber}</p>` : ''}
${companyName ? `<p><strong>Company Name:</strong> ${companyName}</p>` : ''}
      `,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: Deno.env.get('SMTP_FROM'),
      to: email,
      subject: 'Welcome to the Manage.Management Waitlist',
      text: `
Hi ${firstName},

Thank you for joining the Manage.Management waitlist! We're excited to have you on board.

We'll notify you as soon as registration opens for ${role} accounts.

Best regards,
The Manage.Management Team
      `,
      html: `
<h2>Welcome to the Manage.Management Waitlist!</h2>
<p>Hi ${firstName},</p>
<p>Thank you for joining the Manage.Management waitlist! We're excited to have you on board.</p>
<p>We'll notify you as soon as registration opens for ${role} accounts.</p>
<p>Best regards,<br>The Manage.Management Team</p>
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