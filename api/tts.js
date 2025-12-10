export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/76h1nrfetqvwu1";
    const API_KEY = process.env.RUNPOD_API_KEY; // SAFE — backend only

    try {
        // 1️⃣ Run TTS job
        const runResponse = await fetch(`${RUNPOD_ENDPOINT}/run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                input: { text }
            })
        });

        const runData = await runResponse.json();
        const jobId = runData.id;

        // 2️⃣ Poll job
        let output = null;

        while (true) {
            const statusResponse = await fetch(`${RUNPOD_ENDPOINT}/status/${jobId}`, {
                headers: { "Authorization": `Bearer ${API_KEY}` }
            });

            const statusData = await statusResponse.json();

            if (statusData.status === "COMPLETED") {
                output = statusData.output;
                break;
            }

            if (statusData.status === "FAILED") {
                return res.status(500).json({ error: "Runpod job failed" });
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 3️⃣ Return audio to frontend
        return res.status(200).json({
            audio_base64: output.audio_base64
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
