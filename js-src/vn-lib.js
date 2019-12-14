//The library for visual novels which will be included in builds 
//which use any visual novel properties in them.  
console.log("VN lib has been added to the scene.");
console.log(finishedVNLib);
if (finishedVNLib === false || finishedVNLib === undefined) {
    let Global = window || global;
    class VNCharacterImages {
        constructor() {
            /**
             * The images for a VN character with a map
             */
            this.characterImages = {}; //name to correspond to image name
            this.nicknames = [];
        }
        GetImage(nickname) {
            return this.characterImages[nickname];
        }
        Get(nickname) {
            return this.GetImage(nickname);
        }
        AddImage(nickname, imageName) {
            this.characterImages[nickname] = imageName;
            this.nicknames.push(nickname);
            return this;
        }
        Add(nickname, imageName) {
            return this.AddImage(nickname, imageName);
        }
    }
    Global.VNCharacterImages = VNCharacterImages;
    class VNCharacter {
        constructor(name, theme, images) {
            this.name = name;
            this.theme = theme;
            this.characterImages = images;
        }
        AddImage(nickname, imageName) {
            this.characterImages.AddImage(nickname, imageName);
            return this;
        }
        Add(nickname, imageName) {
            return this.AddImage(nickname, imageName);
        }
    }
    Global.VNCharacter = VNCharacter;
    class VNTheme {
        constructor(charTextColor, dialogueTextColor, textBGColor) {
            this.charTextColor = charTextColor;
            this.dialogueTextColor = dialogueTextColor;
            this.textBGColor = textBGColor;
        }
        //Makes the theme apply when called
        ApplyTheme() {
            let VNChars = document.getElementsByClassName('VNChar');
            for (let i = 0; i < VNChars.length; i++) {
                VNChars[i].style.color = this.charTextColor;
            }
            let VNTexts = document.getElementsByClassName('VNText');
            for (let i = 0; i < VNTexts.length; i++) {
                VNTexts[i].style.color = this.dialogueTextColor;
            }
            let VNTextboxes = document.getElementsByClassName('VNTextbox');
            for (let i = 0; i < VNTextboxes.length; i++) {
                VNTextboxes[i].style.backgroundColor = this.textBGColor;
            }
            return this;
        }
        Apply() {
            return this.ApplyTheme();
        }
    }
    Global.VNTheme = VNTheme;
    //A visual novel template which is based in a webpage, not a canvas.
    class PageVN {
        constructor(arcs, startingTheme) {
            if (!arcs.length) {
                console.error("The 'arc' argument of the PageVN type is not an array.");
                ThrowScriptError(new Error("The 'arc' argument of the PageVN type is not an array."));
            }
            let defaultTheme = new VNTheme('white', '#874BE8', 'rgba(132, 0, 255, 0.15)');
            this.arcs = arcs;
            this.playspace = AddElem('div', '');
            this.playspace.style.width = '100%';
            this.playspace.style.height = '100%';
            this.playspace.style.overflow = 'hidden';
            this.imagebox = AddElem('div', '');
            this.imagebox.style.width = '100%';
            this.imagebox.style.height = '100%';
            this.imagebox.style.position = 'relative';
            this.playspace.appendChild(this.imagebox);
            this.textbox = AddElem('div', '');
            this.textbox.className = 'VNTextbox';
            this.textbox.style.width = '99%';
            this.textbox.style.height = '25%';
            this.playspace.appendChild(this.textbox); //The textbox should be a child of 
            //the playspace 
            this.textbox.style.position = 'absolute';
            this.textbox.style.bottom = '0';
            this.textbox.style.backgroundColor = defaultTheme.textBGColor;
            this.characterHeading = AddElem('h2', 'CHARACTER NAME');
            this.characterHeading.className = 'VNChar'; //Access the character name anytime
            this.textbox.appendChild(this.characterHeading);
            this.characterHeading.style.marginLeft = '4%';
            this.characterHeading.style.marginBottom = '0%';
            this.characterHeading.style.fontFamily = 'Verdana, sans-serif';
            this.characterHeading.style.fontWeight = 'bold';
            this.characterHeading.style.color = defaultTheme.charTextColor;
            this.characterHeading.style.userSelect = 'none';
            this.characterHeading.style.msUserSelect = 'none';
            this.characterHeading.style.msTouchSelect = 'none';
            this.characterHeading.style.webkitUserSelect = 'none';
            //Normally charImg would be here, but since they were already made by
            //nodes, we'll just gather them and sync them with charImg
            this.charImg = [];
            this.charImg[0] = AddElem('img', '');
            this.charImg[0].className = 'VNCharImgs'; //Access it again
            this.charImg[0].style.display = 'none'; //Make it invisible for now until source is set
            this.charImg[0].style.height = '85%';
            this.charImg[0].style.position = 'absolute';
            this.charImg[0].style.bottom = '0px';
            this.charImg[0].style.left = '0%';
            this.charImg[0].style.right = '0%';
            this.charImg[0].style.margin = 'auto';
            this.charImg[0].style.userSelect = 'none';
            this.charImg[0].style.msUserSelect = 'none';
            this.charImg[0].style.webkitUserSelect = 'none';
            this.imagebox.appendChild(this.charImg[0]);
            //this.charImg = document.getElementsByClassName('VNCharImgs')
            this.text = AddElem('p', 'TEXT WILL APPEAR HERE');
            this.text.className = 'VNText'; //You can access the text at anytime with this 
            //class (class in case more than one is on 
            //the screen at once)
            this.textbox.appendChild(this.text);
            this.text.style.marginLeft = '6%';
            this.text.style.marginTop = '0.5%';
            this.text.style.fontFamily = 'Verdana, sans-serif';
            this.text.style.fontSize = '1.2em';
            this.text.style.display = 'inline';
            this.text.style.color = defaultTheme.dialogueTextColor;
            this.text.style.userSelect = 'none';
            this.text.style.msUserSelect = 'none';
            this.text.style.msTouchSelect = 'none';
            this.text.style.webkitUserSelect = 'none';
            for (let i = 0; i < arcs.length; i++) {
                this.arcs[i].page = this;
            }
            if (this.arcs[0]) {
                this.currentArc = arcs[0];
                this.currentArc.page = this;
                if (arcs[0].dialogueNodes[0].speaker.name) {
                    //It's a character 
                    if (arcs[0].dialogueNodes[0].speaker.theme) {
                        arcs[0].dialogueNodes[0].speaker.theme.ApplyTheme();
                    }
                }
                const char = document.getElementsByClassName('VNChar');
                for (let i = 0; i < char.length; i++) {
                    if (this.currentArc.dialogueNodes[this.currentArc.currentNode].speaker.name) {
                        //If it's a character type
                        char[i].innerHTML = this.currentArc.dialogueNodes[this.currentArc.currentNode].speaker.name;
                    }
                    else {
                        //If it's just a string
                        char[i].innerHTML = this.currentArc.dialogueNodes[this.currentArc.currentNode].speaker;
                    }
                }
                this.currentArc.Advance();
            }
            this.CheckForInput();
        }
        CheckForInput() {
            let advanceChoice = () => {
                this.currentArc.Advance();
                if (this.currentArc.currentNode == this.currentArc.dialogueNodes.length + 1) {
                    this.currentArc.choiceNode.CreateButtons();
                }
            };
            //If it's not in-editor, then add it to the body
            if (!document.getElementById('THOR-ENGINE-IN-EDITOR')) {
                document.body.addEventListener('click', (mouseEvent) => {
                    if (mouseEvent.target.className != 'ChoiceButton') {
                        advanceChoice();
                    }
                });
                document.body.addEventListener('keydown', (event) => {
                    if (event.keyCode === 32) {
                        //space 
                        if (event.target.className != 'ChoiceButton') {
                            advanceChoice();
                        }
                    }
                });
            }
            else {
                //Otherwise, make sure it's clicking in the preview window so that editing 
                //does not make playtesting a pain
                let advanceOnClick = (e) => {
                    let div = document.getElementById('GamePreviewWindow');
                    if (div.contains(e.target)) {
                        if (e.target.className != 'ChoiceButton') {
                            advanceChoice();
                        }
                    }
                };
                let advanceOnSpace = (e) => {
                    if (e.keyCode === 32) {
                        //space 
                        if (e.target.className != 'ChoiceButton') {
                            advanceChoice();
                        }
                    }
                };
                document.body.addEventListener('click', advanceOnClick);
                document.body.addEventListener('keydown', advanceOnSpace);
            }
        }
    }
    Global.PageVN = PageVN;
    class VNArc {
        constructor() {
            /**
             * An arc of the visual novel template
             *
             *   previous choice -> arc dialogue -> next choice option 1 -> another arc 1
             *                                      next choice option 2 -> another arc 2
             *                                      next choice option 3 -> another arc 3
             *
             */
            this.dialogueNodes = [];
            this.currentNode = 0;
            this.thisArc = this;
        }
        //Advances the dialogue to the next node and starts printing it to the 
        //screen with scrolling. Returns the arc to allow for chaining
        Advance() {
            if (this.dialogueNodes.length > 0 && this.dialogueNodes.length > this.currentNode) {
                if (this.dialogueNodes[this.currentNode - 1]) {
                    if (this.dialogueNodes[this.currentNode - 1].dialogueInterval) {
                        clearInterval(this.dialogueNodes[this.currentNode - 1].dialogueInterval);
                    }
                }
                this.dialogueNodes[this.currentNode].ScrollText();
                for (let i = 0; i < document.getElementsByClassName('VNChar').length; i++) {
                    if (this.dialogueNodes[this.currentNode].speaker.name) {
                        //If it's a character
                        document.getElementsByClassName('VNChar')[i].innerHTML =
                            this.dialogueNodes[this.currentNode].speaker.name;
                        if (this.dialogueNodes[this.currentNode].speaker.theme) {
                            this.dialogueNodes[this.currentNode].speaker.theme.ApplyTheme();
                        }
                    }
                    else {
                        //If it's a string
                        document.getElementsByClassName('VNChar')[i].innerHTML =
                            this.dialogueNodes[this.currentNode].speaker;
                    }
                }
                if (!document.getElementById("THOR-ENGINE-IN-EDITOR")) {
                    document.body.style.backgroundColor = 'black';
                    document.body.style.backgroundImage = "url(upload/resources/" + this.dialogueNodes[this.currentNode].bgImg + ")";
                    document.body.style.backgroundSize = "100% 100%";
                }
                else {
                    let previewWindow = document.getElementById('GamePreviewWindow');
                    (previewWindow) ? previewWindow.style.backgroundColor = 'black'
                        : document.body.style.backgroundColor = 'black';
                    (previewWindow) ? previewWindow.style.backgroundImage = "url(upload/resources/" + this.dialogueNodes[this.currentNode].bgImg + ")"
                        : document.body.style.backgroundImage = "url(upload/resources/" + this.dialogueNodes[this.currentNode].bgImg + ")";
                    (previewWindow) ? previewWindow.style.backgroundSize = "100% 100%"
                        : document.body.style.backgroundSize = "100% 100%";
                }
                this.currentNode++;
                return this;
            }
            else {
                this.currentNode++;
                return this;
            }
        }
        //Sets character image of last node
        SetCharImage(charImg) {
            if (this.dialogueNodes.length == 0) {
                ThrowScriptError(new Error('No nodes to set a character image on.'));
                return this;
            }
            if (!charImg) {
                console.error('No character image specified.');
            }
            this.dialogueNodes[this.dialogueNodes.length - 1].charImg = charImg;
            return this;
        }
        SetImg(charImg) {
            return this.SetCharImage(charImg);
        }
        //Adds a new dialogue node to the arc. Returns the arc to allow for chaining.
        AddNewNode(dialogue, speaker, charImg, bgImg) {
            if (speaker) {
                if (speaker.theme != null && speaker.theme != undefined) //If this isn't null, apply it
                 {
                    speaker.theme.ApplyTheme();
                }
            }
            let node = new VNNode(this, dialogue, speaker, charImg, bgImg);
            this.dialogueNodes.push(node);
            if (this.dialogueNodes.length == 1) {
                document.addEventListener('DOMContentLoaded', () => {
                    let VNC = document.getElementsByClassName('VNChar');
                    for (let i = 0; i < VNC.length; i++) {
                        if (this.dialogueNodes[0].speaker.name) //If it's a VNCharacter
                         {
                            VNC[i].innerHTML = this.dialogueNodes[0].speaker.name;
                        }
                        else //It's a string
                         {
                            VNC[i].innerHTML = this.dialogueNodes[0].speaker;
                        }
                    }
                    return this;
                });
            }
            return this;
        }
        AddNewChoice(buttonDialogues, buttonArcChoices, charImg, bgImg) {
            for (let i = 0; i < buttonArcChoices.length; i++) {
                buttonArcChoices[i].page = this.page;
            }
            const choice = new VNChoice(this, buttonDialogues, buttonArcChoices, charImg, bgImg);
            this.choiceNode = choice;
        }
        AddChoice(node) {
            this.choiceNode = node;
            this.choiceNode.arc = this;
        }
        //Returns the arc to allow for chaining. Adds an existing VNNode to 
        //the arc
        AddNode(node) {
            node.arc = this.thisArc;
            node.indexInArc = this.dialogueNodes.length;
            node.SetNode(node.dialogue, node.speaker, node.charImg, node.bgImg);
            this.dialogueNodes.push(node);
            return this;
        }
    }
    Global.VNArc = VNArc;
    class VNChoice {
        constructor(arc, //Must have an arc bound to it 
        buttonDialogues, buttonArcChoices, charImg, bgImg) {
            this.buttonDialogues = buttonDialogues;
            this.buttonArcChoices = buttonArcChoices;
            this.charImg = charImg;
            this.bgImg = bgImg;
            this.arc = arc;
        }
        CreateButtons() {
            var textWindows = document.getElementsByClassName('VNText');
            clearInterval(this.arc.dialogueNodes[this.arc.currentNode - 2].dialogueInterval);
            let chars = document.getElementsByClassName('VNChar');
            for (let i = 0; i < chars.length; i++) {
                chars[i].innerHTML = ' ';
            }
            for (let j = 0; j < textWindows.length; j++) {
                textWindows[j].innerHTML = ''; //Clear the text on the text windows
                for (let i = 0; i < this.buttonDialogues.length; i++) {
                    let but = document.createElement('button');
                    but.innerHTML = this.buttonDialogues[i];
                    but.style.display = 'block';
                    but.style.marginTop = '1%';
                    but.style.marginLeft = '1%';
                    but.style.backgroundColor = 'rgba(150,0,150,0)';
                    but.addEventListener('mouseenter', () => {
                        //Change to desired color
                        but.style.backgroundColor = 'rgba(150,0,150,1)';
                    });
                    but.addEventListener('mouseleave', () => {
                        //Change to color when mouse is left
                        but.style.backgroundColor = 'rgba(1,0,0,0)';
                    });
                    but.style.borderRadius = '10%';
                    but.style.border = 'none';
                    but.className = 'ChoiceButton';
                    but.onclick = () => {
                        //Activate another arc which this button corresponds to
                        this.arc.page.currentArc = this.buttonArcChoices[i];
                        this.arc.currentNode = 1;
                        this.arc.page.currentArc.currentNode = 1;
                        this.arc.page.currentArc.dialogueNodes[0].ScrollText();
                        let char = document.getElementsByClassName('VNChar');
                        for (let i = 0; i < char.length; i++) {
                            let speaker = this.arc.page.currentArc.dialogueNodes[0].speaker;
                            char[i].innerHTML =
                                (speaker.name) ?
                                    speaker.name :
                                    speaker;
                            if (speaker.theme) {
                                //It has a theme
                                speaker.theme.ApplyTheme();
                            }
                        }
                    };
                    textWindows[j].appendChild(but);
                }
            }
            return this;
        }
    }
    Global.VNChoice = VNChoice;
    class VNNode {
        //text scroll
        constructor(arc, dialogue, speaker, charImg, bgImg) {
            this.charImg = []; //The characters on screen at once
            this.thisNode = this;
            this.SetArc(arc);
            this.SetNode(dialogue, speaker, charImg, bgImg);
        }
        //Sets the arc of this node. Returns this node to allow for chaining.
        SetArc(arc) {
            this.arc = arc;
            this.indexInArc = arc.dialogueNodes.length;
            return this.thisNode;
        }
        //Sets the node's properties. Returns the node to allow for chaining.
        SetNode(dialogue, //The text inside the text box
        speaker, //The name of the person talking
        charImg, //The image(s) paths displayed front and center
        bgImg) {
            this.dialogue = (dialogue) ? dialogue : this.arc.dialogueNodes[this.indexInArc - 1].dialogue;
            this.speaker = (speaker) ? speaker : this.arc.dialogueNodes[this.indexInArc - 1].speaker;
            if (charImg) {
                if (charImg.length) {
                    //It's an array
                    this.charImg = charImg;
                }
                else {
                    this.charImg.push(charImg); //It's not an array, make it an array
                }
            }
            this.bgImg = (bgImg) ? bgImg : this.arc.dialogueNodes[this.indexInArc - 1].bgImg;
            return this.thisNode;
        }
        ScrollText() {
            var displayedText = '';
            var letter = 0; //0 to length of string
            var textWindows = document.getElementsByClassName('VNText');
            let htmlImgs = document.getElementsByClassName('VNCharImgs');
            for (let i = 0; i < htmlImgs.length; i++) {
                for (let j = 0; j < this.charImg.length; j++) {
                    htmlImgs[i].src = 'upload/resources/' + this.charImg;
                    htmlImgs[i].style.display = 'block';
                    htmlImgs[i].style.userSelect = 'none';
                    htmlImgs[i].style.msUserSelect = 'none';
                    htmlImgs[i].style.webkitUserSelect = 'none';
                }
            }
            this.dialogueInterval = setInterval((handler) => {
                if (letter < this.dialogue.length) {
                    displayedText += this.dialogue[letter++];
                    for (let i = 0; i < textWindows.length; i++) {
                        textWindows[i].innerHTML = displayedText;
                    }
                }
                else {
                    clearInterval(this.dialogueInterval);
                }
            }, 50);
            return this;
        }
    }
    Global.VNNode = VNNode;
}
var finishedVNLib = true;
//# sourceMappingURL=vn-lib.js.map