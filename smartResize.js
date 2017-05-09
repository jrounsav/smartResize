/**
 * EX Implementation
 * window.resizing = window.smartResize.construct(jQuery('#ASUNavMenu'),'.tb-megamenu-item.level-1.mega>a', jQuery('.block-tb-megamenu'),[{style:'font-size: 15px; padding: 12px 12px 15px'},{style:'font-size:16px; padding: 19px 19px 21px;'},{style: 'font-size:16px; padding: 19px 25px 21px;'}]);
 */
(function smartResize($) {
    var smartResize = {
        /**
         * Call construct to create a new smartResize object
         *
         * @param original (jQuery) The top level DOM element that contains the items to be resized as well as "bounds". Meant to include style in the cloned element
         * @param resizeable String DOM elements that will receive updated css values
         * @param bounds (jQuery) An element that contains resizeable elements, inside of the outermost "original" element
         * @param desiredSizes Array of Objects containing approved CSS values for application to the
         * @returns {smartResize} new object reference for use.
         */
        construct: function construct(original, resizeable, bounds, desiredSizes) {


            this.count++;
            var testable = Object.create(smartResize);
            this.topLvl = original;
            original = $(original);
            testable.id = 'smartResize' + this.count;
            testable.styleID = testable.id + '-smartstyle';
            testable.bounds = bounds;
            testable.generate(original);
            testable.resizeString = resizeable;
            testable.resizeable = document.querySelectorAll('#' + testable.id + ' ' + resizeable);
            testable.approvedStyle = desiredSizes;
            testable.preventTransitions();
            testable.getMaxWidth(bounds);
            testable.calculateSizes();
            return testable;
        },
        /**
         * Create and add a cloned object to the bottom of the DOM to be tested with other styling attributes.
         *
         * @param original The item to be cloned for the test object
         */
        generate: function generate(original) {
            if (!this.domEl) {
                this.domEl = $('<div id="' + this.id + '" style="position: absolute; left: -100000px;" aria-hidden="true">').appendTo(document.body);
                // this.domEl = $('<div id="' + this.id + '" style="height: 0; overflow: hidden;">').hide().appendTo(document.body);
                original.clone().appendTo(this.domEl);
            }
        },
        /**
         * Stops transition CSS from being applied to the testable element.
         * The system will not work if transitions interfere with the calculation.
         */
        preventTransitions: function(){
            var styleTag = document.createElement('style');
            styleTag.id = this.styleID + '-prevent-transitions';

            var innerStyle = "-webkit-transition: none; -moz-transition: none; -o-transition: none; transition: none;";
            var styles = document.createTextNode('#' + this.id + ' ' + this.resizeString + "{" + innerStyle + "}");

            styleTag.appendChild(styles);

            if($('#' + styleTag.id).length <= 0){
                $('head').append(styleTag);
            }
        },
        /**
         * Sets the object's max-width value in relation to the "bounds" provided in the constructor
         *
         * @param bounds the item constraining the items to be resized. Likely matches bootstrap breakpoints
         */
        getMaxWidth: function (bounds) {
            var width = this.bounds ? this.bounds.width() : bounds.width();
            this.maxWidth = width;
        },
        /**
         * Calculate the total width of the resizeable items when applying the various "approved styles"
         *
         * Store data in styledSize attribute. Indexes align with the approvedStyle indexes
         */
        calculateSizes: function(){
            var stylemap = {};
            var i = 0;
            var k = 0;
            loopApprovedStyles(this);

            function loopApprovedStyles(obj){
                if(k < obj.approvedStyle.length){
                    loopResizeable(obj);
                } else {
                    obj.checkValidSizes();
                    obj.setBestStyle();
                    obj.watchScreen();

                }
            }
            function loopResizeable(obj) {
                setTimeout(function(){
                    var original = obj.resizeable[i].getAttribute('style');
                    stylemap[k] = {original: original};
                    var newStyle = original ? original + ' ' + obj.approvedStyle[k].style : obj.approvedStyle[k].style;
                    obj.resizeable[i].setAttribute('style', newStyle);
                    i++;
                    if(i < obj.resizeable.length){
                        loopResizeable(obj);
                    } else {
                        getResizeableWidth(obj);
                    }
                }, 50)
            }
            function getResizeableWidth(obj){ //TODO Broken somewhere near here when refreshig the page at different sizes
                var width = 0;
                for(var a=0; a<obj.resizeable.length; a++){
                    var rect = obj.resizeable[a].getBoundingClientRect();
                    width = width + rect.width;
                    obj.resizeable[a].setAttribute('style', stylemap[k].original);
                }
                width = Math.ceil(width);
                obj.styledSize[k] = {width: width};
                i=0;
                k++;
                loopApprovedStyles(obj);
            }
        },
        /**
         * Verifies that any of the sizes have a width greater than 0.
         * Meant to prevent display:none; from tampering with the size calculation.
         */
        checkValidSizes: function(){
            var realSize = false;
            for(var size in this.styledSize){
                if(this.styledSize[size].width > 0){
                    realSize = true;
                }
            }
            if(realSize){
                this.validSizes = true
            }
        },
        /**
         * Checks the predetermined sizes against the width of the containing element.
         * If the currently used size is bigger than the container it sizes down,
         * otherwise it sizes up.
         */
        setBestStyle: function(){
            var biggestAcceptable = this.biggestAcceptable;
            if(this.styledSize[biggestAcceptable].width < this.maxWidth){
                for(var style in this.styledSize){
                    if(this.styledSize[style].width > this.styledSize[biggestAcceptable].width && this.styledSize[style].width < this.maxWidth){
                        biggestAcceptable = style;
                    }
                }
            } else if (this.styledSize[biggestAcceptable].width > this.maxWidth){
                var hit = false;
                var smallest = biggestAcceptable;
                for(var style in this.styledSize){
                    if(this.styledSize[style].width < this.maxWidth){
                        hit = true;
                        biggestAcceptable = style;
                    }
                    if(this.styledSize[style].width < this.styledSize[smallest].width){
                        smallest = style;
                    }
                }
                if(!hit){
                    biggestAcceptable = smallest;
                }
            }
            if (this.biggestAcceptable !== biggestAcceptable || this.firstBuild) {
                this.firstBuild = false;
                this.biggestAcceptable = biggestAcceptable;
                this.buildStyleMarkup();
                this.addMarkupToPage();
                this.setLocalStorage();
            }
        },
        /**
         * Builds the markup that will house the new MegaMenu style
         */
        buildStyleMarkup: function(){
            var styleTag = document.createElement('style');
            styleTag.id = this.styleID;

            var innerStyle = this.approvedStyle[this.biggestAcceptable].style;
            var styles = document.createTextNode( this.topLvl + " " + this.resizeString + "{" + innerStyle + "}");

            styleTag.appendChild(styles);

            this.cssMarkup = styleTag;
        },
        /**
         * Adds the new MegaMenu styling to the page head
         */
        addMarkupToPage: function(){
            if($('#' + this.styleID).length <= 0){
                $('head').append(this.cssMarkup);
            } else {
                $('#' + this.styleID).remove();
                $('head').append(this.cssMarkup);
            }
        },
        setLocalStorage: function(){
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem('smartResize', this.cssMarkup.innerHTML);
            }
        },
        handlePreselected: function(){
            $('#smartResize-preselected').remove();
        },
        /**
         * Adds an event lister for window resize.
         * Re-evaluates the object's maxWidth item, compares the styledSize to maxWidth, adds the new styling to the page.
         */
        watchScreen: function(){
            var original = this;
            window.addEventListener('resize', function(e){
                original.getMaxWidth();
                if(!original.validSizes){
                    original.calculateSizes();
                }
                original.setBestStyle();
            });
        },
        id: null, // ID for smartResize span item
        styleID: null,
        bounds: null, // HTML element that should contain the resizeable elements on a single line
        resizeable: null, // The elements that we will be testing against various sizes & styles
        resizeString: null, // The elements that we will be testing against various sizes & styles
        approvedStyle: [], // The styles that will be utilized
        maxWidth: null, // The width that the restyled elements should be checked against
        domEl: null, // The scapegoat to be tested
        styledSize: {}, // The total size of the resizeable elements and the index of the related approvedStyle
        biggestAcceptable: 0,
        cssMarkup: null, // The markup to be posted to the page
        count: 0, // The number of elements being "intelligently" resized
        validSizes: false, // The sizes are not all 0. May happen with display: none;
        firstBuild: true,
        topLvl: null
    };
    window.smartResize = smartResize;
})(window.jQuery);