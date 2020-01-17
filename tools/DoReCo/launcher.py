


"""import inspect

def func(a, b, c):
    frame = inspect.currentframe()
    args, _, _, values = inspect.getargvalues(frame)
    print 'function name "%s"' % inspect.getframeinfo(frame)[2]
    for i in args:
        print "    %s = %s" % (i, values[i])
    return [(i, values[i]) for i in args]

>>> func(1, 2, 3)
function name "func"
    a = 1
    b = 2
    c = 3
[('a', 1), ('b', 2), ('c', 3)]"""



if __name__ == "__main__":
	"""Universal launcher for the 'conversion_scripts' package."""
	import sys, os
	import importlib, importlib.util
    
        # Variables
    nbre = len(sys.argv)
    path = os.getcwd()
    data_dir = os.path.join(path, "conversion_data")
    conversion_dir = os.path.join(data_dir, "conversion")
    collection_dir = os.path.join(data_dir, "interface", "collection")
    tools_dir = os.path.join(data_dir, "tools")
        # We check the package
        ## That means recovering all folder paths
        ## And one or more tool functions
    if not os.path.isdir(data_dir):
        if nbre <= 1:
            raise FileNotFoundError("Can't find the \"conversion_data\" package.")
        else:
            data_dir = ""
            while not data_dir:
                data_dir = input("\n\nCannot find the 'conversion_data' package, please give a path: ")
                if data_dir and (not os.path.isdir(data_dir)):
                    data_dir = ""
	if ((not os.path.isdir(conversion_dir)) or (not os.path.isdir(tools_dir)) or
		(not os.path.isdir(collection_dir))):
		raise FileNotFoundError("\n\nError: A package folder is missing. Check for:\n"
								"- 'conversion_data>conversion'\n"
								"- 'conversion_data>interface>collection"
								"- 'conversion_data>tools")
		# We recover old settings
        ## That means creating a Collection object from a text file in "interface>collection"
	from conversion_data.interface.Collection import Collection, Folder, File
	coll = Collection("default")
	f_default = os.path.join(collection_dir, "default.txt")
	if not os.path.isfile(f_default):
		coll.save(f_default)
	else:
		coll.load(f_default, 0)
		#We actually do something with our lives
	valid = False
		# We recover the list of available scripts (beyond conversion)
		## Those need to follow a logic but right now, we just recover names
	tools = ['conversion', 'collection']
	methods = [None, None]
	for file in os.listdir(tools_dir):
		temp = File(tools_dir, file)
		name, ext, truext = temp.setExt()
		if ext == "py" and (not name == "__init__"):
			"""We're meant to poke the script but this will do for now."""
			tools.append(name)
			temp = importlib.import_module('.'+name,package='conversion_data.tools')
			methods.append(getattr(temp, name))
		# We get the command (manual or else)
	if nbre <= 1:
		command = ""
		while not valid:
			while not command:
				command = input("\nCollection ready. Name the operation (without the '.py' "
							 "extension). 'conversion' to convert files, 'collection' to "
							 "load/save batches. Script name otherwise.\n\nOperation: ")
			if command in tools:
				valid = True
	else:
		command = sys.argv[1]
		if command not in tools:
			print("\nError: operation not found. Here is the list of valid operations found:"
				  "\n",tools)
			exit()
	
	
	