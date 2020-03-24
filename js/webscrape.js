var data;
var CODE;
var provinceList = ["BC", "AB", "SK", "MB", "ON", "QC", "NB", "PE", "NS", "NL", "NU", "NT", "YT"];

function GetLocation(code)
{
	$(".fh5co-active").removeClass("fh5co-active");
	$("#" + code).parent().addClass("fh5co-active");
	GetDataFromLocation(code);
}

function GetDataFromLocation(code)
{
	if(caseData == null) {
		CODE = code;
		WikiGet("action=parse&page=Template:2019–20_coronavirus_pandemic_data/Canada_medical_cases&prop=wikitext&format=json","WikiResponse");
	}
	else
		refreshGraph(code, function(){
		});

	$("#news-bin").html("");
	$("#news-header").html(`News For ${ProvinceNames[code]} Regarding Covid-19`);
	GetNewsByRegion(code);
}

var WikiResponse = function (response) {
    data = parseData(response, function(data){
    	updateGraph(data);
    	refreshGraph(CODE, function() {
    	});
    });
};

function parseData(data, callback)
{
	data = data.parse.wikitext["*"].split("\n");
	var result = getProvinces(data);
	var dates = getDates(data);
	result = getCasesPerDay(result, dates, data);
	if(callback != null && result.length > 0)
		callback(result);
}

function contains(string, find)
{
	if(string == undefined || string == null) return -1;
	for(var i = 0; i<find.length; i++)
	{
		if(string.includes(find[i]))
			return i;
	}
	return false;
}

function formatDate(dateString)
{
	var date = "";
	var count = 0;
	var end, start;
	for(var i = 0; i<dateString.length; i++)
	{
		if(dateString[i] == '|') count++;
		if(count >= 2) {
			start = i + 1;
			break;
		}
	}
	for(var j = start+1; j<dateString.length; j++)
	{
		if(dateString[j] == '}')
		{
			end = j;
			break;
		}
	}
	date = dateString.substr(start, end - start);
	return date;
}

function getCasesPerDay(result, dates, data)
{
	var skip;
	for(var i = 0; i<dates.length; i++)
	{
		skip = 0;
		for(var x = 1; x<=result.length+skip; x++)
		{
			if(data[dates[i] + x] == undefined)
			{
				skip++;
				continue;
			}
			if(data[dates[i] + x][0] != '|')
			{
				skip++;
				continue;
			}
			var n = data[dates[i] + x].split(" ");
			var z;
			if(n.length > 1) {
				var m = parseInt(n[1].replace("−", "-"));
				if(isNaN(m)) {
					if(contains(n[0], ["<ref"]) === 0)
					{
						var a = 1;
						for(var o = 1; o<n[0].length; o++)
						{
							if(n[0][o] == '<')
							{
								a = o;
								break;
							}
						}
						m = parseInt(n[0].substring(1, a).replace("−", "-"));
						if(isNaN(m)) {
							z = 0;
						}
						else {
							z = m;
						}
					} else {
						z = 0;
					}
				}
				else {
					z = m;
				}
			}
			else {
				if(n[0].length > 1)
				{
					var m = parseInt(n[0].substr(1, n[0].length-1).replace("−", "-"));
					if(isNaN(m)) {
						if(contains(n[0], ["<ref"]) === 0)
						{
							var a = 1;
							for(var o = 1; o<n[0].length; o++)
							{
								if(n[0][o] == '<')
								{
									a = o;
									break;
								}
							}
							m = parseInt(n[0].substring(1, a).replace("−", "-"));
							if(isNaN(m)) {
								z = 0;
							}
							else {
								z = m;
							}
						} else {
							z = 0;
						}
					}
					else {
						z = m;
					}
				} else
					z = 0;
			}
			
			var date = formatDate(data[dates[i]]);
			if(result[x-1-skip]["cases"] == null) {
				result[x-1-skip]["cases"] = {};
			}
			result[x-1-skip]["cases"][date] = z;
		}
	}
	return result;
}

function getDates(data)
{
	var ret = [];
	for(var i = 10; i<data.length; i++){
		//console.log(contains(data[i], [", 2020"]));
		if(contains(data[i], [", 2020"]) === 0 && contains(data[i], ["{{abbr"]) === 0)
			ret.push(i);
	}
	return ret;
}

function getProvinces(data)
{
	var list = {};
	pos = 0;
	//find start of province list
	for(var y = 0; y<data.length; y++) {
		if(contains(data[pos], provinceList)) break;
		pos++;
	}
	pos--;
	var num = 0;
	for(var X = pos; X<data.length; X++)
	{
		if(data[X] == "" || data[X] == "|-") break;
		var p = contains(data[X], provinceList);
		if(p === 0 || p) {
			if(list[num] == null)
				list[num] = {"code":provinceList[p]};
			num++;
		}		
	}
	list["length"] = num;
	return list;
}

function WikiGet(action, callback)
{
	var url_request = "https://en.wikipedia.org/w/api.php?" + action + "&callback=" + callback;

	var scriptTag = document.createElement("script"); // Dynamically create a "script" tag
	scriptTag.src = url_request; // Point to the query string
	$("#WikiGet").html(scriptTag);
}