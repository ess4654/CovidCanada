;(function () {
	
	'use strict';

	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
			BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
			iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
			Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
			Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
			any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};

	var fullHeight = function() {

		if ( !isMobile.any() ) {
			$('.js-fullheight').css('height', $(window).height());
			$(window).resize(function(){
				$('.js-fullheight').css('height', $(window).height());
			});
			Mobile = false;
			console.log("Not Mobile");
		} else {
			$('.chart').css("margin-top","-200px");
			Mobile = true;
			console.log("Mobile");
		}

	};

	// Animations

	var contentWayPoint = function() {
		var i = 0;
		$('.animate-box').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .animate-box.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight animated');
							} else {
								el.addClass('fadeInUp animated');
							}

							el.removeClass('item-animate');
						},  k * 200, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '85%' } );
	};


	var burgerMenu = function() {

		$('.js-fh5co-nav-toggle').on('click', function(event){
			event.preventDefault();
			var $this = $(this);

			if ($('body').hasClass('offcanvas')) {
				$this.removeClass('active');
				$('body').removeClass('offcanvas');	
			} else {
				$this.addClass('active');
				$('body').addClass('offcanvas');	
			}
		});



	};

	// Click outside of offcanvass
	var mobileMenuOutsideClick = function() {

		$(document).click(function (e) {
	    var container = $("#fh5co-aside, .js-fh5co-nav-toggle");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {

	    	if ( $('body').hasClass('offcanvas') ) {

    			$('body').removeClass('offcanvas');
    			$('.js-fh5co-nav-toggle').removeClass('active');
			
	    	}
	    	
	    }
		});

		$(window).scroll(function(){
			if ( $('body').hasClass('offcanvas') ) {

    			$('body').removeClass('offcanvas');
    			$('.js-fh5co-nav-toggle').removeClass('active');
			
	    	}
		});

	};

	var sliderMain = function() {
		
	  	$('#fh5co-hero .flexslider').flexslider({
			animation: "fade",
			slideshowSpeed: 5000,
			directionNav: true,
			start: function(){
				setTimeout(function(){
					$('.slider-text').removeClass('animated fadeInUp');
					$('.flex-active-slide').find('.slider-text').addClass('animated fadeInUp');
				}, 500);
			},
			before: function(){
				setTimeout(function(){
					$('.slider-text').removeClass('animated fadeInUp');
					$('.flex-active-slide').find('.slider-text').addClass('animated fadeInUp');
				}, 500);
			}

	  	});

	};

	// Document on load.
	$(function(){
		fullHeight();
		contentWayPoint();
		burgerMenu();
		mobileMenuOutsideClick();
		sliderMain();
		var location = window.location.href.split("?");

		if(location.length == 1)
			document.getElementById('CA').click();
		else {
			var URI = location[1].split("&");
			var keys = [];
			var values = [];
			for(var i = 0; i<URI.length; i++)
			{
				var det = URI[i].split("=");
				keys.push(det[0]);
				values.push(det[1]);
			}

			for(var j = 0; j<keys.length; j++)
			{
				if(keys[j] == "p")
				{
					document.getElementById(values[j]).click();
				}
			}
		}

		$($(".flex-control-nav.flex-control-paging a")[0]).attr("data-toggle", "tooltip");
		$($(".flex-control-nav.flex-control-paging a")[1]).attr("data-toggle", "tooltip");
		$($(".flex-control-nav.flex-control-paging a")[2]).attr("data-toggle", "tooltip");

		$($(".flex-control-nav.flex-control-paging a")[0]).attr("title", "Weekly Stats Pie Chart");
		$($(".flex-control-nav.flex-control-paging a")[1]).attr("title", "Daily Stats Bar Chart");
		$($(".flex-control-nav.flex-control-paging a")[2]).attr("title", "Daily Stats Line Graph");
		$('[data-toggle="tooltip"]').tooltip({trigger: 'manual'});
		
		$($(".flex-control-nav.flex-control-paging a")[0]).hover(function() {
			$($(".flex-control-nav.flex-control-paging a")[0]).tooltip("show");
		});
		$($(".flex-control-nav.flex-control-paging a")[0]).mouseleave(function() {
			$($(".flex-control-nav.flex-control-paging a")[0]).tooltip("hide");
		});
		$($(".flex-control-nav.flex-control-paging a")[1]).hover(function() {
			$($(".flex-control-nav.flex-control-paging a")[1]).tooltip("show");
		});
		$($(".flex-control-nav.flex-control-paging a")[1]).mouseleave(function() {
			$($(".flex-control-nav.flex-control-paging a")[1]).tooltip("hide");
		});
		$($(".flex-control-nav.flex-control-paging a")[2]).hover(function() {
			$($(".flex-control-nav.flex-control-paging a")[2]).tooltip("show");
		});
		$($(".flex-control-nav.flex-control-paging a")[2]).mouseleave(function() {
			$($(".flex-control-nav.flex-control-paging a")[2]).tooltip("hide");
		});

		$($(".flex-control-nav.flex-control-paging a")[0]).html("<img src='img/pie-chart.png' style='position:absolute; width: 40px; height: 40px; right:15px; margin-top:10px; z-index:0;' onclick='swapview(0);'/>");
		$($(".flex-control-nav.flex-control-paging a")[1]).html("<img src='img/bar-chart.png' style='position:absolute; width: 40px; height: 40px; right:15px; margin-top:10px; z-index:0;' onclick='swapview(1);'/>");
		$($(".flex-control-nav.flex-control-paging a")[2]).html("<img src='img/line-chart.png' style='position:absolute; width: 40px; height: 40px; right:15px; margin-top:10px; z-index:0;' onclick='swapview(2);'/>");
	});

}());