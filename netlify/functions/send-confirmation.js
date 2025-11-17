import { sendEmail } from "@netlify/emails";

export default async (event) => {
  // Parse Netlify form submission payload
  const submission = JSON.parse(event.body).payload.data;

  const customerEmail = submission["Customer Email"];
  const customerName = submission["Customer Name"];
  const tier = submission["Package Tier"];

  const albumCoverIncluded = tier === "Paw Deluxe" 
    ? " + album cover artwork"
    : "";

  const html = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#f7f7fc;font-family:Arial, sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">
        
        <div style="background:#5b5fff;padding:22px;text-align:center;color:#ffffff;font-size:22px;font-weight:bold;">
          Your Pet Tracks Order is Confirmed! 🎵🐾
        </div>

        <div style="padding:30px;font-size:16px;color:#333;">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Thank you for ordering from <strong>Pet Tracks</strong>! We’re excited to start creating your personalized pet song${albumCoverIncluded}.</p>

          <p>Here’s what happens next:</p>
          <ul style="margin-left:20px;">
            <li>🎧 We review your pet’s info to match the right style.</li>
            <li>🎶 We generate your custom AI song.</li>
            <li>🎨 If you ordered Paw Deluxe, we create your album cover using the uploaded photo.</li>
            <li>📬 We email your finished creations as soon as they’re ready.</li>
          </ul>

          <p style="margin-top:20px;">If you need to update your info, just reply to this email!</p>

          <p style="margin-top:20px;">
            Warmly,<br/>
            <strong>The Pet Tracks Team</strong><br/>
            pettracksorders@gmail.com
          </p>
        </div>

        <div style="background:#f1f2ff;padding:16px;text-align:center;font-size:13px;color:#666;">
          Follow us on Instagram / TikTok for updates!
        </div>

      </div>
    </body>
  </html>
  `;

  await sendEmail({
    from: "Pet Tracks <no-reply@pettracks.netlify.app>",
    to: customerEmail,
    subject: "Your Pet Tracks Order is Confirmed!",
    html
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "email sent" })
  };
};
