// /api/send-email.js
// RESEND SANDBOX MODE — No domain required

export default async function handler(req, res) {

  /* =============================
     CORS for GitHub Pages
     ============================= */
  res.setHeader("Access-Control-Allow-Origin", "https://pettracks.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  /* =============================
     Parse JSON body
     ============================= */
  let data;
  try {
    data = req.body;

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
     STAFF EMAIL
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

  const staffResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Pet Tracks <onboarding@resend.dev>",   // ← Sandbox sender
      to: "sndharrison16@gmail.com",                // Staff email
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
     CUSTOMER CONFIRMATION EMAIL
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

  const customerResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Pet Tracks <onboarding@resend.dev>",  
      to: "sndharrison16@gmail.com",               
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
     SUCCESS
     ============================= */
  return res.status(200).json({ success: true });
}
