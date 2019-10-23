//This is the function library for Thor. 
//It is used for common functions and to make syntax simple. 

let AddElem = (type : string, innerHTML : string) => 
{
    let el = document.createElement(type)
    el.innerHTML = innerHTML
    if (!document.getElementById("GamePreviewWindow"))
    {
        document.body.appendChild(el)
    }
    else
    {
        document.getElementById("GamePreviewWindow").appendChild(el)
    }
}