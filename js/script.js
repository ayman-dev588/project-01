
d3.csv("data/crash_data.csv", function(data) {
  bubble_chart.init(data);
  bubble_chart.toggle_view('all');
});

var bubble_chart = (function(d3, DisplayTooltip) {
  "use strict";	
  
  var width = 900,
      height = 1400,
      tooltip = DisplayTooltip("vehicles_tooltip", 240),
      layout_gravity = 0.21,
      damper = 0.25,
      nodes = [],
      vis, force, circles, radius_scale;

  var center = {x: width - 400, y: 200};

  var weather_cond = {
      "rainy": {x: 470, y: 250},
      "foggy": {x: 530, y: 250},
      "snowy": {x: 560, y: 300},
      "sunny": {x: 430, y: 300}
    };
	
 var road_cond = {
      "dry": {x: 270, y: 200},
      "snowy": {x: 650, y: 120},
 	    "icy": {x: 650, y: 270},
      "wet": {x: 240, y: 365}
    };
	

	
 var no_fatalities = {
      "0": {x: 470, y: 50},
      "1": {x: 470, y: 150},
      "2": {x: 470, y: 250},
	    "3": {x: 470, y: 350},
      "4": {x: 470, y: 450},
      "5": {x: 470, y: 550},
      "6": {x: 470, y: 650},
      "7": {x: 470, y: 750},
      "8": {x: 470, y: 850},
      "9": {x: 470, y: 950},
      "10": {x: 470, y: 1050}
    };	
	
	
	 var no_vehicles = {
     
      "1": {x: 470, y: -50},
      "2": {x: 470, y: 0},
	    "3": {x: 470, y: 50},
      "4": {x: 470, y: 100},
      "5": {x: 470, y: 150},
      "6": {x: 470, y: 200},
      "7": {x: 470, y: 250},
      "8": {x: 470, y: 300},
      "9": {x: 470, y: 350},
      "10": {x: 470, y: 400},
      "11": {x: 470, y: 450},
      "12": {x: 470, y: 500},
      "13": {x: 470, y: 550},
	    "14": {x: 470, y: 600},
      "15": {x: 470, y: 650},
      "16": {x: 470, y: 700},
      "17": {x: 470, y: 800},
      "18": {x: 470, y: 900},
      "19": {x: 470, y: 1000},
      "20": {x: 470, y: 1100}
    };	

  var fill_color = d3.scale.ordinal()
                  .domain(["rainy", "sunny", "snowy", "foggy"])
      .range(["#f2f2f2", "#eeeee", "#5701ff", "#01deff"])


  function custom_chart(data) {
    var max_amount = d3.max(data, function(d) { return parseInt(d.vehicles_involved, 30); } );
    radius_scale = d3.scale.pow().exponent(0.6).domain([0, max_amount]).range([0, 24]);

    data.forEach(function(d){
      var node = {
        id: d.id,
        radius: radius_scale(parseInt(d.vehicles_involved, 10)),
        fatalities: d.fatalities,
        date: d.date,
        location: d.location,
        vehicles: d.vehicles_involved,
        group: d.location,
        weather_cond: d.weather_conditions,
        road: d.road_conditions,
		asset: d.driver_age,
		name_asset: d.driver_gender,
        x: Math.random() * 900,
        y: Math.random() * 800
	
      };
    //document.write(d.id.length);
      nodes.push(node);
    });

	



    nodes.sort(function(a, b) {return b.fatalities- a.fatalities; });

	
	//document.write(nodes.length);
	
    vis = d3.select("#vis").append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("id", "svg_vis");
	
    circles = vis.selectAll("circle")
                 .data(nodes, function(d) { return d.id ;});

    circles.enter().append("circle")
      .attr("r", 1)
      .attr("fill", function(d) { return fill_color(d.weather_cond) ;})
      .attr("stroke-width", 2)
      .attr("stroke", "#fff")
      .attr("id", function(d) { return  "bubble_" + d.id; })
      .on("mouseover", function(d, i) {show_details(d, i, this);} )
      .on("mouseout", function(d, i) {hide_details(d, i, this);} );
      
      

    circles.transition().duration(3000).attr("r", function(d) { return d.radius; });
  }

  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 1;
  }
  
  

  function start() {
    force = d3.layout.force()
            .nodes(nodes)
            .size([width, height]); 
            
  }
  
/***** *******/

  function display_group_all() {
  	
  
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
         .on("tick", function(e) {
            circles.each(move_towards_center(e.alpha))
                   .attr("cx", function(d) {return d.x;})
                   .attr("cy", function(d) {return d.y;});
         });
    force.start();
    
    //hide_weather_cond();
  }

  function move_towards_center(alpha) {
    return function(d) {
   
      d.x = d.x + (center.x - d.x) * (damper + 0.0) * alpha;
      d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    };
  }

/*** ***************/  
 
  function display_by_weather_cond() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_weather_cond(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();
    display_weather_cond();	
  }

  function move_towards_weather_cond(alpha) {
    return function(d) {
      var target = weather_cond[d.weather_cond];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };	
  }


  function display_weather_cond() {
      var weather_cond_x = {};
      var weather_cond_data = d3.keys(weather_cond_x);
      var weather_cond = vis.selectAll(".weather_cond")
                 .data(weather_cond_data);

                 weather_cond.enter().append("text")
                   .attr("class", "weather_cond")
                   .attr("x", function(d) { return weather_cond_x[d]; }  )
                   .attr("y", 40)
                   .attr("text-anchor", "middle")
                   .text(function(d) { return d;});
				   
	vis.selectAll(".weather_cond").size = function() {
		var n = 0;
		this.each(function() { ++n; });
		return n;
	};	

  }

/**** *******/
 
function display_by_vehicles() {
  force.gravity(layout_gravity)
       .charge(charge)
       .friction(0.7)
      .on("tick", function(e) {
        circles.each(move_towards_vehicles(e.alpha))
               .attr("cx", function(d) {return d.x;})
               .attr("cy", function(d) {return d.y;});
      });
  force.start();
  display_vehicles();
}

function move_towards_vehicles(alpha) {
  return function(d) {
    var target = no_vehicles[d.vehicles];
    d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
    d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
  };
}


function display_vehicles() {
    var vehicless_x = {};
    var vehicles_data = d3.keys(vehicles_x);
    var vehicles = vis.selectAll(".vehciles")
               .data(vehciles_data);

               vehciles.enter().append("text")
                 .attr("class", "vehciles")
                 .attr("x", function(d) { return vehciles_x[d]; }  )
                 .attr("y", 40)
                 .attr("text-anchor", "middle")
                 .text(function(d) { return d;});
}

/**** *******/
 
  function display_by_fatalities() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.7)
        .on("tick", function(e) {
          circles.each(move_towards_fatalities(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();
    display_fatalities();
  }

  function move_towards_fatalities(alpha) {
    return function(d) {
      var target = no_fatalities[d.fatalities];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }


  function display_fatalities() {
      var fatalities_x = {};
      var fatalities_data = d3.keys(fatalities_x);
      var fatalities = vis.selectAll(".fatalities")
                 .data(fatalities_data);

      fatalities.enter().append("text")
                   .attr("class", "fatalities")
                   .attr("x", function(d) { return fatalities_x[d]; }  )
                   .attr("y", 40)
                   .attr("text-anchor", "middle")
                   .text(function(d) { return d;});
  }

/**** *******/
 
function display_by_road_cond() {
  force.gravity(layout_gravity)
       .charge(charge)
       .friction(0.7)
      .on("tick", function(e) {
        circles.each(move_towards_road_cond(e.alpha))
               .attr("cx", function(d) {return d.x;})
               .attr("cy", function(d) {return d.y;});
      });
  force.start();
  display_road_cond();
}

function move_towards_road_cond(alpha) {
  return function(d) {
    var target = road_cond[d.road];
    d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
    d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
  };
}

function display_road_cond() {
    var road_cond_x = {};
    var road_cond_data = d3.keys(road_cond_x);
    var road_cond = vis.selectAll(".road_cond")
               .data(road_cond_data);

               road_cond.enter().append("text")
                 .attr("class", "road_cond")
                 .attr("x", function(d) { return road_cond_x[d]; }  )
                 .attr("y", 40)
                 .attr("text-anchor", "middle")
                 .text(function(d) { return d;});
}

/*
function hide_road_cond() {
    var road_cond = vis.selectAll(".road_cond").remove();
}
*/

/**** *******/

  function show_details(data, i, element) {
    d3.select(element).attr("stroke", "white");
    var content = "<span class=\"location\">Location: </span><span class=\"fatalities\"> <b>" + data.location + "</b></span><br/>";
    content +="<span class=\"location\">Fatalities: </span><span class=\"fatalities\"><b>" + data.fatalities + "</b></span><br/>";
    content +="<span class=\"location\">Weather condition: </span><span class=\"fatalities\"> <b>" + data.weather_cond + "</b></span><br>";
    content +="<span class=\"location\">Road condition: </span><span class=\"fatalities\"> <b>" + data.road + "</b></span><br>";
	content +="<span class=\"location\">Vehicle involved: </span><span class=\"fatalities\"> <b>" + data.vehicles + "</b></span><br>";
	content +="<span class=\"location\">Driver Age: </span><span class=\"fatalities\"> <b>(" + data.asset + ")</b> </span>";
    tooltip.showTooltip(content, d3.event);
  }

  function hide_details(data, i, element) {
    d3.select(element).attr("stroke", function(d) { return d3.rgb(fill_color(d.weather_cond)).darker();} );
    tooltip.hideTooltip();
  }

  var my_mod = {};
  my_mod.init = function (_data) {
    custom_chart(_data);
    start();
  };

  my_mod.display_all = display_group_all;
  my_mod.display_weather_cond = display_by_weather_cond;
  my_mod.display_vehicles = display_by_vehicles;
  my_mod.display_fatalities = display_by_fatalities;
  my_mod.road_cond = display_by_road_cond;
  
  my_mod.toggle_view = function(view_type) {
    if (view_type == 'weather_cond') {
      display_by_weather_cond();
    } else if (view_type == 'vehicles'){
      display_by_vehicles();
      } else if (view_type == 'all'){
      display_group_all();
     } else if (view_type == 'road_cond'){
      display_by_road_cond();
      }  else if (view_type == 'fatalities'){
      display_by_fatalities();
      }
	  else {
	  display_group_all();
	  }
    };

  return my_mod;
})(d3, DisplayTooltip);


$(document).ready(function() {
  $('#view_selection a').click(function() {
  var view_type = $(this).attr('id');
  $('#view_selection a').removeClass('active');
  $(this).toggleClass('active');
  bubble_chart.toggle_view(view_type);
  return false;
});

});


function DisplayTooltip(tooltipId, width){
	var tooltipId = tooltipId;
	$("body").append("<div class='tooltip' id='"+tooltipId+"'></div>");
	
	if(width){
		$("#"+tooltipId).css("width", width);
	}
	
	hideTooltip();
	
	function showTooltip(content, event){
		$("#"+tooltipId).html(content);
		$("#"+tooltipId).show();
		
		updatePosition(event);
	}
	
	function hideTooltip(){
		$("#"+tooltipId).hide();
	}
	
	function updatePosition(event){
		var ttid = "#"+tooltipId;
		var xOffset = 20;
		var yOffset = 10;
		
		 var ttw = $(ttid).width();
		 var tth = $(ttid).height();
		 var wscrY = $(window).scrollTop();
		 var wscrX = $(window).scrollLeft();
		 var curX = (document.all) ? event.clientX + wscrX : event.pageX;
		 var curY = (document.all) ? event.clientY + wscrY : event.pageY;
		 var ttleft = ((curX - wscrX + xOffset*2 + ttw) > $(window).width()) ? curX - ttw - xOffset*2 : curX + xOffset;
		 if (ttleft < wscrX + xOffset){
		 	ttleft = wscrX + xOffset;
		 } 
		 var tttop = ((curY - wscrY + yOffset*2 + tth) > $(window).height()) ? curY - tth - yOffset*2 : curY + yOffset;
		 if (tttop < wscrY + yOffset){
		 	tttop = curY + yOffset;
		 } 
		 $(ttid).css('top', tttop + 'px').css('left', ttleft + 'px');
	}
	
	return {
		showTooltip: showTooltip,
		hideTooltip: hideTooltip,
		updatePosition: updatePosition
	}
}

























