

$(document).ready(function(){
$.ajax({
  url: "/data",
  type: "get",
  dataType: "json",
  async: false,
  success: function(data){
  	console.log(data)
  	//drawCircles(data)
  }
});
})

