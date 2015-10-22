/*
Notes:
1. Preload all images because I am only getting ten images on each search 
2. The call only downloads ten images for the purpose of show casing the code.  
3. I didn't work on the mobile UI version for times sake, but it is easy for me to make it responsive. 
4. Visit a live version of the app at www.thewaymultimedia.com/slack

To view on a local server you will need to have Node JS installed and run the command `npm install`  to install all express and then excute `npm start` to start the local server. 

*/

(function(window, undefined) {
	'use strict'; 
	
	//make only one copy of Flickr
	var FLICKR = (function(){
		var config = { 
			//for now expose api key
			key: '870a74dbd79728b86e0eb7208ff0d1a8',
		 };

		return {
			getSearchURL: function (search) {
				search = this.prepSearchString(search);
				//concatinate for now, create function to build url from an object properties
				return 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + config.key + '&tags=' + search + '&format=json&nojsoncallback=1&per_page=10'
			},
			
			prepSearchString: function (string) {
				//replace all spaces with a +
				return string.replace(' ', '+');
			},
			
			makeImgSrcURL: function (img) {
				//only return null for now
				if(!img) return null;
			
				return 'https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg';
			}
		}
	})();

	var gallery = function () {
		
		var img = document.getElementById('img'),
			current = 0,
			images = [],
			callback = null;
		
		//The API		
		return {
			getImages: function (method, url, func) {
				if(typeof func === 'function') {
					callback = func;
				}
				
				
				var xhr = new XMLHttpRequest();
				xhr.open(method, url, true);

				//opted for eventListeners.
				(function(gallery) {
					xhr.addEventListener("load", function () {
						gallery.ajaxSuccess(this.responseText);
					});
					
					xhr.addEventListener("error", function (evt) {
						gallery.ajaxError(evt);
					});
				})(this);

				xhr.send();	
			},
			
			ajaxSuccess: function (body) {
				try {
					body = JSON.parse(body);
					
					if(body.stat === 'fail') {
						this.diplayMsg(body.message)
						return;
					}
					
					//save results
					images = body.photos.photo;
					
					//show first
					this.render(images[0]);
					//preload the rest of the mages
					this.preloadImages(images, 1);
					
				} catch (e) {
					this.diplayMsg('Looks like there was an error processing the results');
				}

			},

			ajaxError: function (evt) {
				console.log(evt.type);
				if(evt.type === 'error') {
					this.diplayMsg('Oops there was an error getting the images from the source');
				}
			},

			diplayMsg: function (msg) {
				document.getElementById('msg').textContent = msg;
			},
			
			updateSliderState: function () {
				//carcode for now
				document.getElementById('current-slide').textContent = current + 1;
				document.getElementById('total-slides').textContent = images.length;
			},
			
			preloadImages: function(images, startIndex) {
				var img, i = startIndex || 0;
				
				//for now preload all since it's only ten.
				//if it's more than, change to preload a few at a time.
				for(i; i < images.length; i++) {
					img = document.createElement('img');
					img.src = FLICKR.makeImgSrcURL(images[i]);
				}
			},
			
			next: function () {
				
				if(images[current + 1]) {
					current++
				} else {
					current = 0;
				}
				
				this.render(images[current]);
			},
			
			previous: function () {
				if(images[current - 1]) {
					current--
				} else {
					current = images.length -1;
				}
				
				this.render(images[current]);
			},

			render: function (image) {
				img.src = FLICKR.makeImgSrcURL(image);

				img.onload = function () {
					//show gallery;
					document.querySelectorAll('.gallery')[0].className = 'gallery fadein';
					
					//only excute callback only on the first render of a search
					if(callback) {
						callback();	
						callback = null;
					}
					
				};
				
				this.updateSliderState();
			}
		}
	}

	// run on page load
	window.addEventListener('load', function () {
		var flickrGallery = gallery(),
			controls = document.getElementById('gallery-controls'),
			search = document.getElementById('search-box'),
			galleryWrapper = document.getElementById('gallery'),
			term = document.getElementById('search-term'),
			spinner = document.getElementById('spinner');

		//events for gallery controls
		controls.addEventListener('click', function (evt) {
			evt.preventDefault();
			
			if(evt.target.className === 'gallery-next') {
				flickrGallery.next();
			}
			else if (evt.target.className === 'gallery-prev') {
				flickrGallery.previous();
			}
			
			
		});

		//search event;
		document.getElementById('search-flickr').addEventListener('submit', function (evt) {
			evt.preventDefault();
			
			if(term.value) {
				//show loading spinner;
				spinner.style.display = 'block';
				
				flickrGallery.getImages( 'GET', FLICKR.getSearchURL(term.value), function() {
					search.className = 'search-box fadeout';
					
					//hide spinner
					spinner.style.display = 'none';
				});
			} else {
				flickrGallery.diplayMsg('Enter a search term');
			}
		});
		
		document.getElementById('search-again').addEventListener('click', function (evt) {
			evt.preventDefault();
			
			search.className = 'search-box fadein';
			term.value = '';
			galleryWrapper.className = 'gallery fadeout';
		});

	});
})(window);