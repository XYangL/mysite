from django.shortcuts import render
from django.http import HttpResponseRedirect
# Create your views here.

import json,os

import PresentSystem.bcolors as TOOLS
from PresentSystem.parser import __author__,test,parser

# from PresentSystem.static.PresentSystem.API.MD_XML import __author__
# log = TOOLS.bcolors.OKBLUE+'**'+TOOLS.bcolors.ENDC
log = TOOLS.bcolors.OKGREEN+'** log **'
path_pre = "/static/PresentSystem/API/"

''' /PresentSystem/ '''
def index(request):
	TOOLS.print_log('Render index_Bootstrap.html')
	

	file_name = "[S5]Markdown Syntax.html"

	context = {
		'present_path': '',
		'author_text':'''Title
=========

Please edit your palin text here'''
		}

	return render(request, 'PresentSystem/index_Bootstrap.html',context)


''' /PresentSystem/convert/ '''
def convert(request):
	TOOLS.print_log('Submit a form #author')

	context = {}
	if request.method == 'GET':
		if request.GET.get('author-ta'):
			text = request.GET.get('author-ta')
			paradigm = request.GET.get('selected-paradigm')
			TOOLS.print_log('selected-paradigm is '+paradigm)
			# TOOLS.print_log(Please convert \n'+log, ('\n'+log).join(text.split('\n'))'')

			# context = parsed(text, paradigm)
			# TOOLS.print_log(__author__)
			# test()
			can_output, html_parsed, output_name, output_format = parser(text, paradigm)
			TOOLS.print_log('Can_output ' + str(can_output))
			# TOOLS.print_log(output_name)
			if can_output:
				output_name = '['+paradigm+']'+'temp.'+output_format

				settings_dir = os.path.dirname(__file__)
				PROJECT_ROOT = os.path.abspath(os.path.dirname(settings_dir))
				
				FILES_FOLDER = os.path.join(PROJECT_ROOT, 'PresentSystem'+path_pre)
		
				fo = open(FILES_FOLDER+output_name, "w")
				fo.write(html_parsed)
				# print fo
				fo.close()
				
				context = {
				'present_path': path_pre+output_name,
				'author_text':text,
				}
			else:
				TOOLS.print_log('parser return is NOT can_output')

		else:
			TOOLS.print_log('Nothing in Textarea!')

	else:
		TOOLS.print_log('Submit Method is NOT GET!')

	return render(request, 'PresentSystem/index_Bootstrap.html',context)
	# return HttpResponseRedirect('/PresentSystem/parsed/')
	# return HttpResponseRedirect('/PresentSystem/parsed/?text=%s&paradigm=%s' % (text, paradigm))

'''/PresentSystem/parsed/ handle and diplay the returned/parsed file'''
def parsed(text,paradigm):
	TOOLS.print_log(' >>Paser Markdown into HTML<<')

	supported_paradigm = TOOLS.json2object()# imported from texts.py

	file_name = supported_paradigm[paradigm]['file_name']

	context = {
	'present_path': path_pre+file_name,
	'author_text':text,
	}

	return context

