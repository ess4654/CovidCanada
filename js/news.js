var provinceByCode = {
	"AB":{
		"CBC":["canada-calgary", "canada-edmonton"], 
		"CTV":[["calgary.ctvnews.ca","ctv-news-calgary"],["edmonton.ctvnews.ca","ctv-news-edmonton"]],
		"GLOBAL":["lethbridge", "edmonton", "calgary"]
	},
	"BC":{
		"CBC":["canada-britishcolumbia", "canada-kamloops"], 
		"CTV":[["bc.ctvnews.ca","ctv-news-vancouver"],["vancouverisland.ctvnews.ca","ctv-vancouver-island-latest-news"]],
		"GLOBAL":["bc", "okanagan"]
	},
	"SK":{
		"CBC":["canada-saskatchewan", "canada-saskatoon"], 
		"CTV":[["regina.ctvnews.ca","ctv-news-regina"],["saskatoon.ctvnews.ca","ctv-news-saskatoon"]],
		"GLOBAL":["saskatoon", "regina"]
	},
	"MB":{
		"CBC":["canada-manitoba"], 
		"CTV":[["winnipeg.ctvnews.ca","ctv-news-winnipeg"]],
		"GLOBAL":["winnipeg"]
	},
	"ON":{
		"CBC":["canada-toronto", "canada-kitchenerwaterloo", "canada-sudbury", "canada-windsor", "canada-thunderbay", "canada-london"], 
		"CTV":[["ottawa.ctvnews.ca","ctv-news-ottawa"],["toronto.ctvnews.ca","ctv-news-toronto"]],
		"GLOBAL":["toronto"]
	},
	"QC":{
		"CBC":["canada-montreal"], 
		"CTV":[["montreal.ctvnews.ca","ctv-news-montreal"]],
		"GLOBAL":["montreal"]
	},
	"NB":{
		"CBC":["canada-newbrunswick"], 
		"CTV":[["atlantic.ctvnews.ca","ctv-news-atlantic-public-rss"]],
		"GLOBAL":["new-brunswick"]
	},
	"PE":{
		"CBC":["canada-pei"], 
		"CTV":[["atlantic.ctvnews.ca","ctv-news-atlantic-public-rss"]],
		"GLOBAL":[]
	},
	"NS":{
		"CBC":["canada-novascotia"], 
		"CTV":[["atlantic.ctvnews.ca","ctv-news-atlantic-public-rss"]],
		"GLOBAL":["halifax"]
	},
	"NL":{
		"CBC":["canada-newfoundland"], 
		"CTV":[],
		"GLOBAL":[]
	},
	"NV":{
		"CBC":["canada-north"], 
		"CTV":[],
		"GLOBAL":[]
	},
	"NT":{
		"CBC":["canada-north"], 
		"CTV":[],
		"GLOBAL":[]
	},
	"YU":{
		"CBC":["canada-north"], 
		"CTV":[],
		"GLOBAL":[]
	},
	"CA":{
		"CBC":["canada", "health", "topstories"], 
		"CTV":[["www.ctvnews.ca","ctvnews-ca-top-stories-public-rss"],["www.ctvnews.ca","ctvnews-ca-canada-public-rss-1.822284"],["www.ctvnews.ca","ctvnews-ca-health-public-rss-1.822299"]],
		"GLOBAL":["canada", "health"]
	}
};

var Mobile;
var SortingNews;

var filtered_words = [
	'Coronavirus', 'coronavirus', 'CORONAVIRUS',
	'COVID-19', 'covid-19', 'covid', 'Covid', 'COVID', 'Covid-19',
	'cancellation', 'Cancellation', 'CANCELLATION', 'cancel', 'Cancel', 'CANCEL',
	'quarantine', 'QUARANTINE', 'Quarantine',
	'Social Distancing', 'SOCIAL DISTANCING', 'social distancing',
	'corona', 'CORONA', 'Corona',
	'811',
	'TOILET PAPER', 'toilet paper', 'Toilet Paper', 'TP',
	'close', 'CLOSE', 'Close',
	'cruise ship', 'Cruise Ship', 'CRUISE SHIP', 'CRUISE', 'cruise', 'Cruise',
	'WHO', 'World Health Organization', 'world health organization',
	'SARS', 'MERS',
	'wuhan', 'Wuhan', 'WUHAN',
	'bats', 'BATS', 'Bats',
	'Public Health', 'public health', 'PUBLIC HEALTH',
	'pandemic', 'PANDEMIC', 'Pandemic',
	'self-isolate', 'SELF-ISOLATE', 'Self-Isolate',
	'14 DAYS', '14 days', '14 Days',
	'containment area', 'Containment Area', 'CONTAINMENT AREA',
	'screening', 'Screening', 'SCREENING',
	'large gatherings', 'LARGE GATHERINGS', 'Large Gatherings',
	'lockdown', 'LOCKDOWN', 'Lockdown',
	'panic buying', 'PANIC BUYING', 'Panic buying', 'Panic Buying',
	'closes borders', 'closed borders', 'Closes boarders', 'Closed boarders',
	'chief medical officer', 'CHIEF MEDICAL OFFICER', 'Chief Medical Officer',
	'50 people', '50 PEOPLE', '50 People',
	'250 people', '250 PEOPLE', '250 People'
];

var banned_words = [
	'france', 'France', 'FRANCE',
	'SPAIN', 'spain', 'Spain',
	'Germany', 'GERMANY', 'Germany',
	'Italy', 'ITALY', 'Italy',
	'China', 'CHINA', 'China',
	'Philippines', 'PHILIPPINES', 'philippines',
	'Putin', 'Russia', 'Iran',
	'Manila', 'MANILA', 'manila',
	'Trump', 'TRUMP', 'trump',
	'Brave new world', 'BRAVE NEW WORLD', 'brave new world', 'Brave New World'
];

var STORIES_BIN;
var STORIES;
var RSSRequest;
var RSSRecieved;

function GetNewsByRegion(code)
{
	STORIES_BIN = [];
	RSSRecieved = 0;
	var CBCNews = provinceByCode[code]["CBC"];
	var CTVNews = provinceByCode[code]["CTV"];
	var GLOBALNews = provinceByCode[code]["GLOBAL"];
	RSSRequest = CBCNews.length + CTVNews.length + GLOBALNews.length;
	for(var i = 0; i<CBCNews.length; i++)
		CBCNewsGet(CBCNews[i], "CBCNewsCallback");
	for(var j = 0; j<CTVNews.length; j++)
		CTVNewsGet(CTVNews[j], "CTVNewsCallback");
	for(var k = 0; k<GLOBALNews.length; k++)
		GLOBALNewsGet(GLOBALNews[k], "GLOBALNewsCallback");
	//GLOBALNewsGet("health", "GLOBALNewsCallback");
}

function CBCNewsCallback(response)
{
	var stories = response.items;

	for(var i = 0; i<stories.length; i++)
	{
		if(!(contains(stories[i].title, filtered_words) === false) &&
			contains(stories[i].title, banned_words) === false)
			STORIES_BIN.push(stories[i]);
	}

	RSSRecieved++;
	if(RSSRecieved >= RSSRequest)
		loadNews();
}

function CTVNewsCallback(response)
{
	var stories = response.items;

	for(var i = 0; i<stories.length; i++)
	{
		if(!(contains(stories[i].title, filtered_words) === false) &&
			contains(stories[i].title, banned_words) === false)
			STORIES_BIN.push(stories[i]);
	}

	RSSRecieved++;
	if(RSSRecieved >= RSSRequest)
		loadNews();
}

function GLOBALNewsCallback(response)
{
	var stories = response.items;

	for(var i = 0; i<stories.length; i++)
	{
		if(!(contains(stories[i].title, filtered_words) === false) &&
			contains(stories[i].title, banned_words) === false)
			STORIES_BIN.push(stories[i]);
	}

	RSSRecieved++;
	if(RSSRecieved >= RSSRequest)
		loadNews();
}

function CBCNewsGet(action, callback)
{
	//RSS2JSON
	var url_request = "https://api.rss2json.com/v1/api.json?api_key=vpdgybikmtdoq3seyblntqkjajn6go3n1mdsxiak&rss_url=https%3A%2F%2Fwww.cbc.ca%2Fcmlink%2Frss-" + action + "?format=json&callback=" + callback;

	//FEED 2 JSON
	//var url_request = "https://feed2json.org/convert?url=https%3A%2F%2Fwww.cbc.ca%2Fcmlink%2Frss-" + action + "?format=json&callback=" + callback;

	//SEND RSS GET JSON
	//var url_request = "https://send-rss-get-json.herokuapp.com/convert/?u=https%3A%2F%2Fwww.cbc.ca%2Fcmlink%2Frss-" + action + "?format=jsonp&callback=" + callback;

	var scriptTag = document.createElement("script"); // Dynamically create a "script" tag
	scriptTag.src = url_request; // Point to the query string
	$("#NewsGet").html(scriptTag);
}

function CTVNewsGet(action, callback)
{
	//RSS2JSON
	var url_request = "https://api.rss2json.com/v1/api.json?api_key=vpdgybikmtdoq3seyblntqkjajn6go3n1mdsxiak&rss_url=https%3A%2F%2F"+action[0]+"%2Frss%2F" + action[1] + "?format=json&callback=" + callback;

	var scriptTag = document.createElement("script"); // Dynamically create a "script" tag
	scriptTag.src = url_request; // Point to the query string
	$("#NewsGet").html(scriptTag);
}

function GLOBALNewsGet(action, callback)
{
	//RSS2JSON
	var url_request = "https://api.rss2json.com/v1/api.json?api_key=vpdgybikmtdoq3seyblntqkjajn6go3n1mdsxiak&rss_url=https%3A%2F%2Fglobalnews.ca%2F"+action+"%2Ffeed?format=json&callback=" + callback;

	var scriptTag = document.createElement("script"); // Dynamically create a "script" tag
	scriptTag.src = url_request; // Point to the query string
	$("#NewsGet").html(scriptTag);
}

function loadNews()
{
	$("#news-bin").html("");
	switch(SortingNews)
	{
		case "Most Recent":
			//Sort most recent
			STORIES_BIN.sort(function(a, b){return moment(a.pubDate).isBefore(moment(b.pubDate));});
			break;
		case "Oldest":
			//Sort oldest
			STORIES_BIN.sort(function(a, b){return moment(b.pubDate).isBefore(moment(a.pubDate));});
			break;
		default:
			//Sort Random
			shuffle(STORIES_BIN);
			break;
	}
	
	STORIES = new Set();
	for(var i = 0; i<STORIES_BIN.length; i++)
		STORIES.add(STORIES_BIN[i]);

	//console.log(STORIES);
	//console.log('Sucess');
	var written = [];

	STORIES.forEach(function(story) {
		if(!written.includes(story.link)) {
			var descriptionStart = story.description.indexOf("<p>");

			var description = story.description.substr(descriptionStart, story.description.length-descriptionStart);
			description = filterDescription(description);
			var thumbnail = story.thumbnail;
			if(thumbnail == "" || thumbnail == null || contains(thumbnail, ["globalnews"]) === 0) { //CTV
				thumbnail = story.enclosure.link;
				description = filterDescription("<p>" + story.description + "</p>");
			}

			var injectHTML = `<div class="col-md-3 col-sm-6 col-padding animate-box news-article" data-animate-effect="fadeInLeft" style="opacity:1">`;
			injectHTML +=	`<div class="blog-entry">`;
			injectHTML +=		`<a href="${story.link}" class="blog-img" target="_blank"><img src="${thumbnail}"></a>`;
			injectHTML +=		`<div class="desc">`;
			injectHTML +=			`<h3><a href="${story.link}" target="_blank">${story.title}</a></h3>`;
			injectHTML +=			`<span><small>${story.author}</small> ${(story.author != "")?("/"):("")} <small>${moment(story.pubDate).format("MMMM D, h:mm a").toString()}</small></span>`;
			injectHTML +=			description;
			injectHTML +=			`<br><a href="${story.link}" class="lead" target="_blank">Read More <i class="icon-arrow-right3"></i></a>`;
			injectHTML +=		`</div>`;
			injectHTML +=	`</div>`;
			injectHTML += `</div>`;

			$("#news-bin").append(injectHTML);

			written.push(story.link);
		}
	});

	if(Mobile)
	{
		if($(window).width() > 450)
			$('.news-article').css("min-width","50%");

		else
			$('.news-article').css("min-width","100%");
	}

	//$("#news-sorting-button").css("display","unset");
}

function filterDescription(desc)
{
	if(desc == null || desc == undefined) return desc;
	var temp = desc;
	while(temp.substring(0,3) == "<p>")
	{
		temp = desc.substring(3, desc.length-5);
	}
	if(temp.length > 250)
		temp = temp.substring(0,300) + "...";
	//console.log(temp);
	return temp;
}

function SortNews(type)
{
	SortingNews = type;
	loadNews();
	$("#news-sorting-button .btn").html(type);
}