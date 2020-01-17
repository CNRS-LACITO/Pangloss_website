from .Transcription import Transcription, Tier
import xml.etree.cElementTree as ETree

class Plev:
    """Support class storing one level."""
    
    def __init__(self, tag="", attrib={}, level=0, pplev=-1, plevel=-1):
        self.level = level
            # Tiers
        self.tiers = [] # tier indexes
        self.starts = [] # tier starting segment (for loop)
        self.ends = [] # tier ending segment (for loop)
            # Audio
        self.audio = (-1.,-1.)
        self.acheck = False # Whether this level has audio
            # Structure
        self.pplev = pplev
        self.plevel = plevel
        self.pchild = []
        self.seg = None
            # Attributes
        self.tag = tag
        self.attrib = attrib
        self.notes = []
        
    def addSeg(self,a,trans):
        """Adds a segment/tier."""
        
        test = False
        for b in self.tiers:
            if a == b:
                test = True; break
        if test == False:
            if self.notes:
                trans.tiers[a].segments[-1].notes = self.notes.copy()
                self.notes.clear()
            self.tiers.append(a)
            self.starts.append(len(trans.tiers[a])-1)
            trans.tiers[a].level = self.level
        
class Ptree:
    """Support class with the Pangloss structure."""
    
    def __init__(self, trans):
        self.max = -1 # max tree level
        self.cur = -1 # current tree level
        self.plev = [] # list of list of Plev objects (per level)
        self.levels = [] # list of list of tiers (per level)
        self.trans = trans
        
    def __len__(self):
        return len(self.plev)
    def __iter__(self):
        self.itls = 0; self. itps = -1
        if self.plev:
            self.itlf = len(self.plev); self.itpf = len(self.plev[0])
        else:
            self.itlf = 0; self.itpf = 0
        return self
    def __next__(self):
        self.itps += 1
        if self.itps >= self.itpf:
            self.itls += 1
            if self.itls >= self.itlf:
                raise StopIteration
            else:
                self.itpf = len(self.plev[self.itls]); self.itps = 0
        return self.plev[self.itls][self.itps]
    
    def addPlev(self, tag="", attrib={}, level=-1):
        """Adds a level 'plev' to the list."""
        self.cur += 1; pplev = -1; plevel = -1
        if level == -1:
            level = self.cur
        if self.max < level:
            self.max = len(self.plev); self.cur = self.max
            self.plev.append([]); self.levels.append([])
        plevel = level-1; pplev = len(self.plev[plevel])-1
        self.plev[level].append(Plev(tag,attrib,level,pplev,plevel))
        if plevel >= 0 and pplev >= 0:
            self.plev[plevel][pplev].pchild.append((level,len(self.plev[level])-1))
    def addTime(self,time=(-1.,-1.)):
        if (not time == (-1.,-1)) and self.plev:
            self.plev[self.cur][-1].audio = time
            self.plev[self.cur][-1].acheck = True
    def addSeg(self,a):
        """Sends to the plev's 'addSeg' method."""
        self.plev[self.cur][-1].addSeg(a,self.trans)
    def endLevel(self):
        for a in self.plev[self.cur][-1].tiers:
            self.plev[self.cur][-1].ends.append(len(self.trans.tiers[a].segments))
        self.cur -= 1
       
def getStruct(trans,ptree):
    """Support function to assign refs / timestamps."""
        # Parents
        ## We create a masterlist (of all segments of all tiers of all levels)
    cur = 0; masterlist = []
    for a in range(len(ptree.levels)):
        masterlist.append([])
        for b in range(len(ptree.levels[a])):
            masterlist[a].append([])
        # We load all plevs in that masterlist
    ind = -1; check = False
    for plev in ptree:
        l = plev.level
            # If there is no tier, we fill with 'None'
        if not plev.tiers:
            for a in range(len(masterlist[l])):
                masterlist[l][a].append(None)
            continue
            # Otherwise we fill with either 'None' or the tier start/end positions
        for a in range(len(ptree.levels[l])):
            ind = ptree.levels[l][a]; check = False
            for b in range(len(plev.tiers)):
                if ind == plev.tiers[b]:
                    masterlist[l][a].append(plev)
                    check = True; break
            if check == False:
                masterlist[l][a].append(None)
        # We use the masterlist to determine the PARENTS
    for l in range(len(masterlist)):
        if not masterlist[l]:
            continue
            # Level 0: tier 0 has no parent, tiers 1-n have tier 0 as parent
        if l == 0:
            pindex = ptree.levels[l][0]; ptier = trans.tiers[pindex]
            ptier.level = l; ptier.pindex = -1; ptier.parent = ""
            for t in range(1,len(masterlist[l])):
                tier = trans.tiers[ptree.levels[l][t]]; tier.level = l
                tier.pindex = pindex; tier.parent = ptier.name
                ptier.children.append(ptree.levels[l][t])
            # Other levels:
            ## We need to find for each tier a consistent parent
        n = 1; check = False; l_ptiers = []
        for t in range(len(masterlist[l])):
            ind = ptree.levels[l][t]; tier = trans.tiers[ind]; tier.level = l
            l_tiers = []
            for i in masterlist[l][t]:
                if (not i == None) and i.tiers not in l_tiers:
                    l_tiers.append(i.tiers)
                # If it's at the same level and not the first tier, then it's ASSOC
            n = -1
            for list in l_tiers:
                if ind in list:
                    n = list.index(ind)
                    if n > 0:
                        tier.pindex = list[0]; ptier = trans.tiers[tier.pindex]
                        tier.parent = ptier.name
                        if ind not in ptier.children:
                            ptier.children.append(ind)
                        break
            if n > 0:
                continue
                # If it's the first tier, we have to check above levels
                ## We check all above levels for a consistent parent tier
            n = 1; pos = False; check = False; l_ptiers.clear()
            while True:
                if l-n < 0:
                    check = False; break
                    # We add all tiers at level 'l-n'
                for pt in ptree.levels[l-n]:
                    l_ptiers.append(pt)
                    # We go through all the plevs of that tier
                for s in range(len(masterlist[l][t])):
                    if masterlist[l][t][s] == None:
                        continue
                    plev = masterlist[l][t][s]
                    pplev = ptree.plev[plev.plevel][plev.pplev]
                        # We go recursively through all parent plevs
                    while not pplev.level == l-n:
                        if (pplev.plevel < 0) or (pplev.pplev < 0):
                            pplev = None; break
                        pplev = ptree.plev[pplev.plevel][pplev.pplev]
                    if pplev == None:
                        break
                    o = 0
                        # We compare all tiers with the tiers at that parent plev
                    while o < len(l_ptiers):
                        pos = False
                        for pt in pplev.tiers:
                            if l_ptiers[o] == pt:
                                pos = True; break
                        if pos == False:
                            l_ptiers.pop(o)
                        else:
                            o += 1
                    if not l_ptiers:
                        break
                    # If at least one tier remains throughout, we take it
                if l_ptiers:
                    tier.pindex = l_ptiers[0]; ptier = trans.tiers[tier.pindex]
                    tier.parent = ptier.name
                    ptier.children.append(ind)
                    check = True; break
                n += 1
    masterlist.clear()

        # Breathe
        # We only got the parents; we now need to setup the refs
    start = -1.; end = -1.; fS = -1
    for plev in ptree:
        if plev.acheck:
            start = plev.audio[0]; end = plev.audio[1]; dur = end-start
        for a in range(len(plev.tiers)):
            tier = trans.tiers[plev.tiers[a]]
            if plev.acheck:
                tier.truetype = "time"
                if fS == -1:
                    fS = plev.tiers[a]
            else:
                tier.truetype = "ref"
            if not tier.parent:
                if plev.acheck:
                    for b in range(plev.starts[a],plev.ends[a]):
                        seg = tier.segments[b]
                        seg.start = start + dur*((b-plev.starts[a])/
                                    (plev.ends[a]-plev.starts[a]))
                        seg.end = start + dur*(((b+1)-plev.starts[a])/
                                  (plev.ends[a]-plev.starts[a]))
                continue
            ptier = trans.tiers[tier.pindex]
            pplev = plev
                # We go recursively through all parent plevs
                # We know the parent must be there
            while not pplev.level <= ptier.level:
                pplev = ptree.plev[pplev.plevel][pplev.pplev]
            pseg = None
            for b in range(len(pplev.tiers)):
                if pplev.tiers[b] == tier.pindex:
                    pseg = ptier.segments[pplev.starts[b]]
            for b in range(plev.starts[a],plev.ends[a]):
                seg = tier.segments[b]
                seg.ref = pseg.id
                if plev.acheck:
                    seg.start = start + dur*((b-plev.starts[a])/
                                (plev.ends[a]-plev.starts[a]))
                    seg.end = start + dur*(((b+1)-plev.starts[a])/
                              (plev.ends[a]-plev.starts[a]))
        # We still have to ensure that the higher levels have timestamps
    l_times = []; oref = ""; pos = 0; tTier = trans.tiers[fS]; l_segs = []
    for l in range(tTier.level,0,-1):      # From first 'time' tier and up
        pos = 0; ptier = trans.tiers[tTier.pindex]; pseg = None
        for b in range(len(tTier)):
            if not tTier.segments[b].ref == oref:
                if l_segs:
                    pseg.start = l_segs[0].start; pseg.end = l_segs[-1].end
                oref = tTier.segments[b].ref; l_segs = [tTier.segments[b]]
                for a in range(pos,len(ptier)):
                    if ptier.segments[a].id == tTier.segments[b].ref:
                        pseg = ptier.segments[a]; pos = a; break
                continue
            l_segs.append(tTier.segments[b])
        if l_segs:
            pseg.start = l_segs[0].start; pseg.end = l_segs[-1].end
        tTier = ptier
def checkName(trans,elem,ptree,t_count, g_lang):
    """Support function to deal with FORM and TRANSL."""
        # We get an identifier "idLev"
    idLev = ""; l_tag = ptree.plev[ptree.cur][-1].tag; ind = len(trans)
    if "kindOf" in elem.attrib:
        idLev = l_tag + "_" + elem.attrib["kindOf"]
    elif g_lang in elem.attrib:
        idLev = l_tag + "_" + elem.attrib[g_lang]
    else:
        idLev = l_tag + "_" + elem.tag + str(t_count[-1])
    tier = None
        # We look for that identifier
        ## We find the tier
    for a in ptree.levels[ptree.cur]:
        if idLev == trans.tiers[a].name:
            tier = trans.tiers[a]; ind = a; break
        ## Or we create a new tier
    if tier == None:
        ptree.levels[ptree.cur].append(len(trans.tiers))
        trans.addtier(idLev); tier = trans.tiers[-1]; t_count[-1] += 1
        elem.attrib["tag"] = elem.tag
        tier.pangloss = (ptree.plev[ptree.cur][-1].attrib, elem.attrib)
    return tier, ind, t_count
def fromPangloss(f,**args):
    """Creates a Transcription object out of the Pangloss format.
    
    Relies on the xml library.
    Assumes the transcription has been preprocessed so there is no ARCHIVE level."""
    
        # **args is for "encoding", which isn't used due to the xml library
    
        # Variables
    trans = Transcription()
    ptree = Ptree(trans)
    root = None
        # Variables 2
    header = ""; g_lang = ""; count = 0
    
    b_root = False; header = True; parse = True
    tier = None; t_count = [0]
        # Mainloop
    for event, elem in ETree.iterparse(f, events=("start","end")):
        if event == "start":
                # The root should be either TEXT or WORDLIST
            if b_root == False:
                root = elem; elem.attrib['tag'] = elem.tag
                ptree.addPlev(elem.tag,elem.attrib,0)
                for key, value in root.items():
                    if key.endswith("lang"):
                        g_lang = key
                        trans.metadata.transcript["languages"] = [value]
                    elif key == "id":
                        trans.metadata.transcript["name"] = value
                b_root = True; continue
                # Wait for the header to be dealt with
            elif header == False:
                continue
            elif elem.tag == "HEADER":
                header = False; continue
                # Audio
            elif elem.tag == "AUDIO":
                time = ((float(elem.attrib["start"])
                        ,float(elem.attrib["end"])))
                ptree.addTime(time)
                # Tiers
            elif (elem.tag == "FORM") or (elem.tag == "TRANSL"):
                tier, a, t_count = checkName(trans,elem,ptree,t_count,g_lang)
                tier.addsegment(-1,-1.,-1.,"","a"+str(count),"",True,tier,1)
                ptree.addSeg(a)
                tier.segments[-1].pangloss = elem.attrib
                count += 1; parse = False
            elif parse == False:
                continue
                # Notes
            elif ((elem.tag == "NOTE") or (elem.tag == "AREA") or (elem.tag == "FOREIGN")):
                continue
                # Levels
            else:
                elem.attrib["tag"] = elem.tag
                ptree.addPlev(elem.tag,elem.attrib); t_count.append(0)
        else:
                # HEADER
            if header == False:
                    # Long as header is not done, ignore all
                if not elem.tag == "HEADER":
                    continue
                    # Get the header
                soundfile = elem.find("SOUNDFILE")
                if soundfile:
                    trans.metadata.transcript["soundFile"] = soundfile.attrib["href"]
                trans.metadata.header = "\t" + (ETree.tostring(elem, "utf-8")
                                                     .decode("utf-8"))
                header = True; root.remove(elem)
                # End of tier
            elif (elem.tag == "FORM") or (elem.tag == "TRANSL"):
                tier.segments[-1].content = elem.text
                parse = True; elem.clear()
            elif parse == False:
                continue
                # Others
            elif (elem.tag == "NOTE") or (elem.tag == "AREA"):
                plev = ptree.plev[ptree.cur][-1]
                if not plev.tiers:
                    plev.notes.append((-2,elem.tag,elem.attrib,elem.text))
                else:
                    tier = trans.tiers[plev.tiers[-1]]
                    tier.segments[-1].notes.append((-1,elem.tag,elem.attrib,elem.text))
            elif (elem.tag == "FOREIGN") or (elem.tag == "AUDIO"):
                continue
                # End of level
            else:
                ptree.endLevel()
                elem.clear(); t_count.pop()
    del root
        # We get the refs / timestamps
    getStruct(trans,ptree)
    trans.format = "pangloss"
    return trans