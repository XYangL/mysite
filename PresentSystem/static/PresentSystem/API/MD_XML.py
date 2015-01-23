__author__ = 'Xiaoyang'
"""
Convert Content to XML 
=============================================

Convert Content from Raw in Markdown to XML/XHTML format

Output XML will be used with XSLT to add web_slide effect
e.g. slidy.js, or slideme.js or S5.js

Using Markdown because of it pre-defined leverl relation

USage Example: python MD_XML.py content.md slidy

"""
import xml.etree.ElementTree as ET

js_type = None
js_name = None

pr_title = None

config_tree = None
content_tree =  None

implemented = ["slidy","scroll", "S5"]


def do_it(content_filename, config_filename):

	global js_type , js_name , pr_title , config_tree , content_tree , implemented

	#load config file
	# loadcofig(content_filename)
	config_tree=ET.parse(config_filename).getroot()
	js_name = config_tree.find("name").text

	if js_name in implemented:
		js_type = config_tree.find("type").text
		content_tree = md2xml(content_filename,js_type)#<content></content>

		html=ET.Element("html")
		html.set("lang","en")
		html.set("xmlns","http://www.w3.org/1999/xhtml")
		html.set("xml:lang","en")

		#head : return head_tree <head>...</head>
		head = pre_xml2html("head")
		html.append(head)

		#body : return body_tree <body>...</body>
		body= pre_xml2html("body")
		html.append(body)

		output_format = config_tree.find("format").text
		output_name = "["+js_name+"]"+pr_title

		if output_format == "html":
			fo = open(output_name+".html", "w")
			fo.write(ET.tostring(html,method="html"))
			fo.close()
		elif output_format == "xhtml":
			fo = open(output_name+".xhtml", "w")
			fo.write(ET.tostring(html,method="xml"))
			fo.close()
		else:
			print "Unknown Format : "+output_format

	else:
		print "\""+js_name+"\" has not been implemented"
	
	return

def pre_xml2html(father):
	global js_type , js_name , pr_title , config_tree , content_tree

	config_tr = config_tree.find(father)
	new_tr = ET.Element(father)
	
	# append
	root = config_tr.find("append")
	if root != None:
		for element in list(root):
			if element!= None:
				new_tr.append(element)

	if father == "head":
		temp = ET.Element("title")
		temp.text=pr_title
		new_tr.append(temp)
		
	elif father == "body":
		if js_type =="list":
			new_tr.set("class","slide")

		temp = config_tr.find("content")
		cont_Dad = temp.find("father").text

		for ele in [new_tr.find(cont_Dad)]:
			for element in content_tree:
				ele.append(element)
		# new_tr = content_tree

	else:
		new_tr = ET.Element(father)
	

	#set
	for element in list(config_tr.find("set")):#element = <rul></rul>
		rul_xpath = element.find("path").text
		rul_key = element.find("key").text
		rul_value = element.find("value").text
		print "@"+ rul_xpath +" set "+ rul_key +" = "+ rul_value
		for sel_ele in new_tr.findall(rul_xpath):
			sel_ele.set(rul_key,rul_value)

	return new_tr
	

def md2xml(md_filename,ani_type):
	global js_type, pr_title

	import markdown
	#For files not in unicode, encode is necessary 
	#Extension testing
	import codecs

	input_file= codecs.open(md_filename,"r",encoding="utf-8")
	raw_content=input_file.read()
	xml_content="<content>\n"+markdown.markdown(raw_content,extensions=['tables'])+"\n</content>"

	body_tr = ET.fromstring(xml_content)#<content></content>

	pr_title = list(body_tr)[0].text
	print("Title: "+ pr_title)

	#Math
	for pre_ele in list(body_tr.findall(".//pre")):
		code_ele = pre_ele.find("code")
		# ET.dump(code_ele)
		if code_ele.text.find("[Math]") == 0:  
	 		math_str = code_ele.text[7:-1]
	 		pre_ele.remove(code_ele)
	 		pre_ele.text = math_str
	 		pre_ele.tag = "ma"
	 		
	# ET.dump(a)
	# exit()

	new_body_tr = None
	if js_type == "slide":
	# cut the content into slides	
		# body_tr.remove(list(body_tr)[0])
		new_body_tr = splitslide(body_tr)

	elif js_type =="list":
		new_body_tr = con_list(body_tr)
	else: 
		new_body_tr = xml_content

	return new_body_tr

def con_list(old_body):
	new_body = ET.Element("div")#Reset the body for new stracture
	new_body.set("class","contentDiv")
	ul_temp = None
	
	title_add = False
	#level_one
	for l1_ele in list(old_body):
		if (l1_ele.tag == "h1"):
			if ul_temp != None:
			#not first
				new_body.append(ul_temp)
				# print l1_ele.text
				ul_temp = None
			# else:
			ul_temp = ET.Element("ul")
			ul_temp.set("class","one_level")

			# if not _add:
			# 	li_temp = ET.Element("li")
			# 	a_temp = ET.Element("a")
			# 	a_temp.set("href","#")
			# 	a_temp.text = pr_title
			# 	li_temp.append(a_temp)
			# 	ul_temtitlep.append(li_temp)
			# 	title_add = True

			li_temp = ET.Element("li")
			a_temp = ET.Element("a")
			a_temp.set("href","#")
			a_temp.text = l1_ele.text
			li_temp.append(a_temp)
			ul_temp.append(li_temp)
		else:
			if ul_temp != None:
				ul_temp.append(l1_ele)
	new_body.append(ul_temp)

	#level_two
	old_body = new_body
	new_body = ET.Element("div")#Reset the body for new stracture
	new_body.set("class","contentDiv")
	ul_l1 = ET.Element("ul")
	ul_l1.set("class","one_level")
	for l1_ele in list(old_body.findall("ul[@class='one_level']")):
		ul_l1_T = l1_ele.find("li/a").text
		# ET.dump(l1_ele)
		# print ul_l1_T
		
		# Get ul.two element
		ul_l2 = ET.Element("ul")
		ul_l2.set("class","two_level")
		for child in list(l1_ele):
			if (child.tag != "li"):
				if child.tag == "p":
					child.tag = "span"

				for i in child.findall("a"):
					if i != None:
						# ET.dump(i)
						i.tag="bold"
						# ET.dump(i)
				# exit();

				li_l2 = ET.Element("li")
				a_l2 = ET.Element("a")
				a_l2.set("href","#")

				# if child.tag == "ol":
				# 	child.set("class","three_level")
				# 	child.tag = "ul"
				# 	li_l2.append(a_l2)
				# 	ul_l2.append(li_l2)
				# else
				a_l2.append(child)
				li_l2.append(a_l2)
				ul_l2.append(li_l2)
		
		
		li_l1 = ET.Element("li")
		a_l1 = ET.Element("a")
		a_l1.set("href","#")
		a_l1.text = ul_l1_T
		
		li_l1.append(a_l1)
		li_l1.append(ul_l2)
		ul_l1.append(li_l1)

		# new_body.append()
		# ET.dump(ul_l1)
	new_body.append(ul_l1)#div.tab_content
	fo = open("temp.xhtml", "w")
	fo.write(ET.tostring(ul_l1,method="xml"));
	fo.close()

	return new_body

def splitslide(old_body):

	h1_ele = None
	H2_ele_list = None
	new_slide = None
	slide_ele_list = []

	new_body = ET.Element("body")#Reset the body for new stracture

	for element in list(old_body):
		if element.tag == "h1":
			# print "h1"
			if h1_ele!=None:
				if H2_ele_list!=None:
				#append last H2 to h2_ele_list
					slide_ele_list.append(new_slide)
				#append last H1-outline slide
					new_slide = ET.Element("div")
					new_slide.set("class","slide")
					new_slide.append(h1_ele)
					new_slide.append(H2_ele_list)

				if new_slide == None:
				# side with only a h1 title
					new_slide = ET.Element("div")
					new_slide.set("class","slide")
					new_slide.append(h1_ele)

				new_body.append(new_slide)

			if len(slide_ele_list)!=0:
			# append ALL last H2
				for every_slide in slide_ele_list:
					new_body.append(every_slide)

			# start new slide_list
			h1_ele = element
			H2_ele_list = None #ET.Element("ul")
			new_slide = None
			slide_ele_list = []
		
		elif element.tag == "h2":
			# print "h2"
			if H2_ele_list == None:
			# first H2 , new_lide == None
				H2_ele_list = ET.Element("ul")
			else:
			# append last H2
				slide_ele_list.append(new_slide)


			# For H1-outline slide
			temp = ET.Element("li")
			temp.append(element)
			H2_ele_list.append(temp)
			# A NEW slided
			new_slide = ET.Element("div")
			new_slide.set("class","slide")
			new_slide.append(h1_ele)
			new_slide.append(element)
			
		else:
			# print element.tag
			if new_slide == None:
				new_slide = ET.Element("div")
				new_slide.set("class","slide")

				if h1_ele !=None:
					new_slide.append(h1_ele)

			new_slide.append(element)

###########
	if h1_ele!=None:
		if H2_ele_list!=None:
		#append last H2 to h2_ele_list
			slide_ele_list.append(new_slide)
		#append last H1-outline slide
			new_slide = ET.Element("div")
			new_slide.set("class","slide")
			new_slide.append(h1_ele)
			new_slide.append(H2_ele_list)

		if new_slide == None:
		# side with only a h1 title
			new_slide = ET.Element("div")
			new_slide.set("class","slide")
			new_slide.append(h1_ele)

		new_body.append(new_slide)

	if len(slide_ele_list)!=0:
	# append ALL last H2
		for every_slide in slide_ele_list:
			new_body.append(every_slide)

###########
	return new_body


if __name__ == "__main__":
    import sys
    if len(sys.argv) == 3:
    	content_fn = sys.argv[1];
    	config_fn = sys.argv[2];
    	do_it(content_fn,config_fn)
    else:
		# print "Usage: "
		# print "       python MD_XML.py content-filename config-filename"
		do_it("content.md","slidy_config.xml")
		do_it("content.md","S5_config.xml")
		do_it("content.md","scroll_config.xml")