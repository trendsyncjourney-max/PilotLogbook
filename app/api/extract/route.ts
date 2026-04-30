import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ExtractionType } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPTS: Record<ExtractionType, string> = {
  callsign: `You are analyzing an image of an aircraft. Extract the aircraft registration/call sign (e.g., A6-EDA, G-BOAC, N12345).
Return ONLY valid JSON in this exact format, no other text:
{"aircraft_callsign": "REGISTRATION"}
If you cannot find a registration, return: {"aircraft_callsign": ""}`,

  gendecl: `You are analyzing a General Declaration (GenDecl) document used in aviation. Extract:
- The date of the flight
- The names of the two crew members (Commander/Captain and First Officer/Co-pilot)
- Departure airport (city or ICAO code if visible)
- Arrival/destination airport (city or ICAO code if visible)

Return ONLY valid JSON in this exact format, no other text:
{"date": "YYYY-MM-DD", "pilot1_name": "FULL NAME", "pilot2_name": "FULL NAME", "departure_from_gendecl": "AIRPORT", "arrival_from_gendecl": "AIRPORT"}
For any field you cannot find, use an empty string "".`,

  mcdu: `You are analyzing a photo of an MCDU (Multipurpose Control Display Unit) or FMS (Flight Management System) screen on an aircraft.
Extract the departure airport ICAO code and arrival/destination airport ICAO code.
ICAO codes are 4-letter airport codes (e.g., EGLL, OMDB, KJFK, YSSY).
Look for route information showing FROM/TO airports.

Return ONLY valid JSON in this exact format, no other text:
{"departure_airport": "ICAO", "arrival_airport": "ICAO"}
If you cannot find a code, use an empty string "".`,

  acars: `You are analyzing an ACARS (Aircraft Communications Addressing and Reporting System) screen or printout showing flight times.
Extract the following times (all in UTC/ZULU unless otherwise noted, in HH:MM format):
- Off-block time (also called pushback time, OUT time, or EOBT)
- Takeoff time (also called airborne time, OFF time, or actual takeoff)
- Landing time (also called ON time or touchdown time)
- On-block time (also called IN time or chocks-on time)
- Total block time (also called block-to-block time or total flight time, in HH:MM format)

Return ONLY valid JSON in this exact format, no other text:
{"off_block_time": "HH:MM", "takeoff_time": "HH:MM", "landing_time": "HH:MM", "on_block_time": "HH:MM", "total_time": "HH:MM"}
For any field you cannot find, use an empty string "".`,
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const type = formData.get('type') as ExtractionType

    if (!file || !type) {
      return NextResponse.json({ success: false, error: 'Missing image or type' }, { status: 400 })
    }

    if (!PROMPTS[type]) {
      return NextResponse.json({ success: false, error: 'Invalid extraction type' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: PROMPTS[type] },
          ],
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    // Strip markdown code blocks if present
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let data: Record<string, string> = {}
    try {
      data = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ success: false, error: 'AI response was not valid JSON', raw: text }, { status: 200 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
