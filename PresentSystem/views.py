from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.core.context_processors import csrf

# Create your views here.

import json,os

import PresentSystem.bcolors as TOOLS
from PresentSystem.parser import __author__,test,parser

# from PresentSystem.static.PresentSystem.API.MD_XML import __author__
# log = TOOLS.bcolors.OKBLUE+'**'+TOOLS.bcolors.ENDC
log = TOOLS.bcolors.OKGREEN+'** log **'
path_pre = "/static/PresentSystem/API/"

#Global Variables used for updating context to render index.hmtl
DEFAULT_TextArea = '''Title
=========

Please edit your plain text here'''

CONTEXT_index = {
	'present_path': '',
	'input_md':DEFAULT_TextArea
	}

''' /PresentSystem/ '''
def index(request):
	TOOLS.print_log('Render index_Bootstrap.html')
	
	context = CONTEXT_index
	
	temp = render(request, 'PresentSystem/index_Bootstrap.html',context)
	CONTEXT_index['present_path'] = ''
	CONTEXT_index['input_md']=DEFAULT_TextArea

	return temp #render(request, 'PresentSystem/index_Bootstrap.html',context)


''' /PresentSystem/convert/ '''
def convert(request):
	TOOLS.print_log('Author Submit a form')

	if request.method == 'POST':
		CONTEXT_index.update(csrf(request))
		input_md = request.POST.get('input-md')
		paradigm = request.POST.get('selected-paradigm')

		if len(input_md.strip()) == 0:
			CONTEXT_index['present_path'] = ''
			CONTEXT_index['input_md']=DEFAULT_TextArea
			TOOLS.print_log('Nothing in TextArea!')
		else:
			can_output, html_parsed, output_name, output_format = parser(input_md, paradigm)
			TOOLS.print_log('selected-paradigm is '+paradigm)
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
				
				CONTEXT_index['present_path'] = path_pre+output_name
				CONTEXT_index['input_md'] =input_md
				TOOLS.print_log('Filed used for Presentation: ' + CONTEXT_index['present_path'])
	
			else:
				CONTEXT_index['present_path'] = ''
				CONTEXT_index['input_md']=input_md
				TOOLS.print_log('parser return NOT support can_output')

	else:#request.method == 'GET'
		TOOLS.print_log('Form is NOT submitted via method = POST!')

	return HttpResponseRedirect('/PresentSystem/')


'''/PresentSystem/parsed/ handle and diplay the returned/parsed file'''
def parsed(text,paradigm):
	TOOLS.print_log(' >>Paser Markdown into HTML<<')

	supported_paradigm = TOOLS.json2object()# imported from texts.py

	file_name = supported_paradigm[paradigm]['file_name']

	context = {
	'present_path': path_pre+file_name,
	'input_md':text,
	}

	return context


'''/PresentSystem/test/ : test Django Features'''
def test(request):
	context = {}
	context.update(csrf(request))
	# if len(request.POST) == 
	ou = str(request)
	TOOLS.print_log('check request\n'+ ou)

	return render(request, 'PresentSystem/test.html',context)