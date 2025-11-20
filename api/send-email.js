export default async function handler(req, res) {

  /* =============================
     CORS — REQUIRED FOR GITHUB PAGES
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

  try {
    const data = req.body;

    /* =============================
       FORMAT STAFF EMAIL
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

Uploaded Photo URL:
${data.photoURL}
    `;

    /* =============================
       SEND STAFF EMAIL
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
      return res.status(500).json({ success: false, error: "Failed to send staff email", details: staffJson });
    }


    /* =============================
       FORMAT CUSTOMER CONFIRMATION EMAIL
       ============================= */
    const customerMessage = `
Hi ${data.customerName}! 👋

Thank you for your Pet Tracks order! Your custom project is officially in the works.

Here’s a quick summary of what you submitted:

Pet Name: ${data.petName}
Song Genre: ${data.genre}
Song Title: ${data.songTitle || "(none)"}
Album Cover Extras: ${data.extras || "(none)"}

We’ll begin creating your pet’s personalized song and artwork.  
You’ll receive your finished files at this email address.

If we need anything, we’ll reach out!

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
        subject: "Your Pet Tracks Order Confirmation 🎵🐾",
        text: customerMessage
      })
    });

    const customerJson = await customerResp.json();
    if (!customerJson.id) {
      return res.status(500).json({ success: false, error: "Failed to send customer confirmation email", details: customerJson });
    }

    /* =============================
       IF BOTH EMAILS SUCCEEDED
       ============================= */
    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
