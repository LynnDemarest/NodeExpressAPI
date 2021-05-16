  var currentHiddenImage = null;  // the image object

  var ip;
  var pieces;

  //constructor (_options) {
    //this.options = _options;
    //debugger;

    ip = new ImageProcessor(options);

    pieces = shuffle(ip.pieces);

    var obj = document.getElementById(this.options.gameboardid);

    for (i = 0; i < pieces.length; i++) {
      let img = new Image(options.heightOfOnePiece, options.widthOfOnePiece);
      img.src = pieces[i];
      img.id = i + "_image";
      img.alt = img.id;
      img.title = img.id;
      if (i == pieces.length-1) {
        img.style.visibility = "hidden";
        currentHiddenImage = img;
      } 
      img.onclick = (e) => {
        console.log(e.target.id);
        moveToHiddenSquare(img);
      }
      obj.appendChild(img);
    }
//
// private 
//
  function moveToHiddenSquare(img)
  {
    if (squaresAreAdjacent(img.id, currentHiddenImage.id))
      swapByImage(img, currentHiddenImage);
  }

  function squaresAreAdjacent(sq1, sq2)
  {
      var adj = findAdjacentSquares(parseInt(sq1));
      return adj.includes(parseInt(sq2));
  }

  // returns an array of image objects that are adjacent  
  // to sq where sq is an integer.
  //
  // 0 1 2
  // 3 4 5
  // 6 7 8
  // UP = subtract 3
  // DOWN = add 3
  // LEFT = if not 0-3-6, subtract 1
  // RIGHT = if not 2-5-8, add 1
  function findAdjacentSquares(sq)
  {
    var sqWide = 3;
    var sqHigh = 3;
    var maxIdx = 8;

    var adj = [];
    if (sq - sqWide >= 0) adj.push(sq - sqWide);     // UP
    if (sq + sqHigh <= maxIdx) adj.push(sq + sqHigh);     // DOWN

    if (sq != 2 && sq != 5 && sq != 8) adj.push(sq + 1); // RIGHT
    if (sq != 0 && sq != 3 && sq != 6) adj.push(sq - 1); // LEFT

    return adj;
  }

  function NotOnRightSide(sq)
  {
    var start = options.numColsToCut-1;

  }

  //function moveDown(img)
  //{
  //    swap('image5','image8');
  //}

  // swapByImage
  // Puts the "from" image's src into the "to" image's src, which 
  // by definition must be hidden, and makes it visible. 
  // Then the 'from' image gets the to image's source and is hidden. 
  // The to image always stays hidden until the end of the game.
  // 
  function swapByImage (imgFrom, imgTo)
  {
    var savedSrc = imgTo.src;

    imgTo.src = imgFrom.src;
    imgTo.style.visibility = "visible";

    // Move the hidden src to the 'from' square and hide it.
    imgFrom.src = savedSrc;
    imgFrom.style.visibility = "hidden";
    currentHiddenImage = imgFrom;
  }

  function swapById (from, to)
  {
    var imgFrom = document.getElementById(from);
    var imgTo = document.getElementById(to);

    var savedSrc = imgTo.src;

    imgTo.src = imgFrom.src;
    imgTo.style.visibility = "visible";

    // Move the hidden src to the 'from' square and hide it.
    imgFrom.src = savedSrc;
    imgFrom.style.visibility = "hidden";
  }


  // https://bost.ocks.org/mike/shuffle/
  function shuffle(array) {
    var m = array.length,
      t,
      i;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }


//}