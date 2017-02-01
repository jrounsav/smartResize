(function smartResize($) {
  var smartResize = {
    /**
     *
     * @param original The top level DOM element that contains the items to be resized as well as "bounds". Meant to include style in the cloned element
     * @param resizeable DOM elements that will receive updated css values
     * @param bounds An element that contains resizeable elements, inside of the outermost "original" element
     * @param desiredSizes Approved CSS values for application to the
     * @returns {smartResize} new object reference for use.
     */
    construct: function construct(original, resizeable, bounds, desiredSizes) {
      this.count++;
      var testable = Object.create(smartResize);
      testable.id = 'smartResize' + this.count;
      testable.bounds = bounds;
      testable.generate(original);
      testable.resizeable = document.querySelectorAll('#' + testable.id + ' ' + resizeable);
      testable.approvedStyle = desiredSizes;
      testable.getMaxWidth(bounds);
      testable.calculateSizes();
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
        // this.domEl = $('<span id="' + this.id + '">').appendTo(document.body);
        this.domEl = $('<div id="' + this.id + '" style="height: 0; overflow: hidden;">').hide().appendTo(document.body);
        original.clone().appendTo(this.domEl);
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
      // For every style, apply to every item
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
    },
    // Build/apply the style tag
    buildStyleMarkup: function(){

    },
    // Compare the styleSize values to the maxWidth
    // utilize buildStyleMarkup
    // add markup to the head if it doesn't exist
    setBestStyle: function(){

    },
    /**
     * Adds an event lister for window resize.
     * Re-evaluates the object's maxWidth item, compares the styledSize to maxWidth, adds the new styling to the page.
     */
    watchScreen: function(){
      var original = this;
      window.addEventListener('resize', function(e){
        original.getMaxWidth();
        original.setBestStyle();
      });
    },
    id: null, // ID for smartResize span item
    bounds: null, // HTML element that should contain the resizeable elements on a single line
    resizeable: null, // The elements that we will be testing against various sizes & styles
    approvedStyle: [], // The styles that will be utilized
    maxWidth: null, // The width that the restyled elements should be checked against
    domEl: null, // The scapegoat to be tested
    styledSize: {},
    cssMarkup: null,
    count: 0 // The number of elements being "intelligently" resized
  };
  window.smartResize = smartResize;
})(window.jQuery);
