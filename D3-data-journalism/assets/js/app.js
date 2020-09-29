// STEP ONE
// Create and format the SVG
var svgWidth = 960;
var svgHeight = 500;

// Set margins in svg
var margin = {
    top: 20,
    right: 40,
    bottom: 150,
    left: 100
  };

// Calculate chart height and width
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Append an SVG group that will hold our chart with the appropriate height and width
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group and shift it by the set margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// STEP TWO
// Define functions to bind data to axes and to format axes scales

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(dataDB, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(dataDB, d => d[chosenXAxis]) * 0.8,
        d3.max(dataDB, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(dataDB, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(dataDB, d => d[chosenYAxis]) * 0.8,
        d3.max(dataDB, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// Function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// STEP THREE
// Define functions to update circles and text in the circles

// Function used for updating circles group with a transition to new circles when new x/y axis is selected
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}  

// Function used for updating text with a transition to new circles when new x/y axis is selected
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
}

// STEP FOUR
// Define functions used for updating circles group with new tooltip


function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // Event select x label
    var xLabel;
  
    if (chosenXAxis === "poverty") {
      xLabel = "In Poverty:";
    }
    else if (chosenXAxis === "age") {
      xLabel = "Age:";
    }
    else {
      xLabel = "Household Income:";
    }    

    // Event select y label
    var yLabel;
  
    if (chosenYAxis === "healthcare") {
      yLabel = "No Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
      yLabel = "Are Smokers:";
    }
    else {
      yLabel = "Are Obese:";
    }  
    
    // Create tooltip by incorporating D3-tip.js plugin
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, -8])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    // Create events for tooltip
    circlesGroup.on("mouseover", toolTip.show)
      // onmouseout event
      .on("mouseout", toolTip.hide);
  
    return circlesGroup;
}

// STEP FIVE
// Get data and execute all functions to draw chart

// Use D3 to read in data.csv
var pathSamples = `assets/data/data.csv`;
var dataDB;

// Fetch csv file using D3 to test in local machine
d3.csv(pathSamples)
    .then(data => {dataDB = data

    console.log(dataDB);
    console.log(dataDB[0].healthcare);
    
    // Parse data
    dataDB.forEach(d => {
        d.obesity = +d.obesity;
        d.income = +d.income;
        d.smokes = +d.smokes;
        d.age = +d.age;
        d.healthcare = +d.healthcare;
        d.poverty = +d.poverty;
    })

    console.log(dataDB);

    // xLinearScale function above csv import
    var xLinearScale = xScale(dataDB, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(dataDB, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(dataDB)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "orange")
        .attr("opacity", ".5");

    // Append initial text
    var textGroup = chartGroup.selectAll(".textFace")
        .data(dataDB)
        .enter()
        .append("text")
        .classed("textFace", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .attr("font-color", "black")
        .text(function(d) {return d.abbr});

    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("textLabel", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .classed("textLabel", true)
        .text("Age (Median)");

    var householdIncomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("textLabel", true)
        .text("Household Income (Median)");

    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`)
        .attr("transform", `rotate(-90)`);

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 40)
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .classed("textLabel", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 20)
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var obeseLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");    

    // toolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(dataDB, chosenXAxis);

                // updates x axis with transition
                xAxis = renderYAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates text with new x values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    householdIncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    householdIncomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
                else {
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    householdIncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            }
        });

    // y axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                console.log(chosenYAxis)

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(dataDB, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates text with new y values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "smokes") {
                    smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
                else {
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            }
        });
});
