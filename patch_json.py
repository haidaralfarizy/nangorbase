import json

with open("data/places.json", "r") as f:
    places = json.load(f)

for p in places:
    # Normalize facilities and phone
    if "facilities" not in p:
        p["facilities"] = []
    if "phone" not in p:
        p["phone"] = None

    # Transform string hours to JSON hours
    old_hours = p.get("hours", "")
    if isinstance(old_hours, str):
        old_str = old_hours.lower()
        new_hours = {
            "is_24_hours": False,
            "schedule": {}
        }
        
        if "24 jam" in old_str or "00.00–24.00" in old_str:
            new_hours["is_24_hours"] = True
            for day in range(7):
                new_hours["schedule"][str(day)] = {"open": "00:00", "close": "23:59"}
        else:
            # Example parsing for "Sen–Sab 06.00–21.00"
            if "sen–sab" in old_str or "senin-sabtu" in old_str:
                for day in range(1, 7): # Monday to Saturday
                    new_hours["schedule"][str(day)] = {"open": "06:00", "close": "21:00"}
            elif "setiap hari" in old_str:
                for day in range(7):
                    new_hours["schedule"][str(day)] = {"open": "10:00", "close": "23:00"}

        p["hours"] = new_hours

with open("data/places.json", "w") as f:
    json.dump(places, f, indent=4)
