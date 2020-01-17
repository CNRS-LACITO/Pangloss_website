from ..conversion.Transcription import Transcription, Tier

def toBILU(trans, l_tiers):
    """Divides selected tiers 'l_tiers' into the same amount of segments.
    
    'l_tiers is a list of tier indexes (integer) for 'trans'.
    'mode' decides whether to modify the tiers or to create new ones."""

        # Variables
    pos = len(trans.tiers)
        # We use 'trans''s timetable
    if not trans.timetable:
        trans.settimetable()
    if not trans.timetable:
        print("tokenize() aborted: couldn't find a timetable.")
        return trans
        # We BILU the tiers
    p_start = -1; p_mid = -1; p_end = -1; b = 0; prev = ""
    for a in l_tiers:
        tier = trans.tiers[a]
        n_tier = Tier(tier.name, tier.start, tier.end)
        n_tier.Einitiate(tier.name, tier.type, tier.locale, tier.anon, tier.parent,
                         tier.part)
        b = 0; len_seg = len(tier.segments)
        while b < len_seg:
            segment = tier.segments[b]
            start = segment.start; p_start = trans.timetable.index(start)
            end = segment.end; p_end = trans.timetable.index(end)
            content = segment.cont
            p_mid = p_start
            if (p_start + 1) == p_end:
                n_tier.addsegment(start, end, (content + "_U"), 
                                  segment.id, segment.ref, segment.prev)
            else:
                while p_mid < p_end:
                    n_start = trans.timetable[p_mid]
                    n_end = trans.timetable[p_mid+1]
                    if p_mid == p_start:
                        n_tier.addsegment(n_start, n_end, (content + "_B"), 
                                          segment.id, segment.ref, segment.prev)
                    elif (p_mid+1) == p_end:
                            # Because ELAN...
                        prev = ""
                        if segment.prev != "":
                            prev = n_tier.segments[-1].id
                        n_tier.addsegment(n_start, n_end, (content + "_L"), 
                                          segment.id, segment.ref, prev)
                    else:
                            # Because ELAN...
                        prev = ""
                        if segment.prev != "":
                            prev = n_tier.segments[-1].id
                        n_tier.addsegment(n_start, n_end, (content + "_I"), 
                                          segment.id, segment.ref, prev)
                    p_mid += 1
            b += 1
            # We add the tiers
        name = tier.name + "_BILU"
        trans.addtier(name, tier.start, tier.end)
        for seg in n_tier.segments:
            trans.tiers[-1].addsegment(seg.start, seg.end, seg.cont,
                                       seg.id, seg.ref, seg.prev)
            
        del n_tier
        # We get the minimal segment
    gint = (trans.tiers[pos].end-trans.tiers[pos].start)
    for a in range(pos, len(trans.tiers):
        tier = trans.tiers[a]
        for seg in tier:
            lint = (seg.end-seg.start)
            if lint < gint:
                gint = lint
        # We segment further
    for a in range(pos, len(trans.tiers):
        tier = trans.tiers[a]
        n_tier = Tier(tier.name, tier.start, tier.end)
        n_tier.Einitiate(tier.name, tier.type, tier.locale, tier.anon, tier.parent,
                         tier.part)
        b = 0; len_seg = len(tier.segments)
        while b < len_seg:
            seg = tier.segments[b]
            lint = (seg.end-seg.start)
            max = lint/gint
            
            
            b += 1
    
    l_tiers.clear()
    return trans