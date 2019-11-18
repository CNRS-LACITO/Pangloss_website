from .Transcription import Transcription, Tier
from xml.sax.saxutils import escape
    
class Child:
    """Container class for each 'child'."""
    
    def __init__(self,trans,pindex,pos,start,end):
            # Parent
        self.pindex = pindex
        self.parent = trans.tiers[pindex]
        self.ppos = pos
        self.ts = start
        self.te = end
            # Children
        self.children = self.parent.children
        self.start = pos+1
        self.pos = pos+1
        self.end = self.start+len(self.children)
        
class Tree:
    """Container class to keep track of the writing."""
    
    def __init__(self,trans,pindex,struct,type,tab,id):
            # Parent
        self.pindex = pindex
        self.parent = trans.tiers[pindex]
        self.ppos = 0
            # Help
        self.trans = trans
        self.type = type
        self.tab = tab
        self.id = id
        self.time = (-1.,-1.)
            # Levels
        self.struct = struct
        self.cur = 0
        self.pos = []
        self.max = []
        self.child = []
        self.levels = {}    # What does it contain again?
            # Checks
        self.open = []      # A level is open and needs closure
        self.nochild = []   # This FORM/TRANSL can never open a level
        self.active = []    # A FORM/TRANSL was created
        self.over = []      # No more segment left at this point
        
            # Operations
            ## 'self.levels'
        child = self.parent.children
        for a in range(len(struct)):
            i = struct[a]
            if i not in child:
                p = a-1; j = struct[p]; child = trans.tiers[j].children
                while i not in child:
                    j = trans.tiers[j].pindex
                    if j < 0:
                        break
                    child = trans.tiers[j].children
                self.levels[p] = struct.index(j)
            ## 'self.pos' / 'self.max' / checks
        for a in range(len(struct)):
            self.pos.append(0); self.max.append(len(trans.tiers[struct[a]]))
            self.open.append(False); self.active.append(False); self.over.append(False)
            self.nochild.append(True)
            if a in self.levels:
                self.nochild[-1] = False
       
    def addChild(self,time=(-1.,-1.),pos=-1):
        if pos >= 0:
            self.cur = pos
        if time[0] >= 0 and time[1] >= 0:
            self.time = time
        self.child.append(Child(self.trans,self.struct[self.cur],self.cur,
                                self.time[0],self.time[1]))
    def getOne(self,pos=-1):
        """Gets ONE segment. Returns the text, position and timestamps."""
        
        text = ""
        if pos >= 0:
            self.cur = pos  
        self.active[self.cur] = False; self.over[self.cur] = False; self.time = (-1.,-1.)
        ind = self.struct[self.cur]; Ctier = self.trans.tiers[ind]
        while self.pos[self.cur] < self.max[self.cur]:
            cseg = Ctier.segments[self.pos[self.cur]]
            if cseg.start >= self.child[-1].te:
                self.over[self.cur] = True; break
            elif cseg.start >= self.child[-1].ts and cseg.end <= self.child[-1].te:
                if self.open[self.cur]:
                    text = text + writeLevel(self.trans,self.child[-1].pindex,self.type,
                                             self.tab,self.id,-1.,-1.,1)
                    self.open[self.cur] = False
                if not self.nochild[self.cur]:
                        # If a Child doesn't exist yet
                    if (not self.child[-1].ppos == self.cur):
                        self.child.append(Child(self.trans,self.struct[self.cur],self.cur,
                                                cseg.start,cseg.end))
                    text = text + writeLevel(self.trans,self.child[-1].pindex,self.type,
                                             self.tab,self.id,cseg.start,cseg.end,0)
                    self.tab = self.tab + "\t"; self.open[self.cur] = True; self.id += 1
                self.time = (cseg.start,cseg.end)
                text = text + writeText(self.trans,ind,cseg,self.type,self.tab)
                self.active[self.cur] = True; self.pos[self.cur] += 1; break
            self.pos[self.cur] += 1
            # End of tier
        if self.pos[self.cur] >= self.max[self.cur]:
            self.over[self.cur] = True
        return text, self.tab, self.cur, self.time
    def checkChild(self,i=-1):
        """Checks if all children have exhausted their segments."""
        
        child = self.child[i]; check = True
        for a in range(child.start,child.end):
            if not self.over[a]:
                check = False; break
        return check
    def getNext(self,pos=-1):
        """Gets the next tier ('pos')."""
        
        text = ""
        if pos >= 0:
            self.child[-1].pos = pos+1
        else:
            self.child[-1].pos += 1
            # If the child is over, we go to the parent
        while self.child[-1].pos >= self.child[-1].end:
            self.tab = self.tab[:-1]
            text = text + writeLevel(self.trans,self.child[-1].pindex,self.type,self.tab,
                                     self.id,-1.,-1.,1)
            self.child.pop()
                # End of loop
            if not self.child:
                return -1, text, self.tab
            if self.child[-1].pos < self.child[-1].end-1:
                break
        pos = self.child[-1].pos; self.cur = pos; self.open[self.cur] = False
        return pos, text, self.tab
            
    
def checkType(trans, l_parents, l_struct, l_type, l_plevs):
    """Support function to check the type for each child tier.
    
    Types can be "FORM", "TRANSL" or a LEVEL string.
    'l_type' should be a dictionary with (tier index : type)."""

        # if 'l_type' isn't provided, we have to guess
    if not l_type:
            # If it's from Pangloss, we can tell
            ## In that case we ignore 'l_plevs' entirely
            ## /!\ DANGEROUS! If someone adds tiers, those won't have pangloss attributes
        if trans.format == "pangloss":
            for a in l_parents:
                Ctier = trans.tiers[a]
                if not Ctier.pangloss:
                    l_type.clear(); trans.format = ""; return
                l_type[a] = (-1,Ctier.pangloss[0]['tag'],Ctier.pangloss[1]['tag'])
            for a in range(len(l_struct)): # parent tier
                struct = l_struct[a]
                for b in range(len(struct)):
                    ind = struct[b]; Ctier = trans.tiers[ind]
                    if not Ctier.pangloss:
                        l_type.clear(); trans.format = ""; return
                    plev = trans.tiers[Ctier.pindex].pangloss[0]['tag']
                    clev = Ctier.pangloss[0]['tag']
                    if clev == plev:
                        l_type[ind] = (Ctier.pindex,"",Ctier.pangloss[1]['tag'])
                    else: # We ignore 'l_plevs' entirely
                        l_type[ind] = (Ctier.pindex,clev,Ctier.pangloss[1]['tag'])
            # Otherwise we automatically attribute FORM or sublevel according to ASSOC/SUBD
        else:
            for a in l_parents:
                l_type[a] = (-1,"TEXT","FORM")
            count = 0
            for struct in l_struct:
                    # For each child tier
                for a in struct:
                    Ctier = trans.tiers[a]; lc = len(Ctier)
                    Ptier = trans.tiers[Ctier.pindex]; lpt = len(Ptier)
                    if lc > lpt:
                        while Ctier.level >= lp:
                            l_plevs.append("L"+str(count)); count += 1
                        l_type[a] = (Ctier.pindex,l_plevs[Ctier.level],"FORM"); break
                    pos = 0; type = ""
                        # For each segment of the child tier
                    for seg in Ctier:
                        start = seg.start; end = seg.end
                            # We look for corresponding boundaries in the parent tier
                        for b in range(pos,lpt):
                            if (Ptier.segments[b].start == start
                                and Ptier.segments[b].end == end):
                                pos = c; break
                            elif Ptier.segments[b].start > start:
                                type = "subd"; pos = b; break
                        if type:
                            break
                    if not type: # All segments match, should be ASSOC
                        l_type[a] = (Ctier.pindex,"","FORM")
                    else: # Mismatch, should be SUBD
                        while Ctier.level >= lp:
                            l_plevs.append("L"+str(count)); count += 1
                        l_type[a] = (Ctier.pindex,l_plevs[Ctier.level],"FORM")
        # If 'l_type' is provided, we want to check 'l_plevs'
    else:
        for struct in l_struct:
            for a in struct:
                if not a in l_type:
                    l_type.clear(); return l_type
    return l_type
def writeLevel(trans,a,l_type,tab,id,start=-1.,end=-1.,mode=0,name="",lang=""):
    """Support function to write the start or end of a level."""
    
    tier = trans.tiers[a]
    if mode == 0:
        if name and lang:
            attrib = " id=\"{}\" xml:lang=\"{}\"".format(name,lang)
        else:
            attrib = ""
            if tier.pangloss: # Only Pangloss 'metadata' at the tier/segment level
                if not 'id' in tier.pangloss[0]:
                    attrib = attrib + " id=\"a"+str(id)+"\""
                for key, item in tier.pangloss[0].items():
                    if not key == "tag":
                        if 'lang' in key:
                            key = "xml:lang"
                        if key == 'id':
                            item = 'a'+str(id)
                        attrib = attrib + " {}=\"{}\"".format(escape(key),escape(item))
        if start >= 0 and end >= 0:
            text = ("{}<{}{}>\n{}\t<AUDIO start=\"{:.3f}\" end=\"{:.3f}\" />\n"
                    .format(tab,l_type[a][1],attrib,tab,start,end))
        else:
            text = ("{}<{}{}>\n"
                    .format(tab,l_type[a][1],attrib,tab))
    elif mode == 1:
        text = "{}</{}>\n".format(tab,l_type[a][1])
    return text
def writeText(trans,a,seg,l_type,tab):
    """Support function to write a FORM or TRANSL and affiliated NOTEs/AREAs."""
    
    tier = trans.tiers[a]
        # FORM TRANSL
    attrib = ""
    if seg.pangloss:
        for key, item in seg.pangloss.items():
            if not key == "tag" and not key == "kindOf":
                if 'lang' in key:
                    key = "xml:lang"
                attrib = attrib + " {}=\"{}\"".format(escape(key),escape(item))
        if not tier.name and ("kindOf" in seg.pangloss):
            tier.name = seg.pangloss['kindOf']
    if tier.name:
        text = ("{}<{} kindOf=\"{}\"{}>{}</{}>\n"
                .format(tab,l_type[a][2],tier.name,attrib,escape(seg.content),l_type[a][2]))
    else:
        text = ("{}<{}{}>{}</{}>\n".format(tab,l_type[a][2],attrib,seg.content,l_type[a][2]))
        # NOTEs:
    for pos, ntag, nattr, body in seg.notes:
        attrib = ""
        for key, item in nattr.items():
            if 'lang' in key:
                key = "xml:lang"
            attrib = attrib + " {}=\"{}\"".format(escape(key),escape(item))
        if pos == -1:
            if not body:
                body = ""
            text = text + ("{}<{}{}>{}</{}>\n".format(tab,ntag,attrib,escape(body),ntag))
    return text

def toPangloss(f,trans,**args):
    """Creates a CRDO file from a Transcription object.
    
    ARGUMENTS:
    'levels'    :   a list of strings for the Pangloss levels
                    by default ["TEXT","S","W","M"]
    'types'     :   a dictionary associating tiers with a type "FORM"/"TRANSL" or LEVEL
                    LEVEL means the first FORM of a new Pangloss level
                    Example: {0 : "WORDLIST", 1 : "W", 2 : "TRANSL", ... }
    NOTE: 'types' is the reference, 'levels' is only there for automatic type generation.
    'lang/name' :   strings for transcription attributes (the root tag)
    Other arguments are 'lang' and 'name' for the TEXT tag, 'encoding' and 'noteSep'."""
    
        # Variables
        ## 'l_plevs' for the 'levels' argument
        ## 'l_type' for the 'types' argument
    l_plevs = ["TEXT","S","M","W"]; l_type = {}
    if "levels" in args:
        l_plevs = args['levels']
    lp = len(l_plevs)
    if "types" in args:
        l_type = args['types']
    pangloss = False # If it was imported from a Pangloss file.
    if trans.format == "pangloss":
        pangloss = True
    lang = "und"; name = trans.name # General transcription variables
    if "lang" in args:
        lang = args['lang']
    elif "languages" in trans.metadata.transcript:
        lang = trans.metadata.transcript['languages'][0]
    if "name" in args:
        name = args['name']
    elif "name" in trans.metadata.transcript:
        name = trans.metadata.transcript['name']
    encoding = "utf-8"
    if "encoding" in args:
        encoding = args['encoding']
    noteSep = "_" # For NOTEs, a separator for 'kindOf' variables.
    if "noteSep" in args:
        noteSep = args['noteSep']
        
        # We will rely on time boundaries for children segments
    trans.setchildtime()
        # We gets the parents
    l_parents = []; max = 0
    for a in range(len(trans)):
        if trans.tiers[a].level == 0:
            l_parents.append(a)
        elif trans.tiers[a].level >= max:
            max = trans.tiers[a].level+1
        # We get their children trees:
        ## 'getAllChildren' : returns a list of tier indexes in the order to process
    l_struct = []
    for a in l_parents:
        l_struct.append(trans.tiers[a].getAllChildren(1))
        # We check 'l_type'
        ## If the provided 'l_type' proved incomplete, we need to recreate one
    l_type = checkType(trans, l_parents, l_struct, l_type, l_plevs)
    if not l_type:
        l_type = checkType(trans, l_parents, l_struct, l_type, l_plevs)
            
        
        
        #### We start writing ####
        ##########################

    l_plevs.clear(); l_pos = []; l_max = []; tab = ""; id = 0
    with open(f,'w', encoding=encoding) as file:
        if len(l_parents) > 1:
            file.write("<ARCHIVE>"); tab = tab + "\t"
            
            # For each parent tier
        text = ""
        for a in range(len(l_parents)):
            pind = l_parents[a]; struct = l_struct[a]
            Ptier = trans.tiers[pind]
            
                #### This is just to set up the main level ####
                ###############################################
            
                # Parent tag
            while True:
                if not Ptier.pangloss:
                    Ptier.pangloss = ({},{})
                    Ptier.pangloss[0]['id'] = name; Ptier.pangloss[0]['xml:lang'] = lang
                text = writeLevel(trans,pind,l_type,tab,id,Ptier.start,Ptier.end,0,name,lang)
                tab = tab + "\t"; id += 1
                    # We add the header
                    ## /!\ We don't know if the header has been tampered with!
                if pangloss and trans.metadata.header:
                    text = text + trans.metadata.header
                    # We add metadata in NOTEs.
                    ## We first add the -2 notes if there are some
                metadata = ""
                if pangloss and Ptier.segments:
                    seg = Ptier.segments[0]
                    for pos, ntag, nattr, body in seg.notes:
                        if pos == -2:
                            attrib = ""
                            for key, item in nattr.items():
                                if 'lang' in key:
                                    key = "xml:lang"
                                attrib = attrib + " {}=\"{}\"".format(escape(key),escape(item))
                            if not body:
                                body = ""
                            metadata = metadata + ("{}<{}{}>{}</{}>\n"
                                           .format(tab,ntag,attrib,escape(body),ntag))
                    ## Then the 'universal metadata' (see 'Transcription.py')
                for tuple in trans.metadata:
                    metadata = metadata + ("\t<NOTE kindOf=\"{}{}{}\" message=\"{}\"></NOTE>\n"
                               .format(escape(tuple[0]),noteSep,escape(tuple[1]),escape(tuple[2])))
                file.write(text+metadata); text = ""
                break
            
                #### Now we actually deal with the children ####
                ################################################
                
            ptree = Tree(trans,pind,struct,l_type,tab,id)
            for seg in Ptier:
                ptree.child.append(Child(trans,pind,0,seg.start,seg.end))
                text = text + writeText(trans,pind,seg,l_type,tab)
                pos = 0; copy = ""

                while True:
                        # We get a new segment
                    copy, tab, pos, time = ptree.getOne(pos)
                    text = text + copy
                        # We have to determine the next tier ('pos')
                    if ptree.nochild[pos]:
                            # A.1. The tier has no child and can keep going
                        if not ptree.over[pos]:
                            continue
                            # A.2. The tier has no child but is over
                        else:
                            pos,copy,tab = ptree.getNext(pos)
                            file.write(text+copy); text = ""
                            if pos == -1:
                                break
                    else:
                            # B.1. The tier doesn't have a 'Child' yet
                        if not ptree.child[-1].ppos == pos:
                                # Only if that level has activated yet
                            if ptree.active[pos]:
                                ptree.addChild(time)
                                pos += 1; continue
                                # Otherwise that tier is over
                            pos,copy,tab = ptree.getNext(pos)
                            file.write(text+copy); text = ""
                            if pos == -1:
                                break
                            # B.2. Not all children have been exhausted
                        if not ptree.checkChild(-1):
                            pos = ptree.child[-1].start; continue
                            # B.3. All children have been exhausted
                        pos,copy,tab = ptree.getNext(pos)
                        file.write(text+copy); text = ""
                        if pos == -1:
                            break
            # End of root level
        if len(l_parents) > 1:
            file.write(text + "</ARCHIVE>")
            
