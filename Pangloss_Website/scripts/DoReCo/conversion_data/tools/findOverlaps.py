from ..conversion.Transcription import Transcription, Tier

def findOverlaps(trans,cf="findOverlaps.txt",sep="\t"):
    """For each segment of each tier, checks all other segments for overlaps.
    
    ARGUMENTS:
    'cf'        : name of the text file; if empty, returns memory lists
    'sep'       : symbol for the text table (separator). Default tab "\t".
    RETURNS:
    Either creates a text file or returns two lists "l_table" and "l_count"."""

        # Variables
    l_table = []; l_count = []
        # Operation
    for tier in trans:
            lt = len(tier); l_count.append([tier.name,0,0,0,0,0])
            for a in range(lt):
                seg = tier.segments[a]
                print(tier.name,a,"/",lt)
                for b in range(a+1,lt):
                    pseg = tier.segments[b]
                    if b == a:
                        continue
                    if (seg.start == pseg.start) and (seg.end == pseg.end):
                        l_table.append((tier.name,"dupl",a,b,seg.start,seg.end))
                        l_count[-1][1] += 1; break
                    elif (seg.start < pseg.start) and (seg.end > pseg.start):
                        l_table.append((tier.name,"over-left",a,b,seg.start,pseg.end))
                        l_count[-1][2] += 1; break
                    elif (seg.start < pseg.end) and (seg.end > pseg.end):
                        l_table.append((tier.name,"over-right",a,b,pseg.start,seg.end))
                        l_count[-1][3] += 1; break
                    elif (seg.start < pseg.start) and (seg.end > pseg.end):
                        l_table.append((tier.name,"over-out",a,b,seg.start,seg.end))
                        l_count[-1][4] += 1; break
                    elif (((seg.start > pseg.start) and (seg.end <= pseg.end)) or
                          (seg.start >= pseg.start) and (seg.end < pseg.end)):
                        l_table.append((tier.name,"over-in",a,b,pseg.start,pseg.end))
                        l_count[-1][5] += 1; break
                    else:
                        continue
    if cf:
        with open(cf,'w',encoding="utf-8") as file:
            for count in l_count:
                file.write("{}:    {:3f} dupl,    {:3f} over-left,     {:3f}"
                           .format(count[0],count[1],count[2],count[3]) +
                           "over-right,    {:3f} over-out,    {:3f} over-in\n"
                           .format(count[4],count[5]))
            file.write("\nTierName"+sep+"Type"+sep+"SegA"+sep+"SegB"+sep+"Start"+sep+"End\n")
            for tuple in l_table:
                name = tuple[0]; type = tuple[1]; a = str(tuple[2]); b = str(tuple[3])
                start = "{:.3f}".format(tuple[4]); end = "{:3f}".format(tuple[5])
                file.write(name+sep+type+sep+a+sep+b+sep+start+sep+end+"\n")
    else:
        return l_table, l_count