var caseData;
var DATA;
var ProvinceNames = {
	"AB":"Alberta",
	"BC":"British Columbia",
	"SK":"Saskatchewan",
	"MB":"Manitoba",
	"ON":"Ontario",
	"QC":"Quebec",
	"NB":"New Brunswick",
	"PEI":"Prince Edward Island",
	"NS":"Nova Scotia",
	"NF":"New Found Land & Labrador",
	"NV":"Nunavut",
	"NT":"Northwest Territories",
	"YU":"Yukon"
};


function refreshGraph(code)
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
		
		return;
	}

	//Set the view to the first line chart
	$(".flex-control-nav.flex-control-paging a")[1].click();
	
	DATA = data;
	$(".chart-controls li.active").removeClass("active");
	$($(".chart-controls li")[1]).addClass("active");
	createChart(data, 0);
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
		if(weekly[`${keys[parseInt(i/7)*7]} - ${keys[end]}`] == null) {
			if(data[keys[i]] == null)
				weekly[`${keys[parseInt(i/7)*7]} - ${keys[end]}`] = 0;
			else {
				weekly[`${keys[parseInt(i/7)*7]} - ${keys[end]}`] = Math.max(data[keys[i]], -1);
			}
		}
		else {
			if(data[keys[i]] == null)
				weekly[`${keys[parseInt(i/7)*7]} - ${keys[end]}`] += 0;
			else {
				if(sum)
					weekly[`${keys[parseInt(i/7)*7]} - ${keys[end]}`] += data[keys[i]];
				else
					weekly[`${keys[parseInt(i/7)*7]} - ${keys[end]}`] = Math.max(data[keys[i]], weekly[`${keys[parseInt(i/7)*7]} - ${keys[end]}`]);
			}
		}
	}

	return weekly;
}

function createChart(data, time)
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

	if(time == 0)
	{
		data = cumulativeAdd(data);
	}

	var dates = Object.keys(data);
	$(".last-updated").html("Last Updated: "+dates[dates.length-1]);
	var val = Object.values(data);
	var bg_color = BGColor(dates);
	var outline_color = OutlineColor(dates);

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
	                fontColor: 'rgba(225, 225, 225, 0.2)',
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
	data = weekify(data, ((time == "day")?true:false));
	dates = Object.keys(data);
	val = Object.values(data);
	bg_color = BGColor(dates, true);
	outline_color = OutlineColor(dates, true);
	var ctxPie = document.getElementById('pie-chart').getContext('2d');
	var chart = new Chart(ctxPie, {
	    type: 'pie',
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
	    	title: {
	            display: true,
	            text: '# of Confirmed Cases '+timeDisplay+' in ' + Location,
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
}

function perDayGraph()
{
	$(".chart-controls li.active").removeClass("active");
	$($(".chart-controls li")[0]).addClass("active");
	createChart(DATA, "day");
}

function totalGraph()
{
	$(".chart-controls li.active").removeClass("active");
	$($(".chart-controls li")[1]).addClass("active");
	createChart(DATA, 0);
}