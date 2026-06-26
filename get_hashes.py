import urllib.request
import hashlib
import base64

urls = [
    "https://unpkg.com/lenis@1.1.13/dist/lenis.min.js",
    "https://cdn.jsdelivr.net/npm/fuse.js@7.0.0",
    "https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js",
    "https://unpkg.com/lucide@0.378.0"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read()
            digest = hashlib.sha384(content).digest()
            hash_b64 = base64.b64encode(digest).decode('utf-8')
            print(f"{url} -> sha384-{hash_b64}")
    except Exception as e:
        print(f"Error fetching {url}: {e}")
