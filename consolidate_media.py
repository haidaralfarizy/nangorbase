import re

with open("css/main.css", "r") as f:
    content = f.read()

def extract_media_queries(text):
    media_pattern = r'@media\s*\(\s*max-width\s*:\s*40rem\s*\)\s*\{'
    matches = list(re.finditer(media_pattern, text))
    
    extracted = []
    # Process from right to left so indices don't shift
    for match in reversed(matches):
        start = match.start()
        # Find closing bracket
        open_brackets = 0
        end = -1
        for i in range(start, len(text)):
            if text[i] == '{':
                open_brackets += 1
            elif text[i] == '}':
                open_brackets -= 1
                if open_brackets == 0:
                    end = i + 1
                    break
        if end != -1:
            extracted.insert(0, text[start:end])
            text = text[:start] + text[end:]
            
    return text, extracted

new_text, queries = extract_media_queries(content)

if queries:
    combined_media = "\n/* --------------------------------------------------------------------------\n   Mobile Overrides\n   -------------------------------------------------------------------------- */\n@media (max-width: 40rem) {\n"
    for q in queries:
        # Strip the outer '@media (...) {' and '}' to combine their contents
        inner_content = q[q.find('{')+1:q.rfind('}')].strip()
        combined_media += "\n    " + "\n    ".join(inner_content.split('\n')) + "\n"
    combined_media += "}\n"
    new_text = new_text.strip() + "\n" + combined_media

with open("css/main.css", "w") as f:
    f.write(new_text)

print("Media queries consolidated.")
