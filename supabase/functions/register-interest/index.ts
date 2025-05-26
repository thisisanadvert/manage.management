import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, role, buildingName, buildingAddress, unitNumber, companyName, phone } = await req.json();

    // Create Supabase client with admin privileges
    const supabaseAdmin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") 
      ? new (await import("npm:@supabase/supabase-js")).createClient(
          Deno.env.get("SUPABASE_URL") || "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
        )
      : null;

    // Store registration in database if we have admin access
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('interest_registrations')
        .insert([
          { 
            email, 
            first_name: firstName, 
            last_name: lastName, 
            role, 
            building_name: buildingName, 
            building_address: buildingAddress, 
            unit_number: unitNumber, 
            company_name: companyName,
            phone
          }
        ]);

      if (error) {
        console.error("Error storing registration:", error);
      }
    }

    // Create transporter
    const transporter = new SmtpClient({
      host: Deno.env.get("SMTP_HOST") || "",
      port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
      secure: false,
      auth: {
        user: Deno.env.get("SMTP_USER") || "",
        pass: Deno.env.get("SMTP_PASS") || "",
      },
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: Deno.env.get("SMTP_FROM") || "noreply@manage.management",
      to: email,
      subject: "Thank you for your interest in Manage.Management",
      text: `
Hi ${firstName},

Thank you for registering your interest in Manage.Management!

We're excited to have you join our community of property managers and homeowners. We're currently in beta, and we'll notify you as soon as access becomes available for ${role} accounts.

Your registration details:
- Name: ${firstName} ${lastName}
- Role: ${role}
${buildingName ? `- Building: ${buildingName}` : ""}
${buildingAddress ? `- Address: ${buildingAddress}` : ""}
${unitNumber ? `- Unit: ${unitNumber}` : ""}
${companyName ? `- Company: ${companyName}` : ""}

In the meantime, you can try our demo to get a feel for the platform: https://app.manage.management/demo

If you have any questions, please don't hesitate to contact us at support@manage.management.

Best regards,
The Manage.Management Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Interest</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Thank You for Your Interest!</h1>
  </div>
  <div class="content">
    <p>Hi ${firstName},</p>
    
    <p>Thank you for registering your interest in Manage.Management!</p>
    
    <p>We're excited to have you join our community of property managers and homeowners. We're currently in beta, and we'll notify you as soon as access becomes available for ${role} accounts.</p>
    
    <h3>Your registration details:</h3>
    <ul>
      <li><strong>Name:</strong> ${firstName} ${lastName}</li>
      <li><strong>Role:</strong> ${role}</li>
      ${buildingName ? `<li><strong>Building:</strong> ${buildingName}</li>` : ""}
      ${buildingAddress ? `<li><strong>Address:</strong> ${buildingAddress}</li>` : ""}
      ${unitNumber ? `<li><strong>Unit:</strong> ${unitNumber}</li>` : ""}
      ${companyName ? `<li><strong>Company:</strong> ${companyName}</li>` : ""}
    </ul>
    
    <p>In the meantime, you can try our demo to get a feel for the platform:</p>
    
    <a href="https://app.manage.management/demo" class="button">Try Demo</a>
    
    <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:support@manage.management">support@manage.management</a>.</p>
    
    <p>Best regards,<br>The Manage.Management Team</p>
  </div>
  <div class="footer">
    <p>© 2025 Manage.Management. All rights reserved.</p>
  </div>
</body>
</html>
      `,
    });

    // Send notification email to admin
    await transporter.sendMail({
      from: Deno.env.get("SMTP_FROM") || "noreply@manage.management",
      to: "registrations@manage.management",
      subject: `New Registration: ${role}`,
      text: `
New registration interest:

Name: ${firstName} ${lastName}
Email: ${email}
Role: ${role}
${phone ? `Phone: ${phone}` : ""}
${buildingName ? `Building Name: ${buildingName}` : ""}
${buildingAddress ? `Building Address: ${buildingAddress}` : ""}
${unitNumber ? `Unit Number: ${unitNumber}` : ""}
${companyName ? `Company Name: ${companyName}` : ""}

Registration Time: ${new Date().toISOString()}
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Registration</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>New Registration Interest</h1>
  </div>
  <div class="content">
    <h3>Registration Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${firstName} ${lastName}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Role:</strong> ${role}</li>
      ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ""}
      ${buildingName ? `<li><strong>Building:</strong> ${buildingName}</li>` : ""}
      ${buildingAddress ? `<li><strong>Address:</strong> ${buildingAddress}</li>` : ""}
      ${unitNumber ? `<li><strong>Unit:</strong> ${unitNumber}</li>` : ""}
      ${companyName ? `<li><strong>Company:</strong> ${companyName}</li>` : ""}
    </ul>
    
    <p><strong>Registration Time:</strong> ${new Date().toISOString()}</p>
  </div>
  <div class="footer">
    <p>© 2025 Manage.Management. All rights reserved.</p>
  </div>
</body>
</html>
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
    console.error("Error processing registration:", error);
    
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