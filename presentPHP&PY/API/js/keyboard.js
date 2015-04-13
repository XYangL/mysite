// JavaScript Document

$(function(){
 
 	$(this).keydown(function(event){
		
        switch (event.which)
        {
            case 80://p presentation 
                active_pre();
                break;
            
            case 78://n navigation 
               	active_nav();
                break;

            case 73://i impromptu 
               	active_imp();
                break;
			
			case 37://back (left) //0905//
                if(prezing_item_index>0)
                    prezing_item_index--;
                prezi_selected_li_a(prezing_item_index);
                scroll_to_show_related_update(prezing_item_index);
                $('div.testDiv').hide('slow');
                break;
			
			case 38://next (up) 
                break;
			
			case 39://forward (right) //0905//
               	if(prezing_item_index<prezing_item_number-1)
                    prezing_item_index++;
                prezi_selected_li_a(prezing_item_index);
                scroll_to_show_related_update(prezing_item_index);
                $('div.testDiv').hide('slow');
                break;
			
			case 40://last (down) 
                break;
			/*case 71://g go|next item
				
				break;*/
            default:
                testDiv_output('info'," key code: "+event.which);
				break;
        }

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
                $('div.testDiv').hide('slow');
                break;
            
            // case ''://next (up) 
   //              break;
            
            case '=>'://forward (right) //0905//
                if(prezing_item_index<prezing_item_number-1)
                    prezing_item_index++;
                prezi_selected_li_a(prezing_item_index);
                scroll_to_show_related_update(prezing_item_index);
                $('div.testDiv').hide('slow');
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
     //  >ul.nav_section > li 
    $('div.nav_chapter >div.tab-content >div.tab-pane >ul.nav_section > li').click(function(event){

        section_index=$(this).attr('id').substr(1);
        chapter_index=$(this).parent().parent().attr('id').substr(1);
        // .parent().attr('id').substr(1));
        testDiv_output('info'," click s"+section_index+" c"+chapter_index);

        target_section=$(".two_level").eq(chapter_index).children("li").children('a').eq(section_index);

    base_top=$("ul.one_level>li>a").eq(0).position().top;

    target_top=target_section.position().top;
    target_height=target_section.height();
    
    /*!!!!the distance to the fisr li_a + the height of targed li-a*/
    target_position=target_top-base_top+target_height;
    //output("target: top="+target_top+", targeted="+target_position+", height="+target_height+" "+target_li_a.text());
    
    $("div.contentDiv").animate({scrollTop:target_position},'slow');


        
    });








});







