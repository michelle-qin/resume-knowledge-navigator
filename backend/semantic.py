import os
import requests
import json
from openai import AzureOpenAI
from sql_helpers import get_text_from_id

class backend:
    azure_endpoint = "https://openaiaus.openai.azure.com/"
    azure_api_key = "43e550eeba474206af4d0dff8b06a64e"

    client = AzureOpenAI(azure_endpoint = azure_endpoint, api_key=azure_api_key, api_version="2023-05-15")

    def query_gpt4(self, prompt):
        response = self.client.chat.completions.create(model="gpt4",
                                                messages=[
                                                    {"role": "user", "content": prompt}
                                                    ])
        return response.choices[0].message.content
    
    def get_toc(self, doc_id):
        if doc_id == "mock":
            return self.metadata
        else:
            text = get_text_from_id(doc_id)
            json_text = self.query_gpt4(f"You are a semantic parser. Use the following resume to populate a Json object \n\n Json Schema: {self.schema}\n\ndocument: {text}\nJSON:")
            json_result = json.loads(json_text)
            return json_result

    schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Resume",
  "type": "object",
  "properties": {
    "basic_info": {
      "type": "object",
      "properties": {
        "first_name": {"type": "string"},
        "last_name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "phone": {"type": "string"},
        "linkedin": {"type": "string"},
        "github": {"type": "string"},
        "website": {"type": "string"}
      },
      "required": ["first_name", "last_name", "email"]
    },
    "summary": {"type": "string"},
    "work_experience": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "company": {"type": "string"},
          "position": {"type": "string"},
          "start_date": {"type": "string", "format": "date"},
          "end_date": {"type": "string", "format": "date"},
          "description": {"type": "string"}
        },
        "required": ["company", "position", "start_date"]
      }
    },
    "education": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "institution": {"type": "string"},
          "degree": {"type": "string"},
          "start_date": {"type": "string", "format": "date"},
          "end_date": {"type": "string", "format": "date"},
          "description": {"type": "string"}
        },
        "required": ["institution", "degree", "start_date"]
      }
    },
    "skills": {
      "type": "array",
      "items": {"type": "string"}
    },
    "languages": {
        "type": "array",
        "items": {"type": "string"}
    },
    "hobbies": {
        "type": "array",
        "items": {"type": "string"}
    },
    "references": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "title": {"type": "string"},
          "company": {"type": "string"},
          "contact": {"type": "string"}
        }
      }
    }
  }
}
    
    metadata = {
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "summary": "Accounting professional with twenty years of experience in inventory and manufacturing accounting. Ability to fill in at a moment's notice, quickly mastering new systems, processes and workflows. Take charge attitude, ability to work independently, recommend and implement ideas and process improvements.",
  "workExperience": [
    {
      "company": "Company Name",
      "position": "Accountant",
      "startDate": "04/2011",
      "endDate": "05/2017",
      "description": "Performed general accounting functions, journal entries, reconciliations and accruals. Implemented and oversaw RGA spreadsheet for returns used by customer service, accounting and upper management. Initiated and tracked claim process with carriers for damages. Participated in identifying and executing the company's business process improvement efforts"
    },
    {
      "company": "Company Name",
      "position": "Inventory Control Manager",
      "startDate": "01/2008",
      "endDate": "01/2010",
      "description": "Became an expert user and handled rollout and training of a new ERP system (Syspro). Handled the purchasing and receiving of raw and semi-finished material, tools, supplies. Continuously renegotiated payment terms with suppliers/vendors resulting in improved cash flow"
    },
    {
      "company": "Company Name",
      "position": "Accounting Manager",
      "startDate": "01/1995",
      "endDate": "01/2008",
      "description": "Prepared all relevant documentation and submitted data for auditors during corporate takeover in 2008. Prepared monthly general ledger entries, reconcile G/L accounts to subsidiary journals or worksheets and posted monthly G/L journal. Managed the payroll function which was outsourced to ADP"
    },
    {
      "company": "Company Name",
      "position": "Full Charge Bookkeeper",
      "startDate": "01/1993",
      "endDate": "01/1995",
      "description": ""
    }
  ],
  "education": [
    {
      "school": "Montclair State College",
      "degree": "B.S Business Administration Accounting",
      "fieldOfStudy": "Accounting",
      "startDate": "",
      "endDate": ""
    }
  ],
  "skills": [
    "Microsoft Office Excel",
    "Outlook",
    "Word",
    "SAGE 100",
    "Ramp (WMS software)",
    "Syspro (ERP program)"
  ],
  "languages": [],
  "certifications": []
}

