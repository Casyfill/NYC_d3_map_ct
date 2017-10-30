if ($(window).width() >= 770) {
    width = $(window).width() * 0.666;
} else {
    width = $(window).width()
}
var height = $(window).height()

var formatPercent = d3.format(".0%");

//  MAP
var projection = d3.geoMercator()
    .center([-73.98, 40.72])
    .scale(width * 74)
    .translate([(width) / 2, (height) / 2]);

console.log(projection([-73.98, 40.72]));

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#svg-container")
    .append("svg")
    .attr("class", "map");

var scatter;
var dd = d3.select('#myDropdown')

var gradient = d3.scaleLinear().domain([6, 7, 11]).range(['#CEF4FF', '#00AEFF', '#01679E']);
var legend = colorbar();
// svg.append('text')
//    .attr("id", "histtitle")
//    .text("Household Income, Normalized")
//    .attr("transform", 'translate(4,4)');

var hist_height = Math.round(.24 * (d3.select('#stats').node().getBoundingClientRect()['height'] - 146 - 4 * 42));
var hist_width = d3.select('#comm_stats').node().getBoundingClientRect()['width'];
console.log(d3.select('#stats').node().getBoundingClientRect()['height'], hist_height);

var hist1 = d3.select("#income_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", hist_height + "px")

var hist2 = d3.select("#owners_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", hist_height + "px")

var hist3 = d3.select("#commute_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", hist_height + "px")

var hist4 = d3.select("#age_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", hist_height + "px")

var y = d3.scaleLinear()
    .domain([0, .3])
    .range([hist_height - 20, 0]);


var x1 = d3.scaleLinear()
    .domain([0, 100000])
    .rangeRound([10, hist_width - 20]);

var x2 = d3.scaleLinear()
    .domain([0, 1.0])
    .rangeRound([10, hist_width - 20]);

var x3 = d3.scaleLinear()
    .domain([0, 50])
    .rangeRound([10, hist_width - 20]);


var x4 = d3.scaleLinear()
    .domain([0, 50])
    .rangeRound([10, hist_width - 20]);


var hist_income = d3.histogram()
    .domain(x1.domain())
    .value(function(d) {
        return d.median_income
    });


var hist_owners = d3.histogram()
    .domain(x2.domain())
    .value(function(d) {
        return d.owner_occupied_housing_units
    });

var hist_comm = d3.histogram()
    .domain(x3.domain())
    .value(function(d) {
        return d.mean_commute_minutes
    });

var hist_age = d3.histogram()
    .domain(x3.domain())
    .value(function(d) {
        return d.age
    });


function update_histograms(comm) {

    new_bins1 = hist_income(comm);
    new_bins2 = hist_owners(comm);
    new_bins3 = hist_comm(comm);
    new_bins4 = hist_age(comm);

    myHist1.data(new_bins1)
        .transition()
        .attr("transform", function(d) {
            return "translate(" + x1(d.x0) + "," + y(d.length / comm.length) + ")";
        })
        .attr("height", function(d) {
            return hist_height - 20 - y(d.length / comm.length);
        });

    myHist2.data(new_bins2)
        .transition()
        .attr("transform", function(d) {
            return "translate(" + x2(d.x0) + "," + y(d.length / comm.length) + ")";
        })
        .attr("height", function(d) {
            return hist_height - 20 - y(d.length / comm.length);
        });

    myHist3.data(new_bins3)
        .transition()
        .attr("transform", function(d) {
            return "translate(" + x3(d.x0) + "," + y(d.length / comm.length) + ")";
        })
        .attr("height", function(d) {
            return hist_height - 20 - y(d.length / comm.length);
        });

    myHist4.data(new_bins4)
        .transition()
        .attr("transform", function(d) {
            return "translate(" + x4(d.x0) + "," + y(d.length / comm.length) + ")";
        })
        .attr("height", function(d) {
            return hist_height - 20 - y(d.length / comm.length);
        });
}
// geography

var bs = svg.append("g").attr('id', 'boros');
var cts = svg.append("g").attr('id', 'cts');

var t = textures.lines()
    .size(3)
    .strokeWidth(.5)
    .stroke("white")
    .background("grey");

svg.call(t);

var MODE = 'part_all_';
var comm_stats;
var all_comm_stats;
var data;

//  Community colors
var comm_colors = ["red", "blue", "green", "yellow", "purple",
    "orange", "teal", "pink", "steelblue", 'magenta',
    "black", "grey", "darkgreen", "darkred", "darkblue",
    "lime", "beige", 'burlywood', "darkseagreen", 'darkslategray', 'forestgreen', 'khaki', 'lightsalmon',
    'mediumturquoise', 'olivedrab', 'plum', 'salmon', 'sandybrown'
];




// color for communities, NA texture elsewise
get_color = function(d, mode) {

    if (!isNaN(d.properties[mode])) {
        return comm_colors[d.properties[mode]];
    } else {
        return t.url()
    }
}




//  Right Side
var card = d3.select("#infocard")

// CT table
var ct_table = d3.select("#infocard")
    .append('table')
    .attr('class', 'fixed')
    .attr('id', 'ct_table');

var ct_tbody = ct_table.append('tbody');

// Community tab;e
var cm_table = d3.select("#stats_container")
    .append('table')
    .attr('class', 'fixed')
    .attr('id', 'cm_table');

var cm_tbody = cm_table.append('tbody');


function handleMouseOver(d, i) {
    // Add interactivity
    // console.log(MODE, 'Tract:', d.properties);
    if (MODE == 'part_user_h'){
        var lmode = 'part_user'
    } else {var lmode = MODE};


    if (!isNaN(d.properties[lmode])) {
        decolorize_other_communities(d, i, lmode);
        populate_ct_table(d, i, );
        populate_cm_table(get_community_datas(d.properties[lmode], all_comm_stats[lmode]),i, lmode);
        // console.log(d.properties[lmode]);
        update_histograms(data.filter(function(dd) {
            return dd[lmode] == d.properties[lmode]
        }))
    }
}


function handleMouseOut(d, i) {
    empty_table(null_ct, ct_tbody);

    if(MODE == 'part_user' || MODE == 'part_user_h'){
        empty_table(null_cm_users, cm_tbody);
    } else {
        empty_table(null_cm, cm_tbody);
    }
    
    colorize_back();
    update_histograms(data);
}


//  LOAD DATA
d3.queue(3)
    .defer(d3.json, "data/geo/ct2010s.json")
    .defer(d3.csv, "data/communities/2017_10_15_combined_data.csv")
    .defer(d3.json, "data/communities_stats/communities_stats4.json")
    .defer(d3.csv, "data/users/2017_10_15_users.csv")
    .await(ready);


function ready(error, nyc, csv_data, comm_properties, userpoints) {
    if (error) throw error;
    populate_empty_table(null_ct, ct_tbody);
    populate_empty_table(null_cm, cm_tbody);


    scatter = svg.append("g")
        .attr("class", "points")
        .selectAll("circle")
        .data(userpoints)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", .7)
        .attr("pointer-events", "none")
        .attr("transform", function(d) {
            return "translate(" + projection([d.lat, d.lon]) + ")";
        })
        .style('fill-opacity', .4)
        .style('fill', function(d) {
            return comm_colors[d.Community]
        })
        .style("visibility", "hidden");

    data = csv_data;
    data['part_user_h'] = data['part_user'];
    comm_properties['part_user_h'] = comm_properties['part_user'];
    all_comm_stats = get_all_community_stats(data, comm_properties);
    var fresh_ctss = topojson.feature(nyc, nyc.objects.ct2010).features;

    var csv = {};
    data.forEach(function(d, i) {
        csv[d.geoid] = d
    })

    fresh_ctss.forEach(function(e, j) {
        e.properties.part_all_ = Math.round(parseFloat(csv[e.properties.geoid]['part_all_']))
        e.properties.part_hidden_ = Math.round(parseFloat(csv[e.properties.geoid]['part_hidden_']))
        e.properties.part_recipr_ = Math.round(parseFloat(csv[e.properties.geoid]['part_recipr_']))
        e.properties.part_user = Math.round(parseFloat(csv[e.properties.geoid]['part_user']))
        e.properties.part_user_h = Math.round(parseFloat(csv[e.properties.geoid]['part_user']))
        e.properties.population = parseInt(csv[e.properties.geoid].population)
        e.properties.income = parseInt(csv[e.properties.geoid].median_income)
        e.properties.own_occupied = parseFloat(csv[e.properties.geoid].owner_occupied_housing_units)
        e.properties.age = parseFloat(csv[e.properties.geoid].age)
        e.properties.commute = parseFloat(csv[e.properties.geoid].mean_commute_minutes)
    })

    cts.selectAll(".tract")
        .data(fresh_ctss)
        .enter()
        .append("path")
        .attr("class", "tract")
        .attr("d", path)
        .attr("id", function(d) {
            return d.properties.geoid;
        })
        .attr("nhd_name", function(d) {
            return d.properties.NTAName;
        })
        .style('opacity', 0.9)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .style('fill', function(d) {
            return get_color(d, MODE)
        })

    // filtered_data = data.filter(function(d){ return $.isNumeric(d.median_income)})
    // console.log(filtered_data);
    bins1 = hist_income(data);
    bins2 = hist_owners(data);
    bins3 = hist_comm(data);
    bins4 = hist_age(data);

    // console.log('Histogram', bins.map(function(d){ return d.length/data.length}));
    myHist1 = hist1.selectAll("rect")
        .data(bins1)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + (x1(d.x0)) + "," + (hist_height - 20 - y(d.length / data.length)) + ")";
        })
        .attr("width", function(d) {
            return x1(d.x1) - x1(d.x0);
        })
        .attr("height", function(d) {
            return y(d.length / data.length);
        })
        .style("fill", t.url());

    hist1.append("g")
        .attr("transform", "translate(0," + (hist_height - 17) + ")")
        .call(d3.axisBottom(x1))

    myHist2 = hist2.selectAll("rect")
        .data(bins2)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + (x2(d.x0)) + "," + (hist_height - 20 - y(d.length / data.length)) + ")";
        })
        .attr("width", function(d) {
            return x2(d.x1) - x2(d.x0);
        })
        .attr("height", function(d) {
            return y(d.length / data.length);
        })
        .style("fill", t.url());

    hist2.append("g")
        .attr("transform", "translate(0," + (hist_height - 17) + ")")
        .call(d3.axisBottom(x2)
            .tickFormat(formatPercent));

    myHist3 = hist3.selectAll("rect")
        .data(bins3)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + (x3(d.x0)) + "," + (hist_height - 20 - y(d.length / data.length)) + ")";
        })
        .attr("width", function(d) {
            return x3(d.x1) - x3(d.x0);
        })
        .attr("height", function(d) {
            return y(d.length / data.length);
        })
        .style("fill", t.url());

    hist3.append("g")
        .attr("transform", "translate(0," + (hist_height - 17) + ")")
        .call(d3.axisBottom(x3))


    myHist4 = hist4.selectAll("rect")
        .data(bins4)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + (x4(d.x0)) + "," + (hist_height - y(d.length / data.length) - 20) + ")";
        })
        .attr("width", function(d) {
            return x4(d.x1) - x4(d.x0) - 1;
        })
        .attr("height", function(d) {
            return y(d.length / data.length);
        })
        .style("fill", t.url());

    hist4.append("g")
        .attr("transform", "translate(0," + (hist_height - 17) + ")")
        .call(d3.axisBottom(x4))

}




// RESIZE
d3.select(window).on('resize', MapSizeChange);

function MapSizeChange() {

    console.log('resizing!')
    if ($(window).width() >= 770) {
        width = $(window).width() * 0.666;
    } else {
        width = $(window).width()
    }
    var height = $(window).height()

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(width * 78);

    // resize the map
    cts.selectAll(".tract").attr('d', path);
    scatter.attr("transform", function(d) {
        return "translate(" + projection([d.lat, d.lon]) + ")";
    })

}


//  DECOLORIZE OTHER COMMUNITIES
function decolorize_other_communities(d, i) {

    cts.selectAll(".tract")
        .filter(function(dd) {
            return dd.properties[MODE] != d.properties[MODE];
        }) // <== This line
        .style('opacity', .2);
}

function colorize_back(d, i) {
    cts.selectAll(".tract")
        .style('opacity', .9);
}



function update_partition(MODE) {
    console.log('updation partition')
    if (MODE === "part_user") {


        cts.selectAll(".tract")
            .style('fill-opacity', 0.5)
            .style('fill', function(d) {
                return get_color(d, MODE)
            })
        // console.log(scatter);
        scatter.style("visibility", 'visible');
        legend.style("visibility", "hidden");

        console.log('change table!');
        empty_table(null_cm_users, cm_tbody);

    } else if (MODE === "part_user_h") {
        console.log('!!!!')
        scatter.style("visibility", "hidden");
        legend.style("visibility", "visible")


        cts.selectAll(".tract")
            .style('fill-opacity', .9)
            .style('fill', function(d) {
                if (!isNaN(d.properties[MODE])) {
                // console.log(all_comm_stats);
                var community = get_community_datas(d.properties['part_user'], all_comm_stats['part_user']);
                return gradient(community["value"]['OpinionChange']);
                } else {return t.url();}
            })

        empty_table(null_cm_users, cm_tbody);

    }else {

        scatter.style("visibility", "hidden");
        legend.style("visibility", "hidden");

        cts.selectAll(".tract")
            .style('fill-opacity', .9)
            .style('fill', function(d) {
                return get_color(d, MODE)
            })

        empty_table(null_cm, cm_tbody);
    }
}


$('.dropdown-menu a').click(function(d) {
        g = this;
        dd.select("button").text(g.text) // switch header
        
        MODE = g.getAttribute("value");
        console.log(MODE);
        update_partition(MODE);

    });


$('.btn').button();
$("#download_btn").click(function(d) {
    console.log('downoload!')
});




function colorbar(){
      var key = svg.append('g')
                   .attr("id", "legend")
                   .attr("width", 120).attr("height", 300)
                   .attr("transform", "translate(12,150)");

      var legend = key.append("defs").append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("y1", "100%").attr("x1", "0%")
        .attr("y2", "0%").attr("x2", "0%")
        .attr("spreadMethod", "pad");

      legend.append("stop").attr("offset", "0%")
        .attr("stop-color", '#D4ECFA')
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "50%")
        .attr("stop-color", '#53baf3')
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "100%")
        .attr("stop-color", '#004C74')
        .attr("stop-opacity", 1);

      key.append("rect")
         .attr("width", 10)
         .attr("height", 300)
         .style("fill", "url(#gradient)")

      var y = d3.scaleLinear().range([0, 300]).domain([11, 6]);
      var yAxis = d3.axisRight(y)
                    .tickValues([6, 
                                 (6 + 11)/2,
                                 11])
                    .tickFormat(ff);

      key.append("g")
         .attr("class", "y axis")
         .call(yAxis)
         .attr("transform", "translate(15, 0)")
         .append("text")
         .attr("dy", ".62em")
         .style("text-anchor", "start")
         .text('Susceptibility_hidden');

      key.style("visibility", "hidden");
      return key;
}