(function () {
   // select the HTML element that will hold our map
   const mapContainer = d3.select('#map')

   // determine width and height of map from container
   const width = mapContainer.node().offsetWidth - 60;
   const height = mapContainer.node().offsetHeight - 60;

   // create and append a new SVG element to the map div
   //   const svg = mapContainer
   //     .append('svg')
   //     .attr('width', width) // provide width and height attributes
   //     .attr('height', height)

   //   console.log(svg);

   // request our data files and reference with variables
   const stateGeoJson = d3.json('data/us-states.geojson')
   const riversLakes = d3.json('data/rivers-lakes-polygon.json')
   const usRunoff = d3.json('data/us_runoff.geojson')
   const orvOne = d3.json('data/orv_1.geojson')
   const orvTwo = d3.json('data/orv_2.geojson')
   const orvThree = d3.json('data/orv_3.geojson')
   const orvFour = d3.json('data/orv_4.json')
   const orv = d3.json('data/orv.geojson')

   // wait until data is loaded then send to draw map function
   Promise.all([stateGeoJson, riversLakes, usRunoff, orvOne, orvTwo, orvThree, orvFour, orv]).then(drawMap);

   // accepts the data as a parameter countiesData
   function drawMap(data) {
      // log data to console
       console.log(data);

      // refer to different datasets
      const stateData = data[0];
      const waterData = data[1];
      const runoff = data[2];
      const orvOne = data[3];
      const orvTwo = data[4];
      const orvThree = data[5];
      const orvFour = data[6];
      const orv = data[7];

      //  console.log(waterData);

      //  convert the TopoJSON into GeoJSON
      // const orvFourGeoJson = topojson.feature(orvFour, {
      //    type: 'GeometryCollection',
      //    geometries: orvFour.objects.orv_4.geometries
      // });

      //  const waterDataGeoJson = topojson.feature(waterData, {
      //    type: 'GeometryCollection',
      //    geometries: waterData.objects.rivers-lakes-polygon.geometries
      //  });

      //  console.log(orvFourGeoJson);

      // declare a geographic path generator
      // fit the extent to the width and height using the geojson
      // const projection = d3.geoConicEquidistant()
      //    .fitSize([width, height], stateData)
      //    .center([0, 40]) // center of geography in latitude
      //    .rotate([97, 0]) // rotate the earth negative degrees in longitude
      //    .scale(2000) // adjust the scale (i.e., "zoom")
      //    .translate([width / 2, height / 2]); // move the project to the center of the SVG

      //  var projection = d3.geoAlbersUsa()
      //    .fitSize([width, height], countiesGeoJson)

      //  console.log(projection);

      // declare a path generator using the projection
      // const path = d3.geoPath()
      //    .projection(projection);

      //  console.log(path);

      // const svg = mapContainer
      //    .append('svg')
      //    .attr('width', width)
      //    .attr('height', height)
      //    .style('top', 10) // 40 pixels from the top
      //    .style('left', 10); // 40 pixels from the left

      // Create  div for the tooltip and hide with opacity
      //    const tooltip = d3.select('.container-fluid').append('div')
      //      .attr('class', 'my-tooltip bg-warning text-white py-1 px-2 rounded position-absolute invisible');

      // when mouse moves over the mapContainer
      //    mapContainer
      //      .on('mousemove', event => {
      //        // update the position of the tooltip
      //        console.log(event)
      //        tooltip.style('left', (event.pageX + 10) + 'px')
      //          .style('top', (event.pageY - 30) + 'px');
      //      });

      // append a new g element for counties
      // const states = svg.append('g')
      //    .selectAll('path')
      //    .data(stateData.features) // use the GeoJSON features
      //    .join('path') // join them to path elements
      //    .attr('d', path) // use our path generator to project them on the screen
      //    .attr('class', 'county') // give each path element a class name of county

      // console.log(states);

      // applies event listeners to our polygons for user interaction
      //    counties.on('mouseover', (event, d) => { // when mousing over an element
      //      console.log(d);  
      //      d3.select(event.currentTarget).classed('hover', true)
      //      .raise(); // select it, add a class name, and bring to front
      //        tooltip.classed('invisible', false).html(
      //          `${d.properties.NAME} County`) // make tooltip visible and update info 
      //      })
      //      .on('mouseout', (event, d) => { // when mousing out of an element
      //        d3.select(event.currentTarget).classed('hover', false) // remove the class from the polygon
      //        tooltip.classed('invisible', true) // hide the element 
      //      });

      // append states to the SVG
      // svg.append('g') // append a group element to the svg
      //    .selectAll('path') // select multiple paths (that don't exist yet)
      //    .data(stateData.features) // use the feature data from the geojson
      //    .join('path') // join the data to the now created path elements
      //    .attr('d', path) // provide the d attribute for the SVG paths
      //    .classed('state', true) // give each path element a class name of state

      drawStates(stateData, waterData, runoff, orvOne, orvTwo, orvThree, orvFour, orv);
      

   } // end processData

   function drawStates(stateData, waterData, runoff, orvOne, orvTwo, orvThree, orvFour, orv) {

      console.log(stateData);
      const boundaries = [orvOne, orvTwo, orvThree, orvFour, orv]

      console.log(boundaries);

      // // create empty variables to hold color scales and ranges
      // const colorScales = {}
      // let range = []
      // const fullRange = []

      // lopo over each industry type
      // byTypeSort.forEach(d => {
      //    // reset the range array
      //    range = []
      //    // loop over each state
      //    runoff.features.forEach(g => {
      //       // if the state has emissions data for this industry type
      //       if (g.properties.emissions[d[0]]) {
      //          // add the emissions quantity by type to the range array
      //          range.push(+g.properties.emissions[d[0]])
      //          // add all emissions by state to the full range array
      //          fullRange.push(+g.properties.emissions.all)
      //       } else {
      //          range.push(0)
      //       }
      //    })

         // create a continuous color scale for this industry type
      //    colorScales[d[0]] = d3.scaleLinear()
      //       .domain(d3.extent(range))
      //       .range(["white", color(d[0])]);
      // })

      // console.log(colorScales);

      // // create a continuous color scale for all emissions by state
      // colorScales.all = d3.scaleLinear()
      //    .domain(d3.extent(fullRange))
      //    .range(["white", "black"]);

      // // console.log(colorScales.all);

      // // select the html element that will hold our map
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
         .style('top', '60px')
         .style('left', '60px');

      // use geojson layer to fit extent of the projection
      const projection = d3.geoAlbersUsa()
         .fitSize([width, height], orv);

      const path = d3.geoPath()
         .projection(projection);

      // // draw state data onto d3 svg map element
      const states = svg.append('g')
         .selectAll('path')
         .data(orv.features)
         .join('path')
         .attr('d', path)
         .style('fill') // d => {return colorScales.all(d.properties.emissions.all)}
         .style('stroke', 'black')

      // // add a tooltip to each state
      // states.on('click', (event, d) => {
      //       let tooltipContent = `<h3>${d.properties.NAME}<h3>`

      //       // create empty array to hold emissions by industry type
      //       const sorted = []

      //       // loop over each industry type by state
      //       for (let i in d.properties.emissions) {
      //          sorted.push([+d.properties.emissions[i], i])
      //       }

      //       // console.log(sorted);

      //       // sort the array by emissions quantity
      //       sorted.sort((a, b) => b[0] - a[0])

      //       // console.log(sorted[0]);
      //       // console.log(sorted[1]);
      //       // console.log(sorted[2]);
      //       // console.log(sorted[3]);
      //       // console.log(sorted[4]);
      //       // console.log(sorted[5]);
      //       // console.log(sorted[6]);
      //       // console.log(sorted[7]);

      //       // build the tooltip content
      //       sorted.forEach(d => {
      //          // the 1e6 is shorthand for 1,000,000
      //          tooltipContent += `${(d[0]/1e6).toFixed(1)}: ${d[1]}<br>`
      //       })

      //       // append units to the tooptip
      //       tooltipContent += `(in million metric tons)`

      //       // show the tooltip
      //       tooltip.style('opacity', 1)
      //          .style('left', (event.pageX + 10) + 'px')
      //          .style('top', (event.pageY - 30) + 'px')
      //          .html(tooltipContent)
      //    })

      //    .on('mouseout', function () {
      //       tooltip.style('opacity', 0)
      //    });

      // const barChart = d3.select('#bar-chart svg')



      // // select the rectangles in the bar chart
      // barChart.selectAll('rect')
      //    // listen for a mousover event on each rectangle
      //    .on('mouseover', (event, d) => {
      //       // add tooltip to the bar chart
      //       let tooltipContent = `${d[0]}, ${d[1].toLocaleString()} metric tons`
      //       tooltip.style('opacity', 1)
      //          .style('left', (event.pageX + 10) + 'px')
      //          .style('top', (event.pageY - 30) + 'px')
      //          .html(tooltipContent)

      //       // change industry type for the choropleth map and restyle the map
      //       states
      //          .style('fill', data => {
      //             if (data.properties.emissions[d[0]]) {
      //                return colorScales[d[0]](data.properties.emissions[d[0]])
      //             } else {
      //                return 'white'
      //             }
      //          })
      //       const type = d[0] // set default to all inudstries

      //       console.log(type);

      //       // add the title content to #type element
      //       d3.select('#type').html(type)

      //       // below funciton not defined yet
      //       // uncomment after creating the stateLegend() function
      //       stateLegend(colorScales, type)
      //    })
      //    .on('mouseout', function () {
      //       tooltip.style('opacity', 0)
      //    });

      // stateLegend(colorScales, "all");
      // ramp(color, n = 256);
      // drawPoints(geojson, facilityData, byTypeSort, svg);
      // drawPoints(geojson, facilityData, byTypeSort, svg); // not defined yet
   } // end drawStates

   // Set heights for page sections
   //  adjustHeight();

   // D3 time



   // Utility functions
   // window.addEventListener('resize', adjustHeight)

   //  function adjustHeight() {
   //    const mapSize = document.querySelector("#map"),
   //      contentSize = document.querySelector("#content"),
   //      removeFooter = document.querySelector('#footer').offsetHeight,
   //      removeHeader = document.querySelector('#header').offsetHeight
   //    const resize = window.innerHeight - removeFooter - removeHeader;
   //    if (window.innerWidth >= 768) {
   //      contentSize.style.height = `${resize}px`
   //      mapSize.style.height = `${resize}px`
   //    } else {
   //      contentSize.style.height = `${resize * 0.25}px`
   //      mapSize.style.height = `${resize * 0.75 }px`
   //    }
   //  }
})();