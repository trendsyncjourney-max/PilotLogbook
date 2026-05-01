import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const PROMPT = `You are analyzing a photo from a commercial aviation cockpit or aviation document (such as an ACARS printout, General Declaration, flight computer screen, or any other cockpit document).

Extract every piece of the following information that is visible in this image:
- aircraft_callsign: Aircraft registration/tail number (e.g. A6-EDA, 9V-SWA)
- aircraft_type: Aircraft model (e.g. B777-300ER, A380-800, A320neo)
- flight_number: Flight number with airline code (e.g. EK123, QR512, SQ001)
- date: Flight date in YYYY-MM-DD format
- captain: Full name of the Captain / Commander (CN)
- first_officer: Full name of the First Officer (FO)
- departure_airport: Departure airport ICAO code (4 letters, e.g. OMDB)
- arrival_airport: Arrival/destination airport ICAO code (4 letters, e.g. EGLL)
- off_block_time: Off-block / pushback / OUT time in UTC HH:MM
- takeoff_time: Takeoff / airborne / OFF time in UTC HH:MM
- landing_time: Landing / touchdown / ON time in UTC HH:MM
- on_block_time: On-block / chocks-on / IN time in UTC HH:MM
- total_time: Total block time in HH:MM

Return ONLY valid JSON with exactly these keys. Use an empty string "" for any field not visible in the image. No markdown, no explanation.

{"aircraft_callsign":"","aircraft_type":"","flight_number":"","date":"","captain":"","first_officer":"","departure_airport":"","arrival_airport":"","off_block_time":"","takeoff_time":"","landing_time":"","on_block_time":"","total_time":""}`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'Missing image' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = file.type || 'image/jpeg'

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType: mediaType } },
      PROMPT,
    ])

    const text = result.response.text().trim()
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
