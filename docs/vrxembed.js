var containerName = 'embed-vrx';
var height = 200;
var width = 200;
var url = '';
var noautoplay = false;

function readScriptParams() 
{
	var scripts = document.getElementsByTagName('script');
	var lastScript = scripts[scripts.length-1];
	var scriptName = lastScript;
	if (scriptName.hasAttribute('data-width'))
	{
	 width = scriptName.getAttribute('data-width');
	}
	if (scriptName.hasAttribute('data-height'))
	{
	 height = scriptName.getAttribute('data-height');
	}
	if (scriptName.hasAttribute('div-container'))
	{
	 containerName = scriptName.getAttribute('div-container');
	}
	if (scriptName.hasAttribute('allow'))
	{
		allow = scriptName.getAttribute('allow');
		noautoplay = allow.includes('noautoplay');
	}
	scripturl = lastScript.src;
	if (noautoplay == true)
	{	
		url = scripturl.replace('vrxembed.js', 'index.html?noautoplay=true');
	}
	else
	{
		url = scripturl.replace('vrxembed.js', 'index.html');
	}
}

function createiFrame()
{
	iframe = document.createElement('iframe');
    iframe.src= url;
	iframe.width = width;
	iframe.height = height;	
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('scrolling', 'no');	
	iframe.setAttribute('allowFullScreen', 'true');
	return iframe;
}
 
(function() 
{
	readScriptParams();
	var iframe = createiFrame();
	containerElement = document.getElementById(containerName);
	if (containerElement != null)
	{
		containerElement.appendChild(iframe);
	}
	else
	{
		document.write(iframe);
	}
	
	// Todo: Handle autoplay 
})();
