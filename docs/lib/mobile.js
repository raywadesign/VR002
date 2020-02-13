(function openMobile() 
{
	if ((getMobileOperatingSystem() == "android") || (getMobileOperatingSystem() == "ios"))
	{
		window.location = "./index_mobile.html";
	}
})();