var caseData;
var DATA;
var T;
var FUTURE;
var FOCUS = 1;
var TIMEFRAME = 0;
var ProvinceNames = {
	"AB":"Alberta",
	"BC":"British Columbia",
	"SK":"Saskatchewan",
	"MB":"Manitoba",
	"ON":"Ontario",
	"QC":"Quebec",
	"NB":"New Brunswick",
	"PE":"Prince Edward Island",
	"NS":"Nova Scotia",
	"NL":"New Found Land & Labrador",
	"NU":"Nunavut",
	"NT":"Northwest Territories",
	"YT":"Yukon",
	"CA":"Canada"
};


function refreshGraph(code, callback)
{
	if(caseData == null) return;
	switch(code)
	{
		case "CA":
			diplayGraph(caseData);
			break;
		default:
			diplayGraph(getDataFromCode(code));
			break;
	}

	if(callback != null)
		callback();
}

function getDataFromCode(code)
{
	for(var i = 0; i<caseData.length; i++)
	{
		if(caseData[i].code == code) return {
			"0" : caseData[i],
			"length" : 1
		}
	}
	return {
		"code": code,
		"length" : 0
	};
}

function diplayGraph(data)
{
	if(data.length == 0)
	{
		$("#pie-chart-body").html('<div style="color: white;font-size: 25px;">There are no confirmed cases in '+ProvinceNames[data.code]+'</div>');
		$("#bar-chart-body").html('<div style="color: white;font-size: 25px;">There are no confirmed cases in '+ProvinceNames[data.code]+'</div>');
		$("#line-chart-body").html('<div style="color: white;font-size: 25px;">There are no confirmed cases in '+ProvinceNames[data.code]+'</div>');

		$($(".flex-control-nav.flex-control-paging a")[0]).css("display", "none");
		$($(".flex-control-nav.flex-control-paging a")[1]).css("display", "none");
		$($(".flex-control-nav.flex-control-paging a")[2]).css("display", "none");
		
		$(".right-panel").css("display","none");

		return;
	}

	$(".right-panel").css("display","initial");

	//Set the view to the first line chart
	$(".flex-control-nav.flex-control-paging a")[1].click();
	
	DATA = data;
	$(".chart-controls li.active").removeClass("active");
	$($(".chart-controls li")[1]).addClass("active");

	if(TIMEFRAME == 0) {
		$(".chart-controls li.active").removeClass("active");
		$($(".chart-controls li")[1]).addClass("active");
		T = 0;
		createChart(data, 0, FUTURE);
	} else
	{
		$(".chart-controls li.active").removeClass("active");
		$($(".chart-controls li")[0]).addClass("active");
		T = "day";
		createChart(data, "day", FUTURE);
	}
	
}

function parseKeypair(data)
{
	var keypair = {};
	for(var i = 0; i<data.length; i++)
	{
		var keys = Object.keys(data[i].cases);
		for(var j = 0; j<keys.length; j++)
		{
			var date = keys[j];
			if(keypair[date] == null)
				keypair[date] = data[i].cases[date];
			else
				keypair[date] += data[i].cases[date];
		}
	}
	return keypair;
}

function colorCorrectBG(color_array, C)
{
	for(var x = color_array.length-C; x<color_array.length; x++)
		color_array[x] = 'rgba(200, 200, 200, 0.2)';
	return color_array;
}

function colorCorrectOutline(color_array, C)
{
	for(var x = color_array.length-C; x<color_array.length; x++)
		color_array[x] = 'rgba(200, 200, 200, 1)';
	return color_array;
}

function OutlineColor(array, alternate)
{
	borderColor = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    var returnColor = [];
    for(var i = 0; i<array.length; i++)
    {
    	if(alternate == null)
    		returnColor.push(borderColor[0]);
    	else
    		returnColor.push(borderColor[i%borderColor.length]);
    }
    return returnColor;
}

function BGColor(array, alternate)
{
	backgroundColor = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];
    var returnColor = [];
    for(var i = 0; i<array.length; i++)
    {
    	if(alternate == null)
    		returnColor.push(backgroundColor[0]);
    	else
    		returnColor.push(backgroundColor[i%backgroundColor.length]);
    }
    return returnColor;
}

function cumulativeAdd(data)
{
	var keys = Object.keys(data);
	for(var i = 1; i<keys.length; i++)
	{
		data[keys[i]] += data[keys[i-1]];
	}
	return data;
}

function monthify(data, max)
{
	var keys = Object.keys(data);
	var temp = {};
	for(var i = 0; i<keys.length; i++)
	{
		var date = new Date(keys[i]).toLocaleDateString('en-US', {month:'long'});
		if(temp[date] == null)
			temp[date] = data[keys[i]];
		else {
			if(max)
				temp[date] = Math.max(data[keys[i]], temp[date]);
			else
				temp[date] += data[keys[i]];
		}
	}
	return temp;
}

function dayify(data)
{
	var keys = Object.keys(data);
	var temp = {};
	var pos = keys[0];
	
	for(var x = 0; x<(moment(moment(keys[keys.length-1]).diff(moment(keys[0]), "days"))+1); x++)
	{
		if(data[pos] == undefined)
			temp[pos] = 0;
		else
			temp[pos] = data[pos];
		pos = moment(pos).add(1, "Day").format("MMMM D, YYYY").toString();
	}
	return temp;
}

function weekify(data, sum)
{
	var keys = Object.keys(data);
	var temp = {};
	var pos = keys[0];
	
	for(var x = 0; x<(moment(moment(keys[keys.length-1]).diff(moment(keys[0]), "days"))+1); x++)
	{
		if(data[pos] == undefined)
			temp[pos] = 0;
		else
			temp[pos] = data[pos];
		pos = moment(pos).add(1, "Day").format("MMMM D, YYYY").toString();
	}

	keys = Object.keys(temp);
	var weekly = {};
	for(var i = 0; i<keys.length; i++)
	{
		var end = parseInt(i/7)*7 + 6;
		end = (end >= keys.length) ? (keys.length-1):end;
		var start = new Date(keys[parseInt(i/7)*7]).toLocaleDateString('en-US', {month:'short', day:'numeric'});
		var displayEnd = new Date(keys[end]).toLocaleDateString('en-US', {month:'short', day:'numeric'});
		if(weekly[`${start} - ${displayEnd}`] == null) {
			if(data[keys[i]] == null)
				weekly[`${start} - ${displayEnd}`] = 0;
			else {
				weekly[`${start} - ${displayEnd}`] = Math.max(data[keys[i]], -1);
			}
		}
		else {
			if(data[keys[i]] == null)
				weekly[`${start} - ${displayEnd}`] += 0;
			else {
				if(sum)
					weekly[`${start} - ${displayEnd}`] += data[keys[i]];
				else
					weekly[`${start} - ${displayEnd}`] = Math.max(data[keys[i]], weekly[`${start} - ${displayEnd}`]);
			}
		}
	}

	return weekly;
}

function createChart(data, time, future)
{
	$("#pie-chart-body").html('<canvas class="chart" id="pie-chart" width="100%" height="100%"></canvas>');
	$("#bar-chart-body").html('<canvas class="chart" id="bar-chart" width="100%" height="100%"></canvas>');
	$("#line-chart-body").html('<canvas class="chart" id="line-chart" width="100%" height="100%"></canvas>');

	$($(".flex-control-nav.flex-control-paging a")[0]).css("display", "inherit");
	$($(".flex-control-nav.flex-control-paging a")[1]).css("display", "inherit");
	$($(".flex-control-nav.flex-control-paging a")[2]).css("display", "inherit");

	var timeDisplay = (time == 0) ? "Total":"Per Day";
	var Location = (data.length > 1) ? "Canada":ProvinceNames[data[0].code];
	data = parseKeypair(data);
	var OGLength = Object.keys(data).length;

	var C = 0;
	if(future != null)
	{
		var DataCopy = dayify(data);
		var A = Object.keys(data).length;
		var coordinates = graphify(DataCopy);
		var line = findLineByLeastSquares(coordinates[0], coordinates[1]);
		data = addFuture(data, line,[future[0],future[1]]);
		var B = Object.keys(data).length;
		C = B-A;
	}
	var data2 = data;

	var totalCountCases;
	if(time == 0)
	{
		data = cumulativeAdd(data);
		var key = Object.keys(data);
		totalCountCases = data[key[key.length-1]];
		$(".total-cases").html(`Total ${(future!=null)?("Estimated Cases "):("")}Cases${(future!=null)?(` in ${future[0]} ${future[1]}${(future[0]>1)?("s"):("")} `):("")}: ${totalCountCases}`);
	}
	
	var dates = Object.keys(data);
	$(".last-updated").html("Last Updated: "+dates[OGLength-1]);
	var val = Object.values(data);
	var bg_color = BGColor(dates);
	var outline_color = OutlineColor(dates);
	if(future != null)
	{
		bg_color = colorCorrectBG(bg_color, C);
		outline_color = colorCorrectOutline(outline_color, C);
	}

	//Create Bar Chart
	var ctxBar = document.getElementById('bar-chart').getContext('2d');
	var chart = new Chart(ctxBar, {
	    type: 'bar',
	    data: {
	        labels: dates,
	        datasets: [{
	            label: '# of Confirmed Cases '+timeDisplay+' in ' + Location,
	            data: val,
	            backgroundColor: bg_color,
	            borderColor: outline_color,
	            borderWidth: 1
	        }]
	    },
	    options: {
	    	legend: {
	            labels: {
	                fontColor: 'rgba(225, 225, 225, 1.0)',
	                fontSize: 18
	            }
	        },
	        scales: {
	            yAxes: [{
	            	gridLines: {
					  display: true ,
					  color: "rgba(50, 50, 50, 0.5)"
					},
	                ticks: {
	                	precision: 0,
	                    beginAtZero: true,
	                    fontColor: 'rgba(225, 225, 225, 1.0)',
	                    fontSize: 16
	                }
	            }],
	            xAxes: [{
	            	gridLines: {
					  display: true ,
					  color: "rgba(50, 50, 50, 0.5)"
					},
	                ticks: {
	                    fontColor: 'rgba(225, 225, 225, 1.0)',
	                    fontSize: 14,
	                    callback: function(value) { 
					        return new Date(value).toLocaleDateString('en-US', {month:'short', day:'numeric'})
					    }
	                }
	            }]
	        }
	    }
	});

	//Create Line Chart
	var ctxLine = document.getElementById('line-chart').getContext('2d');
	var chart = new Chart(ctxLine, {
	    type: 'line',
	    data: {
	        labels: dates,
	        datasets: [{
	            label: '# of Confirmed Cases '+timeDisplay+' in ' + Location,
	            data: val,
	            backgroundColor: bg_color,
	            borderColor: outline_color,
	            borderWidth: 1
	        }]
	    },
	    options: {
	    	legend: {
	            labels: {
	                fontColor: 'rgba(225, 225, 225, 0.25)',
	                fontSize: 18
	            }
	        },
	        scales: {
	            yAxes: [{
	            	gridLines: {
					  display: true ,
					  color: "rgba(50, 50, 50, 0.5)"
					},
	                ticks: {
	                	precision: 0,
	                    beginAtZero: true,
	                    fontColor: 'rgba(225, 225, 225, 1.0)',
	                    fontSize: 16
	                }
	            }],
	            xAxes: [{
	            	gridLines: {
					  display: true ,
					  color: "rgba(50, 50, 50, 0.5)"
					},
	                ticks: {
	                    fontColor: 'rgba(225, 225, 225, 1.0)',
	                    fontSize: 14,
	                    callback: function(value) { 
					        return new Date(value).toLocaleDateString('en-US', {month:'short', day:'numeric'})
					    }
	                }
	            }]
	        }
	    }
	});

	//Create Pie Chart
	data = weekify(data, (time == "day"));
	dates = Object.keys(data);
	val = Object.values(data);
	bg_color = BGColor(dates, true);
	outline_color = OutlineColor(dates, true);

	if(future != null)
	{
		bg_color = colorCorrectBG(bg_color, parseInt(C/7));
		outline_color = colorCorrectOutline(outline_color, parseInt(C/7));
	}

	var ctxPie = document.getElementById('pie-chart').getContext('2d');
	var chart = new Chart(ctxPie, {
	    type: 'pie',
	    data: {
	        labels: dates,
	        datasets: [{
	            label: '# of Confirmed Cases Per Week in ' + Location,
	            data: val,
	            backgroundColor: bg_color,
	            borderColor: outline_color,
	            borderWidth: 1
	        }]
	    },
	    options: {
	    	title: {
	            display: true,
	            text: '# of Confirmed Cases Per Week in ' + Location,
	            fontSize: 18,
	            fontColor: 'rgba(225, 225, 225, 1.0)'
	        },
	    	legend: {
	            labels: {
	                fontColor: 'rgba(225, 225, 225, 0.8)',
	                fontSize: 18
	            }
	        },
	        scales: {
	            yAxes: [{
	            	display: false,
	            	gridLines: {
					  display: false
					}
	            }],
	            xAxes: [{
	            	display: false,
	            	gridLines: {
					  display: false
					},
					ticks: {
						callback: function(value) { 
					        return new Date(value).toLocaleDateString('en-US', {month:'short', day:'numeric'})
					    }
					}
	            }]
	        }
	    }
	});

	//Add total count statistic
	if(time == 'day') {
		totalCountCases = cumulativeAdd(data2);
		var key2 = Object.keys(totalCountCases);
		totalCountCases = totalCountCases[key2[key2.length-1]];
		$(".total-cases").html(`Total ${(future!=null)?("Estimated Cases "):("")}Cases${(future!=null)?(` in ${future[0]} ${future[1]}${(future[0]>1)?("s"):("")} `):("")}: ${totalCountCases}`);
	}

	if(future == null && TIMEFRAME == time) {
		setTimeout(function() {
			if(FOCUS == 0)
			{
				$($(".chart-controls li")[0]).html("Per Week");
			} else {
				$($(".chart-controls li")[0]).html("Per Day");
			}
			$($(".flex-control-nav.flex-control-paging a")[FOCUS]).click();
		}, 500);
	}
	//TIMEFRAME = time;
}

function updateGraph(data)
{
	caseData = data;
}

function swapview(pos)
{
	if(pos == 0)
	{
		$($(".chart-controls li")[0]).html("Per Week");
	} else {
		$($(".chart-controls li")[0]).html("Per Day");
	}
	$($(".flex-control-nav.flex-control-paging a")[pos]).click();
	FOCUS = pos;
}

function perDayGraph()
{
	$(".chart-controls li.active").removeClass("active");
	$($(".chart-controls li")[0]).addClass("active");
	T = "day";
	TIMEFRAME = T;
	createChart(DATA, "day", FUTURE);
}

function totalGraph()
{
	$(".chart-controls li.active").removeClass("active");
	$($(".chart-controls li")[1]).addClass("active");
	T = 0;
	TIMEFRAME = T;
	createChart(DATA, 0, FUTURE);
}

function Estimate(time)
{
	if(time == "None")
	{
		$(".projection-btn .btn").html(time);
		FUTURE = null;
		diplayGraph(DATA);
		return;
	}

	var future = time.split("-");
	var displayTime = future;
	displayTime = `${displayTime[0]} ${displayTime[1]}${(displayTime[0] > 1)?"s":""}`;
	$(".projection-btn .btn").html(displayTime);

	FUTURE = future;
	createChart(DATA, T, future);
}