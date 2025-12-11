from runpod import serverless
from gtts import gTTS
import base64
from io import BytesIO

def handler(event):
    text = event.get("input", {}).get("text", "")

    if not text or not text.strip():
        return { "error": "No text provided" }

    try:
        tts = gTTS(text=text, lang="te", slow=False)
        audio_bytes = BytesIO()
        tts.write_to_fp(audio_bytes)

        audio_base64 = base64.b64encode(audio_bytes.getvalue()).decode("utf-8")

        # IMPORTANT: return inside "output" wrapper so runsync returns it correctly
        return {
            "output": {
                "audio_base64": audio_base64
            },
            "message": "Audio generated successfully"
        }

    except Exception as e:
        # return error message so we can see it in RunPod logs
        return { "error": str(e) }

serverless.start({ "handler": handler })


