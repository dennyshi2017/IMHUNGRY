$(function(){

	var URL = 'https://imhungry-app.herokuapp.com';
	var PERPAGE = 9;
	var pages;
	var currentPage;
	var stores = [];
	var sIdToUpdate;
	var firstLoad;

	$.ajax({
		method: 'GET',
		url: URL + '/restaurant'
	})
	.done(function(storeArray){
		var storeCount = 0;
		for(var i = 0; i < storeArray.length; i++) {
			if(typeof(storeArray[i].name) != 'undefined'){
				stores.push(storeArray[i]);
			}
		}
		pages = Math.ceil(stores.length / PERPAGE);
		firstLoad = true;
	});

	$( document ).ajaxComplete(function() {
		if(firstLoad == true){
			showpage(stores, 1);

			showPageIndex(stores, pages);
		}

	});

	function showPageIndex(storeList, pages){
		for(var i = 1; i <= pages; i++){
			$('<button>').addClass('page-btn').text(i).appendTo($('#pages'));
		}

		$('#pages button').click(function(){
			$('.store-container').html('');	
			$('<div>').attr('id', 'bg').appendTo($('.store-container'));
			//$('#pages button').css('color', '#34bdbb');
			$(this).siblings().css('color', '#34bdbb');
			$(this).css('color', 'black');
			currentPage = $(this).text();
			showpage(storeList, currentPage);
		});
	}

	function showpage(storeList, page){
		var last = PERPAGE * page > storeList.length ? storeList.length : PERPAGE * page;

		var selected = storeList.slice(PERPAGE * (page-1), last);

		for (var i = 0; i < selected.length; i++){
			appendStore(selected[i]);
		}
		hoverOnStore();
		execStore();
	}

	$("#btn-addS").click(function(){
		//setTimeout(function(){
			$("#bg").fadeIn(1000);
			$("#add-store").slideDown(500);
			sIdToUpdate = "";
			//$("#addStoreForm")[0].reset();
			$("#addStoreForm").trigger("reset");
		//}, 500);
	});

	$("#bg").click(function(){
		$("#bg").fadeOut(1000);
		$("#add-store").slideUp(500);		
	});

//add new or update store
	$("#addStoreForm").submit(function(e){
		e.preventDefault();

		var store = {
			name: $("#sName").val(),
			type: $("#sType").val(),
			address: $("#sAddress").val(),
			image: $("#sImg").val()
		};
		firstLoad = false;

		if(sIdToUpdate == "") {
			$.ajax({
				method: 'POST',
				url: URL + '/restaurant',
				data: JSON.stringify(store),
				//dataType: 'json',
				contentType: 'application/json',
				success: function(response){
					$("#add-store").hide();
					showHintBox(store.name, "created");

					setTimeout(function(){
						hideHintBox();
						stores.push(response);
						pages = Math.ceil(stores.length / PERPAGE);

						if($(".store-container").children(".store").length < 9){	
							appendStore(response);
							hoverOnStore();
							execStore();
						}
						else{
							$('#pages').empty();
							showPageIndex(stores, pages);
						}
					}, 2000);	
				
				}
			});
		}
		else{
			$.ajax({
				method: 'PUT',
				url: URL + '/restaurant/' + sIdToUpdate,
				data: JSON.stringify(store),
				//dataType: 'json',
				contentType: 'application/json',
				success: function(response){
					$("#add-store").hide();
					showHintBox(store.name, "updated");

					setTimeout(function(){
						hideHintBox();
						$("#" + sIdToUpdate + " h2").text(store.name);
						$("#" + sIdToUpdate + " #type").text(store.type);
						$("#" + sIdToUpdate + " #address").text(store.address);
						$("#" + sIdToUpdate + " img").attr("src", store.image);
					}, 2000);
			  	}
			});
		}

		// setTimeout(function(){
		// 	$("#hintbox").hide();
		// 	window.location.reload();
		// }, 3000);
	});

//show hintbox
	function showHintBox(storeName, operation){
		$("#hintbox p").text(storeName + " is " + operation + " successfully!");
		$("#hintbox").show();
	}

//hide hintbox
	function hideHintBox(){
		$("#hintbox").hide();
		$("#bg").fadeOut(1000);		
	}

//show form of updating store
	function execStore(){
		$(".updateS").click(function(e){
			$("#bg").fadeIn(1000);
			$("#add-store").slideDown(500);
			firstLoad = false;
			sIdToUpdate = $(this).parents(".store").attr("id");
			$.get(URL + '/restaurant/' + sIdToUpdate, function(response){
				$("#add-store #sName").val(response.name);
				$("#add-store #sType").val(response.type);
				$("#add-store #sAddress").val(response.address);
				$("#add-store #sImg").val(response.image);
			});

		});
	//}	

	//delete store
		$(".deleteS").click(function(){
			firstLoad = false;
			var storeId = $(this).parents(".store").attr("id");
			if(confirm("Sure you want to delete it? There is NO undo!")){
				$.ajax({
					method: 'DELETE',
					url: URL + '/restaurant/' + storeId,
					success: function(response){
						showHintBox($("#" + storeId + " h2").text(), "deleted");
						$("#bg").fadeIn(1000);
						setTimeout(function(){
							hideHintBox();
							$("#bg").fadeOut(1000);
							for(var i=0; i<stores.length; i++){
								if(stores[i]._id == storeId)
									stores.splice(i, 1);
							}
							
							var pageToShow;
							if($(".store-container").children(".store").length < 2)
								pageToShow = currentPage - 1;
							else 
								pageToShow = currentPage;
							$("#" + storeId).remove();
							$('.store-container').html('');
							$('#pages').html('');
							showpage(stores, pageToShow);
							showPageIndex(stores, Math.ceil(stores.length / PERPAGE));
						}, 2000);
				  	}
				});
	
			}	

		});
	}

	function appendStore(storeEle){
		//if(typeof(storeEle.name) != 'undefined'){
			var store = $("<div>").addClass("store");
			var storeId = storeEle._id; 
			store.attr("id", storeId);
			$("<h2>").text(storeEle.name).appendTo(store);
			$("<h3 id='type'>").text(storeEle.type).appendTo(store);
			$("<h3 id='address'>").text(storeEle.address).appendTo(store);
			store.attr("title", storeEle.name);
			store.append("<img src="+storeEle.image+" />");
			
			var execStore = $("<div>").addClass("execStore");
			$("<button>").addClass("btn-execStore updateS").text("Update").appendTo(execStore);
			$("<button>").addClass("btn-execStore deleteS").text("Delete").appendTo(execStore);
			execStore.appendTo(store);
			// var hint = $('<div>').addClass("store-hint");
			// hint.attr("id", "hint" + storeId);
			// hint.appendTo(store);
			store.appendTo($('.store-container'));
		//}
	}


	var searchEle = function (store, searchVal){
		// searchVal = searchVal.toLowerCase();
		// if(val['name'].toLowerCase().includes(searchVal) ||
		//    val['type'].toLowerCase().includes(searchVal) ||
		//    val['address'].toLowerCase().includes(searchVal)){
		// 	return true;
		// } 
		// else return false;
		return !searchVal || new RegExp(searchVal, 'i').test(store.name);
	}

	$('.search-store').keyup(function(e){	
		$('.store-container').html('');
		$('#pages').html('');
		var searched = [];
		var searchValue = $('.search-store').val();
		//$.get(URL + '/restaurant', function(storeArray){
			for(var i = 0; i < stores.length; i++){
				if(searchEle(stores[i], searchValue)){
					searched.push(stores[i]);
				}
			}
			showpage(searched, 1);
			showPageIndex(searched, Math.ceil(searched.length / PERPAGE));
			//hoverOnStore();
			//showUpdateStore();
		//})
	});

	var timer = null;
	function hoverOnStore(){
		$('.store').hover(
			function(){
				$(this).animate({
					width: '+=20px',
					height: '+=20px'
				});
				$(this).find(".execStore").show();
			},

			function(){
				$(this).animate({
					width: '-=20px',
					height: '-=20px'
				});
				$(this).find(".execStore").hide();
			}			

			// function(){
			// 	clearTimeout(timer);
			// 	setTimeout(function(){
			// 		// $(this).children.find(".store-hint").css("visibility", "visible");
			// 		// $(this).children.find(".store-hint").css("opacity", "1");
			// 		var storeName = $(this).attr("id");

			// 		$("#hint"+ storeName).css("visibility", "visible");
			// 		$("#hint"+ storeName).css("opacity", "1");
			// 	}, 1000);
			// },

			// function(){
			// 	timer = setTimeout(function(){
			// 		$('.store-hint').css("visibility", "hidden");
			// 	}, 1000);
			// }
		);
	}

	$('#store-hint').mouseover(function(){
			clearTimeout(timer);
		});

	$('#store-hint').mouseout(function(){
		timer = setTimeout(function(){
			$('#store-hint').css("display", "none");
		}, 1000);
	});




});