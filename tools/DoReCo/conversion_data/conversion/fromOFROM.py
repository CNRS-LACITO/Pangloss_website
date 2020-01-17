from .Transcription import Transcription, Tier

def fromOFROM(f, **args):
	"""Converter for OFROM's XML files."""

		# Variables
	trans = Transcription()
    encoding = "utf-8"
    if "encoding" in args:
        encoding = args["encoding"]
	step = 0; count = -1
		# Reading the file
	with open(f, encoding=encoding) as file:
		for line in file:
			if step == 0:
				if "<speaker " in line:
					p_start = line.find("id=\"")+4
					p_end = line.find("\"",p_start)
					name = line[p_start:p_end]
					trans.tiers.append(Tier(name))
					trans.tiers.append(Tier(name+"[tokmin]"))
					trans.tiers.append(Tier(name+"[posmin]"))
					trans.tiers.append(Tier(name+"[tokmwu]"))
					trans.tiers.append(Tier(name+"[posmwu]"))
				elif "<table_soundsegment>" in line:
					step = 1; count = 0
			elif step == 1:
				if "<soundsegment " in line:
					p_start = line.find("speaker_id=\"")+12
					p_end = line.find("\"", p_start)
					name = line[p_start:p_end]
					if not trans.tiers[count].name == name:
						for a in range(len(trans.tiers)):
							if name == trans.tiers[a].name:
								count = a; break
					p_start = line.find("tmin=\"")+6
					p_end = line.find("\"",p_start)
					start = float(line[p_start:p_end])
					p_start = line.find("tmax=\"")+6
					p_end = line.find("\"",p_start)
					end = float(line[p_start:p_end])
					p_start = line.find("text=\"")+6
					p_end = line.find("\"",p_start)
					text = line[p_start:p_end]
					trans.tiers[count].addsegment(start, end, text)
				elif "</table_soundsegment" in line:
					step = 2; count = 0
			elif step == 2:
				if "<table_tok_mwu" in line:
					step = 3
			elif step == 3:
				if "<tokmwu " in line:
					p_start = line.find("speaker_id=\"")+12
					p_end = line.find("\"", p_start)
					name = line[p_start:p_end]
					if not trans.tiers[count].name == name:
						for a in range(len(trans.tiers)):
							if name == trans.tiers[a].name:
								count = a; break
					p_start = line.find("tmin=\"")+6
					p_end = line.find("\"",p_start)
					start = float(line[p_start:p_end])
					p_start = line.find("tmax=\"")+6
					p_end = line.find("\"",p_start)
					end = float(line[p_start:p_end])
					p_start = line.find("text=\"")+6
					p_end = line.find("\"",p_start)
					tokmin = line[p_start:p_end]
					p_start = line.find("pos_mwu=\"")+9
					p_end = line.find("\"",p_start)
					posmin = line[p_start:p_end]
					trans.tiers[count+3].addsegment(start, end, tokmin)
					trans.tiers[count+4].addsegment(start, end, posmin)
				elif "</table_tok_mwu" in line:
					step = 4
			elif step == 4:
				if "<table_tok_min" in line:
					step = 5
			elif step == 5:
				if "<tokmin " in line:
					p_start = line.find("speaker_id=\"")+12
					p_end = line.find("\"", p_start)
					name = line[p_start:p_end]
					if not trans.tiers[count].name == name:
						for a in range(len(trans.tiers)):
							if name == trans.tiers[a].name:
								count = a; break
					p_start = line.find("tmin=\"")+6
					p_end = line.find("\"",p_start)
					start = float(line[p_start:p_end])
					p_start = line.find("tmax=\"")+6
					p_end = line.find("\"",p_start)
					end = float(line[p_start:p_end])
					p_start = line.find("text=\"")+6
					p_end = line.find("\"",p_start)
					tokmin = line[p_start:p_end]
					p_start = line.find("pos_min=\"")+9
					p_end = line.find("\"",p_start)
					posmin = line[p_start:p_end]
					trans.tiers[count+1].addsegment(start, end, tokmin)
					trans.tiers[count+2].addsegment(start, end, posmin)
				elif "</table_tok_min" in line:
					break
	g_start = 1000000.; g_end = 0.
	for tier in trans.tiers:
		tier.start = tier.segments[0].start
		if tier.start < g_start:
			g_start = tier.start
		tier.end = tier.segments[-1].end
		if tier.end > g_end:
			g_end = tier.end
	trans.start = g_start
	trans.end = g_end
	return trans