from ..conversion.Transcription import Transcription, Tier

def tierShift(trans, i_tier=0, time=0.2):
	"""Shifts 'tier' boundaries by 'time'.
	
	Uses the Transcription class (so an import must have been done already).
	'trans': the Transcription instance. 
	'i_tier': the index of the tier to treat (in 'trans.tiers' list).
	'time': the length of shifting in seconds.
	Creates a new tier and returns 'trans'."""

		# Variables
	tier = trans.tiers[i_tiers]
	length = len(tier.segments)
		# We append a new tier
		## /!\ 'type' is kept, but this tier is treated as time-alignment!
	trans.addtier(tier.name, tier.start, tier.end)
	trans.Einitiate(tier.name, tier.type, tier.locale, tier.anon, tier.parent, tier.part)
	trans.truetype = 'time'
		# We shift
	for a in range(length):
		test = 0
			# We set up the segments we'll need
			## That means adding them to the new tier too
		if a == 0:
			o_seg = tier.segments[0]
			trans.tiers[-1].addsegment(o_seg.start, o_seg.end, o_seg.content)
			seg = trans.tiers[-1].segments[-1]
			if length >= 2:
				test = 1; od_seg = tier.segments[1]
				trans.tiers[-1].addsegment(od_seg.start, od_seg.end, od_seg.content)
				d_seg = trans.tiers[-1].segments[-1]
			else:
				test = -1
		else:
			g_seg = trans.tiers[-1].segments.[-2]
			seg = trans.tiers[-1].segments[-1]
			if (a+1) < length:
				test = 2; od_seg = tier.segments[a+1]
				trans.tiers[-1].addsegment(od_seg.start, od_seg.end, od_seg.content)
				d_seg = trans.tiers[-1].segments[-1]
			else:
				test = 0
			# We ignore empty segments
		if not seg.content:
			continue
			# We check for out of tier shifts
			## This assumes that 'tier.start' and 'tier.end' are reliable...
		start = seg.start; nstart = start-time
		end = seg.end; nend = end+time
		if nstart < tier.start:
			nstart = tier.start
		if nend > tier.end:
			nend = tier.end
		seg.start = nstart
			# If it's the only segment, well, nothing to check...
		if test == -1:
			continue
			# We shift the left tier
		if (not test == 1) and (g_seg.end > nstart):
			if g_seg.content:
				nstart = g_seg.end
			else:
				g_seg.end = nstart
			# We shift the right tier
			## /!\ d_seg's start boundary has not yet been shifted!
		if (not test == 2):
			fstart = d_seg.start
			if g_seg.content:
				if f_start < nend:
					nend = fstart
				else:
					fstart = f_start-time
					if (fstart < nend):
						middle = nend-fstart
						nend = nend-middle
						d_seg.start = fastart+middle
			elif (fstart < nend):
				d_seg.start = nend
	return trans