import requests
import os
from answer_search import multiple_document_table
from sql_helpers import get_text_from_id

response = requests.post("http://127.0.0.1:5000/reset")
print(response.json())

doc_ids = []

for file in os.listdir("test_data"):
    if file.split(".")[-1] == "pdf":
        with open("test_data/" + file, "rb") as file:
            files = {"pdf_file": file}
            response = requests.post("http://127.0.0.1:5000/add_doc", files=files)
            print(type(response.json()["id"]))
            doc_ids.append(response.json()["id"])
            print(response.json())

# print(doc_ids)
multiple_document_table(doc_ids, "show me where they all went to college")

# print(get_text_from_id(doc_ids[1]))
