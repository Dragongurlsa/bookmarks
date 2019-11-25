/* Functions */
function pagination(links) {
  const prevButton = document.getElementById("button_prev");
  const nextButton = document.getElementById("button_next");

  let current_page = 1;
  let records_per_page = 5;

  this.init = function() {
    changePage(1);
    pageNumbers();
    selectedPage();
    addEventListeners();
  };

  let addEventListeners = function() {
    prevButton.addEventListener("click", prevPage);
    nextButton.addEventListener("click", nextPage);
  };

  let selectedPage = function() {
    let page_number = document
      .getElementById("page_number")
      .getElementsByClassName("pageNum");
    for (let i = 0; i < page_number.length; i++) {
      if (i == current_page - 1) {
        page_number[i].style.opacity = "1.0";
      } else {
        page_number[i].style.opacity = "0.5";
      }
    }
  };

  let checkButtonOpacity = function() {
    current_page == 1
      ? prevButton.classList.add("opacity")
      : prevButton.classList.remove("opacity");
    current_page == numPages()
      ? nextButton.classList.add("opacity")
      : nextButton.classList.remove("opacity");
  };

  let changePage = function(page) {
    const listingTable = document.getElementById("link-list");

    if (page < 1) {
      page = 1;
    }
    if (page > numPages() - 1) {
      page = numPages();
    }

    listingTable.innerHTML = "";
    if (links.length > 0) {
      for (
        var i = (page - 1) * records_per_page;
        i < page * records_per_page && i < links.length;
        i++
      ) {
        listingTable.innerHTML += "<li>" + links[i].text + "</li>";
      }
      checkButtonOpacity();
      selectedPage();
    }
  };

  let prevPage = function() {
    if (current_page > 1) {
      current_page--;
      changePage(current_page);
    }
  };

  let nextPage = function() {
    if (current_page < numPages()) {
      current_page++;
      changePage(current_page);
    }
  };

  let pageNumbers = function() {
    let pageNumber = document.getElementById("page_number");
    pageNumber.innerHTML = "";

    for (let i = 1; i < numPages() + 1; i++) {
      pageNumber.innerHTML += "<span class='pageNum'>" + i + "</span>";
    }
  };

  let numPages = function() {
    return Math.ceil(links.length / records_per_page);
  };
  init();
}

/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
  constructor() {
    // The state of the model, an array of list objects
    this.links = JSON.parse(localStorage.getItem("links")) || [];
  }

  bindLinkListChanged(callback) {
    this.onLinkListChanged = callback;
  }

  _commit(links) {
    this.onLinkListChanged(links);
    localStorage.setItem("links", JSON.stringify(links));
  }
  // appends a new link to the array
  addLink(linkText) {
    const link = {
      id: this.links.length > 0 ? this.links[this.links.length - 1].id + 1 : 1,
      text: linkText
    };

    this.addMessage = this.createElement("div");
    this.links.push(link);

    this._commit(this.links);
  }
}

function validateLink(url) {
  var regForUrl = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;

  if (!regForUrl.test(url)) {
    alert("Invalid URL");
    return false;
  }
  return true;
}

/*
https: routes = {
  "/": homePage,
  "/results": resultsPage
};
*/

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.app = this.getElement("#root");
    this.form = this.createElement("form");
    this.input = this.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "Add Link";
    this.input.name = "Link";
    this.submitButton = this.createElement("button");
    this.submitButton.textContent = "Submit";

    // The form, with a [type="text"] input, and a submit button
    this.form.append(this.input, this.submitButton);

    // The title of the app
    this.title = this.createElement("h1");
    this.title.textContent = "Bookmarks";

    // The visual representation of the link list
    this.linkList = document.getElementById("link-list");
    this.app.append(this.title, this.form);
  }

  get _linkText() {
    return this.input.value;
  }

  _resetInput() {
    this.input.value = "";
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    // Create an element with an optional CSS class
    if (className) element.classList.add(className);

    return element;
  }

  // Retrieve an element from the DOM
  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  displayLinks(links) {
    // Delete all nodes
    while (this.linkList.firstChild) {
      this.linkList.removeChild(this.linkList.firstChild);
    }

    pagination(links);

    // Debugging
    console.log(links);
  }

  bindAddLink(handler) {
    this.form.addEventListener("submit", event => {
      event.preventDefault();

      if (this._linkText) {
        handler(this._linkText);
        this._resetInput();
      }
    });
  }
}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Explicit this binding
    this.model.bindLinkListChanged(this.onLinkListChanged);
    this.view.bindAddLink(this.handleAddLink);

    // Display initial links
    this.onLinkListChanged(this.model.links);
  }

  onLinkListChanged = links => {
    this.view.displayLinks(links);
  };

  handleAddLink = linkText => {
    if (validateLink(linkText)) {
      this.model.addLink(linkText);
    }
  };
}

const app = new Controller(new Model(), new View());
