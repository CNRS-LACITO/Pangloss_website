# -*- coding: utf-8 -*-
"""
Created on Wed May 22 13:58:16 2019

@author: yewne

NOTES:
    - Calculates total DoReCo word count, grouped by language and optionally by
    another category (such as interlinearization)
    - To run, download 'DoReCo Pre- and post-processing' Google Doc as an Excel
    file, then run this script. You'll be asked to input the path to the
    Excel file and the additional column you want to order by (leave blank if
    you only want word counts by language)
    - Currently ignores any rows in the Google Doc which have no value or a
    non-numeric value in the 'Word count MAUS tier 1' column
"""

import pandas


def clean_GD_sheet(dff):
    """ INPUT: pandas df from read_excel function
        - drop all rows except Status and reset index
        OUTPUT: cleaned pandas df"""
    dff = dff[dff.index == 'Status']
    dff.reset_index(drop=True, inplace=True)
    return dff

def concat_sheets(sheets):
    """ INPUT: Google Doc excel dict (from read_excel)
        - create list of dfs from sheets (and add Language column)
        - concatenate them all!
        OUTPUT: concatenated df"""
    def add_lang_col(dfff, lang):
        dfff['Language'] = lang
        return dfff
    df_list = [add_lang_col(val, key) for key, val in sheets.items() if str(key) != '0'] # drop 0 (template) sheet
    return pandas.concat(df_list, sort=True)

def wordCount():
    '''create objects'''
    wc_col = 'Word count MAUS tier 1'

    '''input data here..'''
    #excel_file = "DoReCo Pre- and post-processing.xlsx"
    #category = 'Interlinearization (morphology)'

    '''or get data from user:'''
    excel_file = input("Please input directory path of Excel file\n\t: ")
    category = input("Order by what column (press Enter for just word counts for each language)\n\t: ")

    '''prepare data'''
    sheets = pandas.read_excel(excel_file, sheet_name=None, header=1, index_col=None)
    sheets = {k:clean_GD_sheet(v) for k, v in sheets.items()} # clean sheets (haha, laundry pun)
    comb_df = concat_sheets(sheets)# concatenate sheets
    comb_df['word_count'] = pandas.to_numeric(comb_df[wc_col], errors='coerce') # iignore non-numeric values in word count column

    '''create sum-of-word-counts df'''
    if category:
        # create multi-index
        comb_df.set_index(['Language', category], inplace=True)
        # sum up word counts by category
        s_df = comb_df.word_count.sum(level=[0, 1])
    else:
        #comb_df.set_index('Language', inplace=True)
        s_df = comb_df.groupby('Language').word_count.sum()
    print(f"-- Total word count in database: {comb_df.word_count.sum()}")

    '''write file'''
    output_file = 'word_counts.csv' if not category else 'word_counts_by_category.csv'
    s_df.to_csv(output_file)

