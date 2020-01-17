from .Transcription import Transcription, Tier
import xml.etree.cElementTree as ETree


def readTier(trans,elem,timeorder):
    """Support function.
    Loads a tier into the Transcription object."""
    trans.addtier(elem.attrib["TIER_ID"], trans.start, trans.end)
    tier = trans.tiers[-1]; tier.format = "elan"
    tier.setElan(elem.attrib)
    start = 0.; end = 0.; status = 0; p = 0; l_segs = []
        # If it's of truetype 'time':
    tier.truetype = "time"
    for anno in elem.iter("ALIGNABLE_ANNOTATION"):
        cont = anno.find("ANNOTATION_VALUE").text
        if cont == None:
            cont = ""
        else:
            cont = cont.replace("&lt","<").replace("&gt",">")
        s_start = anno.attrib["TIME_SLOT_REF1"]
        s_end = anno.attrib["TIME_SLOT_REF2"]
        status = 0
        for tuple in timeorder:
            if s_start == tuple[0]:
                status += 1; start = float(tuple[1][:-3] + '.' + tuple[1][-3:])
            elif s_end == tuple[0]:
                status += 1; end = float(tuple[1][:-3] + '.' + tuple[1][-3:])
            if status == 2:
                break
        tier.addsegment(p, start, end, cont,"","",True,tier,1)
        tier.segments[-1].setElan(anno.attrib); p += 1
        if end < 0:
            l_segs.append(tier.segments[-1])
        elif start < 0.:
            l_segs.append(tier.segments[-1])
            if end >= 0.:
                ls = len(l_segs)
                start = l_segs[0].start; end = l_segs[-1].end; dur = end-start
                for a in range(ls):
                    seg = l_segs[a]
                    seg.start = start + dur*(a/ls)
                    seg.end = start + dur*((a+1)/ls)
                l_segs.clear()
    if tier.segments:
        return
        # Otherwise it was 'ref':
    tier.truetype = "ref"
    for anno in elem.iter("REF_ANNOTATION"):
        cont = anno.find("ANNOTATION_VALUE").text
        if cont == None:
            cont = ""
        id = anno.attrib["ANNOTATION_ID"]; ref = anno.attrib["ANNOTATION_REF"]
        tier.addsegment(p, -1.,-1., cont, id, ref, True, tier, 1)
        tier.segments[-1].setElan(anno.attrib); p += 1
        
def fromElan(f,**args):
    """Creates a Transcription object out of an ".eaf" file.
    Relies on the etree library."""
    
        # **args is for "encoding", which isn't used due to the xml library
    
    trans = Transcription()
    timeorder = []
    root = None
    
    b_root = False
    for event, elem in ETree.iterparse(f, events=("start","end")):
            # Find root for operation (cleaning)
        if not b_root:
            root = elem
            b_root = True
        elif event == "end":
                # getTimeorder (/!\ not Timetable)
            if elem.tag == "TIME_ORDER":
                for time in elem:
                    if "TIME_VALUE" in time.attrib:
                        timeorder.append((time.get("TIME_SLOT_ID"),
                                         time.get("TIME_VALUE")))
                    else:
                        timeorder.append((time.get("TIME_SLOT_ID"),"-1000"))
                root.remove(elem)
                trans.start = float(timeorder[0][1][:-3] + '.' +
                                    timeorder[0][1][-3:])
                trans.end = float(timeorder[-1][1][:-3] + '.' +
                                  timeorder[-1][1][-3:])
                # getTiers
            elif elem.tag == "TIER":
                readTier(trans,elem,timeorder)
                root.remove(elem)
                # getHeader&Footer
            elif elem.tag == "ANNOTATION_DOCUMENT":
                
                meta = ETree.tostring(root, "utf-8").decode("utf-8")
                trans.metadata.header, trans.metadata.footer = meta.split("</HEADER>\n")
                trans.metadata.header = ("<?xml version=\"1.0\" encoding="
                                        "\"UTF-8\"?>\n" + trans.metadata.header +
                                        "</HEADER>")
                root.clear()
    trans.format = "elan"
    return trans