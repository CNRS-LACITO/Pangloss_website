# -*- coding: utf-8 -*-

def getLexicon(trans, l_tiers = [], mode=0, cf="", sep="\t"):
    """Creates a csv with a list of all unique content or characters.
    mode: '0' for lexicon, '1' for characters."""
    
        # setup
    if not trans:
        return
    if not cf:
        if mode == 0:
            cf = "ttiers_lex.csv"
        elif mode == 1:
            cf = "ttiers_char.csv"
    if not l_tiers:
        for a in range(len(trans)):
            l_tiers.append(a)
        # get the list
    l_items = []; l_final = []
    for a in l_tiers:
        tier = trans.tiers[a]
        l_items.clear()
        if mode == 0:
            for seg in tier:
                if not seg.content in l_items:
                    l_items.append(seg.content)
        elif mode == 1:
            for seg in tier:
                for char in seg.content:
                    if not char in l_items:
                        l_items.append(char)
        for item in l_items:
            l_final.append((tier.name, item))
        l_items.clear()
    with open(cf, 'w', encoding="utf-8") as file:
        for tuple in l_final:
            file.write(tuple[0] + sep + tuple[1] + "\n")
    l_final.clear()
    return
    