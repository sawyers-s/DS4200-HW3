// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400;
    const margin = {top: 30, bottom: 50, left: 50, right: 30};

    // Create the SVG container
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#e9f7f2");
    
    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5

    // Note: A buffer of 1 on each side ensures x-axis begins at zero and extends a bit beyond the
    // largest point for readability.
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength)-1, d3.max(data, d => d.PetalLength)+1])
        .range([margin.left, width - margin.right]);
    
    // Note: I chose to make the buffers on the y-axis smaller than on the x-axis to account for the smaller
    // Width values. The buffer on the min side is smaller to ensure the y-axis started at zero to make the
    // graph more intuitive (only subtracted 0.1 from the minimum value, 0.1). I added a larger buffer to the
    // max side to ensure the graph extended a bit beyond the largest point for readability.
    const yScale = d3.scaleLinear()
              .domain([d3.min(data, d => d.PetalWidth)-0.1, d3.max(data, d => d.PetalWidth)+0.3])
              .range([height-margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales     
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));
    
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 3)
        .style("fill", d => colorScale(d.Species));

    // Add x-axis label
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height-15)
        .text("Petal Length")
        .style("text-anchor", "middle");

    // Add y-axis label
    svg.append("text")
        .attr("x", 0 - height/2)
        .attr("y", 20)
        .text("Petal Width")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)");

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("circle")
        .attr("cx", width-105)
        .attr("cy", 10)
        .attr("r", 5)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width-95)
        .attr("y", 10)
        .attr("dy", ".25em") // moves text slightly down from top of canvas
        .style("text-anchor", "start")
        .text(d => d);
});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400;
    const margin = {top: 30, bottom: 50, left: 50, right: 30};

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#e9f7f2");

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Species))
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength)-1, d3.max(data, d => d.PetalLength)+1])
        .range([height-margin.bottom, margin.top]);

    // Add scales     
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));
    
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height-10)
        .text("Species")
        .style("text-anchor", "middle");

    // Add y-axis label
    svg.append("text")
        .attr("x", 0 - height/2)
        .attr("y", 25)
        .text("Petal Length")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75)
        return {q1, median, q3};
    };

    // This line of code will group the iris data by Species and compute the statistics noted
    // in the rollupFunction (q1, median, q3) for each species, applying the function to each
    // group. The output (quartilesBySpecies) will include each species as a key with each
    // species' q1, median, and q3 as the key values.
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // This code is looping through each species in quartilesBySpecies and assigning each species
    // an x position on the x-axis based on xScale for its species data to be plotted (x). It is
    // then determining how wide the species' box should be/the width of each band in d3.scaleBand()
    // that was used to make the x scale that will be used when drawing the boxes in the boxplot (boxWidth).
    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScale(Species);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + (boxWidth/2))
            .attr("y1", yScale(quartiles.q1 - 1.5*(quartiles.q3-quartiles.q1)))
            .attr("x2", x + (boxWidth/2))
            .attr("y2", yScale(quartiles.q3 + 1.5*(quartiles.q3-quartiles.q1)))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        // Draw box
        svg.append("rect")
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .style("fill", "#e9f7f2")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("y1", yScale(quartiles.median))
            .attr("x2", x + (boxWidth))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });
});