import os
import whisper
import tempfile
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
whisper_model = whisper.load_model("base")

def transcribe_audio(audio_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name
    
    result = whisper_model.transcribe(temp_path)
    os.unlink(temp_path)
    return result["text"].strip()

def speak_response(text: str) -> bytes:
    audio = elevenlabs_client.text_to_speech.convert(
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        text=text[:500],
        model_id="eleven_multilingual_v2",
    )
    audio_bytes = b"".join(audio)
    return audio_bytes