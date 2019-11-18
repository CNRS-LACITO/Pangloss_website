# -*- coding: utf-8 -*-

"""
Description:
    - Birgit Hellwig's annotations (Goemai, Katla, Tabaq) are stored in Toolbox
    .txt. After batch-importing these into ELAN, this script collects the ELAN
    file names and matching audio files from MetadataHellwig.xlsx (updated
    from .xls), reads each ELAN file, adds linked audio file, and re-writes
    ELAN file.
    - TO USE:
        - edit locations of metadata and language files, as appropriate
        - run script

"""

import pandas
from pathlib import Path
import xml.etree.ElementTree as ET

def linkSound(language="Tabaq", metadata="", file_path=""):

        # read in Hellwig metadata file
    exc = pandas.read_excel(metadata, sheet_name = None)
    df = exc[language]
    if language == 'Tabaq':
        df.drop(0, inplace=True)
        # make a dict of transcript and audio file names; strip() because of spaces in some file names!
    d = {(r['Transcript files'][:-4] + '.eaf').strip(): (r['Audio files']).strip() for i, r in df.iterrows()}

        # loop through files
    for k, v in d.items():
            # create objects
        t_file = Path(file_path + k)
        a_file = Path(file_path + v)
        try:
            ELAN_audio = 'file:///' + str(a_file).replace('\\', '/')
            new_elem = ET.Element('MEDIA_DESCRIPTOR',
                                  attrib = {'MEDIA_URL': ELAN_audio, 'MIME_TYPE': 'audio/x-wav',
                                            'RELATIVE_MEDIA_URL': r'./' + v})
        except:
            print(f"--Couldn't create audio file for {v}")
            continue
            # parse xml
        try:
            elan_file = ET.parse(t_file)
            header = elan_file.getroot().find('HEADER')
        except:
            print(f"--couldn't get header for {k}")
            continue
            # over-write .eaf
        if header.find('MEDIA_DESCRIPTOR') is None:
            header.insert(0, new_elem)
            elan_file.write(t_file, encoding='UTF-8', xml_declaration=True)
            print(f"-writing {k}")
        else:
            print(f"--{k} already has linked media")