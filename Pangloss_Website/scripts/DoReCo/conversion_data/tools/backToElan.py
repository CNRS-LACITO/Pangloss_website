from .Transcription import Transcription, Tier

def backToElan(transN, transO):
	"""Integrates a file back to another file
	
	If 'transO' was exported as 'transN', and 'transN' got edited, for lossless conversion
	we want to put the edits back into 'transO'. 
	'input' and 'output' indicate the formats of 'fichN' and 'fichO' respectively.
	> Only 'truetype="time"' tiers are edited.
	> New tiers are added but /!\ no tier is removed.
	The 'Transcription' class contains a method 'setids()' which itselfs calls 'setstructure()'.
	They are the ones handling whatever the edits' effects could have on child tiers. In
	effect, there has been little testing."""
	l_add = []; test = 0
		# We edit tiers and list those to add
	for a in range(len(transN.tiers)):
		nameP = transN.tiers[a].name; test = 0
		for b in range(len(transO.tiers)):
			nameE = transO.tiers[b].name
			if nameP == nameE:
				if transO[b].truetype == "time":
					transN.tiers[a].id = transO.tiers[b].id
					transN.tiers[a].ref = transO.tiers[b].ref
					transN.tiers[a].prev = transO.tiers[b].prev
					transO.tiers.replace(b, transN.tiers[a])
				# this is where other types would be replaced
				test = 1
		if test == 0:
			if not l_add:
				l_add.append((a, a))
			else:
				l_add.append((a, l_add[-1][1]+1))
		# We add the missing tiers
	pos = -1
	for a in range(len(l_add)):
		transN.tiers.insert(l_add[a][1], transN.tiers[l_add[a][0]])
		pos = l_add[a][1]
		for b in range(len(l_add)):
			if l_add[b][1] >= pos:
				l_add[b] = (l_add[b][0], l_add[b][1]+1)
	l_add.clear()
		# Cleaning the segment ids
	transO.setids(1)
	transO.clear(0)
	return transO