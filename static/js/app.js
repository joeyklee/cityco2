$( document ).ready(function() {
	// ---------- Initialize Map Object ---------- //
	var map = L.map('map', {
	    center: [49.2503, -123.062],
	    zoom: 11,
	    maxZoom:20
	});

	// ---------- Use Map Providers ---------- //
	var Stamen_TonerBackground = L.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png', {
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


	// ---------- Marker Layer ---------- //
	d3.json( "http://localhost:8080/api/sensors/2014-09-10/2014-09-11", function(data) {
		// "http://localhost:8080/api/sensors/co2/600"
        // "http://localhost:8080/api/sensors/co2/450/600"
        // "http://localhost:8080/api/sensors/co2/300"
        // "http://localhost:8080/api/sensors/2014-09-12"
        // "http://localhost:8080/api/sensors/co2/450/500"
		console.log(data)
		// -------------- Set Scales -------------- //
        // get max and min
        var dataMax = d3.max(data, function(d){
            return d.properties.Co2_ppm});
        var dataMin = d3.min(data, function(d){
            return d.properties.Co2_ppm});
        // Set the Color - Not necessary for this case
        var color = d3.scale.linear()
                      .domain([dataMin, dataMax])
                      .range(["red","purple"])
        // Set the Scale - Log Scale for emphasis
        var opac = d3.scale.log()
                      .domain([dataMin,dataMax])
                      .range([0.25, 0.75])
        // Set the Scale - SQRT for circle area
        var scale = d3.scale.sqrt()
                      .domain([dataMin,dataMax])
                      .range([1, 15])
        var pointStyle = function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: scale(feature.properties.Co2_ppm),
                fillColor: color(feature.properties.Co2_ppm),
                color: "#000",
                weight: 1,
                opacity: 0,
                fillOpacity: opac(feature.properties.Co2_ppm)
            });
        }
        // Set the PopUp Content
        var pointPopUp = function onEachFeature(feature, layer) {
            // does this feature have a property named popupContent?
            var popupContent = "<p><center>Co2 (ppm):"+ "<br/>" 
                                + feature.properties.Co2_ppm+ "</center></p>";
            layer.bindPopup(popupContent);
        }
        // Load Geojson Points using Native Leaflet
        var dataPoints = L.geoJson(data, {
        	onEachFeature:pointPopUp,
            pointToLayer: pointStyle
        }).addTo(map);
	}); // d3 end

    
    // -------------- sidebar start ------------ //
    (function () {
    $(function () {
        var SideBAR;
        SideBAR = (function () {
            function SideBAR() {}

            SideBAR.prototype.expandMyMenu = function () {
                return $("nav.sidebar").removeClass("sidebar-menu-collapsed").addClass("sidebar-menu-expanded");
            };

            SideBAR.prototype.collapseMyMenu = function () {
                return $("nav.sidebar").removeClass("sidebar-menu-expanded").addClass("sidebar-menu-collapsed");
            };

            SideBAR.prototype.showMenuTexts = function () {
                return $("nav.sidebar ul a span.expanded-element").show();
            };

            SideBAR.prototype.hideMenuTexts = function () {
                return $("nav.sidebar ul a span.expanded-element").hide();
            };

            SideBAR.prototype.showActiveSubMenu = function () {
                $("li.active ul.level2").show();
                return $("li.active a.expandable").css({
                    width: "100%"
                });
            };

            SideBAR.prototype.hideActiveSubMenu = function () {
                return $("li.active ul.level2").hide();
            };

            SideBAR.prototype.adjustPaddingOnExpand = function () {
                $("ul.level1 li a.expandable").css({
                    padding: "1px 4px 4px 0px"
                });
                return $("ul.level1 li.active a.expandable").css({
                    padding: "1px 4px 4px 4px"
                });
            };

            SideBAR.prototype.resetOriginalPaddingOnCollapse = function () {
                $("ul.nbs-level1 li a.expandable").css({
                    padding: "4px 4px 4px 0px"
                });
                return $("ul.level1 li.active a.expandable").css({
                    padding: "4px"
                });
            };

            SideBAR.prototype.ignite = function () {
                return (function (instance) {
                    return $("#justify-icon").click(function (e) {
                        if ($(this).parent("nav.sidebar").hasClass("sidebar-menu-collapsed")) {
                            instance.adjustPaddingOnExpand();
                            instance.expandMyMenu();
                            instance.showMenuTexts();
                            instance.showActiveSubMenu();
                            $(this).css({
                                color: "#000"
                            });
                        } else if ($(this).parent("nav.sidebar").hasClass("sidebar-menu-expanded")) {
                            instance.resetOriginalPaddingOnCollapse();
                            instance.collapseMyMenu();
                            instance.hideMenuTexts();
                            instance.hideActiveSubMenu();
                            $(this).css({
                                color: "#FFF"
                            });
                        }
                        return false;
                    });
                })(this);
            };
            return SideBAR;
        })();
        return (new SideBAR).ignite();
        });
    }).call(this); // sidebar end
    
    // // --- date widget --- //
    //  // initialize input widgets first
    // $('#datepairExample .time').timepicker({
    //     'showDuration': true,
    //     'timeFormat': 'g:ia'
    // });

    // $('#datepairExample .date').datepicker({
    //     'format': 'yyyy-m-d',
    //     'autoclose': true
    // });

    // // initialize datepair
    // $('#datepairExample').datepair();


    // ---- time slider place holder ---- //
    $(function() {
    $( "#timeslider-range" ).slider({
          range: true,
          min: 0,
          max: 500,
          values: [ 75, 300 ],
          slide: function( event, ui ) {
            $( "#timerange" ).val( "Start:" + ui.values[ 0 ] + " to End:" + ui.values[ 1 ] );
          }
        });
        $( "#timerange" ).val( "Start:" + $( "#timeslider-range" ).slider( "values", 0 ) +
          " to End:" + $( "#timeslider-range" ).slider( "values", 1 ) );
    });

     // ---- co2 slider place holder ---- //
    $(function() {
    $( "#co2slider-range" ).slider({
          range: true,
          min: 0,
          max: 500,
          values: [ 75, 300 ],
          slide: function( event, ui ) {
            $( "#co2range" ).val( "PPM:" + ui.values[ 0 ] + " to PPM:" + ui.values[ 1 ] );
          }
        });
        $( "#co2range" ).val( "PPM:" + $( "#co2slider-range" ).slider( "values", 0 ) +
          " to PPM:" + $( "#co2slider-range" ).slider( "values", 1 ) );
    });

}); // jquery end