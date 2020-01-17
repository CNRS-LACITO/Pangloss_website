from .Transcription import Transcription, Tier

def fromPraat(f, **args):
    """Create a Transcription object representing the TextGrid transcription.
    
    Only handles the 'text file' format. Will have to handle 'short text' and 'binary'
    eventually."""
    
    trans = Transcription()
    encoding = "utf-8"; sym = ["","_"]
    if "encoding" in args:
        encoding = args["encoding"]
    if "sym" in args:
        sym = args["sym"]
        if isinstance(sym, str):
            sym = [sym]
        # We test the encoding (utf-8 or utf-16)
    if not encoding:
        with open(f, 'rb') as file:
            bytes = file.read(3)
            if bytes[2] == 0x6c:
                encoding = "utf-8"
            elif bytes[2] == 0x46:
                encoding = "utf-16-le"
            elif bytes[2] == 0x00:
                encoding = "utf-16-be"
            else:
                print("Not an ooTextFile type.")
                return trans
        # Now we open in text mode
    with open(f, encoding=encoding) as file:
            # We test the type of TextGrid
            ## Currently no test, only 'text file' format handled
        segment = file.readline()
        if segment == '':
            print("Error: empty Praat file.")
            return trans
        file.seek(0)
            # Variables
        start_time = 0.; end_time = 0.
        start_n = 0.; end_n = 0.; count = 0
        content = ""; tier = None
            # We simply read the file line by line and add the information
        while not ((segment == '') or ("item []:" in segment)):
            segment = file.readline()
            if "xmin" in segment:
                trans.start = float(segment.split("= ")[1])
            elif "xmax" in segment:
                trans.end = float(segment.split("= ")[1])
        while segment != '':
            segment = file.readline()
                # New tier
            if "name =" in segment:
                name = segment.split("\"")[1]
                trans.addtier(name, trans.start, trans.end)
                tier = trans.tiers[-1]
                # New segment
            elif "xmin =" in segment:
                start_n = float(segment.split("= ")[1])
            elif "xmax =" in segment:
                end_n = float(segment.split("= ")[1])
            elif "text =" in segment:
                content = segment.split("\"")[1]
                content = content.replace("\"\"","\"")
                id = "a"+str(count); count += 1
                tier.addsegment(-1,start_n,end_n,content,id)
                for s in sym:
                    if content == s:
                        #if len(tier) > 3:
                            #print("-3:", tier.segments[-3].content, tier.segments[-3].start, tier.segments[-3].end)
                            #print("-2", tier.segments[-2].content, tier.segments[-2].start, tier.segments[-2].end)
                            #print("-1", tier.segments[-1].content, tier.segments[-1].start, tier.segments[-1].end)
                        tier.segments[-1].unit = False; break
        # Transcription name
    if "\\" in f:
        name = f.rsplit("\\", 1)[1]
    elif "/" in f:
        name = f.rsplit("/", 1)[1]
    else:
        name = f
    trans.name = name.rsplit(".",1)[0]
    trans.format = "praat"
    return trans