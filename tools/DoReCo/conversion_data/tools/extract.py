from ..conversion.Transcription import Transcription, Tier

def extract(trans, l_tiers):
    """Creates a new transcription with only the selected tiers."""
    
    ntrans = Transcription(trans.name, trans.start, trans.end)
    for a in l_tiers:
        tier = trans.tiers[a]
        ntrans.addtier(tier.name, tier.start, tier.end)
        ntrans.tiers[-1].Einitiate(tier.name, tier.type, tier.locale, tier.annotator,
                                   tier.parent, tier.participant)
        for seg in tier:
            ntrans.tiers[-1].addsegment(seg.start, seg.end, seg.content, seg.id,
                                        seg.ref, seg.prev, seg.unit)
    return ntrans