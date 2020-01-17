import os

class File:
	"""A container class that deal with a specific file.
	
	It's job is to track the file extension, true extension, tiers, etc.
	Can also be used to find files through its methods."""
	
	def __init__(self, name="", path="", ext=""):
		self.name = name
		self.path = path
		self.fullpath = os.path.join(path, name)
		self.ext = ext
		self.truext = ("","") #Actual transcription format: ('elan','eaf'), etc
		self.tiers = [] #Sorted by order found
		
	def setExt(self, name="", ext="", truext=("","")):
		"""Setting the file extension.
		
		This is not perfect. If a file is named 'bob.savestheworld' and no extension is given,
		it will fail. We cannot give truext precedence."""
			# We check if data is internal or external
		if not name:
			name = self.name
		if not ext:
			ext = self.ext
		if not truext:
			truext = self.truext
			# We check 'ext' and 'name'
		if '.' in ext:
			ext = ext.replace(".","")
		if ext:
			if name.endswith(ext):
				name = name.rsplit(".",1)[0]
		elif "." in name:
			name, ext = name.rsplit(".",1)
		elif truext[0]:
			ext = truext[1]
			if name.endswith(ext):
				name = name.rsplit(".",1)[0]
			# We set the result
		self.name = name
		self.ext = ext
		self.truext = truext
		return (name, ext, truext)
		
	def poke(self):
		"""Oh lord almighty (tiers)"""
		pass

class Folder:
	"""A container class that deals with a specific folder
	
	Must test the available file formats.
	Must (on demand) test the file content (confirm format, get tier count/names).
	Meaning it must indicate for each file its name and format (extension).
	NOTE: ".tgd" for ".TextGrid" and ".too" for "Toolbox"."""
	
	def __init__(self, fullpath=""):
		self.name = ""
		self.path = ""
		self.fullpath = fullpath
		self.files = [] #Relevant files contained in the folder
		self.ext = []
		self.tiers = [] #Sorted without duplicates / tuple with file indexes
            # We set "name" and "path"
        self.path, self.name = os.path.split(fullpath)
		
	def setFiles(self, list=[]):
		self.files.clear()
		self.ext.clear()
		if not list:
			for file in os.listdir(self.fullpath):
				self.files.append(File(file, self.fullpath))
				ext = self.files[-1].setExt()
				if ext not in self.ext:
					self.ext.append(ext)
		else:
			for file in os.listdir(self.fullpath):
				for tuple in list:
					if file.endswith(tuple[1]):
						self.files.append(File(file, self.fullpath))
						ext = self.files[-1].setExt()
						if ext not in self.ext:
							self.ext.append(ext)
						break
	
	def setTiers(self):
		"""Oh lord almighty."""
		pass

class Collection:
	"""A class to select and sort transcription files."""
	
	def __init__(self, name=""):
		self.name = name
		self.folders = [] # List of objects Folder
		self.flen = 0
        self.extrafiles = [] # Files on top of those in the folders (path, file, ext)
		self.files = [] #Folder order with duplicates (path, file, ext)
        self.ext = []
		self.tiers = [] #Sorted without duplicates / tuple with file indexes
		self.selected = [] #Tuple with folders, files, tiers
		self.input = []
		self.output = []
			# pre-set list
		self.truext = [("praat","TextGrid"), ("transcriber","trs"), ("exmaralda","exb"),
					   ("elan","eaf"), ("tei","tei"), ("pangloss","txt"), ("toolbox", "txt")
					   , ("lbl","lbl"), ("flex","flextext")]
		
	def load(self, f, mode=1, all=0):
		"""File loader. 
		'f':	file name. Not yet opened.
		'mode':	how to load. '0': overwrite. '1': add.
		'all':	if we want all files and not just relevant extensions."""
		
		if mode == 0:
			self.folders.clear()
		with open(f, encoding="utf-8") as file:
			for line in file:
				line = line.replace("\n","")
				if os.path.isdir(line):
					self.addFolder(line)
		self.sortFiles()
		
	def save(self, f):
		"""File saver.
		Saves the list of folder fullpaths into a .txt file.
		'f' must be a fullpath (conversion_data>interface>collection)."""
		
		with open(f, 'w', encoding="utf-8") as file:
			for folder in self.folders:
				file.write(folder.fullpath+"\n")
		
	def addFile(self, name, path="", ext=""):
		"""To add individual files."""
        fullpath = ""
        if not path:
            fullpath = name
            path, name = os.path.split(fullpath)
        elif ext:
            ext = ext.replace(".","")
            fullpath = os.path.join(path, name+"."+ext)
        else:
            fullpath = os.path.join(path, name)
        if not os.path.isfile(fullpath):
            return False
        self.extrafiles.append(File(name, path))
        self.extrafile[-1].setExt()   
	
	def addFolder(self, fullpath, index = -1):
		if not os.path.isdir(fullpath):
			return False
		if (index < 0) or (index >= self.flen):
			self.folders.append(Folder(fullpath))
			self.flen += 1
			self.folders[-1].setFiles(self.truext)
		else:
			self.folders.insert(index,Folder(fullpath))
			self.flen += 1
			self.folders[-1].setFiles(self.truext)
	def moveFolder(self, o_index, n_index):
		if (o_index < 0) or (o_index >= self.flen):
			return False
		elif o_index == n_index:
			return False
		elif (n_index < 0) or (n_index >= self.flen):
			if o_index == self.flen -1:
				return False
			self.folders.append(self.folders.pop(o_index))
		else:
			self.folders.insert(n_index, self.folders.pop(o_index))
	def removeFolder(self, index=-1):
		if self.folders:
			if (index == -1) or (index >= self.flen):
				del self.folders[-1]
			else:
				del self.folders[index]
				
	def sortFiles(self):
		"""Creates a list of files (in tuple (path, name, ext))"""
        
		self.files.clear()
		self.ext.clear()
		for folder in self.folders:
			for file in folder.files:
				self.files.append((file.path, file.name, file.ext))
				if file.ext not in self.ext:
					self.ext.append(file.ext)
        for file in self.extrafiles:
            self.files.append((file.path, file.name, file.ext))
            if file.ext not in self.ext:
                self.ext.append(file.ext)
		return self.files