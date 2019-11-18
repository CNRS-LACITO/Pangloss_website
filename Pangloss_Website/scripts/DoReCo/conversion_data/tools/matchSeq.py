from ..conversion.Transcription import Transcription, Tier
from Bio import pairwise2
#from Bio.pairwise2 import format_alignment

def statOnly(trans, lt=[], fname="", encoding="utf-8", sep="\t"):
    """Complementary function that gives stats' upon matching tiers."""
        # Setup
    csv = ""
    if not lt:
        lt=[0,1]
    if not fname:
        fname = "matchExtraStats"
    if fname.endswith(".txt"):
        csv = fname.rsplit(".",1)[0] + ".csv"
    else:
        csv = fname + ".csv"; fname = fname + ".txt"
        # Variables
    if lt[0] < len(trans):
        tierA = trans.tiers[lt[0]]
    elif len(trans) > 0:
        tierA = trans.tiers[0]
    else:
        print("Nope."); return
    if lt[1] < len(trans):
        tierB = trans.tiers[lt[1]]
    elif len(trans) > 1:
        tierB = trans.tiers[1]
    else:
        print("Nope."); return
        
    c_tA = len(tierA); c_tB = len(tierB); posB = 0
            # matching variables
    match = 0; subs = 0; add = 0; dele = 0
    Fmatch = 0.; Fsubs = 0.; Fadd = 0.; Fdele = 0.
            # overlap variables
    l_onset = []; l_ondiff = []; l_offset = []; l_offdiff = []
    l_bound = []
    onset = 0.; Fonset = 0.; offset = 0.; Foffset = 0.; bound = 0.
    
    posB = 0
    for a in range(c_tA):
        segA = tierA.segments[a]; nA = segA.content
        if nA == "n":
                # matching
            add += 1
        else:
            for b in range(posB, c_tB):
                segB = tierB.segments[b]; nB = segB.content
                if nB == nA:
                    posB = b+1
                        # matching
                    if "n" in nA:
                        subs += 1
                    else:
                        match += 1
                        # overlap
                    l_bound.append((segA.start,segA.end,segB.start,segB.end))
                    don = int((segB.start-segA.start)*1000)
                    doff = int((segB.end-segA.end)*1000)
                    if don < 0.:
                        don = don*-1
                    Fonset += don
                    if doff < 0.:
                        doff = doff*-1
                    Foffset += doff
                    if don >= 1:
                        l_ondiff.append((nA, don))
                    else:
                        l_ondiff.append((nA, 0))
                    if doff >= 1:
                        l_offdiff.append((nA, doff))
                    else:
                        l_offdiff.append((nA, 0))
                    break
                else:
                        # matching
                    dele += 1
        # matching
    Fmatch = (match/c_tA)*100; Fsubs = (subs/c_tA)*100
    Fadd = (add/c_tA)*100; Fdele = (dele/c_tA)*100
        # overlap
    c_ond = len(l_ondiff); c_odf = len(l_offdiff)
    c_bound = len(l_bound); c_on = 0; c_off = 0
    for a in range(len(l_ondiff)):
        if l_ondiff[a][1] > 0:
            c_on += 1
        if l_offdiff[a][1] > 0:
            c_off += 1
    bound = (c_ond/c_tA)*100
    onset = (c_on/c_ond)*100; offset = (c_off/c_odf)*100
    Fonset = Fonset/c_ond; Foffset = Foffset/c_odf

        ## We write a text file
    with open(fname, 'w', encoding=encoding) as file:
        file.write("TierA"+sep+"TierB"+sep+"Match"+sep+"Match%"+sep+"Subst"+sep+"Subst%"+sep+
                   "Add"+sep+"Add%"+sep+"Del"+sep+"Del%"+sep+"Trans_len"+sep+"boundaries"+sep+
                   "Match"+sep+"Bmatch%"+sep+"Onset"+sep+"Onset%"+sep+"Onset_ms"+sep+"Offset"+
                   sep+"Offset%"+sep+"Offset_ms\n")
        file.write("{}{}{}{}{}{}{:.2f}%{}{}{}{:.2f}%{}{}{}{:.2f}%{}{}{}{:.2f}%{}{:.2f}{}{}{}{}{}"
                   .format(tierA.name,sep,tierB.name,sep,match,sep,Fmatch,sep,subs,sep,Fsubs,
                   sep,add,sep,Fadd,sep,dele,sep,Fdele,sep,trans.end,sep,c_tA,sep,c_ond,sep))
        file.write("{:.2f}%{}{}{}{:.2f}%{}{:.2f}{}{}{}{:.2f}%{}{:.2f}\n"
                   .format(bound,sep,c_on,sep,onset,sep,Fonset,sep,c_off,sep,offset,sep,Foffset))
    with open(csv, 'w', encoding=encoding) as file:
        file.write("Index"+sep+"len(A)"+sep+"len(B)"+sep+"ratio"+sep+
                   "Onset"+sep+"on_ms"+sep+"Offset"+sep+"off_ms\n")
        ratio = 0.; start = 0; end = 0; durA = 0.; durB = 0.
        for a in range(len(l_bound)):
            durA = l_bound[a][1]-l_bound[a][0]
            if l_bound[a][2] < l_bound[a][0]:
                start = l_bound[a][0]
            else:
                start = l_bound[a][2]
            if l_bound[a][3] > l_bound[a][1]:
                end = l_bound[a][1]
            else:
                end = l_bound[a][3]
            durB = end-start
            if durB < 0:
                durB = 0
            if durA <= 0:
                ratio = 0.
            else:
                ratio = (durB/durA)*100
            file.write("{}{}{:.3f}{}{:.3f}{}{:.2f}%{}{}{}{}{}{}{}{}\n"
                       .format(a,sep,durA,sep,durB,sep,ratio,sep,
                       l_ondiff[a][0],sep,l_ondiff[a][1],sep,
                       l_offdiff[a][0],sep,l_offdiff[a][1]))

def matchSeq(tierA, tierB, seq_type='lis', score=[2,-1,-1,-1], **args):
    """Created on Fri Aug 16 09:01:16 2019
    @author: yewne"""
    
        # Setup
    table = ""; encoding="utf-8"; sep = "\n"
    if "table" in args:
        table = args['table']
        if table.endswith(".txt"):
            table = table.rsplit(".",1)[0]
    if "encoding" in args:
        encoding = args['encoding']
    if "sep" in args:
        sep = args['sep']
    if not isinstance(score, list):
        score = [2,-1,-1,-1]
    elif not len(score) == 4:
        score = [2,-1,-1,-1]
    mat = score[0]; subs = score[1]; add = score[2]; dele = score[3]
    dash = '_'
    if not seq_type == 'str':
        dash = ['-']
    lA = tierA.content(); lB = tierB.content()
    ntrans = Transcription()
    ntrans.addtier(tierA.name + "[PW2]", tierA.start, tierA.end); c_tA = len(tierA)
    ntrans.addtier(tierB.name + "[PW2]", tierB.start, tierB.end); c_tB = len(tierB)
    ntrans.uptime(1)
        # Variables
    posA = 0; posB = 0
    
        # Pairing
    align = pairwise2.align.globalms(lA, lB, mat, subs, add, dele, gap_char=dash)
    align = align[0]    #CHECK OTHER OPTIMAL ALIGNMENTS
    posA = 0; posB = 0; index = 0
    for a in range(align[4]):
        seg1 = align[0][a]
        seg2 = align[1][a]
            # We find the scenario
        if seg1 == "-":
            for b in range(posB, c_tB):
                segB = tierB.segments[b]
                if segB.content == seg2:
                    posB = b+1; ntrans.tiers[1].addsegment(-1,segB.start,
                                segB.end, "n", segB.id, segB.ref, True,
                                ntrans.tiers[1],1)
                    break
        elif seg2 == "-":
            for b in range(posA, c_tA):
                segA = tierA.segments[b]
                if segA.content == seg1:
                    posA = b+1; ntrans.tiers[0].addsegment(-1,segA.start,
                                segA.end, "n", segA.id, segA.ref, True,
                                ntrans.tiers[0],1)
                    break
        elif not seg1 == seg2:
            index += 1
            for b in range(posA, c_tA):
                segA = tierA.segments[b]
                if segA.content == seg1:
                    posA = b+1; ntrans.tiers[0].addsegment(-1,segA.start,
                                segA.end, str(index)+"n", segA.id, segA.ref,
                                True, ntrans.tiers[0],1)
                    break
            for b in range(posB, c_tB):
                segB = tierB.segments[b]
                if segB.content == seg2:
                    posB = b+1; ntrans.tiers[1].addsegment(-1,segB.start,
                                segB.end, str(index)+"n", segB.id, segB.ref, 
                                True, ntrans.tiers[1],1)
                    break
        else:
            index += 1
            for b in range(posA, c_tA):
                segA = tierA.segments[b]
                if segA.content == seg1:
                    posA = b+1; ntrans.tiers[0].addsegment(-1,segA.start,
                                segA.end, str(index), segA.id, segA.ref,
                                True, ntrans.tiers[0],1)
                    break
            for b in range(posB, c_tB):
                segB = tierB.segments[b]
                if segB.content == seg2:
                    posB = b+1; ntrans.tiers[1].addsegment(-1,segB.start,
                                segB.end, str(index), segB.id, segB.ref,
                                True, ntrans.tiers[1],1)
                    break
        # This is the end
    del align
    if table:
        statOnly(ntrans,[0,1],table+"_0.txt",encoding,sep)
        statOnly(ntrans,[1,0],table+"_1.txt",encoding,sep)
    return ntrans