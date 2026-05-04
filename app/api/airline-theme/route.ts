import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export async function POST(request: NextRequest) {
  const { airline } = await request.json()
  if (!airline?.trim()) {
    return NextResponse.json({ error: 'Missing airline name' }, { status: 400 })
  }

  const prompt = `What are the official brand colors and website for the airline "${airline}"?

Return ONLY valid JSON, no markdown, no explanation:
{"primaryColor":"#RRGGBB","accentColor":"#RRGGBB","websiteDomain":"example.com","airlineName":"Official Name"}

Rules:
- primaryColor: most prominent/recognisable brand color
- accentColor: secondary brand color (use a darker/lighter variant if only one color)
- websiteDomain: the airline's main website domain without https:// (e.g. cathaypacific.com)
- airlineName: the official full airline name
- Use your knowledge of the airline's visual identity. If truly unknown return empty strings.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    const data = JSON.parse(match[0])
    return NextResponse.json({
      success:      true,
      primaryColor: data.primaryColor || '#2563eb',
      accentColor:  data.accentColor  || '#1e40af',
      logoUrl:      `https://logo.clearbit.com/${data.websiteDomain}`,
      airlineName:  data.airlineName  || airline,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
