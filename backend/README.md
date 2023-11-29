# LLM-Webapp

## Setup guide:
TODO: You need to insert an the OpenAI key in backend/openai_helper.py. 

### Backend:

(Optional) Create a conda environment.

```bash
conda create -n llm python=3.9
conda activate llm
```

Install required packages

```bash
pip install requests Flask openai pdfplumber PyMuPDF
```

To start the server run

```bash
flask --app backend run --debug
```
or 
```bash
python3 backend.py
```

If Flask is brokoen, follow setup here https://flask.palletsprojects.com/en/3.0.x/installation/

## API Documentation

### Overall Design
- backend.py: API entrypoint, FE team can reference code here for details
- semantic.py: Code for maintaining the semantic table of contents (ToC)


### API Doc
(let us know if you want it in another location)
```
POST /add_doc
    Expects:
        'pdf_file' in request.files
    Effects:
        Assigns a doc_id for document
        pdf file added to /assets/<doc_id>.pdf
    Returns:
        JSON {'message': 'File successfully uploaded', 'id': doc_id}
```

```
POST /reset
    Expects:
        None
    Effects:
        Resets database for all doc_id
    Returns:
        JSON {'message': 'Reset database'}
```

```
GET /query
    Expects:
        'doc_id', 'query' in request json body
    Effects:
        Q&A returned for given document and question
        pdf file at /assets/<doc_id>.pdf updated with highlight
        ToC updated for doc_id (refresh needed by calling /get_toc)
    Returns:
        JSON for Q&A result
```

```
GET /get_toc
    Expects:
        'doc_id' in request json body
    Returns:
        JSON ToC for the requested document
```