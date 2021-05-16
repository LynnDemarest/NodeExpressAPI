class SlidingPuzzleGame {
  currentHiddenImage = null;
  ip = null;
  pieces = [];
  options = [];

  constructor(ipoptions) {
    this.options = ipoptions;
    this.ip = new ImageProcessor(ipoptions);

    //this.pieces = this.shuffle(this.ip.pieces);
    this.pieces = this.ip.pieces;
    //debugger;
    var obj = document.getElementById(ipoptions.gameboardid);
    for (var i = 0; i < this.pieces.length; i++) {
      let img = new Image(
        ipoptions.heightOfOnePiece,
        ipoptions.widthOfOnePiece
      );

      img.src = this.pieces[i];
      img.id = i + "_image";
      img.alt = img.id;
      img.title = i.toString();
      if (i == this.pieces.length - 1) {
        img.style.visibility = "hidden";
        this.currentHiddenImage = img;
      }
      img.onclick = (e) => {
        console.log(e.target.id);
        this.moveToHiddenSquare(img);
      };
      obj.appendChild(img);
    }

    this.shuffle(this.pieces.length*20,0);
  }

  //
  // private
  //
  moveToHiddenSquare(img) {
    if (this.squaresAreAdjacent(img.id, this.currentHiddenImage.id))
      this.swapByImage(img, this.currentHiddenImage);
  }

  squaresAreAdjacent(sq1, sq2) {
    var adj = this.findAdjacentSquares(parseInt(sq1));
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
  findAdjacentSquares(sqidx) {
    var sqWide = this.options.numColsToCut;
    var sqHigh = this.options.numRowsToCut;
    var maxIdx = this.options.numColsToCut * this.options.numRowsToCut - 1;

    var adj = [];

    //if (sqidx - sqWide >= 0) adj.push(sqidx - sqWide); // UP
    if (!this.onTop(sqidx)) adj.push(sqidx - sqWide);

    //if (sqidx + sqHigh <= maxIdx) adj.push(sqidx + sqHigh); // DOWN
    if (!this.onBottom(sqidx)) adj.push(sqidx + sqHigh);

    //if (sqidx != 2 && sqidx != 5 && sqidx != 8) adj.push(sqidx + 1); // RIGHT
    if (!this.onRight(sqidx)) adj.push(sqidx + 1);

    //if (sqidx != 0 && sqidx != 3 && sqidx != 6) adj.push(sqidx - 1); // LEFT
    if (!this.onLeft(sqidx)) adj.push(sqidx - 1);

    return adj;
  }

  onTop(idx) {
    return idx >= 0 && idx < this.options.numColsToCut;
  }

  onBottom(idx) {
    var maxidx = this.options.numColsToCut * this.options.numRowsToCut - 1;
    var bottomleft =
      (this.options.numRowsToCut - 1) * this.options.numColsToCut;
    return idx >= bottomleft && idx <= maxidx;
  }
  // Returns true if the sqidx is on the right edge of the puzzle
  //
  //
  onRight(sqidx) {
    var maxidx = this.options.numColsToCut * this.options.numRowsToCut - 1;
    var upperright = this.options.numColsToCut - 1; // upper right corner, i.e., if cols = 3, this is 2 (0, 1, 2)

    var rightSideIds = [];
    while (upperright <= maxidx) {
      rightSideIds.push(upperright);
      upperright += this.options.numColsToCut;
    }

    return rightSideIds.includes(sqidx);
  }
  onLeft(sqidx) {
    var maxidx = this.options.numColsToCut * this.options.numRowsToCut - 1;
    var upperleft = 0;

    var leftSideIds = [];
    while (upperleft <= maxidx) {
      leftSideIds.push(upperleft);
      upperleft += this.options.numColsToCut;
    }

    return leftSideIds.includes(sqidx);
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
  swapByImage(imgFrom, imgTo) {
    var savedSrc = imgTo.src;

    imgTo.src = imgFrom.src;
    imgTo.style.visibility = "visible";

    // Move the hidden src to the 'from' square and hide it.
    imgFrom.src = savedSrc;
    imgFrom.style.visibility = "hidden";
    this.currentHiddenImage = imgFrom;
  }

  // swapById (from, to)
  // {
  //   var imgFrom = document.getElementById(from);
  //   var imgTo = document.getElementById(to);

  //   var savedSrc = imgTo.src;

  //   imgTo.src = imgFrom.src;
  //   imgTo.style.visibility = "visible";

  //   // Move the hidden src to the 'from' square and hide it.
  //   imgFrom.src = savedSrc;
  //   imgFrom.style.visibility = "hidden";
  // }

  makeRandomMove() {
    // find the squares adjacent to the currentHiddenImage
    //
    var adjSquares = this.findAdjacentSquares(
      parseInt(this.currentHiddenImage.id)
    );

    // pick a random adjSquare item
    //
    var i = Math.floor(Math.random() * adjSquares.length);
    var imgTo = this.currentHiddenImage;
    var imgFrom = document.getElementById(adjSquares[i] + "_image");
    this.swapByImage(imgFrom, imgTo);
  }

  shuffle(iterations, pause) {
    var x = 1;
    // setInterval( () => {
    //   this.makeRandomMove();
    //   x += 1;
    //   console.log(x);
    //   if ( x > iterations) return;
    // }, 50);
    var id = setInterval(() => {
      this.makeRandomMove();
      if (x == iterations) {
        clearInterval(id);
      } else {
        x++;
      }  
    }, pause);
  }
    
  

  // https://bost.ocks.org/mike/shuffle/
  //
  // This creates puzzles that aren't always solveable.
  fullshuffle(array) {
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
}
