$( document ).ready(function() {
    // ---------- Initialize Map Object ---------- //
    var map = L.map('map', {
        center: [49.200, -123.062],
        zoom: 10,
        maxZoom:20
    });
    // ---------- Use Map Providers ---------- //
    var Stamen_TonerBackground = L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 9,
        maxZoom: 20
    }).addTo(map);
    var Stamen_TonerLabels = L.tileLayer('http://{s}.tile.stamen.com/toner-labels/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 9,
        maxZoom: 20
    });
    // ---------- Layer Toggler ---------- //
    var baseMaps = { "toner": Stamen_TonerBackground};
    var overlayMaps = { "labels":Stamen_TonerLabels };
    L.control.layers(baseMaps, overlayMaps ,{position:"topleft"}).addTo(map);


    // ---------- make chart ----------- //

    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

    d3.json("data/dummy.geojson", function(data){
        // console.log(data);
        // "data/traverse_20140912_dummy.geojson"
        // store data by vids
        var vid1 = [],
            vid2 = [],
            vid3 = [],
            vid4 = [];
        for (var i=0; i< data.features.length; i+=20){
            if (data.features[i].properties.vid == 1){
                vid1.push({
                    x:parseDate(data.features[i].properties.dateTime_gmt), 
                    y:data.features[i].properties.Co2_ppm, 
                    geometry:data.features[i].geometry,
                    properties: data.features[i].properties 
                });
            } else if (data.features[i].properties.vid == 2){
                vid2.push({
                    x:parseDate(data.features[i].properties.dateTime_gmt), 
                    y:data.features[i].properties.Co2_ppm, 
                    geometry:data.features[i].geometry,
                    properties: data.features[i].properties
                });
            }else if (data.features[i].properties.vid == 3){
                vid3.push({
                    x:parseDate(data.features[i].properties.dateTime_gmt), 
                    y:data.features[i].properties.Co2_ppm, 
                    geometry:data.features[i].geometry,
                    properties: data.features[i].properties 
                });
            } else if (data.features[i].properties.vid == 4){
                vid4.push({
                    x:parseDate(data.features[i].properties.dateTime_gmt), 
                    y:data.features[i].properties.Co2_ppm,
                    geometry:data.features[i].geometry,
                    properties: data.features[i].properties 
                });
            }  
        }
        // console.log("vid1", vid2);

        var newData = [ {values:vid1, key:"vid1", color:"#F48D6C"}, 
                        {values:vid2, key:"vid2", color:"#F2E07B"}, 
                        {values:vid3, key:"vid3", color:"#8ABE9B"},
                        {values:vid4, key:"vid4", color:"#4A6D8B"} ];
        // console.log(newData);


        //  chart start 
        var chart;
        nv.addGraph(function(){
                chart = nv.models.lineWithFocusChart()
                    .options({
                        margin:{ left:100, bottom:100},
                        x: function(d,i){return i}, // d.x
                        showXAxis: true,
                        showYAxis: true,
                        transitionDuration:100
                    });
                chart.xAxis
                    .axisLabel("Time (min)")
                    .tickFormat(d3.format(',.1f'));
                chart.yAxis
                    .axisLabel('Co2 (ppm)')
                    .tickFormat(d3.format(',.2f'));

                chart.y2Axis
                    .tickFormat(d3.format(',.2f'));
                

                d3.select('#chart1 svg')
                    .datum(newData)
                    .call(chart);
                
               //TODO: Figure out a good way to do this automatically
              nv.utils.windowResize(chart.update);
              //nv.utils.windowResize(function() { d3.select('#chart1 svg').call(chart) });

              //  Add geopoints to map on hover
              var geopoint=L.geoJson().addTo(map);
              // chart.dispatch.on('tooltipShow', function(e) { 
              //       geopoint.addData(e.point.geometry).setStyle({color:'#6631E8'});
              //   });
              // chart.dispatch.on('tooltipHide', function(e) { 
              //       geopoint.clearLayers();
              //   });
                var i = 0;
                chart.lines.dispatch.on('elementClick', function(e) { 
                    if (i%2 == 0){
                        geopoint.addData(e.point.geometry);
                        i++;
                    } else if (i%2 == 1){
                        geopoint.clearLayers();
                        i++;
                        if (i%2 == 0){
                            geopoint.addData(e.point.geometry);
                            i++;
                        }
                    }
                });

            return chart;
        }); // chart end

    }); 
}); // jquery end
