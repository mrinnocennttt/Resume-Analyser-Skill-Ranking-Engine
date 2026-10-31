"""
Generates physical PDF and DOCX sample resume files for real file upload testing.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import docx
from app.data.sample_resumes import SAMPLE_CANDIDATES

def generate_pdf(candidate, output_path):
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1e293b'),
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b')
    )
    
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    story = []
    
    # Title & Contact
    story.append(Paragraph(f"<b>{candidate['name']}</b>", title_style))
    contact_str = f"{candidate['email']} | {candidate['phone']} | {candidate['linkedin']} | {candidate['github']}"
    story.append(Paragraph(contact_str, subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=6, spaceAfter=8))

    lines = candidate['raw_text'].split('\n')
    for line in lines[3:]:
        line_s = line.strip()
        if not line_s:
            story.append(Spacer(1, 4))
            continue
        if line_s.endswith(':') and len(line_s) < 35:
            story.append(Paragraph(f"<b>{line_s}</b>", heading_style))
        elif line_s.startswith('- '):
            story.append(Paragraph(f"• {line_s[2:]}", body_style))
        elif '|' in line_s and ('20' in line_s or 'Present' in line_s):
            story.append(Paragraph(f"<b>{line_s}</b>", body_style))
        else:
            story.append(Paragraph(line_s, body_style))

    doc.build(story)
    print(f"Generated PDF: {output_path}")

def generate_docx(candidate, output_path):
    doc = docx.Document()
    doc.add_heading(candidate['name'], level=1)
    
    contact_p = doc.add_paragraph()
    contact_p.add_run(f"{candidate['email']} | {candidate['phone']}\n{candidate['linkedin']}")
    
    lines = candidate['raw_text'].split('\n')
    for line in lines[3:]:
        line_s = line.strip()
        if not line_s:
            continue
        if line_s.endswith(':') and len(line_s) < 35:
            doc.add_heading(line_s[:-1], level=2)
        elif line_s.startswith('- '):
            doc.add_paragraph(line_s[2:], style='List Bullet')
        else:
            doc.add_paragraph(line_s)

    doc.save(output_path)
    print(f"Generated DOCX: {output_path}")

def main():
    target_dir = os.path.join(os.path.dirname(__file__), "sample_files")
    os.makedirs(target_dir, exist_ok=True)
    
    for cand in SAMPLE_CANDIDATES:
        fname = cand["filename"]
        out_path = os.path.join(target_dir, fname)
        if fname.endswith(".pdf"):
            generate_pdf(cand, out_path)
        elif fname.endswith(".docx"):
            generate_docx(cand, out_path)

if __name__ == "__main__":
    main()
