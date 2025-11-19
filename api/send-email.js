// /api/send-email.js
// Vercel serverless function — sends staff & customer emails.
// DOES NOT USE EmailJS. Uses native SMTP relay via Resend.

import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

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

    // -----------------------------
    // STAFF EMAIL
    // -----------------------------
    await resend.emails.send({
      from: "Pet Tracks <orders@pettracks.co>",
      to: "sndharrison16@gmail.com",
      subject: `⭐ New Pet Tracks Order from ${customerName}`,
      html: `
        <h2>New Pet Tracks Order Submitted</h2>

        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>

        <h3>Pet Details</h3>
        <ul>
          <li><strong>Name:</strong> ${petName}</li>
          <li><strong>Pronunciation:</strong> ${petPronounce}</li>
          <li><strong>Species:</strong> ${species}</li>
          <li><strong>Breed:</strong> ${breed}</li>
          <li><strong>Age:</strong> ${age}</li>
          <li><strong>Gender:</strong> ${gender}</li>
          <li><strong>Physical Description:</strong> ${phys}</li>
          <li><strong>Personality Keywords:</strong> ${personality.join(", ")}</li>
          <li><strong>Descriptive Words:</strong> ${descriptors.join(", ")}</li>
          <li><strong>Favorite Things:</strong> ${favThings.join(", ")}</li>
          <li><strong>Special Notes:</strong> ${special}</li>
        </ul>

        <h3>Song Details</h3>
        <p><strong>Genre:</strong> ${genre}</p>
        <p><strong>Song Title:</strong> ${songTitle}</p>
        <p><strong>Song Prompt:</strong><br>${songPrompt}</p>

        <h3>Album Cover</h3>
        <p><strong>Extras:</strong> ${extras}</p>
        <p><strong>Album Prompt:</strong><br>${albumPrompt}</p>

        <p><strong>Uploaded Photo:</strong><br>
        ${photoURL ? `<img src="${photoURL}" width="300"/>` : "None"}
        </p>
      `
    });

    // -----------------------------
    // CUSTOMER EMAIL
    // -----------------------------
    await resend.emails.send({
      from: "Pet Tracks <orders@pettracks.co>",
      to: customerEmail,
      subject: `✨ Your Pet Tracks Order Has Been Received!`,
      html: `
        <h2>Thank you, ${customerName}!</h2>
        <p>We’ve received your Pet Tracks order and our team is already getting to work.</p>

        <p>We’ll email you your song & album cover soon!</p>

        <h3>Your Pet: ${petName}</h3>
        ${photoURL ? `<img src="${photoURL}" width="300"/>` : ""}

        <p>Thanks again for choosing Pet Tracks! 🐾🎶</p>
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ success: false, message: "Email failed", error });
  }
}
