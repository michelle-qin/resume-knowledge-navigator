from flask import Flask, jsonify, request, Response, abort, send_from_directory
import semantic
import sqlite3
import os
import shutil
from sql_helpers import add_pdf_to_table
from parse_text import pdf_to_text
from document_highlight import return_highlighted_pdf
from flask_cors import CORS, cross_origin

api = Flask(__name__)
client = semantic.backend()
CORS(api)


@api.route("/add_doc", methods=["POST"])
def add_doc():
    try:
        if "pdf_file" not in request.files:
            return jsonify({"message": "No file included in request"}), 400

        file = request.files["pdf_file"]

        # Check if the file is a PDF (optional, but recommended)
        if file and file.filename.endswith(".pdf"):
            print(file.filename)
            # Process the file, for example, save it to a directory
            root_path = os.path.abspath("..")
            be_path = os.path.join(root_path, "backend")
            pdf_path = os.path.join(be_path, "pdf")
            file_path = os.path.join(pdf_path, file.filename)

            # Make sure directories exist before saving
            os.makedirs(pdf_path, exist_ok=True)

            file.save(file_path)
            doc_id = add_pdf_to_table(file_path)

            assets_path = os.path.join(root_path, "assets")
            target_path = os.path.join(assets_path, f"{doc_id}.pdf")

            # Make sure directories exist before saving
            os.makedirs(assets_path, exist_ok=True)

            if os.path.isfile(target_path):
                os.remove(target_path)
            shutil.copy(file_path, target_path)

            return jsonify({"message": "File successfully uploaded", "id": doc_id}), 200
        else:
            return jsonify({"message": "Invalid file format. Needs to be a pdf"}), 400
    except Exception as e:
        print("ERROR: ", e)
        return jsonify({"message": str(e)}), 500


@api.route("/reset", methods=["POST"])
def reset_db():

    for filename in os.listdir("pdf"):
        file_path = os.path.join("pdf", filename)
        os.unlink(file_path)

    conn = sqlite3.connect("file_table.db")
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
    return jsonify({"message": "Reset database"}), 200


@api.route("/query", methods=["GET"])
def paper_search():
    print(request.json)
    doc_id = request.json['doc_id']
    query = request.json['query']
    citations = return_highlighted_pdf(doc_id, query)
    response = jsonify({"message":"Query was successful", "citations": citations})
    doc_id = request.json["doc_id"]
    query = request.json["query"]
    response = jsonify(return_highlighted_pdf(doc_id, query))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200


@api.route("/get_toc", methods=["GET"])
def get_toc():
    doc_id = request.json["doc_id"]
    response = jsonify(client.get_toc(doc_id))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@api.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = Response()
        res.headers["X-Content-Type-Options"] = "*"
        res.headers["Access-Control-Allow-Origin"] = "*"
        res.headers["Access-Control-Allow-Methods"] = "*"
        res.headers["Access-Control-Allow-Headers"] = "*"
        return res


@api.route("/pdf/<filename>")
def serve_pdf(filename):
    return send_from_directory(
        "/Users/michelleqin/Documents/resumes-knowledge-navigator/backend/pdf",
        filename,
    )


if __name__ == "__main__":
    api.debug = True
    api.run()
