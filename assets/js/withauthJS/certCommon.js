/*
(function () {
	eval("try{var t1=new Date();var t2=new Date();var itv=500;setInterval(function(){t1=new Date();debugger;t2=new Date();},itv);setInterval(function(){var t0=t2-t1;if(t0>itv*10){console.log('debugging...');}},itv);}catch(e){}");
})();
*/


//var authUrl = "https://1.237.174.56:16000"; // 인증서버
var authUrl = "http://1.237.174.56:16000"; // 인증서버
// Dexie 데이터베이스 초기화
var db = new Dexie("testDb");
// 테이블 정의
db.version(1).stores({
	userinfo: "++id",
	key:"++id"
});
db.open().then(() => {
	console.log("indexDb open");
}).catch((error) => {
	console.error("Error:", error);
});

$(document).ready(function() {
	commonInit();
	app.init();
});

// 부모창에서 message 수신
window.addEventListener('message', function(event) {
	if (event.source === window.parent) {
		var message = event.data;
		if (message.dataType == "crtIframeFunc") {
			$("#selectCertFg").val(message.certfg);
			$("#listRanFg").val(message.listRanFg);
			openMainModal(message.certfg);
		}

	}
});

// 이용기관 토큰발행 함수
var withAuthTokenJson, authTokenJson; //
function getWithAuth() {
	return new Promise(function(success, fail) {
		$.ajax({
			url: authUrl + "/withauth/init_withAuth.jsp",
			type: "GET",
			dataType:"json",
			async: false,
			beforeSend : function(xhr){
			},
			success: function(json) {
				withAuthTokenJson = json;
				console.log("withAuthToken 토큰 발행 / withAuthTokenJson" , withAuthTokenJson);
				success(json)
			},
			error:function(error) {
				fail(error);
			}
		});
	});
}


// 인증 사업자 조회
var mainAuthList;
function getPrepare(json) {
	$.ajax({
		url: authUrl + "/cert/v1.0/kcert/v1.0/prepare",
		type: "GET",
		dataType:"json",
		async: false,
		beforeSend : function(xhr){
			// 헤더 정보 세팅
			xhr.setRequestHeader("Authorization","Bearer " + json.access_token);
		},
		success: function(json) {
			mainAuthList = json;
		},
		error:function(error) {
			console.log(error);
		}
	});
}

// 토큰 발행
function getToken(json) {
	$.ajax({
		url: authUrl + "/cert/v1.0/kcert/v1.0/token",
		type: "GET",
		dataType:"json",
		async: false,
		beforeSend : function(xhr){
			// 헤더 정보 세팅
			xhr.setRequestHeader("Authorization","Bearer " + json.access_token);
		},
		success: function(json) {
			// 세션 스토리지에 저장
			authTokenJson = json;
			//console.log("authToken 토큰 발행 / authTokenJson" , authTokenJson);
		},
		error:function(error) {
			console.log(error);
		}
	});
}

//간편인증 결과 개인정보 획득
function parseTokenAjax(json) {
		$.ajax({
			url: authUrl + "/withauth/parse_token.jsp",
			type: "GET",
			data:{token: json.resMessage.token},
			dataType:"json",
			async: false,
			success: function(json) {
				if(json.resultCode == "200") {
					parent.postMessage({dataType: "resultData", obj : json}, '*');
					app.popupCloseAll();
				} else {
					console.log(json.resultMessage);
				}
			},
			error:function(request,status,error) {
				console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
			}
		});

}

//간편인증 결과 개인정보 획득
function verifySignResult(json) {
		$.ajax({
			url: authUrl + "/withauth/verify_sign_result.jsp",
			type: "GET",
			data:{
				txId : json.resMessage.txId,
				signTarget : reqResultMap.resultRequestMessage.contentInfo.signTarget,
				//contentInfo : {signTarget: "전자서명"},
				signedData : json.resMessage.signedData,
				token: json.resMessage.token
			},
			dataType:"json",
			async: false,
			success: function(json) {
				parent.postMessage({dataType: "resultData", obj : json}, '*');
				app.popupCloseAll();
			},
			error:function(request,status,error) {
				console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
			}
		});

}

//인증요청 맵생성
var userInput;
function createReqMap(json){
	var $popup_otp4 = $("section[data-popup='popup_otp4']");
	var signTarget = userInput; // todo_list => 전자서명 원문 처리 방법이 아직 명확하지앟아 일단 변수처리
	var orgCertFg = (json.orgCert !== undefined && json.orgCert !== null && json.orgCert.trim() !== "") ? true : false;
	var certFg = $("#selectCertFg").val() == "cert"  ? true : false;

	var reqMap = {reqMessage:{
		provider : $popup_otp4.find("#provider").val(),
		txId : json.txId,
		token : json.token,
		appInfo : {},
		userInfo : {
			name: orgCertFg ? aes256Encode($popup_otp4.find("#userNm").val()) : btoa(unescape(encodeURIComponent($popup_otp4.find("#userNm").val()))),
			birthday :orgCertFg ? aes256Encode($popup_otp4.find("#birthday").val()) : btoa(unescape(encodeURIComponent($popup_otp4.find("#birthday").val()))),
			phone : orgCertFg ? aes256Encode($popup_otp4.find("#phoneNum").val()) : btoa(unescape(encodeURIComponent($popup_otp4.find("#phoneNum").val()))),
			phone1 : orgCertFg ? aes256Encode($popup_otp4.find("#phoneNum").val().substring(0,3)) : btoa(unescape(encodeURIComponent($popup_otp4.find("#phoneNum").val().substring(0,3)))),
			phone2 : orgCertFg ? aes256Encode($popup_otp4.find("#phoneNum").val().substring(3,11)) : btoa(unescape(encodeURIComponent($popup_otp4.find("#phoneNum").val().substring(3,11)))),
			isBase64 : true,
			ssn1:"",
			ssn2:""
		},
		deviceInfo : {
			code: "PC",
			browser: "WB",
			universalLink: false

		},
		contentInfo : {
			signTarget: (!certFg && orgCertFg) ? aes256Encode(signTarget): signTarget ,
			signTargetTycd: certFg ? "nonce" : "hash",
			signType: certFg ?  "ENT_SIMPLE_AUTH" : "ENT_SIMPLE_SIGN"
		},
		providerOptionInfo : {
			callbackUrl : "",
			isNotification : "Y",
			isPASSVerify : "Y",
			isUserAgreement : "Y",
			isUseTss : "Y",
			reqCSPhoneNo : "1",
			upmuGb : "",

		},
		compareCI : false
	}};

	if(orgCertFg) reqMap["sinfo"] = rsaEncodeSecretKey(json.orgCert);

	return reqMap;
}

//인증결과 map 생성
function createResultReqMap(reqMap, json){
	var resultReqMap = {resultRequestMessage:{
		provider : reqMap.reqMessage.provider,
		txId : reqMap.reqMessage.txId,
		token : json.resMessage.token,
		cxId: json.resMessage.cxId,
		appInfo : {},
		userInfo : {
			name: reqMap.reqMessage.userInfo.name,
			birthday : reqMap.reqMessage.userInfo.birthday,
			phone : reqMap.reqMessage.userInfo.phone,
			phone1 : reqMap.reqMessage.userInfo.phone1,
			phone2 : reqMap.reqMessage.userInfo.phone2,
			isBase64 : true,
			ssn1:"",
			ssn2:""
		},
		deviceInfo : {
			code: "PC",
			browser: "WB",
			universalLink: false

		},
		contentInfo : {
			signTarget: reqMap.reqMessage.contentInfo.signTarget,
			signTargetTycd: reqMap.reqMessage.contentInfo.signTargetTycd,
			signType: reqMap.reqMessage.contentInfo.signType
		},
		providerOptionInfo : {
			callbackUrl : "",
			isNotification : "Y",
			isPASSVerify : "Y",
			isUserAgreement : "Y",
			isUseTss : "Y",
			reqCSPhoneNo : "1",
			upmuGb : "",

		},
		compareCI : false
	}}

	if (reqMap.sinfo !== undefined && reqMap.sinfo !== null && reqMap.sinfo.trim() !== "") {
		resultReqMap["sinfo"] = reqMap.sinfo;
	}
	return resultReqMap;
}

//팝업 open할때 선처리 함수 (app.js preOpenEvt 삽입)
function preOtpOpen() {
	var $popupEl = $("section[data-popup='popup_otp']");
	var selectFg = $("#selectCertFg").val();
	$popupEl.find(".layer_popup_title h1").html((selectFg == "cert" ? "간편인증" : "전자서명" )+ " 서비스를<br>선택해 주세요.");
	if(selectFg != "cert") {
		userInput = prompt("전자서명 원문");
	}

	// 최초 토큰발행 및 인증 사업자 조회
	getWithAuth().then(function(result){
		getPrepare(result);
		getToken(result);
		drawList_opt1($popupEl);
	});

	return true;
}

function preOtp2Open() {
	var $target; // 추가/삭제 버튼과 다르게 리스트 내부에 있는 + 버튼은 img 클릭할수도있음.
	if($(event.target).prop("tagName") == "IMG"){
		$target = $(event.target).closest("li")
	} else {
		$target = $(event.target)
	}

	var $popupEl = $("section[data-popup='" + $target.attr("data-popup") + "']");
	var btnOption = $target.attr("data-btnOption");
	var addDelTxt = btnOption == "add" ? " 추가":" 삭제";
	$popupEl.find("#btnOption").val(btnOption);
	$popupEl.find(".layer_popup_title h1").html("인증사업자" + addDelTxt);
	$popupEl.find(".layer_popup_title .s_text").html("인증사업자를 "+ addDelTxt + "해 주세요.");
	$popupEl.find(".layer_popup_bottom2 .bg_puple").html(addDelTxt + "하기");

	drawList_opt2($popupEl);

	return true;
}

function preOtp4Open() {
	var iconId = $(event.target).closest("li").data("icon");
	var $popupEl = $("section[data-popup='" + $(event.target).closest("li").attr("data-popup") + "']");
	$popupEl.find(".layer_popup_title h1").html(iconMap[iconId].viewNm + "로\n인증합니다");
	$popupEl.find(".layer_popup_title p img").attr("src", $(event.target).closest("li").find("img").attr("src"));
	$popupEl.find("#provider").val($(event.target).closest("li").data("provider")) ;
	$popupEl.find("#provider").attr("data-icon", iconId);
	$(event.target).closest("section").find("#nextBtn").css("visibility", "") ; //다음버튼 보이기

	// 인증요청 버튼 활성화
	$popupEl.find('button[data-popup="popup_otp5"]').prop("disabled", false).css("background-color", "#86D8DC");

	// input 초기화
	webcryptoDecData(db).then(plaintext => {
		if (plaintext != null) {
			// 저장된 유저 인증정보가 있으면 기본 세팅
			var userInfoData = JSON.parse(plaintext);
			$.each(userInfoData, function(id, value) {
				if(!$popupEl.find("#" + id).val()) { // 기존 정보 있으면 기존 정보 그대로. 없으면 기본 localstorage 셋팅
					$popupEl.find("#" + id).val(value);
				}
			});
		}
	}).catch(error => {
		console.error(error);
	});

	return true;
}

// 인증요청
var reqResultMap;
function preOtp5Open() {
	if(!Otp5Validation($(event.target))){
		return;
	}

	// 인증요청 버튼 비활성화
	$("section[data-popup='popup_otp4']").find('button[data-popup="popup_otp5"]').prop("disabled", true).css("background-color", "#E1E1E1");

	//인증 완료창 고객센터 셋팅
	var iconId = $("section[data-popup='popup_otp4']").find("#provider").attr("data-icon");

	var $popupEl = $("section[data-popup='" + $(event.target).attr("data-popup") + "']");
	$popupEl.find(".bottom_text").empty();
	$popupEl.find(".bottom_text").append("<li>1. " + iconMap[iconId].name + " 앱 설치 및 로그인 여부를 확인해 주세요.</li>");
	$popupEl.find(".bottom_text").append("<li>2. 앱 설치 및 인증 방법은 "+  iconMap[iconId].name +" 고객센터로 문의해 주세요.</li>");
	$popupEl.find(".bottom_text").append("<li>3. "+ iconMap[iconId].name + " 고객센터 : " + iconMap[iconId].centerNum +"</li>");

	var continueFg = false;
	var reqMap = createReqMap(authTokenJson);

	$.ajax({
		url: authUrl + "/cert/v1.0/kcert/v1.0/request",
		type: "POST",
		dataType:"json",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify(reqMap),
		async: false,
		beforeSend : function(xhr){
			// 헤더 정보 세팅
			xhr.setRequestHeader("Authorization","Bearer " + withAuthTokenJson.access_token);
		},
		success: function(json) {
			// 인증요청 버튼 활성화
			$("section[data-popup='popup_otp4']").find('button[data-popup="popup_otp5"]').prop("disabled", false).css("background-color", "#86D8DC");

			if(json.resultCode == "200") {
				reqResultMap = createResultReqMap(reqMap, json);
				continueFg = true;
			} else if(json.resultCode == "408") { // 토큰시간 만료
				viewAlertPopup("alert_modal12");
			} else {
				viewAlertPopup("alert_modal11", json.resultMessage);
			}
		},
		error:function(request,status,error) {
			console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
		}
	});

	return continueFg;
}

// 이용약관 open 이벤트
function preAgreementOpen() {
	var continueFg = true;

	if($(event.target).attr("data-agreeFg") == "Y") {
		$(event.target).text("보기");
		$(event.target).removeAttr("data-agreeFg");
		$(event.target).css({"background-color": "#E1E1E1",	"color": "#222"});

		$("section[data-popup='popup_otp4'] #cb1").prop("checked", false);
		continueFg =  false;
	} else {
		$(event.target).text("동의");
		$(event.target).attr("data-agreeFg", "Y");
		$(event.target).css({"background-color": "#86D8DC","color": "#fff"});

		if($("section[data-popup='popup_otp4'] button[data-agreeFg='Y']").length == 3) {
			$("section[data-popup='popup_otp4'] #cb1").prop("checked", true);
		}
	}

	return continueFg;
}

// 인증 추가 삭제 팝업버전
function preAlert3Open() {
	var alertId = "alert_modal2";
	var btnOption = $(event.target).closest("section").find("#btnOption").val();
	var chkList = $(event.target).closest("section").find("ul input[type='checkbox']:checked");
	var userDelList = JSON.parse(localStorage.getItem("userDelList")) || [];

	if(chkList.length == 0) {
		alertId = (btnOption == "add" ? "alert_modal4":"alert_modal5");
	} else {
		// 체크한 리스트 리스트 생성
		var chkAuthList = mainAuthList.filter(function(item) {
			return chkList.toArray().some(function(chkItem) {
				return $(chkItem).attr("id") === item.id;
			});
		});

		if(btnOption == "add") {
			// userDelList에서 추가한 리스트는 delList에서 삭제
			userDelList = userDelList.filter(function(item) {
				return !chkAuthList.some(function(chkItem){
					return chkItem.id === item.id;
				});
			});
			alertId = "alert_modal2";
		} else {
			alertId = "alert_modal3";
			userDelList = chkAuthList.concat(userDelList);
		}


		localStorage.setItem("userDelList", JSON.stringify(userDelList));
		drawList_opt2($("section[data-popup='popup_otp2']"));
		drawList_opt1($("section[data-popup='popup_otp']")); // 이전 리스트 다시그리기
	}

	viewAlertPopup(alertId);
	return false;
}

function alert_modal6Close(){
	$("section[data-popup='popup_otp4'] #cb2").prop("checked", false);
	return true;

}

function Otp5Validation($target){
	var validationInputs = $target.closest("section").find(".layer_popup_contents2").find("input, select");
	var returnFg = true;
	var userInfoObj = {};
	validationInputs.each(function(idx, item) {
		if($(item).attr("type") == "checkbox") {
			if($(item).attr("id") == "cb1" && !$(item).is(":checked")) { //약관 동의 체크
				viewAlertPopup($(item).attr("data-alertId"));
				returnFg = false;
				$(item).focus();
				return false;
			}
		} else {
			if($(item).val() == "" || $(item).val() == null || $(item).val() == undefined){
				viewAlertPopup($(item).attr("data-alertId"));
				returnFg = false;
				$(item).focus();
				return false;
			} else if($(item).attr("id") != "birthday"){
				userInfoObj[$(item).attr("id")] = $(item).val();
			}
		}

	});

	//사용자 인증정보 저장 - userinfo 테이블에서 데이터 조회
	if($target.closest("section").find(".layer_popup_contents2 #cb2").is(":checked") && returnFg) {
		webcryptoEncData(db, JSON.stringify(userInfoObj));
	}

	return returnFg;
}
// 인증결과요청 (popup_otp5)
function certResultReq() {
	// 인증완료 버튼 비활성화
	$("section[data-popup='popup_otp5']").find('button[id="opt5ResultBtn"]').prop("disabled", true).css("background-color", "#E1E1E1");

	$.ajax({
		url: authUrl + "/cert/v1.0/kcert/v1.0/result",
		type: "POST",
		dataType:"json",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify(reqResultMap),
		async: false,
		beforeSend : function(xhr){
			// 헤더 정보 세팅
			xhr.setRequestHeader("Authorization","Bearer " + withAuthTokenJson.access_token);
		},
		success: function(json) {
			if(json.resultCode == "200") {
				if($("#selectCertFg").val() == "cert") {
					parseTokenAjax(json);
				} else {
					verifySignResult(json);
				}
			} else {
				viewAlertPopup("alert_modal13");
			}
			// 인증완료 버튼 활성화
			$("section[data-popup='popup_otp5']").find('button[id="opt5ResultBtn"]').prop("disabled", false).css("background-color", "#86D8DC");
		},
		error:function(request,status,error) {
			console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
		}
	});
}

var iconMap = {
	"banksalad": {pngNm: "banksalad", viewNm: "뱅크샐러드 인증서", iconNm: "뱅크샐러드", name: "뱅크샐러드", centerNum: "앱 내 1:1 문의 이용"},
	"hana": {pngNm: "hanabank", viewNm: "하나인증서", iconNm: "하나인증서", name: "하나", centerNum: "1588-1111"},
	"kakao": {pngNm: "kakao", viewNm: "카카오 인증서", iconNm: "카카오", name: "카카오", centerNum: "1577-3754"},
	"kb": {pngNm: "kbbank", viewNm: "국민인증서", iconNm: "국민인증서" , name: "국민", centerNum: "1588-9999"},
	"kica": {pngNm: "samsungpass", viewNm: "삼성패스 인증서", iconNm: "삼성패스" , name: "삼성패스", centerNum: "1577-8787"},
	"naver": {pngNm: "naver" , viewNm: "네이버 인증서", iconNm: "네이버", name: "네이버", centerNum: "1588-3820"},
	"nh": {pngNm: "nhbank", viewNm: "NH인증서", iconNm: "NH인증서", name: "NH", centerNum: "1544-2100"},
	"pass": {pngNm: "pass", viewNm: "통신사PASS 인증서", iconNm: "통신사PASS", name: "PASS", centerNum: "1800-4273"},
	"payco": {pngNm: "payco", viewNm: "페이코 인증서", iconNm: "페이코", name: "페이코", centerNum: "1544-6891"},
	"shinhan": {pngNm: "shinhan", viewNm: "신한인증서", iconNm: "신한인증서", name: "신한", centerNum: "1599-8000"},
	"toss-esign": {pngNm: "toss",  viewNm: "토스 인증서", iconNm: "토스", name: "토스", centerNum: "1599-4905"}
};
//opt1 - 인증서 리스트 html에 그리기
function drawList_opt1($popupEl) {
	var userDelList = JSON.parse(localStorage.getItem("userDelList")) || [];

	// 서버에서 받아온 리스트에서 사용자 del리스트 삭제
	var userAuthList = mainAuthList.filter(function(item) {
		return !userDelList.some(function(chkItem){
			return chkItem.id === item.id;
		});
	});

	// userAuthList를 무작위로 순서 재정렬
	var listRanFg = $("#listRanFg").val();
	if(listRanFg === "true") {
		userAuthList.sort(function() {
			return 0.5 - Math.random();
		});

	}

	$popupEl.find(".layer_popup_contents ul li:not([data-popup='popup_otp2'])").remove(); // +버튼을 제외한 리스트 초기화

	$.each(userAuthList, function(idx, item) {
		var matchId = item.provider_id.replace("hancomwith_co", "");
		var newListItem = $("<li data-provider='" + item.id + "' data-icon='"+matchId+"' aria-haspopup='dialog' data-popup='popup_otp4' pre-progress='Y' style='cursor:pointer;'><img src='assets\\images\\img\\"+ iconMap[matchId].pngNm +".png' alt='" + iconMap[matchId].iconNm + "'>" + iconMap[matchId].iconNm + "</li>");
		$popupEl.find(".layer_popup_contents ul").prepend(newListItem);

		newListItem.on("click", function() {
			// 새로 추가된 버튼에 popup 이벤트연결
			app.popupOpen($(this)[0]);
		});
	});
}

//opt2 - 인증서 추가 삭제 리스트 html에 그리기
function drawList_opt2($popupEl) {
	var userDelList = JSON.parse(localStorage.getItem("userDelList")) || [];

	var popup_otp2_list;
	if($popupEl.find("#btnOption").val() == "add") {
		popup_otp2_list = userDelList;
	} else {
		// 서버에서 받아온 리스트에서 사용자 del리스트 삭제
		popup_otp2_list = mainAuthList.filter(function(item) {
			return !userDelList.some(function(chkItem){
				return chkItem.id === item.id;
			});
		});
	}

	$popupEl.find(".layer_popup_contents2 ul li").remove(); // html 리스트 초기화
	$.each(popup_otp2_list, function(idx, item) {
		var matchId = item.provider_id.replace("hancomwith_co", "");
		$popupEl.find(".layer_popup_contents2 ul").prepend("<li class='list_certifi'><img class='list_certifi_img' src='assets\\images\\img\\"+ iconMap[matchId].pngNm +".png' alt='" + iconMap[matchId].iconNm + "'><span>" + iconMap[matchId].iconNm + "</span><span class='check_ty'><input type='checkbox' id='" + item.id + "' class='type_a'><label for='" + item.id + "'></label></span>");
	});
}

function viewAlertPopup(popupId, errTxt){
	if(errTxt){
		$("section[data-popup='" + popupId + "']").find("#errTxt").html(errTxt);
	}

	var button = document.createElement("button"); // 팝업을 띄우기위한 가상요소
	button.setAttribute("aria-haspopup", "dialog");
	button.setAttribute("data-popup", popupId);

	app.popupOpen(button);
}

// 메인 modal 오픈 함수
function openMainModal(btnId) {
	var button = document.createElement("button"); // 팝업을 띄우기위한 가상요소
	button.setAttribute("aria-haspopup", "dialog");
	button.setAttribute("data-popup", "popup_otp");
	button.setAttribute("pre-progress", "Y");
	button.setAttribute("select-flag", btnId);

	app.popupOpen(button);
}


function commonInit(){
	var $popupEl = $("section[data-popup='popup_otp4']");

	// 인증 양식 input 이벤트
	$("section[data-popup='popup_otp4']").find("input, select").on("input", function() {
		if($(this).attr("id") == "birthday" || $(this).attr("id") == "phoneNum"){
			var subNum = $(this).attr("id") == "birthday" ? 8 : 11;

			var regex = new RegExp("^[0-9]{" + subNum + "}$");
			if (!regex.test($(this).val())) {
				$(this).val($(this).val().replace(/[^0-9]/g, '').substring(0, subNum));
			}
		} else if($(this).attr("id") == "phoneNum"){
			var regex = /^[0-9]{11}$/;
			if (!regex.test($(this).val())) {
				$(this).val($(this).val().replace(/[^0-9]/g, '').substring(0, 11));
			}
		} else if($(this).attr("id") == "cb1"){
			if($(this).is(":checked")) {
				$("section[data-popup='popup_otp4']").find(".check_ty2 button").attr("data-agreeFg", "Y");
				$("section[data-popup='popup_otp4']").find(".check_ty2 button").css({"background-color": "#86D8DC","color": "#fff"});
				$("section[data-popup='popup_otp4']").find(".check_ty2 button").text("동의");
			} else {
				$popupEl.find(".check_ty2 button").removeAttr("data-agreeFg");
				$popupEl.find(".check_ty2 button").css({"background-color": "#E1E1E1", "color": "#222"});
				$popupEl.find(".check_ty2 button").text("보기");
			}
		} else if($(this).attr("id") == "cb2" && $(this).is(":checked")){
			viewAlertPopup($(this).attr("data-validationId"));
		}
	});

	// 인증 사업자 리스트 클릭시 이벤트 (li 클릭시 )
	$(document).on("click", "section[data-popup='popup_otp2'] ul li", function() {
		var checkbox = $(this).find("input[type='checkbox']");
		checkbox.prop("checked", !checkbox.prop("checked"));
	});

	// 인증완료 버튼 클릭 이벤트
	$(document).on("click", "#opt5ResultBtn", function() {
		certResultReq();
	});
}


// 팝업 닫고난 후처리 함수
function popupCloseAfter(currentTarget){
	var closeId = currentTarget.getAttribute('popup-close');

	if(closeId == "alert_modal2" || closeId == "alert_modal3") { // 간편인증 사업자 추가 삭제
		$("section[data-popup='popup_otp2'] button[popup-close='popup_otp2']").trigger("click");
	}

}

//팝업 전체 닫고난 후처리 함수
function popupAllCloseAfter(){
	var $section4 = $("section[data-popup='popup_otp4']")


	webcryptoDecData(db).then(plaintext => {
		if (plaintext != null) {
			// 저장된 유저 인증정보가 있으면 기본 세팅
			var userInfoData = JSON.parse(plaintext);
			$.each(userInfoData, function(id, value) {
				$section4.find("#" + id).val(value);
			});
		}
	}).catch(error => {
		console.error(error);
	});

	// 체크박스 초기화
	$section4.find("input[type='checkbox']").prop("checked", false);

	// 약관 동의 초기화
	$section4.find(".check_ty2 button").removeAttr("data-agreeFg");
	$section4.find(".check_ty2 button").css({"background-color": "#E1E1E1","color": "#222"});
	$section4.find(".check_ty2 button").text("보기");
	$section4.find(".list_wrap input").val("");

	// iframe display none 처리
	var popupDimmed = document.querySelector('.popup_dimmed');
	if (popupDimmed.parentNode !== null) popupDimmed.parentNode.removeChild(popupDimmed); // 전체 닫기 전체 dimmed 삭제
	parent.postMessage({dataType: "iframeCss", display : "none"}, '*');
}

export { preOtpOpen, preOtp2Open, preOtp4Open, preOtp5Open, preAgreementOpen, preAlert3Open, alert_modal6Close, popupCloseAfter, popupAllCloseAfter }