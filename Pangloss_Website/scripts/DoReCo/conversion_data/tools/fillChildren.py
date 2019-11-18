from ..conversion.Transcription import Transcription, Tier

def fillChildren(trans):
    """Adds empty segments to child tiers when a parent segment exists."""
        # Variables
    l_cpos = []; count = 0; l_tiers = [[]]; max = 0
        # We reorder that bunch
    while count == 0:
        for a in range(len(trans)):
            tier = trans.tiers[a]
            if tier.level == max:
                l_tiers[-1].append(a)
        if not l_tiers[-1]:
            count = 1
        else:
            l_tiers.append([]); max += 1
    count = 0
    for tier in trans:
        count = count + len(tier)
    l_tiers.pop()
        # We check the content
    for level in l_tiers:
        for ind in level:
            tier = trans.tiers[ind]
            if not tier.children:
                continue
            for a in tier.children:
                l_cpos.append(-1)
            for seg in tier:
                for a in range(len(tier.children)):
                    i = tier.children[a]; cur = -1
                    ctier = trans.tiers[i]
                    if l_cpos[a] < 0:
                        l_cpos[a] = 0
                    for b in range(l_cpos[a],len(ctier)):
                        cseg = ctier.segments[b]
                        if not cseg.ref:
                            if (cseg.start >= seg.start and
                                cseg.end <= seg.end):
                                cur = b; break
                        if cseg.ref == seg.id:
                            cur = b; break
                    if cur == -1:
                        id = "a"+str(count); count += 1
                        ctier.addsegment(l_cpos[a],-1.,-1.,"",id,seg.id,True,tier,1)
                    else:
                        l_cpos[a] = cur
            l_cpos.clear()
    return trans