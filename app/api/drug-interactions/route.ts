import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function POST(req: Request) {
  try {
    const { drugs } = await req.json(); // Array of drug names: ["Aspirin", "Warfarin"]
    if (!drugs || drugs.length < 2) return NextResponse.json({ interactions: [] });

    const agent = new https.Agent({ rejectUnauthorized: false, family: 4 });
    const drug1 = encodeURIComponent(drugs[0]);
    const drug2 = drugs[1]; // We search for this text INSIDE drug1's label

    // Search for drug1 and check if drug2 is mentioned in its interaction section
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drug1}"+AND+drug_interactions:"${drug2}"&limit=1`;

    const response = await axios.get(fdaUrl, {
      timeout: 15000,
      httpsAgent: agent,
    });

    if (response.data.results && response.data.results.length > 0) {
      const interactionText = response.data.results[0].drug_interactions?.[0] || "";
      
      return NextResponse.json({
        interactions: [{
          severity: "high",
          description: {
            en: `Potential interaction found: ${interactionText.substring(0, 200)}...`,
            ar: `تم العثور على تداخل محتمل بين ${drugs[0]} و ${drugs[1]}`,
            ku: `گەڕان بۆ کارلێکی دەرمان لە نێوان ${drugs[0]} و ${drugs[1]}`
          }
        }]
      });
    }

    return NextResponse.json({ interactions: [] });

  } catch (error: any) {
    return NextResponse.json({ interactions: [] });
  }
}