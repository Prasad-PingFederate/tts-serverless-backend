export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text } = req.body;

  try {
    const response = await fetch(
      `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/runsync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RUNPOD_API_KEY}`
        },
        body: JSON.stringify({
          input: { text }
        })
      }
    );

    const data = await response.json();

    if (!data.output || !data.output.audio_base64) {
      return res.status(500).json({
        error: "RunPod returned no audio",
        details: data
      });
    }

    return res.status(200).json({
      audio_base64: data.output.audio_base64,
      message: data.output.message || "Audio generated"
    });

  } catch (err) {
    return res.status(500).json({
      error: "Backend error",
      details: err.message
    });
  }
}

