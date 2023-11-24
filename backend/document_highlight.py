import ast
import fitz
import pdfplumber
from openai import AzureOpenAI

# Highlights the relevant sections in the given pdf (given by <pdf_path>) that satisfies the given query.
# Saves the highlighted version in "highlighted_<pdf_path>".
# Returns a python list of highlighted text sections.
# To use, "from document_highlight import return_highlighted_pdf"
def return_highlighted_pdf(pdf_path, query):
    document = ""
    with pdfplumber.open(pdf_path) as pdf:
        document = ""
        for page in pdf.pages:
            text = page.extract_text()
            document += text + "\n\n"
    client = AzureOpenAI(
        api_key = "43e550eeba474206af4d0dff8b06a64e",  
        api_version = "2023-05-15",
        azure_endpoint = "https://openaiaus.openai.azure.com/"
    )
    search_prompt = f"""
    You are acting as an agent that will search through a document for the answer to a request. I will now give you the document.
    Document: "{document}"
    Now, I will give you the request.
    Request: "{query}"
    Given the passage and the request, you must give the list of verbatim citations from the given passage which satisfies the request. Make sure your answer is in this format:
    citation: ["<YOUR FIRST CITATION>", "<YOUR SECOND CITATION>", ... "<YOUR LAST CITATION>"]
    If you cannot find any citations that satisfy the request, just return an empty list like this: citation: []

    I will now give you an example so that you can learn how to do this task. If you are given the following document:
    Document: "Accounting professional with twenty years of experience in inventory and manufacturing accounting. Ability to fill in at a moment's notice, quickly
    mastering new systems, processes and workflows. Take charge attitude, ability to work independently, recommend and implement ideas and
    process improvements.
    Skills
    Microsoft Office Excel, Outlook and Word, SAGE 100, Ramp (WMS software) and Syspro (ERP program)"
    and you are given the following request:
    Request: "Show me what skills this candidate has."
    Then, your answer should be the following in verbatim:
    citation: ["Skills
    Microsoft Office Excel, Outlook and Word, SAGE 100, Ramp (WMS software) and Syspro (ERP program)"]
    Only give the answer in the format that I told you. Do not say anything else extra other than the answer. Do not act as if you are a human. Act as if you are the raw output for a query."""
    response = ""
    while len(response) < 2 or (response[0] != "(" and response[0] != "[" and response[-1] != ")" and response[-1] != "]"):
        response = client.chat.completions.create(
            model = "gpt4",
            temperature = 0,
            messages=[
                {"role": "system", "content": "Assistant is acting as an agent that will search through a document for the answer to a request."},
                {"role": "user", "content": search_prompt}
            ]
        ).choices[0].message.content[10:]
    response = ast.literal_eval(response)
    pdf_document = fitz.open(pdf_path)
    for query in response:
        for page in pdf_document:
            search_results = page.search_for(query)
            for rect in search_results:
                annot = page.add_highlight_annot(rect)
    pdf_document.save(f"highlighted_{pdf_path}")
    pdf_document.close()
    return response

# Example usage:
# print(return_highlighted_pdf("sample.pdf", "Show me where this candidate shows diversity."))