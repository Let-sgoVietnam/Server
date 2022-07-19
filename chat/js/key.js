var socket = io();

var text = document.getElementById('text');
var log = document.getElementById('log');

var room = 0;
var names = '';

text.addEventListener("keydown", (e) => 
{
    var line = text.value.split('\n').length;
    if(e.key === 'Enter')
    {
        if(e.shiftKey){
        console.log("E");
        line = text.value.split('\n').length + 1;
        }
    }
    else if(e.key === 'Backspace'){
        if(line > 0) {
        console.log("B");
        console.log(text.value.split('\n')[text.value.split('\n').length-1]);
        if(text.value.split('\n')[text.value.split('\n').length-1] == '') line = text.value.split('\n').length - 1;
        }
    }
    else{
        line = text.value.split('\n').length;
    }
    text.style.height = `${(line-1)*33+30}px`;
    console.log(line);
});