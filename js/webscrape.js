var data;
var CODE;
var provinceList = ["BC", "AB", "SK", "MB", "ON", "QC", "NB", "PEI", "NS", "NF", "NV", "NT", "YU"];

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
		refreshGraph(code);
}

var WikiResponse = function (response) {
    data = parseData(response, function(data){
    	updateGraph(data);
    	refreshGraph(CODE);
    });
};

function parseData(data, callback)
{
	data = data.parse.wikitext["*"].split("\n");
	var result = getProvinces(data);
	var dates = getDates(data);
	result = getCasesPerDay(result, dates, data);
	if(callback != null)
		callback(result);
}

function contains(string, find)
{
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
			if(data[dates[i] + x][0] != '|')
			{
				skip++;
				continue;
			}
			var n = data[dates[i] + x].split(" ");
			var z;
			if(n.length > 1) {
				var m = parseInt(n[1]);
				if(isNaN(m)) {
					z = 0;
				}
				else {
					z = m;
				}
			}
			else {
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
		if(contains(data[i], [", 2020"]) === 0)
			ret.push(i);
	}
	return ret;
}

function getProvinces(data)
{
	var list = {};
	pos = 0;
	//find start of province list
	while(!contains(data[pos], provinceList)) {
		pos++;
	}
	pos--;
	var num = 0;
	while(data[pos] != "")
	{
		var p = contains(data[pos], provinceList);
		if(p === 0 || p) {
			list[num] = {"code":provinceList[p]};
			num++;
		}		
		pos++;
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