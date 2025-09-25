export function waitForElement(selector, context, options) {
    context = context || document;
    const { timeout, waitForMissing} = options || {};
    let timer;
    let observer;
    return new Promise((resolve, reject) => {
  
      let handleElement = () => {
        let condition = context?.querySelector(selector);
        if (waitForMissing ? !condition : condition) {
            resolve(waitForMissing ? true : condition || null);
            if (observer) observer.disconnect();
        }
      }
  
      handleElement();
  
      observer = new MutationObserver(mutations => {
        handleElement();
      });
  
      observer.observe(context, {
        childList: true,
        subtree: true
      });
  
      if (timeout) {
        const handleTimeout = () => {
          clearTimeout(timer);
          observer.disconnect();
          resolve(null);//new Error('Timeout waiting for element')
        };
        timer = setTimeout(handleTimeout, timeout);
      }
    });
}

export function CSSToObject(cssText) {
    var regex = /([\w-]*)\s*:\s*([^;]*)/g;
    var match, properties = {};
    while (match = regex.exec(cssText)) properties[match[1]] = match[2].trim();
    return properties;
}

export function objectToCSS(style) {
    return Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';')
}

export function clampToRange(value, range) {
  const [start, end] = range;

  if (value >= Math.min(start, end) && value <= Math.max(start, end)) {
      return value;
  } else if (Math.abs(value - start) < Math.abs(value - end)) {
      return start;
  } else {
      return end;
  }
}

export function onDocumentReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}