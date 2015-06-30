$(function(){
	console.log('initialize.js');
	$('li >div a').replaceWith(function(){
    	return $("<bold href=\""+ $(this).attr('href')+"\" />").append($(this).contents());
	});

	$('li >div >p').replaceWith(function(){
    	return $("<span />").append($(this).contents());
	});

	$('li >div').replaceWith(function(){
    	return $("<a />").append($(this).contents());
	});

	levNameList = ['zero','one','two','three','four','five'];
	for (levIndex=0; levIndex <levNameList.length ; levIndex++) { 
		$('ul.L_'+levIndex).each(function(){
			$(this).removeClass('L_'+levIndex);
			$(this).addClass(levNameList[levIndex]+'_level');
		});
	}

	//get_selected_chapter(0);
	
	//set_nav_section_v2();
	//set_nav_chapter();
	
	//if($('div.prezi_state').hasClass('true'))active_pre();
    //    else active_nav();
	
	// update_width_contetnDiv();//all codes are commented
	//update_width_nav_chapter();
	
	/*Prepare the li_a list for show preziDiv and scroll contentDiv*/
	All_li_a=$('.contentDiv li>a');
	prezing_item_number=All_li_a.size();
	prezing_item_index=0;
	
	/*Prepare the contentDiv top-margin to help scroll show*/
    $("ul.one_level").first().css("margin-top",$("div.contentDiv").height());
	
    prezi_selected_li_a(prezing_item_index);
    scroll_to_show_related_update(prezing_item_index);
   
});

$

