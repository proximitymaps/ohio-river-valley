(function () {

    // asynchronous calls to data files
    const statesJson = d3.json('data/us-states.json');
    const facilityCSV = d3.csv('data/facility-emissions-2016.csv');

    // use promise to call all data files, then send data to callback
    Promise.all([statesJson, facilityCSV])
        .then(processData)
        .catch(error => {
            console.log(error);
        });

    // Create global div for the tooltip and hide with opacity
    const tooltip = d3.select('body').append('div')
        .attr('class', 'my-tooltip bg-info text-white py-0 px-1 rounded position-absolute')
        .style('opacity', 0);

    // function called when Promise above is complete
    function processData(data) {

        console.log(data); // out two datasets within an array

        // data is array of our two datasets
        const statesData = data[0];
        const facilityData = data[1];

        console.log(facilityData);

        // convert topojson to geojson
        const geojson = topojson.feature(statesData, {
            type: 'GeometryCollection',
            geometries: statesData.objects.cb_2016_us_state_20m.geometries
        });

        // create a new empty object
        const byType = {}

        // loop through facility data and add to object
        // and aggregate by type
        facilityData.forEach(d => {
            // console.log(d);
            if (!byType[d.Industry_Type]) {
                byType[d.Industry_Type] = +d.Total
                // console.log(byType);
            } else {
                byType[d.Industry_Type] += +d.Total
            }
        })

        // console.log(byType);

        // sort the object by emission type totals
        const byTypeSort = Object.entries(byType).sort((a, b) => a[1] - b[1])

        console.log(byTypeSort);

        // loop over states and join emissions data and aggregate by type
        geojson.features.forEach(g => {
            g.properties.emissions = {}
            g.properties.emissions.all = 0
            // console.log(g.properties.emissions);
            facilityData.forEach(d => {
                if (g.properties.STUSPS == d.State) {
                    if (!g.properties.emissions[d.Industry_Type]) {
                        g.properties.emissions[d.Industry_Type] = +d.Total
                    } else {
                        g.properties.emissions[d.Industry_Type] += +d.Total
                    }
                    g.properties.emissions.all += +d.Total
                }
                // console.log(d);
                // console.log(g);
            })
        })

        // call the draw chart function
        drawChart(byTypeSort, geojson, facilityData)
    } // end processData

    function drawChart(byTypeSort, geojson, facilityData) {

        // select the html element that will hold our chart
        const barChart = d3.select('#bar-chart')

        // console.log(barChart);

        // determine width and height of chart from container
        const width = barChart.node().offsetWidth - 40;

        // console.log(width);

        // append a new SVG element to the container
        const svg = barChart
            .append('svg')
            .attr('width', width)
            .attr('height', 380)

        // console.log(svg);

        // x scale determines how wide each bar will be
        const x = d3.scaleLinear()
            .range([0, width])
            .domain([0, d3.max(byTypeSort, d => d[1])]);

        // console.log(x);

        // y scale determines how tall each bar will be
        const y = d3.scaleBand()
            .range([380, 0])
            .domain(byTypeSort.map(d => d[0]));

        // console.log(y);

        // color function to determine color of each bar
        color = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(byTypeSort.map(d => d[0]));

        // console.log(color('Power Plants'));

        // append a new SVG group to the SVG element
        svg.append('g')
            .selectAll('path')
            .data(byTypeSort) // pass the iterable data into the selection
            .enter()
            .append("rect") // append a rectangle for each data element
            .attr("class", "bar") // give each rectangle a class, if desired
            .attr("y", d => y(d[0])) // set the y position of each rectangle
            .attr("height", y.bandwidth()) // set the height of each rectangle
            .attr("x", 0) // set the x position of each rectangle
            .attr("width", d => x(d[1])) // set the width of each rectangle
            .attr("fill", d => color(d[0])) // set the color of each rectangle

        // add a label to each rectangle
        svg.selectAll("label")
            .data(byTypeSort)
            .enter()
            .append("text")
            .text(d => `${d[0]}`) // set the text of each label
            .attr("x", d => { // set the x position of each label
                if (x(d[1]) / width < 0.5) {
                    return x(d[1]) + 5;
                } else {
                    return 5
                }
            })
            .attr("y", d => y(d[0]) + y.bandwidth() / 1.75) // set the y position of each label
            .attr("text-anchor", "left");

        drawStates(geojson, byTypeSort, color, facilityData)
    } // end drawChart

    function drawStates(geojson, byTypeSort, color, facilityData) {

        // create empty variables to hold color scales and ranges
        const colorScales = {}
        let range = []
        const fullRange = []

        // lopo over each industry type
        byTypeSort.forEach(d => {
            // reset the range array
            range = []
            // loop over each state
            geojson.features.forEach(g => {
                // if the state has emissions data for this industry type
                if (g.properties.emissions[d[0]]) {
                    // add the emissions quantity by type to the range array
                    range.push(+g.properties.emissions[d[0]])
                    // add all emissions by state to the full range array
                    fullRange.push(+g.properties.emissions.all)
                } else {
                    range.push(0)
                }
            })

            // create a continuous color scale for this industry type
            colorScales[d[0]] = d3.scaleLinear()
                .domain(d3.extent(range))
                .range(["white", color(d[0])]);
        })

        // console.log(colorScales);

        // create a continuous color scale for all emissions by state
        colorScales.all = d3.scaleLinear()
            .domain(d3.extent(fullRange))
            .range(["white", "black"]);

        // console.log(colorScales.all);

        // select the html element that will hold our map
        const mapContainer = d3.select('#map')

        console.log(mapContainer);

        // determine width and height of map from container
        const width = mapContainer.node().offsetWidth - 60;
        const height = mapContainer.node().offsetHeight - 60;

        const svg = mapContainer
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .classed('position-absolute', true) // add bootstrap class
            .style('top', '40px')
            .style('left', '30px');

        // use geojson layer to fit extent of the projection
        const projection = d3.geoAlbersUsa()
            .fitSize([width, height], geojson);

        const path = d3.geoPath()
            .projection(projection);

        // draw state data onto d3 svg map element
        const states = svg.append('g')
            .selectAll('path')
            .data(geojson.features)
            .join('path')
            .attr('d', path)
            .style('fill', d => {
                return colorScales.all(d.properties.emissions.all)
            })
            .style('stroke', 'black')

        // add a tooltip to each state
        states.on('click', (event, d) => {
                let tooltipContent = `<h3>${d.properties.NAME}<h3>`

                // create empty array to hold emissions by industry type
                const sorted = []

                // loop over each industry type by state
                for (let i in d.properties.emissions) {
                    sorted.push([+d.properties.emissions[i], i])
                }

                // console.log(sorted);

                // sort the array by emissions quantity
                sorted.sort((a, b) => b[0] - a[0])

                // console.log(sorted[0]);
                // console.log(sorted[1]);
                // console.log(sorted[2]);
                // console.log(sorted[3]);
                // console.log(sorted[4]);
                // console.log(sorted[5]);
                // console.log(sorted[6]);
                // console.log(sorted[7]);

                // build the tooltip content
                sorted.forEach(d => {
                    // the 1e6 is shorthand for 1,000,000
                    tooltipContent += `${(d[0]/1e6).toFixed(1)}: ${d[1]}<br>`
                })

                // append units to the tooptip
                tooltipContent += `(in million metric tons)`

                // show the tooltip
                tooltip.style('opacity', 1)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 30) + 'px')
                    .html(tooltipContent)
            })

            .on('mouseout', function () {
                tooltip.style('opacity', 0)
            });

        const barChart = d3.select('#bar-chart svg')



        // select the rectangles in the bar chart
        barChart.selectAll('rect')
            // listen for a mousover event on each rectangle
            .on('mouseover', (event, d) => {
                // add tooltip to the bar chart
                let tooltipContent = `${d[0]}, ${d[1].toLocaleString()} metric tons`
                tooltip.style('opacity', 1)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 30) + 'px')
                    .html(tooltipContent)

                // change industry type for the choropleth map and restyle the map
                states
                    .style('fill', data => {
                        if (data.properties.emissions[d[0]]) {
                            return colorScales[d[0]](data.properties.emissions[d[0]])
                        } else {
                            return 'white'
                        }
                    })
                const type = d[0] // set default to all inudstries

                console.log(type);

                // add the title content to #type element
                d3.select('#type').html(type)

                // below funciton not defined yet
                // uncomment after creating the stateLegend() function
                stateLegend(colorScales, type)
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0)
            });

        stateLegend(colorScales, "all");
        ramp(color, n = 256);
        drawPoints(geojson, facilityData, byTypeSort, svg);
        // drawPoints(geojson, facilityData, byTypeSort, svg); // not defined yet
    } // end drawStates

    function drawPoints(geojson, facilityData, byTypeSort, svg) {

        // select the HTML element that will hold our map
        const mapContainer = d3.select('#map')

        // determine width and height of map fron container
        const width = mapContainer.node().offsetWidth - 60;
        const height = mapContainer.node().offsetHeight - 60;

        // create a new projection and path generator for our map
        const projection = d3.geoAlbersUsa()
            .fitSize([width, height], geojson);
        const path = d3.geoPath()
            .projection(projection);

        // find the max emission value
        const maxValue = d3.max(facilityData.map(d => +d.Total))
        // console.log(maxValue);

        // define radius generator
        const radius = d3.scaleSqrt().domain([0, maxValue]).range([1, 30]);
        // console.log(radius);

        // define color generator
        const color = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(byTypeSort.map(d => d[0]));

        const facilities = svg.append('g') // append new g element
            .selectAll('circle') // select all the circles
            .data(facilityData.sort(function (a, b) {
                return b.Total - a.Total; // place the large ones on the bottom
            }))
            // .data(facilityData) // use the facility CSV data
            .join('circle') // join that data to circle elements
            .attr('cx', d => { // feed the long/lat to the projection generator
                d.position = projection([d.Longitude, d.Latitude]); // create a new data attribute
                return d.position[0]; // position the x
                console.log(d.position[0]);
            })
            .attr('cy', d => {
                return d.position[1]; // position the y
                console.log(d.position[1]);
            })
            .attr('r', d => {
                // console.log(d);
                return radius(+d.Total);
            })
            .attr('class', 'facility') // give each circle a class name
            .style('fill', d => {
                return color(d.Industry_Type);
            })
            .style('display', 'none')
            // .style('display', 'none')
            .on('mouseover', (event, d) => { // when mousing over an element
                // d3.select(event.currentTarget).classed('hover', true).raise(); // select it, add a class name, and bring to front
                const tooltipContent = `${d.Facility_Name} (${d.Industry_Type})<br>${d.Total} metric tons` // make tooltip visible and update info 

                tooltip.style('opacity', 1)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 30) + 'px')
                    .html(tooltipContent)
        
              })
              .on('mouseout', (event, d) => { // when mousing out of an element
                // d3.select(event.currentTarget).classed('hover', false) // remove the class from the polygon
                // tooltip.classed('invisible', true) // hide the element 
                tooltip.style('opacity', 0)
              });

        // Rather than creating an SVG path element for each feature (like we did with the polygons), when drawing point features, we can instead create SVG circle elements for each. A circle element will always have at least three attributes:

        filterByAttribute(facilityData, facilities);
        drawLegend(svg, width, height, radius);
        makeZoom(svg, width, height, radius);
    } // end drawPoints

    function drawLegend(svg, width, height, radius) {
        // create variable for legend by appending new html class element called "legend"
        const legend = svg.append('g')
            .attr('dy', '1.3em')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - 40}, ${height - 20})`)
            .selectAll('g')
            .data([5e6, 2e7])
            .join('g');

        legend.append('circle')
            .attr('cy', d => {
                return -radius(d)
            })
            .attr('r', radius);

        legend.append('text')
            .attr('y', d => {
                return -2 * radius(d)
            })
            .attr('dy', '1.3em')
            .text(d3.format('.1s'));

        legend.append('text')
            .attr('y', 16)
            .text('metric tons')
    }

    function filterByAttribute(facilityData, facilities) {
        // array to hold select options
        var uniqueTypes = [];

        // loop through all features and push unique types to array
        facilityData.forEach(facility => {
            if (!uniqueTypes.includes(facility.Industry_Type)) {
                uniqueTypes.push(facility.Industry_Type);
            }
        });

        // sort strings alphabetically
        uniqueTypes.sort();

        // add an all facilites to the beginning
        // and the ability to reset the dropdown
        uniqueTypes.unshift('All facilities');
        uniqueTypes.unshift('No facilities');

        // select all the options (that don't exist yet)
        d3.select('#ui .dropdown-menu').selectAll('a')
            .data(uniqueTypes) // use array as data
            .join('a') // append a new option element for each data item
            .text(d => {
                return d // use the item as text
                // console.log(d);
            })
            .attr('value', d => {
                return d // use the time as value attribute
            })
            .attr('href', '#')
            .classed('dropdown-item', true)
            .on('click', onchange); // when the user clicks call onchange function

        function onchange() {
            // get the currently selected value
            let val = d3.select(this).attr('value');

            // change the display property for each circle
            facilities.style('display', d => {
                if (val === 'All facilities') return 'inline';
                if (d.Industry_Type != val) return 'none';
                if (val === 'No facilities') return 'none';
            });
            // update the UI with current val
            d3.select('#ui > a').html(val);
        }

    }

    function stateLegend(scale, type) {

        // remove any existing legend
        d3.select(`#state-legend svg`).remove();

        // find the min and max values in scale
        const range = scale[type].domain();

        // console.log(range);

        // select the state legend container and create a new svg
        const svg = d3
            .select("#state-legend")
            .append("svg")
            .attr("width", 240)
            .attr("height", 70)
            .append("g")
            .attr("transform", `translate(5,5)`);

        // d3 can create an image of a linear scale
        svg
            .append("image")
            .attr("x", 0)
            .attr("y", 15)
            .attr("width", 180)
            .attr("height", 20)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", ramp(scale[type]).toDataURL());

        // add a title
        svg
            .append("text")
            .attr("transform", `translate(0,5)`)
            .attr("x", 0)
            .attr("y", 5)
            .attr("text-anchor", "left")
            .style("font-size", "1.2em")
            .text("Million metric tons");

        // add a tick line for the min value
        svg
            .append("line")
            .attr("transform", `translate(0,15)`)
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .attr("x1", 0) // x position of the first end of the line
            .attr("y1", 0) // y position of the first end of the line
            .attr("x2", 0) // x position of the second end of the line
            .attr("y2", 25); // y position of the second end of the line

        // add a tick line for the max value
        svg
            .append("line")
            .attr("transform", `translate(0,15)`)
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .attr("x1", 180)
            .attr("y1", 0)
            .attr("x2", 180)
            .attr("y2", 25);

        // add a tick label for the min value
        svg
            .append("text")
            .attr("transform", `translate(0,15)`)
            .attr("x", 0)
            .attr("y", 40)
            .attr("text-anchor", "left")
            .text((range[0] / 1e6).toFixed(1))

        // add a tick label for the max value
        svg
            .append("text")
            .attr("transform", `translate(0,15)`)
            .attr("x", 180)
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .text((range[1] / 1e6).toFixed(1))
    }

    //  create a linear gradient canvas element
    function ramp(color, n = 256) {
        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        const range = color.domain();
        for (let i = 0; i < n; ++i) {
            context.fillStyle = color((i / (n - 1)) * (range[1] - range[0]) + range[0]);
            context.fillRect(i, 0, 1, 1);
        }
        return canvas;
    } // end stateLegend

    function makeZoom(svg, width, height, radius) {
        const zoom = d3
            .zoom()

            // on zoom (many events fire this event like mousemove, wheel, dblclick, etc.)...
            .on("zoom", (event) => {
                svg
                    // select all paths in svg
                    .selectAll("path")
                    //trasnform path based on event
                    .attr("transform", event.transform)
                    // change stroke width on zoom
                    .attr("stroke-width", 1 / event.transform.k);

                svg
                    .selectAll("circle")
                    .attr("transform", event.transform)
                    .attr("r", (d) => {
                        if (+d.Total) {
                            return radius(+d.Total) * (1 / event.transform.k);
                        }
                    });

                // redraw legend
                drawLegend(svg, width, height, radius);
            });

        // attach function to svg
        svg.call(zoom);
    }

})();