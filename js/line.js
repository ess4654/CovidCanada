function findLineByLeastSquares(values_x, values_y) {
    while(values_x.length > 0 && values_y[0] == 0)
    {
        console.log("pop");
        values_x.shift();
        values_y.shift();
    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;

    /*
     * We will make the x and y result line now
     */
    var result_values_x = [];
    var result_values_y = [];

    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }


    //R2 = Math.pow((count*sum_xy - sum_x*sum_y)/Math.sqrt((count*sum_xx-sum_x*sum_x)*(count*sum_yy-sum_y*sum_y)),2);
    //return [result_values_x, result_values_y];
    return [m, b];
}

function graphify(data)
{
    var keys = Object.keys(data);
    var X = [];
    var Y = [];
    for(var start = 1; start<keys.length; start++)
    {
        X.push(start);
        Y.push(data[keys[start-1]]);
    }
    return [X, Y];
}

function addFuture(data, line, future)
{
    var slope = line[0];
    var b = line[1];
    var time = future[0];
    var timeframe = future[1];
    var keys = Object.keys(data);
    var X = parseInt(keys.length);
    var start = keys[keys.length-1];
    start = moment(start);
    var weeksModifier = 1; //Day
    if(timeframe == "Week")
        weeksModifier = 7;
    if(timeframe == "Month")
        weeksModifier = 7 * 4;
    if(timeframe == "Year")
        weeksModifier = 7 * 52;

    var mod = 0;
    for(var i = 0; i<(time * weeksModifier) + ((timeframe=="Month")?(3*time):(0)); i++)
    {
        start = start.add(1, "Day");
        var pos = start.format("MMMM D, YYYY").toString();
        var num = Math.round(X * parseFloat(slope) + parseFloat(b));
        mod = (num < 0 && mod == 0) ? Math.abs(num):mod;
        data[pos] = num + mod;
        X++;
    }

    return data;
}