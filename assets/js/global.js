var tutorialScript = {
	init: function() {
		var fnrefback = 'fnref-';

		this.generateTOC();
		this.enhanceFootnoteItem();
		this.addIdToSup();
		this.addCaptionClassToImage();
		this.addCaptionClassToTable();
	},

	generateTOC: function() {
		$('.toc').tableOfContents('.main', {
			'startLevel': 2,
			'depth': 2
		});
	},

	enhanceFootnoteItem: function() {
		var t = this;
		if($('.navigation + ol').length > 0) {
			$('.navigation + ol').addClass('footnotes');

			$('.navigation + ol > li').each(function(index, ele) {
				var order = index+1;
				$(ele).attr('id', 'fn-'+order);

				$(ele).append('&nbsp;<a href="#fnref-'+order+'">&uarr;</a>');
			});
		}
	},

	// add an id to the footnote element in the content
	addIdToSup: function() {
		var $sup = $('sup', '.main'),
		    id = 'fnref-'+$sup.text();
		$sup.each(function(index){
			$(this).attr('id', 'fnref-'+(index+1));
		});
	},

	addCaptionClassToImage: function() {
		$('img').each(function(index, ele){
			var $caption = $(this).parent().next('p');
			$caption.addClass('caption');
		});
	},

	addCaptionClassToTable: function() {
		$('table').each(function(index, ele){
			var $caption = $(this).next('p');
			$caption.addClass('caption');
		})
	}
};

$(document).ready(function(){
	tutorialScript.init();
});
