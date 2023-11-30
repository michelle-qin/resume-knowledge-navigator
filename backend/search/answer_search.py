import fitz
import os
from openai import AzureOpenAI
import ast
import json
from parse_text import pdf_to_text
from sql_helpers import evaluate_query, evaluate_query_blind, get_text_from_id, get_path_from_id

# Identifies the relevant sections in the given pdf (given by the doc_id) that satisfies the given query.
# Saves the highlighted version in "highlighted_<pdf_path>".
# Returns a json object containing a list of text sections relevant to the query.
# To use, "from answer_search import return_citations"
def return_citations(doc_id, query):
    document = get_text_from_id(doc_id)

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
    Given the passage and the request, you must give the list of verbatim citations from the given passage which satisfies the request. Make sure your answer is in this json format:
    {{
        "citation": ["<YOUR FIRST CITATION>", "<YOUR SECOND CITATION>", ... "<YOUR LAST CITATION>"]
    }}
    
    If you cannot find any citations that satisfy the request, just return an empty list like this:
    
    {{
        "citation": []
    }}

    I will now give you an example so that you can learn how to do this task. If you are given the following document:
    Document: "Accounting professional with twenty years of experience in inventory and manufacturing accounting. Ability to fill in at a moment's notice, quickly
    mastering new systems, processes and workflows. Take charge attitude, ability to work independently, recommend and implement ideas and
    process improvements.
    Skills
    Microsoft Office Excel, Outlook and Word, SAGE 100, Ramp (WMS software) and Syspro (ERP program)"
    and you are given the following request:
    Request: "Show me what skills this candidate has."
    Then, your answer should be the following in verbatim:

    {{
        "citation": ["Skills\n Microsoft Office Excel, Outlook and Word, SAGE 100, Ramp (WMS software) and Syspro (ERP program)"]
    }} 
    Only give the answer in the format that I told you. Do not say anything else extra other than the answer. Do not act as if you are a human. Act as if you are the raw output for a query."""
    response = client.chat.completions.create(
        model = "gpt4",
        temperature = 0,
        messages=[
            {"role": "system", "content": "Assistant is acting as an agent that will search through a document for the answer to a request."},
            {"role": "user", "content": search_prompt}
        ]
    ).choices[0].message.content

    try:
        json_dict = json.loads(response)
    except:
        raise ValueError("The LLM outputted a non-json-formattable string. Contact Thomas/Daniel to work this out.")

    return json_dict

"""
This function will search the text for the answer to a given question.

param: doc_id (int) the unique id allowing us to find the processed text and pdf filename in the file_table->documents sql table
param: question (string) the question we are trying to answer.
return: dictionary with two fields
    1. Answer which is the answer to the question
    2. Citation which is the verbatim text supporting it

"""
def search_text(doc_id, question):
    document = get_text_from_id(doc_id)

    search_prompt = f"""
    You are acting as an agent that will search through a document for the answer to a request. I will now give you the document.
    Document: "{document}"
    Now, I will give you the request.
    Request: "{question}"
    Given the passage and the request, you must give the verbatim citation from the given passage which satisfies the request. If the information is not explicitly shown in the text just put "None". Make sure your answer is in this format:
    {{
        "answer": "<YOUR ANSWER>",
        "citation": "<YOUR CITATION>",
    }}

    I will now give you an example so that you can learn how to do this task. If you are given the following document:
    Document: "ADULT EDUCATION INSTRUCTOR
    Experience
    Company Name City , State Adult Education Instructor 08/2016 to Current Developed a diploma program that fit the needs of the community,
    continues to work with the community and wants to see the students succeed move on into either industry or collegeÂ
    Company Name City , State Agriculture/Credit Recovery Teacher 08/2000 to Current
    Planned and conducted activities for a balanced program of instruction, demonstration, and work time that provided students with
    opportunities to observe, question, and investigate.
    Goal Setting Established clear objectives for all lessons/projects and communicated with students, achieving a total understanding of grading
    rubric and overall class expectations."
    and you are given the following request:
    Request: "What was the title of their most recent job?"
    Then, your answer should be:
    {{
        "answer": "Adult Education Instructor",
        "citation": "Company Name City , State Adult Education Instructor 08/2016 to Current Developed a diploma program that fit the needs of the community,
    continues to work with the community and wants to see the students succeed move on into either industry or collegeÂ"
    }}

    Here's another example:
    Request: "Show me their accounting experience."
    Then, your answer should be:
    {{
        "answer": "None",
        "citation": "None">
    }}

    Only give the answer in the format that I told you. Do not say anything else extra other than the answer. Do not act as if you are a human. Act as if you are the raw output for a query.
    """

    response = client.chat.completions.create(
        model = "gpt4",
        temperature = 0,
        messages=[
            {"role": "system", "content": "Assistant is acting as an agent that will search through a document for the answer to a request."},
            {"role": "user", "content": search_prompt}
        ]
    )
    response = response.choices[0].message.content

    try:
        json_dict = json.loads(response)
    except:
        raise ValueError("The LLM outputted a non-json-formattable string. Contact Thomas/Daniel to work this out.")

    return json_dict

"""
This code will add a highlight to a pdf given a piece of text that the LLM has searched for.

param: input_path (string) the path to the pdf file we will be highlighting
param: output_path (string) the path that we want to save the highlighted pdf to
param: sections (List[string]) the list of text sections we want to highlight in the pdf
"""
def add_hyperlinks_to_pdf(input_path, output_path, sections):
    pdf_document = fitz.open(input_path)
    for query in sections:
        for page in pdf_document:
            search_results = page.search_for(query)
            for rect in search_results:
                annot = page.add_highlight_annot(rect)
    pdf_document.save(output_path)
    pdf_document.close()


def populate_table_from_multiple_documents(schema, table, field, query, doc_ids):

    client = AzureOpenAI(
        api_key = "43e550eeba474206af4d0dff8b06a64e",  
        api_version = "2023-05-15",
        azure_endpoint = "https://openaiaus.openai.azure.com/"
    )

    for doc_id in doc_ids:
        document = get_text_from_id(doc_id)

        response_dict = search_text(document, query)

        insert_query = f"""
        INSERT INTO {table} (name, government_agency, government_agency_citation, university, university_citation)
        VALUES (?, ?, ?, ?, ?);
        """

        data = (
            file_name,
            gov_dict["answer"],
            gov_dict["citation"],
            university_dict["answer"],
            university_dict["citation"],
        )

        print(insert_query)
        evaluate_query_blind(schema, insert_query, data)
            


