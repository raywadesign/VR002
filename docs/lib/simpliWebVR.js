var locales = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl'];
var defaultLocale = 'en';
var lang = navigator.language || navigator.userLanguage;
var progressValue = [];
var currProgress = -1;
var initProgress = false;

// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Safari 3.0+ "[object HTMLElementConstructor]" 
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;

// Chrome 1+
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;

function setStoreBadge()
{
	var badge = document.getElementById("store-badge");

	if(getMobileOperatingSystem() == "android") {
		badge.src = './src/images/mobile/google-play-badge.png';
	}
	else if (getMobileOperatingSystem() == "ios") {
		badge.src = './src/images/mobile/apple-store-badge.png';
	}
	else if (getMobileOperatingSystem() == ""){
		badge.src = './src/images/mobile/badge.png';
	}
}

function getMobileOperatingSystem() 
{
	var ua = navigator.userAgent.toLowerCase();
	var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
	if(isAndroid) {
		return "android";
	}

	if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
		return "ios";
	}

	var ua = navigator.userAgent;
	if(navigator.userAgent.match(/iPad/i) != null || /iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua)) {
		return "ios";
	}

    return "";
}

function OnAppLink()
{
	if (getMobileOperatingSystem() != "")
	{
		var encodedURL = encodeURIComponent(window.location.href);
		var firebaseLink = "https://vrxplayer.page.link?link="+encodedURL+"&apn=com.magix.vrplayer&ibi=com.magix.ios.vrplayer&isi=1374153141";
		window.location = firebaseLink;
	}
	else
	{
		window.open("https://rdir.magix.net/?page=WRH5D5FEEULF");
	}
}

function initCheck()
{
	if (getMobileOperatingSystem() == "") {
		var err = document.getElementById("javascript-error");
		err.parentNode.removeChild(err);
	
		var err = document.getElementById("compatibility-error");
		err.style.visibility = 'visible';
		
		console.log(navigator.userAgent);
		if (!(window.location.protocol == 'file:' && isChrome)) {
			err.parentNode.removeChild(err);
	
			var err = document.getElementById("safari-error");
			err.style.visibility = 'visible';
	
			if (true) {
				err.parentNode.removeChild(err);
	
				var cnt = $("#content").contents();
				$("#content").replaceWith(cnt);
	
				if (autoplay()) {
					startUnity();
				}
				else {
					var playBtn = document.getElementById("play_button");
					playBtn.style.visibility = 'visible';
	
					var $loading = $("#loading");
					var $info = $("#info");
					$loading.add($info).css('display','none');
	
					var $background = $("#background");
					$background.css('-webkit-filter','brightness(0.3)').css('filter','brightness(0.3)');
				}
			}
		}
		else {
			var err = document.getElementById("safari-error");
			err.parentNode.removeChild(err);
		}
	}
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/*function inIframe() {
	return false;
	try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}*/

function autoplay() {
	// check autoplay
	if (GetURLParam("noautoplay") == "true") {
		return false;
	} 
	return true;
}

document.addEventListener("DOMContentLoaded", function(event) {
	// Load Translations
	var location = window.location.pathname;
	if (!location.includes('index_mobile.html')) {
		initCheck();
	}
	
	$.getJSON('./src/translation/strings_'+defaultLocale+'.json', function(data){GetLocaleStrings(data);});

	if (GetURLParam("locale") != null) lang = GetURLParam("locale");
	if (locales.includes(lang)) {
		$.getJSON('./src/translation/strings_'+lang+'.json', function(data){GetLocaleStrings(data);});
	}
});

function GetLocaleStrings(data) {
	var tags = document.getElementsByTagName('trans');
	for (var i = tags.length -1; i >= 0; i--) {
		for (var j = data.Items.length -1; j >= 0; j--) {
			if (tags[i].getAttribute('key') == data.Items[j].Key) {
				tags[i].innerHTML = data.Items[j].Value;
			}
		}
	}
}

function GetURLParam(param){
    var results = new RegExp('[\?&]' + param + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
       return null;
    }
    return decodeURI(results[1]) || 0;
}

function startUnity() {
	UnityLoader.SystemInfo.mobile = false;  // Workaround to force `UnityLoader` to actually load on mobile.
	window.gameInstance = UnityLoader.instantiate('gameContainer', 'Build/webvr.json', {
		Module: {
			// `preserveDrawingBuffer` is needed for WebVR content to be mirrored to the `<canvas>`.
			webglContextAttributes: {
				preserveDrawingBuffer: true
			}
		},
		onProgress: unityProgress
	});

	window.addEventListener('vrdisplayactivate', onActivate);
}

function startUnityButton() {
	var playBtn = document.getElementById("play_button");
	playBtn.parentNode.removeChild(playBtn);
	
	var $loading = $("#loading");
	var $info = $("#info");
	$loading.add($info).css('display','');
	var $background = $("#background");
	$background.css('-webkit-filter','').css('filter','');

	startUnity();
}

function onActivate (evt) {
	return new Promise(function (resolve, reject) {
	if (!evt.display) {
		return reject(new Error('No `display` property found on event'));
	}
	if (evt.reason && evt.reason !== 'navigation') {
		return reject(new Error("Unexpected `reason` (expected to be 'navigation')"));
	}
	if (!evt.display.capabilities || !evt.display.capabilities.canPresent) {
		return reject(new Error('VR display is not capable of presenting'));
	}
	gameInstance.vrDisplay = evt.display;
	
	return evt.display.requestPresent([{source: gameInstance.Module.canvas}]).then(function () {
		console.log('Entered VR mode');
	}).catch(function (err) {
		console.error('Unable to enter VR mode:', err);
	});
	});
}

function unityProgress (gameInstance, progress) {
	if (!gameInstance.progress) {
		gameInstance.loader = $('#loader');
		gameInstance.progress = $('#progress');
		gameInstance.progress.css('transition', 'width 0.01s linear').css('width','0'); 
		gameInstance.loading = $('#loading');
	}

	if (currProgress != progress * 50) {
		progressValue.push(progress * 50);
		currProgress = progress * 50;
	}

	if (initProgress == false) {
		initProgress = true;
		updateProgressBar(progressValue.shift());
	}
}        

function checkImage(imageSrc, good, bad) {
	var img = new Image();
	img.onload = good;
	img.onerror = bad;
	img.src = imageSrc;
}

function repeat() {
	if (progressValue.length === 0) {
		setTimeout(repeat, 50);
		return false;
	}      
	updateProgressBar(progressValue.shift());
	return true;
}

function updateProgressBar(percentage) {  
	var progressbar = $('#progress');
	progressbar.css('width',percentage+'%');
	progressbar.one("webkittransitionEnd otransitionend otransitionEnd mstransitionEnd transitionend", function() {
		var progressbar = $('#progress');
		if (progressbar.width() == $(window).width() || percentage == 100) {
			fade('#loading_screen');              
		}
		else {    
			repeat();
		}    
	});  
}

function setprogress(progress) {
	if (/*!progressValue.includes(progress * 100) || */currProgress != progress * 100) {
		progressValue.push(progress * 100);
		currProgress = progress * 100;
	}
}

async function fade(element) {
	var fade = $(element);
	document.getElementById('game').style.removeProperty('display');
	fade.css('transition','opacity 0.5s linear');
	document.dispatchEvent(new CustomEvent('UnityLoaded'));
	await sleep(10);
	fade.css('opacity', '0');
	fade.one("webkittransitionEnd otransitionend otransitionEnd mstransitionEnd transitionend", function() {
		$('#loading_screen').css('display', 'none');          
		initHUD();    
	});   
};

function initHUD() {
	var $loading_screen = $('#loading_screen');
	var $loader = $('#loader');
	var $info_content = $('#info_content');
	var $info_icon = $('.info-icon');
	var $help = $('#help');
	var $logo = $('#logo');
	var $menu = $('.menu');

	checkImage("StreamingAssets/autoplay/logo.png", function(){ 
		document.getElementById('logo').innerHTML = '<img src="./StreamingAssets/autoplay/logo.png" alt="">';
		}, function(){ } 
	); 

	$loading_screen.css('transition','').css('display','').css('opacity','');
	$loader.add($info_content).css('display','none');
	$info_icon.add($logo).add($menu).css('z-index','1');

	document.getElementById('info_icon').addEventListener('mouseover', function(){ 
		document.getElementById('info_content').style.removeProperty('display'); 
		document.getElementById('help').setAttribute("style", "background-color: rgba(0,0,0,0.7); padding: 100%"); 
	});   

	document.getElementById('info_icon').addEventListener('mouseout', function(){ 
		document.getElementById('help').setAttribute("style", "display: none"); 
		document.getElementById('help').style.removeProperty('background-color');  
	});   
}

// share
function shareFacebook() {
	var shareurl = window.location.href;
	window.open('https://www.facebook.com/sharer/sharer.php?u='+escape(shareurl)+'&t='+document.title, '', 
		'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
	return false;
}

function shareTwitter() {
	var shareurl = window.location.href;
	window.open('https://twitter.com/home?status='+escape(shareurl), '', 
		'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=600');
	return false;
}

function shareLinkedIn() {
	var shareurl = window.location.href;
	window.open('https://www.linkedin.com/shareArticle?mini=true&url='+escape(shareurl), '', 
		'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=550,width=1000');
	return false;
}      

function getAbsolutePath() {
	var loc = window.location;
	var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
	return loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
}

// fullscreen
function switchFullscreen() {

	console.debug(document.body);
	var elem = document.body;
	var img = document.getElementById('toggle-fullscreen');

	if (!fs_status()) {
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
			img.src = 'src/images/menu/ic_fullscreen_off.png';
		} else if (elem.mozRequestFullScreen) { /* Firefox */
			elem.mozRequestFullScreen();
			img.src = 'src/images/menu/ic_fullscreen_off.png';
		} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
			elem.webkitRequestFullscreen();
			img.src = 'src/images/menu/ic_fullscreen_off.png';
		} else if (elem.msRequestFullscreen) { /* IE/Edge */
			elem.msRequestFullscreen();
			img.src = 'src/images/menu/ic_fullscreen_off.png';
		}
	}
	else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
			img.src = 'src/images/menu/ic_fullscreen_on.png';
        } else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
			img.src = 'src/images/menu/ic_fullscreen_on.png';
        } else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
			img.src = 'src/images/menu/ic_fullscreen_on.png';
        } else if (document.msExitFullscreen) {
			document.msExitFullscreen();
			img.src = 'src/images/menu/ic_fullscreen_on.png';
		}
	}
}

function fs_status() {
    if ((document.fullscreenElement && document.fullscreenElement !== null) ||
	   	(document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
	   	(document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
	   	(document.msFullscreenElement && document.msFullscreenElement !== null))
        return true;
    else
        return false;
}