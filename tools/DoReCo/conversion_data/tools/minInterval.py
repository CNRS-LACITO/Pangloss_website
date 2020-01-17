from ..conversion.Transcription import Transcription, Tier

def minInterval(trans):
    """Divides all tiers into the same amount of segments."""
    
        # Variables
    pos = len(trans.tiers)
        # We use 'trans''s timetable
    if not trans.timetable:
        trans.settimetable()
        # New trans
    ntrans = Transcription(trans.name, trans.start, trans.end)
        # We BILU the tiers
    p_start = -1; p_mid = -1; p_end = -1; b = 0; prev = ""
    for tier in trans:
        n_tier = Tier(tier.name, tier.start, tier.end)
        n_tier.Einitiate(tier.name, tier.type, tier.locale, tier.annotator,
                         tier.parent, tier.participant)
        b = 0; len_seg = len(tier.segments)
        while b < len_seg:
            seg = tier.segments[b]
            start = seg.start; p_start = trans.timetable.index(start)
            end = seg.end; p_end = trans.timetable.index(end)
            content = seg.content
            p_mid = p_start
            if (p_start + 1) == p_end:
                if content:
                    content = content #+ "_U"
                n_tier.addsegment(-1,start, end, content, seg.id,
                                  seg.ref, seg.unit)
            else:
                while p_mid < p_end:
                    n_start = trans.timetable[p_mid]
                    n_end = trans.timetable[p_mid+1]
                    if p_mid == p_start:
                        if content:
                            content = content #+ "_B"
                    elif (p_mid+1) == p_end:
                            # Because ELAN...
                        prev = ""
                        if seg.prev != "":
                            prev = n_tier.segments[-1].id
                        if content:
                            content = content #+ "_L"
                    else:
                            # Because ELAN...
                        prev = ""
                        if seg.prev != "":
                            prev = n_tier.segments[-1].id
                        if content:
                            content = content #+ "_I"
                    n_tier.addsegment(-1,n_start, n_end, content, seg.id,
                                      seg.ref, seg.unit)
                    p_mid += 1; content = seg.content
            b += 1
            # We add the tiers
        ntrans.tiers.append(n_tier)
        del n_tier
        # We reduce to two categories
    count = len(ntrans.tiers[0])
    for a in range(count):
        cont1 = ntrans.tiers[0].segments[a].content
        ntrans.tiers[0].segments[a].content = "1"
        for b in range(1, len(ntrans)):
            cont2 = ntrans.tiers[b].segments[a].content
            if cont1:
                if cont2 and (cont2 in cont1):
                    ntrans.tiers[b].segments[a].content = "1"
                else:
                    ntrans.tiers[b].segments[a].content = "0"
            else:
                if cont2:
                    ntrans.tiers[b].segments[a].content = "0"
                else:
                    ntrans.tiers[b].segments[a].content = "1"
        # We get the minimal segment
    gint = (ntrans.tiers[0].end-ntrans.tiers[0].start)
    for tier in ntrans:
        for seg in tier:
            lint = (seg.end-seg.start)
            if lint < gint:
                gint = lint
    if gint < 0.01:
        gint = 0.01
        # We segment further
    for tier in ntrans:
        n_tier = tier.copy(); n_tier.segments.clear()
        for seg in tier:
            lint = (seg.end-seg.start)
            max = int(lint/gint)
            if max <= 0:
                if seg.prev != "":
                    prev = n_tier.segments[-1].id
                n_tier.addsegment(-1,seg.start, seg.end, seg.content, 
                                  seg.id, seg.ref, seg.unit)
            else:
                for c in range(0, max):
                    start = seg.start + (lint*(c/max))
                    end = seg.start + (lint*((c+1)/max))
                    if seg.prev != "":
                        prev = n_tier.segments[-1].id
                    n_tier.addsegment(-1,start, end, seg.content, seg.id,
                                      seg.ref, seg.unit)
        tier.segments.clear()
        for seg in n_tier.segments:
            tier.addsegment(-1,seg.start, seg.end, seg.content,
                            seg.id, seg.ref, seg.unit)
        del n_tier
    return ntrans