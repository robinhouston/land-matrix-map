// Many of these are updated by data.js
var map_data = {};
var map_values = {};
var map_region_names = {};
var map_rank = {};
var map_data_loaded = false;
var map_timer;
//Modernizr.smil = false;


function loadAsync(js_file) {
    (function() {
        var d=document,
        h=d.getElementsByTagName('head')[0],
        s=d.createElement('script');
        s.type='text/javascript';
        s.async=true;
        s.src=js_file;
        h.appendChild(s);
    })();
}

// Collect the query string parameters
var params = {};
(function (query, re, match) {
    while (match = re.exec(query)) {
        params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
    }
})(window.location.search.substring(1).replace(/\+/g, "%20"), /([^&=]+)=?([^&]*)/g);

$(function() {
    // After three seconds, show a "loading" ticker
    map_timer = setTimeout(function() {
        map_timer = null;
        $("#loading").show();
    }, 3000);

    loadAsync("data.js");
});

var map;
var map_bounds = [0, 0, 1600, 800];
function mapDataHaveLoaded() {
    if (map_timer) clearTimeout(map_timer);
    $("#loading").hide();

    // Create the SVG element to hold the map
    map = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    map.setAttribute("id", "map");
    map.setAttribute("viewBox", map_bounds.join(" "));

    var elementId = function(k) {
        return "country-" + k.toLowerCase().replace(/\W+/g, "-");
    };

    // Add the countries to the map
    var current_path_by_country_id = {}; // Only used if !Modernizr.smil
    for (var country in map_data._raw) {
        if (!map_data._raw.hasOwnProperty(country)) continue;
        if (country.charAt(0) === "_") continue;
        var path_data = map_data._raw[country];
        if (!path_data) continue;

        var e = document.createElementNS("http://www.w3.org/2000/svg", "path");
        e.id = elementId(country);
        map_region_names[e.id] = country;
        e.setAttribute("class", "country");
        e.setAttribute("d", path_data);
        if (!Modernizr.smil) {
            current_path_by_country_id[e.id] = path_data;
        }
        map.appendChild(e);
    }

    var maparea = document.getElementById("maparea");
    maparea.insertBefore(map, document.getElementById("loading"));
    maparea.onmousedown = function() { return false; }; // This prevents double-clicks on the map from selecting menu text

    var timer = null;
    var frames = 48;
    var animation_millis = 2000;

    var fakeAnimation = function(data) {
        if (timer != null) {
            clearInterval(timer);
        }

        var start_time = new Date().getTime();
        timer = setInterval(function() {
            var elapsed_millis = new Date().getTime() - start_time;
            var x = Math.min(1, elapsed_millis / animation_millis);

            if (elapsed_millis >= animation_millis) {
                clearInterval(timer);
                timer = null
            }

            for (var k in data) {
                if (!data.hasOwnProperty(k)) continue;

                var country_path = document.getElementById(elementId(k));
                var new_path = data[k];
                if (country_path != null) {
                    var country_id = country_path.id;
                    var original_path = current_path_by_country_id[country_id];
                    var original_path_els = original_path.split(" ");
                    var new_path_els = new_path.split(" ");

                    var intermediate_path_els = [];
                    for (var j = 0; j < original_path_els.length; j++) {
                        var a = parseInt(original_path_els[j]), b = parseInt(new_path_els[j]);
                        if (isNaN(a)) {
                            intermediate_path_els[j] = original_path_els[j];
                        }
                        else {
                            intermediate_path_els[j] = Math.round( (1-x) * a + x * b );
                        }
                    }
                    var intermediate_path = intermediate_path_els.join(" ");
                    country_path.setAttribute("d", intermediate_path);
                    current_path_by_country_id[country_id] = intermediate_path;
                }
            }
        }, animation_millis/frames);
    };

    var setDataset = function(new_dataset) {
        dataset = new_dataset;
        if (!(dataset in map_data)) return;

        var data = map_data[dataset];

        // Animate the map to the chosen configuration
        if (Modernizr.smil) {
            var animate_elements = [];
            for (var k in data) {
                if (!data.hasOwnProperty(k)) continue;

                var country_path = document.getElementById(elementId(k));
                var new_path = data[k];
                if (country_path != null) {
                    var animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animate");

                    animate_element.setAttribute("dur", "1s");
                    animate_element.setAttribute("attributeName", "d");
                    animate_element.setAttribute("to", new_path);
                    animate_element.setAttribute("begin", "indefinite");
                    animate_element.setAttribute("fill", "freeze");

                    var existing_animate_elements = $(country_path).find("animate");
                    if (existing_animate_elements.length > 4) {
                        existing_animate_elements.slice(1, 2).remove();
                    }
                    country_path.appendChild(animate_element);
                    animate_elements.push(animate_element);
                }
            }
            for (var i=0; i < animate_elements.length; i++)
                animate_elements[i].beginElement();
            animate_elements = [];
        }
        else {
            // Fake the animation for browsers that don’t support SMIL
            // (I’m looking at you, IE 9)
            fakeAnimation(data);
        }
    };

    var handleHashChange = function() {
        // Which menu item was chosen?
        if (location.hash && location.hash != "#") {
            setDataset(location.hash.substr(1));
        }
        else {
            setDataset("_raw");
        }
    };
    window.addEventListener("hashchange", handleHashChange, false);

    // Check the hash on initial load as well.
    if (location.hash) {
        handleHashChange();
    }

    var popup = $("#popup"),
        popup_text = popup.find("#popup-text"),
        popup_visible = false,
        popup_timer = null;
    var hidePopup = function() {
        if (!popup_visible) return;
        popup_visible = false;
        if (popup_timer) { clearTimeout(popup_timer); popup_timer = null; }
        popup_timer = setTimeout(function() {
            if (!popup_visible) popup.fadeOut(100);
            popup_timer = null;
        }, 100);
    };
}
