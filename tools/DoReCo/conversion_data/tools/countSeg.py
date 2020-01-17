from ..conversion.Transcription import Transcription

def countSeg(trans, l_tiers=[], symb=[], mode=0):
    """Counts the number of tokens for a set of tiers.
    
    'trans' is the Transcription object containing the tiers.
    'l_tiers' is a list of indexes (integers) for the tiers to count.
    'mode': 0 for simple count, 1 for median/average/maximum tokens.
    'symb': a symbol to ignore to ignore a given segment.
    Note: 'symb' should be turned into a list of symbols to ignore.
    Note: another list should be provided for the token boundaries.
    Currently, only spaces are taken into account when counting within a segment."""
    
    if not l_tiers:
        for a in range(len(trans)):
            l_tiers.append(a)
        # We count the number of tokens (and stats if need be)
    count = 0; t_count = 0; s_count = 0; n_space = 0
    l_stats = []; l_statistics = []; max = 0; min = 0; mean = 0; median = 0
    for a in l_tiers:
        tier = trans.tiers[a]
        t_count = 0
        for b in range(len(tier.segments)):
            segment = tier.segments[b]
            if segment.content:
                if ((segment.unit == False)
                    or (symb and symb == segment.content)):
                    continue
                else:
                    seg = segment.content; s_count = 0
                    for c in range(len(symb)):
                        seg.replace(symb[c]," ")
                    while "  " in seg:
                        seg = seg.replace("  ", " ")
                    n_space = seg.count(" ")
                    if n_space <= 0:
                        s_count = 1
                        t_count = t_count + 1
                    else:
                        s_count = n_space + 1
                        t_count = t_count + (n_space + 1)
                    if mode == 1:
                        l_stats.append(s_count)
            count += s_count
            s_count = 0
        if mode == 1:
            max = 0; min = 0; mean = 0; median = 0
            l_trans.clear(); test = 0
            for b in l_stats:
                s_count = b
                test = 0
                for c in range(len(l_trans)):
                    s_trans = l_trans[c]
                    if s_count <= s_trans:
                        l_trans.insert(c, s_count)
                        mean = mean + s_count
                        test = 1; break
                if test == 0:
                    mean = mean + s_count
                    l_trans.append(s_count)
            l_stats.clear()
            min = l_trans[0]; max = l_trans[-1]
            median = l_trans[int(len(l_trans)/2)]
            mean = (mean/len(l_trans))
            l_statistics.append((a, t_count, mean, median, max, min))
    l_tiers.clear(); symb.clear()
    if mode == 1:
        return count, l_statistics
    else:
        return count