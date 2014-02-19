;
(function($) {

	var preloadImage = function(src, callback, context) {
		$('<img/>').load(function() {
			if (callback) callback.call(context || this, src);
		}).attr('src', src);
	};

	$.fn.cover_open = function($this, href, options) {
		var defaults = {
			divID: 'cover-plugin-div',
			loader: 'loader.gif',
			backgroundColor: 'transparent',
			duration: 200
		};
		var settings = $.extend({}, defaults, options);
		var cover = $("<div id='" + settings.divID + "'></div>");
		cover.click(function() {
			// process again because it may have changed by scroll or whatever
			cover.stop(true, true).animate({
				left: $this.offset().left - $(window).scrollLeft() + 'px',
				top: $this.offset().top - $(window).scrollTop() + 'px',
				width: $this.width() + 'px',
				height: $this.height() + 'px'
			}, settings.duration, function() {
				cover.remove();
				if (settings.onClose) {
					settings.onClose.call($this);
				}
			});
		});

		cover.css({
			position: 'fixed',
			zIndex: 1000,
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center center",
			left: $this.offset().left - $(window).scrollLeft() + 'px',
			top: $this.offset().top - $(window).scrollTop() + 'px',
			width: $this.width() + 'px',
			height: $this.height() + 'px'
		});

		var timeout = setTimeout(function() {
			// Should not show briefly when image is loaded
			cover.css({
				backgroundImage: "url(" + settings.loader + ")",
				backgroundColor: settings.backgroundColor
			});
		}, 250);
		$('body').append(cover);

		preloadImage(href, function() {
			clearTimeout(timeout);
			cover
				.css({
					backgroundImage: "url(" + href + ")",
					backgroundSize: "cover"
				})
				.stop(true, true)
				.animate({
					left: '0px',
					top: '0px',
					width: '100%',
					height: '100%'
				}, settings.speed, function() {
					if (settings.onOpen) {
						settings.onOpen.call($this);
					}
				});
		});
	};

	$.fn.cover = function(options) {
		var defaults = {
			binding: 'click.cover',
			preload: true
		};
		var settings = $.extend({}, defaults, options);
		return this.each(function() {
			var $this = $(this);
			if (settings.preload) new Image().src = $this.data().cover || $this.attr('src');
			if (!$this.is('img')) throw new Error("Cover was used with a node which is not an image.")
			$this.bind(settings.binding, function() {
				var href = $this.data().cover || $this.attr('src');
				$.fn.cover_open($this, href, settings);
			});
		});
	};
})(jQuery);
