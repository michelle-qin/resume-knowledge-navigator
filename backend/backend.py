from flask import Flask, jsonify, request, Response, abort
import semantic
import sqlite3
from parse_text import pdf_to_text

api = Flask(__name__)
client = semantic.backend()

def add_pdf_to_table(path):
    conn = sqlite3.connect('file_table.db')
    cursor = conn.cursor()

    content = pdf_to_text(path)

    # Insert a new row into the table
    cursor.execute("INSERT INTO documents (content, path) VALUES (?, ?)", (content, path))
    conn.commit()

    # Retrieve the ID of the newly inserted row
    inserted_id = cursor.lastrowid

    cursor.close()
    conn.close()
    return inserted_id

@api.route('/set_paper', methods=['POST'])
def set_paper():
    if 'pdf_file' not in request.files:
        return jsonify({'message': 'No file included in request'}), 400

    file = request.files['pdf_file']

    # Check if the file is a PDF (optional, but recommended)
    if file and file.filename.endswith('.pdf'):
        # Process the file, for example, save it to a directory
        file.save('pdfs/' + file.filename)
        new_id = add_pdf_to_table('pdfs/' + file.filename)

        return jsonify({'message': 'File successfully uploaded', 'id': new_id}), 200
    else:
        return jsonify({'message': 'Invalid file format. Needs to be a pdf'}), 400

@api.route('/reset', methods=['POST'])
def reset_db():
    conn = sqlite3.connect('file_table.db')
    cursor = conn.cursor()

    create_statement = """
    CREATE TABLE "documents" (
        "id"	INTEGER,
        "content"	TEXT,
        "path"	TEXT,
        PRIMARY KEY("id" AUTOINCREMENT)
    )    
    """

    # Insert a new row into the table
    cursor.execute("DROP TABLE documents")
    cursor.execute(create_statement)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Reset database'}), 200

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
