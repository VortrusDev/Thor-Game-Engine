//The library for visual novels which will be included in builds 
//which use any visual novel properties in them.  

console.log("VN lib has been added to the scene.")
console.log(finishedVNLib);

if (finishedVNLib === false || finishedVNLib === undefined)
{
    const Global = window || global
    
    class VNCharacterImages
    {
        /**
         * The images for a VN character with a map
         */

        characterImages: { [name : string]: string } = {} //name to correspond to image name
        nicknames : string[] = []
        constructor() {

        }

        GetImage(nickname : string) : string
        {
            return this.characterImages[nickname]
        }

        Get(nickname : string) //Short for GetImage()
        {
            return this.GetImage(nickname)
        }

        AddImage(nickname : string, imageName : string) : VNCharacterImages
        {
            this.characterImages[nickname] = imageName
            this.nicknames.push(nickname)
            return this
        }

        Add(nickname : string, imageName : string) : VNCharacterImages //Short for AddImage()
        {
            return this.AddImage(nickname, imageName)
        }
    }
    (Global as any).VNCharacterImages = VNCharacterImages

    class VNCharacter 
    {
        /**
         * Information about a particular character in a VN
         */

        theme : VNTheme
        name : string
        characterImages : VNCharacterImages
        constructor(name : string, theme? : VNTheme, images? : VNCharacterImages) {
            this.name = name
            this.theme = theme
            this.characterImages = images
        }

        AddImage(nickname : string, imageName : string) : VNCharacter
        {
            this.characterImages.AddImage(nickname, imageName)

            return this
        }

        Add(nickname : string, imageName : string) //Short for AddImage()
        {
            return this.AddImage(nickname, imageName)
        }
    }
    (Global as any).VNCharacter = VNCharacter

    class VNTheme
    {
        /**
         * A general theme for a VN which can be set on the fly
         * within each node or within a character
         */
        charTextColor : string //The styling for the character text.
        dialogueTextColor : string //The styling for the dialogue text
        textBGColor : string
        constructor(charTextColor : string, dialogueTextColor : string, textBGColor : string) {
            this.charTextColor = charTextColor
            this.dialogueTextColor = dialogueTextColor
            this.textBGColor = textBGColor
        }
 
        //Makes the theme apply when called
        ApplyTheme() : VNTheme
        {
            const VNChars = document.getElementsByClassName('VNChar') as HTMLCollectionOf<HTMLElement>
            for (let i = 0; i < VNChars.length; i++)
            {
                VNChars[i].style.color = this.charTextColor
            }

            const VNTexts = document.getElementsByClassName('VNText') as HTMLCollectionOf<HTMLElement>
            for (let i = 0; i < VNTexts.length; i++)
            {
                VNTexts[i].style.color = this.dialogueTextColor
            }

            const VNTextboxes = document.getElementsByClassName('VNTextbox') as HTMLCollectionOf<HTMLElement>
            for (let i = 0; i < VNTextboxes.length; i++)
            {
                VNTextboxes[i].style.backgroundColor = this.textBGColor
            }

            return this
        }

        Apply() : VNTheme //Short for ApplyTheme()
        {
            return this.ApplyTheme()
        }
    }
    (Global as any).VNTheme = VNTheme

    //A visual novel template which is based in a webpage, not a canvas.
    class PageVN
    {
        /**
         *  The template for creating visual novels in a webpage itself 
         * (with UI handled by actual webpage elements)
         */

        playspace : HTMLElement
        textbox : HTMLElement
        text : HTMLParagraphElement
        characterHeading : HTMLHeadingElement
        arcs : VNArc[]
        currentArc : VNArc
        imagebox : HTMLElement
        charImg : HTMLElement[] //The actual images of the characters
        constructor(arcs : VNArc[], startingTheme? : VNTheme) 
        {
            if (!document.getElementById('THOR-ENGINE-IN-EDITOR'))
            {
                this.BuildSplashScreen(arcs, startingTheme)
            }
            else
            {
                this.StartVNArcs(arcs, startingTheme)
            }
        }

        BuildSplashScreen(arcs : VNArc[], startingTheme? : VNTheme)
        {
            $(document).ready(() => 
            {
                const splashHead = document.createElement('h1')
                splashHead.innerHTML = 'Created with the Thor Game Engine'
                splashHead.id = 'SplashHead'
                document.body.appendChild(splashHead)
                splashHead.style.display = 'none'
                splashHead.style.textAlign = 'center'
    
                const splashButton = document.createElement('button')
                splashButton.innerHTML = 'Click here to start'
                splashButton.className = 'SplashButton'
                splashButton.style.margin = '0 auto'
                splashButton.style.display = 'block'
                splashButton.onclick = () => 
                {
                    $('#SplashHead, #SplashButton').fadeOut(1000, () =>
                    {
                        if (splashButton.parentNode == document.body)
                        {
                            document.body.removeChild(splashButton)
                        }
                        if (splashHead.parentNode == document.body)
                        {
                            document.body.removeChild(splashHead)
                        }
                    })

                    setTimeout(() => 
                    {
                        this.StartVNArcs(arcs, startingTheme)
                    }, 1000)

                }
                splashButton.id = 'SplashButton'
                document.body.appendChild(splashButton)
                
                $('#SplashHead, #SplashButton').fadeIn(1000)

            })
        }

        StartVNArcs(arcs : VNArc[], startingTheme? : VNTheme) //Starts the game arcs
        {
            if (document.getElementById('THOR-ENGINE-IN-EDITOR'))
            {
                debug.gameData["arcs"] = arcs
            }


            if (!arcs.length)
            {
                
                console.error("The 'arc' argument of the PageVN type is not an array.");
                ThrowScriptError(new Error("The 'arc' argument of the PageVN type is not an array."))
                
            }

            const defaultTheme = new VNTheme('white', '#874BE8', 'rgba(132, 0, 255, 0.35)')

            this.arcs = arcs

            this.playspace = AddElem('div', '')
            this.playspace.style.width = '100%'
            this.playspace.style.height = '100%'
            this.playspace.style.overflow = 'hidden'

            this.imagebox = AddElem('div', '')
            this.imagebox.style.width = '100%'
            this.imagebox.style.height = '100%'
            this.imagebox.style.position = 'relative'
            this.playspace.appendChild(this.imagebox)

            this.textbox = AddElem('div', '')
            this.textbox.className = 'VNTextbox'
            this.textbox.style.width = '99%'
            this.textbox.style.height = '25%'
            this.playspace.appendChild(this.textbox) //The textbox should be a child of 
                                                     //the playspace 
            this.textbox.style.position = 'absolute'
            this.textbox.style.bottom = '0'
            this.textbox.style.backgroundColor = defaultTheme.textBGColor

            this.characterHeading = AddElem('h2', 'CHARACTER NAME')
            this.characterHeading.className = 'VNChar' //Access the character name anytime
            this.textbox.appendChild(this.characterHeading)  
            this.characterHeading.style.marginLeft = '4%'
            this.characterHeading.style.marginBottom = '0%'
            this.characterHeading.style.fontFamily = 'Verdana, sans-serif'
            this.characterHeading.style.fontWeight = 'bold'
            this.characterHeading.style.color = defaultTheme.charTextColor
            this.characterHeading.style.userSelect = 'none'
            this.characterHeading.style.msUserSelect = 'none'
            this.characterHeading.style.msTouchSelect = 'none'
            this.characterHeading.style.webkitUserSelect = 'none'

            //Normally charImg would be here, but since they were already made by
            //nodes, we'll just gather them and sync them with charImg
            this.charImg = []
            this.charImg[0] = AddElem('img', '')
            this.charImg[0].className = 'VNCharImgs' //Access it again
            this.charImg[0].style.display = 'none' //Make it invisible for now until source is set
            this.charImg[0].style.height = '85%'
            this.charImg[0].style.position = 'absolute'
            this.charImg[0].style.bottom = '0px'
            this.charImg[0].style.left = '0%'
            this.charImg[0].style.right = '0%'
            this.charImg[0].style.margin = 'auto'
            this.charImg[0].style.userSelect = 'none'
            this.charImg[0].style.msUserSelect = 'none'
            this.charImg[0].style.webkitUserSelect = 'none'
            
            this.imagebox.appendChild(this.charImg[0])
            

            //this.charImg = document.getElementsByClassName('VNCharImgs')

            this.text = AddElem('p', 'TEXT WILL APPEAR HERE')
            this.text.className = 'VNText' //You can access the text at anytime with this 
                                           //class (class in case more than one is on 
                                           //the screen at once)
            this.textbox.appendChild(this.text)
            this.text.style.marginLeft = '6%'
            this.text.style.marginTop = '0.5%'
            this.text.style.fontFamily = 'Verdana, sans-serif'
            this.text.style.fontSize = '1.2em'
            this.text.style.display = 'inline'
            this.text.style.color = defaultTheme.dialogueTextColor
            this.text.style.userSelect = 'none'
            this.text.style.msUserSelect = 'none'
            this.text.style.msTouchSelect = 'none'
            this.text.style.webkitUserSelect = 'none'
            

            for (let i = 0; i < arcs.length; i++)
            {
                this.arcs[i].page = this
            }

            if (this.arcs[0])
            {
                this.currentArc = arcs[0]
                this.currentArc.page = this

                if ((arcs[0].dialogueNodes[0].speaker as any).name)
                {
                    //It's a character 
                    if ((arcs[0].dialogueNodes[0].speaker as any).theme)
                    {
                        (arcs[0].dialogueNodes[0].speaker as any).theme.ApplyTheme()
                    }
                }

                const char = document.getElementsByClassName('VNChar')
                for (let i = 0; i < char.length; i++)
                {
                    if ((this.currentArc.dialogueNodes[this.currentArc.currentNode].speaker as any).name)
                    {
                        //If it's a character type
                        char[i].innerHTML = (this.currentArc.dialogueNodes[this.currentArc.currentNode].speaker as any).name

                    }
                    else
                    {
                        //If it's just a string
                        char[i].innerHTML = (this.currentArc.dialogueNodes[this.currentArc.currentNode].speaker as any)
                    }
                }

                this.currentArc.Advance()
            }

            this.CheckForInput()

        }

        CheckForInput()
        {

            const advanceChoice = () =>
            {
                this.currentArc.Advance()
 
                if (this.currentArc.currentNode == this.currentArc.dialogueNodes.length + 1)
                {
                    if (this.currentArc.choiceNode)
                    {
                        this.currentArc.choiceNode.CreateButtons()
                    }
                }
            }

            //If it's not in-editor, then add it to the body
            if (!document.getElementById('THOR-ENGINE-IN-EDITOR'))
            {
                document.body.addEventListener('click', (mouseEvent)=>
                {
                    if ((mouseEvent.target as HTMLButtonElement).className != 'ChoiceButton'
                      && (mouseEvent.target as HTMLButtonElement).className != 'SplashButton')
                    {
                        advanceChoice()
                        return
                    }
                })

                document.body.addEventListener('keydown', (event) => 
                {
                    if (event.keyCode === 32)
                    {
                        //space 
                        if ((event.target as HTMLButtonElement).className != 'ChoiceButton'
                        && (event.target as HTMLButtonElement).className != 'SplashButton')
                        {
                            advanceChoice()
                            return
                        }                    
                    }
                })
            }
            else
            {
                //Otherwise, make sure it's clicking in the preview window so that editing 
                //does not make playtesting a pain

                const advanceOnClick = (e) => 
                {
                    const div = document.getElementById('GamePreviewWindow')
                    if (div.contains(e.target))
                    {
                        if ((e.target as HTMLButtonElement).className != 'ChoiceButton')
                        {
                            advanceChoice()
                            return
                        }                    
                    }
                }

                const advanceOnSpace = (e) =>
                {
                    if (e.keyCode === 32)
                    {
                        //space 
                        if ((e.target as HTMLButtonElement).className != 'ChoiceButton' 
                        && (e.target as HTMLButtonElement).className != 'SplashButton')
                        {
                            advanceChoice()
                            return
                        }                    
                    }
                }

                document.body.addEventListener('click', advanceOnClick)

                document.body.addEventListener('keydown', advanceOnSpace)
            }
        }
    }
    (Global as any).PageVN = PageVN

    class VNSound
    {
        /**
         * A sound to be played in the Visual Novel template
         */

        audioElement : HTMLAudioElement
        src : string


        constructor(src : string) 
        {
            this.src = src
            this.audioElement = document.createElement('audio')
            this.audioElement.src = src
            this.audioElement.setAttribute('preload', 'auto')
            this.audioElement.setAttribute('controls', 'none')
            this.audioElement.style.display = 'none'
        }

        Play()
        {
            this.audioElement.play()
            if (document.getElementById('THOR-ENGINE-IN-EDITOR'))
            {
                Sounds.push(this.audioElement)
            }
        }

        Pause()
        {
            this.audioElement.pause()
        }
    }
    (Global as any).VNSound = VNSound

    class VNArc
    {
        /**
         * An arc of the visual novel template
         * 
         *   previous choice -> arc dialogue -> next choice option 1 -> another arc 1
         *                                      next choice option 2 -> another arc 2
         *                                      next choice option 3 -> another arc 3
         * 
         */

        dialogueNodes : VNNode[] = []
        choiceNode : VNChoice //For now, const's leave it at one choice at the end of the arc
        choiceButton : HTMLButtonElement
        choiceButtonColorEnter : string = "rgba(150, 0, 150, 1)"//[150, 0, 150, 1]
        choiceButtonColorExit : string = "rgba(100, 0, 100, 0.5)"//[100, 0, 100, 0.5]
        choiceButtonTextColor : string = "white"
        choiceButtonFontSize : any = "medium" 
        choiceButtonMargin : string = "0 0 0 0"
        choiceButtonPadding : string = "0% 0% 0% 0%"
        choiceButtonDisplay : string = "block"
        choiceButtonFontFamily : string = "Arial"
        choiceButtonBorder = "none"
        choiceButtonBorderRadius = "10%"
        currentNode : number = 0
        thisArc : any
        page : PageVN
        constructor() {
            this.thisArc = this
        }

        //Advances the dialogue to the next node and starts printing it to the 
        //screen with scrolling. Returns the arc to allow for chaining
        Advance() : VNArc
        {        
            if (this.dialogueNodes.length > 0 && this.dialogueNodes.length > this.currentNode)
            {
                if (this.dialogueNodes[this.currentNode - 1])
                {
                    if (this.dialogueNodes[this.currentNode - 1].dialogueInterval)
                    {
                        //Clear text scrolling
                        clearInterval(this.dialogueNodes[this.currentNode - 1].dialogueInterval)
                    }
                }
                    
                //Scroll the new text
                this.dialogueNodes[this.currentNode].ScrollText()

                for (let i = 0; i < document.getElementsByClassName('VNChar').length; i++)
                {
                    if ((this.dialogueNodes[this.currentNode].speaker as any).name)
                    {
                        //If it's a character
                        document.getElementsByClassName('VNChar')[i].innerHTML =
                        (this.dialogueNodes[this.currentNode].speaker as any).name

                        if ((this.dialogueNodes[this.currentNode].speaker as any).theme)
                        {
                            (this.dialogueNodes[this.currentNode].speaker as any).theme.ApplyTheme()
                        }
                    }
                    else
                    {
                        //If it's a string
                        document.getElementsByClassName('VNChar')[i].innerHTML =
                        (this.dialogueNodes[this.currentNode].speaker as any)
                    }
                }

                if (!document.getElementById("THOR-ENGINE-IN-EDITOR"))
                {
                    document.body.style.backgroundColor = 'black'
                    document.body.style.backgroundImage = "url(upload/resources/" + this.dialogueNodes[this.currentNode].bgImg + ")"
                    document.body.style.zIndex = '-1'
                    document.body.style.backgroundSize = "100% auto"
                } 
                else
                {

                    //If the background images are the same, skip the transition. 
                    //Otherwise, do the transition.
                    if (this.dialogueNodes[this.currentNode - 1])
                    {
                        if (this.dialogueNodes[this.currentNode].bgImg != this.dialogueNodes[this.currentNode - 1].bgImg)
                        {

                        }
                        else
                        {
                            
                        }
                    }

                    const previewWindow = document.getElementById('GamePreviewWindow');

                    (previewWindow) ? previewWindow.style.backgroundColor = 'black'
                                    : document.body.style.backgroundColor = 'black';
                    (previewWindow) ? previewWindow.style.backgroundImage = "url(upload/resources/" + this.dialogueNodes[this.currentNode].bgImg + ")"
                                    : document.body.style.backgroundImage = "url(upload/resources/" + this.dialogueNodes[this.currentNode].bgImg + ")";

                    (previewWindow) ? previewWindow.style.backgroundSize = "auto 100%"
                                    : document.body.style.backgroundSize = "auto 100%";
                }

                const texts = document.getElementsByClassName("VNText")
                if (this.dialogueNodes[this.currentNode].isTextItalic)
                {
                    for (var i = 0; i < texts.length; i++)
                    {
                        if ((texts[i] as any) != undefined)
                        {
                            (texts[i] as any).style.fontStyle = "italic"
                        }
                    }
                }
                else
                {
                    for (var i = 0; i < texts.length; i++)
                    {
                        if ((texts[i] as any).style.fontStyle != "normal")
                        {
                            (texts[i] as any).style.fontStyle = "normal"
                        }
                    }
                }

                this.currentNode ++

                return this
            }
            else 
            {
                this.currentNode++
                return this
            }
        }

        //Sets character image of last node
        SetCharImage(charImg : string[])
        {
            if (this.dialogueNodes.length == 0)
            {
                ThrowScriptError(new Error('No nodes to set a character image on.'))
                return this
            }

            if (!charImg)
            {
                console.error('No character image specified.')
            }

            this.dialogueNodes[this.dialogueNodes.length - 1].charImg = charImg

            return this
        }

        SetItalicText() : VNArc //Makes the last node have italic text
        {
            if (this.dialogueNodes.length == 0)
            {
                ThrowScriptError(new Error('No nodes to set the text of.'))
                return this
            }
            if (this.dialogueNodes[this.dialogueNodes.length - 1].isTextItalic === false)
            {
                this.dialogueNodes[this.dialogueNodes.length - 1].isTextItalic = true;
            }
            else
            {
                this.dialogueNodes[this.dialogueNodes.length - 1].isTextItalic = false;
            }
            

            return this
        }

        SetImg(charImg : string[]) //Short for SetCharImage()
        {
            return this.SetCharImage(charImg)
        }

        //Adds a new dialogue node to the arc. Returns the arc to allow for chaining.
        AddNewNode(dialogue : string,
                   speaker? : string | VNCharacter, 
                   charImg? : string[],
                   bgImg? : string) : VNArc
        {
            if (speaker)
            {
                if ((speaker as any).theme != null && (speaker as any).theme != undefined) //If this isn't null, apply it
                {
                    (speaker as any).theme.ApplyTheme()
                }
                else
                {
                    console.error("There is no speaker defined for the node. If you are adding nodes "
                                + "to a new arc, remember to define the speaker, image to use and "
                                + "background again.")
                }
            }
            const node = new VNNode(this, dialogue, speaker, charImg, bgImg)
            this.dialogueNodes.push(node)

            if (this.dialogueNodes.length == 1)
            {
                document.addEventListener('DOMContentLoaded', () =>
                {
                    const VNC = document.getElementsByClassName('VNChar')
                    for (let i = 0; i < VNC.length; i++)
                    {
                        if ((this.dialogueNodes[0].speaker as any).name) //If it's a VNCharacter
                        {
                            VNC[i].innerHTML = (this.dialogueNodes[0].speaker as any).name

                        }
                        else //It's a string
                        {
                            VNC[i].innerHTML = (this.dialogueNodes[0].speaker as any)

                        }
                    }

                    return this
                })
            }
            return this
        }

        AddNewChoice(
            buttonDialogues : string[],
            buttonArcChoices : VNArc[],
            charImg? : string[],
            bgImg? : string)
        {
            for (let i = 0; i < buttonArcChoices.length; i++)
            {
                buttonArcChoices[i].page = this.page
            }

            const choice = new VNChoice(this, buttonDialogues, buttonArcChoices, charImg, bgImg)
            this.choiceNode = choice
        }

        AddChoice(node : VNChoice)
        {
            this.choiceNode = node
            this.choiceNode.arc = this
        }

        //Returns the arc to allow for chaining. Adds an existing VNNode to 
        //the arc
        AddExistingNode(node : VNNode) : VNArc
        {
            node.arc = this.thisArc
            node.indexInArc = this.dialogueNodes.length
            node.SetNode(node.dialogue, node.speaker, node.charImg, node.bgImg)
            this.dialogueNodes.push(node)
            return this
        }
    }
    (Global as any).VNArc = VNArc

    class VNChoice
    {
        /**
         * A choice node for making decisions and linking to a new arc
         */

        buttonDialogues : string[]
        buttonArcChoices : VNArc[]
        charImg : string[]
        bgImg : string
        dialogueInterval
        arc : VNArc
        constructor(arc : VNArc,                    //Must have an arc bound to it 
                    buttonDialogues : string[], 
                    buttonArcChoices : VNArc[], 
                    charImg? : string[],
                    bgImg? : string) 
        {
            this.buttonDialogues = buttonDialogues
            this.buttonArcChoices = buttonArcChoices
            this.charImg = charImg
            this.bgImg = bgImg
            this.arc = arc
        }

        CreateButtons()
        {
            const textWindows = document.getElementsByClassName('VNText')

            clearInterval(this.arc.dialogueNodes[this.arc.currentNode - 2].dialogueInterval)

            const chars = document.getElementsByClassName('VNChar')
            for (let i = 0; i < chars.length; i++)
            {
                chars[i].innerHTML = ' '
            }

            for (let j = 0; j < textWindows.length; j++)
            {
                textWindows[j].innerHTML = '' //Clear the text on the text windows
                for (let i = 0; i < this.buttonDialogues.length; i++)
                {
                    const but = document.createElement('button')
                    but.innerHTML = this.buttonDialogues[i]
                    but.style.display = this.arc.choiceButtonDisplay
                    but.style.margin = this.arc.choiceButtonMargin
                    but.style.padding = this.arc.choiceButtonPadding
                    but.style.backgroundColor = this.arc.choiceButtonColorExit
                    //Button attributes: Color, margin, display, etc

                    but.addEventListener('mouseenter', () => 
                    {
                        //Change to desired color
                        but.style.backgroundColor = this.arc.choiceButtonColorEnter

                    })

                    but.addEventListener('mouseleave', () => 
                    {
                        //Change to color when mouse is left
                        but.style.backgroundColor = this.arc.choiceButtonColorExit
                    })

                    but.style.borderRadius = this.arc.choiceButtonBorderRadius
                    but.style.border = this.arc.choiceButtonBorder
                    but.className = 'ChoiceButton'
                    but.style.fontSize = this.arc.choiceButtonFontSize
                    but.style.fontFamily = this.arc.choiceButtonFontFamily
                    but.style.color = this.arc.choiceButtonTextColor
                    but.onclick = () => {
                        //Activate another arc which this button corresponds to
                        this.arc.page.currentArc = this.buttonArcChoices[i]
                        this.arc.currentNode = 1;
                        this.arc.page.currentArc.currentNode = 1
                        this.arc.page.currentArc.dialogueNodes[0].ScrollText()

                        const char = document.getElementsByClassName('VNChar')
                        for (let i = 0; i < char.length; i++)
                        {
                            const speaker = (this.arc.page.currentArc.dialogueNodes[0] as any).speaker
                            char[i].innerHTML = 
                            (speaker.name) ? 
                            speaker.name : 
                            speaker

                            if (speaker.theme)
                            {
                                //It has a theme
                                speaker.theme.ApplyTheme()
                            }
                        }
                    }
                    this.arc.choiceButton = but
                    textWindows[j].appendChild(but)
                }
            }

            return this
        }
    }
    (Global as any).VNChoice = VNChoice

    class VNNode 
    {
        /**
         * A VN dialogue node with dialogue, character name, a bg image, sounds to play, 
         * music to play, and character images to display.
         * 
         * If it's the same person talking, the character image can be assumed to be the
         * same. 
         */

        dialogue : string
        speaker : string | VNCharacter
        charImg : string[] = []//The characters on screen at once
        bgImg : string
        arc : VNArc //The arc this is in (set upon creation in arc)
        indexInArc : number //The place in the arc (set upon creation in arc)
        thisNode : VNNode
        dialogueInterval //The setInterval for scrolling text - useful for stopping
                        //text scroll
        isTextItalic : boolean = false //Whether this node's text is italic
        constructor(arc : VNArc, 
                    dialogue : string, 
                    speaker? : string | VNCharacter,
                    charImg? : string[],
                    bgImg? : string) 
        {
            this.thisNode = this
            this.SetArc(arc)
            this.SetNode(dialogue, speaker, charImg, bgImg);
        }

        //Sets the arc of this node. Returns this node to allow for chaining.
        SetArc(arc : VNArc) : VNNode
        {
            this.arc = arc
            this.indexInArc = arc.dialogueNodes.length
            return this.thisNode
        }

        //Sets the node's properties. Returns the node to allow for chaining.
        SetNode(
            dialogue : string,    //The text inside the text box
            speaker? : string | VNCharacter, //The name of the person talking
            charImg? : string[],     //The image(s) paths displayed front and center
            bgImg? : string,       //The background image
            ) : VNNode
        {
            this.dialogue = (dialogue) ? dialogue : this.arc.dialogueNodes[this.indexInArc - 1].dialogue
            this.speaker = (speaker) ? speaker : this.arc.dialogueNodes[this.indexInArc-1].speaker
            if (charImg)
            {
                if (charImg.length)
                {
                    //It's an array
                    this.charImg = charImg
                }
                else
                {
                    this.charImg.push(charImg as any) //It's not an array, make it an array
                }
            }
            this.bgImg = (bgImg) ? bgImg : this.arc.dialogueNodes[this.indexInArc - 1].bgImg

            return this.thisNode
        }

        ScrollText() : VNNode //Scrolls the text along the screen in the elements with class "VNText".
                            //Returns this node to allow for chaining.
        {
            var displayedText = ''
            var letter : number = 0 //0 to length of string
            var textWindows = document.getElementsByClassName('VNText')

            const htmlImgs = document.getElementsByClassName('VNCharImgs');


            for (let i = 0; i < htmlImgs.length; i++)
            {
                for (let j = 0; j < this.charImg.length; j++)
                {

                    const nodesrc = 'upload/resources/' + this.charImg;
                    let emptyPath = false;
                    if (nodesrc === "upload/resources/ " || nodesrc === "upload/resources/")
                    {
                        emptyPath = true;
                    }
                    if (!emptyPath)
                    {
                        (htmlImgs[i] as HTMLImageElement).src = 'upload/resources/' + this.charImg;
                    }
                    else
                    {
                        if ((htmlImgs[i] as any).style.display != 'none')
                        {
                            $( "." + htmlImgs[i].className ).fadeOut(250, () => {
                                (htmlImgs[i] as HTMLImageElement).style.display = 'none';
                                return;
                            })
                        }
                    }

                    var fet = new Image()

                    let errored = false;

                    fet.onload = () => 
                    {
                        if (this.arc.dialogueNodes[this.arc.currentNode-2])
                        {
                            if (this.arc.dialogueNodes[this.arc.currentNode - 2].charImg != this.charImg
                                && !emptyPath)
                            {
                                $( "." + htmlImgs[i].className ).fadeIn(250, () => 
                                (htmlImgs[i] as HTMLImageElement).style.display = 'block');
                            }
                            else
                            {
                                (htmlImgs[i] as HTMLImageElement).style.display = 'block';
                            }
                        }
                        else
                        {
                            (htmlImgs[i] as HTMLImageElement).style.display = 'block';
                        }
                    }

                    fet.onerror = () => 
                    {
                        errored = true;
                    }

                    if (!errored)
                    {
                        fet.src = (htmlImgs[i] as HTMLImageElement).src;
                    }
                    
                    (htmlImgs[i] as HTMLImageElement).style.userSelect = 'none';
                    (htmlImgs[i] as HTMLImageElement).style.msUserSelect = 'none';
                    (htmlImgs[i] as HTMLImageElement).style.webkitUserSelect = 'none';

                }
            }

            this.dialogueInterval = setInterval((handler) => 
            {
                if (letter < this.dialogue.length)
                {
                    displayedText += this.dialogue[letter++]
                    for (let i = 0; i < textWindows.length; i++)
                    {
                        textWindows[i].innerHTML = displayedText
                    }
                }
                else
                {
                    clearInterval(this.dialogueInterval)
                }
            }, 50)

            return this
        }
    }
    (Global as any).VNNode = VNNode

}

var finishedVNLib = true