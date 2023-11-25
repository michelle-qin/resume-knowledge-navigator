import pdfplumber
import os

def pdf_to_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        cur_string = ""
        for page in pdf.pages:
            # Extract text from the current page
            text = page.extract_text()
            cur_string += text + "\n\n"

    return cur_string
