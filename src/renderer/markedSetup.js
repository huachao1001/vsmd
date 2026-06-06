const { marked } = require('marked');

const renderer = new marked.Renderer();

renderer.code = function(code, infostring, escaped) {
    const lang = (infostring || '').match(/\S*/)[0];
    const codeHtml = escaped ? code : code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    if (lang) {
        return `<pre><code class="language-${lang}">${codeHtml}</code></pre>\n`;
    }
    return `<pre><code>${codeHtml}</code></pre>\n`;
};

marked.use({ renderer });

function renderMarkdown(content) {
    return marked.parse(content);
}

module.exports = { renderMarkdown };
