    
function userid_cookie(){
   var cookiearray = document.cookie.split(";")

   for(var i = 0; i < cookiearray.length; i++){
       console.log(cookiearray[i])
        var [name, value] = cookiearray[i].split('=')
        console.log(name,value)
        if (name.trim() === "user_id"){
            return value.trim()
        }
   }
        
}//end function userid_cookie

//make function for bargraph

function barcolor(variable){
    if (variable === 'Accepted'){
        return "#006666"
    } else{
        return "#800000"
    }

}

// BUILDING THE BAR 

//set initial parameters (This will be size of entire svg)
var svgWidth = 900;
var svgHeight = 500;


var margin = {
  top: 40,
  right: 40,
  bottom: 100,
  left: 100
};

//create width and height for axis that will allow space from sides of svg
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


var bar_svg = d3.select("#bar1-div")
    .append("svg")
    .attr("viewBox", "0 0 900 500")
    .classed("svg-content-responsive", true)
    .attr("id","chart-svg")

var scatter_svg = d3.select("#scatter1-div")
    .append("svg")
    .attr("viewBox", "0 0 900 500")
    .classed("svg-content-responsive", true)
    .attr("id","chart-svg")


//this will create and update the bar graph
function updatebar(data, user_data){

    //the data coming in is an array of dictionaries from bar_purpose

    //remove the previous contents of the svg each time this is run
    bar_svg.selectAll("*").remove();

    // console.log('user data', user_data)

    //look at data coming in
    // console.log('bardata', data)
    // console.log('height',height)
    // console.log('Categories',data[0].Category)

    var barGroup = bar_svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var x0  = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
    var x1  = d3.scaleBand().padding(0.05);
    var y   = d3.scaleLinear().rangeRound([height, 0]);

    var xAxis = d3.axisBottom().scale(x0).tickValues(data.map(d=>d.Category));
    var yAxis = d3.axisLeft().scale(y);

    var categoriesNames = data.map(function(d) { return d.Category; });
    var valueNames = data[0].Value.map(function(d) { return d.granted; });

    x0.domain(categoriesNames);
    x1.domain(valueNames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(Category) { return d3.max(Category.Value, function(d) { return d.value; }); })]);

    barGroup.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    barGroup.append("g")
        .attr("class", "yaxis")
        .style('opacity','0')
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style('font-weight','bold')
            .text("Value");
            

    barGroup.select('.yaxis').transition().duration(200).delay(900).style('opacity','1');
    
    barGroup.select(".xaxis")
        .style("font-size","15px");
    
    barGroup.select(".yaxis")
        .style("font-size","15px");
    

    var ylabel = barGroup.append("g")
            .attr("transform", `translate(-80,${height/2})`);
    
    ylabel.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", -20)
        .text("Frequency");

    var xlabel = barGroup.append("g")
        .attr("transform", `translate(${width/2},${height})`);

    xlabel.append("text")
        .attr("y", 40)
        .attr("x", -70)
        .text("Category");



    var slice = barGroup.selectAll(".slice")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.Category) + ",0)"; });

    slice.selectAll("rect")
        .data(function(d) { return d.Value; })
        .enter().append("rect")
        .attr("width", x1.bandwidth())
        .attr("x", function(d) { return x1(d.granted); })
        .style("fill", function(d) { return barcolor(d.granted) })
        .attr("y", function(d) { return y(0); })
        .attr("height", function(d) { return height - y(0); })
        .on("mouseover", function(d) {
            d3.select(this).style("fill", d3.rgb(barcolor(d.granted)).darker(2));
        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill", barcolor(d.granted));
        });
    
    slice.selectAll("rect")
        .transition()
        .delay(function (d) {return Math.random()*1000;})
        .duration(1000)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });


    //Legend
    var legend = barGroup.selectAll(".legend")
        .data(data[0].Value.map(function(d) { return d.granted; }).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
        .style("opacity","0");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return barcolor(d); });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {return d; });

    legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");
    

}

//function for simple barchart

function updatesimplebar(data){

    bar_svg.selectAll("*").remove();

    var barGroup = bar_svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Configure a band scale for the horizontal axis with a padding of 0.1 (10%)
    var xBandScale = d3.scaleBand()
        .domain(data.map(d => d.group))
        .range([0, width])
        .padding(0.1);

    // Create a linear scale for the vertical axis.
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height, 0]);

    
    // Create two new functions passing our scales in as arguments
    // These will be used to create the chart's axes
    var bottomAxis = d3.axisBottom(xBandScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    barGroup.append("g")
        .call(leftAxis);

    barGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    barGroup.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xBandScale(d.group))
        .attr("y", d => yLinearScale(d.value))
        .attr("width", xBandScale.bandwidth())
        .attr("height", d => height - yLinearScale(d.value));

}

/// functions for updatescatter

function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]), d3.max(data, d => d[chosenXAxis])])
        .range([0, width]);
    return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.max(data, d => d[chosenYAxis]), d3.min(data, d => d[chosenYAxis])])
        .range([0, (height)]);
    
    return yLinearScale;
    
}//end function yScale

// function used for updating xAxis var upon click on axis label
function renderXAxes(xLinearScale, xAxis) {
    var bottomAxis = d3.axisBottom(xLinearScale);
    
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis; //returns the newly formatted x axis
}//end function renderXAxis

// function used for updating xAxis var upon click on axis label
function renderYAxes(yLinearScale, yAxis) {
    var leftAxis = d3.axisLeft(yLinearScale);
    
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis; //returns the newly formatted y axis
}// end function renderYAxes

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis) {
  
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
      
    return circlesGroup;
  
}//end function renderCircles

function renderCircleLabels(circlesLable, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis){
    circlesLable.transition()
        .duration(1000)
        .attr("x", d => xLinearScale(d[chosenXAxis])-10)
        .attr("y", d => yLinearScale(d[chosenYAxis])+5)
      
    return circlesLable;
}//end function renderCircleLabels

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
      
    var toolTip = d3.tip()
        .attr("class", "toolTip") //made capital T to distinguish from map tooltip
        .html(function(d) {
            return (`${chosenXAxis}: ${d[chosenXAxis]}<br> ${chosenYAxis}: ${d[chosenYAxis]}`);
        });
    
    circlesGroup.call(toolTip);
    
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
      
    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });
    
    return circlesGroup;
}//end function update tooltip

// Initial Param
  
var chosenYAxis = "credit_limit";
var chosenXAxis = "checking";

function updatescatter(data, user_id){

    var chartGroup = scatter_svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);

    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .style("font", "14px times")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis",true)
        .style("font", "14px times")
        .call(leftAxis);
    
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 8)
        .attr("fill", function(d) { 
            if(d.granted === 1){return "#008080"}
            else {return "#800000"}
        })
        .attr("stroke", "black")
        .attr("opacity", ".5")

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var checkingLabel = xlabelsGroup.append("text")
        .attr("x", -60)
        .attr("y", 20)
        .attr("value", "checking") // value to grab for event listener
        .classed("active", true)
        .classed("inactive", false)
        .text("Checking ($)");
    
    var savingsLabel = xlabelsGroup.append("text")
        .attr("x", -60)
        .attr("y", 40)
        .attr("value", "savings") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)
        .text("Savings ($)");
    
    var usedLabel = xlabelsGroup.append("text")
        .attr("x", -60)
        .attr("y", 60)
        .attr("value", "limit_used") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)
        .text("Credit Used (%)");
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(-80,${height/2})`);
    
    
    var limitLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30)
        .attr("x", -70)
        .attr("value", "credit_limit") // value to grab for event listener
        .classed("active", true)
        .classed("inactive", false)
        .text("Credit Limit");
    

    // updateToolTip 
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // axis labels event listener
    xlabelsGroup.selectAll("text").on("click", function() {
        // get value of selection
        var valueX = d3.select(this).attr("value");

        if (valueX !== chosenXAxis) { 
            // replaces chosenXAxis with value
            chosenXAxis = valueX;

            console.log(`chosenX: ${chosenXAxis}`)
            console.log(`chosenY: ${chosenYAxis}`)

            // updates x scale for new data
            xLinearScale = xScale(data, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            //circlesLable = renderCircleLabels(circlesLable, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "checking") {
                checkingLabel
                    .classed("active", true)
                    .classed("inactive", false);
                savingsLabel
                    .classed("active", false)
                    .classed("inactive", true);
                usedLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            if (chosenXAxis === "savings"){
                checkingLabel
                    .classed("active", false)
                    .classed("inactive", true);
                savingsLabel
                    .classed("active", true)
                    .classed("inactive", false);
                usedLabel
                    .classed("active", false)
                    .classed("inactive", true);

            } if (chosenXAxis === "limit_used"){
                checkingLabel
                    .classed("active", false)
                    .classed("inactive", true);
                savingsLabel
                    .classed("active", false)
                    .classed("inactive", true);
                usedLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }

        }// end of if statement

    })// end of x label onclick function


}

function getUserdata(){
    var user_id = userid_cookie()

    return d3.json(`/api/user_data/${user_id}`)
    
}


//PUT ALL GRAPHS TOGETHER AND MAKE API CALL

function getData(){
    d3.json("/api/data").then((json) => {

        //create the datasets that will be used for different charts

        
        df_purpose = json.bar_purpose
        df_firstloan = json.bar_firstloan
        df_salary = json.bar_salary
        df_scatter = json.scatter_credit

        getUserdata().then(my_userdata => {
            
            updatebar(df_purpose, my_userdata)
            updatescatter(df_scatter)
            updatesimplebar(df_salary)


        })


    })// end d3 call

}// end function getData

getData()

