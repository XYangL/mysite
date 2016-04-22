var root = null;
var divs = null;
var num = 0;
var index = 0;
var targetTop = 0;

var HLBack = null;
var relateDiv = null;
var initLeft = 0;
var initWidth = 0;

var rDivWidthWrap =0;
var rDivHeightWrap =0;

var headDiv = null;

var sectionBased = false;
var cDivSecHeight = 0;

var preS = null;
var nexS = null;
var minIndex = 0;
var maxIndex = 0;

var secBGColor = 'rgba(186, 219, 177, 0.3)';
var imageUrl = 'ScrollSlide/circlebg.png';
var logoUrl = 'ScrollSlide/hkulogo.png';
var fnContent = '<p>SlideList</p>';

var init = function(){
	$('html').append($('<div/>',{'id': 'footDiv'}));
	$('#footDiv').append($('<img/>',{'id': 'logo', 'src':logoUrl}));
	$('#footDiv').append($(fnContent));


	/*Insert Presentation Title*/
	$('ul.L_1>li:first-child').remove();// may not need after update the parser:listABLE()
	var title = $('<div/>',{'id': 'title'}); title.append($('<p/>').html($('title').html()));
	$('.contentDiv').prepend(title);

	/* Special configure via class*/
	$('.detailed').each(function(index, el) {
		$(this).next('ul').find('>li>div').each(function(index, el) {
			$(this).addClass('slowShrink');
		});
	});
	if($('body').hasClass('sectionBased')) sectionBased = true;

	/*A: Reorganize the structure of DOM :  specificOrganizeBODY */
	root = $('div.contentDiv');
	wrapCDiv(root);

	/*A-6. User Defined Relationship : Init relateDiv, fill it, & inset into DOM */
	relateDiv = $("<div/>", {class: "relateDiv"});
	relateDiv.append( $('<div/>'));
	reOrganizeRDiv(relateDiv);
	relateDiv.insertAfter(root.parent());
	
	/*A-7 headDiv to show elements in deep path from root/title to .highlight*/
	// headDiv = $('<div/>',{'class': 'headDiv'});
	// headDiv.append($('<ul><li target="#title"><div><span class="ui-icon ui-icon-home"></span> HOME</div></li>'+
	// 	' <li id="L2"></li>'+' <li id="L3"></li>'+ ' <li id="L4"></li></ul>'));
	// headDiv.insertBefore(root.parent());
	
	preS = $('<div/>',{'id': 'preS'});
	nexS = $('<div/>',{'id': 'nexS'});


	// root.parent().add(relateDiv).add(headDiv).wrapAll("<div class='container' />");
	root.parent().add(relateDiv).wrapAll("<div class='container' />");

	/*A-8. Other special requirement of CAScroll on DOM structure */
	/* div#above to show image in a popup layer */
	$('body').append($('<div/>',{id: 'above', 'style':'display:none;'}));
	$('#above').append($('<div/>'));
	
	/*A-3. Static Highilght Background : Add div.hlBackground to highlight in Blue */
	HLBack = $("<div/>", {class: "hlBackground"});


	/*B: init setting or rederring on finalised DOM framework*/
	divs = root.find("li>div:first-child");
	num = divs.size();
	divs.each(function(index, el) {
		$(this).attr('id','item'.concat(index));
	});
	/*B-1. Expand & Shrink : add div for getting oneLineH height, init every item*/
	divs.add($('#title')).each(function(index, el) {
		$(this).after('<div style="height:0;width:0;margin-bottom: 0px;"><p>oneline</p> </div>');
		$(this).attr('onelineH',$(this).next().children().outerHeight());
		$(this).next().remove();
		
		setHeight($(this),'one-line');
	});

	sectionBased = !sectionBased ? 0 : parseInt($('#item0').attr('oneLineH')) + parseInt($('#item0').css('margin-bottom'));

	// initCDivWrap(root, root.height() - headDiv.outerHeight(true));
	cDivSecHeight = $('#footDiv').position().top - parseInt($('body').css('margin-top'))
					- $('#title').attr('oneLineH') - $('.L_1>li>div').attr('oneLineH');
	initCDivWrap(root, root.height());

	/*B-6. User Defined Relationship : init .relateDiv position */
	initRDiv();

	/*B-7. initHDiv() : hide items in headDiv except the 1st home/title one*/
	// headDiv.find('li:not(:first)').hide();

	
	/*C: Special For Slide Scroll - Local Construct from .contentDiv*/	
	/*C-1. remove global wrap*/
	$('.container').removeClass('container');
	$('.contentWrap').replaceWith($('<div/>').append($('#title')).append($('.L_1')));//.removeClass('contentWrap');

	/*C-2. locally wrapCDiv()*/
	// cDivSecHeight = ( $('body').height() -parseInt($('#title').attr('oneLineH')) -$('.L_1').height());
	$('.L_1>li>div').each(function(index, el) {
		$(this).addClass('sectionHead');
		$(this).parent().attr('id', 'S'+(index+1));
		$(this).next('ul').wrap('<div class="contentDiv"></div>');
		root = $(this).next();
		wrapCDiv(root);// root.parent().wrap("<div class='container' />");
		
		initCDivWrap(root, cDivSecHeight);
		
		/*!! init ul.L_2 as shown*/
		root.children().show(); // root.find('>ul').show();
		root.attr('overviewH', root.find('>ul').height());

		root.parent().height(cDivSecHeight);
		root.parent().hide();
	});

	/*D. start 1st  highlight*/
	root = null;
	targetSection = 0;
	switchSection();


	/*E. More Global Style Setting*/	
	$('html').css('background-image', 'url(' + imageUrl + ')');

	$('.sectionHead +.contentWrap').css('background-color', secBGColor);

	$('.contentDiv li >div').css('transition', 'height 1s, opacity 1s');	
};

var switchSection = function(){
	// global var targetSection /* ?? may need to check if target is available : [0, last-section], 0==TOC*/
	
	/*1. Resume rendering on last section*/
	if (root){
		relateDiv.hide();
		cDiv = root;
		lastSection = root.parent('.contentWrap');
		
		/*Hide last section, if NOT same as the new section*/
		if(lastSection.prev().parent().attr('id') != 'S'+targetSection)
			lastSection.slideUp('slow');
		
		lastSection.animate({left:initLeft, width:initWidth },'slow');
		
		cDiv.animate({scrollTop:0},'slow');
		cDiv.find('.L_2 >li >div').each(function(index, el) {
			setHeight($(this), 'one-line');
		});
		cDiv.find('li>ol,li>ul').hide();
		
		// root = null;
	}

	setHeight($('.highlight'),'one-line');
	$('.highlight').removeClass('highlight');

	/*2. Switch to TOC: table of content*/	
	if (targetSection == 0){
		console.info("Switch to Table of Contents");
		preS.remove();nexS.remove();
		$('.sectionHead').parent().show();
		firstHL = $('#title');
		firstHL.addClass('highlight');
		setHeight(firstHL,"full")

		index = -1;
		minIndex = -1;
		maxIndex = num-1;
		root = firstHL.parent();//$('.L_1').parents('.contentDiv');
		return;
	}
	
	/*2. Switch to a new section : redering highlight, and insert HLBack & relateDiv*/	
	console.info("Switch to Section ", targetSection);
	preS.html('');preS.attr('onclick','');preS.insertBefore($('#title >p'));
	nexS.html('');nexS.attr('onclick','');nexS.insertAfter($('#title >p'));
	$('.sectionHead').each(function(sec, el) {
		sec +=1; 
		var id = parseInt($(this).parent().attr('id').replace("S", ""));
		if (sec == targetSection-1){//(sec>= targetSection-1) && (sec<= targetSection+1)
			preS.html($(this).html().match(/<p>[^<]*/)[0]+"</div>");
			preS.attr('onclick',  "document.getElementById('"+$(this).first().attr('id')+"').click()" );
		}else if (sec== targetSection+1){
			nexS.html($(this).html().match(/<p>[^<]*/)[0]+"</div>");
			nexS.attr('onclick',  "document.getElementById('"+$(this).first().attr('id')+"').click()" );
		}
		if(sec== targetSection)
			$(this).parent().slideDown('slow');
		else
			$(this).parent().slideUp('slow');
	});

	firstHL = $("#S"+targetSection+" >.sectionHead");
	firstHL.addClass('highlight');
	setHeight(firstHL,"full");

	index = parseInt(firstHL.attr('id').replace("item", ""));
	minIndex = index;
	maxIndex = index;
	root = $("#S"+targetSection+" .contentDiv");
	if (root.size() == 0) { return};

	maxIndex = index+root.find("li>div").size();
	
	HLBack.insertAfter(root);
	relateDiv.insertAfter(root.parent());

	HLBack.css("top",root.find('>.preDiv').height());
	updateHLB(root.find('>ul'), parseInt(root.attr('overviewH')));
	
	root.parent().slideDown('slow');
};

var wrapCDiv = function( CDiv ){
	CDiv.wrap("<div class='contentWrap' />");
	CDiv.prepend('<p class="preDiv"> </p>');
	CDiv.append('<p class="postDiv"> </p>');
}


var initCDivWrap = function( cDiv, cHeight ) {
	/*Reset height of root, since the inserted headDiv occupy the top part of window*/
	cDiv.height(cHeight);

	/*Height of preDiv decide the position.top of .highlight*/
	targetTop = 0.3;/*init as percentage, later set to cDiv.scrollTop()*/
	cDiv.find('.preDiv').height(cHeight * targetTop);
	cDiv.find('.postDiv').height(cHeight * (1-targetTop));

	/*2. Show & Hide : init every item */
	cDiv.find('li>ol,li>ul').hide();

	/* The whole .contentWrap=cDiv.parent() should be in the center of the screen*/
	initLeft = initLeft || (cDiv.parent().parent().outerWidth()-cDiv.parent().outerWidth())/2;//$('body').outerWidth()
	cDiv.parent().css('left', initLeft );
	initWidth = initWidth || cDiv.parent().width();
}

var configWrap = function(target){
	var left = initLeft;
	var width = initWidth;

	/* Only .relateDiv>target with location=right may change margin-left and width of .cotentDiv */
	if (target != null && target.attr('location') == 'right') {
		var rDivWnew = target.width()+rDivWidthWrap;
		if (target.attr('id').match(/^fn:img:/)){
			rDivWnew = target.children().width()+rDivWidthWrap;
		}
		var left = initLeft - rDivWnew/2;

		// ?? left must >=0 ??
		if (left < 0  ){ // relateDiv.width > initleft*2
			left = 0;
			width = root.parent().parent().outerWidth() - rDivWnew;//root.parent().parent().offset().left +
		}
	}
	return {left:left, width:width};
}

var reOrganizeRDiv = function( RDiv ){
	var IDREG = /fn:([a-zA-z]*):([0-9]*)/;

	/*6-1: Replace Footnote into contents in RDiv */
	var FN = $('div.footnotes');
	FN.remove();

	FN.find('>ol>li').each(function(){
		/* Remove the back link tag */
		// $(this).find('.footnote-backref').parent().remove();
		$(this).find('.footnote-backref').remove();
		lastP = $(this).children('p:last');
		if (!lastP.html().trim()){ lastP.remove(); }

		/*Based on FN type, set active/passive and update content.html()*/
		var FNType = IDREG.exec($(this).attr('id'))[1];
		switch(FNType){
			case 'hide':
				var temp = $('<div/>',{id: $(this).attr('id'), 'class': 'passive'}).append($(this).html());
				break;
			case 'img':
				var temp = $('<div/>',{id: $(this).attr('id'), 'class': 'active'}).append($(this).find('img').clone());
				break;
			default: // 'tip' & 'one'
				var temp = $('<div/>',{id: $(this).attr('id'), 'class': 'active'}).append($(this).html());
				break;
		}
		RDiv.children(':first').append(temp);		
	});

	/*6-2: add mark and set location to items has relatedItems*/
	root.find('.footnote-ref').each(function(index, el) {
		var FNType = IDREG.exec($(this).attr('href'))[1];
		var relateFN = RDiv.find($(this).attr('href').replace(/:/g, '\\:'));
		switch(FNType){
			case 'hide':
				var tempLink = $('<a/>',{href: $(this).attr('href'), 'class': 'footnote-passive'});
				tempLink.html(' <span class="ui-icon ui-icon-circle-plus"></span>');
				relateFN.attr('location','right');
				break;
			case 'img':
				var tempLink = $('<a/>',{href: $(this).attr('href'), 'class': 'footnote-active'});
				tempLink.html('<span class="ui-icon ui-icon-image"></span>');
				if ($(this).parents('li>div').hasClass('des')) {
					var tempDes = $(this).parents('li>div');
					tempDes.parent().find('li >div:nth-child(1)>p, li >div:nth-child(1)>ul>li:last-child').append($('<sub/>').append(tempLink.clone()));
				};
				relateFN.find('img').hasClass('bottom')? relateFN.attr('location','bottom'):relateFN.attr('location','right');
				break;
			case 'tip':
				var tempLink = $('<a/>',{href: $(this).attr('href'), 'class': 'footnote-active'});
				relateFN.attr('location','right');
				break;
			case 'one':
				var tempLink = null;
				$(this).parents('li>div').append(relateFN.children());
				$(this).parent().replaceWith(null);
				relateFN.remove();
				break;
			default: // 'tip' & 'one' & img
				var tempLink = $('<a/>',{href: $(this).attr('href'), 'class': 'footnote-active'});
				relateFN.attr('location','right');
				break;
		}
		
		if (tempLink) {
			tempLink = $('<sub/>').append(tempLink);
			$(this).parent().replaceWith(tempLink);			
		};
	});
}

var scale = function(IMG, maxW, maxH, factor){
	/* set width&height of IMG limited by different valid sizes and requirements/factor */
	var origW = IMG.get(0).naturalWidth; 
	var origH = IMG.get(0).naturalHeight;
	var ratio = origW/origH;
	if ( ratio > maxW/maxH ) {
		IMG.width(maxW*factor);
		IMG.height(maxW*factor/ratio);
	} else {
		IMG.width(maxH*factor * ratio);
		IMG.height(maxH*factor);
	}
}

var initMathJax = function(){
	$('.MathJax_Display').css('margin','0');
	relateDiv.show();
	relateDiv.children().children().each(
		function(){
			if($(this).has('.MathJax_preview').length>0){
				$(this).show(); //console.log($(this).attr('id'),$(this).height());
				temp = 0;
				$(this).children().each(function(){
					temp += $(this).outerHeight();
				});
				$(this).height(temp);
				$(this).hide();
			}
		}
	);
	relateDiv.hide();
}

var initRDiv = function () {
	/*	Init size of divs in .realteDiv differently, since right/bottom have differet valid space,
		- passive v.s. active ; right v.s. bottom 
		- NO need to init .relateDiv.position().left/top */

	/* rDivWidth/HeightWrap is used by configWrap() & setRDivLeft/Top() */
	rDivWidthWrap = relateDiv.outerWidth(true) - relateDiv.children().width();
	rDivHeightWrap = relateDiv.outerHeight(true) - relateDiv.children().height();

	/* Calculate Valide Space : Need updated HLBack, so require initHLB(firstHL) must before initRDiv() */
	var cDivWidthMin = parseInt($('.contentWrap').css('min-width'), 10);
	var rDivRightValidWidth = $('body').width() - cDivWidthMin - rDivWidthWrap;//$('.container').outerWidth()
	var rDivRightValidHeight = cDivSecHeight- rDivHeightWrap;//$('.container').outerHeight() //-headDiv.outerHeight(true)
	var rDivBottomValidHeight = rDivRightValidHeight - ($('.preDiv').offset().top + $('.preDiv').height() + parseInt(divs.eq(0).attr('oneLineH'))); 
	var rDivBottomValidWidth =  $('.L_1>li').width()-20; //??!!

	/*Must set size for EVERY div.passive/active, and hide()
	  - ALL .passive shown in right, but max-width is different
	  - only set width for .right, while only set height for .bottom*/
	relateDiv.find('.passive').css('max-height', rDivRightValidHeight);
	relateDiv.find('div >div').each(function(index, el) {
		if ($(this).hasClass('passive')){ //passive & all are location=right // $(this).attr('id').match(/^fn:hide:/)
			$(this).css('width', Math.min(rDivBottomValidWidth*0.4, rDivRightValidWidth, $(this).width())); // ?
			$(this).css('height', $(this).height()); // ?

		} else { //hasClass('active')
			/* SET $(this).height/width for every image-active in relateDiv via img.onload() */
			if ( $(this).attr('id').match(/^fn:img:/)) {
				
				$(this).children().load(function() { 					
					var IMG = $(this); //img
					var origWidth = IMG.get(0).naturalWidth; 
					var origHeight = IMG.get(0).naturalHeight;

					var imgLoc = $(this).parent().attr('location');
					if (imgLoc == 'right'){
						if(origWidth>rDivRightValidWidth || origHeight > rDivRightValidHeight) {
							scale(IMG, rDivRightValidWidth, rDivRightValidHeight, 1);
						} else {
							IMG.css("width",origWidth);
							IMG.css("height",origHeight);
						}
					} else if(imgLoc == 'bottom'){
						if(origHeight>rDivBottomValidHeight || origWidth > rDivBottomValidWidth) {
							scale(IMG, rDivBottomValidWidth,rDivBottomValidHeight, 1);
							/* May need to check height with $(.container).height()	*/
						} else {
							IMG.css("width",origWidth);
							IMG.css("height",origHeight);
						}
					} else {
						console.log('Other Location');
					}
				}); // end of onload() to reset height/width

			} else if ($(this).attr('id').match(/^fn:tip:/)){
				$(this).css('max-height', rDivRightValidHeight);
				$(this).css('width', Math.min(rDivBottomValidWidth*0.4, rDivRightValidWidth, $(this).width()));
				$(this).css('height', $(this).height());

			// } else if ($(this).attr('id').match(/^fn:one:/)){
			// 	$(this).css('width', $('.L_1').width());//$(this).attr('level')
			// 	$(this).css('height', $(this).height()); // ?
			} else{ 
				console.log("GOT Active but NO matched type!", $(this).attr('id'));
			}
		}

		/* $(this) = relateDiv.find('div >div') */
		$(this).hide();
	});

	relateDiv.hide();
}

var hasRDiv = function(item, mode){
	var target = null;
	
	/* mode = 'active'|| 'passive' */
	var relateLI = item.find('sub>a.footnote-'+mode);

	/*	If relateLI is null, then no related, so target will be kept as null;
		else, NOT Null, target will be updated as .relateDiv>div>div
		?? What if has more than one target, i.e., relateLI.size() >1 ??*/
	relateLI.each(function() {
		target = $($(this).attr('href').replace(/:/g, '\\:'));
	});

	return target;
}

var setRDivLeft = function(target){
	if (target == null) return;/* target must NOT null, since has been checked outside before this called*/
	var newLeft = 0;
	if (target.attr('location') == 'bottom'){//target.attr('location') == 'bottom'
		var rDivWnew = target.width()+rDivWidthWrap;
		if (target.attr('id').match(/^fn:img:/)){
			rDivWnew = target.children().width()+rDivWidthWrap;
		}
		newLeft = root.parent().parent().offset().left + (root.parent().parent().outerWidth()-rDivWnew)/2;
		// console.log($('.contentWrap').position().left+$('.contentWrap').outerWidth(true)/2);
	} else {// location == right
		/*setRdivLeft is called after finish update Div.size */
		newLeft = HLBack.offset().left +HLBack.outerWidth(true);
	}

	/*  Must be newleft, not minL, because :
		$('.container').offset().left <= [$('.container').outerWidth() - target.children().width()]/2 */
	var minL = -rDivWidthWrap/2;
	newLeft = newLeft< minL ? minL : newLeft;
	relateDiv.css('left', newLeft);// relateDiv.animate({left:newLeft},'slow');
}
var setRDivTop = function(target, HLHeight){
	if (target == null) return;/* target must NOT null, since has been checked outside before this called*/
	var newTop = 0;
	if (target.attr('location') == 'bottom'){
		newTop = HLBack.offset().top + HLHeight - 5;//parseInt(relateDiv.css('margin-top'), 10)
	} else {// location == right
		var rDivHnew = (target.height()+rDivHeightWrap);
		if (target.attr('id').match(/^fn:img:/)){
			rDivHnew = (target.children().height()+rDivHeightWrap);
		}
		newTop = HLBack.offset().top + HLHeight/2 - rDivHnew/2;
		// console.log(HLBack.offset().top + HLHeight/2,newTop +rDivHnew/2);
	}

	var minT = root.offset().top;// - parseInt(relateDiv.css('margin-top'))
	newTop = newTop< minT ? minT : newTop;
	relateDiv.animate({top:newTop},'slow');// relateDiv.css('top', newTop);
}

var hideRDiv = function(){ // relateDiv.hide('slow');
	/* 	Must hideRDiv() when .highlight is changed, since the locations of relateDiv are vairous and may cause confused animation*/
	if ($('.hlSupport').attr('location') == 'bottom'){
		relateDiv.effect('slide', { direction: 'up', mode: 'hide' }, 'slow');
	} else {
		relateDiv.effect('slide', { direction: 'right', mode: 'hide' }, 'slow');
	}
}
var showRDiv = function(target, HLHeight){ // relateDiv.show('slow');
	if (target == null) return;/* target must NOT null, since has been checked outside before this called*/
	if ($('.hlSupport').attr('id') != target.attr('id') ){
		$('.hlSupport').hide()
		$('.hlSupport').removeClass('hlSupport');
		target.addClass('hlSupport');
		target.show();
	}

	if (target.attr('location') == 'bottom'){
		relateDiv.effect('slide', { direction: 'up', mode: 'show' }, 'slow');
		$('.highlight').height(HLHeight + relateDiv.outerHeight() + parseInt(relateDiv.css('margin-top'), 10)) - 5; // Add height for active bottom
	} else {
		relateDiv.effect('slide', { direction: 'left', mode: 'show' }, 'slow');
	}
}

var updateHLB = function(base, temp){
	/*	Depend on base - $('.highlight')
		HLB.height has transition, which need to be varied to final value,
		so get its height from temp,  instead of using .outHeight() directly*/
	// HLBack.css("left",base.position().left); // HLBack.css(base.position());

	// HLBack.height(base.outerHeight());
	var borderTemp = base.outerHeight()-base.height();
	HLBack.height(temp+borderTemp);
	// HLBack.width(base.outerWidth());
}

var setHeight = function(object, mode){
	var temp = 0;
	
	if (mode === "one-line") {
	/* shrink, NOT highlight */ /*---v4-6--new one-line height-------*/
		temp = object.attr('onelineH');
	} else if (mode === "full") {
	/* expand, IS highlight */
		if(object.children().first().attr('class')=="MathJax_Preview"){
		/* for set  'MathJax' in highlight */
			temp = object.height();
		} else {
			object.children().each(function(){
				temp += $(this).height();
				temp += parseInt( $(this).css("padding-top").replace("px", ""));
				temp += parseInt( $(this).css("padding-bottom").replace("px", ""));
			});
		}
	}

	object.height(temp);	
	return temp;
}

var updateHeadDiv = function(){
	/*	Update the elements of path in headDiv when .highlight changed
		- !! Alwarys called after updateHLB() 
		- Need to Limit the length for every li item in headDiv*/
	var headItem = $('.highlight').parents('ul').prev();
	headItem = $(headItem.get().slice(0,-1).reverse());

	var maxWidth = $('.headDiv >ul').width() - $('.headDiv >ul >li:first').width();// Limit the length
	for (var i = 2; i <5; i++) {
		var temp = headDiv.find('li:nth-child('+i+')');
		if (headItem.eq(i-2).html() != null) {
			temp.attr('target', '#'+headItem.eq(i-2).attr('id'));
			temp.html('<div>'+headItem.eq(i-2).text()+'</div>');
			temp.children().css('max-width',  maxWidth*0.5); // Limit the length
			maxWidth = maxWidth - temp.width();
			temp.effect('slide', { direction: 'left', mode: 'show' }, 'slow');
		} else {
			temp.effect('slide', { direction: 'left', mode: 'hide' }, 'slow');
		}
	};
}

var triggerAnimate = function(unit,mode){
	if (unit == 0){	return 0; }
	/* Only need to change .highlight when mode!=more && unit>0*/
	var shrink = $('.highlight').eq(0);//divs.eq(index);
	var expand = divs.eq(index+unit);

	if (mode=='showTOC') { // index = -1; // unit = -1-index; index +=unit
		console.info('Show Table of Content')
		targetSection = 0;
		switchSection();
		return	
	};

	/* If focus on title, expand only can be >.L_1>li>div*/
	if(shrink == $('#title') || expand.hasClass('sectionHead')){ 
		if(expand == $('#title')) return; // ?	
		targetSection = parseInt(expand.parents('.L_1>li').attr('id').replace('S',''));
		switchSection();
		return
	}

	/* Get original position.top for computing $revise and other use later */
	/* !! Must Before reset .highlight */
	var shrinkOldHeight = shrink.height();
	var shrinkTop = $('.hlBackground').position().top;
	var expandTop = expand.position().top;

	var activeTarget = hasRDiv(expand,'active');
	/* If activeTarget is changed, Must hideRDiv() when .highlight is changed to avoid confused animation*/
	if (!activeTarget || activeTarget.css('display') =='none') { hideRDiv(); }

	var scroll = function(){
		//5 change .HL /* Reset .highlight target : change from shrink to expand */
		shrink.removeClass('highlight');
		expand.addClass('highlight');

		//6 setHeight()	/*1. Expand & Shrink : via resetting height */
		var oneLineH = 0, time = 0;
		if (shrink.hasClass('sectionHead')){
			oneLineH = shrinkOldHeight;
			$('.full').each(function(index, el) {
				setHeight($(this), "one-line");
				$(this).removeClass('full');
			});
		} else if (shrink.hasClass('slowShrink') && shrink.closest('ul').prev().attr('id')==expand.closest('ul').prev().attr('id')) {
			// console.log('has to keeped full');
			oneLineH = shrinkOldHeight;
			shrink.addClass('full');
		} else{
			oneLineH = setHeight(shrink, "one-line");
			$('.full').each(function(index, el) {
				shrinkOldHeight += $(this).height();
				shrinkOldHeight -= setHeight($(this), "one-line");
				$(this).removeClass('full');
				time = 200;
			});
		}
		var fullH = setHeight(expand, "full");	

		//7-8 Update position of relateDiv and show
		if (activeTarget) {
			setRDivLeft(activeTarget);
			setRDivTop(activeTarget, fullH);
			showRDiv(activeTarget, fullH );
		};

		//9	/*2. Show & Hide on the related items : based on the unit */
		var slideUpHeight = 0;  var slideDownHeight = 0;
		if(unit > 0){ // NEXT
			slideUpHeight += shrinkOldHeight-oneLineH;

			// -1- show the detailed of expand
			expand.nextAll('ol,ul').slideDown('slow');//ol
			
			// -2- hide the detailed of shrink's previous sibling
			var slideUP = shrink.parent().prev().children('ul[style!="display: none;"], ol[style!="display: none;"]');	
			if(slideUP.size() !=0) 
			{
				slideUpHeight += slideUP.outerHeight(true);
				slideUP.slideUp('slow');
				if (slideUP.find('>li>div').last().size()) 
					slideUpHeight += parseInt(slideUP.find('>li>div').last().css('margin-bottom'));
			}

			// -5- More to support usable Prev
			if (mode== 'key'&& unit >1){ // press Down, skip details
				slideUP = shrink.nextAll('ol,ul');
				if(slideUP.size() !=0) 
				{
					slideUpHeight += slideUP.outerHeight(true);
					slideUP.slideUp('slow');
					if (slideUP.find('>li>div').last().size()) 
						slideUpHeight += parseInt(slideUP.find('>li>div').last().css('margin-bottom'));
				}
			}

		} else if (unit < 0){ // PREV
			// -3- hide the detailed of shirnk
			shrink.nextAll('ol,ul').slideUp('slow');//ol
			
			if(unit == -1){
			// -4- show the detailed of expand's previous sibling
				var slideDown = expand.parent().prev().children('ul[style="display: none;"], ol[style="display: none;"]');
				if(slideDown.size() !=0) 
				{
					slideDownHeight = slideDown.outerHeight(true);
					slideDown.slideDown('slow');
				}

			} else{// UP
			// -1- show the detailed of expand
				expand.nextAll('ol,ul').slideDown('slow');//ol
			}
		}

		//10 
		updateHLB(expand, fullH);

		// updateHeadDiv();

		//11/* 4. Background : on related items */
		$('.HLChildLevel').removeClass('HLChildLevel');
		expand.nextAll('ol,ul').addClass('HLChildLevel');//ol

		$('.HLSameLevel').removeClass('HLSameLevel');
		expand.parent().parent().addClass('HLSameLevel');//ol
		
		//12/*0. Scrollable*/
		var reviseTop = expandTop - shrinkTop + slideDownHeight - slideUpHeight;
		targetTop = root.scrollTop();
		targetTop += reviseTop;

		/*body.sectionbased*/
		if(sectionBased!=0){
			var	hlBackTop = $('.preDiv').height() + sectionBased * expand.parents('.L_1>li').prevAll().size();
			targetTop += HLBack.position().top - hlBackTop;
			HLBack.animate({top:hlBackTop}, 'slow');
		}			

		setTimeout(function () { 
		   if (targetTop!= root.scrollTop())
		  		root.animate({scrollTop:targetTop},'slow');
		}, time);
		
	}

	var updatedCDiv = configWrap(activeTarget);
	(activeTarget == null) && (relateDiv.css('display') == 'none') ? scroll() 
			: root.parent('.contentWrap').animate({left:updatedCDiv.left, width:updatedCDiv.width },'slow', function(){
				scroll();
			});

	/*---v4-8--Scrollable Highlight-------*/
	// $('.highlight').css('background', '');
	// $('.hlBackground').css('background', '#5bc0de');
	index +=unit;
};

var toggleHide = function(){
	var current = $('.highlight').eq(0); //divs.eq(index);
	var passiveTarget = hasRDiv(current,'passive');
	
	/* NO passive, then nothing to do*/
	if (passiveTarget) {
		/*	If .passive is already shown, then action is to hide it
			And must set target to null, for correct configWrap() and other update*/
		if (passiveTarget.css('display')!='none' && relateDiv.css('display')!='none') {
			hideRDiv();
			/* Support item have both passive & active : only show one of both*/
			passiveTarget = hasRDiv(current,'active');

		};

		var updatedCDiv = configWrap(passiveTarget);
		root.parent('.contentWrap').animate({left:updatedCDiv.left, width:updatedCDiv.width },'slow', function(){
			var fullH = setHeight(current, "full");
			
			/* Update postion of relateDiv and show */
			if (passiveTarget){
				setRDivLeft(passiveTarget);
				setRDivTop(passiveTarget, fullH);
				showRDiv(passiveTarget, fullH);				
			}
			updateHLB(current, fullH);
		});	
	};	
	return 0
}

var main = function(){
	/* Reorganize & make it scroll*/
	init();

	setClickHandler();
};

$(document).ready(main);

/* Event Handlers : Scroll, Click, Keydown*/
/* Action-scroll */
/*---v4-8--Scrollable Highlight-------*/
// $(window).bind('mousewheel DOMMouseScroll', function(event){
	//  $('.highlight').css('background', '#5bc0de');
// 	$('.hlBackground').css('background', '#fff');
// });

/* Action-click */
var setClickHandler = function(){
	/* Action-click : change .highlight if clicking item in .contentDiv */
	$('.L_1').find("li>div:first-child").click(function(event) {
		/* Disable scroll until last is finished*/
		if (root && (root.is(':animated')|| root.parent().is(':animated')|| relateDiv.is(':animated')) ) {
			console.warn('Animation has NOT finished!', root.is(':animated'), root.parent().is(':animated'), relateDiv.is(':animated'));
			return
		};

		/* Act on the event */
		var expandID = parseInt($(this).attr('id').replace("item", ""));
		unit = expandID-index;// console.log(expandID, unit);

		triggerAnimate(unit,'click');
	});

	/* Action-click : show item/image in a popup layer if clicking it in .relateDiv */
	relateDiv.find('div>div.active').click(function(event) {
		/* Disable scroll until last is finished*/
		if (root && (root.is(':animated')|| root.parent().is(':animated')|| relateDiv.is(':animated')) ) {
			console.warn('Animation has NOT finished!', root.is(':animated'), root.parent().is(':animated'), relateDiv.is(':animated'));
			return
		};

		if ($(this).attr('id').match(/^fn:img:/)) {
			var url = $(this).find('img').attr('src');
			$('#above >div').first().replaceWith($('<div/>').append($('<img/>',{src: url})));

			var IMG = $('#above >div >img');
			var maxW = $(window).width();
			var maxH = $(window).height();
			var factor = 0.95;
			scale(IMG, maxW, maxH, factor);
			
			$('#above').bPopup({position: ['auto', 'auto'],amsl:0});
		};
	});

	/* Action-click : change .highlight if clicking item in .headDiv */
	// headDiv.find('ul>li').click(function(event) {
	// 	$($(this).attr('target')).click();
	// });

	/* Action-click : switch to mode='showToc' if click #title */
	$('#title>p').click(function(event) {
		if (index!=-1) {
			mode='showTOC';
			unit = -1-index;
			triggerAnimate(unit,'showTOC');
		};
	});

}

/*	Action - keydown: */
$(document).keydown(function(key) {	
	/* Disable scroll until last is finished*/
	if (root && (root.is(':animated')|| root.parent().is(':animated')|| relateDiv.is(':animated')) ) {
		console.warn('Animation has NOT finished!', root.is(':animated'), root.parent().is(':animated'), relateDiv.is(':animated'));
		return
	};

	var unit = 0, mode = 'key';	
	switch(parseInt(key.which,10)) {
	/* Array key - change .highlight */
		case 37:// Left : -1 | <-1
			event.preventDefault();
			if (index>0){
				var expand = divs.eq(index-1);
				if(!divs.eq(index).hasClass('sectionHead') && expand.parent().parent().css('display') != 'none'){
					unit = -1;
				} else if(divs.eq(index).hasClass('sectionHead')){
					unit = - divs.eq(index).parent().prev().find("li>div").size()-1;
				} else{
					var expandChildren = expand.parents('ul[style="display: none;"], ol[style="display: none;"]').last();
					var expandID = parseInt(expandChildren.prev().attr('id').replace("item", ""));
					unit = expandID-index;
				}
			} else if(index == 0){
				/*Switch to Title, like click , may not need mode show Toc ??*/
				mode='showTOC';
				unit = -1-index;
			} else if(index == -1){
				/*Focus on Title, NO more LEFT*/
			}
			break;
		case 38:// Up : <0
			event.preventDefault();
			var shrinkParent = divs.eq(index).parents('li').eq(1).children(':first-child');
			if (shrinkParent.size() ==1) {
				var expandID = parseInt(shrinkParent.attr('id').replace("item", ""));
				unit = expandID-index;
			} else if(divs.eq(index).closest('ul').hasClass('L_1')){
				mode='showTOC';
				unit = -1-index;
			}
			break;
		case 39: // Right : +1
			event.preventDefault();
			unit = 1;
			if(index+unit> maxIndex){
				console.log('right MAX')
				unit = minIndex - index;
			}	
			break;
		case 40:// Down : >0 	
			event.preventDefault();

			if(index == -1){// ?? from title to section head may not be nav via DOWN, since this is go details
				unit = 1;
			} else if(divs.eq(index).hasClass('sectionHead')){
				unit = 1 + root.find("li>div").size();
				if(index+unit == num){
					mode='showTOC';
					unit = -1-index;
				}
			} else {
				var childrenSize =divs.eq(index).siblings('ul,ol').find('li>div:first-child').size();
				unit = 1 + childrenSize;
				if(index+unit> maxIndex){
					console.log('Down MAX')
					unit = minIndex - index;
				}
			}

			break;
	
	/* Space key - show or hide .passive */
		case 32:// unit == 0; 
			event.preventDefault();
			toggleHide();
			break;
	}; // END -- switch
	
	/* may return without further action if unit == 0*/
	triggerAnimate(unit,mode); 

	// return false; // disable scroll via arrow key
});

