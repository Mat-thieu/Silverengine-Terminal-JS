(function(){
console.time('Terminal Exec');
// --- SNIPPETS/TOOLS ---
// SNIPPET: Bootstrap dom queries and event handlers
var _id = function(id){return document.getElementById(id);},
    _class = function(className){return document.getElementsByClassName(className);},
    _tag = function(tag){return document.getElementsByTagName(tag);},
    _query = function(query){return documen.querySelectorAll(query);};
Object.defineProperty(Object.prototype, 'on', {
    value: function(eventName, cb) {
        var self = this;
        if(this.constructor.name == 'HTMLCollection' || this.constructor.name == 'NodeList'){
            for (var i = this.length - 1; i >= 0; i--) this[i].addEventListener(eventName, function(e){cb(e)}, false);
        }
        else this.addEventListener(eventName, function(e){cb(e, self)}, false);
    },
    enumerable: false
});

Object.defineProperty(Object.prototype, 'ajaxIsSuccessful', {
    value : function() {
        if (this.status == undefined) return false;
        return this.status >= 200 && this.status < 400;
    },
    enumerable: false
})

// SNIPPET: Branches-mini version
String.prototype.$ = function(attr){
        var ele = document.createElement(this);
        if(attr) for(key in attr) ele.setAttribute(key, attr[key]);

        var branchesInstance = new Branches(ele);
        return branchesInstance;
};
var Branches = function(ele){ this.ele = ele;}
Branches.prototype = {
    txt : function(content){
        var txtNode = document.createTextNode(content);
        this.ele.appendChild(txtNode);
        return this;
    },
    html : function(customHtml){
        this.ele.innerHTML = customHtml;
        return this;
    },
    add : function(content){
        var self = this;
        content.forEach(function(val, ind){
            if(val == '[object NodeList]' || val == '[object HTMLCollection]'){
                for (var i = val.length - 1; i >= 0; i--) { self.ele.appendChild(val[i]) };
            }
            else self.ele.appendChild(val.ele);

        })
        return this;
    },
    raw : function(){ return this.ele.outerHTML; },
    get : function(){ return this.ele; },
    resolve : function(){
        var frag = document.createDocumentFragment();
        frag.appendChild(this.ele);
        return frag;
    }
}

String.prototype.toDashedCase = function(){
    return this.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

var termStorage = {
    local : {
        get : function(name){
            return JSON.parse(localStorage.getItem(name));
        },
        store : function(name, data){
            localStorage.setItem(name, JSON.stringify(data));
        },
        setDefault : function(name, data){
            if(localStorage.getItem(name) == null){
                localStorage.setItem(name, JSON.stringify(data));
                return true;
            }
            else return false;
        }
    },
    session : {
        get : function(name){
            return JSON.parse(sessionStorage.getItem(name));
        },
        store : function(name, data){
            sessionStorage.setItem(name, JSON.stringify(data));
        },
        setDefault : function(name, data){
            if(sessionStorage.getItem(name) == null){
                sessionStorage.setItem(name, JSON.stringify(data));
                return true;
            }
            else return false;
        }
    }
}


// --- TERMINAL CODE ---
var terminal = {
    isHidden : null,
    position : {top : 0, left : 0},
    html : null,
    help : false,
    node : null,
    msgOutput : null,
    toolbar : null,
    content: null,
    cmdCache : {
        data : [],
        currentIndex : -1
    },
    contents : {
        title : "Terminal",
        username : "Admin"
    },
    styles : {
        "#term" : {
            background : "rgb(8, 57, 82)",
            borderRadius : "5px",
            position : "fixed",
            height : "370px",
            width : "600px",
            color : "#383838",
            fontFamily : "arial",
            display : "none",
            "-webkit-user-select" : "none",
            "-moz-user-select" : "none",
            "-ms-user-select" : "none",
            userSelect: "none"
        },
        "#term a" : {
            textDecoration : "none",
            color: "#3498db"
        },
        "#termToolbar" : {
            background : "#ccc linear-gradient(to bottom, #ebebeb, #d5d5d5)",
            borderRadius : "3px 3px 0px 0px",
            height : "28px",
            fontWeight : "bold",
            paddingTop : "5px",
            cursor : "move"
        },
        "#termContent" : {
            padding : "10px",
            height : "86%",
            overflowY : "scroll"
        },
        "#termTitle" : {
            textAlign : "center",
            marginTop : "2px",
        },
        ".termUsername" : {
            color : "#52a563"
        },
        ".termAccent" : {
            color : "#00A7B3",
            marginLeft : "5px",
            marginRight : "5px"
        },
        "#termOutput .termAccent" : {
            color : "#05949E"
        },
        "#termOutput .termUsername" : {
            color : "#558B60"
        },
        "#termInput" : {
            background : "none",
            border : "0px solid transparent",
            color : "white",
            width : "480px",
            fontSize : "1em"
        },
        "#termInput:focus" : {
            outline : "0px solid transparent"
        },
        ".termAlignHorizontal" : {
            display : "inline-block"
        },
        "#termOutput" : {
            color: "white"
        }
    }
}

var buildTerminal = function(){

    var applyStyles = function(){
        var styleString = '';
        for(selector in terminal.styles){
            styleString += selector+'{';
            for(style in terminal.styles[selector]){
                styleString += style.toDashedCase()+':'+terminal.styles[selector][style]+';';
            }
            styleString += '}';
        }
        var styleTag = 'style'.$().txt(styleString).resolve();
        document.head.appendChild(styleTag);
    }();

    terminal.html =
    'div'.$({'id' : 'term'}).add([
        'div'.$({'id' : 'termToolbar'}).add([
            'div'.$({'id' : 'termTitle'}).txt(terminal.contents.title)
        ]),
        'div'.$({'id' : 'termContent'}).add([
            'div'.$({'id' : 'termOutput'}),
            'div'.$({'id' : 'termField'}).add([
                'div'.$({'class' : 'termUsername termAlignHorizontal'}).txt(terminal.contents.username),
                'div'.$({'class' : 'termAccent termAlignHorizontal'}).txt(' ~ '),
                'input'.$({'type' : 'text', 'id' : 'termInput', 'class' : 'termAlignHorizontal', 'autofocus' : 'true'})
            ])
        ])
    ]);

    console.time('DOM load from here');

    document.addEventListener("DOMContentLoaded", function(event) {
        document.body.appendChild(terminal.html.resolve());

        console.timeEnd('DOM load from here');
    });
}();

terminal.node = terminal.html.get();
terminal.content = terminal.node.querySelector('#termContent');
terminal.msgOutput = terminal.node.querySelector('#termOutput');
terminal.toolbar = terminal.node.querySelector('#termToolbar');

// --- TERM METHODS ---
var term = {
    loadCachedState : function(){
        // Check terminal's hidden state
        if(termStorage.local.setDefault('terminalIsHidden', {state : true})) terminal.isHidden = true;
        else{
            var state = termStorage.local.get('terminalIsHidden')['state'];
            terminal.isHidden = state;
            if(!state) terminal.node.style.display = "block";
        }
        // Return to original terminal position
        var lastPos = termStorage.local.get('terminalPosition');
        if(lastPos !== null){
            terminal.node.style.top = lastPos.top+'px';
            terminal.node.style.left = lastPos.left+'px';
        }
        // Load former content
        var lastMessages = termStorage.local.get('terminalMessageCache');
        if(lastMessages !== null){
            lastMessages.forEach(function(val, ind){
                switch(val['type']){
                    case 'response':
                        term.write.response(val['message'], true);
                    break;

                    case 'error':
                        term.write.error(val['message'], true);
                    break;

                    case 'command':
                        term.write.command(val['message'], true);
                    break;
                }
            })

            term.scroll();
        }
        // Load cached commands
        if(termStorage.session.setDefault('terminalCommandCache', [])) terminal.cmdCache.data = [];
        else{
            var lastCommands = termStorage.session.get('terminalCommandCache');
            terminal.cmdCache.data = lastCommands;
        }

        this.makeDraggable();
    },
    makeDraggable : function(){
        // Ripped from https://github.com/Mat-thieu/Drag-queen-JS
        var dragElPos = {innerTop : 0, innerLeft : 0, pageLeft : 0, pageTop : 0};
        var animFrameHook;
        var throttle = 0;
        var setCoordinates = function (e) {
            throttle++;
            if(!(throttle % 2) || throttle == 1){
                dragElPos.pageTop = (e.pageY-dragElPos.innerTop);
                dragElPos.pageLeft = (e.pageX-dragElPos.innerLeft);
            }
        }
        var handleMovement = function(){
            terminal.node.style.top = dragElPos.pageTop+'px';
            terminal.node.style.left = dragElPos.pageLeft+'px';
            animFrameHook = requestAnimationFrame(handleMovement);
        }
        terminal.toolbar.addEventListener('mousedown', function(e){
            var rect = terminal.node.getBoundingClientRect();
            dragElPos = {innerLeft : e.pageX - rect.left, innerTop : e.pageY - rect.top};
            handleMovement();
            window.addEventListener('mousemove', setCoordinates, false);
            window.addEventListener('mouseup', function _funcHook(){
                throttle = 0;
                cancelAnimationFrame(animFrameHook);
                window.removeEventListener('mouseup', _funcHook);
                window.removeEventListener('mousemove', setCoordinates, false);
                termStorage.local.store('terminalPosition', {top : dragElPos.pageTop, left : dragElPos.pageLeft});
            })
        })
    },
    display : function(bool){
        if(bool){
            terminal.node.style.display = "block";
            terminal.isHidden = false;
            termStorage.local.store('terminalIsHidden', {state : false});
        }
        else{
            terminal.node.style.display = "none";
            terminal.isHidden = true;
            termStorage.local.store('terminalIsHidden', {state : true});
        }
    },
    scroll : function(){
        terminal.content.scrollTop = terminal.content.scrollHeight;
    },
    commandSubmit : function(ele){
        var thisVal = ele.value.trim();
        var thisValArr = thisVal.split(' ');
        var thisCmd = thisValArr.shift();
        ele.value = "";

        this.cacheCommand(thisVal);

        term.write.command(thisVal);

        switch(thisCmd){
            case 'echo' :
                term.write.response(thisVal.replace(thisCmd, ""));
            break;

            case 'clear':
                while(terminal.msgOutput.firstChild) terminal.msgOutput.removeChild(terminal.msgOutput.firstChild);
                term.cacheMessage('clear');
            break;

            case 'exit':
            case 'q':
                term.display(false);
                term.cacheMessage('clear');
            break;

            case 'help':
            case '-h':
            case '--help':
                term.help.getData(function(res){
                    var data = term.help.generate(res);
                    term.write.response(data);
                    term.scroll();
                })
            break;

            default:
                sendValue(thisVal, function(err, res){
                    if(err) term.write.error('An error occured.');
                    else term.write.response(res);
                    term.scroll();
                })
            break;
        }

        term.scroll();
    },
    cacheMessage : function(type, message){
        if(type == 'clear') localStorage.removeItem('terminalMessageCache');
        else{
            termStorage.local.setDefault('terminalMessageCache', []);
            var store = termStorage.local.get('terminalMessageCache');
            store.push({type : type, message : message});
            termStorage.local.store('terminalMessageCache', store);
        }
    },
    cacheCommand : function(msg){
        var cmdCache = termStorage.session.get('terminalCommandCache');
        cmdCache.push(msg);
        termStorage.session.store('terminalCommandCache', cmdCache);
        terminal.cmdCache.data.push(msg);
    },
    write :  {
        error : function(msg, omitCache){
            var entries = msg.split('\n');
            entries.forEach(function(val, ind){
                var line = 'div'.$({'class' : 'output-line', 'style' : 'color: #e74c3c;'}).txt(val).resolve();
                terminal.msgOutput.appendChild(line);
            })
            if(!omitCache) term.cacheMessage('error', msg);
        },
        command : function(msg, omitCache){
            var entries = msg.split('\n');
            entries.forEach(function(val, ind){
                var line =
                'div'.$({'class' : 'output-line'}).add([
                    'span'.$({'class' : 'termUsername termAlignHorizontal'}).txt(terminal.contents.username),
                    'span'.$({'class' : 'termAccent termAlignHorizontal'}).txt(' ~ '),
                    'div'.$({'class' : 'termAlignHorizontal'}).txt(val)
                ]).resolve();
                terminal.msgOutput.appendChild(line);
            })
            if(!omitCache) term.cacheMessage('command', msg);
        },
        response : function(msg, omitCache){
            var entries = msg.split('\n');
            entries.forEach(function(val, ind){
                var line = 'div'.$({'class' : 'output-line'}).html(val).resolve();
                terminal.msgOutput.appendChild(line);
            })
            if(!omitCache) term.cacheMessage('response', msg);
        }
    },
    help : {
        getData : function(cb){
            if(!terminal.help){
                var request = new XMLHttpRequest();
                request.open('GET', "help.json", true);
                request.onload = function() {
                    if (request.ajaxIsSuccessful()) {
                        var res = false;
                        try{
                            res = JSON.parse(request.responseText);
                        }
                        catch(e){
                            console.error('Not a valid JSON response from a request made to "'+url+'"', e);
                        }

                        if(res){
                            terminal.help = res;
                            cb(res);
                        }
                    }
                    else console.error('Error loading data');
                };
                request.onerror = function() {
                    console.error('Error loading data');
                };
                request.send();
            }
            else cb(terminal.help);
        },
        generate : function(data){
            var helpArr = [
                'Author: '+data['author'],
                'Version: '+data['version'],
                '<hr>',
                '<b>Available commands</b>',
                '"echo [message]" Log a message in the terminal',
                '"clear" Clear the terminal of all logged messages',
                '"exit" or "q" Close terminal'
            ];
            for(key in data['subjects']) helpArr.push('"'+key+' --help" For more info about '+key+' commands');

            return helpArr.join('\n');
        }
    }
}


window.addEventListener('keydown', function(e){
    if((e.which == 36 || e.keyCode == 36) || ((e.keyCode == 81 || e.which == 81) && e.ctrlKey)){
        if(terminal.isHidden) term.display(true);
        else term.display(false);
    }
    else if(e.which == 27 || e.keyCode == 27) term.display(false);
});

var sendValue = function(data, cb){
    cb(true);
    // var request = new XMLHttpRequest();
    // request.open('POST', 'system/terminal/api/run.php', true);
    // request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    // request.onload = function() {
    //     if (request.status >= 200 && request.status < 400) {
    //         // Do other things
    //         cb(false);
    //     }
    //     else cb(true);
    // };

    // request.onerror = function() {

    // };

    // request.send();
}

terminal.node.querySelector('#termInput').on('keydown', function(e, ele){
    if(e.which == 13 || e.keyCode == 13) term.commandSubmit(ele);
    else if(e.which == 38 || e.which == 40){
        var currentIndex = terminal.cmdCache.currentIndex;
        var cache = Array.prototype.slice.call(terminal.cmdCache.data).reverse();
        switch(e.which){
            case 38:
                if(cache[currentIndex+1]){
                    terminal.cmdCache.currentIndex++;
                    ele.value = cache[terminal.cmdCache.currentIndex];
                }
            break;

            case 40:
                if(currentIndex-1 >= 0){
                    terminal.cmdCache.currentIndex--;
                    ele.value = cache[terminal.cmdCache.currentIndex];
                }
                else{
                    ele.value = "";
                    terminal.cmdCache.currentIndex = -1;
                }
            break;
        }
    }
})

term.loadCachedState();
console.timeEnd('Terminal Exec');
})();

