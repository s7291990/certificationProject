if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
} // IE 브라우저 체크
var agent = navigator.userAgent.toLocaleLowerCase();
if (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1 || agent.indexOf("msie") !== -1) {
  document.body.classList.add('ie');
} // popup 관련 전역변수
var popupVariables = {
  pageFocus: null,
  popupBtnAll: undefined,
  focusEl: [],
  popupDepth: 0,
  popupDimmed: undefined,
  keyEscapeEvt: undefined,
  KeyEvtEl: null,
  popupAll: undefined,
  popupCloseBtnAll: undefined,
  isAlert: false
}; // 슬라이드 관련 전역변수
var swipers = [];
var $app_this;

var preOpenEvt = { // 팝업 open전 선처리 이벤트
	popup_otp : function() {return preOtpOpen();},
	popup_otp2 : function() {return preOtp2Open();},
	popup_otp4 : function() {return preOtp4Open();},
	popup_otp5 : function() {return preOtp5Open();},
	popup_agreement : function() {return preAgreementOpen();},
	popup_agreement2 : function() {return preAgreementOpen();},
	popup_agreement3 : function() {return preAgreementOpen();},
	alert_modal3 : function() {return preAlert3Open();}
}

var confirmEvt = { // 팝업 닫기전 이벤트
	alert_modal6 : function() {return alert_modal6Close();}
	//닫기전 실행할 함수 선언
}

var app = {
  // 본문바로가기
  skipNav: function skipNav() {
    var skipNav = document.querySelector('.skip_nav button');
    if (skipNav) {
      var skipNavClickEvt = function skipNavClickEvt() {
        document.querySelector('#container').setAttribute('tabindex', '0');
        document.querySelector('#container').focus();
        document.querySelector('#container').removeAttribute('tabindex', '');
      };
      skipNav.removeEventListener('click', skipNavClickEvt);
      skipNav.addEventListener('click', skipNavClickEvt);
    }
  },
  // 띠배너
  fixBanner: function fixBanner() {
    var fixBannerWrap = document.querySelector('.fix_banner_wrap');
    if (fixBannerWrap) {
      var noticeTotal = fixBannerWrap.querySelectorAll('li');
      var bannerWrapper = fixBannerWrap.querySelector('.banner_content_wrap');
      var activeIdx = Number(bannerWrapper.getAttribute('data-active'));
      var prevClickEvt = function prevClickEvt() {
        if (bannerWrapper.classList.contains('last')) bannerWrapper.classList.remove('last');
        if (activeIdx !== 0) activeIdx -= 1;
        bannerWrapper.setAttribute('data-active', activeIdx);
      };
      var nextClickEvt = function nextClickEvt() {
        if (activeIdx !== noticeTotal.length - 1) {
          activeIdx += 1;
          if (activeIdx === noticeTotal.length - 1) bannerWrapper.classList.add('last');
        };
        bannerWrapper.setAttribute('data-active', activeIdx);
      };
      var closeClickEvt = function closeClickEvt() {
        fixBannerWrap.style.height = 0;
        fixBannerWrap.addEventListener('transitionend', function() {
          fixBannerWrap.style.height = '';
          fixBannerWrap.classList.add('hide');
        });
      };
      if (noticeTotal.length < 2) bannerWrapper.classList.add('only_child');
      bannerWrapper.querySelector('.banner_up').removeEventListener('click', prevClickEvt);
      bannerWrapper.querySelector('.banner_up').addEventListener('click', prevClickEvt);
      bannerWrapper.querySelector('.banner_down').removeEventListener('click', nextClickEvt);
      bannerWrapper.querySelector('.banner_down').addEventListener('click', nextClickEvt);
      fixBannerWrap.querySelector('.btn_fix_banner_close').removeEventListener('click', closeClickEvt);
      fixBannerWrap.querySelector('.btn_fix_banner_close').addEventListener('click', closeClickEvt);
    }
  },
  // GNB
  gnb: function gnb() {
    var gnb = document.querySelector('.gnb');
    var gnbWrap = document.querySelector('.gnb_wrap');
    var gnbHeight;
    if (gnb) {
      var gnb1depth = gnb.querySelectorAll('.gnb_depth1 > li');
      var gnb2depth = gnb.querySelectorAll('.gnb_depth2'); // gnb show event
      var subMenuShow = function subMenuShow() {
        var target = event.currentTarget;
        if (!target.classList.contains('hover')) {
          subMenuhide(gnb1depth);
          target.classList.add('hover');
          gnbWrap.classList.add('hover');
          gnb.classList.add('hover');
          gnb2depth.forEach(function(target) {
            if (target.closest('li').classList.contains('hover')) {
              gnbHeight = document.querySelector('.hover > .gnb_depth2').getAttribute('data-height');
              target.style.height = "".concat(gnbHeight, "px");
            } else {
              target.style.height = '';
            }
          });
          gnbWrap.classList.remove('hide');
          gnb.classList.remove('hide');
        };
      }; // gnb hide event
      var subMenuhide = function subMenuhide() {
        gnb1depth.forEach(function(menu) {
          if (menu.classList.contains('hover')) {
            var depth2 = menu.querySelector('.gnb_depth2');
            if (depth2) menu.querySelector('.gnb_depth2').style.height = '';
          }
          menu.classList.remove("hover");
          gnbWrap.classList.remove('hover');
          gnb.classList.remove('hover');
          gnb.classList.add('hide');
        });
      }; // 이벤트 할당
      gnb1depth.forEach(function(target) {
        // target.removeEventListener('mouseover', subMenuShow);
        target.addEventListener('mouseover', subMenuShow); // target.removeEventListener('mouseout', subMenuhide);
        target.addEventListener('mouseout', subMenuhide); // target.removeEventListener('focusin', subMenuShow);
        target.addEventListener('focusin', subMenuShow); // target.removeEventListener('focusout', subMenuhide);
        target.addEventListener('focusout', subMenuhide);
      });
      gnb2depth.forEach(function(target) {
        target.setAttribute('data-height', target.scrollHeight + 88);
      });
    };
  },
  // footer select group link
  footerLink: function footerLink() {
    var footer = document.querySelector('[data-role="select-footer-link"]');
    if (footer) {
      var linkChangEvt = function linkChangEvt() {
        window.open(footer.value);
      };
      footer.removeEventListener('change', linkChangEvt);
      footer.addEventListener('change', linkChangEvt);
    }
  },
  // datepicker
  datepicker: function datepicker(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var datepickerAll = selector.querySelectorAll('.datepicker');
    var isDate = function isDate(txtDate) {
      var currVal = txtDate;
      if (currVal == "") return false;
      var rxDatePattern = /^(\d{4})(\-)(\d{2})(\-)(\d{2})$/; //Declare Regex
      var dtArray = currVal.match(rxDatePattern); // is format OK?
      if (dtArray == null) return false; //Checks for mm/dd/yyyy format.
      dtMonth = dtArray[3];
      dtDay = dtArray[5];
      dtYear = dtArray[1];
      if (dtMonth < 1 || dtMonth > 12) return false;
      else if (dtDay < 1 || dtDay > 31) return false;
      else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31) return false;
      else if (dtMonth == 2) {
        var isleap = dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0);
        if (dtDay > 29 || dtDay == 29 && !isleap) return false;
      }
      return true;
    };
    datepickerAll.forEach(function(datepicker) {
      $(datepicker).datepicker({
        dateFormat: "yy-mm-dd",
        // maxDate: "0",
        changeMonth: true,
        changeYear: true,
        dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
        dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
        monthNamesShort: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
        monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
        hideIfNoPrevNext: true,
        showButtonPanel: true //주말 제외
        // beforeShowDay: function (date) {
        //   let day = date.getDay();
        //   return [day != 0 && day != 6];
        // },
      });
      $(datepicker).on("change", function(event) {
        var alertText = "날짜 형식을 확인해 주세요.";
        var result = event.target.value.replace(/(\d{4})(\d{2})(\d{2})/g, "$1-$2-$3");
        if (!isDate(result)) {
          alert(alertText);
          event.target.focus();
        } else {
          event.target.value = result;
        }
      });
      $(datepicker).on("focus", function(event) {
        if (event.target.closest('.input_lg')) $('#ui-datepicker-div').removeClass('calendar_md').addClass('calendar_lg');
        else $('#ui-datepicker-div').removeClass('calendar_lg').addClass('calendar_md');
      });
    });
  },
  // select ui
  selectBox: function selectBox(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var selectUi = selector.querySelector('[aria-haspopup="listbox"]');
    var selectFocus;
    if (selectUi) {
      var selectUiBtnAll = selector.querySelectorAll('[aria-haspopup="listbox"]');
      var body = document.querySelector('body'); // select button click event
      var selectToggleEvt = function selectToggleEvt() {
        selectFocus = event.currentTarget;
        var target = event.currentTarget;
        var wrap = target.closest('.form_select');
        var optionList = wrap.querySelectorAll('[role="option"]');
        var optionListWrap = wrap.querySelector('[role="listbox"]');
        if (target.getAttribute('aria-expanded') === 'false') {
          target.setAttribute('aria-expanded', 'true');
          optionListWrap.scrollTop = 0;
          optionList.forEach(function(option, idx) {
            option.removeEventListener('click', selectOptionClickEvt);
            option.addEventListener('click', selectOptionClickEvt);
            if (selector != undefined) {
              body.removeEventListener('click', selectCloseEvt);
              body.addEventListener('click', selectCloseEvt);
            }
            if (optionList.length - 1 === idx) {
              option.removeEventListener('focusout', selectCloseEvt);
              option.addEventListener('focusout', selectCloseEvt);
            }
          });
        } else if (target.getAttribute('aria-expanded') === 'true') target.setAttribute('aria-expanded', 'false');
      }; // select 영역 외 클릭 시 닫기
      var selectCloseEvt = function selectCloseEvt() {
        var wrap = selectFocus.closest('.form_select');
        var target = wrap.querySelector('.btn_form_select');
        var optionList = wrap.querySelectorAll('[role="option"]');
        optionList.forEach(function(option) {
          if (event.target === target) {
            return false;
          } else if (event.target === option) {
            return false;
          } else {
            target.setAttribute('aria-expanded', 'false'); // target.focus();
          }
        });
        selectUiBtnAll.forEach(function(targetBtn) {
          if (targetBtn !== event.target) targetBtn.setAttribute('aria-expanded', 'false');
        });
      }; // select option click event
      var selectOptionClickEvt = function selectOptionClickEvt() {
        var targetOption = event.currentTarget;
        var wrap = targetOption.closest('.form_select');
        var selectBtn = wrap.querySelector('.btn_form_select');
        var optionList = wrap.querySelectorAll('[role="option"]');
        optionList.forEach(function(option) {
          option.setAttribute('aria-selected', 'false');
        });
        targetOption.setAttribute('aria-selected', 'true');
        var optionValue = selector.querySelector("#".concat(targetOption.id)).innerHTML;
        selector.querySelector("#".concat(selectBtn.id)).innerHTML = optionValue;
        selectBtn.setAttribute('aria-expanded', 'false');
      }; // select button event 할당
      selectUiBtnAll.forEach(function(targetBtn) {
        targetBtn.removeEventListener('click', selectToggleEvt);
        targetBtn.addEventListener('click', selectToggleEvt);
      });
    }
  },
  // popup 열기
  popupOpen: function popupOpen(value) {
    var el; // ESC 키보드 이벤트
    var escKeyEvt = function escKeyEvt(El, e) {
      var openPopups = document.querySelectorAll('.popup_open'); // 팝업 열린 상태에서 키보드 ESC 키 이벤트 실행
      if (openPopups.length > 0) $app_this.popupCloseAll();
    }; // ESC 누름 감지
    var keyEvent = {
      get keyEscape() {
        return $app_this._state;
      },
      set keyEscape(state) {
        $app_this._state = state;
        if (state) escKeyEvt(KeyEvtEl, keyEscapeEvt);
      }
    };

	if (value instanceof Event) {
		if (event !== undefined) {
			keyEvent;
			el = event.currentTarget;
			if(event.constructor === PointerEvent){
				if (el.type === undefined) el = document.querySelector(".layer_popup_wrap[data-popup=" + el.getAttribute('data-popup') + "]");
			} else if(event.constructor === ProgressEvent){
				el = value;
			}
		} else {
			el = document.querySelector(".layer_popup_wrap[data-popup=".concat(value, "]"));
		}
	} else {
		el = value;
	}

	if(el.getAttribute('pre-progress') == "Y") {
		var popupId = el.getAttribute('data-popup');
	    if(!preOpenEvt[popupId]()) {
	        return;
		}
	}

    popupVariables.pageFocus = document.activeElement;
    popupVariables.popupAll = document.querySelectorAll('.layer_popup_wrap'); // 키보드 ESC 키 누름 감지 이벤트
    var escKeyDown = function escKeyDown() {
      if (event.key == 'Escape' || event.key == 'Esc') {
        keyEscapeEvt = event;
        keyEvent.keyEscape = true;
      };
    }; // ESC 키로 팝업 닫기 이벤트 할당
    window.removeEventListener('keydown', escKeyDown);
    window.addEventListener('keydown', escKeyDown); // popup dimmed click 시 팝업 닫기
    // let dimmedClick = () => {
    //   let dimmedEl = document.querySelector('.popup_dimmed');
    //   if (dimmedEl) {
    //     if (event.target.classList.contains('layer_popup_wrap')) {
    //       $app_this.popupCloseAll();
    //       keyEvent.keyEscape = false;
    //     }
    //   }
    // };
    // popup title 키보드 이벤트
    var titleKeyDown = function titleKeyDown() {
      if (event.key == 'Tab' && event.shiftKey || event.key == 'ArrowLeft') {
        event.preventDefault();
        popupVariables.popupAll.forEach(function(popupEl) {
          if (popupEl.getAttribute('data-popup') === event.target.closest('.layer_popup_wrap').getAttribute('data-popup')) {
            popupEl.querySelector('.btn_layer_close').focus();
          };
        });
      };
    }; // dimmed 생성
    popupVariables.popupAll.forEach(function(popupEl) {
      if (popupEl.getAttribute('data-popup') === el.getAttribute('data-popup') && popupEl.getAttribute('role') !== 'dialog') popupVariables.isAlert = true;
    });
    if (el.getAttribute('data-popup') !== 'sitemap') {
      // 전체메뉴 팝업 딤드 생성 제외
      if (!popupVariables.isAlert) {
        popupVariables.popupDimmed = document.querySelectorAll('.popup_dimmed');
        if (popupVariables.popupDimmed.length === 0) $app_this.popupCreatedDimmed();
      }
    };

        var trueFg = false;
    popupVariables.popupAll.forEach(function(popupEl) {
      if (popupEl.getAttribute('data-popup') === el.getAttribute('data-popup')) {


        // popup depth 저장
        popupVariables.popupDepth += 1; // popup focus Element 저장
        popupVariables.focusEl.splice(popupVariables.popupDepth - 1, 0, el); // open class add
        popupEl.classList.add('popup_open'); // popup depth 설정
        popupEl.setAttribute('popup-depth', popupVariables.popupDepth); // // dimmed click 이벤트 할당
        // if (!popupVariables.isAlert) {
        //   popupEl.removeEventListener('mousedown', dimmedClick);
        //   popupEl.addEventListener('mousedown', dimmedClick);
        // }
        // popup scroll lock

        document.body.classList.add('scroll_lock'); // popup 오픈 시 타이틀에 포커스
        popupEl.querySelector('.layer_popup_title').focus(); // shift+tab 또는 <- 화살표 키 키보드 동작 시 팝업 밖으로 포커스 이동 방지 이벤트 할당
        popupEl.querySelector('.layer_popup_title').removeEventListener('keydown', titleKeyDown);
        popupEl.querySelector('.layer_popup_title').addEventListener('keydown', titleKeyDown); // popup 위 팝업 케이스 dimmed 수정
        if (popupVariables.popupDepth > 1) {
          if (!popupVariables.isAlert) document.querySelector("[popup-depth='".concat(popupVariables.popupDepth - 1, "']")).classList.add('prev_popup');
        } // ESC 키 동작을 위한 현재 활성화 된 popup element 저장

        popupVariables.KeyEvtEl = popupEl; // 팝업 내 scroll 되는 팝업 있을 경우, 높이값 변함에 따라 조절
        var scrollInnerCon = popupEl.querySelector('.scroll_inner');
        var resizeScrollTableHeight = function resizeScrollTableHeight() {
          var layerPopupInner = popupEl.querySelector('.layer_popup_inner');
          var layerPopupContents = layerPopupInner.querySelector('.layer_popup_contents');
          var layerPopupContentsHeight = "".concat(layerPopupInner.offsetHeight - 228);
          var innerContents = layerPopupContents.querySelector('.popup_contents_inner').children;
          var innerContentsArr = Array.prototype.slice.call(innerContents);
          var innerContentsHeightTotal = 0;
          var scrollContentMargin = 0;
          layerPopupInner.querySelector('.layer_popup_contents').style.maxHeight = "".concat(layerPopupContentsHeight, "px");
          innerContentsArr.forEach(function(innerContent) {
            var innerContentStyle = getComputedStyle(innerContent);
            var marginTop = parseInt(innerContentStyle.marginTop.replace(/[^0-9\.]+/g, ''));
            var marginBottom = parseInt(innerContentStyle.marginBottom.replace(/[^0-9\.]+/g, ''));
            if (innerContent.classList.contains('scroll')) {
              scrollContentMargin += marginTop + marginBottom;
            } else {
              innerContentsHeightTotal += innerContent.offsetHeight + marginTop + marginBottom;
            }
          });
          scrollInnerCon.style.maxHeight = "".concat(layerPopupContentsHeight - innerContentsHeightTotal, "px");
        };

        if (scrollInnerCon) {
          resizeScrollTableHeight();
          window.removeEventListener('resize', resizeScrollTableHeight);
          window.addEventListener('resize', resizeScrollTableHeight);
        } // popup-bottom 영역에 버튼 외의 콘텐츠가 들어 갈 경우, layer_popup_contents의 max-height 값 조절
        var bottomMoreCon = popupEl.querySelector('.bottom_more_contents');
        var resizePopupContentsHeight = function resizePopupContentsHeight() {
          var POPUP_TITLE_HEIGHT = 77;
          var POPUP_CONTENTS_MARGIN = 46;
          var popupBottomHeight = popupEl.querySelector('.layer_popup_bottom').clientHeight;
          var layerPopupInnerHeight = popupEl.querySelector('.layer_popup_inner').clientHeight;
          var layerPopupContents = popupEl.querySelector('.layer_popup_contents');
          if (window.innerHeight <= 820) {
            layerPopupContents.style.maxHeight = "calc(100vh - 20px - ".concat(POPUP_TITLE_HEIGHT, "px - ").concat(POPUP_CONTENTS_MARGIN, "px - ").concat(popupBottomHeight, "px)");
          } else {
            layerPopupContents.style.maxHeight = "".concat(800 - POPUP_TITLE_HEIGHT - POPUP_CONTENTS_MARGIN - popupBottomHeight, "px");
          }
        };
        if (bottomMoreCon) {
          resizePopupContentsHeight();
          window.removeEventListener('resize', resizePopupContentsHeight);
          window.addEventListener('resize', resizePopupContentsHeight);
        }
      };
    });

	if(!trueFg) {
        return;
	}
    $app_this.tableStickyHeader();
  },
  // popup dimmed 생성
  popupCreatedDimmed: function popupCreatedDimmed() {
    var createDiv = document.createElement('div');
    createDiv.classList.add('popup_dimmed');
    document.querySelector('.container').appendChild(createDiv);
  },
  // dimmed 삭제
  popupDeleteDimmed: function popupDeleteDimmed() {
    var popupDimmed = document.querySelector('.popup_dimmed');
    if (popupDimmed) {
      popupDimmed.style.opacity = 0;
      popupDimmed.addEventListener('transitionend', function() {
        if (popupDimmed.parentNode !== null) popupDimmed.parentNode.removeChild(popupDimmed);
      });
    };
  },
  // popup 닫기
  popupClose: function popupClose() {
    var currentTarget = event.currentTarget; // 키보드 이벤트 ESC 일 경우 currentTarget 설정
    if (event.key == 'Escape' || event.key == 'Esc') currentTarget = popupVariables.KeyEvtEl.querySelector('.btn_layer_close'); // 일반적인 클릭, 키보드 이벤트 일 경우 currentTarget 설정
    else {
      var popupId = currentTarget.getAttribute('popup-close');
      if (currentTarget.getAttribute('popup-close-all') === 'true') return $app_this.popupCloseAll();
      if (currentTarget.getAttribute('popup-confirm')) {
        if(!confirmEvt[popupId]()) {
	        return;
		}
      }else if (currentTarget.getAttribute('popup-cancel')) cancelEvt[popupId]();
    }
    popupVariables.popupAll.forEach(function(popupEl) {
      if (popupEl.getAttribute('data-popup') === currentTarget.getAttribute('popup-close')) {
        popupEl.classList.remove('popup_open'); // 저장된 focus element 가 있을 때
        if (popupVariables.focusEl.length > 0) {
          // focus 상태 재설정
          popupVariables.focusEl[popupVariables.popupDepth - 1].focus(); // popup focus Element 삭제
          popupVariables.focusEl.splice(popupVariables.popupDepth - 1, 1); // popup depth 재설정
          popupVariables.popupDepth -= 1; // ESC 키 동작을 위한 현재 활성화 된 popup element 저장
          popupVariables.KeyEvtEl = document.querySelector(".layer_popup_wrap[popup-depth='".concat(popupVariables.popupDepth, "']"));
        } else {
          // 저장된 focus element 가 없을 때
          if (popupVariables.pageFocus !== null) {
            popupVariables.pageFocus.focus();
            popupVariables.KeyEvtEl = null;
          } else {
            document.body.setAttribute('tabindex', '0');
            document.body.focus();
            popupVariables.KeyEvtEl = null;
          }
        }
      };
    }); // 오픈 된 popup이 있는 지 확인
    var openPopups = document.querySelectorAll('.popup_open');
    if (openPopups.length === 0) {
      $app_this.popupCloseAll('none');
      popupVariables.pageFocus = null;
    } // 오픈된 popup이 있을 경우 popup dimmed 수정
    else if (openPopups.length > 0) {
      var getPopupValue = currentTarget.getAttribute('popup-close') || currentTarget.getAttribute('data-popup');
      var getPopupDepth = Number(document.querySelector(".layer_popup_wrap[data-popup='".concat(getPopupValue, "']")).getAttribute('popup-depth'));
      if (document.querySelector(".layer_popup_wrap[popup-depth='".concat(getPopupDepth - 1, "']")).classList.contains('prev_popup')) {
        document.querySelector(".layer_popup_wrap[popup-depth='".concat(getPopupDepth - 1, "']")).classList.remove('prev_popup');
      }
      document.querySelector(".layer_popup_wrap[data-popup='".concat(getPopupValue, "']")).removeAttribute('popup-depth');
      openPopups.forEach(function(openPopupEl) {
        if (openPopupEl.classList.contains('all_menu_wrap')) {
          openPopupEl.classList.remove('prev_popup');
          $app_this.popupDeleteDimmed();
        };
      });
    };
    popupVariables.isAlert = false;

	if (typeof popupCloseAfter === "function") {
		popupCloseAfter(currentTarget);
	}
  },
  // 열려있는 popup 전체 닫기
  popupCloseAll: function popupCloseAll(focusActionNone) {
    $app_this.popupDeleteDimmed(); // popup depth 설정 삭제
    popupVariables.popupAll.forEach(function(popupEl) {
      popupEl.classList.remove('prev_popup');
      popupEl.removeAttribute('popup-depth');
    }); // scroll lock 해지
    document.body.classList.remove('scroll_lock'); // popupClose Event 통해서 focus 설정이 되지 않았을 경우 (popupCloseAll 단독 실행일 경우)
    if (focusActionNone !== 'none' && focusActionNone === undefined) {
      // 저장된 focus element 가 있을 때
      if (popupVariables.focusEl.length > 0) popupVariables.focusEl[0].focus(); // 저장된 focus element 가 없을 때
      else {
        document.body.setAttribute('tabindex', '0');
        document.body.focus();
      }; // focus reset
      popupVariables.focusEl = [];
    } // open class 삭제
    popupVariables.popupAll.forEach(function(popupEl) {
      return popupEl.classList.remove('popup_open');
    }); // popup depth reset
    popupVariables.popupDepth = 0; // KeyEvtEl reset
    popupVariables.KeyEvtEl = null;
    popupVariables.isAlert = false;

	if (typeof popupAllCloseAfter === "function") {
		popupAllCloseAfter();
	}
  },
  // popup 닫기 키보드 이벤트
  popupCloseBtnKeyDown: function popupCloseBtnKeyDown() {
    if (event.key == 'Tab' && !event.shiftKey || event.key == 'ArrowRight') {
      event.preventDefault();
      popupVariables.popupAll.forEach(function(popupEl) {
        if (popupEl.getAttribute('data-popup') === event.target.getAttribute('popup-close')) {
          popupEl.querySelector('.layer_popup_title').focus();
        };
      });
    };
  },
  // popup
  popup: function popup(selector) {
    var _this = this;
    if (selector == undefined) {
      selector = document;
    }
    var popup = document.querySelector('[data-popup]');
    if (popup) {
      popupVariables.popupCloseBtnAll = selector.querySelectorAll('[popup-close]');
      popupVariables.popupBtnAll = selector.querySelectorAll('[aria-haspopup="dialog"]'); // 팝업 열기 이벤트 할당
      popupVariables.popupBtnAll.forEach(function(popupBtn) {
        popupBtn.removeEventListener('click', _this.popupOpen);
        popupBtn.addEventListener('click', _this.popupOpen);
      }); // 팝업 닫기 이벤트 할당
      popupVariables.popupCloseBtnAll.forEach(function(popupCloseBtn) {
        popupCloseBtn.removeEventListener('click', _this.popupClose);
        popupCloseBtn.addEventListener('click', _this.popupClose); // 팝업 닫기 공통 버튼 키보드 이벤트 할당
        if (popupCloseBtn.classList.contains('btn_layer_close')) {
          popupCloseBtn.removeEventListener('keydown', _this.popupCloseBtnKeyDown);
          popupCloseBtn.addEventListener('keydown', _this.popupCloseBtnKeyDown);
        }
      });
    }
  },
  // accordion
  accordion: function accordion(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var accordion = document.querySelector('[data-role="accordion-group"]');
    if (accordion) {
      var accordionGroups = selector.querySelectorAll('[data-role="accordion-group"]'); // accordion hide
      var accordionHide = function accordionHide(target, targetContent) {
        target.setAttribute('aria-expanded', 'false');
        targetContent.style.height = "".concat(0, "px");
        targetContent.style.overflow = 'hidden';
        targetContent.removeEventListener('transitionstart', accordionTransitionEvt);
        targetContent.addEventListener('transitionend', accordionTransitionEvt);
      };
      var accordionClickEvt = function accordionClickEvt() {
        var currentTarget = event.currentTarget;
        var accordionWrapper = currentTarget.closest('[data-role="accordion-group"]');
        var accordionBtns = accordionWrapper.querySelectorAll('[data-role="accordion-btn"]');
        var accordionOption = accordionWrapper.getAttribute('accordion-option');
        var targetContents = accordionWrapper.querySelector("[aria-labelledby=\"".concat(currentTarget.id, "\"]")); // toggle type (default)
        if (currentTarget.getAttribute('aria-expanded') === 'true') {
          accordionHide(currentTarget, targetContents);
        } else {
          targetContents.removeEventListener('transitionstart', accordionTransitionEvt);
          targetContents.addEventListener('transitionend', accordionTransitionEvt); // 연결 된 accordion은 무조건 하나씩 만 열리는 type
          if (accordionOption === 'only') {
            // accordion 속성 false 로 변경
            accordionBtns.forEach(function(accordionBtn) {
              accordionHide(accordionBtn, accordionWrapper.querySelector("[aria-labelledby=\"".concat(accordionBtn.id, "\"]")));
            });
          }; // 선택 된 accordion 속성 true 상태로 변경
          currentTarget.setAttribute('aria-expanded', 'true');
          targetContents.removeAttribute('hidden');
          targetContents.style.height = "".concat(targetContents.scrollHeight, "px");
        }
      }; // height size transition event 후 hidden 속성 추가
      var accordionTransitionEvt = function accordionTransitionEvt() {
        var targetContent = event.currentTarget;
        var target = document.querySelector("[aria-controls='".concat(targetContent.id, "']"));
        if (target.getAttribute('aria-expanded') === 'false') targetContent.setAttribute('hidden', 'true');
        else {
          targetContent.removeAttribute('hidden'); // accordion 오픈 시 tooltip에 의한 스크롤이 생기지 않도록 속성 추가
          targetContent.style.overflow = 'visible';
        }
      }; // 이벤트 할당
      accordionGroups.forEach(function(accordionGroup) {
        var accordionBtns = accordionGroup.querySelectorAll('[data-role="accordion-btn"]'); // 초기 셋팅
        var accordionInit = function accordionInit(target, targetContent) {
          var transitionDuration; // 초기 셋팅 : accordion contents height size 에 비례한 transition duration 수정
          if (targetContent.scrollHeight * 0.0008 >= 0.7) transitionDuration = '0.7s';
          else if (targetContent.scrollHeight * 0.0008 <= 0.3) transitionDuration = '0.3s';
          else transitionDuration = "".concat(targetContent.scrollHeight * 0.0008, "s");
          targetContent.style.transitionDuration = transitionDuration; // 초기 셋팅 : button 의 aria-expanded 값이 false 인 accordion contents 에 hidden 값 할당
          if (target.getAttribute('aria-expanded') === 'false' && targetContent !== null) {
            targetContent.setAttribute('hidden', 'true');
            targetContent.style.overflow = 'hidden';
            targetContent.style.height = "".concat(0, "px");
          }; // 초기 셋팅 : button 의 aria-expanded 값이 true 인 accordion contents 에 height size 할당
          if (target.getAttribute('aria-expanded') === 'true' && targetContent !== null) targetContent.style.height = "".concat(targetContent.scrollHeight, "px");
        };
        accordionBtns.forEach(function(accordionBtn) {
          var accordionBtnId = accordionBtn.id;
          var targetContents = document.querySelector("[aria-labelledby=\"".concat(accordionBtnId, "\"]"));
          accordionInit(accordionBtn, targetContents);
          accordionBtn.removeEventListener('click', accordionClickEvt);
          accordionBtn.addEventListener('click', accordionClickEvt);
          var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'childList') {
                var accordionContChild = targetContents.children;
                var accordionChildScrollHeight = 0;
                var marginTop = [];
                var marginBottom = [];
                for (var i = 0; i < accordionContChild.length; i++) {
                  var innerContentStyle = getComputedStyle(accordionContChild[i]);
                  marginTop[i] = parseInt(innerContentStyle.marginTop.replace(/[^0-9\.]+/g, ''));
                  marginBottom[i] = parseInt(innerContentStyle.marginBottom.replace(/[^0-9\.]+/g, ''));
                  accordionChildScrollHeight += accordionContChild[i].scrollHeight + marginTop[i] + marginBottom[i];
                };
                targetContents.style.height = "".concat(accordionChildScrollHeight, "px");
              }
            });
          });
          var option = {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
          };
          observer.observe(targetContents, option);
        });
      });
    }
  },
  // Input 요소 clear button Event
  inputClear: function inputClear(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var input = document.querySelector('.form_input');
    if (input) {
      var inputAll = selector.querySelectorAll('.form_input'); // clear button style 정의
      var valueChangeEvt = function valueChangeEvt() {
        var inputEl = event.currentTarget;
        var inputWrap = inputEl.closest('.form_input');
        var clearBtn = inputWrap.querySelector('.btn_input_reset');
        if (inputEl.value.length > 0) {
          clearBtn.style.display = '';
          if (inputWrap.classList.contains('number_type')) inputEl.style.paddingRight = "".concat(48, "px");
        } else {
          if (clearBtn) clearBtn.style.display = 'none';
          if (inputWrap.classList.contains('number_type')) inputEl.style.paddingRight = '';
        };
      }; // clear button click event
      var clearBtnEvt = function clearBtnEvt() {
        var inputEl = event.currentTarget.closest('.form_input').querySelector('input:not([type="hidden"])');
        inputEl.value = '';
        inputEl.focus();
      }; // input 요소 이벤트 할당
      inputAll.forEach(function(inputWrap) {
        var inputEl = inputWrap.querySelector('input:not([type="hidden"])');
        var clearBtn = inputWrap.querySelector('.btn_input_reset');
        if (clearBtn) {
          clearBtn.style.display = 'none';
          clearBtn.removeEventListener('click', clearBtnEvt);
          clearBtn.addEventListener('click', clearBtnEvt);
          inputEl.removeEventListener('input', valueChangeEvt);
          inputEl.addEventListener('input', valueChangeEvt);
          inputEl.removeEventListener('focus', valueChangeEvt);
          inputEl.addEventListener('focus', valueChangeEvt);
        }
      });
    }
  },
  // Tab
  tab: function tab(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var isRightTab = function isRightTab(e) {
      var parent = e.parentNode;
      var indentCount = 0;
      while (parent.tagName !== 'BODY') {
        indentCount++;
        parent = parent.parentNode;
      }
      return indentCount;
    };
    var tab = document.querySelector('[data-role="tab"]');
    if (tab) {
      var tabGroups = selector.querySelectorAll('[data-role="tab"]');
      var tabBtnInit = function tabBtnInit(tabListWrap) {
        tabListWrap.querySelectorAll('li').forEach(function(btnWrapper) {
          btnWrapper.querySelector('.btn_tab').removeEventListener('click', tabBtnEvt);
          btnWrapper.querySelector('.btn_tab').addEventListener('click', tabBtnEvt);
        });
      };
      var tabContentEvt = function tabContentEvt(tabWapper, tabContentAll, event) {
        var nowIndent = 0;
        tabContentAll.forEach(function(tabContent) {
          var nowTabIndent = isRightTab(tabContent);
          if (nowIndent === 0) {
            nowIndent = nowTabIndent;
          } else if (nowIndent !== nowTabIndent) {
            return;
          }
          tabContent.style.display = 'none';
          if (event === undefined) {
            if (tabContent.getAttribute('aria-labelledby') === tabWapper.querySelector('.btn_tab[aria-selected="true"]').id) {
              tabContent.style.display = 'block';
            };
          } else {
            if (tabContent.getAttribute('aria-labelledby') === event.target.id) tabContent.style.display = 'block';
          }
        });
      };
      var tabBtnEvt = function tabBtnEvt() {
        var tabWapper = event.currentTarget.closest('[data-role="tab"]');
        var tabListWrap = tabWapper.querySelector('.tab_list_wrap');
        var tabContentAll = tabWapper.querySelectorAll('[role="tabpanel"]');
        if (event.target.getAttribute('aria-selected') === 'false') {
          tabListWrap.querySelectorAll('li').forEach(function(btnWrapper) {
            btnWrapper.querySelector('.btn_tab').setAttribute('aria-selected', 'false');
          });
          tabContentEvt(tabWapper, tabContentAll, event);
          event.target.setAttribute('aria-selected', 'true');
        };
      };
      tabGroups.forEach(function(tabWapper) {
        var tabListWrap = tabWapper.querySelector('.tab_list_wrap');
        var tabContentAll = tabWapper.querySelectorAll('[role="tabpanel"]');
        tabBtnInit(tabListWrap);
        tabContentEvt(tabWapper, tabContentAll);
      });
    }
  },
  // Tooltip
  tooltip: function tooltip(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var tooltip = document.querySelector('.tooltip');
    if (tooltip) {
      var tooltips = selector.querySelectorAll('.tooltip');
      var btnTooltipOpens = selector.querySelectorAll('.tooltip_open');
      var btnTooltipCloses = selector.querySelectorAll('.tooltip_close'); // tooltip close function
      var tooltipClose = function tooltipClose(e) {
        var targetParent = e.target.closest('.tooltip');
        var btnOpen = targetParent.querySelector('.tooltip_open');
        targetParent.classList.remove('active_tooltip');
        btnOpen.setAttribute('aria-expanded', false);
        btnOpen.focus();
      }; // tooltop open function
      var tooltipOpen = function tooltipOpen(e) {
        var targetParent = e.target.closest('.tooltip'); // 다른 툴팁이 열려있으면 모두 닫기
        tooltips.forEach(function(tooltip) {
          if (tooltip !== targetParent) {
            tooltip.classList.remove('active_tooltip');
          }
        });
        targetParent.classList.toggle('active_tooltip'); // aria-expanded value toggle
        if (e.target.getAttribute('aria-expanded') === 'false') {
          e.target.setAttribute('aria-expanded', true);
        } else {
          e.target.setAttribute('aria-expanded', false);
        }
        e.target.nextElementSibling.focus();
        var focusableEls = e.target.nextElementSibling.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
        var firstFocusEl = focusableEls[0];
        var lastFocusEl = focusableEls[focusableEls.length - 1];
        var leaveTooltip = function leaveTooltip(e) {
          if (e.target === firstFocusEl && e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            tooltipClose(e);
          }
          if (e.target === lastFocusEl && e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            tooltipClose(e);
          }
        };
        firstFocusEl.removeEventListener('keydown', leaveTooltip);
        firstFocusEl.addEventListener('keydown', leaveTooltip);
        lastFocusEl.removeEventListener('keydown', leaveTooltip);
        lastFocusEl.addEventListener('keydown', leaveTooltip);
      }; // 툴팁이 열려있을 경우, 툴팁과 팝업 외의 영역 클릭 시 툴팁 닫기
      var clickBodyToCloseTooltip = function clickBodyToCloseTooltip(e) {
        var openTolltip = selector.querySelector('.active_tooltip');
        var openPopups = selector.querySelectorAll('.popup_open');
        var popupDimmed = selector.querySelector('.popup_dimmed');
        if (openTolltip && !e.target.closest('.active_tooltip') && !openPopups.length > 0 && !popupDimmed) {
          openTolltip.querySelector('.tooltip_open').setAttribute('aria-expanded', false);
          openTolltip.classList.remove('active_tooltip');
        }
      };
      btnTooltipOpens.forEach(function(btnOpen) {
        btnOpen.removeEventListener('click', tooltipOpen);
        btnOpen.addEventListener('click', tooltipOpen);
      });
      btnTooltipCloses.forEach(function(btnClose) {
        btnClose.removeEventListener('click', tooltipClose);
        btnClose.addEventListener('click', tooltipClose);
      });
      if (selector != undefined) {
        document.body.removeEventListener('click', clickBodyToCloseTooltip);
        document.body.addEventListener('click', clickBodyToCloseTooltip);
      }
    }
  },
  // hoverTooltip
  hoverTooltip: function hoverTooltip(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var tooltip = document.querySelector('[role="tooltip"]');
    var tooltipShow = function tooltipShow() {
      document.querySelector("#".concat(event.target.getAttribute('aria-describedby'))).style.display = 'block';
    };
    var tooltipHide = function tooltipHide() {
      document.querySelector("#".concat(event.target.getAttribute('aria-describedby'))).style.display = 'none';
    };
    if (tooltip) {
      var tooltips = selector.querySelectorAll('.tooltip_icon');
      tooltips.forEach(function(tooltipIcon) {
        // tooltipIcon.removeEventListener('mouseover', tooltipShow);
        tooltipIcon.addEventListener('mouseover', tooltipShow); // tooltipIcon.removeEventListener('mouseout', tooltipHide);
        tooltipIcon.addEventListener('mouseout', tooltipHide); // tooltipIcon.removeEventListener('focusin', tooltipShow);
        tooltipIcon.addEventListener('focusin', tooltipShow); // tooltipIcon.removeEventListener('focusout', tooltipHide);
        tooltipIcon.addEventListener('focusout', tooltipHide);
      });
    }
  },
  // Table sticky header
  tableStickyHeader: function tableStickyHeader(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var scrollInner = document.querySelector('.scroll_inner');
    if (scrollInner && document.body.classList.contains('ie') && !scrollInner.classList.contains('none_scroll')) {
      var scrollInners = selector.querySelectorAll('.scroll_inner');
      scrollInners.forEach(function(scrollInner) {
        var scrollInnerHeight = scrollInner.clientHeight;
        if (scrollInner.querySelector('table')) {
          var tableHeight = scrollInner.querySelector('table').scrollHeight;
          var stickyHeader = scrollInner.querySelector('thead');
          if (scrollInnerHeight < tableHeight) {
            var cols = scrollInner.querySelectorAll('colgroup col');
            var ths = stickyHeader.querySelectorAll('th');
            var scrollWidth = scrollInner.offsetWidth - scrollInner.scrollWidth;
            scrollInner.style.paddingTop = "".concat(stickyHeader.scrollHeight - 2, "px");
            stickyHeader.style.position = 'absolute';
            stickyHeader.style.display = 'table';
            stickyHeader.style.width = "calc(100% - ".concat(scrollWidth, "px)");
            for (var i = 0; i < ths.length; i++) {
              ths[i].style.width = cols[i].style.width;
            }
          }
        }
      });
    }
  },
  // Toast popup
  toastPopup: function toastPopup(message) {
    var toast = document.querySelector('[data-toast="toast"]');
    var messageDiv = toast.querySelector('p');
    messageDiv.innerText = message;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', function(e) {
        return toastHide();
      });
    }, 2500);
    var toastHide = function toastHide() {
      toast.style.display = 'none';
      messageDiv.innerText = '';
    };
  },
  // 상품 카드형 slide
  swiper: function swiper(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var thisSlide = [],
      // Swiper Slide
      focusOut,
      // 슬라이드 키보드 접근 확인
      slideFocus = {},
      // 슬라이드 내부 탭 포커스 가능한 요소 저장
      slideAll = [],
      // 전체 슬라이드 저장
      realSlideAll = [],
      // loop 슬라이드 제외 슬라이드 저장
      slideLength = [],
      // 슬라이드 갯수
      paginationAll,
      pagination = []; // pagination
    var swiperSlide = document.querySelector('.swiper-container');
    var slideKeyDownEvt = function slideKeyDownEvt() {
      var slideNum = Number(event.currentTarget.getAttribute('data-swiper-slide-index'));
      var idx = Number(event.currentTarget.closest('.swiper-container').getAttribute('data-slide')); // back tab : 첫 번째 슬라이드 포커스 시
      if (event.key == 'Tab' && event.shiftKey && thisSlide[idx].realIndex === 0) {
        focusOut = false; // back tab : 그 외 슬라이드 포커스 시
      } else if (event.key == 'Tab' && event.shiftKey && event.target === slideFocus[idx][slideNum][1]) {
        event.preventDefault();
        focusOut = true;
        slideAll[idx][thisSlide[idx].activeIndex - 1].setAttribute('tabindex', '0');
        thisSlide[idx].slideTo(thisSlide[idx].activeIndex - 1);
        removeSlideTabindex(idx);
      } else if (event.key == 'Tab' && !event.shiftKey && event.target === slideFocus[idx][slideNum][slideFocus[idx][slideNum].length - 1]) {
        if (slideNum >= slideLength[idx]) {
          // tab : 마지막 슬라이드 내 마지막 요소 포커스 시
          focusOut = false;
        } else {
          // tab : 그 외 슬라이드 내 마지막 요소 포커스 시
          event.preventDefault();
          if (slideAll[idx][thisSlide[idx].activeIndex + 1] <= slideLength[idx]) slideAll[idx][thisSlide[idx].activeIndex + 1].setAttribute('tabindex', '0');
          focusOut = true;
          thisSlide[idx].slideTo(thisSlide[idx].activeIndex + 1);
          removeSlideTabindex(idx);
        }
      };
    }; // 슬라이드 내부 클릭 요소 tabindex 값 삭제
    var removeSlideTabindex = function removeSlideTabindex(idx) {
      realSlideAll[idx].forEach(function(element) {
        var focusTarget = Array.prototype.slice.call(element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled], [role="button"], [tabindex="0"])'));
        focusTarget.forEach(function(el) {
          if (el.closest('.swiper-slide') === realSlideAll[idx][thisSlide[idx].realIndex]) el.removeAttribute('tabindex');
        });
      });
    };
    var slideFocusAct = function slideFocusAct() {
      var wrapper = event.currentTarget.closest('.card_swiper_wrap') || event.currentTarget.closest('.terms_swiper_wrap');
      var idx = Number(wrapper.querySelector('.swiper-container').getAttribute('data-slide'));
      var index = Number(event.currentTarget.getAttribute('data-slide-bullet'));
      if (event.key == 'Enter') {
        slideFocus[idx][index][0].focus();
      }
    };
    if (swiperSlide) {
      var swiperSlideAll = selector.querySelectorAll('.swiper-container');
      swiperSlideAll.forEach(function(slide, idx) {
        slideFocus[idx] = {};
        var swiperWrapper = slide.closest('.card_swiper_wrap') || slide.closest('.terms_swiper_wrap');
        slide.setAttribute('data-slide', idx);
        var option = {
          threshold: 10,
          // 터치 민감도
          pagination: {
            el: swiperWrapper.querySelector('.swiper-pagination'),
            clickable: true
          },
          navigation: {
            nextEl: swiperWrapper.querySelector('.swiper-button-next'),
            prevEl: swiperWrapper.querySelector('.swiper-button-prev')
          },
          observer: true,
          observeParents: true,
          on: {
            init: function init() {
              slideAll[idx] = slide.querySelectorAll('.swiper-slide');
              realSlideAll[idx] = slide.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
              var autoplay = swiperWrapper.querySelector('.btn_play');
              thisSlide[idx] = this;
              if (slideAll[idx] === realSlideAll[idx]) realSlideAll[idx] = slideAll[idx];
              slideLength[idx] = realSlideAll[idx].length - 1;
              if (slideAll[idx].length <= 1) {
                if (swiperWrapper.querySelector('.swiper-pagination')) swiperWrapper.querySelector('.swiper-pagination').style.display = 'none';
                if (swiperWrapper.querySelector('.swiper-button-prev') && swiperWrapper.querySelector('.swiper-button-next')) {
                  swiperWrapper.querySelector('.swiper-button-prev').style.display = 'none';
                  swiperWrapper.querySelector('.swiper-button-next').style.display = 'none';
                }
                option.noSwipingSelector = slide;
              }
              if (swiperWrapper.classList.contains('loop')) {
                var copySlideAll = document.querySelectorAll('.swiper-slide-duplicate');
                copySlideAll.forEach(function(element) {
                  element.setAttribute('aria-hidden', 'true');
                });
              }
              realSlideAll[idx].forEach(function(element, index) {
                element.setAttribute('data-swiper-slide-index', index);
                realSlideAll[idx][thisSlide[idx].realIndex].setAttribute('tabindex', '0');
                var focusTarget = Array.prototype.slice.call(element.querySelectorAll('a[href]:not(:disabled), button:not(:disabled), textarea:not(:disabled), input[type="text"]:not(:disabled), input[type="radio"]:not(:disabled), input[type="checkbox"]:not(:disabled), select:not(:disabled), [role="button"]'));
                focusTarget.forEach(function(el) {
                  if (el.closest('.swiper-slide') !== realSlideAll[idx][thisSlide[idx].realIndex]) {
                    el.setAttribute('tabindex', '-1');
                  };
                });
                slideFocus[idx][index] = Array.prototype.slice.call(element.querySelectorAll('a[href]:not(:disabled), button:not(:disabled), textarea:not(:disabled), input[type="text"]:not(:disabled), input[type="radio"]:not(:disabled), input[type="checkbox"]:not(:disabled), select:not(:disabled), [role="button"]'));
                slideFocus[idx][index].unshift(element);
                slideFocus[idx][index][0].removeEventListener('keydown', slideKeyDownEvt);
                slideFocus[idx][index][0].addEventListener('keydown', slideKeyDownEvt);
              });
              if (autoplay) {
                autoplay.addEventListener('click', function() {
                  var autoPlayState = autoplay.getAttribute('aria-pressed');
                  if (autoPlayState === 'false') {
                    autoplay.setAttribute('aria-pressed', 'true');
                    thisSlide[idx].autoplay.stop();
                  } else if (autoPlayState === 'true') {
                    autoplay.setAttribute('aria-pressed', 'false');
                    thisSlide[idx].autoplay.start();
                  }
                });
              }
              if (swiperWrapper.classList.contains('main_swiper')) {
                if (slideAll[idx].length === 1) {
                  swiperWrapper.classList.add('slide_length_1');
                } else if (slideAll[idx].length === 2) {
                  swiperWrapper.classList.add('slide_length_2');
                } else {
                  swiperWrapper.classList.add('slide_length_3');
                }
              }
            },
            slideNextTransitionEnd: function slideNextTransitionEnd() {
              // 키보드 탭 버튼으로 인한 슬라이드 변경 시 동작
              if (focusOut) {
                slideFocus[idx][this.realIndex][0].focus();
                focusOut = false;
              };
            },
            slidePrevTransitionStart: function slidePrevTransitionStart() {
              // 키보드 탭 버튼으로 인한 슬라이드 변경 시 동작
              if (focusOut) {
                slideFocus[idx][this.realIndex][slideFocus[idx][this.realIndex].length - 1].focus();
                focusOut = false;
              };
            },
            slideChangeTransitionStart: function slideChangeTransitionStart() {
              if (document.querySelector('.terms_swiper_wrap')) {
                var termsCont = document.querySelectorAll('.terms_popup_con');
                termsCont.forEach(function(terms) {
                  terms.style.overflowY = 'hidden';
                });
              }
            },
            slideChangeTransitionEnd: function slideChangeTransitionEnd() {
              var _this2 = this;
              // 예금 메인 자동재생
              if (thisSlide[idx] && swiperWrapper.querySelector('.btn_play')) {
                if (!thisSlide[idx].autoplay.running) {
                  swiperWrapper.querySelector('.btn_play').setAttribute('aria-pressed', 'true');
                }
              } // 약관 이벤트
              if (document.querySelector('.terms_swiper_wrap')) {
                var termsSelectList = document.querySelectorAll('.hamberg_layer button');
                termsSelectList.forEach(function(termsBtn, idx) {
                  termsBtn.removeAttribute('aria-current');
                  if (idx === _this2.activeIndex) termsBtn.setAttribute('aria-current', 'page');
                });
                var termsCont = document.querySelectorAll('.terms_popup_con');
                termsCont.forEach(function(terms) {
                  if (terms.closest('.swiper-slide-active')) {
                    terms.style.overflowY = '';
                  }
                });
              }
            },
            // 메인 페이지 스와이퍼 우측 영역 콘텐츠 변경
            slideChange: function slideChange() {
              var _this3 = this;
              if (thisSlide[idx].el.classList.contains('main_swiper_container')) {
                var rightContents = swiperWrapper.closest('.user_info').querySelector('.info_bottom_list').getElementsByClassName('info_bottom_list_item');
                var rightContentsArray = Array.prototype.slice.call(rightContents);
                rightContentsArray.forEach(function(content, idx) {
                  if (idx === _this3.activeIndex) rightContents[idx].style.display = 'block';
                  else rightContents[idx].style.display = 'none';
                });
              }
            }
          }
        };
        if (swiperWrapper.classList.contains('loop')) option.loop = true; // 예금 메인 스와이프 option
        if (swiperWrapper.classList.contains('product_swiper')) {
          option.spaceBetween = 40;
          option.slidesPerView = 2;
        } // 메인 금융상품 스와이프 option
        if (swiperWrapper.classList.contains('main_product_swiper')) {
          option.spaceBetween = 38;
          option.slidesPerView = 'auto';
          option.loop = true;
          option.centeredSlides = true;
          option.initialSlide = 1;
        } // 자동재생 & 무한루프 일 경우
        if (swiperWrapper.classList.contains('autoplay')) {
          swiperWrapper.setAttribute('tabindex', '0');
          option.autoplay = {
            delay: 3000
          };
          var autoplayStopEvt = function autoplayStopEvt() {
            var idx = event.currentTarget.querySelector('.swiper-container').getAttribute('data-slide');
            if (event.target === event.currentTarget && event.key == 'Tab' && !event.shiftKey) {
              thisSlide[idx].autoplay.stop();
              focusOut = true;
              thisSlide[idx].slideToLoop(0, 0);
              slideFocus[idx][thisSlide[idx].realIndex][0].setAttribute('tabindex', '0');
              slideFocus[idx][thisSlide[idx].realIndex][0].focus();
              removeSlideTabindex(idx);
            }
          };
          swiperWrapper.removeEventListener('keyup', autoplayStopEvt);
          swiperWrapper.addEventListener('keyup', autoplayStopEvt);
        }; // 약관 이벤트
        if (swiperWrapper.classList.contains('terms_swiper_wrap')) option.noSwipingSelector = slide;
        if (swiperWrapper.classList.contains('main_swiper')) {
          // option.slidesPerView = 1.2;
          option.centeredSlides = true;
          option.spaceBetween = 100; // option.effect = 'fade';
        }
        swipers[idx] = new Swiper(slide, option);
        paginationAll = swiperWrapper.querySelectorAll('.swiper-pagination-bullet');
        paginationAll.forEach(function(bullet, index) {
          pagination[index] = bullet;
          bullet.setAttribute('data-slide-bullet', index);
          bullet.removeEventListener('keydown', function(e) {
            return slideFocusAct(e, index, idx);
          });
          bullet.addEventListener('keydown', function(e) {
            return slideFocusAct(e, index, idx);
          });
        });
      });
    };
  },
  search: function search(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var search = document.querySelector('[data-role="search"]');
    if (search) {
      var searchAll = selector.querySelectorAll('[data-role="search"]');
      searchAll.forEach(function(search) {
        var searchContainer = search.querySelector('.search_bar_container');
        var searchInputArea = search.querySelector('.search_input');
        var searchCloseBtn = search.querySelector('.close_btn');
        var searchBtn = search.querySelector('.search_btn');
        var isMenuSearch = search.classList.contains('all_menu_search');
        var body = document.querySelector("body");
        var isFocused = false;
        var outsideClick = function outsideClick() {
          var target = event.target;
          if (!searchContainer.contains(target)) {
            inputFocus.remove();
          }
        };
        var focusOutEvent = {
          closeBtnFocusoutEvent: function closeBtnFocusoutEvent() {
            if (!isFocused) {
              inputFocus.add(); // transitionend event 는 한번만 실행돼야 함
              var transEvent = function transEvent() {
                searchInputArea.focus();
                searchContainer.removeEventListener('transitionend', transEvent);
              };
              searchContainer.addEventListener('transitionend', transEvent);
            }
          },
          upsideFocusoutEvent: function upsideFocusoutEvent() {
            if (event.shiftKey && event.key === 'Tab') inputFocus.remove();
          },
          downsideFocusoutEvent: function downsideFocusoutEvent() {
            if (event.key === 'Tab' && !event.shiftKey) inputFocus.remove();
          }
        };
        var inputFocus = {
          add: function add() {
            searchContainer.classList.add('focused');
            isFocused = true;
            searchContainer.style.height = 636 + 'px';
          },
          remove: function remove() {
            searchContainer.classList.remove('focused');
            isFocused = false;
            if (isMenuSearch) {
              searchContainer.style.height = 163 + 'px';
            } else {
              searchContainer.style.height = 88 + 'px';
            }
          },
          defaultPlaceHolder: '',
          focusPlaceholder: function focusPlaceholder() {
            defaultPlaceHolder = searchInputArea.placeholder;
            searchInputArea.placeholder = '검색어를 입력해주세요.';
          },
          focusOutPlaceholder: function focusOutPlaceholder() {
            searchInputArea.placeholder = defaultPlaceHolder;
          }
        };
        var pushEnter = function pushEnter() {
          if (event.key === 'Enter' && isFocused) inputFocus.remove();
        }; // 검색 인풋창 포커스시 placeholder 변경
        searchInputArea.removeEventListener('focus', inputFocus.focusPlaceholder);
        searchInputArea.addEventListener('focus', inputFocus.focusPlaceholder);
        searchInputArea.removeEventListener('focusout', inputFocus.focusOutPlaceholder);
        searchInputArea.addEventListener('focusout', inputFocus.focusOutPlaceholder); // 검색창 열기 이벤트 할당
        searchInputArea.removeEventListener('click', inputFocus.add);
        searchInputArea.addEventListener('click', inputFocus.add); // focus 시 열림 이벤트 할당
        searchInputArea.removeEventListener('focus', inputFocus.add);
        searchInputArea.addEventListener('focus', inputFocus.add); // focus가 닫기 버튼(검색창이 열리지 않았을 때)으로 들어왔을 때 포커스 입력창으로 이동
        searchCloseBtn.removeEventListener('focusin', focusOutEvent.closeBtnFocusoutEvent);
        searchCloseBtn.addEventListener('focusin', focusOutEvent.closeBtnFocusoutEvent); // 검색창 닫기 이벤트 할당
        searchCloseBtn.removeEventListener('click', inputFocus.remove);
        searchCloseBtn.addEventListener('click', inputFocus.remove); // 결과 내 재검색
        // 검색 버튼 누를 시 검색 창 닫힘
        searchBtn.removeEventListener('click', inputFocus.remove);
        searchBtn.addEventListener('click', inputFocus.remove); // 검색 창 안에서 엔터 누를 시 검색 창 닫힘
        searchInputArea.removeEventListener('keydown', pushEnter);
        searchInputArea.addEventListener('keydown', pushEnter); // 바깥 영역 클릭하여 닫기
        if (selector != undefined) {
          body.removeEventListener('click', outsideClick);
          body.addEventListener('click', outsideClick);
        } // 영역 포커스 벗어날 때 닫기 - 위쪽
        searchInputArea.removeEventListener('focusout', focusOutEvent.upsideFocusoutEvent);
        searchInputArea.addEventListener('keydown', focusOutEvent.upsideFocusoutEvent); // 영역 포커스 벗어날 때 닫기 - 아래쪽
        searchCloseBtn.removeEventListener('keydown', focusOutEvent.downsideFocusoutEvent);
        searchCloseBtn.addEventListener('keydown', focusOutEvent.downsideFocusoutEvent);
      });
    }
  },
  // 버튼형 카드 계좌 선택 (single)
  selectableCard: function selectableCard(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var card = document.querySelector('[data-role="selectable-card"]');
    if (card) {
      var selectableCards = selector.querySelectorAll('[data-role="selectable-card"]');
      var selectCardEvt = function selectCardEvt() {
        if (event.target.classList.contains('selected')) {
          event.target.classList.remove('selected');
        } else {
          selectableCards.forEach(function(card) {
            // 카드 그룹이 여러개일 경우, 다른 그룹 선택 상태에 영향을 주지 않도록 그룹 체크
            if (event.target.closest('.card_list').getAttribute('data-role') === card.closest('.card_list').getAttribute('data-role')) {
              card.classList.remove('selected');
            }
          });
          event.target.classList.add('selected');
        }
      };
      selectableCards.forEach(function(card) {
        card.removeEventListener('click', selectCardEvt);
        card.addEventListener('click', selectCardEvt);
      });
    }
  },
  // 체크박스가 있는 카드 계좌 선택 (다중 선택)
  checkboxInCard: function checkboxInCard(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var checkCard = document.querySelector('[data-role="checkbox-card"]');
    if (checkCard) {
      var cardCheckboxs = selector.querySelectorAll('[data-role="checkbox-card"] input[type="checkbox"]');
      var cardCheckEvt = function cardCheckEvt() {
        event.target.closest('[data-role="checkbox-card"]').classList.toggle('selected', event.target.checked);
      };
      cardCheckboxs.forEach(function(checkbox) {
        // default로 선택된 체크박스 있을 경우 selected 클래스 추가
        if (checkbox.checked) {
          checkbox.closest('[data-role="checkbox-card"]').classList.add('selected');
        }
        checkbox.removeEventListener('click', cardCheckEvt);
        checkbox.addEventListener('click', cardCheckEvt);
      });
    }
  },
  // 텍스트 타입 인풋 박스가 있는 카드 focus event
  inputInCard: function inputInCard(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var inputCard = document.querySelector('[data-role="input-card"]');
    if (inputCard) {
      var inputCards = selector.querySelectorAll('[data-role="input-card"]');
      var inputFocusInEvt = function inputFocusInEvt() {
        event.target.closest('[data-role="input-card"]').classList.add('focused');
      };
      var inputFocusOutEvt = function inputFocusOutEvt() {
        event.target.closest('[data-role="input-card"]').classList.remove('focused');
      };
      inputCards.forEach(function(inputCard) {
        inputCard.removeEventListener('focusin', inputFocusInEvt);
        inputCard.removeEventListener('focusout', inputFocusOutEvt);
        inputCard.addEventListener('focusin', inputFocusInEvt);
        inputCard.addEventListener('focusout', inputFocusOutEvt);
      });
    }
  },
  // 슬라이드 약관 클릭 이벤트
  termsSlideEvt: function termsSlideEvt(selector) {
    if (selector == undefined) {
      selector = document;
    }
    var termsSlide = document.querySelector('.terms_swiper_wrap');
    if (termsSlide) {
      var termsSelectList = selector.querySelectorAll('.hamberg_layer button');
      var clickEvt = function clickEvt() {
        var target = event.currentTarget;
        var idx;
        termsSelectList.forEach(function(termsBtn, index) {
          if (termsBtn === target) idx = index;
        });
        var targetParent = target.closest('.tooltip');
        var btnOpen = targetParent.querySelector('.tooltip_open');
        targetParent.classList.remove('active_tooltip');
        btnOpen.setAttribute('aria-expanded', false);
        swipers[0].slideTo(idx, 0);
        btnOpen.focus();
      };
      termsSelectList.forEach(function(termsBtn) {
        termsBtn.removeEventListener('click', clickEvt);
        termsBtn.addEventListener('click', clickEvt);
      });
    }
  },
  init: function init(selector) {
    $app_this = this;
    this.skipNav(); // skipNav
    this.fixBanner(); // 띠배너
    this.gnb(); // GNB
    this.footerLink(); // Footer Select Link
    this.datepicker(selector); // datepicker
    this.selectBox(selector); // Select (Dropdown) Menu
    this.popup(selector); // Popup
    this.accordion(selector); // Accordion
    this.inputClear(selector); // Input Clear button
    this.tab(selector); // Tab
    this.tooltip(selector); // Tooltip
    this.hoverTooltip(selector); // HoverToolTip
    this.tableStickyHeader(selector); // Table sticky header
    this.swiper(selector); // 상품 카드형 slide
    this.search(selector); // Search 검색창
    this.selectableCard(selector); // 버튼형 카드 계좌 선택 (single)
    this.checkboxInCard(selector); // 체크박스가 있는 카드 계좌 선택 (다중 선택)
    this.inputInCard(selector); // 텍스트 타입 인풋 박스가 있는 카드 focus event
    this.termsSlideEvt(selector); // 슬라이드 약관 클릭 이벤트
  }
};

export default app;