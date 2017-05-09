(function () {
    if (typeof (Storage) !== "undefined") {
        if (localStorage.smartResize) {
            buildStyle(localStorage.smartResize);
        }
    }

    function buildStyle(smartResize){
        var styleItem = document.createElement('style');
        styleItem.type = 'text/css';
        styleItem.id = 'smartResize-preselected';
        styleItem.textContent = smartResize;
        document.head.appendChild(styleItem);
    }
})();