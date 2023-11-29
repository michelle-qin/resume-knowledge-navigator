import fitz
import os
from openai import AzureOpenAI
import ast
import json
from parse_text import pdf_to_text
from sql_helpers import evaluate_query, evaluate_query_blind, get_text_from_id
from openai_helper import get_client

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
param: text (string) the text we want to highlight in the pdf
"""
def add_hyperlink_to_pdf(input_path, output_path, text):
    pdf_document = fitz.open(input_path)
    for page in pdf_document:
        search_results = page.search_for(text)
        for rect in search_results:
            annot = page.add_highlight_annot(rect)
    pdf_document.save(output_path)
    pdf_document.close()


if __name__ == "__main__":

    client = get_client()

    drop_query = """
    DROP TABLE IF EXISTS government_candidates;
    """

    print("Drop previous table")
    evaluate_query("government", drop_query)

    create_query = """
    CREATE TABLE government_candidates (
        name TEXT,
        government_agency TEXT,
        government_agency_citation TEXT,
        university TEXT,
        university_citation TEXT
    );
    """

    print("Clearing then creating table")
    evaluate_query("government", create_query)

    for file in sorted(os.listdir("small_data/")):
        if file[-3:] == "pdf":
            file_name = file.split('.')[0]
            print(file)
            pdf_to_text(f"small_data/{file}", f"small_data/{file_name}.txt")
            with open(f"small_data/{file_name}.txt", "r") as resume:
                document = resume.read()

            gov_request = "Which government agency has this candidate worked for?"

            gov_dict = search_text(document, gov_request)

            university_request = "What university did this candidate attend?"

            university_dict = search_text(document, university_request)

            insert_query = f"""
            INSERT INTO government_candidates (name, government_agency, government_agency_citation, university, university_citation)
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
            evaluate_query_blind("government", insert_query, data)

            # add_hyperlink_to_pdf(pdf_input, json_dict["citation"], f"annotated_{pdf_input}")

            


