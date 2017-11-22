
function get_community_stats(csv_data, comm_column){
	var data = d3.nest()
	  .key(function(d) { return d[comm_column];})
	  .rollup(function(d) {
	  	    return {
		        population: d3.sum(d, function(g) {return g.population; }),
		        tracts: d.length
		    	};
	  }).entries(csv_data);

	return data
}

function get_all_community_stats(csv_data, comm_properties){
	var all_comm_stats = {}; //= comm_properties;
	var comm_columns = ['part_all_','part_hidden_','part_recipr_', 'part_user'];

	comm_columns.forEach(function(comm_column, i){
		var data = d3.nest()
		  .key(function(d) { return d[comm_column];})
		  .rollup(function(d) {
		  	    return {
			        population: d3.sum(d, function(g) {return g.population; }),
			        tracts: d.length
			    	};
		  }).entries(csv_data);


		  data.forEach(function(d,i){
		  	var result = comm_properties[comm_column].filter(function(dd) {
        		return dd.key == d.key;});

		  	cols = ["communityUsers"];

            if(comm_column == 'part_user'){
            	cols = cols.concat(["Susceptibility", "SusceptibilityPred", "NetworkClosedness",
                                    "SpatialDiversity", "NetworkDensity",
                                    "HashtagEntropy","LanguageEntropy"]);
            } else {
            	cols = cols.concat(["communityOutConnections", "communityInConnections", "communityInternalConnections"]);
            }
            for (var i = 0; i < cols.length; i++){
            		col = cols[i];
    				d.value[col] = (result[0] !== undefined) ? result[0][col] : null;
    			}
		  })

		  all_comm_stats[comm_column] = data
	 })

	return all_comm_stats;
}



function get_community_datas(i, comm_stats){
	return comm_stats.filter(function(d){ return d.key == i })[0]
}

var download = function(content, fileName, mimeType) {
  var a = document.createElement('a');
  mimeType = mimeType || 'application/octet-stream';

  if (navigator.msSaveBlob) { // IE10
    navigator.msSaveBlob(new Blob([content], {
      type: mimeType
    }), fileName);
  } else if (URL && 'download' in a) { //html5 A[download]
    a.href = URL.createObjectURL(new Blob([content], {
      type: mimeType
    }));
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
  }
}

function download_comm(MODE){
	// console.log(MODE);
	var data = []
		  config = {quotes: false,
								quoteChar: '"',
								delimiter: ",",
								header: true,
								newline: "\r\n"
							};

	all_comm_stats[MODE].forEach(function(d){d['value']["Community"] = parseInt(d["key"]); data.push(d['value'])});
	console.log(data);
	csvContent = Papa.unparse(data, config);
	download(csvContent, 'community_stats_' + MODE + '.csv', 'text/csv;encoding:utf-8');
}
