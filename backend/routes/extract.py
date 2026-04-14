from fastapi import APIRouter, UploadFile, File, HTTPException
import fitz  # PyMuPDF
from services.groq_client import call_groq
from schemas.models import ExtractionResponse
import json
import io

router = APIRouter()

EXTRACTION_SYSTEM_PROMPT = """
You are an expert medical data extractor. Your task is to analyze text from a medical report (PDF/Image) and extract key information into a structured JSON format.
Focus on:
1. Medications: Name, dosage, frequency, and purpose.
2. Conditions: Diagnosed conditions, their status, and any specific notes.
3. Summary: A brief, patient-friendly summary of the report findings.

Output MUST be a JSON object with the following structure:
{
  "medications": [{"name": "...", "dosage": "...", "frequency": "...", "purpose": "..."}],
  "conditions": [{"condition": "...", "status": "...", "notes": "..."}],
  "summary": "..."
}
"""

@router.post("/report", response_model=ExtractionResponse)
async def extract_medical_report(file: UploadFile = File(...)):
    if not file.content_type in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    try:
        content = await file.read()
        text = ""
        
        if file.content_type == "application/pdf":
            # Extract text from PDF
            doc = fitz.open(stream=content, filetype="pdf")
            for page in doc:
                text += page.get_text()
            doc.close()
        else:
            # Handle images (Note: Basic text extraction for images requires OCR, 
            # for now we'll assume PDF or return an error if OCR is missing.
            # However, for a prototype, we can prompt the user that only PDFs are supported 
            # or try to use a multi-modal model if available.
            # Groq's llama-3.3-70b-versatile is text-only. 
            # We'll stick to PDF for now or throw a clear error.)
            raise HTTPException(status_code=400, detail="Image extraction requires OCR module. Please upload a PDF.")

        if not text.strip():
            return ExtractionResponse(success=False, error="No text found in the document.")

        # Call Groq to structure the data
        try:
            user_prompt = f"Extract medical data from the following text:\n\n{text}"
            groq_result = await call_groq(EXTRACTION_SYSTEM_PROMPT, user_prompt)
            parsed_data = json.loads(groq_result)
            
            if "error" in parsed_data:
                return ExtractionResponse(success=False, error=f"AI Error: {parsed_data['error']}")
                
            return ExtractionResponse(success=True, data=parsed_data)
        except Exception as e:
            print(f"Extraction AI Fallback: {e}")
            return ExtractionResponse(
                success=False, 
                error="The AI analysis part of the extraction failed. The document text was read, but could not be structured."
            )

    except Exception as e:
        print(f"Extraction Error: {e}")
        return ExtractionResponse(success=False, error=str(e))
