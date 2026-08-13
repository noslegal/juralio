import datetime
import json
import os
from pathlib import Path

from apidescriptions import descriptions


class APIEntry(object):
    def __init__(self):
        self.path = ''
        self.verbs = []
        self.public = "-"

    def asdict(self):
        return {'path': self.path, 'verbs': self.verbs, 'public': self.public}


def readFile(filename: str):
    content = ''
    with open(filename, "r") as f:
        content = f.readlines()
    return content


def writeFile(content, tartgetFile):
    out = open(tartgetFile, 'w')
    out.write(content)
    out.close()


SCRIPT_DIR = Path(__file__).parent

# Grab file
api = readFile(str(SCRIPT_DIR / "../../server/grails-app/controllers/server/UrlMappings.groovy"))

# Prep for list
index = -1

# Manually add Login
login = APIEntry()
login.path = "/api/login"
login.verbs.append('POST')
login.public = "X"

allEndpoints = [login]
gets = 0
posts = 0
patches = 0
deletes = 0

today = datetime.datetime.now()

for line in api:
    index += 1
    if not line.strip().startswith('//') and line.find("\"/") and (line.find("api") > -1 or line.find("health") > -1 or line.find("version") > -1):
        entry = line.replace('\n', '').strip()[1:]
        entry = entry[:entry.find('\"')]
        print("["+entry+"]")
        apiEntry = APIEntry()
        apiEntry.path = entry.replace('?', '')

        if line.find("health") > -1 or line.find("version") > -1 or line.find('/api/settings/user/password') > -1:
            apiEntry.public="X"
        verbs=api[index+1]

        if verbs.find('GET') > -1:
            apiEntry.verbs.append('GET')
            gets += 1
        if verbs.find('POST') > -1:
            apiEntry.verbs.append('POST')
            posts += 1
        if verbs.find('PATCH') > -1:
            apiEntry.verbs.append('PATCH')
            patches += 1
        if verbs.find('DELETE') > -1:
            apiEntry.verbs.append('DELETE')
            deletes += 1
        allEndpoints.append(apiEntry)

allEndpoints.sort(key = lambda o: o.path)

print(len(allEndpoints))
out = "<html>"
out += "<head>"
out += "<style>"
out += """table, th, td {
  font-family: arial;
  border: 1px solid black;
  padding: 2;
  border-color: lightgrey;
  border-spacing: 0;
}"""
out += "</style>"
out += "</head>"
out += "<body>"
out += "<h1>Juralio API summary</h1>"
out += "<p>Version: {year}. {month}</p>".format(year = today.year, month = today.month)
out += "<h2>Terminology</h2>"
out += "<hr/>"
out += "<table>"
out += "<tr><td><b>Sys Admin</b></td><td> System Administrator</td><td> Overall admin control of instance, organisations and users but no access to matter content.</td></tr>"
out += "<tr><td><b>Org Admin</b></td><td> Organisation Administrator</td><td> Admin control of a particular organisation, its users / roles / content.</td></tr>"
out += "<tr><td><b>MTM</b></td><td> Matter Team Member</td><td> Can see and edit a specific matter.</td></tr>"
out += "<tr><td><b>MA</b></td><td> Matter Administrator</td><td> Admin control of a specific matter (including e.g. access, archiving).</td></tr>"
out += "</table>"
out += "<hr/>"
out += "<h2>Endpoints</h2>"
out += "<table>"
out += "<tr>"
out += "<td style=\"background:blue;color:white\">Endpoint</td>"
out += "<td style=\"background:blue;color:white;text-align:center;width:95px;\">PUBLIC</td>"
out += "<td style=\"background:blue;color:white;text-align:center;width:95px;\">GET</td>"
out += "<td style=\"background:blue;color:white;text-align:center;width:95px;\">POST</td>"
out += "<td style=\"background:blue;color:white;text-align:center;width:95px;\">PATCH</td>"
out += "<td style=\"background:blue;color:white;text-align:center;width:95px;\">DELETE</td>"
out += "<td  style=\"background:blue;color:white;text-align:center;\">Description</td>"
out += "</tr>"

for endpoint in allEndpoints:
    out += "<tr>"
    out += "<td>"
    out += endpoint.path
    out += "</td>"
    out += """<td style="text-align:center;width:95px;background:lightyellow">"""
    out += endpoint.public
    out += "</td>"
    for verb in ['GET', 'POST', 'PATCH', 'DELETE']:
        out += """<td style="text-align:center;width:95px;">"""
        out += "X" if verb in endpoint.verbs else "-"
        out += "</td>"
    out += "<td>"
    out += descriptions[endpoint.path] if endpoint.path in descriptions else "<span style=\"color:red\">TODO</span>"
    out += "</td>"
    out += "</tr>\r\n"
out += "</table>"

# Summary
out += "<h2>Summary Counts</h2>"
out += "<table>"
out += "<tr>"
out += "<td>"
out += "Endpoints"
out += "</td>"
out += "<td>"
out += str(len(allEndpoints))
out += "</td>"
out += "</tr>"
out += "<tr>"
out += "<td>"
out += "GETS"
out += "</td>"
out += "<td>"
out += str(gets)
out += "</td>"
out += "</tr>"
out += "<tr>"
out += "<td>"
out += "POSTS"
out += "</td>"
out += "<td>"
out += str(posts)
out += "</td>"
out += "</tr>"
out += "<tr>"
out += "<td>"
out += "PATCHES"
out += "</td>"
out += "<td>"
out += str(patches)
out += "</td>"
out += "</tr>"
out += "<tr>"
out += "<td>"
out += "DELETES"
out += "</td>"
out += "<td>"
out += str(deletes)
out += "</td>"
out += "</tr>"
out += "</table>"


out += "</body>"
out += "</html>"

#print(out)
print("FINISHED " + str(len(out)))
writeFile(out, str(SCRIPT_DIR / "api.html"))

allEndpointsJsonified = [json.dumps(endpoint.asdict()) for endpoint in allEndpoints]
s = "[%s]" % ",\n".join(allEndpointsJsonified)
print(allEndpointsJsonified)
print(s)

writeFile(s, str(SCRIPT_DIR / "allEndpoints.txt"))
# print('GETS\t' + str(gets))
# print('POSTS\t' + str(posts))
# print('PATCHES\t' + str(patches))
# print('DELETES\t' + str(deletes))
