from ..conversion.Transcription import Transcription, Tier
import re

def replace(trans, mode=0, tuples=[], l_tiers=[], nname=[], seg=False, reg=False):
    """Replace symbols in given tiers.
    
    In mode 1:
    'tuples'        : list of tuples (content tier, tier to edit, reg.expression)
    'l_tiers'       : list of indexes (timestamps tier)"""
    
    #replace(trans,1,[(2,-1),(4,-1)],[8,9],["spk2@whatev","spk3@whatev"])
    
        # Replacing content within segments
    c_tuples = len(tuples)
    if c_tuples < 1:
        return trans
    if mode == 0:
        for a in range(c_tuples):
            tuples[a] = (re.compile(tuples[a][0]),tuples[a][1])
        for a in range(len(trans)):
            tier = trans.tiers[a]
            if (not l_tiers) or (a in l_tiers):
                for b in range(len(tier)):
                    seg = tier.segments[b]
                    for tuple in tuples:
                        if (tuple[0]) and (seg.content):
                            seg.content = re.sub(tuple[0],tuple[1],seg.content)
        # Replacing content within tiers
    else:
            # A bit of checking
        c_ltiers = len(l_tiers); c_trans = len(trans)
        seg = False; reg = False
        if c_tuples == c_ltiers:
            seg = True
        if len(tuples[0]) > 2:
            reg = True
        elif len(tuples[0]) < 2:
            return trans
        trans.setchildtime()
            # Replacing tier content
            ## tierA is the "reference tier", tierB the one to edit
        for a in range(c_tuples):
            tA = tuples[a][0]; tB = tuples[a][1]
            if len(tuples[a]) > 2:
                reg = True
            else:
                reg = False
            if (tB < 0) or (tB >= c_trans):
                if a >= len(nname):
                    trans.addtier("tx-a@AUTO", trans.start, trans.end)
                else:
                    trans.addtier(nname[a], trans.start, trans.end)
                tB = len(trans)-1; tierB = trans.tiers[tB]
            else:
                tierB = trans.tiers[tB]
                if seg:
                    tierB.segments.clear()
            if seg:
                tC = l_tiers[a]
            else:
                tC = tB
            tierA = trans.tiers[tA]; tierC = trans.tiers[tC]
            posA = 0; c_tA = len(tierA); c_tC = len(tierC); cont = ""
            check = False
                # We operate
            for a in range(c_tC):
                segC = tierC.segments[a]
                sC = segC.start; eC = segC.end; id = segC.id
                if reg:
                    segT = re.compile(tuples[a][2])
                    if (not segT) and (not segC.content):
                        check = True
                    elif re.search(segT,segC.content):
                        check = True
                else:
                    check = True
                if check:
                    cont = ""
                    for b in range(posA, c_tA):
                        segA = tierA.segments[b]
                        sA = segA.start; eA = segA.end
                        if sA >= sC:
                            if not cont:
                                cont = segA.content
                            else:
                                cont = cont + " " + segA.content
                        if eA >= eC:
                            if seg:
                                tierB.addsegment(-1,sC,eC,cont,"",id,segC.unit,
                                                 tierB,1)
                            else:
                                segC.content = cont
                            posA = a+1; break
                elif seg:
                    tierB.addsegment(-1,sC,eC,cont,"",id,segC.unit,tierB,1)
        trans.setstructure()
    return trans