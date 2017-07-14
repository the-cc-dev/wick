// tiny utility function for finding holes in a paper.js project
// made by zripo for the wick drawing tools

var PaperHoleFinder = (function () {

    // Return the shape of the smallest hole in 'paperProject' 
    // that would be created by clicking the mouse at 'point'.
    function getHoleShapeAtPosition (paperProject, point) {
        var path = getProjectAsSinglePath(paperProject);
        var holeShapes = getHolesOfPathAsShapes(path);
        var filledHoleShape = getSmallestShapeContainingPoint(path, holeShapes, point);

        return filledHoleShape;
    }

    // Unites all paths in paperProject into one super path
    function getProjectAsSinglePath (paperProject) {
        var allPathsInProject = paperProject.getActiveLayer().children;
        var superPath = allPathsInProject[0].children[0].clone({insert:false});

        // Unite all paths together into a superpath.
        for(var i = 1; i < allPathsInProject.length; i++) {
            var path = allPathsInProject[i];
            if(superPath.closePath) superPath.closePath();
            superPath = superPath.unite(path);
        }

        return superPath;
    }

    // Returns shapes of all holes of a given path
    function getHolesOfPathAsShapes (path) {
        var holeShapes = [];

        // Get an inverted version of the path by subtracting it from a giant rectangle.
        var hugeRectangle = new paper.Path.Rectangle(new paper.Point(-1000,-1000), new paper.Size(2000,2000));
        var negativeSpace = hugeRectangle.subtract(path);
        hugeRectangle.remove();
        negativeSpace.remove();

        // Convert holes into paths representing the shapes of the holes.
        negativeSpace.children.forEach(function (child) {
            if(child.clockwise && child.area !== 4000000) {
                var clone = child.clone({insert:false});
                var group = new paper.Group({insert:false});
                group.addChild(clone);
                clone.clockwise = false;
                clone.fillColor = 'green';
                group.fillRule = 'evenodd';
                //paper.project.getActiveLayer().addChild(clone);
                holeShapes.push(clone);
            }
        });

        return holeShapes;
    }

    // Returns smallest shape from 'shapes' that contains 'point'
    // Needs the original path shape and the shapes of its holes.
    // Returns null if no holes contain the point.
    function getSmallestShapeContainingPoint (originalPathShape, holeShapes, point) {
        var shapesContainingPoint = getShapesContainingPoint(holeShapes, point);
        if(shapesContainingPoint.length === 0) {
            // No shapes contained the point.
            return null;
        } else {
            // >=1 shapes contain the point - process the smallest one and return it.
            var smallestShape = shapesContainingPoint[0];
            return removeSubholesFromHoleShape(smallestShape, originalPathShape, holeShapes);
        }
    }

    // Returns shapes from 'shapes' that contain 'point' in order from smallest to largest
    function getShapesContainingPoint (shapes, point) {
        var shapesContainingPoint = [];

        shapes.forEach(function (shape) {
            if(shape.contains(point)) {
                shapesContainingPoint.push(shape);
            }
        });

        shapesContainingPoint.sort(function (a,b) {
            return b.area-a.area;
        });

        return shapesContainingPoint;
    }

    function removeSubholesFromHoleShape (holeShape, originalPathShape, holeShapes) {
        console.log('removeSubholesFromHoleShape')

        var holeShapeSubholesRemoved = holeShape;
        holeShapes.forEach(function (holeShapeToSubtract) {
            if(holeShapeToSubtract.area === holeShapeSubholesRemoved.area) return;
            if(holeShapeToSubtract.area < holeShapeSubholesRemoved.area) return;
            holeShapeSubholesRemoved = holeShapeSubholesRemoved.subtract(holeShapeToSubtract);
        });

        var holeShapeOriginalPathRemoved = holeShapeSubholesRemoved.subtract(originalPathShape);
        
        return holeShapeOriginalPathRemoved;
    }

    // Export main function
    var paperHoleFinder = {};
    paperHoleFinder.getHoleShapeAtPosition = getHoleShapeAtPosition;
    return paperHoleFinder;
})();