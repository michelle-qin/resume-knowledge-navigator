from flask import Flask, jsonify, request, Response, abort
import semantic

api = Flask(__name__)
client = semantic.backend()

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
    doc_id = request.json['doc_id']
    response = jsonify(client.get_toc(doc_id))
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
