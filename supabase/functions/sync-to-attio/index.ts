import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AttioPersonData {
  values: {
    [key: string]: any
  }
}

interface AttioCompanyData {
  values: {
    [key: string]: any
  }
}

class AttioService {
  private apiKey: string
  private baseUrl = 'https://api.attio.com/v2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Attio API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  async createPerson(personData: AttioPersonData) {
    return this.makeRequest('/objects/people/records', 'POST', { data: personData })
  }

  async createCompany(companyData: AttioCompanyData) {
    return this.makeRequest('/objects/companies/records', 'POST', { data: companyData })
  }

  async findPersonByEmail(email: string) {
    try {
      const response = await this.makeRequest(`/objects/people/records?filter[email_addresses]=${encodeURIComponent(email)}`)
      return response.data && response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.log('Person not found:', email)
      return null
    }
  }

  async updatePerson(personId: string, personData: Partial<AttioPersonData>) {
    return this.makeRequest(`/objects/people/records/${personId}`, 'PATCH', { data: personData })
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // For testing, let's add a simple health check endpoint
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Attio sync function is running',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    // Create Supabase client to verify user (need service role to validate tokens)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    console.log('Attempting to validate token...')

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error('User validation failed:', userError)
      throw new Error(`Invalid authentication token: ${userError?.message || 'Unknown error'}`)
    }

    console.log('User validated:', user.email, 'Role:', user.user_metadata?.role)

    // Check if user is super-admin (only super-admins can use Attio integration)
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    if (userRole !== 'super-admin') {
      console.error('Access denied for role:', userRole)
      throw new Error(`Access denied: Attio integration is only available to super-admin users. Current role: ${userRole}`)
    }

    const {
      email,
      firstName,
      lastName,
      phone,
      role,
      buildingName,
      buildingAddress,
      unitNumber,
      companyName,
      qualificationData,
      buildingData,
      source = 'rtm-qualify'
    } = await req.json()

    // Get Attio API key from environment
    const attioApiKey = Deno.env.get('ATTIO_API_KEY')
    console.log('Attio API key configured:', !!attioApiKey)
    if (!attioApiKey) {
      throw new Error('Attio API key not configured')
    }

    const attio = new AttioService(attioApiKey)

    // Check if person already exists
    let person = await attio.findPersonByEmail(email)
    
    // Create person data using standard Attio person attributes
    const personData: AttioPersonData = {
      values: {
        // Use standard person attributes - these are the default slugs in Attio
        'name': [{
          first_name: firstName || '',
          last_name: lastName || '',
          full_name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0]
        }],
        'email_addresses': [{
          email_address: email
        }],
        // Add phone if provided
        ...(phone && {
          'phone_numbers': [{
            phone_number: phone
          }]
        }),
        // Add job title if role provided
        ...(role && {
          'job_title': role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
        }),
        // Add custom fields for manage.management tracking
        'source': source,
        'building_name': buildingName || '',
        'building_address': buildingAddress || '',
        'unit_number': unitNumber || '',
        // Add qualification data as JSON if available
        ...(qualificationData && {
          'rtm_qualification_data': JSON.stringify(qualificationData)
        }),
        // Add building data as JSON if available
        ...(buildingData && {
          'building_data': JSON.stringify(buildingData)
        })
      }
    }

    if (person) {
      // Update existing person
      person = await attio.updatePerson(person.id.record_id, personData)
      console.log('Updated existing person in Attio:', person.id.record_id)
    } else {
      // Create new person
      person = await attio.createPerson(personData)
      console.log('Created new person in Attio:', person.id.record_id)
    }

    // Create company if building name provided
    let company = null
    if (buildingName) {
      try {
        const companyData: AttioCompanyData = {
          values: {
            // Use standard company attributes
            'name': buildingName,
            'categories': 'Residential Building',
            'description': `Property managed through manage.management platform`,
            // Add building-specific data
            'address': buildingAddress || '',
            'source': 'manage.management',
            // Add building data if available
            ...(buildingData && {
              'total_units': buildingData.total_units?.toString() || '',
              'building_age': buildingData.building_age?.toString() || '',
              'building_type': buildingData.building_type || '',
              'service_charge_frequency': buildingData.service_charge_frequency || '',
              'management_structure': buildingData.management_structure || '',
              'building_data_json': JSON.stringify(buildingData)
            })
          }
        }

        company = await attio.createCompany(companyData)
        console.log('Created company in Attio:', company.id.record_id)
      } catch (error) {
        console.log('Company may already exist or error creating:', error.message)
      }
    }

    // Log the sync to Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
      .from('attio_sync_log')
      .insert({
        email,
        attio_person_id: person.id.record_id,
        attio_company_id: company?.id?.record_id,
        source,
        sync_status: 'success',
        qualification_data: qualificationData,
        building_info: {
          name: buildingName,
          address: buildingAddress,
          unit_number: unitNumber,
          building_data: buildingData
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        person_id: person.id.record_id,
        company_id: company?.id?.record_id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error syncing to Attio:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
