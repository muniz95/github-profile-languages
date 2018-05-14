((doc) => {

    const qs = doc.querySelector.bind(doc);
    const qsa = (selector) => [].slice.call(doc.querySelectorAll(selector));

    if (!Element.prototype.closest) {
        /**
         * Shim for Element.closest
         *
         * Goes up in the DOM tree for the context element and
         * finds elements matching a passed selector.
         *
         * @param {string} selector
         * @returns {Element|null}
         */
        Element.prototype.closest = (selector) => {
            let currentElement = this;
            while (this.parentNode !== null) {
                const currentParent = currentElement.parentNode;
                if (currentParent === null) {
                    return null;
                }
                if (currentParent.querySelector(selector) === currentElement) {
                    return currentElement;
                }

                currentElement = this.parentNode;
            }
        };
    }

    const clearChildren = (element) => {
        while(element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    window.addEventListener("load", () => {

        //Elements
        const iframe = qs("#graph")
          , input = qs(".form-elm")
          , username = qs(".username")
          , embed = qs(".embed textarea")
          , twitter = qs(".popup a.twitter")
          , facebook = qs(".popup a.facebook")
          , gplus = qs(".popup a.gplus")
          , apiUrl = "https://ionicabizau.github.io/github-profile-languages/api.html"
          ;

        /**
         * check
         * Updates the user info
         *
         * @name check
         * @function
         * @return {undefined}
         */
        function check() {
            const queryStringUser = Url.queryString("user");
            const user = decodeURIComponent(queryStringUser);
            if (!user) {
                username.textContent = "GitHub Profile";
                return;
            }
            clearChildren(username);
            const a = document.createElement("a");
            a.setAttribute("target", "blank");
            a.href = "https://github.com/" + (user[0] === "@" ? user.slice(1) : user);
            a.textContent = user[0] === "@" ? user : "@" + user;

            username.appendChild(a);
            username.appendChild(document.createTextNode("'s"));

            iframe.src = "api.html?" + user;
            input.value = user;
            embed.value = "<iframe width=\"600\" height=\"600\" src=\"" + apiUrl + "?" + user + "\" frameborder=\"0\"></iframe>";

            // Update social
            const escaped = encodeURI(location.href);

            facebook.href = "https://www.facebook.com/sharer/sharer.php?u=" + escaped;
            twitter.href = "http://twitter.com/intent/tweet?text=A pie graph with my programming languages.&url=" + escaped;
            gplus.href = "https://plus.google.com/share?url=" + escaped;
        }

        // Writing the username
        let timer = null;
        input.addEventListener("input", () => {
            Url.updateSearchParam("user", this.value);
            clearTimeout(timer);
            timer = setTimeout(() => {
                check();
            }, 1000);
        });

        check();

        // Popups
        document.addEventListener("click", (event) => {
            const target = event.target;
            if (target.dataset.popup !== undefined) {
                qs(target.dataset.popup).classList.toggle("open");
            }
        });

        document.addEventListener("click", (event) => {
            const target = event.target;
            let parentPopup;
            if (target.classList.contains("close") && (parentPopup = target.closest(".popup")) !== null) {
                parentPopup.classList.toggle("open");
            }
        });

        window.addEventListener("keydown", (e) => {
            if (e.which === 27) {
                qsa(".popup.open").forEach(function(el) { el.classList.remove(".open"); });
            }
        });
    });
})(document);
