import json
import sqlite3


def get_text_from_id(id):
    conn = sqlite3.connect('file_table.db')
    cursor = conn.cursor()
    # Insert a new row into the table
    cursor.execute(f"SELECT content FROM documents where id={id}")
    conn.commit()


    res = cursor.fetchall()

    conn.commit()

    cursor.close()
    conn.close()
    return res[0][0]

def get_path_from_id(id):
    conn = sqlite3.connect('file_table.db')
    cursor = conn.cursor()
    # Insert a new row into the table
    cursor.execute(f"SELECT path FROM documents where id={id}")
    conn.commit()


    res = cursor.fetchall()

    conn.commit()

    cursor.close()
    conn.close()
    return res[0][0]


create_query = """
CREATE TABLE government_accountants (
    name TEXT,
    government_agency TEXT,
    government_agency_citation TEXT,
    university TEXT,
    university_citation TEXT
);
"""

def evaluate_query_return(db_name, query):
    conn = sqlite3.connect(f'{db_name}.db')

    cur = conn.cursor()

    cur.execute(query)
    res = cur.fetchall()

    conn.commit()

    cur.close()
    conn.close()
    return res


def evaluate_query(db_name, query):
    conn = sqlite3.connect(f'{db_name}.db')

    cur = conn.cursor()

    cur.execute(query)

    conn.commit()

    cur.close()
    conn.close()

def evaluate_query_blind(db_name, query, data):
    conn = sqlite3.connect(f'{db_name}.db')

    cur = conn.cursor()

    cur.execute(query, data)

    conn.commit()

    cur.close()
    conn.close()

def get_columns_and_types(db_name, table_name):
    conn = sqlite3.connect(f'{db_name}.db')

    # Create a cursor object
    cursor = conn.cursor()

    # Fetch column names and data types
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = cursor.fetchall()
    column_to_type = {}
    for column in columns:
        column_to_type[column[1]] = column[2]
    return column_to_type

if __name__ == "__main__":
    try:
        evaluate_query("government", create_query)
    except:
        print("Table already exists")
    # column_to_type = get_columns_and_types("squad_parsing", "squad_f1_scores")
    # print(column_to_type)