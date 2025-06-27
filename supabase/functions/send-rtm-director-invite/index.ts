import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { 
      email, 
      firstName, 
      lastName, 
      role, 
      unitNumber, 
      inviterName, 
      inviterEmail,
      context,
      companyName 
    } = await req.json()

    // Validate required fields
    if (!email || !firstName || !inviterName || !inviterEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send invitation email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const inviteUrl = `${Deno.env.get("SITE_URL") || "https://app.manage.management"}/signup?invite=${encodeURIComponent(JSON.stringify({
      email,
      firstName,
      lastName,
      role: role || 'rtm-director',
      unitNumber,
      inviterName,
      context: context || 'rtm-formation',
      companyName
    }))}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RTM Director Invitation</title>
        <style>
          body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
          .button { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏢 Manage.Management</div>
          <h1>You're Invited to be an RTM Director</h1>
        </div>
        
        <p>Hello ${firstName},</p>
        
        <p>${inviterName} has invited you to become a director of <strong>${companyName || 'an RTM Company'}</strong> and join the Manage.Management platform.</p>
        
        <div class="info-box">
          <h3>RTM Director Role</h3>
          <p>As an RTM (Right to Manage) director, you will:</p>
          <ul>
            <li>Help form and manage the RTM company</li>
            <li>Participate in building management decisions</li>
            <li>Access the Manage.Management platform for building administration</li>
            <li>Work with other directors to manage the building effectively</li>
          </ul>
        </div>
        
        <div class="info-box">
          <h3>Your Details</h3>
          <ul>
            ${unitNumber ? `<li><strong>Unit:</strong> ${unitNumber}</li>` : ''}
            <li><strong>Role:</strong> RTM Director</li>
            <li><strong>Invited by:</strong> ${inviterName}</li>
          </ul>
        </div>
        
        <p>Click the button below to accept this invitation and create your account:</p>
        
        <div style="text-align: center;">
          <a href="${inviteUrl}" class="button">Accept Invitation & Sign Up</a>
        </div>
        
        <p>If you have any questions about this invitation or the RTM process, please contact ${inviterName} at ${inviterEmail}.</p>
        
        <div class="footer">
          <p>© 2025 Manage.Management. All rights reserved.</p>
          <p>This invitation was sent by ${inviterName} for RTM company formation.</p>
        </div>
      </body>
      </html>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Manage.Management <noreply@manage.management>',
        to: [email],
        subject: `You're invited to be an RTM Director - ${companyName || 'RTM Company'}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      throw new Error(`Failed to send email: ${errorText}`)
    }

    // Log the invitation for audit purposes
    const { error: logError } = await supabaseClient
      .from('rtm_director_invitations')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        unit_number: unitNumber,
        inviter_id: user.id,
        inviter_name: inviterName,
        company_name: companyName,
        status: 'sent',
        invited_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging invitation:', logError)
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'RTM director invitation sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending RTM director invitation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send invitation', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
