import re

class Rlines:
	"""Container for LBL segments.
	
	Iterable. Assumes the first field marker will always be the same. Recovers all lines
	in between in tuples ("marker", "prev", "rest", "time"), all strings, where 'prev' is
	text before the timestamp and 'rest' text after it.
	'gettime' uses the first timestamp 'time' it finds to get, store and return it."""
	
	def __init__(self):
		self.lines = []
		self.start = 0.
		self.check = 0
		
	def getline(self, line):
		if not line.startswith("\\"):
			marker = ""; rest = line
		elif " " in line:
			marker, rest = line.split(" ", 1)
		else:
			marker = line; rest = ""
		d_pos = re.search("\d+(\.|  |\. )\d+ \d+(\.|  |\. )\d+(\\r\\n|\\n| )", rest)
		if not d_pos:
			d_pos = re.search("\d+(\.|\. |  )\d+(\\r\\n|\\n| )", rest)
		if not d_pos:
			prev = ""; time = ""
		else:
			p_start, p_end = d_pos.span()
			prev = rest[:p_start]; time = rest[p_start:p_end]
			rest = rest[p_end:]
		time = time.replace(". ", ".").replace("  ", ".")
		if time.endswith("\n"):
			time = time[:-1]
		while time.endswith(" "):
			time = time[:-1]
		self.lines.append((marker, prev, rest, time))
	
	def gettime(self):
		if self.check == 1:
			return self.start
		for line in self.lines:
			if line[3]:
				l_time = line[3].split(" "); t_len = len(l_time)
				if t_len >= 1:
					self.start = float(l_time[t_len-1])
					self.check = 1
					break
		return self.start
		
	def __iter__(self):
		self.count = -1
		self.max = len(self.lines)-1
		return self
	
	def __next__(self):
		if self.count < self.max:
			self.count += 1
			return self.lines[self.count]
		else:
			raise StopIteration
			
	def clean(self):
		self.lines.clear()
		self.start = 0.
		self.check = 0

class Refseg:
	"""Container for LBL segments.
	
	Builds an actual "ref" block. Most of the work has been done at the 'Rlines' level,
	so this is just building the eventual Toolbox file."""
	
	def __init__(self, ref="", part=""):
		self.l_lines = []
		self.ref = ref
		self.start = 0.; self.end = 0.; self.part = part
		self.check = 0
	
	def fromRline(self, lines, start=""):
			# We set the time, ref, part...
		if start:
			self.start = start; self.check == 1
			# We add the lines
		for line in lines:
			self.l_lines.append(line)

def manageRef(l_ref, Rline, part, count):
	"""Support function to fixLBL.
	
	Each time the first field marker of a ref block (in the original LBL file) has been
	reached, this function checks whether or not to create a new Refseg object. Otherwise
	it feeds lines to those Refseg objects."""
	
	if not l_ref:
		count += 1
		ref = '{:03d}'.format(count)
		l_ref.append(Refseg(ref, part))
	else:
		check = 0
		for tuple in Rline:
			if tuple[1]:
				check = 1; break
			#### Must add "prev" to ref
		lines = []
		if check == 1:
			for tuple in Rline:
				if tuple[0]:
					nline = tuple[0] + " " + tuple[1]
				else:
					nline = tuple[1]
				if not nline.endswith("\n"):
					nline = nline + "\n"
				lines.append(nline)
			l_ref[-1].fromRline(lines)
		lines.clear()
			### Other stuff
		for tuple in Rline:
			if tuple[0]:
				nline = tuple[0] + " " + tuple[2]
			else:
				nline = tuple[2]
			if not nline.endswith("\n"):
				nline = nline + "\n"
			lines.append(nline)
		start = Rline.gettime()
		if Rline.check == 0:
			l_ref[-1].fromRline(lines)
		else:
			if l_ref[-1].check == 0:
				l_ref[-1].fromRline(lines, start)
				l_ref[-1].check = 1
			elif l_ref[-1].start == start:
				l_ref[-1].fromRline(lines)
			else:
				count += 1
				ref = '{:03d}'.format(count)
				l_ref.append(Refseg(ref, part))
				l_ref[-1].fromRline(lines, start)
				l_ref[-1].check = 1
	return l_ref, count

def fixLBL(f, cf):
	"""Transforms a '.lbl' into a Toolbox '.txt'.
	
	/!\ Does not keep the original 'ref' blocks!
	The LBL format puts timestamps inside field marker texts. The game is to use those
	timestamps to define new 'ref' blocks."""
	
		# Variables
	if not cf:
		cf = f.rsplit(".", 1)[0]
		cf = cf + ".txt"
	step = 0; marker = ""; count = 0; check = 0
	header = ""; ctext = ""; l_ref = []; part = ""
		# We store all "ref" objects
	with open(f, encoding="utf-8") as file:
			## First we get a list of field markers
		for line in file:
			if line.startswith("\\"):
				fm = line[:line.find(" ")]
				if "\\ref" in fm:
					if count == 0:
						count = 1
						continue
				if count == 1 and (not "\\ELAN" in fm):
					marker = fm
					break
		file.seek(0); count = 0; Rline = Rlines()
		step = 0
			## Next we get a list of Refsegs
		for line in file:
				### We get "ctext" and "part"
			if step == 0:
				if "\\_sh" in line:
					header = line
				elif line.startswith("\\info"):
					part = line.split(".",1)[0]
					part = part.split(" ")[-1]
				elif line.startswith("\\id"):
					ctext = line
					step = 1
				continue
				### We get the lines
			elif step == 1:
				if line.startswith(marker):
					"""Refseg's painful management."""
					l_ref, count = manageRef(l_ref, Rline, part, count)
					"""The rest is just filling Rline."""
					Rline.clean(); Rline.getline(line)
				elif not line.startswith("\\ref"):
					Rline.getline(line)
			### We need a last round
		l_ref, count = manageRef(l_ref, Rline, part, count)
		Rline.clean()
		ctext = header + ctext
	
		# We get the timestamps (end)
	count = len(l_ref)-1
	for a in range(count):
		l_ref[a].end = l_ref[a+1].start
		# We fix missing timestamps
	for a in range(count):
		start = l_ref[a].start
		end = l_ref[a].end
		if end <= start:
			for b in range(a+1, count):
				n_end = l_ref[b].end
				if n_end > start:
					tot = (b-a)+1; tick = 0
					for c in range(a, b):
						tick += 1
						time = start + (n_end-start)*(tick/tot)
						l_ref[c].end = time
						l_ref[c+1].start = time
					break
		# We write
	for a in range(count):
		text = ("\n\\ref " + l_ref[a].ref + "\n"
				+ "\\ELANBegin " + '{:.3f}'.format(l_ref[a].start) + "\n"
				+ "\\ELANEnd " + '{:.3f}'.format(l_ref[a].end) + "\n"
				+ "\\ELANParticipant " + l_ref[a].part + "\n")
		for line in l_ref[a].l_lines:
			text = text + line
		ctext = ctext + text
		text = ""
		# We write the whole thing in a new file
	with open(cf, 'w', encoding="utf-8") as file:
		file.write(ctext)
		# Needless return for completion check, per C++ tradition
	return 0
	