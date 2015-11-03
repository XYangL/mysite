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

var cDivHeight = 0;
var srcDiv = null;
var tocDiv = null;
var targetSection = 1;

var init = function(){

	/* replace .contentDiv with .contentSrc */
	$('.contentDiv').addClass('contentSrc').removeClass('contentDiv');
	srcDiv = $('.contentSrc');// srcDiv.hide();

	/* prepend div.contentToc to .contentSrc */
	tocDiv = $("<div/>", {class: "contentToc"});
	tocDiv.insertBefore(srcDiv);

	/* construct div.contentToc from .contentDiv>ul.L_1>li>div, and 
		?? init their height */
	var sectionI = 1;
	srcDiv.find('.L_1>li>div').each(function(index, el) {
		 $(this).clone().wrap('<li></li>').parent().attr('id', 'S'+sectionI).appendTo(tocDiv);
		 sectionI +=1;
	});

	/*Add Title*/
	tocDiv.wrapInner('<ul class="L_1"></ul>');
	$("<div/>", {id: "title"}).html($('title').html()).prependTo(tocDiv);

	/*fillRDiv(), without insert to body*/
		/*6. User Defined Relationship : Init relateDiv, fill it, & inset into DOM */
	relateDiv = $("<div/>", {class: "relateDiv"});
	relateDiv.append( $('<div/>'));
	fillRelateDiv(relateDiv);

	/* div#above to show image in a popup layer from original specificOrganizeBODY()*/
	$('body').append($('<div/>',{id: 'above', 'style':'display:none;'}));
	$('#above').append($('<div/>'));

	// console.log( $(window).height(),  $('body').height(),  tocDiv.height())
	cDivHeight = 0.98* ( $('body').height()- tocDiv.height());

	/* set targetSection will be used by :nth-child() later by switchSection() */
	targetSection = 0; //first-child

	/* call switchSection(global var targetSection = 1) will call renderSlides()x*/
	// var targetSlide = $('#targetSection');
	switchSection();
	
};

var switchSection = function(){
	// global var targetSection
	/* ?? may need to check if target is available : [1, last-section]*/
	
	var lastSlide = $('.container');
	if (targetSection == 0){
		// console.log('Overview Slide');
		if (lastSlide.length) lastSlide.slideUp('slow',function(){lastSlide.remove()});
		return;
	}

	targetSlide = srcDiv.find('.L_1>li:nth-child('+targetSection+ ')>ul');
	if (!targetSlide.length){
		console.log('Target is NULL');
		if (lastSlide.length) lastSlide.slideUp('slow',function(){lastSlide.remove()});
		targetSection = 0;
		return;
	}

	// (!lastSlide.length) ? setSlide() : lastSlide.slideUp('slow',function(){
	// 	lastSlide.remove();
	// 	console.log('this')
	// 	setSlide();
	// });
	lastSlide.slideUp('slow');
	
	var targetToc = $('.contentToc>ul>li:nth-child('+targetSection+")");
	/* clone new target to div.TOC > */
	targetToc.append(targetSlide.clone());

	/* targetSection.wrapInner(div.contentDiv) */
	targetToc.children('ul').wrap('<div class="contentDiv"></div>');

	/* Replace .contentTitle & ?? #targetSection*/
	$('.contentTitle').removeClass('contentTitle');
	$('.contentDiv').prev().addClass('contentTitle');
	
	root = targetToc.find('.contentDiv');
	root.wrap("<div class='container' />");
	root.wrap("<div class='contentWrap' />");

	var newSlide = root.parent().parent();
	newSlide.height(cDivHeight);
	newSlide.slideDown('slow',function(){
		lastSlide.remove();
		renderSlide();
	});


};

var setSlide = function(){
	var targetToc = $('.contentToc>ul>li:nth-child('+targetSection+")");
	/* clone new target to div.TOC > */
	targetToc.append(targetSlide.clone());

	/* targetSection.wrapInner(div.contentDiv) */
	targetToc.children('ul').wrap('<div class="contentDiv"></div>');

	/* Replace .contentTitle & ?? #targetSection*/
	$('.contentTitle').removeClass('contentTitle');
	$('.contentDiv').prev().addClass('contentTitle');
	
	root = targetToc.find('.contentDiv');
	root.wrap("<div class='container' />");
	root.wrap("<div class='contentWrap' />");
	/* call renderSlide() :  */
	renderSlide();

	/* update TOC rendering
	?? expand current title, and shrink last section title ?? or copied its one/multilines as 1st child item??*/			
}

var renderSlide  = function (){
	// root = $('div.contentDiv');
	
	/*specificOrganizeBODY()*/
	// root.wrap("<div class='container' />");
	// root.wrap("<div class='contentWrap' />");

	/*Height of preDiv decide the position.top of .highlight*/
	root.prepend('<p id="preDiv" style="height: 30%;"> </p>');
	root.append('<p id="postDiv" style="height: 70%;"> </p>');

	/*3. Static Highilght Background : Add div.hlBackground to highlight in Blue */
	HLBack = $("<div/>", {class: "hlBackground"});
	HLBack.insertAfter(root);

	relateDiv.insertAfter(root.parent());

	/*Reset height of root, since previous section title [the inserted headDiv] occupy the top part of window*/
	root.height(cDivHeight);	// root.height(root.height() - headDiv.outerHeight(true));

	//  iniset <div><p></p></div> as first item of contentDiv to support animate from 1st highlight 
	root.children('ul').prepend($("<li><div><p></p></div></li>"));

	divs = root.find("li>div:first-child");
	num = divs.size();

	/*0. Scrollable: to support scroll action : Add id to every item for easy Navigation */
	for (  i = 0; i<num; i++){
		divs.eq(i).attr('id','item'.concat(i));
	}

	/*1. Expand & Shrink : add div for recording oneLineH height & init every item*/
	divs.each(function() {
		$(this).after('<div style="height:0;width:0;margin-bottom: 0px;"><p>oneline</p> </div>');
		setHeight($(this),'one-line');
	});
	
	/*2. Show & Hide : init every item */
	root.find('li>ol,li>ul').hide();

	initWrap();

	/* init 1st HL target */
	index = 0;
	var firstHL = divs.eq(index);
	firstHL.addClass('highlight');
	firstHL.height(0);
	firstHL.next().height(0);
	firstHL.next().children().height(0);

	/*3. Static Highilght Background :  init .hlBackground position, width, height*/
	initHLB(firstHL, 0); // setHeight(firstHL,"full");
	// HLBack.css("top",firstHL.position().top);
	// HLBack.height(0);

	setTimeout(function(){
		var sectionOutline = root.children('ul');

		updateHLB(sectionOutline, sectionOutline.outerHeight());
		$('.container').css('visibility', 'visible');
		// $('.container').animate({"opacity": 1}, 'slow');
		// console.log(sectionOutline.outerHeight());
	}, 1000);

	/*6. User Defined Relationship : init .relateDiv position */
	initRDiv();
	

	/*7. initHDiv() : hide items in headDiv except the 1st home/title one*/
	// headDiv.find('li:not(:first)').hide();

	/* Action-click : change .highlight if clicking item in .contentDiv */
	$(".contentDiv li>div:first-child").click(function(event) {
		/* Disable scroll until last is finished*/
		if ((root&&root.is(':animated'))|| ($('.contentWrap') &&$('.contentWrap').is(':animated')) || relateDiv.is(':animated') ) {	return;	};

		/* Act on the event */
		var expandID = parseInt($(this).attr('id').replace("item", ""));
		unit = expandID-index;// console.log(expandID, unit);
		triggerAnimate(unit,'click');
		index += unit;
	});


};


var initHLB = function(base, temp){ 
	/*  Depend on base - $('.highlight')
		Only set Top when init, and then keep it without change*/
	HLBack.css("top",base.position().top);// HLBack.css(base.position());
	updateHLB(base, temp);
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

var initWrap = function(){
	/* The whole .contentWrap should be in the center of the screen*/
	initLeft = ($('body').outerWidth()-$('.contentWrap').outerWidth())/2;
	$('.contentWrap').css('left', initLeft ); console.log($('.contentWrap').css('left' ))
	initWidth = $('.contentWrap').width();
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
		console.log(rDivWnew, rDivWnew, left);
		// ?? left must >=0 ??
		if (left < 0  ){ // relateDiv.width > initleft*2
			left = 0;
			width = $('.container').outerWidth() - rDivWnew - $('.container').offset().left;//$('.container').offset().left +$('.container').outerWidth() - rDivWnew;
		}
	}
	return {left:left, width:width};
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

var fillRelateDiv = function( RDiv ){
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
		RDiv.children(':first').append(temp);// RDiv.append(); and then RDiv.wrapAllInner('div')
	});

	/*6-2: add mark and set location to items has relatedItems */
	// root.find('li>div').has('.footnote-ref')
	srcDiv.find('.footnote-ref').each(function(index, el) {
		var FNType = IDREG.exec($(this).attr('href'))[1];
		var relateFN = RDiv.find($(this).attr('href').replace(/:/g, '\\:'));//$($(this).attr('href').replace(/:/g, '\\:'));
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

var initRDiv = function () {
	relateDiv.find('div >div').show();
	relateDiv.show();
	/*	Init size of divs in .relateDiv differently, since right/bottom have differet valid space,
		- passive v.s. active ; right v.s. bottom 
		- NO need to init .relateDiv.position().left/top */

	/* rDivWidth/HeightWrap is used by configWrap() & setRDivLeft/Top() */
	rDivWidthWrap = relateDiv.outerWidth(true) - relateDiv.find('div:first').width();
	rDivHeightWrap = relateDiv.outerHeight(true) - relateDiv.find('div:first').height();

	/* Calculate Valide Space : Need updated HLBack, so require initHLB(firstHL) must before initRDiv() */
	var cDivWidthMin = parseInt($('.contentWrap').css('min-width'), 10);
	var rDivRightValidWidth = $('.container').outerWidth()- cDivWidthMin - rDivWidthWrap; 
	// console.log($('.container').outerWidth(), cDivWidthMin , rDivWidthWrap, rDivRightValidWidth)
	// var rDivRightValidHeight = $('.container').outerHeight()-headDiv.outerHeight(true) - rDivHeightWrap;
	var rDivRightValidHeight = $('.container').outerHeight() - rDivHeightWrap;
	var rDivBottomValidHeight = rDivRightValidHeight - (HLBack.offset().top + HLBack.outerHeight(true)); 
	/*Must set size for EVERY div.passive/active, and hide()
	  - ALL .passive shown in right, but max-width is different
	  - only set width for .right, while only set height for .bottom*/
	relateDiv.find('.passive').css('max-height', rDivRightValidHeight);
	// relateDiv.find('div >div').each(function(index, el) {
	root.find('sub>a.footnote-passive, sub>a.footnote-active').each(function(index, el) {
		var relateFN = $($(this).attr('href').replace(/:/g, '\\:'));
		if (relateFN.hasClass('passive')){ //passive & all are location=right // relateFN.attr('id').match(/^fn:hide:/)
			relateFN.css('width', Math.min($('.container').width()*0.4, rDivRightValidWidth, relateFN.width())); // ?
			relateFN.css('height', relateFN.height()); // ?

		} else { //hasClass('active')
		console.log(relateFN.size())
			/* SET relateFN.height/width for every image-active in relateDiv via img.onload() */
			if ( relateFN.attr('id').match(/^fn:img:/)) {
				// relateFN.children().load(function() {					
				relateFN.children().each(function() {
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
						if(origHeight>rDivBottomValidHeight || origWidth > $('.container').width()) {
							scale(IMG, $('.container').width(),rDivBottomValidHeight, 1);
							/* May need to check height with $(.container).height()	*/
						} else {
							IMG.css("width",origWidth);
							IMG.css("height",origHeight);
						}
					} else {
						console.log(IMG.parent().attr('id'),'Other Location');
					}
				}); // end of onload() to reset height/width

			} else if (relateFN.attr('id').match(/^fn:tip:/)){
				relateFN.css('max-height', rDivRightValidHeight);
				relateFN.css('width', Math.min($('.container').width()*0.4, rDivRightValidWidth, relateFN.width()));
				relateFN.css('height', relateFN.height());

			// } else if (relateFN.attr('id').match(/^fn:one:/)){
			// 	relateFN.css('width', $('.L_1').width());//relateFN.attr('level')
			// 	relateFN.css('height', relateFN.height()); // ?
			} else{ 
				console.log("GOT Active but NO matched type!",  relateFN.attr('id'));
			}
		}

		/* relateFN = relateDiv.find('div >div') */
		// relateFN.hide();
	});
	relateDiv.find('div >div').hide();
	relateDiv.hide();

		/* Action-click : show item/image in a popup layer if clicking it in .relateDiv */
	relateDiv.find('div>div.active').click(function(event) {
		console.log('click image');
		/* Disable scroll until last is finished*/
		if ((root&&root.is(':animated'))|| ($('.contentWrap') &&$('.contentWrap').is(':animated')) || relateDiv.is(':animated') ) {	return;	};

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

var setRDivLeft = function(target, cDiv){
	if (target == null) return;/* target must NOT null, since has been checked outside before this called*/
	var newLeft = 0;
	if (target.attr('location') == 'bottom'){//target.attr('location') == 'bottom'
		var rDivWnew = target.width()+rDivWidthWrap;
		if (target.attr('id').match(/^fn:img:/)){
			rDivWnew = target.children().width()+rDivWidthWrap;
		}
		newLeft = $('.container').offset().left + ($('.container').outerWidth()-rDivWnew)/2;
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

var setHeight = function(object, mode){
	var temp = 0;
	
	if (mode === "one-line") {
	/* shrink, NOT highlight */ /*---v4-6--new one-line height-------*/
		temp = object.next().children().outerHeight();
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
	var headItem = $('.highlight').parents('ul').prev().prev();
	headItem = $(headItem.get().reverse()); //console.log(headItem.size());

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
	if (mode == 'more') {
		/* if mode == more, then unit==0, so expand = #item(index+0) = current highlight*/
		var current = divs.eq(index+unit);
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
			$('.contentWrap').animate({left:updatedCDiv.left, width:updatedCDiv.width },'slow', function(){
				var fullH = setHeight(current, "full");
				
				// Update postion of relateDiv and show
				if (passiveTarget){
					setRDivLeft(passiveTarget, updatedCDiv);
					setRDivTop(passiveTarget, fullH);
					showRDiv(passiveTarget, fullH);				
				}
				updateHLB(current, fullH);
			});	
		};	
		return 0
	};
	if (unit == 0){	return 0; }
	/* Only need to change .highlight when mode!=more && unit>0*/
	var shrink = divs.eq(index);
	var expand = divs.eq(index+unit);

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
		var oneLineH = setHeight(shrink, "one-line");
		var fullH = setHeight(expand, "full");	

		//7-8 Update position of relateDiv and show
		if (activeTarget) {
			setRDivLeft(activeTarget,updatedCDiv);
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
			}

			// -5- More to support usable Prev
			if (mode== 'key'&& unit >1){ // press Down, skip details
				slideUP = shrink.nextAll('ol,ul');
				if(slideUP.size() !=0) 
				{
					slideUpHeight += slideUP.outerHeight(true);
					slideUP.slideUp('slow');
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

		// Different opacity for has discussed and not discussed;
		shrink.css('opacity', '0.7');
		expand.css('opacity', '1');
		
		//12/*0. Scrollable*/
		var reviseTop = expandTop - shrinkTop + slideDownHeight - slideUpHeight;
		targetTop = root.scrollTop();
		targetTop += reviseTop;
		root.animate({scrollTop:targetTop},'slow');
	}

	var updatedCDiv = configWrap(activeTarget);
	(activeTarget == null) && (relateDiv.css('display') == 'none') ? scroll() 
			: $('.contentWrap').animate({left:updatedCDiv.left, width:updatedCDiv.width },'slow', function(){
				scroll();
			});

	/*---v4-8--Scrollable Highlight-------*/
	// $('.highlight').css('background', '');
	// $('.hlBackground').css('background', '#5bc0de');
};


var main = function(){
	/* Reorganize & make it scroll*/
	init();

	/*---v4-8--Scrollable Highlight-------*/
	// $(window).bind('mousewheel DOMMouseScroll', function(event){
 	//  $('.highlight').css('background', '#5bc0de');
	// 	$('.hlBackground').css('background', '#fff');
	// });

	/*	Action:
		Array key - change .highlight 
		Space key - show or hide .passive */
	$(document).keydown(function(key) {	
		/* Disable scroll until last is finished*/
		if ((root&&root.is(':animated'))|| ($('.contentWrap') &&$('.contentWrap').is(':animated')) || relateDiv.is(':animated') ) {	return;	};

		var unit = 0, mode = 'key';	
		switch(parseInt(key.which,10)) {
			case 37:// Left : -1 | <-1
				event.preventDefault();
				if (index>0){
					var expand = divs.eq(index-1);
					if(expand.parent().parent().css('display') != 'none'){
						unit = -1;
					} else{
						var expandChildren = expand.parents('ul[style="display: none;"], ol[style="display: none;"]').last();
						var expandID = parseInt(expandChildren.prev().prev().attr('id').replace("item", ""));
						unit = expandID-index;
					}
				}
				break;
			case 38:// Up : <0
				event.preventDefault();
				var shrinkParent = divs.eq(index).parents('li').eq(1).children(':first-child');
				if (shrinkParent.size() ==1) {
					var expandID = parseInt(shrinkParent.attr('id').replace("item", ""));
					unit = expandID-index;
				};
				break;
			case 39: // Right : +1
				event.preventDefault();
				if (index+1<num){
					unit = 1;
				} else{/* When reach last item, then next will be 1st title*/
					// unit = -index;
					// $('.L_1').children().last().children('ul').slideUp();
					targetSection +=1; //
					hideRDiv(); 
					switchSection();
				}				
				break;
			case 40:// Down : >0 	
				event.preventDefault();
				var childrenSize = divs.eq(index).siblings('ul,ol').find('li>div:first-child').size();
				unit = 1 + childrenSize;
				if (index+unit > num-1) {
					//unit = 0;
					/* When reach last item, then next will be 1st title*/
					unit = -index;
					$('.L_1').children().last().children('ul').slideUp();
				};			
				break;
			case 32:
				event.preventDefault();
				unit = 0;
				mode = 'more';
				break;
		}; // END -- switch
		
		triggerAnimate(unit,mode);
		index += unit;

		// return false; // disable scroll via arrow key
	});




	$(".contentToc .L_1>li>div:first-child").click(function(event) {
		/* Disable scroll until last is finished*/
		if ((root&&root.is(':animated'))|| ($('.contentWrap') &&$('.contentWrap').is(':animated')) || relateDiv.is(':animated') ) {	return;	};

		/* Act on the event */
		if (!$(this).hasClass('contentTitle'))
		{
			targetSection = parseInt($(this).parent().attr('id').replace("S", ""));	
			hideRDiv();
			switchSection();
		}
		
		// var oldS = parseInt($('.contentTitle').parent().attr('id').replace("S", ""));
		// ta = oldS-newS;// console.log(expandID, unit);
		// console.log($(this).attr('id') )

		// switchSection();
	});

	/* Action-click : change .highlight if clicking item in .headDiv */
	// headDiv.find('ul>li').click(function(event) {
	// 	$($(this).attr('target')).click();
	// });

};

$(document).ready(main);