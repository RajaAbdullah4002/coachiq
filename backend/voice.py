import os
import sys
import whisper
import tempfile
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

# Force ffmpeg path
import glob
ffmpeg_search = glob.glob(os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Microsoft/WinGet/Packages/**/ffmpeg.exe'), recursive=True)
if ffmpeg_search:
    ffmpeg_dir = os.path.dirname(ffmpeg_search[0])
    os.environ['PATH'] = ffmpeg_dir + os.pathsep + os.environ.get('PATH', '')

elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
whisper_model = whisper.load_model("base")

def transcribe_audio(audio_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name
    
    try:
        print(f"File exists: {os.path.exists(temp_path)}, size: {os.path.getsize(temp_path)}")
        result = whisper_model.transcribe(temp_path)
        return result["text"].strip()
    except Exception as e:
        import traceback
        print(f"FULL ERROR: {traceback.format_exc()}")
        raise
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

def speak_response(text: str) -> bytes:
    audio = elevenlabs_client.text_to_speech.convert(
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        text=text[:500],
        model_id="eleven_multilingual_v2",
    )
    audio_bytes = b"".join(audio)
    return audio_bytes