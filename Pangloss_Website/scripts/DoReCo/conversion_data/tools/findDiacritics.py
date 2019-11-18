# -*- coding: utf-8 -*-
"""
DESCRIPTION:
    - reads in all the transcription text from a folder of ELAN files,
    identifies all the diacritically-marked graphemes, and outputs a file for
    dealing with these diacritics

HOW TO USE:
    - run python script (from anywhere) and input folder/tier information
    - script will print a csv of unique diacritic characters and the characters
    they occur with (for adding to exceptions.txt)
    - NOTE: some diacritics may not be visible in some fonts/UIs, but they are
    there and can be copied into exceptions.txt
"""

import pandas
import xml.etree.ElementTree as ET
from pathlib import Path
import unicodedata
from collections import Counter, defaultdict

def read_files():
    """ INPUT: None
        - get input: which folder, whether to get all eafs or just one, and if
        one, which tier
        - read in file(s) and get corresponding tiers
        OUTPUT: lists of files and corresponding tiers"""
    file_path = input("Where is your file located (press Enter if here)?\n\t: ")
    p = Path.cwd() if file_path == '' else Path(file_path)
    if input("Uh, okay. All .eafs in this folder?\n\t: ").lower() in ['y', 'yes']:
        df_path = p / 'ttiers.txt'
        tier_df = pandas.read_csv(df_path, names = ['file_', 'tiers'], sep=';')
        file_list = [p / (x + '.eaf') for x in tier_df['file_'].values]
        tier_list = tier_df['tiers'].values
    else:
        f = input("What file would YOU like to look at?\n\t: ")
        t = input("And what transcription TIER?\n\t: ")
        file_list = [p / f]
        tier_list = [t]
    return (file_list, tier_list)

def get_ELAN_text_dict(file_list, tier_list):
    """ INPUT: file list, tier list
        - parse .eaf files and extract text from transcription tiers"""
    """ OUTPUT: dict of files and texts"""
    f_dict = {}
    for file_, tier in zip(file_list, tier_list):
        print(f"-processing: {file_.name}")
        elan_file = ET.parse(file_)
        root = elan_file.getroot()
        all_speakers = tier.split(',')
        all_nodes = []
        for speaker in all_speakers:
            AU_nodes = root.findall(f'./TIER[@TIER_ID="{speaker}"]/ANNOTATION/REF_ANNOTATION/ANNOTATION_VALUE')
            all_nodes += AU_nodes # THIS COLLAPSES MULTIPLE SPEAKERS; edit to keep them separate
            print(f"----processing {speaker}: {len(all_nodes)} AUs")
        text_list = []
        for node in all_nodes:
            text_list += [node.text]
        f_dict[file_.name] = text_list
    return f_dict

def get_all_text(f_dict):
    """get all text from f_dict"""
    all_text = ''
    for text_list in f_dict.values():
        all_text += ''.join(text_list).lower()
    return all_text

def get_unique_chars(all_text):
    """get all unique characters in the list of files"""
    return list(set(all_text))

def print_diacritics(chars):
    """print list of diacritics to file"""
    diacritics = []
    for char in chars:
        if unicodedata.category(char) == 'Mn':
            print(char, char.encode('raw_unicode_escape'))
            diacritics += [char]
    with open('diacritics.txt', 'w', encoding='utf-8') as d_file:
        d_file.write('\n'.join(diacritics))

def count_chars(characters):
    """ INPUT: character list
		- get Counter dicts of vowels and non-vowels
		OUPUT: vowel and non-vowel Counters"""
    v_count = Counter([x for x in characters if x[0] in katla_vowels])
    o_count = Counter([x for x in characters if x[0] not in katla_vowels])
    return v_count, o_count

def decompose_characters(text):
    """ INPUT: text string
        - normalize text and recombine diacritics with their previous segments
        OUTPUT: list of decomposed characters and dict mapping them to originals
        # adapted from jsbueno on stackoverflow"""
    characters = []
    # Decompose all characters into plain letters + marking diacritics:
    text = unicodedata.normalize("NFD", text)
    for character in text:
        if unicodedata.category(character)[0] == "M": 
            # character is a composing mark, so aggregate it with previous
            # character
            characters[-1] += character
        else:
            characters.append(character)
    return characters

def write_vowel_diacritic_exceptions(characters, only_vowels=True):
    """ INPUT: character list
		- loop through characters and get each unique diacritic
		- add segments (vowels) to defaultdict list for each diacritic
		- convert to df and write to file
		OUTPUT: None"""
    d = defaultdict(list)
    for ch in set(characters):
        if len(ch) > 1:
            if only_vowels:
                if ch[0] in all_vowels:
                    d[ch[1:]].append(ch[0])
                    print(f"-- processing {ch} -- {ch.encode('raw_unicode_escape')}")
            else:
                print(f"-- {ch} -- {ch.encode('raw_unicode_escape')}")
                d[ch[1:]].append(ch[0])
    dff = pandas.DataFrame({'diacritic': list(d.keys()),
                            'segment': [';'.join(x) for x in d.values()],
                            'unicode':[x.encode('raw_unicode_escape') for x in list(d.keys())]})
    dff.to_csv('diacritic_exceptions.csv', index=False)

def findDiacritics():
    '''           OBJECTS AND FUNCTION CALLS             '''
    # create objects
    katla_vowels = list('ɑaɛeɪiɔoʊuə̀')
    all_vowels = list('iyɨʉɯuɪʏʊeøɘɵɤoəɛœɜɞʌɔæɐaɶɑɒ')
    rue = 'raw_unicode_escape'

    # get ELAN files
    file_list, tier_list = read_files()
    f_dict = get_ELAN_text_dict(file_list, tier_list)

    # get text / characters
    all_text = get_all_text(f_dict)
    unique_chars = get_unique_chars(all_text)

    # deal with diacritically-marked characters (two-unit units)
    characters = decompose_characters(all_text)

    # write diacritic exceptions to file (maybe take input to choose which characters to include?)
    write_vowel_diacritic_exceptions(characters)

    # count characters (vowel and other)
    vowel_counts, other_counts = count_chars(characters)

