// unfinished
(function smartResize(obj) {
  var smartResize = {
    /**
     *
     * @param original The top level DOM element that contains the items to be resized
     * @param resizeable DOM elements that will receive updated css values
     * @param desiredSizes Approved CSS values for application to the
     * @returns {smartResize} new object reference for use.
     */
    construct: function construct(original, resizeable, desiredSizes) {
      this.count++;
      var testable = Object.create(smartResize);
      testable.id = 'smartResize' + this.count;
      testable.generate(original);
      testable.resizeable = resizeable;
      testable.approvedStyle = desiredSizes;
      return testable;
    },
    generate: function generate(original) {
      if (!this.domEl) {
        this.domEl = $('<span id="' + this.id + '">').hide().appendTo(document.body);
        original.clone().appendTo(this.domEl);
      }
    },
    setLargest: function () {

    },
    id: null,
    resizeable: null,
    approvedStyle: [],
    maxWidth: null,
    domEl: null,
    count: 0
  };
  obj.smartResize = smartResize;
  /** EX use. Unfinished
   * var objs = [{fs: '15px', pds: "19px 19px 21px"},{fs: '16px', pds: '19px 19px 21px'},{fs: '16px', pds: '19px 25px 21px'}];
   * window.smartResize.construct($('#ASUNavMenu'), $(), objs);
   */
})(obj);
