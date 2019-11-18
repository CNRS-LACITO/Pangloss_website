# -*- coding: utf-8 -*-
"""
Description:
    - for some .eaf files, probably .eafs whose audio files were converted
    improperly, the alignment between annotations and audio grows increasingly
    greater over the course of the file
HOW TO USE:
    - get the start time stamp at which the annotations and audio are correctly
    linked (likely 0, the beginning of the file)
    - get the end time stamp: the offset of the last annotation you are
    interested in
    - measure how many milliseconds skew there is between the last annotation
    and its linked audio
    - call this script from the directory that contains the .eaf file
        - input the start time, end time, and the skewed difference
    - the script will rescale all the time values within the start and end
    times and give you the option to over-write the original .eaf with these
    new values

"""

from pathlib import Path
import xml.etree.ElementTree as ET

def rescale(old_min, old_max, new_min, new_max, val):
    """input boundaries of old and new scales, as well as the value to be
    rescaled; return rescaled value"""
    return ((val - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min

def rescaleTime():
    # get .eaf file to adjust
    file_name = input("What EAF file would you most like to edit?\n\t: ")
    file_ = Path.cwd() / file_name

    # parse xml
    elan_file = ET.parse(file_)
    root = elan_file.getroot()
    time_nodes = root.findall('./TIME_ORDER/TIME_SLOT')

    # get timestamp input
    start_time = int(input("What is the start time (in msec)?\n\t: "))
    end_time = int(input("What is the end time (in msec)?\n\t: "))
    difference = int(input("How far are the annotations de-synced by the end time (in msec)?\n\t: "))

    # loop through TIME_SLOT nodes and rescale those within the start_time-end_time range
    for node in time_nodes:
        tv = int(node.attrib['TIME_VALUE'])
        if start_time <= tv <= end_time:
            new_tv = round(rescale(start_time, end_time, start_time, end_time + difference, tv))
            node.attrib['TIME_VALUE'] = str(new_tv)
            print(f"--changing {str(tv)} to {str(new_tv)}")

    # write back to file
    if input("Do you want to over-write the .eaf file?\n\t: ").lower() in ['y', 'yes']:
        elan_file.write(file_name, encoding='UTF-8', xml_declaration=True)
    else:
        print("Then why did you even run this script?")
