// /api/send-email.js
import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      customerName,
      customerEmail,
      petName,
      petPronounce,
      species,
      breed,
      age,
      gender,
      phys,
      personality,
      descriptors,
      favThings,
      special,
      genre,
      songTitle,
      extras,
      songPrompt,
      albumPrompt,
      photoURL
    } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    // ============================================
    // 1) SEND STAFF EMAIL (full order + prompts)
    // ============================================
    await resend.emails.send({
      from: "Pet Tracks <orders@pettracks.app>",
      to: "sndharrison16@gmail.com",
      subject: `New Pet Tracks Order: ${petName}`,
      html: `
        <h2>New Pet Tracks Order</h2>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>

        <h3>Pet Info</h3>
        <p><strong>Name:</strong> ${petName} (${petPronounce})</p>
        <p><strong>Species:</strong> ${species}</p>
        <p><strong>Breed:</strong> ${breed}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Physical Description:</strong> ${phys}</p>
        <p><strong>Personality:</strong> ${personality.join(", ")}</p>
        <p><strong>Descriptive Words:</strong> ${descriptors.join(", ")}</p>
        <p><strong>Favorite Things:</strong> ${favThings.join(", ")}</p>
        <p><strong>Special Notes:</strong> ${special}</p>

        <h3>Song Preferences</h3>
        <p><strong>Genre:</strong> ${genre}</p>
        <p><strong>Song Title:</strong> ${songTitle || "Not provided"}</p>
        <p><strong>Extra Elements:</strong> ${extras || "None"}</p>

        <h3>Generated Song Prompt</h3>
        <pre>${songPrompt}</pre>

        <h3>Generated Album Prompt</h3>
        <pre>${albumPrompt}</pre>

        <h3>Photo Upload</h3>
        <p>${photoURL ? `<a href="${photoURL}" target="_blank">View Uploaded Photo</a>` : "No photo uploaded"}</p>
      `
    });

    // ============================================
    // 2) SEND CUSTOMER CONFIRMATION EMAIL
    // ============================================
    await resend.emails.send({
      from: "Pet Tracks <orders@pettracks.app>",
      to: customerEmail,
      subject: `Your Pet Tracks Order is Confirmed! 🐾🎵`,
      html: `
        <h2>Thank You for Your Order!</h2>
        <p>We're excited to start creating <strong>${petName}'s</strong> custom track and album cover (if selected).</p>

        <h3>Order Summary</h3>
        <p><strong>Pet:</strong> ${petName} (${species}, ${breed})</p>
        <p><strong>Selected Genre:</strong> ${genre}</p>
        <p><strong>Song Title:</strong> ${songTitle || "Not provided"}</p>

        <p>Your song + artwork will be emailed soon!</p>
        <p>Thank you for choosing <strong>Pet Tracks</strong> 🎵🐾</p>
      `
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Resend Error", err);
    return res.status(500).json({ error: "Failed to send email", details: err });
  }
}
