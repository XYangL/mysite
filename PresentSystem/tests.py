from django.test import TestCase
# Create your tests here.

import json, os, tempfile
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

	
# object2json()
# print json2object()['Scroll']['file_name']
