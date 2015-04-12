
$(function(){
    
   
   	$('div.nav_chapter li').click(function(event) {
       
       index_nav_chapter=$(this).attr('id').substr(1);
       //output("chapter: "+index_nav_chapter);
       
	   //set_nav_section(index_nav_chapter);
	   get_selected_chapter(index_nav_chapter);
	   
	   update_width_contetnDiv();
	   
	   //scroll effect in the contentDiv
	   targeted_chapter=$("ul.one_level>li>a").eq(index_nav_chapter); 
	   scroll_to_show_target(targeted_chapter);
   	});
  
  	$('div.pillsDiv ul.nav > li').click(function(event){
  		testDiv_output(0,$(this).text());

  		switch ($(this).text())
        {
            case 'Pre'://p presentation 
                active_pre();
                break;
            
            case 'Nav'://n navigation 
               	active_nav();
                break;

            case 'Imp'://i impromptu 
               	active_imp();
                break;
			
			case '<='://back (left) //0905//
                if(prezing_item_index>0)
                    prezing_item_index--;
                prezi_selected_li_a(prezing_item_index);
                scroll_to_show_related_update(prezing_item_index);
                break;
			
			// case ''://next (up) 
   //              break;
			
			case '=>'://forward (right) //0905//
               	if(prezing_item_index<prezing_item_number-1)
                    prezing_item_index++;
                prezi_selected_li_a(prezing_item_index);
                scroll_to_show_related_update(prezing_item_index);
                break;
			
			// case ''://last (down) 
   //              break;
			/*case 71://g go|next item
				
				break;*/
            default:
                testDiv_output('info'," key code: "+event.which);
				break;
        }
  	
  	});

  	/* div.nav_section has been deleted */
   	// $('div.nav_section li').click(function(event) {
	  //  index_nav_section=$(this).attr('id').substr(1);
	  //  index_nav_chapter=$(this).parent().attr('id').substr(1);
	  //  //output("c: "+index_nav_chapter+" s: "+index_nav_section);
	   
	  //  //scroll effect in the contentDiv
	  //  target_section=$(".two_level").eq(index_nav_chapter).children("li").children('a').eq(index_nav_section);
	  //  scroll_to_show_target(target_section);
   	// });
    
});

