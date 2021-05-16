
class ImageProcessor {
    _p;
    imagePieces = [];

    constructor(params)
    {
        this._p = params;
        this._p.heightOfOnePiece = params.heightOfOnePiece;
        this._p.widthOfOnePiece = params.widthOfOnePiece;

        // width and height of original image is calculated 
        let width = params.numColsToCut * params.widthOfOnePiece;
        let height = params.numRowsToCut * params.heightOfOnePiece;

        let image = new Image(width, height);
        image.src = this._p.src;

        this.imagePieces = this.DivideImage(image);
    }

    get pieces() {
        return this.imagePieces;
    }

    // Slices images into a grid of pieces. 
    // Returns an array of Image objects. 
    //
    DivideImage(image) {
        //debugger;
        let imagePieces = [];
        for(var y = 0; y < this._p.numRowsToCut; ++y)  {
            for(var x = 0; x < this._p.numColsToCut; ++x) {
                var canvas = document.createElement('canvas');
                canvas.width = this._p.widthOfOnePiece;
                canvas.height = this._p.heightOfOnePiece;
                var context = canvas.getContext('2d');
                context.drawImage(image, 
                                    x * this._p.widthOfOnePiece, 
                                    y * this._p.heightOfOnePiece, 
                                    this._p.widthOfOnePiece, 
                                    this._p.heightOfOnePiece, 
                                    0, 0, canvas.width, canvas.height);
                imagePieces.push(canvas.toDataURL());
            }
        }
        return imagePieces;
    }

}

