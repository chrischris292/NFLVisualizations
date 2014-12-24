

$(document).ready(function(){
$.ajax({
  url: "/playCount",
  type: "get",
  dataType: "json",
  async: false,
  success: function(data){
  	console.log(data)
  	//drawCircles(data)
  }
});
})

