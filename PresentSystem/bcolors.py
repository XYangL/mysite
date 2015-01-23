
class bcolors:
	HEADER = '\033[95m'
	OKBLUE = '\033[94m'
	OKGREEN = '\033[92m'
	WARNING = '\033[93m'
	FAIL = '\033[91m'
	ENDC = '\033[0m'
	BOLD = '\033[1m'
	UNDERLINE = '\033[4m'

def print_log(content):
	log = bcolors.OKGREEN+'** log **'
	print log, content
	return #log+' '+content

import json,os
def object2json():
	supported_paradigm = {}

	supported_paradigm["S5"]	= {} #{"paradigm":"slide" 	, "file_name":"[S5]Markdown Syntax.html"}
	supported_paradigm["S5"]['paradigm'] = "slide"
	supported_paradigm["S5"]["file_name"] = "[S5]Markdown Syntax.html"
	supported_paradigm["S5"]["config"] = "S5_config.xml"

	supported_paradigm["Scroll"]= {} #{"paradigm":"scroll" 	, "file_name":"[scroll]Markdown Syntax.html"}
	supported_paradigm["Scroll"]['paradigm'] = "scroll"
	supported_paradigm["Scroll"]["file_name"] = "[scroll]Markdown Syntax.html"
	supported_paradigm["Scroll"]["config"] = "scroll_config.xml"

	supported_paradigm["Slidy"]	= {} #{"paradigm":"slide" 	, "file_name":"[slidy]Markdown Syntax.xhtml"}
	supported_paradigm["Slidy"]['paradigm'] = "slide"
	supported_paradigm["Slidy"]["file_name"] = "[slidy]Markdown Syntax.xhtml"
	supported_paradigm["Slidy"]["config"] = "slidy_config.xml"


	# json_data = json.dumps(supported_paradigm, indent=4, separators=(',', ': '))
	# print json_data

	settings_dir = os.path.dirname(__file__)
	PROJECT_ROOT = os.path.abspath(os.path.dirname(settings_dir))
	FILES_FOLDER = os.path.join(PROJECT_ROOT, 'PresentSystem/static/PresentSystem/API/')
	file_name = 'supported_paradigm.json'
	json_file = open(FILES_FOLDER+file_name,'w')
	# json_file.write(json_data)

	json.dump(supported_paradigm, json_file)
	json_file.close()
	return FILES_FOLDER+file_name

def json2object():

	settings_dir = os.path.dirname(__file__)
	PROJECT_ROOT = os.path.abspath(os.path.dirname(settings_dir))
	FILES_FOLDER = os.path.join(PROJECT_ROOT, 'PresentSystem/static/PresentSystem/API/')
	file_name = 'supported_paradigm.json'
	json_file = open(FILES_FOLDER+file_name,'r')
	supported_paradigm = json.load(json_file)
	json_file.close()

	return supported_paradigm

def prettify(html_string):
	import bs4,re
	html_prettify = bs4.BeautifulSoup(html_string).prettify(formatter="minimal")

	indent_width=4
	r = re.compile(r'^(\s*)', re.MULTILINE)
	html_string = r.sub(r'\1'*indent_width, html_prettify)

	return html_string
