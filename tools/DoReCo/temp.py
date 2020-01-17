from conversion_data.conversion import fromElan, fromPraat, toElan, toPraat
from conversion_data.conversion import fromPangloss, toPangloss
from conversion_data.tools import replace, fillChildren, matchSeq, merge
from conversion_data.tools import confusionTable
from conversion_data.conversion.Transcription import Transcription, Tier, Segment

import re

if __name__ == "__main__":
    """While waiting for the universal launcher to be ready."""
    import sys, os
    
    home = os.getcwd()
    mainfolder = os.path.join(home, "Interrater")
    Goemai = os.path.join(home, "Goemai")
    Result = os.path.join(mainfolder, "Results")
    Tables = os.path.join(Result, "Tables2")
    Manual = os.path.join(mainfolder,"Manual")
    
    f = "crdo.xml"
    trans = fromPangloss.fromPangloss(f)
    cf = "crdo_test.xml"
    toPangloss.toPangloss(cf,trans)
    
    """for file in os.listdir(Result):
        if file.endswith(".TextGrid"):
            f = os.path.join(Result,file)
            trans = fromPraat.fromPraat(f)
            lt0 = len(trans.tiers[0]); lt1 = len(trans.tiers[1])
                # We create two new 'trans' with empty tiers
            trans1 = trans.copy()
            for tier in trans1:
                tier.segments.clear()
            trans2 = trans1.copy()
                # We fill trans1
            test = 0; a = -1; start = -1.; end = 0.
            while True:
                test = 0; a += 1; start += 1.; end += 1.
                if a >= lt0:
                    test += 1
                if a >= lt1:
                    test += 2
                if test == 3:
                    break
                if test == 1:
                    trans1.tiers[0].addsegment(-1,start, end, "o")
                    trans1.tiers[1].addsegment(-1,start, end, "a")
                    trans2.tiers[0].addsegment(-1,start, end, "o")
                    trans2.tiers[1].addsegment(-1,start, end, "a")
                    continue
                if test == 2:
                    trans1.tiers[0].addsegment(-1,start, end, "a")
                    trans1.tiers[1].addsegment(-1,start, end, "o")
                    trans2.tiers[0].addsegment(-1,start, end, "a")
                    trans2.tiers[1].addsegment(-1,start, end, "o")
                    continue
                seg1 = trans.tiers[0].segments[a].content
                seg2 = trans.tiers[1].segments[a].content
                if seg1 == "n":
                    trans1.tiers[0].addsegment(-1,start, end, "a")
                    trans1.tiers[1].addsegment(-1,start, end, "o")
                    trans2.tiers[0].addsegment(-1,start, end, "o")
                    trans2.tiers[1].addsegment(-1,start, end, "a")
                    continue
                elif seg2 == "n":
                    trans1.tiers[0].addsegment(-1,start, end, "n")
                    trans1.tiers[1].addsegment(-1,start, end, "a")
                    trans2.tiers[0].addsegment(-1,start, end, "a")
                    trans2.tiers[1].addsegment(-1,start, end, "n")
                    continue
                trans1.tiers[0].addsegment(-1,start, end, "a")
                trans1.tiers[1].addsegment(-1,start, end, "a")
                trans2.tiers[0].addsegment(-1,start, end, "a")
                trans2.tiers[1].addsegment(-1,start, end, "a")
                
            cf = os.path.join(Tables,file.rsplit(".",1)[0] + "_0.txt")
            confusionTable.confusionTable(trans1,[0,1],cf)
            cf = os.path.join(Tables,file.rsplit(".",1)[0] + "_1.txt")
            confusionTable.confusionTable(trans2,[1,0],cf)
            print(file)
    """
    
    """l_txt = ""; #l_csv = ""; t_csv = ""
    for file in os.listdir(Tables):
        if file.endswith(".txt"):
            fi = file.rsplit("_",1)[0]
            f = os.path.join(Tables,file)
            with open(f,encoding="utf-8") as fil:
                line = fil.readline()
                if not l_txt:
                    l_txt = "File\t"+line
                l_txt = l_txt + fi+"\t"+fil.readline()
        elif file.endswith(".csv"):
            fi = file.rsplit("_",3)[0]
            f = os.path.join(Tables,file)
            with open(f,encoding="utf-8") as fil:
                line = fil.readline()
                if not l_csv:
                    l_csv = "File\t"+line
                t_csv = ""
                while line:
                    line = fil.readline()
                    if not line:
                        break
                    t_csv = t_csv + fi+"\t"+line
            l_csv = l_csv + t_csv; t_csv = ""
    with open("IAA_match.csv",'w',encoding="utf-8") as file:
        for line in l_txt:
            file.write(line)
    #with open("IAA_overlap.csv",'w',encoding="utf-8") as file:
    #    for line in l_csv:
    #        file.write(line)
    """
    
    """f = "DJIPecheLM.eaf"
    trans = fromElan.fromElan(f)
        # We add missing segments for LM
    Ntier = trans.tiers[6]; count = 0
    tier = trans.tiers[7]
    for a in range(len(tier)):
        seg = tier.segments[a]; id = seg.id
        if a >= len(Ntier):
            Ntier.addsegment(-1, seg.start, seg.end, "LM", "add"+str(count), id,
                             True, Ntier, 1); count += 1
        elif not Ntier.segments[a].ref == id:
            Ntier.addsegment(a, seg.start, seg.end, "LM", "add"+str(count), id,
                             True, Ntier, 1); count += 1
    l_pos = []; incr1 = 0; incr2 = 0
        # We add tiers (LM=9-16 ; AC=17-24)
    for a in range(6):
        trans.tiers.append(trans.tiers[a].copy())
        trans.tiers[-1].segments.clear(); l_pos.append(0)
    for a in range(7,9):
        trans.tiers.append(trans.tiers[a].copy())
        trans.tiers[-1].segments.clear(); l_pos.append(0)
    for a in range(6):
        trans.tiers.append(trans.tiers[a].copy())
        trans.tiers[-1].segments.clear()
        trans.tiers[-1].name = "AC_" + trans.tiers[-1].name.split("_",1)[1]
        if a == 2:
            trans.tiers[-1].parent = "AC_word-txt-qaa-SN-fonipa-x-bai"
        elif a < 4:
            trans.tiers[-1].parent = "AC_morph-txt-qaa-SN-fonipa-x-bai"
        else:
            trans.tiers[-1].parent = "AC_phrase-segnum-en"
    for a in range(7,9):
        trans.tiers.append(trans.tiers[a].copy())
        trans.tiers[-1].segments.clear()
        trans.tiers[-1].name = "AC_" + trans.tiers[-1].name.split("_",1)[1]
        if a == 8:
            trans.tiers[-1].parent = "AC_phrase-segnum-en"
    print("\n")
    for a in range(len(trans)):
        print(a,trans.tiers[a].name, "\t", trans.tiers[a].parent)
        # We add the segments
    Wtier = trans.tiers[8]; Mtier = trans.tiers[2]; Ptest = 0; test = 0; Mtest = 0; MMtest = 0
    M0tier = trans.tiers[0]; M1tier = trans.tiers[1]; M2tier = trans.tiers[3]
    P0tier = trans.tiers[7]; P1tier = trans.tiers[4]; P2tier = trans.tiers[5]
    l_tiers = []
    for a in range(len(Ntier)):
        Nseg = Ntier.segments[a]; id = trans.tiers[7].segments[a].id
        if Nseg.content == "LM":
            incr1 = 9; incr2 = 8
        else:
            incr1 = 17; incr2 = 16
        WCtier = trans.tiers[8+incr2]; MCtier = trans.tiers[2+incr1]; l_tiers.clear()
        l_tiers.append((M0tier,trans.tiers[incr1]))
        l_tiers.append((M1tier,trans.tiers[1+incr1]))
        l_tiers.append((M2tier,trans.tiers[3+incr1]))
            # Phrases
        Pseg = trans.tiers[7].segments[a]
        trans.tiers[7+incr2].segments.append(Pseg.copy()); Ptest = 1
        Ptest = 1
        for b in range(l_pos[5], len(P1tier)):
            Pseg = P1tier.segments[b]
            if Pseg.ref == id:
                trans.tiers[4+incr1].segments.append(Pseg.copy()); Ptest = 1
            elif Ptest == 1:
                l_pos[5] = b; break
        Ptest = 1
        for b in range(l_pos[6], len(P2tier)):
            Pseg = P2tier.segments[b]
            if Pseg.ref == id:
                trans.tiers[5+incr1].segments.append(Pseg.copy()); Ptest = 1
            elif Ptest == 1:
                l_pos[6] = b; break
            # Words and morphemes
        for b in range(l_pos[4],len(Wtier)):
            Wseg = Wtier.segments[b]
            if Wseg.ref == id:
                WCtier.segments.append(Wseg.copy()); test = 1
                Wid = WCtier.segments[-1].id; Mtest = 0
                for c in range(l_pos[3],len(Mtier)):
                    Mseg = Mtier.segments[c]
                    if Mseg.ref == Wid:
                        MCtier.segments.append(Mseg.copy()); Mtest = 1
                        Mid = MCtier.segments[-1].id
                        for d in range(3):
                            MMtier = l_tiers[d][0]; MMCtier = l_tiers[d][1]; MMtest = 0
                            for e in range(l_pos[d],len(MMtier)):
                                MMseg = MMtier.segments[e]
                                if MMseg.ref == Mid:
                                    MMCtier.segments.append(MMseg.copy()); MMtest = 1
                                elif MMtest == 1:
                                    l_pos[d] = e; break
                    elif Mtest == 1:
                        l_pos[3] = c; break
            elif test == 1:
                l_pos[4] = b; break
        # We remove unneeded tiers
    trans.tiers.pop(8)
    trans.tiers.pop(7)
    #trans.tiers.pop(6)
    trans.tiers.pop(5)
    trans.tiers.pop(4)
    trans.tiers.pop(3)
    trans.tiers.pop(2)
    trans.tiers.pop(1)
    trans.tiers.pop(0)
    #trans.setstructure()
    for tier in trans:
        print(tier.name, "\t\t", tier.parent)
    
    cf = "test.eaf"
    toElan.toElan(cf,trans)
    """
    
    """for file in os.listdir(Manual):
        if file.endswith(".TextGrid"):
            f = os.path.join(Manual, file)
            cf = os.path.join(file.rsplit(".",1)[0] + "_IAA.TextGrid")
            trans1 = fromPraat.fromPraat(f)
            trans1.removetier(0); trans1.removetier(1)
            trans2 = fromPraat.fromPraat(f)
            trans2.removetier(1); trans2.removetier(2)
            for tier in trans1:
                for seg in tier:
                    cont = seg.content
                    if "corr" in cont:
                        seg.content = "0"
                    else:
                        seg.content = "1"
                    if cont == "n" or cont == "corrn":
                        seg.content = seg.content + "a"
                    elif cont.endswith("n"):
                        seg.content = seg.content + "e"
                    else:
                        seg.content = seg.content + "m"
            for tier in trans2:
                for seg in tier:
                    cont = seg.content
                    if "corr" in cont:
                        seg.content = "0"
                    else:
                        seg.content = "1"
                    if cont == "n" or cont == "corrn":
                        seg.content = seg.content + "a"
                    elif cont.endswith("n"):
                        seg.content = seg.content + "e"
                    else:
                        seg.content = seg.content + "m"
            cf = os.path.join(file.rsplit(".",1)[0] + "_0.txt")
            confusionTable.confusionTable(trans1,cf)
            cf = os.path.join(file.rsplit(".",1)[0] + "_1.txt")
            confusionTable.confusionTable(trans2,cf)
    
    l_list = []; b = 0
    for a in range(12):
        l_list.append(0)
    ll = len(l_list); count = 0; total = 0
    for file in os.listdir(mainfolder):
        if file.endswith(".csv"):
            f = os.path.join(Tables,file)
            with open(f,encoding="utf-8") as fi:
                count += 1
                for line in fi:
                    if line.startswith("Index"):
                        continue
                    elif not "\t" in line:
                        continue
                    ratio = float(line.split("\t")[3]); total += 1
                    if ratio < 0:
                        ratio = ratio*-1
                    for a in range(-1,11):
                        if (a == -1) and ratio < 1:
                            l_list[0] += 1
                        elif (a == 0) and ratio >= 1:
                            l_list[1] += 1
                        elif (a == 10) and ratio > 99:
                            l_list[11] += 1
                        elif ratio >= (a*10):
                            l_list[a+1] += 1
    for a in range(12):
        int = l_list[a]; div = (int // count)
        l_list[a] = (int,div)
    gtot = total // count
    cf = "table.csv"
    print(l_list)
    with open(cf,'w',encoding="utf-8") as fi:
        for int in l_list:
            u = int[0]; i = int[1]; t = (u/total)*100
            fi.write("{}\t{}\t{}\n".format(u,i,t))
            
            
    for file in os.listdir(Goemai):
        if file.endswith(".eaf"):
            f = os.path.join(Goemai, file)
            trans = fromElan.fromElan(f)
            cf = file
            l_tuples = []; l_refs = []; lor = 0; ltrs = 0; lref = 0; l_locs = []
            for a in range(len(trans)):
                name = trans.tiers[a].name
                if "@" in name:
                    name = name.split("@",1)[1]
                if name not in l_locs:
                    l_locs.append(name)
            for loc in l_locs:
                check = 0
                for a in range(len(trans)):
                    name = trans.tiers[a].name; type = name
                    if "@" in name:
                        type, name = name.split("@",1)
                    if name == loc:
                        if type == "ref":
                            lref = a; check += 1
                        elif type == "trs":
                            ltrs = a; check += 2
                        elif type == "or":
                            lor = a; check += 4
                if check >= 7:
                    l_tuples.append((ltrs,lor)); l_refs.append(lref)
            print(file, l_locs, l_tuples, l_refs)
            trans.setchildtime()
            for tier in trans:
                for seg in tier:
                    if seg.start < 0. or seg.end < 0.:
                        print(tier.name); break
            trans = replace.replace(trans,1,l_tuples,l_refs)
            header = trans.metadata.header
            pos = header.find("<HEADER")
            pos = header.find(">",pos)
            head = header[:pos+1]; tail = header[pos+1:]
            text = ("\n\t\t<MEDIA_DESCRIPTOR MEDIA_URL=\"file:///{}\""
                    .format(file.rsplit(".",1)[0]+".wav")+
                    " MIME_TYPE=\"audio/x-wav\" />")
            trans.metadata.header = head+text+tail
            toElan.toElan(cf,trans)"""
    
    #repl = re.compile("<<.+?>")
    #tags = re.compile("<.+?>")
    
    """for file in os.listdir(Result):
        if file.endswith(".TextGrid") and "Anal_01_Mc[CB_CK]" in file:
            f = os.path.join(Result, file)
            trans = fromPraat.fromPraat(f)
            cf = os.path.join(Tables,file.rsplit(".",1)[0] + "_0")
            matchSeq.statOnly(trans, [0,1], cf)"""
            #cf = os.path.join(Tables,file.rsplit(".",1)[0] + "_1")
            #matchSeq.statOnly(trans, [1,0], cf)
    
    
    #f = "crdo.xml"
    #trans = _fromPangloss.fromPangloss(f)
    #cf = "crdo.eaf"
    #toElan.toElan(cf, trans)
    
    
    """f = os.path.join(mainfolder,"15_secondthought.eaf")
    trans = fromElan.fromElan(f)
    refTier = None; noteTier = None
    nrTier = "ref"; nnTier = "notes"
    for tier in trans:
        if nrTier in tier.name:
            refTier = tier
        elif nnTier in tier.name:
            noteTier = tier
    print(len(refTier))
    pos = 0; lr = len(refTier); rseg = None
    for seg in noteTier:
        if seg.content:
            for a in range(pos,lr):
                rseg = refTier.segments[a]
                if rseg.id == seg.ref:
                    pos = a; break
            dseg = refTier.segments[pos-1]
            #print(rseg.start, rseg.end, "|", dseg.start, dseg.end)
            if dseg.start == rseg.start and dseg.end == rseg.end:
                for a in range(len(trans)):
                    tier = trans.tiers[a]
                    if (not nrTier in tier.name) and (not nnTier in tier.name):
                        b = 0
                        while b < len(tier):
                            gseg = tier.segments[b]
                            if gseg.ref == rseg.id:
                                #print(tier.name, gseg.content)
                                del trans.tiers[a].segments[b]
                            else:
                                b += 1
                del refTier.segments[pos]
                seg.ref = dseg.id
    print(len(refTier))
    cf = os.path.join(mainfolder,"15_secondthought.eaf")
    toElan.toElan(cf, trans,0)"""
    
    
    
    """eaf = os.path.join(mainfolder, "EAF")
    align = os.path.join(eaf, "align")

    if not os.path.exists(align):
        os.makedirs(align)
    br = False
    for file in os.listdir(eaf):
        if file.endswith(".eaf"):
            print(file)
            f = os.path.join(eaf, file)
            cf = os.path.join(align, file)
            trans = fromElan.fromElan(f)
            
            tnote = None; tphr = None; tpar = None; tinter = None
            reg = re.compile("\d+(|.\d+), \d+(.\d+|)")
            for a in range(len(trans)):
                tier = trans.tiers[a]
                if tier.name == "A_phrase-note-en":
                    tnote = trans.tiers[a]
                    if len(tnote) < 3:
                        print(file, "no timestamps")
                        br = True
                    for seg in tnote:
                        match = re.search(reg, seg.content)
                        if not match:
                            seg.start = -1.; seg.end = -1.
                        else:
                            s_start, s_end = match.group(0).split(",")
                            seg.start = float(s_start); seg.end = float(s_end)
                elif tier.name == "A_phrase-segnum-en":
                    tphr = trans.tiers[a]
                elif tier.name == "A_paragraph":
                    tpar = trans.tiers[a]
                elif tier.name == "interlinear-text-title-en":
                    tinter = trans.tiers[a]
            if br == True:
                continue
            if not tnote:
                print(file, "no note tier")
                continue
            l_seg = []; id = ""; ref = ""
            l_pos = []; check = 0; pos = -1; epos = -1
            for a in range(len(tphr)):
                ph_seg = tphr.segments[a]; id = ph_seg.id
                check = 0
                for b in range(len(tnote)):
                    no_seg = tnote.segments[b]; ref = no_seg.ref
                    if ref == id:
                        if no_seg.start < 0:
                            l_seg.append((None, ph_seg))
                        else:
                            l_seg.append((no_seg, ph_seg))
                        check = 1; break
                if check == 0:
                    l_seg.append((None, ph_seg))
            check = 0; pos = -1; start = -1.; end = -1.
            for a in range(len(l_seg)):
                tuple = l_seg[a]; 
                if tuple[0] == None:
                    if check == 0:
                        check = 1; pos = a-1
                        #check = 1; pos = a
                        if pos <= 0:
                            start = 0.
                        else:
                            start = l_seg[pos][0].start
                            #start = l_seg[a-1][0].end
                elif check == 1:
                    end = l_seg[pos][0].end
                    #end = tuple[0].start
                    for b in range(pos, a):
                        cur = ((b-pos)/(a-pos)); ecur = (b+1-pos)/(a-pos)
                        n_start = start+((end-start)*cur)
                        n_end = start+((end-start)*ecur)
                        n_seg = Segment(n_start, n_end, "")
                        l_seg[b] = (n_seg, l_seg[b][1])
                    check = 0; pos = -1
            if check == 1:
                try:
                    end = l_seg[-1][0].start
                except:
                    print(file, "Missing last segment")
                    continue
                for b in range(pos, len(l_seg)):
                    cur = ((b-pos)/(a-pos)); ecur = (b+1-pos)/(a-pos)
                    n_start = start+((end-start)*cur)
                    n_end = start+((end-start)*ecur)
                    n_seg = Segment(n_start, n_end, "")
                    l_seg[b] = (n_seg, l_seg[b][1])
                check = 0; pos = -1
            for tuple in l_seg:
                no_seg = tuple[0]; ph_seg = tuple[1]
                ph_seg.start = no_seg.start; ph_seg.end = no_seg.end
                if ph_seg.start > ph_seg.end:
                    start = ph_seg.end; end = ph_seg.start
                    ph_seg.start = start; ph_seg.end = end
            ref = ""; o_ref = ""
            pseg = None
            start = -1.; end = -1.
            tphr.start = tphr.segments[0].start
            tphr.end = tphr.segments[-1].end
            for seg in tphr:
                ref = seg.ref
                if not ref == o_ref:
                    if not pseg:
                        start = seg.start
                    else:
                        pseg.start = start
                        pseg.end = seg.end
                    for s in tpar:
                        if s.id == ref:
                            pseg = s; break
                    o_ref = ref
                    start = seg.end
            if not pseg:
                if len(tpar) > 0:
                    pseg = tpar.segments[0]
                    pseg.start = tphr.start
                    pseg.end = tphr.end
            else:
                pseg.start = start
                pseg.end = tphr.end
            start = -1.; end = -1.
            for a in range(1,len(tphr)):
                seg = tphr.segments[a]
                Wseg = tphr.segments[a-1]
                if seg.start < Wseg.end:
                    Wseg.end = seg.start
            tinter.segments[0].start = tpar.segments[0].start
            tinter.segments[0].end = tpar.segments[0].end
            toElan.toElan(cf, trans)
            
    l_files = []
    for ofile in os.listdir(eaf):
        if ofile.endswith(".eaf"):
            do = os.path.join(eaf,ofile)
            for nfile in os.listdir(align):
                if nfile.endswith(".eaf") and (nfile == ofile):
                    dn = os.path.join(align,nfile)
                    l_files.append((do, dn)); break
    copy = ""
    for tuple in l_files:
        ofile = tuple[0]; nfile = tuple[1]
        with open(ofile, encoding="utf-8") as file:
            copy = "\t<LINGUISTIC_TYPE" + file.read().split("<LINGUISTIC_TYPE",1)[1]
        with open(nfile, encoding="utf-8") as file:
            copy = file.read().split("<LINGUISTIC_TYPE",1)[0] + copy
        with open(nfile, 'w', encoding="utf-8") as file:
            file.write(copy)"""
    
    """l_file = []; l_names = []; l_fm = []; o_name = ""
    with open("Abui_fm.csv",encoding="utf-8") as file:
        for cnt, line in enumerate(file):
            if ";" in line:
                name, fm = line.split(";",1)
                fm = fm.split("\n",1)[0]
                if not name == o_name:
                    if o_name and l_fm:
                        l_file.append((o_name,l_fm.copy()))
                    o_name = name
                    l_fm.clear()
                l_fm.append(fm)
    l_lists = []; l_final = []
    for tuple in l_file:
        if tuple[1] not in l_lists:
            l_lists.append(tuple[1])
    for list in l_lists:
        for tuple in l_file:
            if tuple[1] == list:
                l_final.append(tuple)
    l_lists.clear()
    text = ""
    with open("Abui_list.csv", 'w', encoding="utf-8") as file:
        for tuple in l_file:
            text = text + tuple[0]
            for fm in tuple[1]:
                text = text + ";" + fm
            text = text + "\n"
            file.write(text); text = ""
    with open("Abui_final.csv", 'w', encoding="utf-8") as file:
        for tuple in l_final:
            text = text + tuple[0]
            for fm in tuple[1]:
                text = text + ";" + fm
            text = text + "\n"
            file.write(text); text = "" """
    
    """l_fm = []; l_final = []; fm = ""
    for file in os.listdir(mainfolder):
        if file.endswith(".txt"):
            f = os.path.join(mainfolder, file)
            name = file.rsplit(".",1)[0]
            l_fm.clear()
            with open(f, encoding="utf-8") as fil:
                for count, line in enumerate(fil):
                    if line.startswith("\\"):
                        if " " in line:
                            fm = line.split(" ",1)[0]
                        else:
                            fm = line.replace("\n","")
                        if (not fm in l_fm):
                            l_fm.append(fm)
            for fm in l_fm:
                l_final.append((name, fm))
            l_fm.clear()
    cf = "Abui_fm.csv"
    with open(cf, 'w', encoding="utf-8") as file:
        for tuple in l_final:
            file.write(tuple[0] + ";" + tuple[1] + "\n")
    for tuple in l_final:
        if tuple[1] not in l_fm:
            l_fm.append(tuple[1])
    l_final.clear()
    cf = "Abui_efm.csv"
    with open(cf, 'w', encoding="utf-8") as file:
        for fm in l_fm:
            file.write(fm + "\n")"""
                    
    
    """l_file = []; l_items = []; l_final = []; content = ""
    cf = "Baure_lists.csv"
    for file in os.listdir(mainfolder):
        if file.endswith(".txt"):
            name = file.rsplit(".",1)[0]
            f = os.path.join(mainfolder, file)
            with open(f, encoding="utf-8") as fil:
                content = fil.read()
            l_content = content.split("\n")
            content = ""
            for cont in l_content:
                if "\t" in cont:
                    tier, item = cont.split("\t")
                    if not item in l_items:
                        l_items.append(item)
                        l_final.append((name, tier, item))
            l_content.clear()
    with open(cf, 'w', encoding="utf-8") as fil:
        for tuple in l_final:
            fil.write(tuple[0] + "," + tuple[1] + "," + tuple[2] + "\n")"""
            
    
    """for file in os.listdir(mainfolder):
        if file.endswith(".eaf"):
            f = os.path.join(mainfolder, file)
            cf = os.path.join(mainfolder, file.rsplit(".",1)[0] + "_lex.txt")
            trans = fromElan.fromElan(f)
            l_tiers = []
            for a in range(len(trans)):
                tier = trans.tiers[a]
                if "fldps" in tier.name:
                    l_tiers.append(a)
                elif "lg" in tier.name:
                    l_tiers.append(a)
            getLexicon.getLexicon(trans, l_tiers, 0, cf, "\t")
            l_tiers.clear()
            print(file)"""
    
    
    """old = os.path.join(mainfolder,"EAF")
    up = os.path.join(mainfolder, "UpdatedEAFs")
    flex = os.path.join(mainfolder, "FlexEAF")
    l_tuple = []; l_old = []; l_flex = []
    for file in os.listdir(old):
        if file.endswith(".eaf"):
            l_old.append(file)
    for file in os.listdir(flex):
        if file.endswith(".eaf"):
            l_flex.append(file)
    for o in l_old:
        for f in l_flex:
            if o == f:
                l_tuple.append(f)
                break
    print(l_tuple)
    for tuple in l_tuple:
        fold = os.path.join(old, tuple); fflex = os.path.join(flex, tuple)
        otrans = fromElan.fromElan(fold,1)
        otrans.setchildtime()
        ftrans = fromElan.fromElan(fflex,1)
        utrans = merge.merge(ftrans,otrans, mode=1)
        for tier in utrans:
            tier.type = "time"; tier.truetype = "time"
        toElan.toElan(os.path.join(mainfolder, tuple), utrans)
        print(tuple)"""
    
    
    """text = ""; name = ""; test = 0
    head = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<document version=\"2\">\n"
    tail = "\n</document>"
    with open(file, encoding="utf-8") as f:
        while True:
            line = f.readline()
            if not line:
                break
            if "<interlinear-text guid" in line:
                test = 1
            elif "</interlinear-text>" in line:
                text = text + line
                test = 0; cfile = os.path.join(home, name + ".flextext")
                with open(cfile, 'w', encoding="utf-8") as cf:
                    cf.write(head + text + tail)
                text = ""
            if test == 1:
                if "<item type=\"title\"" in line:
                    name = line.split(">",1)[1]
                    name = name.split(":",1)[0]
                text = text + line"""

    """trans = fromElan.fromElan(file)
    toTables.toTables(os.path.join(home,"test.txt"),trans,["gn","ge","mr","tx"],[
                      ("SumitroP",[4,5,3,2]),("Kaiser",[14,15,13,12])])"""
    
    """home = os.getcwd()
    mainfolder = os.path.join(home,"interrater")
    anal = os.path.join(mainfolder,"Anal")
    resigaro = os.path.join(mainfolder,"Resigaro")
    veraa = os.path.join(mainfolder,"Veraa")
    for file in os.listdir(mainfolder):
        file = os.path.join(mainfolder,file)
        if "merged" in file and file.endswith(".TextGrid"):
            trans = fromPraat.fromPraat(file)
            cf = file.rsplit(".",1)[0]
            print(file)
            trans = minInterval.minInterval(trans)
            confusionTable.confusionTable(trans, cf+"_match.txt")
        elif "corr.TextGrid" in file:
            trans = fromPraat.fromPraat(file)
            cf = file.rsplit(".",1)[0]
            print(file)
            matchSeq.statOnly(trans, [2,3], cf + "_corr.txt")"""
            
    
    """for file in os.listdir(resigaro):
        file = os.path.join(resigaro,file)
        trans = fromPraat.fromPraat(file)
        cf = file.rsplit(".",1)[0]
        if "merged.TextGrid" in file:
            print("hi")
        elif file.endswith(".TextGrid"):
            tierA = trans.tiers[0]; tierB = trans.tiers[1]
            ntrans = matchSeq.matchSeq(tierA,tierB)
            matchSeq.statOnly(ntrans, [2,3], cf + ".txt")
            merge.merge(ntrans,trans)
            toPraat.toPraat(cf + "_pw2.TextGrid", trans)
            print(file.rsplit("\\",1)[1])"""
    
    """home = os.getcwd()
    folder = os.path.join(home,"Totoli")
    for file in os.listdir(folder):
        if file.endswith(".eaf"):
            f = os.path.join(folder, file)
            cf = f.rsplit(".",1)[0] + ".eaf"
            trans = fromElan.fromElan(f)
            
            
            
            li = []; si = []; ni = []
            for a in range(len(trans)):
                tier = trans.tiers[a]
                if "tx@" in tier.name:
                    li.append((a,-1, tier.name.split("tx@",1)[1]))
            for a in range(len(li)):
                index = li[a][0]; name = li[a][2]
                for b in range(len(trans)):
                    if (not b == index):
                        tier = trans.tiers[b]; tname = tier.name
                        if ("ftn@" in tname) and (name == tname.split("ftn@",1)[1]):
                            si.append(b)
                            ni.append("phr@"+name)
                            li[a] = (index,-1)
                            break
            if len(li) == len(si):
                print(file)
                trans = replace.replace(trans, 1, li, si, ni)
                toElan.toElan(f, trans)
            else:
                print("FAILED:", file)
                print(li, si)"""
            
    """li = []
    for a in range(len(trans)):
        tier = trans.tiers[a]
        if "tx@" in tier.name:
            li.append((a,-1, tier.name.split("tx@",1)[1]))
    for a in range(len(li)):
        index = li[a][0]; name = li[a][2]
        for b in range(len(trans)):
            if (not b == index):
                tier = trans.tiers[b]; tname = tier.name
                if ("tx-a@"in tname) and (name == tname.split("tx-a@",1)[1]):
                    li[a] = (index,b,name)
                    break
    
        # Rewrite content
    pattern = "(\d){4}"
    for l in li:
        tierA = trans.tiers[l[0]]; tierB = trans.tiers[l[1]]
        posA = 0; c_tA = len(tierA); cont = ""
        for segB in tierB:
            sB = segB.start; eB = segB.end
            match = re.search(pattern, segB.content)
            if match:
                cont = ""
                for a in range(posA, c_tA):
                    segA = tierA.segments[a]; sA = segA.start; eA = segA.end
                    #print(posA, sB, eB, "|", sA, eA, "'"+cont+"'")
                    if sA >= sB:
                        cont = cont + " " + segA.content
                    if eA >= eB:
                        segB.content = cont; posA = a+1; break"""

    """trans = fromPraat.fromPraat(f_orig)
    ntrans = minInterval.minInterval(trans)
    toPraat.toPraat("forCorFlo.TextGrid", ntrans)
    #confusionTable.confusionTable(ntrans, "matchTables.txt")
    #matchSeq.statOnly(trans, [2,3], "corrStats.txt")
    #ntrans = matchSeq.matchSeq(trans.tiers[0], trans.tiers[1], 10, 1, 'lis', [2,-1,-1,-1])
    #toPraat.toPraat("matchResult.TextGrid", ntrans)"""
    
    """l_seqs = [[],[]]
    for b in range(0,20):
        l_seqs[0].append(trans.tiers[0].segments[b].content)
    for b in range(0,20):
        l_seqs[1].append(trans.tiers[2].segments[b].content)
    seq1 = l_seqs[0]
    seq2 = l_seqs[1]
    result = matchSeq.matchSeq(seq1, seq2, steps=10, scroll=1, seq_type='lis', score=[2,-1,-1,-1])
    print(result[0][2])
    for r in result:
        print(format_alignment(*r))
    for r in result:
        #print(r[0])
        #print(r[1])
        #print("\t", r[2])
        print(format_alignment(*r))"""
    
    """folder = "InterRater"
    f_orig = os.path.join(folder, "merged.TextGrid")
    trans = fromPraat.fromPraat(f_orig)
    
    tr_LPCK = extract.extract(trans, [0, 1])
    tr_LPCK = minInterval.minInterval(tr_LPCK)
    toPraat.toPraat("LPCK_reduced.TextGrid", tr_LPCK)
    confusionTable.confusionTable("LPCK_Table.txt", tr_LPCK)
    del tr_LPCK
    
    tr_LPMAUS = extract.extract(trans, [0, 2])
    tr_LPMAUS = minInterval.minInterval(tr_LPMAUS)
    toPraat.toPraat("LPMAUS_reduced.TextGrid", tr_LPMAUS)
    confusionTable.confusionTable("LPMAUS_Table.txt", tr_LPMAUS)
    del tr_LPMAUS
    
    tr_CKMAUS = extract.extract(trans, [1, 2])
    tr_CKMAUS = minInterval.minInterval(tr_CKMAUS)
    toPraat.toPraat("CKMAUS_reduced.TextGrid", tr_CKMAUS)
    confusionTable.confusionTable("CKMAUS_Table.txt", tr_CKMAUS)
    del tr_CKMAUS"""
    
    """file = "CKLP_merged.TextGrid"
    trans = fromPraat.fromPraat(file)
    print(len(trans), "tiers:")
    trans = minInterval.minInterval(trans)
    for tier in trans:
        print(tier.name, ":", len(tier), "segments")
    confusionTable.confusionTable("CKLP_Tables.txt", trans)
    print("Tables written.")
    toPraat.toPraat("CKLP_reduced.TextGrid", trans)"""
    
    """fold = "Mojeno"
    folder1 = os.path.join(fold, "Flextext")
    folder2 = os.path.join(fold, "EAF")
    l_fold1 = []; l_fold2 = []; l_files = []
    for file in os.listdir(folder1):
        if file.endswith(".eaf"):
            l_fold1.append(file)
    for file in os.listdir(folder2):
        if file.endswith(".eaf"):
            l_fold2.append(file)
    for f1 in l_fold1:
        for f2 in l_fold2:
            if f1 == f2:
                file1 = os.path.join(folder1, f1)
                file2 = os.path.join(folder2, f2)
                l_files.append((file1, file2, f1))
    l_fold1.clear(); l_fold2.clear();
    folder = os.path.join(fold, "merge")
    if not os.path.exists(folder):
        os.mkdir(folder)
    f = l_files[0]
    print(f[0], f[2])"""
    """tr_eaf = fromElan.fromElan(f[0])
    file = os.path.join(folder, f[2])
    for tier in tr_eaf:
        if tier.name == "A_morph-variantTypes-en":
            for seg in tier:
                print(seg.id, seg.ref, seg.unit)
    toElan.toElan(file, tr_eaf)"""
    """for f in l_files:
        print(f[2])
        tr_flex = fromElan.fromElan(f[0])
        tr_eaf = fromElan.fromElan(f[1])
        #tr_eaf = merge.merge(tr_flex, tr_eaf, [], [], 1)
        file = os.path.join(folder, f[2])
        toElan.toElan(file, tr_eaf)
        file = os.path.join(folder, "flex_"+f[2])
        toElan.toElan(file, tr_flex)
        #file = file.rsplit(".", 1)[0] + ".TextGrid"
        #toPraat.toPraat(file, tr_eaf)"""
    
    """folder = ""
    for file in os.listdir(folder):
        if file.endswith(".eaf"):
            f = os.path.join(folder, file)
            cf = f.rsplit(".",1)[0] + ".eaf"
            trans = fromPangloss.fromPangloss(f)
            toElan.toElan(cf, trans)"""
    