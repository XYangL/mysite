/********************* initialize.js***********************/ 


/*Get the list for navigation*/
function set_nav_chapter(){
    
    chapter_name=$(".one_level>li>a");
    
    chapter_name.each(function(index){
        
    $(".nav_chapter ul").append("<li id='c"+index+"'><a href='#'>"+$(this).text()+"</a></li>");
    });
    
}

function set_nav_section(chapter_index){
    
    section_l=$(".two_level");
    section_name=section_l.eq(chapter_index).children("li").children('a');
    $(".nav_section ul").html("");
	section_name.each(function(index){   
            
    //$(".nav_section ul").append("<li><a href='#'>"+$(this).text()+"</a></li>");
	$(".nav_section ul").append("<li id='s"+index+"'><a href='#'>"+$(this).text()+"</a></li>");
    
    });
}

function set_nav_section_v2(){	
    All_Chapter=$(".two_level");
	
	for(si=0;si<All_Chapter.size();si++)
	{ 
	
		$("div.nav_section").append("<ul class='nav_section' id='c"+si+"'></ul>");
		
    	section_name=All_Chapter.eq(si).children("li").children('a');
    	$(".nav_section ul#c"+si).html("");
		section_name.each(function(index){   
            
    	//$(".nav_section ul").append("<li><a href='#'>"+$(this).text()+"</a></li>");
		$(".nav_section ul#c"+si).append("<li id='s"+index+"'><a href='#'>"+$(this).text()+"</a></li>");
    
    	});
	}
}


/*present the selected li>a in the preziDiv*/
function prezi_selected_li_a(li_a_index){
    selected_li_a=All_li_a.eq(li_a_index);
    
    selected_li_a_class=selected_li_a.parent().parent().attr('class');
    //$("div.preziDiv ul").addClass(selected_li_a_class);
    $("div.preziDiv ul").attr('class',selected_li_a_class);
    
    selected_li_a_offset_left=selected_li_a.offset().left;
   
    $("div.preziDiv ul>li>a").offset({left:selected_li_a_offset_left});   
    
    $("div.preziDiv ul>li>a").html(selected_li_a.html());
    $("div.preziDiv ul>li").width(selected_li_a.parent().width());//0906
}

/*scroll effect for contentDiv*/
function scroll_to_show_related_update(li_a_index){
    selected_li_a=All_li_a.eq(li_a_index);

    contentDiv_scroll_selected_top=selected_li_a.offset().top;
    contentDiv_scroll_base_top=All_li_a.eq(0).offset().top;
    // contentDiv_scroll_selected_height=selected_li_a.css('line-height');
    // contentDiv_scroll_base_height=All_li_a.eq(0).css('line-height');
    // testDiv_output(1,"elected_height: "+contentDiv_scroll_selected_height);
    //  testDiv_output(1,"base_height: "+contentDiv_scroll_base_height);
    
    /*!!!!the distance to the fisr li_a !! no selected li>a height*/
    target_position=contentDiv_scroll_selected_top - contentDiv_scroll_base_top;
    // target_position=target_position+contentDiv_scroll_selected_height - contentDiv_scroll_base_height;
   
    $("div.contentDiv").animate({scrollTop:target_position});
}

function testDiv_output(option,input_string)
{
	if (option ==1) 
	{
		$('div.testDiv>span').last().html(input_string);
		$('div.testDiv>span').last().after("<br><span class='label'></span>");
	}
	else if(option ==0)
	{
		$('div.testDiv').html("<span class='label'>"+input_string+"</span>");
	}
	else 
	{
		$('div.testDiv').html("<span class='label label-"+option+"'>"+input_string+"</span>");
	}	
}

/********************* mouse.js***********************/ 
function get_selected_chapter(chapter_index){
	$(".nav_section ul").removeClass('selected');
	$(".nav_section ul#c"+chapter_index).addClass('selected');
	$(".nav_section ul").hide();
	$(".nav_section ul.selected").show();
}

//0906// /*scroll contentDiv for navigation*/
function scroll_to_show_target(target_li_a){
    base_top=$("ul.one_level>li>a").eq(0).position().top;

    target_top=target_li_a.position().top;
    target_height=target_li_a.height();
    
    /*!!!!the distance to the fisr li_a + the height of targed li-a*/
    target_position=target_top-base_top+target_height;
    //output("target: top="+target_top+", targeted="+target_position+", height="+target_height+" "+target_li_a.text());
    
    $("div.contentDiv").animate({scrollTop:target_position},'slow');
}

/********************* keyboard.js***********************/ 
/*active the three diferent mode when press related key*/
function active_pre(){//presentation
	$('div.modeDiv').html("<span class='label'>Presentation</span>");
	testDiv_output('0',"");	

	$('div.nav_chapter').hide('slow');	
	$('div.testDiv').hide('slow');
}
function active_nav(){//navigation
	$('div.modeDiv').html("<span class='label label-info'>Navigation</span>");
	testDiv_output('0',"");

	$('div.nav_chapter').show('slow',update_width_nav_chapter);	
	$('div.testDiv').hide('slow');
}

function active_imp(){//impromptu
	$('div.modeDiv').html("<span class='label label-success'>Impromptu</span>");
	testDiv_output('success',"Please input something... ... [!need futher implementation!]");
	$('div.nav_chapter').hide('slow');
	$('div.testDiv').show('slow');
}

/*Called by active_nav : Update the width of div.nav_chaper*/
function update_width_nav_chapter(){
	// max_width_tabs=0;
	// $('div.nav_chapter >div.tab-content >div.tab-pane').each(function(index){
 //        if ($(this).width()>max_width_tabs) max_width_tabs=$(this).width();
 //    testDiv_output(1,"width of tabs:"+$(this).width());
 //    });

 //    $('div.nav_chapter').width(max_width_tabs);
	// testDiv_output(1,"Max width of tabs:"+max_width_tabs);
}