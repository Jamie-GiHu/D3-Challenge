// STEP ONE
// Create and format the SVG
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// STEP TWO
// Define functions to bind data to axes and to format axes scales

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}

// Function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([0, width]);
  
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
// Function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}  

// STEP FOUR
// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
  
    if (chosenXAxis === "poverty") {
      xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
      xLabel = "Age:";
    }
    else {
      xLabel = "Household Income:";
    }    

    var yLabel;
  
    if (chosenYAxis === "healthcare") {
      yLabel = "Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
      yLabel = "Smokes:";
    }
    else {
      yLabel = "Obese:";
    }  
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
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
}

// STEP FIVE
// Use D3 to read in data.csv
var pathSamples = `assets/data/data.csv`;
var dataDB;

// Fetch csv file using D3 to test in local machine
d3.csv(pathSamples)
    .then(data => {dataDB = data

    console.log(dataDB);
    console.log(dataDB[0].healthcare);

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");

    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var householdIncomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `rotate(-90)`);

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "2em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var obeseLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "3em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");    

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

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
            xLinearScale = xScale(hairData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "num_albums") {
                albumsLabel
                .classed("active", true)
                .classed("inactive", false);
                hairLengthLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
                albumsLabel
                .classed("active", false)
                .classed("inactive", true);
                hairLengthLabel
                .classed("active", true)
                .classed("inactive", false);
            }
        }
    });
}).catch(function(error) {
console.log(error);
});
