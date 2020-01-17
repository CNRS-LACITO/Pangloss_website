from .Transcription import Transcription, Tier

def toPraat(f, trans, **args):
    """Creates a Praat file (.TextGrid) from a Transcription object.
    
    Doesn't handle short file nor binary."""
        # Quick assurance that the boundaries will be right
    trans.checktime(1)
        # Encoding
    encoding = "utf-8"
    if "encoding" in args:
        encoding = args["encoding"]
        # Sym   (used to fill 'False' segments)
    sym = "_"
    if "sym" in args:
        sym = args['sym']
        # We write
    with open(f, 'w', encoding=encoding) as file:
        file.write("File type = \"ooTextFile\"\nObject class = \"TextGrid\"\n\n"
                   "xmin = "+str(trans.start)+"\nxmax = "+str(trans.end)+"\ntiers? <exists>\n"
                   "size = "+str(len(trans.tiers))+"\nitem []:\n")
        for a in range(len(trans.tiers)):
            tier = trans.tiers[a]
            copy = ("\titem ["+str(a+1)+"]:\n\t\tclass = \"IntervalTier\"\n\t\tname = \""
                    +tier.name+"\"\n\t\txmin = "+str(tier.start)+"\n\t\txmax = "+str(tier.end)+
                    "\n\t\tintervals: size = "+str(len(tier.segments))+"\n")
            for b in range(len(tier.segments)):
                seg = tier.segments[b]
                if seg.unit == False:
                    seg.content = sym
                else:
                    seg.content = seg.content.replace("\"","\"\"").replace("&lt;","<").replace("&gt",">")
                copy = copy + ("\t\tintervals ["+str(b+1)+"]:\n\t\t\txmin = "+str(seg.start)+
                       "\n\t\t\txmax = "+str(seg.end)+"\n\t\t\ttext = \""+seg.content+
                       "\"\n")
            file.write(copy)
            copy = ""