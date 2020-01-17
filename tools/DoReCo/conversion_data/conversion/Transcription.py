"""17/10/2019
Provides a 'Transcription' class as an intermediary step for conversions.

Structure:
    Transcription
        Metadata
        Tier 1
            Segment 1, Segment 2, ... Segment n
        Tier 2
            Segment 1, Segment 2, ... Segment n
        ...
        Tier n
Transcription and Tier classes are iterable.

A transcription in oral linguistics is a transcription (text) time-aligned
 with its recording; that is, text segmented in time segments (segments).
 Since multiple types of texts can exist (translations, speakers, annotations,
 ...), each type has its own set of segments: this is called here a 'tier'."""
        
class Segment:
    """A container class for "annotation units".
    
    Methods are anecdotal."""
    def __init__(self, start=0., end=0., cont="", id="", ref="",
                 unit=True, tier=None):
        self.start = start
        self.end = end
        self.content = cont
        self.tier = tier
        self.unit = unit
            # Pangloss variables
        self.pangloss = {}
        self.notes = [] # list of tuples (pos, tag, attrib, text)
            # ELAN variables
        self.elan = {}
        self.id = id
        self.ref = ref
    
    def copy(self):
        copy = Segment(self.start,self.end,self.content,self.id,self.ref,self.unit,self.tier)
        copy.pangloss = self.pangloss.copy()
        copy.notes = self.notes.copy()
        copy.elan = self.elan.copy()
        return copy
        
    def setseg(self, **args):
        """Helps with 'safely' updating the segment.
        Only updates the given arguments."""
        for name, value in args.items():
            if name == "start":
                self.start = value
            elif name == "end":
                self.end = value
            elif name == "content":
                self.content = value
            elif name == "id":
                self.id = value
            elif name == "ref":
                self.ref = value
            elif name == "unit":
                self.unit = value
            elif name == "tier":
                self.tier = value
    def setElan(self, dictionary):
        self.elan = dictionary
        if "ANNOTATION_ID" in dictionary:
            self.id = dictionary["ANNOTATION_ID"]
    def uptime(self, start, end):
        self.start = start
        self.end = end
    
class Tier:
    """A list of Segment classes corresponding to a tier.
    
    When iterated upon, returns each segment in 'self.segments'.
    'checktime'     : uses the segments timestamps to set the tier's start/end.
    'addsegment'    : should be a safe way to add segments.
    'content'       : returns a list of all segments' content.
    Other methods are anecdotal."""
    
    def __init__(self, name="", start=-1., end=-1., trans=None):
        self.name = name
        self.start = start
        self.end = end
        self.trans = trans
        self.segments = []
            # Pangloss variable
        self.pangloss = ({},{}) # Tuple of two dictionaries (level, FORM/TRANSL)
            # ELAN cariables
        self.elan = {}
        self.truetype = ""      # 'time' or 'ref'
        self.parent = ""        # reference id
        self.pindex = -1
        self.level = 0          # depth of parenting (default 0, no parent)
        self.children = []      # list of tier indexes
            # hash
        self.thash = None        # list of lists of lists of tuple (int,index)
    
    def __len__(self):
        return len(self.segments)
    def __iter__(self):
        self.its = -1
        self.itf = len(self.segments)
        return self
    def __next__(self):
        self.its += 1
        if self.its < self.itf:
            return self.segments[self.its]
        else:
            raise StopIteration
      
    def copy(self):
        copy = Tier(self.name, self.start,self.end,self.trans)
        for seg in self.segments:
            copy.segments.append(seg.copy())
        copy.pangloss = self.pangloss.copy()
        copy.elan = self.elan.copy()
        copy.truetype = self.truetype; copy.parent = self.parent
        copy.pindex = self.pindex; copy.level = self.level
        copy.children = self.children.copy()
        return copy
      
    def sethash(self):
        """Create a list of lists of indexes to fast-find a segment.
        Only use after checking the tier's time boundaries.
        The depth goes to the tenth of a second."""
        
            # Variables
        max = 0.; p = 0; ls = len(self.segments)
        l_temp = []; self.thash = []
        oseg = 0; ob = 0; o0 = 0; o1 = 0; o2 = 0; l1=0; l2=0
            # We check that the timestamps are ordered
        for seg in self.segments:
            if (seg.end < seg.start) or (seg.start < max):
                self.thash = None
                return
            max = seg.end
            # We find the depth
        while max >= 0.1:
            max /= 10; p += 1
            # We quickly get segment integers to reduce calculus load
        for seg in self.segments:
            list = []; start = int(seg.start*10)
            for a in range(p):
                list.append(start % 10); start //= 10
            l_temp.append(list)
            # We get the indexes
        o0 = 0; o1 = 0; o2 = 0; l1 = 0; l2 = 0; ob = ls; max = 0
        for a in range(p):
            self.thash.append([]); self.thash[a].append([(0,0)])
                # For each segment
            for b in range(ls):
                seg = l_temp[b][p-(a+1)]
                    # Does 'b' get past the upper-list's 'b'?
                if b >= ob:
                    if o2 == l2:                # Next upper-list
                        o1 += 1; o2 = 1; l2 = len(self.thash[o0][o1])-2
                    else:                       # Next tuple
                        o2 += 1
                    self.thash[a][-1].append((10,ob))
                    self.thash[a].append([(0,ob)]); oseg = 0
                    if len(self.thash[a]) > 2:
                        max += len(self.thash[a][-3])-2
                    self.thash[a][-2].append(max)
                    ob = self.thash[o0][o1][o2][1]
                    # Does 'seg' increment?
                if seg > oseg:
                    if (len(self.thash[a]) > 1 and
                        self.thash[a][-1][-1][1] == b):
                        self.thash[a][-1][-1] = (seg,b)
                    else:
                        self.thash[a][-1].append((seg,b))
                    oseg = seg
            ob = self.thash[a][0][1][1]; oseg = 0
            if len(self.thash[a]) > 1:
                max += len(self.thash[a][-2])-2
            self.thash[a][-1].append((10,ls)); self.thash[a][-1].append(max)
            o1 = 0; o2 = 1; o0 = a; max = 0
            l1 = len(self.thash[o0])-1;l2 = len(self.thash[o0][0])-2
        del l_temp
    def hash(self,time=-1.):
        """Finds the segment within which 'time' occurs."""
        if time < 0. or not self.thash:
            return None
            # Variables
        list = []; t = int(time*10); lh = len(self.thash)
        for a in range(lh):
            list.append(t % 10); t //= 10
        pos = 0; tuple = (0,len(self.segments))
            # Search (on self.thash)
        a = 0
        while a < lh:
            s = list[lh-(a+1)]
            #print("check:",a,s, list)
            for b in range(len(self.thash[a][pos])-2):
                if ((s >= self.thash[a][pos][b][0]) and
                    (s < self.thash[a][pos][b+1][0])):
                    if ((a == lh-1) or ((self.thash[a][pos][b+1][1] -
                        self.thash[a][pos][b][1]) < 10)):
                        if self.thash[a][pos][b][1] > 0:
                            tuple = (self.thash[a][pos][b][1]-1,
                                     self.thash[a][pos][b+1][1])
                        else:
                            tuple = (self.thash[a][pos][b][1],
                                     self.thash[a][pos][b+1][1])
                        a = lh; break
                    pos = self.thash[a][pos][-1]+b; break
            a += 1
            # Search (on self.segments)
        for a in range(tuple[0],tuple[1]):
            if ((time >= self.segments[a].start) and
                (time <= self.segments[a].end)):
                return self.segments[a]
      
    def uptime(self, t_d, t_i):
        self.start = t_d
        self.end = t_i
    def checktime(self):
        self.start = self.segments[0].start
        self.end = self.segments[-1].end
    def setElan(self, dictionary):
        """Fills the 'self.elan' dictionary.
        That dictionary is accessible but not meant for use.
        Sets 'parent'. Cannot set 'truetype' yet."""

        if "PARENT_REF" in dictionary:
            self.parent = dictionary["PARENT_REF"]
            del dictionary ["PARENT_REF"]
        del dictionary["TIER_ID"]
        self.elan = dictionary
    def addsegment(self, p=-1, start=-1., end=-1., cont="", id="", ref="",
                   unit=True, tier=None, mode=0):
        """Inserts a new segment.
        In mode='0', adjusts the boundaries, including creating false
        segments."""
            # Setup
        if (p < 0) or (p > len(self.segments)):
            p = len(self.segments)
        if not tier:
            tier = self
            # Mode '0': edits previous boundary or adds segment
        if (mode == 0) and (self.segments):
            fin = self.segments[p-1].end
            if start < fin:
                self.segments[p-1].setseg(end=start)
            elif start > fin:
                self.segments.insert(p, Segment(self.segments[p-1].end,
                                     start, "", id, "", False, tier)); p += 1
            # Actual insertion
        self.segments.insert(p, Segment(start, end, cont, id, ref, unit, tier))
    def checksegment(self):
        """Simply recreates the whole list of segments in mode 0."""
        l_trans = []; p = 0
        for seg in self.segments:
            l_trans.append(seg)
        self.segments.clear()
        for seg in l_trans:
            self.addsegment(-1, seg.start, seg.end, seg.content, seg.id, seg.ref,
                            seg.unit, seg.tier, 0)
            self.segments[-1].pangloss = seg.pangloss
            self.segments[-1].notes = seg.notes
            p += 1
        l_trans.clear()
    def reclaim(self):
        """Just in case there was a doubt as to who owns those segments."""
        for seg in self.segments:
            seg.tier = self
    def content(self):
        """Sends a list of all segments' content."""
        l_content = []
        for seg in self.segments:
            l_content.append(seg.content)
        return l_content 
    def getAllChildren(self,mode=0):
        """Expands the 'children' list to all sub-children."""
        
            # Mode 0: list of levels, with lists per parent tier, with lists of children
        if mode == 0:
            l_struct = [[self.children]]; test = True
            while test:
                l_struct.append([]); test = False
                for struct in l_struct[-2]:
                    if not struct:
                        l_struct[-1].append([])
                    for a in struct:
                        if self.trans.tiers[a].children:
                            l_struct[-1].append(self.trans.tiers[a].children)
                            test = True
                        else:
                            l_struct[-1].append([])
                # Mode 1: list of parent tiers, with a list of children tiers in order
                ## This is mainly for Pangloss
        else:
            l_struct = []; temp = []
            for i in self.children:
                if not self.trans.tiers[i].children:
                    l_struct.append(i)
                else:
                    temp.append(i)
            Ctier = None; l_child = [temp.copy()]; l_pos = [0]; l_max = [len(l_child[-1])]
            while True:
                while l_pos[-1] >= l_max[-1]:
                    l_child.pop(); l_pos.pop(); l_max.pop()
                    if not l_child:
                        break
                if not l_child:
                    break
                ind = l_child[-1][l_pos[-1]]; l_pos[-1] += 1
                l_struct.append(ind)
                Ctier = self.trans.tiers[ind]
                if Ctier.children:
                    temp.clear()
                    for i in Ctier.children:
                        if not self.trans.tiers[i].children:
                            l_struct.append(i)
                        else:
                            temp.append(i)
                    l_child.append(temp.copy())
                    l_pos.append(0); l_max.append(len(l_child[-1]))
            
        return l_struct

class Metadata:
    """Contains all metadata for the Transcription class.
    
    By default, the original file's metadata is stored as raw text.
    When parsed, partial data is conventionally selected and stored
     in one of the four dictionaries, then retrieved for operation or
     conversion."""
    
    def __init__(self):
            # Blocks of unparsed text
            ## It's too complicated and costly to parse everything each time
        self.header = ""
        self.speaker = ""
        self.footer = ""
            # Parsed data
            ## Dictionary keys should be static conventions
        self.corpus = {}
        self.recording = {}
        self.transcript = {}
        self.speakers = {}
        self.metalist = [self.corpus,self.recording,self.transcript,self.speakers]
    
    def __len__(self):
        return (len(self.corpus)+len(self.recording)+len(self.transcript)+len(self.speakers))
        # Iterates over all items of all dictionaries
        ## Relies on the metalist; creates lists from the dictionaries
        ## Returns the 'dictionary name', 'key' and 'value/item'
    def __iter__(self):
        self.its = -1; self.ite = len(self.metalist[0])
        self.ims = 0; self.ime = len(self.metalist)
        self.l_meta = []
        for key, item in self.metalist[0]:
            self.l_meta.append((key,item))
        self.name = "corpus"
        return self
    def __next__(self):
        self.its += 1
        if self.its >= self.ite:
            while True:
                self.ims += 1; self.its = 0
                if self.ims >= self.ime:
                    raise StopIteration
                self.l_meta.clear()
                if not self.metalist[self.ims]:
                    continue
                for key, item in self.metalist[self.ims].items():
                    self.l_meta.append((key,item))
                break
            if self.ims == 1:
                self.name = "recording"
            elif self.ims == 2:
                self.name = "transcript"
            elif self.ims == 3:
                self.name = "speakers"
            else:
                self.name = ""
        return (self.name,self.l_meta[self.its][0],self.l_meta[self.its][1])
    def copy(self):
        copy = Metadata()
        copy.header = self.header; copy.speaker = self.speaker
        copy.footer = self.footer
        copy.corpus = self.corpus.copy()
        copy.recording = self.recording.copy()
        copy.transcript = self.transcript.copy()
        copy.speakers = self.speakers.copy()
        return copy  

class Transcription:
    """Class containing the metadata and a list of Tier classes.
    
    When iterated upon, returns each tier in 'self.tiers'.
    'addtier'/'removetier'  : should provide a safe way to manipulate tiers.
    'settimetable'          : an ordered list of timestamps is memory-heavy
                              so it is not created automatically.
    'setchildtime'          : if the structure is in place, this will give
                              proper timestamps to all segments.
    'setstructure'          : sets the tier parents, pindexes and children,
                              and for each segment their ref(erent).
                              /!\ It doesn't use timestamps to guess parents
                                  and refs
    Other methods are anecdotal."""
    def __init__(self, name="", start =-1., end =-1.):
        self.name = name
        self.start = start
        self.end = end
        self.tiers = []
        self.dictionary = None # Elan and Pangloss integrate dictionaries
        self.metadata = Metadata()
            # Complements
        self.notes = [] # Pangloss
        self.timetable = [] # see 'settimetable'
        self.format = "" # where was it imported from
    
    def __len__(self):
        return len(self.tiers)
    def __iter__(self):
        self.its = -1
        self.ite = len(self.tiers)
        return self
    def __next__(self):
        self.its += 1
        if self.its < self.ite:
            return self.tiers[self.its]
        else:
            raise StopIteration
    
    def copy(self):
        copy = Transcription(self.name,self.start,self.end)
        for tier in self.tiers:
            copy.tiers.append(tier.copy())
        copy.metadata = self.metadata.copy()
        copy.notes = self.notes.copy()
        copy.format = self.format
        return copy
    
    def addtier(self, name="", start=-1., end=-1., insert=-1):
        """Creates and adds the tier.
        If 'insert>=0', inserted at index 'insert'; otherwise appended."""
        if insert >= 0 and insert < len(self.tiers):
            self.tiers.insert(insert, Tier(name, start, end, self))
        else:
            self.tiers.append(Tier(name, start, end, self))
    def removetier(self, ind=-1):
        """Removes the tier.
        We check the parent and remove the children index accordingly."""
        if ind < 0 or ind >= len(self.tiers):
            ind = len(self.tiers)-1
            # We check all tiers for all children
            ## It's costly but must be done
        todel = -1
        for atier in self.tiers:
            if atier.children:
                todel = -1
                for b in range(len(atier.children)):
                    if atier.children[b] == ind:
                        todel = b
                    elif atier.children[b] > ind:
                        atier.children[b] = atier.children[b] - 1
                if todel >= 0:
                    ctier = self.tiers[atier.children[todel]]
                    ctier.parent = ""; ctier.pindex = -1
                    ctier.truetype = "time"; ctier.level = 0
                    del ctier
                    atier.children.pop(todel)
        self.tiers.pop(ind)
        
    def settimetable(self, adjust=0):
        """Creates a list of boundaries ordered (smallest to biggest) and without duplicates
        adjust=1 to also adjust the Tier's boundaries"""
    
        self.timetable.clear()
        for tier in self.tiers:
            if tier.truetype and (tier.truetype != "time"):
                continue
            count = 0
            for segment in tier.segments:
                count += 1
                start = segment.start
                if start not in self.timetable:
                    if (not self.timetable) or (start > self.timetable[-1]):
                        self.timetable.append(segment.start)
                    else:
                        for t in self.timetable:
                            if start < t:
                                self.timetable.insert(self.timetable.index(t), start)
                                break
                end = segment.end
                if end not in self.timetable:
                    if (not self.timetable) or (self.timetable[-1] < end):
                        self.timetable.append(segment.end)
                    else:
                        for t in self.timetable:
                            if end < t:
                                self.timetable.insert(self.timetable.index(t), end)
                                break
        if adjust == 1 and self.timetable:
            for time in self.timetable:
                if time >= 0:
                    self.start = time; break
            self.end = self.timetable[-1]
    def uptime(self, mode=0):
        """If you don't want to create a timetable but still adjust the
        Trans's boundaries.
        mode: '0' to use the segments, '1' to use the tier's start/end
        themselves"""
        if mode == 0:
            for tier in self.tiers:
                for segment in tier.segments:
                    start = segment.start
                    if start >= 0. and (self.start > start or self.start < 0.):
                        self.start = start
                    end = segment.end
                    if self.end < end:
                        self.end = end
        elif mode == 1:
            for tier in self.tiers:
                if tier.start >= 0. and (self.start > tier.start
                                         or self.start < 0.):
                    self.start = tier.start
                if self.end < tier.end:
                    self.end = tier.end
    def checktime(self, mode=0):
        """Adjusts each tier's first and last segment to match Transcriptions' start/end time
        mode: '0' to simply update the segment's boundary; '1' to create new segments"""
        for tier in self.tiers:
            start_seg = tier.segments[0]; n_start = start_seg.start
            end_seg = tier.segments[-1]; n_end = end_seg.end
            if mode == 0:
                if n_start > self.start:
                    tier.segments[0].start = self.start
                if n_end < self.end:
                    tier.segments[0].end = self.end
            elif mode == 1:
                if n_start > self.start:
                    tier.addsegment(0, self.start, n_start, "", "", "",
                                    False, tier, 1)
                if n_end < self.end:
                    tier.addsegment(-1, n_end, self.end, "", "", "",
                                    False, tier, 1)
    def checkseg(self):
        """Realigns all tiers segments."""
        
        for tier in self:
            tier.checksegment()
    def sethash(self, l_tiers=[]):
        """Brute-force 'sethash' the tier indexes in l_tiers.
        We try to alter as little of the transcription as necessary."""
        if not l_tiers:
            for a in range(len(self.tiers)):
                l_tiers.append(a)
            setchildtime() # We only 'setchildtime' if all tiers are concerned
        for a in l_tiers:
            tier = self.tiers[a]
            tier.checksegment()
            tier.sethash()
    def setchildtime(self,l_tiers=[]):
        """For ELAN, gives "assoc" and "subd" tiers actual time boundaries."""
        
        self.setstructure()
        if not l_tiers:
            for a in range(len(self.tiers)):
                l_tiers.append(a)
            # We setup the "l_parents" list
        l_parents = [[]]; max = 0
        for a in l_tiers:
            tier = self.tiers[a]
            if tier.level > max:
                l_parents.append([a]); max += 1
            else:
                l_parents[tier.level].append(a)
        l_tiers.clear()
            # We fill
        l_count = []; l_segs = []
        for a in range(len(l_parents)):
            l_tiers = l_parents[a]
            for i in l_tiers:
                ptier = self.tiers[i]; l_count.clear(); l_segs.clear()
                for b in ptier.children:
                    l_count.append(0)
                for pseg in ptier:
                    start = pseg.start; end = pseg.end; dur = end-start
                    for b in range(len(ptier.children)):
                        child = self.tiers[ptier.children[b]]
                        if child.truetype == "time":
                            continue # No altering preexisting timestamps
                        for c in range(l_count[b],len(child)):
                            seg = child.segments[c]
                            if seg.ref == pseg.id:
                                l_segs.append(seg)
                            else:
                                l_count[b] = c; break
                        ls = len(l_segs)
                        for a in range(len(l_segs)):
                            seg = l_segs[a]
                            seg.start = start + (dur*(a/ls))
                            seg.end = start + (dur*((a+1)/ls))
                        l_segs.clear()
                ptier.checktime()
        l_tiers.clear()
    def setstructure(self,mode=0,l_tiers=[], **args):
        """Attributes parents, children, levels, ids and refs to tiers.
        
        'mode'      : '0' - relies on existing refs and parents.
                      '1' - relies on time boundaries.
        'l_tiers'   : the set of tiers on which to operate.
                      /!\ A limited set can break the transcription.
        'ids'       : a string for ids, coupled with an incremented int.
                      if empty, old ids are used (including empty ids).
        This is to automatically get the structure. To be distinguished from
        a manual structuration."""
        
            # Variables
        ids = "a"
        if "ids" in args:
            ids = args['ids']
            # If no tier is selected, we get all tiers
        if not l_tiers:
            for a in range(len(self.tiers)):
                l_tiers.append(a)
        
            ## Mode = 1: using timestamps
            ## /!\ Unfinished
        if mode == 1:
            l_parent = l_tiers.copy(); l_children = []; l_pos = []
            start = -1.; end = -1.
            while l_parent:
                lp = len(l_parent); l_pos.clear()
                for a in range(lp):
                    l_pos.append(0)
                while True:
                    break
            
                    
                
                    
            return
            
            ## Mode = 0: using preexisting refs
        
        l_parent = []; test = 0
            # We set the children
        for a in l_tiers:
            self.tiers[a].children.clear()
        for a in l_tiers:
            tier = self.tiers[a]
            if tier.parent:
                for b in range(len(self.tiers)):
                    if tier.parent == self.tiers[b].name:
                        self.tiers[b].children.append(a)
                        tier.pindex = b
                        test = 1; break
                if test == 0:
                    tier.parent = ""; tier.pindex = -1
                    tier.truetype = "time"
                    l_parent.append(a); test = 0
            else:
                tier.pindex = -1; tier.truetype = "time"
                l_parent.append(a)
            # We set the ids and refs
        l_count = []; l_temp = []; count = 0; level = 0
        while l_parent:
            for a in l_parent:
                ptier = self.tiers[a]; ptier.level = level
                l_count.clear()
                for b in ptier.children:
                    l_count.append(0)
                    l_temp.append(b)
                for pseg in ptier:
                    if not ids:
                        id = pseg.id
                    else:
                        id = ids+str(count); count += 1
                    for b in range(len(ptier.children)):
                        child = self.tiers[ptier.children[b]]; test = 0
                        for c in range(l_count[b],len(child)):
                            seg = child.segments[c]
                            if seg.ref == pseg.id:
                                seg.ref = id
                                if test == 0:
                                    test = 1
                            elif test == 1:
                                l_count[b] = c; break
                    pseg.id = id
            l_parent = l_temp.copy(); l_temp.clear();level += 1
        l_tiers.clear()
    def clear(self,mode=0):
        if mode == 0:
            self.timetable.clear()
        else:
            self.name = ""; self.start = 0.; self.end = 0.
            del self.metadata
            self.tiers.clear()
            self.timetable.clear()