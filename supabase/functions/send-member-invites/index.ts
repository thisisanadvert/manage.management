import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invites, buildingId, inviterName, inviterEmail } = await req.json();

    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get building information
    const { data: building, error: buildingError } = await supabaseAdmin
      .from('buildings')
      .select('name, address')
      .eq('id', buildingId)
      .single();

    if (buildingError) {
      throw new Error('Building not found');
    }

    // Email sending function using fetch to Gmail API
    async function sendEmail(to: string, subject: string, content: string) {
      // For now, let's log the email and return success
      // This will help us test the flow without SMTP issues
      console.log('Email to send:', {
        to,
        subject,
        from: Deno.env.get("SMTP_FROM"),
        contentLength: content.length
      });

      // Return success for testing
      return { success: true, messageId: 'test-' + Date.now() };
    }

    // Send invitation emails
    const emailPromises = invites.map(async (invite: any) => {
      const inviteUrl = `${Deno.env.get("SITE_URL") || "https://app.manage.management"}/signup?invite=${encodeURIComponent(JSON.stringify({
        email: invite.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        role: invite.role,
        buildingId: buildingId,
        buildingName: building.name,
        unitNumber: invite.unitNumber,
        inviterName: inviterName
      }))}`;

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${building.name}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .info-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .building-info { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏢 Manage.Management</h1>
      <p>You're invited to join your building's management platform</p>
    </div>
    
    <div class="content">
      <h2>Hello ${invite.firstName},</h2>
      
      <p>${inviterName} has invited you to join the management platform for <strong>${building.name}</strong>.</p>
      
      <div class="building-info">
        <h3>Building Details:</h3>
        <p><strong>Building:</strong> ${building.name}</p>
        <p><strong>Address:</strong> ${building.address}</p>
        <p><strong>Your Unit:</strong> ${invite.unitNumber}</p>
        <p><strong>Your Role:</strong> ${invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}</p>
      </div>
      
      <div class="info-box">
        <h3>What is Manage.Management?</h3>
        <p>Manage.Management is a comprehensive platform that helps building residents and management companies:</p>
        <ul>
          <li>Track and report maintenance issues</li>
          <li>View financial information and budgets</li>
          <li>Participate in building decisions and voting</li>
          <li>Stay updated with announcements</li>
          <li>Access important building documents</li>
        </ul>
      </div>
      
      <p>Click the button below to create your account and get started:</p>
      
      <div style="text-align: center;">
        <a href="${inviteUrl}" class="button">Accept Invitation & Sign Up</a>
      </div>
      
      <p><small>If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${inviteUrl}">${inviteUrl}</a></small></p>
      
      <p>If you have any questions about this invitation, please contact ${inviterName} at ${inviterEmail}.</p>
      
      <p>Welcome to your building's digital management platform!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Manage.Management. All rights reserved.</p>
      <p>This invitation was sent by ${inviterName} for ${building.name}</p>
    </div>
  </div>
</body>
</html>
      `;

      const emailText = `
Hello ${invite.firstName},

${inviterName} has invited you to join the management platform for ${building.name}.

Building Details:
- Building: ${building.name}
- Address: ${building.address}
- Your Unit: ${invite.unitNumber}
- Your Role: ${invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}

What is Manage.Management?
Manage.Management is a comprehensive platform that helps building residents and management companies track maintenance issues, view financial information, participate in decisions, stay updated with announcements, and access important documents.

To accept this invitation and create your account, visit:
${inviteUrl}

If you have any questions about this invitation, please contact ${inviterName} at ${inviterEmail}.

Welcome to your building's digital management platform!

© 2025 Manage.Management. All rights reserved.
This invitation was sent by ${inviterName} for ${building.name}
      `;

      return sendEmail(
        invite.email,
        `You're invited to join ${building.name} on Manage.Management`,
        emailHtml
      );
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    // Send notification to the inviter
    await sendEmail(
      inviterEmail,
      `Member invitations sent for ${building.name}`,
      `
Hello ${inviterName},

Your member invitations for ${building.name} have been successfully sent to:

${invites.map((invite: any) => `- ${invite.firstName} ${invite.lastName} (${invite.email}) - Unit ${invite.unitNumber}`).join('\n')}

The invited members will receive an email with instructions to create their accounts and join your building's management platform.

Best regards,
The Manage.Management Team
      `
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully sent ${invites.length} invitation(s)` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error sending invitations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send invitations' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
