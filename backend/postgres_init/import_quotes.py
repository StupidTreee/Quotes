import os
import json
import psycopg2

DB_PARAMS = {
    "dbname": "quotes",
    "user": "quoteuser",
    "password": "secret",
    "host": "localhost",
    "port": 5432,
}

def insert_quotes(file_path, table_name):
    with open(file_path, "r", encoding="utf-8") as f:
        quotes = json.load(f)

    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()

    for quote in quotes:
        message = quote["message"]
        timestamp = quote["timestamp"]

        cur.execute(
            f"""
            INSERT INTO {table_name} (message, timestamp)
            VALUES (%s, %s)
            """,
            (message, timestamp)
        )

    conn.commit()
    cur.close()
    conn.close()
    print(f"{len(quotes)} quotes imported into {table_name}")

if __name__ == "__main__":
    schueler_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schueler_filtered.json")
    lehrer_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lehrer_filtered.json")

    insert_quotes(schueler_file_path, "schueler_quotes")
    insert_quotes(lehrer_file_path, "lehrer_quotes")
