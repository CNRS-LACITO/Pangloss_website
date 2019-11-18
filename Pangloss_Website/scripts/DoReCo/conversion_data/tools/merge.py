from ..conversion.Transcription import Transcription, Tier, Segment
import re
from ..conversion import toPraat

def merge(trans_in, trans_out=None, tiers_in=[], tiers_out=[], mode=0):
    """Tool function to merge stuff.
    
    Coding an actual 'universal' merging function is too much right now.
    So this is a bandaid script."""
    
        # Variables
    test = -1; mat = 1; index = 0
    try:
        from ..tools import matchSeq
    except:
        mat = 0
        # Mode == 0
        ## Simple, all tiers from trans_in not in trans_out are added to trans_out
    if mode == 0:
        for a in range(len(trans_in)):
            if (not tiers_in) or (a in tiers_in):
                tier_i = trans_in.tiers[a]
                for tier_o in trans_out:
                    if tier_i.name == tier_o.name:
                        test = 1; break
                if test < 1:
                    trans_out.tiers.append(tier_i)
        # Mode == 1
        ## Replaces the content of given tiers in tiers of the same name
        ## Assumes the number of segments is the same
    elif mode == 1:
        for tier_i in trans_in:
            if (not tiers_in) or (tier_i.name in tiers_in):
                for a in range(len(trans_out)):
                    tier_o = trans_out.tiers[a]
                    if tier_i.name == tier_o.name:
                        if len(tier_i) == len(tier_o):
                            test = a
                        else:
                            index = a; test = -1
                        break
                if test >= 0:
                    tier_o = trans_out.tiers[test]
                    for a in range(len(tier_i)):
                        seg = tier_o.segments[a]
                        seg.content = tier_i.segments[a].content
                elif mat == 1:
                    tier_o = trans_out.tiers[index]; pos = 0; c_o = len(tier_o)
                    ntrans = matchSeq.matchSeq(tier_i, tier_o, 10, 1, 'lis', [2,-1,-1,-1])
                    toPraat.toPraat(tier_i.name+".TextGrid",ntrans)
                    tr_0 = ntrans.tiers[0]; c_tr0 = len(tr_0)
                    tr_1 = ntrans.tiers[1]; c_tr1 = len(tr_1)
                    del tr_1.segments[0]
                    if not c_tr0 == len(tier_i):
                        continue
                    for a in range(c_tr0):
                        seg = tier_i.segments[a]; ind = tr_0.segments[a].content
                        start = 0.; end = 0.
                        if ind == "n":
                            if a == 0:
                                pos = 0; start = 0.; end = seg.end-seg.start
                            else:
                                start = tier_o.segments[pos].start
                                end = start+(seg.end-seg.start)
                                pos += 1
                            tier_o.segments.insert(pos, Segment(start, end, seg.content,
                                                   seg.id, seg.ref, seg.prev, seg.unit))
                        else:
                            for b in range(c_tr1):
                                sind = tr_1.segments[b].content
                                if sind == ind:
                                    if b >= c_o:
                                        break
                                    tier_o.segments[b].content = seg.content
                                    pos = b+1
                                    break
                else:
                    tier_o = trans_out.tiers[index]; c_o = len(tier_o)
                    for seg in range(len(tier_i)):
                        for sseg in c_o:
                            if sseg.start >= seg.end:
                                break
                            elif sseg.start == seg.start and sseg.end == seg.end:
                                sseg.content = seg.content
                test = -1
    return trans_out