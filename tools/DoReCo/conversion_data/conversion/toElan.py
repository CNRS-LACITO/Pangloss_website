from .Transcription import Transcription, Tier
from xml.sax.saxutils import escape

def toElan(f, trans, **args):
    """Creates an ELAN file from a Transcription object.
    
    Only handles boundaries in milliseconds (ELAN doesn't seem to save in PAL/NTSC)
    Very limited header/footer handling."""
    
        # Encoding
    encoding = "utf-8"
    if "encoding" in args:
        encoding = args["encoding"]
    for tier in trans:
        for seg in tier:
            if not seg.id:
                trans.setstructure; break
        # We write
    with open(f, 'w', encoding=encoding) as file:
        copy = ""
            # HEADER
        if trans.format == "elan" and trans.metadata.header:
            file.write(trans.metadata.header + "\n\t<TIME_ORDER>\n")
        else:
            file.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                       "<ANNOTATION_DOCUMENT FORMAT=\"3.0\" VERSION=\"3.6\" "
                       "AUTHOR=\"\" DATE=\"\" xmlns:xsi=\"http://www.w3.org/2001/"
                       "XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\""
                       "http://www.mpi.nl/tools/elan/EAFv3.0.xsd\">\n\t<HEADER "
                       "MEDIA_FILE=\"\" TIME_UNITS=\"milliseconds\">\n"
                       "\t\t<MEDIA_DESCRIPTOR MEDIA_URL=\"\"/>\n\t</HEADER>\n\t"
                       "<TIME_ORDER>\n")
            # TIME_ORDER
        if not trans.timetable:
            trans.settimetable(1)
        for a in range(len(trans.timetable)):
            if trans.timetable[a] < 0.:
                copy = copy + ("\t\t<TIME_SLOT TIME_SLOT_ID=\"ts"+str(a+1)+"\" />\n")
            else:
                copy = copy + ("\t\t<TIME_SLOT TIME_SLOT_ID=\"ts"+str(a+1)+"\" TIME_VALUE="
                       "\""+"{:.3f}".format(trans.timetable[a]).replace('.','')+"\"/>\n") #MILLISECONDS!!!
        copy = copy + "\t</TIME_ORDER>\n"
        file.write(copy)
        copy = ""; type = ""; l_types = []
            # TIERS
        for tier in trans.tiers:
                # We get the tier type
            if (not tier.elan) or ("LINGUISTIC_TYPE_REF" not in tier.elan):
                if not tier.truetype: # No type indication: default to time-alignment
                    type = "time"
                else:
                    type = tier.truetype
            else:
                type = escape(tier.elan["LINGUISTIC_TYPE_REF"])
            if not type in l_types:
                l_types.append((type,tier.truetype))
                # We write the tier head
            copy = copy + ("\t<TIER TIER_ID=\""+escape(tier.name)+"\" LINGUISTIC_TYPE_REF=\""
                   +type+"\"")
            if tier.parent:
                copy = copy + " PARENT_REF=\""+escape(tier.parent)+"\""
            if tier.elan:
                for key, value in tier.elan.items():
                    if not key == "LINGUISTIC_TYPE_REF":
                        copy = copy + (" {}=\"{}\"".format(escape(key), escape(value)))
            copy = copy + ">\n"
                # SEGMENTS
                    # symbolic-association / symbolic-subdivision
            if tier.truetype and (tier.truetype != "time"):
                par = -1
                for a in range(len(trans.tiers)):
                    if tier.parent == trans.tiers[a].name:
                        par = a; break
                if par == -1:
                    tier.truetype = "time"
                else:
                    id = ""; ref = ""
                        # We reconstitute the "prev":
                    l_prev = []; o_ref = ""
                    for a in range(len(tier)):
                        seg = tier.segments[a]
                        if not seg.ref == o_ref:
                            l_prev.append("")
                            o_ref = seg.ref; check = 1
                        else:
                            l_prev.append(tier.segments[a-1].id)
                        # We write
                    for a in range(len(tier)):
                        seg = tier.segments[a]
                        if seg.unit == True:
                            content = seg.content.replace("<","&lt;").replace(">","&gt;")
                            id = seg.id; ref = seg.ref; prev = l_prev[a]
                            copy = copy + ("\t\t<ANNOTATION>\n\t\t\t<REF_ANNOTATION "
                                   "ANNOTATION_ID=\""+escape(id)+"\" ANNOTATION_REF=\""
                                   +escape(ref)+"\"")
                            if not prev == "":
                                copy = copy + " PREVIOUS_ANNOTATION=\""+escape(prev)+"\""
                            copy = copy + (">\n\t\t\t\t<ANNOTATION_VALUE>"+escape(content)
                                   +"</ANNOTATION_VALUE>\n\t\t\t</REF_ANNOTATION>"
                                   "\n\t\t</ANNOTATION>\n")
                # time-alignement / time-subdivision / included-in
            if not tier.truetype or (tier.truetype == "time"):
                ts1 = ""; ts2 = ""
                for seg in tier.segments:
                    if seg.unit == True:
                        id = seg.id
                        content = seg.content.replace("<","&lt;").replace(">","&gt;")
                        check = 0; pos = 0; lt = len(trans.timetable)
                        while not check == 2:
                            for a in range(pos,lt):
                                if seg.start == trans.timetable[a]:
                                    ts1 = "ts" + str(a+1); check += 1
                                if seg.end == trans.timetable[a]:
                                    ts2 = "ts" + str(a+1); check += 1
                                if check == 2:
                                    pos = a; break
                            if check < 2:
                                check = 0; pos = 0
                        copy = copy + ("\t\t<ANNOTATION>\n\t\t\t<ALIGNABLE_ANNOTATION "
                                  "ANNOTATION_ID=\""+escape(id)+"\" TIME_SLOT_REF1=\""+ts1+
                                  "\" TIME_SLOT_REF2=\""+ts2+"\">\n\t\t\t\t<ANNOTATION_"
                                  "VALUE>"+content+"</ANNOTATION_VALUE>\n\t\t\t"
                                  "</ALIGNABLE_ANNOTATION>\n\t\t</ANNOTATION>\n")
            copy = copy + "\t</TIER>\n"
            file.write(copy)
            copy = ""
            # FOOTER
        check = 0; l_ttypes = []; footer = trans.metadata.footer
        if trans.format == "elan" and trans.metadata.footer:
            check = 1
            p_deb = footer.find("<LINGUISTIC_TYPE"); l_temp = []
            pos = p_deb; p_fin = pos+1; sym = ""; type = ""; lt = len(l_types)
            if p_deb >= 0:
                while True:
                    pos = footer.find("LINGUISTIC_TYPE_ID",p_fin)+20
                    if pos < 20:
                        break
                    sym = footer[pos-1]
                    p_fin = footer.find(sym,pos)
                    type = footer[pos:p_fin]
                    l_temp.append(type)
                for tuple in l_types:
                    if tuple[0] not in l_temp:
                        l_ttypes.append(tuple)
                l_temp.clear()
        else:
            l_ttypes = l_types
        for tuple in l_ttypes: # using "truetype" to determine the type of type
            if not tuple[1] == "time":
                footer = ("\t<LINGUISTIC_TYPE LINGUISTIC_TYPE_ID=\"{}\" "
                          "TIME_ALIGNABLE=\"{}\" CONSTRAINTS=\"Time_"
                          "Subdivision\" GRAPHIC_REFERENCES=\"{}"
                          "\"/>\n".format(tuple[0],"true","false")) + footer
            else:
                footer = ("\t<LINGUISTIC_TYPE LINGUISTIC_TYPE_ID=\"{}\" "
                          "TIME_ALIGNABLE=\"{}\" GRAPHIC_REFERENCES=\"{}"
                          "\"/>\n".format(tuple[0],"true","false")) + footer
        if check == 0:
            footer = footer + ("\t<CONSTRAINT STEREOTYPE=\"Time_Subdivision\" DESCRIPTION=\""
                 "Time subdivision of parent annotation's time interval, no time "
                 "gaps allowed within this interval\"/>\n\t<CONSTRAINT STEREOTYPE="
                 "\"Symbolic_Subdivision\" DESCRIPTION=\"Symbolic subdivision of a "
                 "parent annotation. Annotations refering to the same parent are "
                 "ordered\"/>\n\t<CONSTRAINT STEREOTYPE=\"Symbolic_Association\" "
                 "DESCRIPTION=\"1-1 association with a parent annotation\"/>\n\t"
                 "<CONSTRAINT STEREOTYPE=\"Included_In\" DESCRIPTION=\"Time alignable "
                 "annotations within the parent annotation's time interval, gaps are "
                 "allowed\"/>\n")
        file.write(footer)
            
            