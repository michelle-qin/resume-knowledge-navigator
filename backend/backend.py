# To start the server run
# flask --app backend run --debug

from flask import Flask, jsonify, request, Response, abort

api = Flask(__name__)

@api.route('/query', methods=['GET'])
def paper_search():
    print(request.json)
    doc_id = request.json['doc_id']
    query = request.json['query']
    response = jsonify(query_result)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

@api.route('/gettoc', methods=['GET'])
def get_details():
    # This would be how we take in params from you guys
    # print(request.json)
    # query = request.json['doc_id']
    response = jsonify(metadata)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

@api.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = Response()
        res.headers['X-Content-Type-Options'] = '*'
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Methods'] = '*'
        res.headers['Access-Control-Allow-Headers'] = '*'
        return res

if __name__ == '__main__':
    api.debug = True
    api.run()

query_result = ["list", "of", "question", "Answers"]
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