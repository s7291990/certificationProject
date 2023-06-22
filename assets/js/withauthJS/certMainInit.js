// 버튼 클릭 이벤트 설정
document.addEventListener("DOMContentLoaded", function() {
	var buttons = document.getElementsByClassName("withCertBtn");
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", function() {
			crtIframeFunc(this);
		});
	}
});

// iframe에서 보낸 메시지 이벤트 수신
window.addEventListener("message", function(event) {
	var iframe = document.getElementById("certIframe");

	// 이벤트가 해당 iframe에서 전송된 것인지 확인
	if (event.source === iframe.contentWindow) {
		var dataType = event.data.dataType;
		if (dataType == "resultData") {
			document.getElementById("result").innerText = "";
			document.getElementById("result").innerText = "최종 결과 reuturn json  :  "  +  JSON.stringify(event.data);
		} else if(dataType == "iframeCss") {
			iframe.style.display = event.data.display;
		}
	}
});

// 인증 iframe 생성
function crtIframeFunc(btnEl) {
	var certfg = btnEl.getAttribute("certfg");
	var listRanFg = btnEl.hasAttribute("list_random");
	var certIframe = document.getElementById("certIframe");
	if (certIframe) {
		certIframe.style.display="block";
		certIframe.contentWindow.postMessage({dataType: "crtIframeFunc", certfg : certfg, listRanFg : listRanFg}, '*');
	} else {
		var iframe = document.createElement("iframe");
		iframe.style.position = "fixed";
		iframe.style.zIndex = 200001;
		iframe.style.top = "0px";
		iframe.style.left = "0px";
		iframe.style.width = "100%";
		iframe.style.height = "100%";
		iframe.style.backgroundColor = "transparent";
		iframe.frameBorder = 0;
		iframe.setAttribute("id", "certIframe");
		iframe.src = "http://devwork.arvu.pro:8004/certificationProject/certMain.html";
		//iframe.src = "https://www.arvu.co.kr:8001/certTest/certMain.html";
		//iframe.src = "http://devwork.arvu.pro:8004/certificationProject/certMain.html";

		document.body.appendChild(iframe);

		iframe.onload = function () {
			// iframe load 이후 팝업 호출
			iframe.contentWindow.postMessage({dataType: "crtIframeFunc", certfg : certfg, listRanFg : listRanFg}, '*');
		}
	}
}
