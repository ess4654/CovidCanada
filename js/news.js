var provinceByCode = {
	"AB":{"CBC":["canada-calgary", "canada-edmonton"]},
	"BC":{"CBC":["canada-britishcolumbia"]},
	"SK":{"CBC":["canada-saskatchewan"]},
	"MB":{"CBC":["canada-manitoba"]},
	"ON":{"CBC":["canada-toronto", "canada-kitchenerwaterloo", "canada-sudbury"]},
	"QC":{"CBC":["canada-montreal"]},
	"NB":{"CBC":["canada-newbrunswick"]},
	"PE":{"CBC":["canada-pei"]},
	"NS":{"CBC":["canada-novascotia"]},
	"NF":{"CBC":["canada-newfoundland"]},
	"NV":{"CBC":["canada-north"]},
	"NT":{"CBC":["canada-north"]},
	"YU":{"CBC":["canada-north"]},
	"CA":{"CBC":["canada", "health", "topstories"]}
};

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
	'cruise ship', 'Cruise Ship', 'CRUISE SHIP',
	'WHO', 'World Health Organization', 'world health organization',
	'SARS', 'MERS',
	'wuhan', 'Wuhan', 'WUHAN',
	'bats', 'BATS', 'Bats',
	'Public Health', 'public health', 'PUBLIC HEALTH',
	'pandemic', 'PANDEMIC', 'Pandemic',
	'self-isolate', 'SELF-ISOLATE', 'Self-Isolate',
	'14 DAYS', '14 days', '14 Days',
	'containment area', 'Containment Area', 'CONTAINMENT AREA'
];

var STORIES;
var RSSRequest;
var RSSRecieved;

function GetNewsByRegion(code)
{
	STORIES = new Set();
	RSSRecieved = 0;
	var CBCNews = provinceByCode[code]["CBC"];
	RSSRequest = CBCNews.length;
	for(var i = 0; i<CBCNews.length; i++)
		CBCNewsGet(CBCNews[i], "CBCNewsCallback");
}

function CBCNewsCallback(response)
{
	var stories = response.items;
	var filtered_stories = [];
	//console.log(stories);
	for(var i = 0; i<stories.length; i++)
	{
		if(!(contains(stories[i].title, filtered_words) === false))
			STORIES.add(stories[i]);
	}
	//console.log(STORIES);
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

function loadNews()
{
	//console.log(STORIES);
	//console.log('Sucess');
	var written = [];

	STORIES.forEach(function(story) {
		if(!written.includes(story.link)) {
			var descriptionStart = story.description.indexOf("<p>");

			var description = story.description.substr(descriptionStart, story.description.length-descriptionStart);
			var injectHTML = `<div class="col-md-3 col-sm-6 col-padding animate-box" data-animate-effect="fadeInLeft" style="opacity:1">`;
			injectHTML +=	`<div class="blog-entry">`;
			injectHTML +=		`<a href="${story.link}" class="blog-img" target="_blank"><img src="${story.thumbnail}"></a>`;
			injectHTML +=		`<div class="desc">`;
			injectHTML +=			`<h3><a href="${story.link}" target="_blank">${story.title}</a></h3>`;
			injectHTML +=			`<span><small>${story.author}</small> / <small>${moment(story.pubDate).format("MMMM D, h:mm a").toString()}</small></span>`;
			injectHTML +=			description;
			injectHTML +=			`<a href="${story.link}" class="lead" target="_blank">Read More <i class="icon-arrow-right3"></i></a>`;
			injectHTML +=		`</div>`;
			injectHTML +=	`</div>`;
			injectHTML += `</div>`;

			$("#news-bin").append(injectHTML);

			written.push(story.link);
		}
	});
}