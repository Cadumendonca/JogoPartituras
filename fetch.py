import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0'}

url_treble = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Treble_clef.svg'
req = urllib.request.Request(url_treble, headers=headers)
res_treble = urllib.request.urlopen(req).read().decode('utf-8')
print('TREBLE PATHS:')
for match in re.finditer(r'<path[^>]*d="([^"]+)"', res_treble):
    print(match.group(1))

url_bass = 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Bass_clef.svg'
req = urllib.request.Request(url_bass, headers=headers)
res_bass = urllib.request.urlopen(req).read().decode('utf-8')
print('BASS PATHS:')
for match in re.finditer(r'<path[^>]*d="([^"]+)"', res_bass):
    print(match.group(1))
print("DONE")
