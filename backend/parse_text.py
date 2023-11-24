import pdfplumber
import os

def pdf_to_text(pdf_path, text_path):
    with pdfplumber.open(pdf_path) as pdf:
        cur_string = ""
        for page in pdf.pages:
            # Extract text from the current page
            text = page.extract_text()
            cur_string += text + "\n\n"

    with open(text_path, "w") as out_text:
        out_text.write(cur_string)

for folder in os.listdir("data/"):
    if folder[0] != ".":
        for i, file in enumerate(os.listdir("data/" + folder)):
            pdf_to_text(f"data/{folder}/{file}", f"processed_data/{folder}_{i}.txt")