var start = 0;

var init = function (root){
 
	specificOrganizeBODY(root);

	/* !!Important for makeing div scrollable */
	root.css('overflow', 'scroll');

	root.height('90vh');
	root.width('98wh');

	root.prepend('<p id="preDiv"> </p>');
	root.append('<p id="postDiv"> </p>');

	$('#preDiv').height("700");
	$('#postDiv').height("700");


};

var specificOrganizeBODY = function(root){
	
	/* convert ol>li to div+ol>li>div */
	ol = root.find('ol');
	ol.children().wrapInner("<div></div>");
	for (var i = ol.size() ; i >= 0; i--){
	 	target = ol.eq(i).parent().parent();
		target.prev().append(ol.eq(i));
		target.remove();
	}

	/* set level L_* for  ol */
	ol = root.find('ol');
	ol.each(function(){
		var level = $(this).parent().parent().attr('class');
		level = 'L_'.concat(parseInt(level.substr(-1))+1);
		$(this).addClass(level);
	});

	/* wrap title = ul>li>div with <p> */
	var firstTitle = root.find('ul>li>div').first();
	firstTitle.html("".concat("<p>",firstTitle.html(),"</p>"));
	
	var titles = root.find('ul').prev('div');
	for (var i = titles.size() - 1; i >= 0; i--) {
		titles.eq(i).html("".concat("<p>",titles.eq(i).html(),"</p>"));
	};
	
}

var setHL = function(object, mode){
	/* 	Total element height = height + top padding + bottom padding 
		+ top border + bottom border + top margin + bottom margin
	*/// var props = ["padding-top","border-top","margin-top","padding-bottom","border-bottom","margin-bottom"];
	var temp = 0;

	if (mode === "one-line") {
	/* shrink, NOT highlight */

		if(object.children().first().attr('class')=="MathJax_Preview"){
		/* Set  'MathJax' in highlight*/
			object.children().eq(1).css('padding-bottom','5px');
			object.children().eq(1).css('padding-top','5px');
			object.children().eq(1).css('display','block');

			temp += object.children('.MathJax').height();
			// object.children('.MathJax').css("padding-top","5px");
			temp += parseFloat( object.children('.MathJax').css("padding-top").replace("px", ""));
			temp += parseFloat( object.children('.MathJax').css("padding-bottom").replace("px", ""));
		
		} else {
			var firstC = object.find(':first-child');
			temp = firstC.outerHeight();
		}

	} else if (mode === "full") {
	/* expand, IS highlight */
		if(object.children().first().attr('class')=="MathJax_Preview"){
		/* Set  'MathJax' in highlight*/
			object.children().eq(1).css('padding-bottom','5px');
			object.children().eq(1).css('padding-top','5px');
			object.children().eq(1).css('display','block');

			temp += object.children('.MathJax').height();
			// object.children('.MathJax').css("padding-top","5px");
			temp += parseFloat( object.children('.MathJax').css("padding-top").replace("px", ""));
			temp += parseFloat( object.children('.MathJax').css("padding-bottom").replace("px", ""));
		} else {
			object.children().each(function(){
				temp += $(this).height();
				temp += parseFloat( $(this).css("padding-top").replace("px", ""));
				temp += parseFloat( $(this).css("padding-bottom").replace("px", ""));
			});
		}
	} 

	object.height(temp);
	return temp;

}

var updateStyle = function (divs, index, unit){ // Unit = 1 / -1
	/* To Do :
		- A: Update .heightlight target
		- B: Update height : shrink-oneline & expand-full
		- C: Check if Scroll (& Scroll it)
	   The order is decided by the css setting & implementation of scroll
	*/

	var shrink = divs.eq(index);
	var expand = divs.eq(index+unit);

	var prevL = shrink.parent().parent().attr('class').split(" ")[0];
	prevL = parseInt(prevL.substr(-1));
	var nextL = expand.parent().parent().attr('class').split(" ")[0];
	nextL = parseInt(nextL.substr(-1));

	var shrinkOldOuterHeight = shrink.outerHeight(true);
	var expandOldOuterHeight = expand.outerHeight(true);

	// A: Update .heightlight target
	shrink.removeClass('highlight');
	expand.addClass('highlight');

	/*1. Expand & Shrink*/ //Reset Height
	var oneLine = setHL(shrink, "one-line");
	var fullBlock = setHL(expand, "full");

	var shrinkNewOuterHeight = oneLine + shrink.outerHeight(true)-shrink.height();
	var expandNewOuterHeight = fullBlock+expand.outerHeight(true)-expand.height();

	var borderTemp = 0;
	if (prevL != nextL && $('li>ol').css('border-width')!=null)
	{
		borderTemp = parseFloat( $('li>ol').css('border-width').replace("px", ""))*Math.abs(prevL-nextL);
	}

	/* 3. Background & Border*/
	$('.HLChildLevel').removeClass('HLChildLevel');
	expand.next().addClass('HLChildLevel');//ol

	$('.HLSameLevel').removeClass('HLSameLevel');
	expand.parent().parent().addClass('HLSameLevel');//ol

	
	/*Get Revise for different cotnrol of unit change*/
	var scroll = 0;
	var revise = 0;
	if (unit >0){ // +1
	/* 2. Show & Hide for 'NEXT'*/
		expand.next().slideDown('slow');//ol
		var slideUpHight = 0;	
		if(shrink.parent().prev().children('ul,ol').size() !=0) 
		{
			slideUpHight = shrink.parent().prev().children('ul,ol').outerHeight(true);
			slideUpHight += parseFloat( shrink.css("margin-top").replace("px", ""));
			shrink.parent().prev().children('ul,ol').slideUp('slow');
		}

		// update revise for scroll
		if( prevL == nextL){  
		/* Same Level */ // FIX Highlight Position, so need to revise scrollTop from original
			revise = -slideUpHight + shrinkNewOuterHeight+borderTemp;
			scroll = 1;  // shrink NO have children,  borderTemp = 0 */
			
		} else if (prevL < nextL){
		/* Go Detailed */// Move Highlight DOWN, so keep scrollTop as original	
			revise = -slideUpHight
			scroll = 2;
			
		} else if (prevL > nextL){
		/* GO Up */ //Move Highlight to Keep shown static, so let slideup, then not keep scrollTop as original
			scroll = 3;
			revise = 0;
		}
	} else { // -1 unit<0
	/* 2. Show & Hide for 'PREV'*/
		shrink.next().slideUp('slow');//ol
		var slideDownHight = 0;
		if(expand.parent().prev().children('ul,ol').size() !=0) // Prev will not shrink
		{
			slideDownHight = expand.parent().prev().children('ul,ol').outerHeight(true);
			// slideDownHight += parseFloat( shrink.css("margin-top").replace("px", ""));
			expand.parent().prev().children('ul,ol').slideDown('slow');
		}
		if(prevL == nextL){
		/* Same Level*/ // expand NO have children
			revise = -slideDownHight+ expandOldOuterHeight+borderTemp;
			scroll = 4;
		} else if(prevL > nextL){
		/* GO Up */ // shirnk is the child of expand
			revise = -slideDownHight;
			scroll = 5;//0

		} else if (prevL < nextL){
		/* Go Details*/ // shrink is the child/descendant of epand.prev 
			scroll = 6;
		}				
	}	
	
	// C: Check if Scroll
	if ( scroll == 0 ){
		revise = 0;
	}

	
	return revise;

};

var main = function(){

	var root = $('div.contentDiv');

	/* Reorganize & make it scroll*/
	init(root);

	var divs = $("li>div");
	var num = divs.size();
	var index = start;
	
	/* Set 1st Highlight*/
	var firstHL = divs.eq(index);
	firstHL.addClass('highlight');

	divs.each(function() {
		setHL($(this),'one-line');
	});
	setHL(divs.eq(index),"full");

	// /* 2. Show & Hide */
	$('li>ol, li>ul').hide();

	var targetTop = 505;
	root.scrollTop(targetTop);
	// root.animate({scrollTop:targetTop});
	var maxTargetTop = $('#preDiv').height()+5;

	
	var MathJax_Display = $('.MathJax_Display');
	console.log(MathJax_Display.size());

	/* Relate the action to key */
	$(document).keydown(function(key) {
		var unit = 0;
		switch(parseInt(key.which,10)) {
			case 37:// Left arrow key pressed
				if (index>0){
					unit = -1;
					// updateHL(-1, false);  index --;
				}
				break;
			case 38:
				break;
			case 39: // Right Arrow Pressed
				if (index+1<num){
					unit = 1;
					// updateHL(1, false);  index ++;
				}				
				break;
			case 40:// Down Arrow Pressed
				// alert("You pressed DOWN!");	
				break;
		}; // END -- switch

		if (unit != 0){

			var revise = updateStyle(divs, index, unit);
			if (targetTop <0)
			{
				if (unit >0) targetTop = 0;
			}
			targetTop += revise*unit;
			if (targetTop >0){
				// root.animate({scrollTop:targetTop},'slow');	
				root.animate({scrollTop:targetTop},'slow', function(){
					// var info = $('.contentDiv').scrollTop();
					// console.log('revise = ',revise);
				});					
			} else{
				root.animate({scrollTop:0},'slow', function(){
					// var info = $('.contentDiv').scrollTop();
					// console.log('revise = ',revise);
				});	
			}




			// targetTop = targetTop+revise;
			// if (targetTop <=0){
			// 	targetTop = 0;
			// }
			// if (targetTop <= maxTargetTop && targetTop >=0)
			// { 
				// root.animate({scrollTop:targetTop},'slow');
			// } else{
			// 	targetTop = targetTop-revise;
			// }

			index += unit;

		}
	
	});
};

$(document).ready(main);