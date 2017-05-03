if($(window).width() >=770){
  width = $(window).width()*0.666;
} else { width = $(window).width()}
var height = $(window).height()


//  MAP
var projection = d3.geoMercator()
  .center([-73.98, 40.72])
  .scale(width*74)
  .translate([(width) / 2, (height) / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#svg-container")
  .append("svg")
  .attr("class", "map");

// svg.append('text')
//    .attr("id", "histtitle")
//    .text("Household Income, Normalized")
//    .attr("transform", 'translate(4,4)');

var hist_height = .05  * $(window).height();
var hist_width = .3 * $(window).width();
var hist = d3.select("#histogram_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", "13vh")
    // .style("margin-top","6vh")
    // .attr("transform", "translate(5, 0)")
var myHist;
var y = d3.scaleLinear()
          .domain([0,.3])
          .range([hist_height, 0]);
var x = d3.scaleLinear()
          .domain([0,100000])
          .rangeRound([3, hist_width-5]);

var histogram = d3.histogram()
    .domain(x.domain())
    .value(function(d) { return d.median_income });
  
function update_histogram(comm){

    new_bins = histogram(comm);
    console.log(new_bins);
    myHist.data(new_bins)
          .transition()
          .attr("transform", function(d) {
                   return "translate(" + x(d.x0) + "," + y(d.length/comm.length) + ")"; })
          .attr("height", function(d) { return hist_height - y(d.length/comm.length); });
}
// geography
  
var bs = svg.append("g").attr('id','boros');
var cts = svg.append("g").attr('id','cts');

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
var comm_colors = [ "red", "blue", "green", "yellow", "purple",
                    "orange", "teal", "pink", "steelblue", 'magenta',
                    "black", "grey", "darkgreen", "darkred", "darkblue",
                    "lime", "beige", "azure", "aliceblue", 'burlywood', 
                    "darkseagreen", 'darkslategray', 'forestgreen', 'khaki','lightsalmon',
                    'mediumturquoise', 'olivedrab', 'plum', 'salmon', 'sandybrown'];




// color for communities, NA texture elsewise
get_color = function(d, mode) {

  if (! isNaN(d.properties[mode])){
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


function handleMouseOver(d, i) {  // Add interactivity
  // console.log(MODE, 'Tract:', d.properties)
  if (! isNaN(d.properties[MODE])) {
    decolorize_other_communities(d,i, MODE);
    populate_ct_table(d,i, MODE);
    populate_cm_table(get_community_datas(d.properties[MODE], all_comm_stats[MODE]));
    update_histogram(data.filter(function(dd){return dd[MODE] == d.properties[MODE]}))
  }
}


function handleMouseOut(d, i) {
  empty_table(null_ct, ct_tbody);
  empty_table(null_cm, cm_tbody);
  colorize_back();
  update_histogram(data);
  }


//  LOAD DATA
d3.queue(3)
  .defer(d3.json, "data/ct2010s.json")
  .defer(d3.csv, "data/combined_data2.csv")
  .defer(d3.json, "data/communities_stats2.json")
  .await(ready);


function ready(error, nyc, csv_data, comm_properties){
  if (error) throw error;
  populate_empty_table(null_ct, ct_tbody);
  populate_empty_table(null_cm, cm_tbody);

  data = csv_data;
  all_comm_stats = get_all_community_stats(data, comm_properties);
  // console.log(all_comm_stats);
  var fresh_ctss = topojson.feature(nyc, nyc.objects.ct2010).features;  
  
  var csv = {};
  data.forEach(function(d, i){
          csv[d.geoid] = d
  })

  fresh_ctss.forEach(function(e, j) {
        e.properties.part_all_ = parseFloat(csv[e.properties.geoid]['part_all_'])
        e.properties.part_hidden_ = parseFloat(csv[e.properties.geoid]['part_hidden_'])
        e.properties.part_recipr_ = parseFloat(csv[e.properties.geoid]['part_recipr_'])
        e.properties.population = parseInt(csv[e.properties.geoid].population)
        e.properties.income = parseInt(csv[e.properties.geoid].median_income)
      })

  cts.selectAll(".tract")
              .data(fresh_ctss)
              .enter()
              .append("path")
              .attr("class", "tract")
              .attr("d", path)
              .attr("id", function(d) {
                return d.properties.geoid;})
              .attr("nhd_name", function(d) {
                return d.properties.NTAName;})
              .style('opacity', 0.8)
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut)
              .style('fill', function(d) { return get_color(d, MODE)})

  // filtered_data = data.filter(function(d){ return $.isNumeric(d.median_income)})
  // console.log(filtered_data);
  bins = histogram(data);
  // console.log(bins);
  // console.log('Histogram', bins.map(function(d){ return d.length/data.length}));
  myHist = hist.selectAll("rect")
                   .data(bins)
                   .enter().append("rect")
                   .attr("class", "bar")
                   .attr("x", 1)
                   .attr("transform", function(d) {
                   return "translate(" + x(d.x0) + "," + y(d.length/data.length) + ")"; })
                   .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                   .attr("height", function(d) { return hist_height - y(d.length/data.length); })
                   .style("fill", t.url());

  hist.append("g")
      .attr("transform", "translate(0," + hist_height + ")")
      .call(d3.axisBottom(x))

}
  
  


// RESIZE
d3.select(window).on('resize', MapSizeChange);

function MapSizeChange() {
      // var ratio  = Math.min($(window).height()/initial_height, $(window).width() / initial_width);
    //   // d3.select("svg").attr("transform", "scale(" + ratio + ")");
    console.log('resizing!')
    if($(window).width() >=770){
        width = $(window).width()*0.666;
    } else { width = $(window).width()}
    var height = $(window).height() 

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(width*78);

    // resize the map
    cts.selectAll(".tract").attr('d', path);

}


//  DECOLORIZE OTHER COMMUNITIES
function decolorize_other_communities(d,i){
  
  cts.selectAll(".tract")
       .filter(function(dd) { return dd.properties[MODE] != d.properties[MODE]; })        // <== This line
       .style('opacity', .2 );
}

function colorize_back(d, i){
  cts.selectAll(".tract")
     .style('opacity', 0.8);
} 


// RADIO BUTTON SWITCH
$('input[type="radio"]').on('change', function(e) {
    MODE = document.querySelector('input[name="partition"]:checked').value;
    console.log('Mode is:', MODE);
    update_partition(MODE);
});


function update_partition(MODE){
  cts.selectAll(".tract")
     .style('fill', function(d) { return get_color(d, MODE)})

}