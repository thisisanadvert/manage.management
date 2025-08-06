import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AttioPersonData {
  values: {
    name: Array<{
      first_name: string
      last_name: string
      full_name: string
    }>
    email_addresses: Array<{
      email_address: string
      label: string
      is_primary: boolean
    }>
    phone_numbers?: Array<{
      phone_number: string
      label: string
      is_primary: boolean
    }>
    job_title?: Array<{ value: string }>
    company_name?: Array<{ value: string }>
  }
}

interface AttioCompanyData {
  values: {
    name: Array<{ value: string }>
    domains?: Array<{ domain: string }>
    categories?: Array<{ option: string }>
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
    if (!attioApiKey) {
      throw new Error('Attio API key not configured')
    }

    const attio = new AttioService(attioApiKey)

    // Check if person already exists
    let person = await attio.findPersonByEmail(email)
    
    const personData: AttioPersonData = {
      values: {
        name: [{
          first_name: firstName || '',
          last_name: lastName || '',
          full_name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0]
        }],
        email_addresses: [{
          email_address: email,
          label: 'Work',
          is_primary: true
        }],
        ...(phone && {
          phone_numbers: [{
            phone_number: phone,
            label: 'Mobile',
            is_primary: true
          }]
        }),
        ...(role && {
          job_title: [{ value: role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }]
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
            name: [{ value: buildingName }],
            categories: [{ option: 'Residential Building' }]
          }
        }

        // Add building data if available
        if (buildingData) {
          // Add custom attributes for building data
          if (buildingData.total_units) {
            companyData.values.total_units = [{ value: buildingData.total_units.toString() }]
          }
          if (buildingData.building_type) {
            companyData.values.building_type = [{ value: buildingData.building_type }]
          }
          if (buildingData.management_structure) {
            companyData.values.management_structure = [{ value: buildingData.management_structure }]
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
