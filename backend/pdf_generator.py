from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

def generate_pdf(data, filename):

    doc = SimpleDocTemplate(filename)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Rapport de Pré-Consultation Médicale", styles['Heading1']))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph(f"Triage : {data['triage']}", styles['Normal']))
    elements.append(Spacer(1, 0.2 * inch))

    for d in data["diagnosis"]:
        elements.append(Paragraph(f"{d['condition']} : {d['probability']}%", styles['Normal']))
        elements.append(Spacer(1, 0.2 * inch))

    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph("⚠ Ceci n'est pas un diagnostic médical.", styles['Normal']))

    doc.build(elements)

