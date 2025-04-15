import json
from datetime import datetime

# read json file (name hardcoded)
with open("schueler_raw.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# extract only messages
messages = raw_data.get("messages", [])

filtered = []

for msg in messages:
    message_text = msg.get("content", "").strip()
    timestamp_str = msg.get("timestamp")
    
    if not message_text or not timestamp_str:
        continue  # skip empty

    # ISO-timestamp to unix timestamp
    try:
        dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        unix_timestamp = int(dt.timestamp())
    except ValueError:
        continue  # in case timestamp is corrupt

    # only msg and timestamp
    filtered.append({
        "message": message_text,
        "timestamp": unix_timestamp
    })

# save output
with open("filtered_output.json", "w", encoding="utf-8") as f:
    json.dump(filtered, f, ensure_ascii=False, indent=2)

print("Export erfolgreich: filtered_output.json")
