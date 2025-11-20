// /api/send-email.js
// FINAL, CORRECTED VERSION – with CORS + JSON parsing + 2 emails

export default async function handler(req, res) {

  /* =============================
     CORS — REQUIRED FOR GITHUB PAGES
     ============================= */
  res.setHeader("Access-Control-Allow-Origin", "https://pettracks.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  /* =============================
     JSON BODY PARSING — REQUIRED
     ============================= */
  let data;

  try {
    data = req.body;

    // If Vercel didn't parse JSON, parse it manually
    if (!data || typeof data !== "object") {
      const raw = await new Promise(resolve => {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => resolve(body));
      });
      data = JSON.parse(raw);
    }

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
      error: err.message
    });
  }

  /* =============================
     BUILD STAFF EMAIL CONTENT
     ============================= */
  const staffMessage = `
New Pet Tracks Order  
---------------------

Customer: ${data.customerName}
Email: ${data.customerEmail}

Pet Name: ${data.petName}
Pronunciation: ${data.petPronounce}
Species: ${data.species}
Breed: ${data.breed}
Age: ${data.age}
Gender: ${data.gender}

Physical Description: ${data.phys}

Personality: ${data.personality.join(", ")}
Descriptors: ${data.descriptors.join(", ")}
Favorite Things: ${data.favThings.join(", ")}

Special Notes: ${data.special}

Genre: ${data.genre}
Song Title: ${data.songTitle}
Extras: ${data.extras}

Song Prompt:
${data.songPrompt}

Album Prompt:
${data.albumPrompt}

Photo URL:
${data.photoURL}
  `;

  /* =============================
     SEND STAFF EMAIL (via Resend)
     ============================= */
  const staffResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Pet Tracks <orders@pettracks.app>",
      to: "sndharrison16@gmail.com",
      subject: `New Pet Tracks Order: ${data.petName}`,
      text: staffMessage
    })
  });

  const staffJson = await staffResp.json();

  if (!staffJson.id) {
    return res.status(500).json({
      success: false,
      message: "Staff email failed",
      details: staffJson
    });
  }

  /* =============================
     BUILD CUSTOMER CONFIRMATION EMAIL
     ============================= */
  const customerMessage = `
Hi ${data.customerName}! 👋

Thank you for your Pet Tracks order! Your custom project is now being created.

Order Summary:
• Pet Name: ${data.petName}
• Song Genre: ${data.genre}
• Song Title: ${data.songTitle || "(none)"} 
• Album Cover Extras: ${data.extras || "(none)"}

We’ll email your completed track and artwork as soon as they’re ready!

– The Pet Tracks Team 🎵🐾
  `;

  /* =============================
     SEND CUSTOMER EMAIL
     ============================= */
  const customerResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Pet Tracks <orders@pettracks.app>",
      to: data.customerEmail,
      subject: "Your Pet Tracks Order Is Confirmed! 🎵🐾",
      text: customerMessage
    })
  });

  const customerJson = await customerResp.json();

  if (!customerJson.id) {
    return res.status(500).json({
      success: false,
      message: "Customer confirmation email failed",
      details: customerJson
    });
  }

  /* =============================
     SUCCESS — BOTH EMAILS SENT
     ============================= */
  return res.status(200).json({ success: true });
}
