# -*- coding: utf-8 -*-
"""
Created on Wed May 15 10:39:57 2019

@author: yewne

Description:
    Call from directory containing one or more .csvs downloaded from
    pre-processing Google Doc. This script will create a semicolon-delimited
    file of the file names and their corresponding tier names (for MAUS input)
"""

import pandas
import numpy as np
import os, glob

def do_ttier(input_file):
    """ INPUT: pre-processing file name
		- read pre-processing file as pandas df
		- slice appropriate rows and columns
		- write to semicolon-separated .txt file
		OUTPUT: None"""
        
    try:
        dff = pandas.read_csv(input_file, header=1, index_col=0)
    except:
        print("Couldn't load the csv:", input_file)
    try:
        dff['DoReCo Index'] = dff['DoReCo Index'].fillna(method='ffill')
        dff = dff[dff.index == 'Status']
        dff[t_tier] = dff[t_tier].apply(lambda x: x if not type(x) is str else x.replace('; ', ',').replace(';', ',').replace(', ', ','))
        dff = dff[[file_name, t_tier]]
    except:
        print("Couldn't make a list out of the csv:", input_file)
    
    try:
        output_file = input_file[:-4] + '_files_and_tiers.txt'
        print(f"--creating {output_file}")
        dff.to_csv(output_file, header=False, index=False, sep=';')
    except:
        print("Couldn't create the ttier file:", output_file)

def ttier(file_name="File name (DoReCo)", t_tier="MAUS transcription tier name(s)"):
        # object creation
    path_ = os.getcwd()
    file_list = glob.glob(os.path.join(path_, "*.csv"))

        # function call (in loop)
    if input(f"Would you like to create file name + MAUS Transcription tier mappings for {path_}?\n\t :").lower() in ['y', 'yes']:
        for f in file_list:
            do_ttier(f)
        print("\nFinished!")
    else:
        print("Fine, whatever.")

    '''

    f_name = "C:\\Users\\yewne\\Documents\\Python Scripts\\DoReCo Pre- and post-processing - Kakabe.csv"
    df = pandas.read_csv(f_name)

    create_filename_tier_mapping(f_name)

    '''