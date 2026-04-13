from reportlab.pdfgen import canvas
import os

def create_sample_pdf(filename, content):
    os.makedirs("rag/guidelines", exist_ok=True)
    path = os.path.join("rag/guidelines", filename)
    c = canvas.Canvas(path)
    text = c.beginText(40, 750)
    text.setFont("Helvetica", 10)
    
    # Split content by lines to fit on page
    for line in content.split('\n'):
        text.textLine(line)
    
    c.drawText(text)
    c.save()
    print(f"Created {path}")

# Cardio Guidelines
create_sample_pdf("who_cardiovascular.pdf", """
WHO Cardiovascular Disease Management Guidelines
Cardiovascular diseases (CVDs) are the leading cause of death globally.
Risk factors include high blood pressure, high cholesterol, tobacco use, and physical inactivity.
Statin therapy is recommended for patients with a 10-year CVD risk > 20%.
Blood pressure targets for adults with hypertension are generally < 140/90 mmHg.
Chest pain and breathlessness are critical signals for cardiac events.
""")

# Diabetes Guidelines
create_sample_pdf("icmr_diabetes_2022.pdf", """
ICMR Guidelines for Management of Type 2 Diabetes 2022
Diabetes management requires a combination of lifestyle changes and pharmacological therapy.
Metformin is the first-line medication for most patients.
HbA1c target should be individualized, but generally < 7.0%.
Frequent monitoring of blood glucose is essential for patients on insulin.
Complications include neuropathy, retinopathy, and chronic kidney disease.
""")

# Hypertension Guidelines
create_sample_pdf("who_hypertension.pdf", """
WHO Guidelines for the Pharmacological Treatment of Hypertension in Adults
Hypertension is defined as systolic BP > 140 mmHg and/or diastolic BP > 90 mmHg.
First-line agents include ACE inhibitors, ARBs, CCBs, and thiazide-type diuretics.
Lifestyle interventions: reduce salt intake, increase potassium, limit alcohol.
Regular follow-up is required every 3-6 months once BP is controlled.
""")
