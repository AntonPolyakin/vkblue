(() => {

    let currentScript = document.currentScript;
    let search = currentScript.dataset.search;

    nav && nav.change && nav.change(
        {
            q: `${search}`,
            performer: 0
        },
        new CustomEvent('empty_event'),
        {
            searchPerformer: true
        }
    );

    var script = window.document.querySelector(`#${currentScript.id}`);
    script.remove();
})();