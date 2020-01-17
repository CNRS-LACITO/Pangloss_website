from .Transcription import Transcription, Tier

def toTables(f, trans, l_header,l_col, sep="\t"):
    """"""
    
    if not isinstance(l_col,list):
        return 1
    c_head = len(l_header); c_trans = len(trans)
    if (c_head < 1) or (c_trans < 1):
        return 2
    for tuple in l_col:
        col = tuple[1]
        if not len(col) == c_head:
            return 3
        for t in col:
            if t >= c_trans:
                return 3
        # Variables
    index = 0; start = 0; end = 0
    text = ""; copy = ""
        # Writing
    with open(f, 'w', encoding="utf-8") as file:
        text = "index" + sep + "start" + sep + "end" + sep
        for h in l_header:
            text = text + h + sep
        text = text + "speaker\n"
        copy = ""
        for col in l_col:
            spk = col[0]; l_tiers = col[1]; c_t = len(l_tiers)
            tier = trans.tiers[l_tiers[0]]
            for seg in tier:
                start = int(seg.start*1000); end = int(seg.end*1000)
                copy = ("{:6d}".format(index) + sep + "{:6d}".format(start)
                        + sep + "{:6d}".format(end) + sep + seg.content)
                for a in range(1,c_t):
                    ttier = trans.tiers[l_tiers[a]]
                    for sseg in ttier:
                        if sseg.start < seg.end and sseg.end > seg.start:
                            copy = copy + sep + sseg.content
                            break
                text = text + copy + sep + spk + "\n"
                index += 1
        file.write(text)