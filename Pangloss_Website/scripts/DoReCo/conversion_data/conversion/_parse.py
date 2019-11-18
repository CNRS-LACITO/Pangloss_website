import re

def getattr(data):
    """Secondary function to get the attributes of a tag.
    Returns a dictionary."""
    attrib = {}; key = ""; value = ""; pos = -1
    if not "=" in data:
        return attrib
    sym = ""
    for elem in re.findall(re.compile(" .+=('|\").+('|\")"),data):
        if "='" in elem.group(0):
            sym = "'"
            key, value = elem.group(0).split("='")
        elif "=\"" in elem.group(0):
            sym = "\""
            key, value = elem.group(0).split("=\"")
        value = value.rsplit(sym,1)[0]
        attrib[key] = value
        
    
def settype(data):
    """Support function to find the type of data sent back.
    Also does tagging and attribution 'cause why not."""
        # Variables
    c_f = len(data); type = -1
    copy = ""; tag = ""; attrib = {}
        # Checking
    if c_f < 2:
        type = 0 # Non-xml
    else:
        if not tag[0] == "<":                   # Non-xml
            type = 0
        elif tag[1] == "/":                     # End
            tag = data[2:c_f-1]
            type = 2
        else:
            if tag[-2] == "/":                  # Unique
                type = 3
            else:                               # End
                type = 1
            sym = ""
            for elem in re.findall(re.compile(" .+=('|\").+('|\")"),data):
                if "='" in elem.group(0):
                    sym = "'"
                    key, value = elem.group(0).split("='")
                elif "=\"" in elem.group(0):
                    sym = "\""
                    key, value = elem.group(0).split("=\"")
                value = value.rsplit(sym,1)[0]
                attrib[key] = value
            if attrib:
                tag = data[1:data.find(" ")]
            elif type == 3:
                tag = data[1:cf-2]
            else:
                tag = data[1:cf-1]
    return tag, attrib, type
def iterparse(file,p=0,mode=0):
    """Finds the next tag. Iterable.
    
    ARGUMENTS:
    'file'      : data to treat (stream or string)
    'p'         : position from which to start
    'mode'      : if 'file' is a stream (0) or string(1)
    /!\ stream must already be opened."""
    
        # Variables
        ## tag      : name of the tag
        ## data     : what has been read thus far
        ## type     : (0) non-tag (1) tag-end-head
        ##            (2) tag-end-tail (3) tag-end-unique
        ## char     : the character being read
        ## ('p' is the index)
    tag = ""; attrib = {}; data = ""; type = 0; char = ""
    tree = Tree()
    if isinstance(file,str):
        mode = 1
        # I/O Stream
    if mode == 0:
            # We check the file's index
        pf = file.tell()
        if p < 0:
            p = pf
        elif not p == pf:
            file.seek(p)
        del pf
            # We start iterating
        while True:
            char = file.read(1)
            if not char:                                    #End of File (EoF)
                tag, attrib, type = settype(data)
                if type > 0:
                    yield tag, attrib, p, type
                else:
                    yield tag, data, p, type
                p = -1; break
            if char == "<":                                 #Start of Tag
                tag, attrib, type = settype(data)
                yield tag, data, p, type
                data = char
            else:
                data = data + char
                p += 1
                if char == ">":                             #End of Tag
                    tag, attrib, type = settype(data)
                    yield tag, attrib, p, type
                    data = ""
        # String
    else:
            # We check the string's index
        pf = len(file)
        if (p < 0) or p >= pf:
            p = 0
            # We start iterating
        for char in range(p, pf):
            if char == "<":                                 # Start of tag
                type = settype(data)
                yield data, p, type
                data = char
            else:
                data = data + char
                if char == ">":                             # End of tag
                    type = settype(data)
                    yield data, p, type
                    data = ""
                

"""def parse(file,p=0,mode=0):
    
    tag = ""; data = ""; type = -1; char = ""
    if isinstance(file,str):
        mode = 1
        # I/O Stream
    if mode == 0:
        if p < 0:
            p = file.tell()
        while type == -1:
            char = file.read(1)
            if not char:
                p = -1; break
            else:
                p += 1
            if char == "<":
                tag = "<"; type = 0
            else:
                data = data + char
        while type == 0:
            char = file.read(1)
            if not char:
                p = -1; break
            else:
                p += 1
            if char == ">":
                type = 1
            tag = tag + char
        # String
    elif mode == 1:
        if p < 0:
            p = 0
        c_f = len(file)
        while type == -1:
            if p < c_file:
                char = file[p]; p += 1
                if char == "<":
                    tag = "<"; type = 0
                else:
                    data = data + char
            else:
                p = -1; break
        while type == 0:
            if p < c_file:
                char = file[p]; p += 1
                if char == ">":
                    type = 1
                tag = tag + char
            else:
                p = -1; break
        # We set the type
    tag = tag.replace("\n","")
    type = settype(tag)
    return data, tag, p, type
    

class Tag:
    
    def __init__(self,name="",attrib=[],data="",cdata=False,
                 level=-1,parent=-1,children=[],type=0):
        self.name = name
        self.attrib = attrib
        self.data = data
        self.cdata = cdata
        self.level = level
        self.parent = parent
        self.children = children
            # For operation
        self.type = type
    
    def settag(self,name="",attrib=[],data="",
               level=-1,parent=-1,children=[],type=0):
        self.name = name
        self.attrib = attrib
        self.data = data
        self.level = level
        self.parent = parent
        self.children = children
    def addchild(self,child):
        self.children.append(child)
    def adddata(self,data,tag=0):
        self.data = self.data + " " + data
        if tag == 1:
            self.data = self.data + "<" + str(len(self.children) + ">")
    def writehead(self, mode=0):
        head = "<" + self.name
        for a in range(len(attrib)):
            head = (head + " " + self.attrib[a][0]
                    + "=\"" + self.attrib[a][1] + "\"")
        if type == 3:
            head = head + "/>"
        else:
            head = head + ">"
        tab = ""
        if mode == 1:
            tab = "\n"
            for a in range(self.level+1):
                tab = tab + "\t"
        return (tab + head)
    def writedata(self, mode=0):
        return data
    def writetail(self, mode=0):
        tail = ""
        if (type == 1) or (type == 2):
            tail = "</" + self.name + ">"
        tab = ""
        if mode == 1:
            tab = "\n"
            for a in range(level+1):
                tab = tab + "\t"
        return (tab + tail)

class Tree:
    
    def __init__(self):
        self.root = -1
        self.levels = 0
        self.tags = []
            # For iteration
        self.its = 0
        self.itf = 0
        
    def __len__(self):
        return len(self.tags)
    def __iter__(self):
        self.its = -1
        self.itf = len(self.tags)
        return self
    def __next__(self):
        self.its += 1
        if self.its < self.itf:
            return self.tags[self.its]
        else:
            raise StopIteration
    def clear(self):
        self.tags.clear()
        self.root = -1; self.levels = 0; self.level = -1

    def addtag(self,tag,data="", type=-1):
            # Setup
        name, attrib = gettag(tag)
        if type < 0:
            type = settype(tag)
            # We add
            ## We need to check the last child
            ## Then we need to check if there is a higher child
            ## We attribute a level, a parent (and conversely) and we add
        if not self.tags:
            if (type == 1) or (type == 3):
                self.tags.append(Tag(name,attrib,"",0,-1,[],type))
        else:
            prev = self.tags[-1]; p_type = prev.type
            if (type == 0) or (type == 2):
                if p_type == 1:
                    self.tags[-1].adddata(data)
                    if type == 2:
                        self.tags[-1].type = 2
                        self.tags[-1].level = self.tags[-1].level - 1
                        self.level = self.level -1
            else:
                p_parent = len(self.tags)-1
                while not p_type < 2:
                    p_parent = prev.parent
                    if p_parent >= 0:
                        prev = self.tags[p_parent]; p_type = prev.type
                    else:
                        p_type = 0
                self.tags.append(Tag(name,attrib,"",prev.level+1,p_parent,[],type))
                prev.addchild(len(self.tags)-1)
                if p_type == 1:
                    prev.adddata(data,1)
                if type == 1:
                    self.level = self.level + 1
    def writetag(self,index=-1,mode=0):
        if (index >= 0 and index < len(self.tags)):
            tag = self.tags[index]
            data = ""; cdata = data
            l_index = []; l_pos = []; l_max = []; l_epos = []
            if tag.children:
                l_index.append(index); l_pos.append(0)
                l_max.append(len(tag.children)); l_epos.append(0)
                spos = 0; child = tag
                while True:
                    if not l_index:
                        break
                    elif l_pos[-1] >= l_max[-1]:
                        if l_pos[-1] == 0:
                            data = data + tag.writehead(mode)
                        ndata = ndata + cdata[l_epos[-1]+1:] + tag.writetail()
                        l_index.pop(1); l_pos.pop(1); l_max.pop(1); l_epos.pop(1)
                        continue
                    else:
                        spos = cdata.find("<",l_epos[-1])
                        epos = cdata.find(">",spos)
                        index = int(cdata[spos+1:epos])
                        if l_pos[-1] == 0:
                            data = data + tag.writehead()

                    ndata = child.writehead(mode)
                    if not child.children:
                        ndata = ndata + child.data + child.writetail()
                        l_child[-1] = (l_child[-1][0],l_child[-1][1]+1,
                                       l_child[-1][2])
                        if l_child[-1][1] >= l_child[-1][2]:
                            child = self.tags[l_child[-1]]
            else:
                ndata = data
            tag = head + ndata + tail
        return tag
    def gettab(self,level):
        text = ""
        for a in range(level+1):
            text = text + "\t"
        return text
        

def gettag(tag):
    
    name = ""; attrib = []; c_t = len(tag)
    if c_t < 3:
        return name, attrib
    if tag[1] == "/":
        name = tag[2:-1]
    else:
        pos = tag.find(" ")
        if pos < 0:
            if tag[-2] == "/":
                name = tag[1:-2]
            else:
                name = tag[1:-1]
        else:
            tag = tag.split(" ")
            name = tag[0][1:-1]
            for a in range(1,len(tag)):
                attr = tag[a]; spos = attr.find("=")
                sig = attr[spos+1]; epos = attr.find(sig,spos+2)
                a_name = attr[0:spos] ; a_value = attr[spos+2:epos]
                attrib.append((a_name, a_value))
    return name, attrib"""
    