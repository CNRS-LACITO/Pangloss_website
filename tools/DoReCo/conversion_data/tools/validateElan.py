# -*- coding: utf-8 -*-
"""
Description:
    - goes through all .eaf files in a directory and validates them against
    ELAN's XSD
HOW TO USE:
    - call from the folder containing the script and the XSDs
    - input directory of .eaf files
    - script will report on each file, printing whether or not each validates
CAUTION:
    - contains XSDs for ELAN 2.0 through 3.0, but has only been tested
    successfully on 3.0, so needs further testing on earlier ELAN files!"""

from pathlib import Path
from lxml import etree
import sys

def validate_eaf(xml_path: str, xsd_path: str) -> bool:
    """ INPUT: xml (eaf) path and xsd directory path
        - parse files and validate
		OUTPUT: True or False"""
    l_err = []
    try:
        xmlschema_doc = etree.parse(xsd_path)
    except:
        return False, l_err
    xmlschema = etree.XMLSchema(xmlschema_doc)

    xml_doc = etree.parse(xml_path)
    result = xmlschema.validate(xml_doc)
    l_err = []
    if not result:
        for error in xmlschema.error_log:
            l_err.append((error.message,error.line,error.column))

    return result, l_err

def validateElan(folder="", xsd=""):
    """ INPUT: none
        - get XSD directory path and list of ELAN files to validate
		- loop through files; parse and validate_eaf(); print success/failure
		OUTPUT: none"""
    # create objects
    dir_path = Path(sys.path[0]) #get directory that python script and XSDs are in
    if not xsd:
        xsd_path = Path(input("Which directory contains the XSD files?\n\t- "))
    else:
        xsd_path = Path(xsd)
    if not folder:
        folder = Path(input("Which directory contains the validatable ELAN files?\n\t- "))
    else:
        folder = Path(folder)
    f_list = list(folder.glob("**/*.eaf"))
    
    # loop through files and try to validate each
    for f_path in f_list:
        file = f_path.resolve().__str__()
        elan_file = etree.parse(file)
        root = elan_file.getroot()
        version = root.get("VERSION")
        name = f"EAFv{version}.xsd"
        xsd = (xsd_path / name).resolve().__str__()
        result, l_err = validate_eaf(file, xsd)
        if not result:
            if not l_err:
                print(f"-- no XSD for {f_path.name} (version {version}).")
            else:
                print(f"\n-- validation FAILURE {f_path.name} (version {version}).")
                print(l_err,"\n")
        else:
            print(f"- validation SUCCESS {f_path.name} (version {version})!")
    
    