
get_boroughs = function(ct){
    
        bs.selectAll(".boro")
            .data(topojson.merge(ct, ct.objects.ct2010.geometries))
            .enter().append("path")
            .attr("class", "boro")
            .attr("d", path)
      
};
