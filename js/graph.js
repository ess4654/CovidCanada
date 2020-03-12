var caseData;

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
	console.log(code);
	for(var i = 0; i<caseData.length; i++)
	{
		if(caseData[i].code == code) return {
			"0" : caseData[i],
			"length" : 1
		}
	}
	return {"length" : 0};
}

function diplayGraph(data)
{
	if(data.length == 0)
	{
		
		return;
	}
	//console.log(data);
}

function updateGraph(data)
{
	caseData = data;
}