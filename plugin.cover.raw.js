;
(function($) {

	var preloadImage = function(src, callback, context) {
		$('<img/>').load(function() {
			if (callback) callback.call(context || this, src);
		}).attr('src', src);
	}, 
		$w = $(window),

	calcPosition = function(img, settings) {
		var wHeight = $w.height(),
			wWidth = $w.width(),
			iHeight = img.height,
			iWidth = img.width,
			left, top, w, h;

		if (!iHeight || !iWidth) {
			left = top = '0px';
			w = '100%';
			h = '100%';
		} else {
			var rate = iWidth / iHeight;

			if (settings.alwaysFill) {
				var wRate = wWidth / wHeight;
				if (rate >= wRate) {
					iWidth = settings.viewportFill * wWidth;
					iHeight = iWidth / rate;
				} else {
					iHeight = settings.viewportFill * wHeight;
					iWidth = rate * iHeight;
				}
			} else {
				if (iHeight > wHeight) {
					iHeight = settings.viewportFill * wHeight;
					iWidth = rate * iHeight;
				}

				if (iWidth > wWidth) {
					iWidth = settings.viewportFill * wWidth;
					iHeight = iWidth / rate;
				}
			}

			left = ((wWidth - iWidth) / 2) + 'px';
			top = ((wHeight - iHeight) / 2) + 'px';
			w = iWidth + 'px';
			h = iHeight + 'px';
		}

		return {
			left: left,
			top: top,
			width: w,
			height: h
		};
	};

	$.fn.cover_close = function() {
		var $image_preview = $('#cover-plugin-div'),
			$image_preview_wrap = $('#cover-plugin-div_wrap');

		if ($image_preview_wrap.length == 1) {
			$image_preview_wrap.trigger('click');
			return true;
		}

		if ($image_preview.length > 0) {
			$image_preview.parent().remove();
			return true;
		}

		return false;
	};

	$.fn.cover_is_open = function() {
		return $('#cover-plugin-div').length > 0;
	};

	$.fn.cover_open = function($this, href, options) {
		var defaults = {
			divID: 'cover-plugin-div',
			loader: 'loader.gif',
			backgroundColor: 'transparent',
			resizeEvent: 'resize',
			closeDiv: '<div class="close"><i title="Close" class="icon-exit-20"></i></div>',
			viewportFill: 0.9,
			alwaysFill: false,
			duration: 200
		},
			settings = $.extend({}, defaults, options),
			cover = $("<div id='" + settings.divID + "'></div>");

		cover.css({
			position: 'fixed',
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center center",
			left: $this.offset().left - $w.scrollLeft() + 'px',
			top: $this.offset().top - $w.scrollTop() + 'px',
			width: $this.width() + 'px',
			height: $this.height() + 'px'
		});

		var timeout = window.setTimeout(function() {
			// Should not show briefly when image is loaded
			$wrap.css('opacity', 0.5);

			cover.css({
				backgroundImage: "url(" + settings.loader + ")",
				backgroundColor: settings.backgroundColor
			});
		}, 250);

		var $wrap = $('<div/>').attr('id', settings.divID + '_wrap').append(cover);

		if (settings.closeDiv)
			$wrap.prepend(settings.closeDiv);

		$wrap.click(function() {
			// process again because it may have changed by scroll or whatever
			cover.stop(true, true).animate({
				left: $this.offset().left - $w.scrollLeft() + 'px',
				top: $this.offset().top - $w.scrollTop() + 'px',
				width: $this.width() + 'px',
				height: $this.height() + 'px'
			}, settings.duration, function() {
				cover.parent().remove();
				if (settings.onClose) {
					settings.onClose.call($this);
				}
			});

			$wrap.css('opacity', 0);
			$w.off(settings.resizeEvent + '.cover');
		});

		$('body').append($wrap);

		preloadImage(href, function() {
			window.clearTimeout(timeout);

			var dim = calcPosition(this, settings),
				w = this.width,
				h = this.height;

			cover
				.css({
					backgroundImage: "url(" + href + ")",
					backgroundSize: "cover"
				})
				.stop(true, true)
				.animate(dim, settings.speed, function() {
					$w.on(settings.resizeEvent + '.cover', function(e) {
						var new_dim = calcPosition({
							width: w,
							height: h
						}, settings);

						cover.css(new_dim);
					});
					if (settings.onOpen) {
						settings.onOpen.call($this);
					}
				});

			$wrap.css('opacity', 1);
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
			if (settings.preload)
				new Image().src = $this.data().cover || $this.attr('src');

			if (!$this.is('img'))
				throw new Error("Cover was used with a node which is not an image.")

			$this.bind(settings.binding, function() {
				var href = $this.data().cover || $this.attr('src');
				$.fn.cover_open($this, href, settings);
			});
		});
	};
})(jQuery);
