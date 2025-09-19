export default function(search) {
    if (typeof search !== 'string') {
        return;
    }

    var script = document.createElement('script');
    script.id = 'vk_lyrics_chrome_extension_script';
    script.innerHTML = `
            nav && nav.change && nav.change(
                { 
                    q: "${search}", 
                    performer: 0
                }, 
                new CustomEvent('empty_event'), 
                {   
                    searchPerformer: true
                }
            );
                
            var script = window.document.querySelector('#${script.id}');
            script.remove();
        `;

    document.body.appendChild(script);
}
