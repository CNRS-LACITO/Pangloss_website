import requests
from constantes import USERNAME, PASSWORD, ENDPOINTDOI

def enregistrer_urlRessource(filename, doi):
    urlFile = open(filename, 'r').read().strip()
    response = requests.put(ENDPOINTDOI + doi, auth=(USERNAME, PASSWORD), data=urlFile.encode('utf-8'),
                            headers={'Content-Type': 'text/plain;charset=UTF-8'})
    file = open('apiUrl', 'a')
    if response.status_code != requests.codes.ok:
        file.write(str(response.status_code) + " " + response.text + "\n")
        print(str(response.status_code) + " " + response.text)


def enregistrer_urlPhrase(filename, doi):
    urlFile = open(filename, 'r').read().strip()
    response = requests.put(ENDPOINTDOI + doi, auth=(USERNAME, PASSWORD), data=urlFile.encode('utf-8'),
                            headers={'Content-Type': 'text/plain;charset=UTF-8'})
    file = open('apiUrl', 'a')
    if response.status_code != requests.codes.ok:
        file.write(str(response.status_code) + " " + response.text + "\n")
        print(str(response.status_code) + " " + response.text)
