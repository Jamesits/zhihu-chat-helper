// ==UserScript==
// @name       Zhihu Chat Helper
// @author     James Swineson
// @namespace  http://swineson.me/
// @version    0.2.1.10
// @description  Make Zhihu chat function better!
// @match      http://www.zhihu.com/inbox*
// @copyright  2014 James Swineson
// ==/UserScript==
//=========================================================================
/* 
 * About
 * 
 * This is Zhihu Chat Helper by James Swineson. This script is intended to 
 * add a little handy functions for Zhihu chat function. 
 * 
 * Currently this script is in its very, very early stage, and is unstable 
 * and may cause *anything*, including data loss, untidy pages, strange 
 * text inserted into your messages, or what I don't know. Also, you should
 * know this script have access to your information stored on zhihu.com. I
 * promise I will NOT collect them on purpose, but may use it locally to 
 * enhance user experience.
 * 
 * I deeply appreciate those who helped in developing, testing and giving 
 * advice to this project. Their names are listed below.
 * 
 * Contributors: @Hazel, @Shi Chiachi, @Joy Neop, @苓叶, @大猫
 * 
 * This script is provided AS IS, and USE AT YOUR OWN RISK. Released under 
 * CC BY-NC-SA 3.0 China Mainland License.
 * 
 * Contant me at i@swineson.me if you have anything related to this script
 * to share with me.
 * 
 */
//=========================================================================

// ==========================================================================
/*
 * How to define a new module
 * 
 * Nodules are objects with certain properties. The basic one you need is 
 * module.metadata, which is defined below in the template. Another special
 * thing is module.main(), which will be triggered once ZCH runs. Use _function()
 * for private functions.
 * 
 * calling a function in another module can be easy using 
 * anotherModule.someFunction(). Remember to refer to the docs first.
 * 
 * 
 * A template for a new module:

var newModule = {
    metadata : new ZchModuleMetadata("newModule", 				// Exactly the same as the variable name for your module.
                                     "Display Name", 			// The name for display.
                                     "0.0.0", 					// Version. Can be in any format.
                                     "Author", 										
                                     "Description", 
                                     "*", 						// Match: currently not in use.
                                     "Copyright information"
                                    ),
}

*/
// ========================================================================


// ===================== Global Settings ==================================
var debugMode = 1;
var requiredModules = ["Zch", "ZchLogger", "messageAnalyser","htmlEncoder", "sidebarUtility", "test"];
var optionalModules = ["debuginf", "image", "hideZchid", "showImage"];
var zchUpdateDetail = "0.2.1.10：继续改进桌面通知算法。";

//=========================================================================
/*
 *  DO NOT CHANGE THE FOLLOWING LINES UNLESS YOU KNOW WHAT YOU ARE DOING!
 */
//====================== Global Variable ==================================

var loadedModules = [];			// Store all modules with metadata
//var GMWindow = unsafeWindow || window;	// In greasemonkey, use this to refer to window.
/*
if (GM_info === undefined){
	GM_info = {
		script: {
			name: "Zhihu Chat Helper",
			version: "0.2.1.10"
		}
	}
}
*/
// ============================ Useful Functions ==========================

// Check if jQuery has been loaded before ZCH starts.
if (jQuery === undefined || $ === undefined){
  console.log("ZchLogger: [ERROR]jQuery not found. Quitting ZCH.");
}

//TODO: This function doesn't work.
function isSubset(set, subset){
  var i, j, hasFoundMatch;
  if (typeof set !== "object") {
    return -1;
  }
  if (typeof subset !== "object") {
    subset = [subset];
  }
  
  for (i in subset){
    hasFoundMatch = false;
    for (j in set){
      if (i===j) {
        hasFoundMatch = true;
        break;
      }
    }
    if (!hasFoundMatch) {
      return i;
    }
  }
  return 0;
}

// ============== Metadata object definition for a module. ================
function ZchModuleMetadata(name, displayName, version, author, description, match, copyright) {
  if (!name) {
    console.log("ZchLogger: [ERROR]Defining a module without name. Quitting ZCH.");
    return;
  }
  this.name = name;
  this.displayName = displayName || name;
  this.version = version || "0.0.0";
  this.author = author || "";
  this.description = description || "";
  this.match = match || []; 
  this.copyright = copyright || "";
  loadedModules.push(name);
}
// ======================= Modules under this line. =========================
var ZchLogger = {
  
  metadata : new ZchModuleMetadata("ZchLogger", 
                                   "ZCH Logger", 
                                   "0.0.1", 
                                   "James Swineson", 
                                   "ZCH log and debug helper", 
                                   "*", 
                                   "2014 James Swineson"
                                  ),
  
  // private function _print(context);
  // print a line to console.
  _print : function(context){
    console.log("ZchLogger: " + context);
  },
  
  // public function debug(context);
  // log on debug purpose. (e.g. print variable value, etc.)
  debug : function(context){
    if (debugMode===1){
      ZchLogger._print("[DEBUG]" + context);
    }
  },
  
  // public function log(context);
  // Normal information.
  log : function(context){
    if (debugMode===1){
      
      ZchLogger._print("[INFO]" + context);
    }
  },
  
  // public function warning(context);
  // An error happens but won't affect normal function.
  warning: function(context){
    ZchLogger._print("[WARNING]" + context);
  },
  
  // public function error(context);
  // Fatal error.
  error: function(context){
    ZchLogger._print("[ERROR]" + context);
  }   
};

var htmlEncoder = {
  metadata : new ZchModuleMetadata("htmlEncoder", 
                                   "HTML Encoder", 
                                   "0.0.1", 
                                   "I'm Jack@oschina.net", 
                                   "Encode and decode HTML strings. See http://www.oschina.net/code/snippet_12_3293 for more information.", 
                                   "*", 
                                   ""
                                  ),
  // public function encode(string);
  // HTML escape
  encode : function (str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },
  
  // public function decode(string);
  // Reverse HTML escape process
  decode : function (str) {
    var div = document.createElement("div");
    div.innerHTML = str;
    return div.innerHTML;
  }
};

var sidebarUtility = {
  metadata : new ZchModuleMetadata("sidebarUtility", 
                                   "Sidebar Utility", 
                                   "0.0.1", 
                                   "James Swineson", 
                                   "Provide methods to modify sidebar.", 
                                   "*", 
                                   "2014 James Swineson"
                                  ),
  
  // public function addSection(id, class);
  // Add a section on sidebar. Class zm-side-section will be added automatically.
  addSection : function (sid, sclass) {
    $('<div id="' + sid + '"class="zm-side-section"' + (sclass || "") +'></div>').appendTo(".zu-main-sidebar");
    return $("#"+sid);
  }
};


/*
 * Instructions for using messageAnalyser module
 * 
 * messageAnalyser is what you use to analyse every single message and replace embedded ZCH 
 * additional data (in the format of [triggerText externData]) with real impressive things 
 * provided by your own module.
 * 
 * To use messageAnalyser, you should declare a trigger in your main() function, like this:
 * 
	main : function(){
		messageAnalyser.addTrigger("triggerText", yourModule.processFunction);
	}
 * 
 * And yourModule.processFunction should receive zero or only one parameter, which represents 
 * the full string of "triggerText externData" ("[]" not included). yourModule.processFunction 
 * should return a raw string/HTML context or a string/HTML context wrapped in $ 
 * (i.e. $("someString")), then this string will be used to replace origin embedded additional 
 * data.
 * 
 * CAUTION: Any return value will be added to the page as HTML. Do necessary check to ensure it's
 * safe!
 * 
 */
var messageAnalyser = {
  metadata : new ZchModuleMetadata("messageAnalyser", 
                                   "Message Analyser", 
                                   "0.0.1", 
                                   "James Swineson", 
                                   "Analyse your messages and invoke different modules to process \"additional data\" inside messages.", 
                                   "*", 
                                   "2014 James Swineson"
                                  ),
  
  triggerInterval : 500, //Rescan interval: millsecnd(s)
  triggerList : {}, // Create a dictionary
  
  addTrigger : function(trigger, callback){
    messageAnalyser.triggerList[trigger] = callback;
  },
  
  processMessageListChange : function(){
    var i, data, contextPosition, context, j, scanValue, k, extData, replacementContext, newContext, newData, trigger;
    for (i=0; i<$(".zm-pm-item-main").length; i+=1){
      data = $($(".zm-pm-item-main")[i]).text();
      contextPosition = data.indexOf("：");
      if (contextPosition >=0){
        context = data.substring(contextPosition + 1, data.length - 1);
        for (j=0; j<context.length; j+=1){
          scanValue = context.substring(j, j + 1);
          if (scanValue === "["){
            innerLoop:
            for (k=j+1; k<context.length; k+=1){
              if (context.substring(k, k + 1) === "]"){
                extData = context.substring(j+1,k);
                for (trigger in messageAnalyser.triggerList){
                  if (extData.indexOf(trigger) === 0){
                    replacementContext = messageAnalyser.triggerList[trigger](extData);
                    newContext = htmlEncoder.encode(context.substring(0, j)) + '<div style="display:none;" id="zchimg' + i + '"></div>' + htmlEncoder.encode(context.substring(k+1, context.length));
                    newData = data.substring(0, contextPosition+1) + newContext;
                    $($(".zm-pm-item-main")[i]).html(newData);
                    $(replacementContext).insertAfter("div#zchimg" + i);
                    break innerLoop; 
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  
  main : function(){
    messageAnalyser.processMessageListChange();
    setInterval(messageAnalyser.processMessageListChange, messageAnalyser.triggerInterval);
  }
};


// ================== Non-system Modules under this line. ===============

var debuginf = {
  
  metadata : new ZchModuleMetadata("debuginf", 
                                   "Debug Information", 
                                   "0.0.1", 
                                   "James Swineson", 
                                   "Output some debug information on sidebar", 
                                   "*", 
                                   "2014 James Swineson"
                                  ),
  _addline: function(text) {
    $("#dbgtext").html($("#dbgtext").html() + text +"<br />");
  },
  
  main : function(){
    sidebarUtility.addSection("dbg");
    
    // The following lines need refactor.
    
    $('<h3>Debug Information</h3>').appendTo("#dbg");
    $("<p></p>").appendTo("#dbg").attr('id', 'dbgtext');
    
    debuginf._addline(Zch.name);
    debuginf._addline("by James Swineson");
    debuginf._addline("Version: " + Zch.version + " " + Zch.developingStage);
    debuginf._addline("注意：这是一个处于早期开发阶段的 Script。安装本 Script 即视为允许本 Script 获取储存在 zhihu.com 上的一切数据。作者承诺不有意收集任何隐私。由于使用本 Script 造成的任何后果，作者概不负责。详细信息参见源代码。");
    debuginf._addline("如有任何问题可联系 i@swineson.me");
    debuginf._addline("<br />更新详情<br />" + zchUpdateDetail);
  }
};

var hideZchid = {
  
  metadata : new ZchModuleMetadata("hideZchid", 
                                   "Hide zchid", 
                                   "0.0.1", 
                                   "James Swineson", 
                                   "(Deprecated)Hide [zchid=?] tag in messages.", 
                                   "*", 
                                   "2014 James Swineson"
                                  ),
  hide : function(){
    return "";
  },
  
  main : function(){
    messageAnalyser.addTrigger("zchid=", hideZchid.hide);
  }
};

var showImage = {
  
  metadata : new ZchModuleMetadata("showImage", 
                                   "Show Image", 
                                   "0.0.1", 
                                   "James Swineson", 
                                   "Show embedded images in messages, support both data uri and extern link.", 
                                   "*", 
                                   "2014 James Swineson"
                                  ),
  
  showImageInDataUri : function(extData){
    return $("<img />").attr("src", extData);
  },
  
  showImageInExternLink : function(extData){
    var uri;
    uri = extData.substring("data:zch/imageuri;charset=utf-8,".length, extData.length); 
    return $("<img />").attr("src", uri);
  },
  
  main : function(){
    messageAnalyser.addTrigger("data:image/", showImage.showImageInDataUri);
    messageAnalyser.addTrigger("data:zch/imageuri;charset=utf-8,", showImage.showImageInExternLink);
  }
};

// Inbox notifyer
var inboxNotifyer = {
  
  metadata : new ZchModuleMetadata("inboxNotifyer", 
                                   "Inbox Notifyer", 
                                   "0.0.1", 
                                   "James Swineson", 
                                   "Show popup dialogs to notify you when there is anew message.", 
                                   "*", 
                                   "2014 James Swineson"
                                  ),
  triggerInterval : 500, //Rescan interval: millsecnd(s)
  //waitBeforeFirstTrigger : 5000,
  
  lastMessageCount : 0,
  nowMessageCount : 0,
  notificationPermission : 0,
  
  // Greasemonkey Notification Support
  
  _ifSupportNotification : function(){
    return true;
  },
  
  _showNotification : function(title, body){
    //GM_notification("Context", "Title", null, 1000);
    //window.Notification.requestPermission()
    
    var notificationOnClick = function(e){
      window.open("http://www.zhihu.com/inbox",
                  "ZCHInboxWindow",
                  "resizable,scrollbars,status");
      e.target.close();
    };
    
    var notification = new window.Notification(title, {
      dir : "auto",
      lang : "zh-Hans",
      body : body,
      tag : "ZchInboxNotifyer0",
      icon : "http://www.zhihu.com/favicon.ico"
    });
    notification.addEventListener("click", notificationOnClick);
  },
  
  showNotification : function(){
    inboxNotifyer._showNotification("知乎私信助手", "有 " + inboxNotifyer.nowMessageCount + " 条未读私信！");
  },
  
  // Script taken from here: https://developer.mozilla.org/en-US/docs/Web/API/notification
  checkAndShowNotification : function(){
    
    if (!("Notification" in window)) {
      ZchLogger.error("This browser does not support desktop notification.");
    }
    
    // Let's check if the user is okay to get some notification
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      inboxNotifyer.showNotification();
    }
      
      // Otherwise, we need to ask the user for permission
      // Note, Chrome does not implement the permission static property
      // So we have to check for NOT 'denied' instead of 'default'
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          
          // Whatever the user answers, we make sure we store the information
          if(!('permission' in Notification)) {
            Notification.permission = permission;
          }
          
          // If the user is okay, let's create a notification
          if (permission === "granted") {
            inboxNotifyer.showNotification();
          }
        });
      }
      
      
      },
  
  checkNew : function(disableNotification){
    inboxNotifyer.nowMessageCount = parseInt($("#zh-top-nav-pm-count").text()) || 0;
    if ((inboxNotifyer.lastMessageCount !== inboxNotifyer.nowMessageCount) && (inboxNotifyer.nowMessageCount !== 0) && !disableNotification) {
      inboxNotifyer.checkAndShowNotification();
    }
    inboxNotifyer.lastMessageCount = inboxNotifyer.nowMessageCount;
  },
  
  main : function(){ 
    inboxNotifyer.checkNew(true);
    setInterval(inboxNotifyer.checkNew, inboxNotifyer.triggerInterval);
  }
};



// ================== Non-system Modules above this line. ===============

// ============================= Main Script ============================

var Zch = {
  
  metadata : new ZchModuleMetadata("Zch", 
                                   "Zhihu Chat Helper", 
                                   "0.2.1", 
                                   "James Swineson", 
                                   "Zhihu Chat Helper main module", 
                                   "*", 
                                   "2014 James Swineson"
                                  ),
  
  name : "Zhihu Chat Helper",  	// Script name
  version : "0.2.1.10", 				//Script version
  developingStage : "Alpha",		//Developing stage
  
  
  
  // private function _init();
  // do some assignments.
  // Caution: only compatible in greasemonkey script.
  _init : function(){
    //Zch.name = GM_info.script.name || "Zhihu Chat Helper";
    //Zch.version = GM_info.script.version || "undefined" ;
    //ZchLogger.log(Zch.name + " Version " + Zch.version + " " + Zch.developingStage);
    //ZchLogger.debug(chrome.extension);
  },
  
  // private function _moduleCheck(optional moduleName);
  // check if a module exists.
  _moduleCheck : function(moduleName){
    var missingModule;
    ZchLogger.log("Scanning modules...");
    ZchLogger.log("Found modules: " + loadedModules);
    missingModule = isSubset(loadedModules, requiredModules);
    if (missingModule !== 0){
      ZchLogger.error("Required module " + missingModule +" missing.");
    }
    missingModule = isSubset(loadedModules, optionalModules);
    if (missingModule !== 0){
      ZchLogger.warning("Optional module " + missingModule +" missing.");
    }
  },
  
  _checkMatch : function(moduleName, uri){
    matchString = (eval(moduleName)).metadata.match;
    matchUri = uri || window.location.href;
    if(1){
      return true;
    } else {
      return false;
    }
  },
  
  
  // private function _loadModule(optional moduleName);
  // load modules. ignoreMatch = true: ignore "match" settings in metadata.
  
  _loadModule : function(moduleName, ignoreMatch){
    var i, ifRunSuccess;
    ifRunSuccess = false;
    for (i in loadedModules){
      if (loadedModules[i] === moduleName && (ignoreMatch || Zch._checkMatch(moduleName) || false)){
        ifRunSuccess = true;
        ZchLogger.log("Running " + loadedModules[i] + "...");
        (eval(loadedModules[i]).main || function(){})(); //if there ia a main() in some module, then execute it.
        ZchLogger.log(loadedModules[i] + " finished.");
        break;
      }
    }
    if (!ifRunSuccess){
      ZchLogger.error("Missing module " + moduleName + ".");
      return false;
    }
  },
  
  _loadAllModule : function(){
    var i;
    ZchLogger.log("Loading modules...");
    for (i in loadedModules){
      if (loadedModules[i] !== Zch.metadata.name  && (Zch._checkMatch(loadedModules[i]) || false) ){
        ZchLogger.log("Running " + loadedModules[i] + "...");
        (eval(loadedModules[i]).main || function(){})(); //if there ia a main() in some module, then execute it.
        ZchLogger.log(loadedModules[i] + " finished.");
      }
    }
  },
  
  
  // public function main();
  // Zhihu Chat Helper main function
  
	// TODO: get _init() back!
  main : function(){
    ZchLogger.log("Starting ZCH...");
    Zch._init();
    Zch._moduleCheck();
    Zch._loadAllModule();
    ZchLogger.log("ZCH finished loading.");
  }  
};

// Check if jQuery has been loaded again.
if (jQuery !== undefined && $ !== undefined){
  // Launch ZCH on document.ready
  $(Zch.main);
} else {
  ZchLogger.error("jQuery not found. Quitting ZCH.");
}