(function ($) {
	"use strict";


	//Preloader

	$(window).on('load', function (e) { // makes sure the whole site is loaded
		$(".loader svg").fadeOut(); // will first fade out the loading animation
		$(".loader").delay(300).fadeOut("slow"); // will fade out the white DIV that covers the website.
	})


	//Parallax & fade on scroll	

	function scrollBanner() {
		$(document).on('scroll', function () {
			var scrollPos = $(this).scrollTop();
			$('.parallax-fade-top').css({
				'top': (scrollPos / 2) + 'px',
				'opacity': 1 - (scrollPos / 450)
			});
		});
	}
	scrollBanner();


	//Lazy svg load
	/**
	 * Process SVGs onLoad
	 *
	 * @returns {void} Nothing.
	 */
	window.addEventListener('load', function () {
		// Find our SVGs.
		const svgs = document.querySelectorAll('svg[data-url]');
		const svgsLen = svgs.length;

		// Loop and process.
		for (let i = 0; i < svgsLen; ++i) {
			// Grab the URL and delete the attribute; we no longer
			// need it.
			let url = svgs[i].getAttribute('data-url');
			let cb = svgs[i].getAttribute('data-cb');

			svgs[i].removeAttribute('data-url');
			svgs[i].removeAttribute('data-cb');


			// We'll let another function handle the actual fetching
			// so we can use the async modifier.
			fetchSVG(url, svgs[i], cb);
		}
	});

	/**
	 * Fetch an SVG
	 *
	 * @param {string} url URL.
	 * @param {DOMElement} el Element.
	 * @returns {void} Nothing.
	 */
	const fetchSVG = async function (url, el, cb) {
		// Dog bless fetch() and await, though be advised you'll need
		// to transpile this down to ES5 for older browsers.
		let response = await fetch(url);
		let data = await response.text();

		// This response should be an XML document we can parse.
		const parser = new DOMParser();
		const parsed = parser.parseFromString(data, 'image/svg+xml');

		// The file might not actually begin with "<svg>", and
		// for that matter there could be none, or many.
		let svg = parsed.getElementsByTagName('svg');
		if (svg.length) {
			// But we only want the first.
			svg = svg[0];

			// Copy over the attributes first.
			const attr = svg.attributes;
			const attrLen = attr.length;
			for (let i = 0; i < attrLen; ++i) {
				if (attr[i].specified) {
					// Merge classes.
					if ('class' === attr[i].name) {
						const classes = attr[i].value.replace(/\s+/g, ' ').trim().split(' ');
						const classesLen = classes.length;
						for (let j = 0; j < classesLen; ++j) {
							el.classList.add(classes[j]);
						}
					}
					// Add/replace anything else.
					else {
						el.setAttribute(attr[i].name, attr[i].value);
					}
				}
			}

			// Now transfer over the children. Note: IE does not
			// assign an innerHTML property to SVGs, so we need to
			// go node by node.
			while (svg.childNodes.length) {
				el.appendChild(svg.childNodes[0]);
			}
		}
		cb && eval(cb);
	};

	//Page Scroll to id

	// $(window).on("load",function(){

	// 	/* Page Scroll to id fn call */
	// 	$(".navbar-nav li a,a[href='#top'],a[data-gal='m_PageScroll2id']").mPageScroll2id({
	// 		highlightSelector:".navbar-nav li a",
	// 		offset: 68,
	// 		scrollSpeed:800
	// 	});

	// 	/* demo functions */
	// 	$("a[rel='next']").click(function(e){
	// 		e.preventDefault();
	// 		var to=$(this).parent().parent("section").next().attr("id");
	// 		$.mPageScroll2id("scrollTo",to);
	// 	});

	// }); 
	// Cache selectors
	var lastId,
		topMenu = $(".navbar-nav"),
		topMenuHeight = topMenu.outerHeight() + 1,
		// All list items
		menuItems = topMenu.find("a:not(.no-line)"),
		// Anchors corresponding to menu items
		scrollItems = menuItems.map(function () {
			var item;
			try {
				item = $($(this).attr("href"));
			} catch (e) {}
			if (item && item.length) {
				return item;
			}
		});

	// Bind click handler to menu items
	// so we can get a fancy scroll animation
	menuItems.click(function (e) {
		var href = $(this).attr("href"),
			offsetTop = href === "#" ? 0 : $(href).offset().top - topMenuHeight + 1;
		$('html, body').stop().animate({
			scrollTop: offsetTop
		}, 850);
		e.preventDefault();
	});

	// Bind to scroll
	$(window).scroll(function () {
		// Get container scroll position
		var fromTop = $(this).scrollTop() + topMenuHeight;

		// Get id of current scroll item
		var cur = scrollItems.map(function () {
			if ($(this).offset().top < fromTop)
				return this;
		});
		// Get the id of the current element
		cur = cur[cur.length - 1];
		var id = cur && cur.length ? cur[0].id : "";

		if (lastId !== id) {
			lastId = id;
			// Set/remove active class
			menuItems
				.parent().removeClass("active").blur().
			end().filter("[href='#" + id + "']").parent().addClass("active");
		}
	});



	//parallax hover tilt effect	

	// $('.js-tilt').tilt({
	// 	glare: false
	// })


	/* Parallax effect */

	// $(window).enllax();

 /* Scroll Reveal */


	/* Scroll Animation */

	window.scrollReveal = new scrollReveal();


	$(document).ready(function () {


		//Scroll back to top

		var offset = 300;
		var duration = 400;
		jQuery(window).on('scroll', function () {
			if (jQuery(this).scrollTop() > offset) {
				jQuery('.scroll-to-top').fadeIn(duration);
			} else {
				jQuery('.scroll-to-top').fadeOut(duration);
			}
		});

		jQuery('.scroll-to-top').on('click', function (event) {
			event.preventDefault();
			jQuery('html, body').animate({
				scrollTop: 0
			}, duration);
			return false;
		})


		//Countdown

		// const second = 1000,
		// 	minute = second * 60,
		// 	hour = minute * 60,
		// 	day = hour * 24;
		// let countDown = new Date('July 10, 2018 13:00:00').getTime(),
		// 	x = setInterval(function() {
		// 	let now = new Date().getTime(),
		// 		distance = countDown - now;

		// 	document.getElementById('days').innerHTML = Math.floor(distance / (day)),
		// 	document.getElementById('hours').innerHTML = Math.floor((distance % (day)) / (hour)),
		// 	document.getElementById('minutes').innerHTML = Math.floor((distance % (hour)) / (minute)),
		// 	document.getElementById('seconds').innerHTML = Math.floor((distance % (minute)) / second);
		// }, second)


		/* Roadmap Carousel */

		$("#owl-roadmap").owlCarousel({
			items: 2,
			// itemsDesktop: [1199, 5],
			// itemsDesktopSmall: [991, 4],
			// itemsTablet: [767, 3],
			// itemsMobile: [575, 2],
			responsiveClass:true,
			responsive:{
				575:{
					items:2,
				},
				767:{
					items:3,
		
				},
				991:{
					items:4,
	
				},
				1199:{
					items:5,
		
				},
			},
			// pagination: false,
			autoPlay: false,
			slideSpeed: 300
		});
		(function ($) {
			var owl = $("#owl-roadmap");
			// owl.owlCarousel();

			// Custom Navigation Events
			$(".next-roadmap").click(function () {
				owl.trigger('next.owl.carousel');
			})
			$(".prev-roadmap").click(function () {
				owl.trigger('prev.owl.carousel');
			})
		})(jQuery);


		$("#owl-media").owlCarousel({
			items: 1,
			// itemsDesktop: [1199, 3],
			// itemsDesktopSmall: [991, 3],
			// itemsTablet: [767, 2],
			// itemsMobile: [575, 1],
			responsiveClass:true,
			responsive:{
				575:{
					items:1,
				},
				767:{
					items:2,
		
				},
				991:{
					items:3,
				},
				1199:{
					items:3,
				},
			},
			// pagination: false,
			autoPlay: true,
			slideSpeed: 300,
			nav: false,
			dots: true,
			loop: true,
		});

		// $('.concept-boxes .concept-boxes__mobile .owl-carousel').owlCarousel({
		// 	stagePadding: 200,
		// 	loop:true,
		// 	margin:10,
		// 	nav:false,
		// 	items:1,
		// 	lazyLoad: true,
		// 	nav:true,
		//   responsive:{
		// 		0:{
		// 			items:1,
		// 			stagePadding: 60
		// 		},
		// 		600:{
		// 			items:1,
		// 			stagePadding: 100
		// 		},
		// 		1000:{
		// 			items:1,
		// 			stagePadding: 200
		// 		},
		// 		1200:{
		// 			items:1,
		// 			stagePadding: 250
		// 		},
		// 		1400:{
		// 			items:1,
		// 			stagePadding: 300
		// 		},
		// 		1600:{
		// 			items:1,
		// 			stagePadding: 350
		// 		},
		// 		1800:{
		// 			items:1,
		// 			stagePadding: 400
		// 		}
		// 	}
		// }).on('mousewheel', '.owl-stage', function (e) {
		// 	if (e.deltaY > 0) {
		// 		owl.trigger('next.owl');
		// 	} else {
		// 		owl.trigger('prev.owl');
		// 	}
		// 	e.preventDefault();
		// });

		/* mobile concept boxes */
		const toggleBoxAnim = (target) => {
			target.find(":not(.active) .concept-box").each((i, e) => {
				let toAnimInActive = $(e).data("toanim");
				toAnimInActive && toAnimInActive.forEach(el => {
					$(el).removeAttr('ani', '');
				});
			});

			let toAnim = target.find(".active .concept-box").each((i, e) => {
				let toAnim = $(e)
					.data("toanim");
				toAnim && toAnim.forEach(el => {
					$(el).attr('ani', '');
				});
			});

		}
		var conceptBoxes = $('.concept-boxes .concept-boxes__mobile .owl-carousel')


		conceptBoxes.on('change initialized.owl.carousel', function (e) {
			// console.log(e);
			// alert(e);
			let target = $(e.currentTarget.children[0]);
			if (target.is(":visible")) {
				toggleBoxAnim(target);
			}
		})


		conceptBoxes.owlCarousel({
			margin: 10,
			items: 1,
			itemsDesktop: [1199, 1],
			itemsDesktopSmall: [991, 1],
			itemsTablet: [767, 1],
			itemsMobile: [575, 1],
			
			pagination: true,
			autoPlay: true,
			slideSpeed: 500,
			loop: true,
			autoplayTimeout: 4000,
			nav: false,
			loop: true,
			animateOut: 'fadeOut',
			dots: true,
		});
		var ocs = document.querySelectorAll('.concept-boxes .concept-boxes__mobile .owl-carousel');
		ocs.forEach((e) => {
			var observer = new MutationObserver(function () {
				console.log(e);

				if (!e.classList.contains('owl-hidden')) {
					toggleBoxAnim(conceptBoxes);
				} else {
					conceptBoxes.find(".concept-box").each((i, e) => {
						let toAnimInActive = $(e).data("toanim");
						toAnimInActive && toAnimInActive.forEach(el => {
							$(el).removeAttr('ani', '');
						});
					});
				}
			});
			observer.observe(e, {
				attributes: true,
				childList: true,
				subtree: true
			});
		});

		// conceptBoxes.on('mousewheel', '.owl-stage', function (e) {
		// 	if (e.deltaY > 0) {
		// 		owl.trigger('next.owl');
		// 	} else {
		// 		owl.trigger('prev.owl');
		// 	}
		// 	e.preventDefault();
		// });

		/* Video */

		$(".container").fitVids();

		$('.vimeo a,.youtube a').on('click', function (e) {
			e.preventDefault();
			var videoLink = $(this).attr('href');
			var classeV = $(this).parent();
			var PlaceV = $(this).parent();
			if ($(this).parent().hasClass('youtube')) {
				$(this).parent().wrapAll('<div class="video-wrapper">');
				$(PlaceV).html('<iframe frameborder="0" height="333" src="' + videoLink + '?autoplay=1&showinfo=0" title="YouTube video player" width="547"></iframe>');
			} else {
				$(this).parent().wrapAll('<div class="video-wrapper">');
				$(PlaceV).html('<iframe src="' + videoLink + '?title=0&amp;byline=0&amp;portrait=0&amp;autoplay=1&amp;color=7b5eea" width="500" height="281" frameborder="0"></iframe>');
			}
		});

		/* vUnit */

		new vUnit({
			CSSMap: {
				// The selector (vUnit will create rules ranging from .selector1 to .selector100)
				// Wanted to have a font-size based on the viewport width? You got it.
				'.vmin_fs': {
					property: 'font-size',
					reference: 'vmin'
				},
				'.vmin_h': {
					property: 'height',
					reference: 'vmin'
				},
			},
			// onResize: function() {
			//   console.log('A screen resize just happened, yo.');
			// }
		}).init();

		/* Contact form */

		$('#contact-form').validator();


		// when the form is submitted
		$('#contact-form').on('submit', function (e) {

			// if the validator does not prevent form submit
			if (!e.isDefaultPrevented()) {
				var url = "contact.php";

				// POST values in the background the the script URL
				$.ajax({
					type: "POST",
					url: url,
					data: $(this).serialize(),
					success: function (data) {
						// data = JSON object that contact.php returns

						// we recieve the type of the message: success x danger and apply it to the 
						var messageAlert = 'alert-' + data.type;
						var messageText = data.message;

						// let's compose Bootstrap alert box HTML
						var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';

						// If we have messageAlert and messageText
						if (messageAlert && messageText) {
							// inject the alert to .messages div in our form
							$('#contact-form').find('.messages').html(alertBox);
							// empty the form
							$('#contact-form')[0].reset();
						}
					}
				});
				return false;
			}
		})



	});




})(jQuery);