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
   const stateJson = d3.json('data/states.json')
   const water = d3.json('data/water.json')
   const usRunoff = d3.json('data/us_runoff.json')
   const orvOne = d3.json('data/orv_1.json')
   const orvTwo = d3.json('data/orv_2.json')
   const orvThree = d3.json('data/orv_3.json')
   const orvFour = d3.json('data/orv_4.json')
   const orv = d3.json('data/orv.json')

   // wait until data is loaded then send to draw map function
   Promise.all([stateJson, water, usRunoff, orvOne, orvTwo, orvThree, orvFour, orv]).then(drawMap);

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
      const stateDataGJson = topojson.feature(stateData, {
         type: 'GeometryCollection',
         geometries: stateData.objects.states.geometries
      });

      // console.log(stateDataGeoJson);

      //  convert the TopoJSON into GeoJSON
      const waterGJson = topojson.feature(waterData, {
         type: 'GeometryCollection',
         geometries: waterData.objects.water.geometries
      });

      // console.log(waterGeoJson);

      //  convert the TopoJSON into GeoJSON
      const runoffGJson = topojson.feature(runoff, {
         type: 'GeometryCollection',
         geometries: runoff.objects.us_runoff.geometries
      });

      // console.log(runoffGeoJson);

      //  convert the TopoJSON into GeoJSON
      const orvOneGJson = topojson.feature(orvOne, {
         type: 'GeometryCollection',
         geometries: orvOne.objects.orv_1.geometries
      });

      // console.log(orvOneGeoJson);

      //  convert the TopoJSON into GeoJSON
      const orvTwoGJson = topojson.feature(orvTwo, {
         type: 'GeometryCollection',
         geometries: orvTwo.objects.orv_2.geometries
      });

      // console.log(orvTwoGeoJson);

      //  convert the TopoJSON into GeoJSON
      const orvThreeGJson = topojson.feature(orvThree, {
         type: 'GeometryCollection',
         geometries: orvThree.objects.orv_3.geometries
      });

      // console.log(orvThreeGJson);

      //  convert the TopoJSON into GeoJSON
      const orvFourGJson = topojson.feature(orvFour, {
         type: 'GeometryCollection',
         geometries: orv.objects.orv.geometries
      });

      //  console.log(orvFourGeoJson);

      const orvGJson = topojson.feature(orv, {
            type: 'GeometryCollection',
            geometries: orv.objects.orv.geometries
         });

      console.log(orvGJson);

      drawStates(stateDataGJson, waterGJson, runoffGJson, orvOneGJson, orvTwoGJson, orvThreeGJson, orvFourGJson, orvGJson);
      
   } // end processData

   function drawStates(stateDataGJson, waterGJson, runoffGJson, orvOneGJson, orvTwoGJson, orvThreeGJson, orvFourGJson, orvGJson) {

      console.log(orvGJson);
      const boundaries = [orvOneGJson, orvTwoGJson, orvThreeGJson, orvFourGJson, orvGJson]

      console.log(boundaries);

      
      // select the html element that will hold our map
      const mapContainer = d3.select('#map')

      // console.log(mapContainer);

      // determine width and height of map from container
      const width = mapContainer.node().offsetWidth;
      const height = mapContainer.node().offsetHeight;

      const svg = mapContainer
         .append('svg')
         .attr('width', width)
         .attr('height', height)
         .classed('position-absolute', true) // add bootstrap class
         .style('top', '0px')
         .style('left', '0px')
         .style('bottom', '0px');

      // use geojson layer to fit extent of the projection
      const projection = d3.geoAlbersUsa()
         .fitSize([width, height], orvGJson);

      const path = d3.geoPath()
         .projection(projection);

      // draw state data onto d3 svg map element
      const states = svg.append('g')
         .selectAll('path')
         .data(stateDataGJson.features)
         .join('path')
         .attr('d', path)
         .style('fill') // d => {return colorScales.all(d.properties.emissions.all)}

      drawRunoff(boundaries);
   } // end drawStates

   function drawRunoff(boundaries) {
      console.log(boundaries);
   }

   function addUI (boundaries) {
      console.log(boundaries);
   }

})();