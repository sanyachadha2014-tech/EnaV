import os
import json
import logging
from typing import List, Dict, Tuple, Optional
import httpx

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

SYSTEM_INSTRUCTION = """You are an emergency response dispatcher AI assistant.
Your task is to analyze the reporter's raw text and extract:
1. A concise 1-2 line factual summary of what occurred.
2. A list of 3-5 important factual keywords.

CRITICAL ANTI-HALLUCINATION RULES:
- Do NOT invent injuries or medical conditions.
- Do NOT invent number of people or casualties.
- Do NOT invent severity levels.
- Do NOT invent a location or address not present in the text.
- Do NOT invent causes of the incident.
- Do NOT invent any facts that were not explicitly stated by the user.
- If information is missing, do not assume or embellish it.
- Keep the summary strictly factual, neutral, and faithful to the user's report.
- Format your response ONLY as valid JSON with keys: "summary" (string) and "keywords" (list of strings).
"""

def _extract_keywords_fallback(text: str) -> List[str]:
    """Simple heuristic keyword extraction for fallback when AI is unavailable."""
    words = [w.strip(".,!?;:()[]\"'") for w in text.split()]
    stopwords = {
        "there", "is", "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or",
        "i", "we", "can", "see", "it", "my", "near", "from", "please", "help", "some",
        "are", "was", "were", "with", "by", "that", "this", "our", "have", "has", "had"
    }
    meaningful = [w.lower() for w in words if len(w) > 3 and w.lower() not in stopwords]
    unique_words = []
    for w in meaningful:
        if w not in unique_words:
            unique_words.append(w)
    return unique_words[:5] if unique_words else ["emergency report"]

def _summary_fallback(text: str, category: str) -> Tuple[str, List[str]]:
    """Graceful fallback summary when Gemini is not configured or unavailable."""
    cleaned = text.strip()
    if not cleaned:
        summary = f"Reported {category.lower()} emergency. Citizen awaiting assistance."
    elif len(cleaned) <= 120:
        summary = cleaned
    else:
        sentences = cleaned.split(". ")
        summary = sentences[0].strip()
        if not summary.endswith("."):
            summary += "."
    
    keywords = _extract_keywords_fallback(cleaned)
    return summary, keywords

async def analyze_emergency_description(
    raw_text: str,
    emergency_category: str
) -> Tuple[str, List[str]]:
    """
    Uses Gemini AI (backend-only) to produce a 1-2 line summary and keywords.
    Falls back gracefully to raw text processing if Gemini is unconfigured or errors.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        logger.info("GEMINI_API_KEY not configured. Using local fallback summarization.")
        return _summary_fallback(raw_text, emergency_category)

    prompt = f"""Emergency Category Selected by Reporter: {emergency_category}
Raw Reporter Description:
"{raw_text}"

Extract:
1. "summary": 1-2 line factual summary of what happened based strictly on the user text.
2. "keywords": 3-5 important factual keywords extracted from the user text.

Return strictly a JSON object:
{{"summary": "...", "keywords": ["...", "..."]}}
"""

    payload = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "topP": 0.8,
            "responseMimeType": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={api_key}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
                return _summary_fallback(raw_text, emergency_category)

            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return _summary_fallback(raw_text, emergency_category)

            content_parts = candidates[0].get("content", {}).get("parts", [])
            if not content_parts:
                return _summary_fallback(raw_text, emergency_category)

            raw_json_str = content_parts[0].get("text", "{}").strip()
            # Clean possible markdown wrapping
            if raw_json_str.startswith("```json"):
                raw_json_str = raw_json_str[7:]
            if raw_json_str.startswith("```"):
                raw_json_str = raw_json_str[3:]
            if raw_json_str.endswith("```"):
                raw_json_str = raw_json_str[:-3]
            raw_json_str = raw_json_str.strip()

            parsed = json.loads(raw_json_str)
            summary = parsed.get("summary", "").strip()
            keywords = parsed.get("keywords", [])

            if not summary:
                summary, _ = _summary_fallback(raw_text, emergency_category)
            if not keywords or not isinstance(keywords, list):
                keywords = _extract_keywords_fallback(raw_text)

            return summary, [str(k) for k in keywords]

    except Exception as exc:
        logger.error(f"Error calling Gemini API: {exc}. Falling back gracefully.")
        return _summary_fallback(raw_text, emergency_category)
