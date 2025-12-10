from runpod import serverless
from gtts import gTTS
import base64
from io import BytesIO

def handler(event):
    # Get text from the API request
    input_text = event.get("input", {}).get("text", "")

    if not input_text.strip():
        return {"error": "No text provided"}

    try:
        # Generate audio using gTTS
        tts = gTTS(text=input_text, lang="te", slow=False)
        audio_bytes = BytesIO()
        tts.write_to_fp(audio_bytes)

        # Convert to base64 so API can return it
        audio_base64 = base64.b64encode(audio_bytes.getvalue()).decode("utf-8")

        return {
            "audio_base64": audio_base64,
            "message": "Audio generated successfully"
        }

    except Exception as e:
        return {"error": str(e)}

# Start RunPod serverless
serverless.start({"handler": handler})

