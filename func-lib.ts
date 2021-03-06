//This is the function library for Thor. 
//It is used for common functions and to make syntax simple. 
//It is included with every build

function AddElem(type : string, innerHTML : string) : any

function AddElem(type : string, innerHTML : string, id? : string) : any
{
    const el = document.createElement(type)
    el.innerHTML = innerHTML

    if (id != undefined)
    {
        el.id = id
    }

    AppendChildToCorrectElement(el)

    return el
}

function AddButton(text : string, onclick : string) : HTMLButtonElement
//Shorthand
function AddButton(text : string, onclick : any, id? : string) : HTMLButtonElement
{
    const el = document.createElement("button")
    el.innerHTML = text

    if (id != undefined)
    {
        el.id = id
    }

    el.onclick = onclick

    AppendChildToCorrectElement(el)

    return el
}

//Adds canvas with optional context as well
function AddCanvas(contextName? : string, mode? : string, style? : string) : HTMLCanvasElement
{
    const canvas = AddElem("canvas", 'Your browser does not support canvas.')

    if (contextName != null || contextName != undefined)
    {
        if (window[contextName] != undefined || window[contextName] === null)
        {
            console.error(ContextNameError.message)
            ThrowScriptError(ContextNameError)
            return;
        }
        window[contextName] = null
        if (mode != null || mode != undefined)
        {
            window[contextName] = canvas.getContext(mode)
        }
        else
        {
            window[contextName] = canvas.getContext('2d')
        }
    }

    if (style != null || style != undefined)
    {
        SetStyle(canvas, style)
    }

    return canvas
}

//Adds an image to a canvas and renders it on load
function AddCanvasImage(contextName : string, imgName : string, x? : number, y? : number) : HTMLImageElement
{
    var img = new Image()
    img.src = 'upload/resources/' + imgName

    img.onload = () => 
    {
        window[contextName].drawImage(img, (x == null) ? 0 : x, (y == null) ? 0 : y)
    }

    return img
}

//Adds an image to the page
function AddImage(imgName : string, marginLeft? : string, marginTop? : string) : HTMLImageElement
{
    var el = AddElem('img', '')
    el.src = 'upload/resources/' + imgName
    SetStyle(el, 'margin-left: ' + ((marginLeft) ? marginLeft : '0px') + '; margin-top: ' + ((marginTop) ? marginTop : '0px'))
    return el
}

//Shorthand
function GetElemById(id : string) : HTMLElement
{
    return document.getElementById(id)
}

//Also shorthand
function GetById(id : string) : HTMLElement
{
    return document.getElementById(id)
} 

//Sets background image given the name of an uploaded image
function SetBackgroundImage(imgName : string)
{

    const sizing = 'cover'
    if (!document.getElementById("THOR-ENGINE-IN-EDITOR"))
    {
        document.body.style.backgroundImage = "url(upload/resources/" + imgName + ")"
        document.body.style.backgroundSize = sizing
        document.body.style.backgroundPosition = 'center'
    }
    else
    {
        const previewWindow = document.getElementById('GamePreviewWindow');
        (previewWindow) ? previewWindow.style.backgroundImage = "url(upload/resources/" + imgName + ")"
                        : document.body.style.backgroundImage = "url(upload/resources/" + imgName + ")";

        (previewWindow) ? previewWindow.style.backgroundSize = sizing
                        : document.body.style.backgroundSize = sizing;

        (previewWindow) ? previewWindow.style.backgroundPosition = 'center'
                        : document.body.style.backgroundPosition = 'center'
    }
}

//Shorthand for SetBackgroundImage()
function SetBGImg(imgName : string)
{
    SetBackgroundImage(imgName)
}

//Writing special functionality to console.log if it's in the editor
if (!(window as any).old_console_log)
{
    (window as any).old_console_log = console.log
}
console.log = (contents) => 
{
    (window as any).old_console_log(contents) //Report as usual

    if (document.getElementById('THOR-ENGINE-IN-EDITOR'))
    {
        //It is in the editor - write the info to the error log too
        PrintToConsole(contents)
    }
}

if (AppendChildToCorrectElement === undefined)
{
    var AppendChildToCorrectElement = (element : any) => 
    {
        if (!document.getElementById("GamePreviewWindow"))
        {
            document.body.appendChild(element)
        }
        else
        {
            document.getElementById("GamePreviewWindow").appendChild(element)
        }
    }
}

//Sets style of given element to a certain style
if (SetStyle === undefined)
{
    var SetStyle = (element : any, style : string) =>
    {
        element.style = style
    }
}