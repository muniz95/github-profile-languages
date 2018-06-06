(function (doc) {
    window.addEventListener("load", function apiOnDomReady() {

        const cardBuilder = (stat, totalRepos) => {
            const card = doc.createElement('div');
            const cardHeader = doc.createElement('div');
            const cardHeaderBox = doc.createElement('div');
            const cardContent = doc.createElement('div');
            const percentage = Math.round((stat.value / totalRepos) * 100);

            card.classList.add('card');
            cardHeader.classList.add('card-header');
            cardHeaderBox.classList.add('card-header-box');
            cardContent.classList.add('card-content');

            cardHeaderBox.innerHTML = '&nbsp;';
            cardHeaderBox.style.backgroundColor = stat.color;

            cardContent.innerText = `${stat.title}: ${stat.value} (${percentage}%)`;

            cardHeader.appendChild(cardHeaderBox);
            card.appendChild(cardHeader);
            card.appendChild(cardContent);
            doc.getElementById('dashboard').appendChild(card);
        }

        var loading = doc.querySelector(".loading"),
            errorDiv = doc.querySelector(".error"),
            errorMessage = errorDiv.querySelector(".message"),
            input = (Url.queryString("user") || location.search).replace(/^\?@?/g, ""),
            token = Url.queryString("token");

        if (!input) {
            return;
        }

        var token = Url.queryString("token") || undefined;
        if (token) {
            input = Url.queryString("input");
            if (!input) {
                errorDiv.classList.add("visible");
                return errorMessage.textContent = "If you are using a token, please provide the 'input' querystring parameter.";
            }
        }

        loading.classList.add("visible");


        function getStats(input, callback) {

            var fromLocalStorage = localStorage[input];
            try {
                fromLocalStorage = JSON.parse(fromLocalStorage);
            } catch (e) {
                fromLocalStorage = null;
            }

            if (Array.isArray(fromLocalStorage)) {
                return callback(null, fromLocalStorage);
            }

            var polyglot = new GitHubPolyglot(input, token),
                func = polyglot.userStats;

            if (localStorage[input]) {
                return callback(null, localStorage[input]);
            }


            if (polyglot.repo) {
                func = polyglot.repoStats
            }

            func.call(polyglot, function (err, stats) {
                if (err) {
                    return callback(err);
                }

                try {
                    localStorage[input] = JSON.stringify(stats);
                } catch (e) {
                    localStorage.clear();
                }

                callback(null, stats);
            });
        }

        getStats(input, function (err, stats) {
            loading.classList.remove("visible");
            if (err) {
                errorDiv.classList.add("visible");
                return errorMessage.textContent = err || "This user doesn't have any repositories.";
            }
            stats.sort(function (a, b) {
                return a.value < b.value ? 1 : -1;
            }).forEach(function (c) {
                c.title = c.label;
                delete c.label;
            });
            console.log(stats);
            const totalRepos = stats.map(d => d.value).reduce((a, b) => a + b);
            stats.forEach(stat => cardBuilder(stat, totalRepos));
            // drawPieChart.call(doc.querySelector("#pieChart"), stats, {
            //     legend: true
            // });
        });
    });
})(document);
