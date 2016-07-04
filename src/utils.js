export default {
  flatten: function(ary) {
    return ary.reduce((a, b) => a.concat(b));
  },

  flatMap: function(ary, lambda) {
    return Array.prototype.concat.apply([], ary.map(lambda));
  },

  cartesianProduct: function(ary1, ary2) {
    return this.flatten(ary1.map(x => ary2.map(y => [x, y])));
  },

  randomID: function(prefix) {
    const str = [0, 1, 2, 3].map(() => {
      return Math.floor(Math.random() * 0x10000).toString(16).substring(1);
    }).join("");

    return `${prefix}-${str}`;
  },

  createElement: function(elementName, options) {
    const element = document.createElement(elementName);

    if (typeof options !== "undefined") {
      if (options.class) {
        element.className = options.class;
      }
    }

    return element;
  },

  createSVGElement: function(elementName, options) {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const element = document.createElementNS(svgNamespace, elementName);

    if (typeof options !== "undefined") {
      if (options.class) {
        options.class.split(" ").forEach(name => {
          this.addClass(element, name);
        });
      }

      if (options.attributes) {
        Object.keys(options.attributes).forEach(k => {
          element.setAttribute(k, options.attributes[k]);
        });
      }

      if (options.text) {
        element.textContent = options.text.toString();
      }
    }

    return element;
  },

  appendElement: function(parent, el) {
    parent.insertBefore(el, null);
  },

  addEventListener: function(el, eventName, fn) {
    el.addEventListener(eventName, fn, false);
  },

  removeClass: function(el, className) {
    el.classList.remove(className);
  },

  addClass: function(el, className) {
    el.classList.add(className);
  },

  hasClass: function(el, className) {
    return el.classList.contains(className);
  },

  toggleClass: function(el, className) {
    if (this.hasClass(el, className)) {
      this.removeClass(el, className);
    } else {
      this.addClass(el, className);
    }
  },

  unique: function(ary) {
    let unique = [];
    ary.forEach(el => {
      if (unique.indexOf(el) < 0) {
        unique.push(el);
      }
    });
    return unique;
  }
};
