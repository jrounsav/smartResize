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
      testable.setBestStyle();
      testable.watchScreen();
      return testable;
    },
    /**
     * Create and add a cloned object to the bottom of the DOM to be tested with other styling attributes.
     *
     * @param original The item to be cloned for the test object
     */
    generate: function generate(original) {
      if (!this.domEl) {
        // this.domEl = $('<div id="' + this.id + '" style="">').appendTo(document.body);
        this.domEl = $('<div id="' + this.id + '" style="height: 0; overflow: hidden;">').hide().appendTo(document.body);
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
      this.domEl.show();
      for(var i=0; i<this.approvedStyle.length; i++){
        var width = 0;
        for(var j=0; j<this.resizeable.length; j++){
          var original = this.resizeable[j].getAttribute('style');
          stylemap[j] = {original: original};
          var newStyle = original ? original + ' ' + this.approvedStyle[i].style : this.approvedStyle[i].style ;
          this.resizeable[j].setAttribute('style', newStyle);
          width = width + this.resizeable[j].offsetWidth;
        }
        this.styledSize[i] = {width: width};

        for(var k=0; k<this.resizeable.length; k++){
          this.resizeable[k].setAttribute('style', stylemap[k].original);
        }
      }
      this.domEl.hide();
      this.checkValidSizes();
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
        for(var style in this.styledSize){
          if(this.styledSize[style].width < this.maxWidth){
            biggestAcceptable = style;
          }
        }
      }
      if(this.biggestAcceptable !== biggestAcceptable){
        this.biggestAcceptable = biggestAcceptable;
        this.buildStyleMarkup();
        this.addMarkupToPage();
      }
    },
    /**
     * Builds the markup that will house the new MegaMenu style
     */
    buildStyleMarkup: function(){
      var styleTag = document.createElement('style');
      styleTag.id = this.styleID;

      var innerStyle = this.approvedStyle[this.biggestAcceptable].style;
      var styles = document.createTextNode(this.resizeString + "{" + innerStyle + "}");

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
    validSizes: false // The sizes are not all 0. May happen with display: none;
  };
  window.smartResize = smartResize;
})(window.jQuery);
