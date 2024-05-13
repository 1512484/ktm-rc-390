window.addEventListener("DOMContentLoaded", () => {
    const COUNTER_THRESHOLD = 2; // Change this to decrease/increase senstivity
    const COUNTER_RESET_DURATION = 70;
    let counter = 0;
    var scrollTimestamp = Date.now();
    var scrollTimeout = 0;
    var touches = {
        "touchstart": { "x": -1, "y": -1 },
        "touchmove": { "x": -1, "y": -1 },
        "touchend": false
    };

    let main = document.querySelector("main");
    let sections = document.querySelectorAll("section");
    let snapStop = [];
    for (let i = 0; i < sections.length; i++) {
        snapStop.push(sections[i].getBoundingClientRect().top);
    }

    function resetDelta() {
        counter = 0
    }

    let debouncedReset = debounce(resetDelta, COUNTER_RESET_DURATION);

    function debounce(func, delay) {
        let debounceTimer
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        }
    }

    function touchHandler(event) {
        var touch;
        if (typeof event !== 'undefined') {
            event.preventDefault();
            if (typeof event.touches !== 'undefined') {
                touch = event.touches[0];

                let indexToGo = -1;
                let active = Number(document.body.getAttribute("active"));
                switch (event.type) {
                    case 'touchstart':
                    case 'touchmove':
                        touches[event.type].x = touch.pageX;
                        touches[event.type].y = touch.pageY;
                        break;
                    case 'touchend':
                        touches[event.type] = true;
                        let direction = "undetermined";
                        if (touches.touchstart.y > -1 && touches.touchmove.y > -1) {
                            direction = touches.touchstart.y < touches.touchmove.y ? "up" : "down";

                            if (direction == "down" && active != sections.length - 1) {
                                indexToGo = active + 1;
                            } else if (direction == "up" && active != 0) {
                                indexToGo = active - 1;
                            }

                            if(indexToGo != -1) {
                                scrollToSection(indexToGo);
                            }
                        }
                    default:
                        break;
                }
            }
        }
    }

    function handleScroll(event) {
        //event.wheelDelta can be positive or negative based on the direction of scroll
        counter += 1 * (Math.sign(event.wheelDelta));

        let indexToGo = -1;
        let active = Number(document.body.getAttribute("active"));
        //Scroll down if value of counter is negative and absolute value is greater than threshold
        if (Math.abs(counter) >= COUNTER_THRESHOLD && counter < 0 && active != sections.length - 1) {
            indexToGo = active + 1;
        }
        //Scroll up if value of counter is positive and absolute value is greater than threshold
        else if (Math.abs(counter) >= COUNTER_THRESHOLD && counter > 0 && active != 0) {
            indexToGo = active - 1;
        }
        if(indexToGo != -1) {
            scrollToSection(indexToGo);
        }
        // prevent default scrolling behaviour of mouse wheel
        event.preventDefault()

        //Reset counter to 0 , 70 miliseconds after stopping the mousewheel
        debouncedReset()
    }

    function scrollToSection(indexToGo) {
        if (Date.now() - scrollTimestamp < 70) {
            scrollTimestamp = Date.now();
            return;
        }
        scrollTimestamp = Date.now();
        clearTimeout(scrollTimeout);
        document.querySelector("main").scrollTop = snapStop[indexToGo];
        setTimeout(() => {
            if(indexToGo > 0) {
                let classList = [...Array(indexToGo)].map((_, index) => `active-${index + 1}`);
                document.body.className = classList.join(" ");
                document.body.setAttribute("active", indexToGo);
            } else {
                document.body.className = "";
                document.body.setAttribute("active", 0);
            }
        }, 7);
    }

    //Test support for passive listeners
    let supportsPassive = false;
    try {
        let options = Object.defineProperty({}, 'passive', {
            get: function () {
                supportsPassive = true;
            }
        });
        window.addEventListener("testPassive", null, options);
        window.removeEventListener("testPassive", null, options);
    } catch (e) { }

    let wheelOptions = supportsPassive ? {
        passive: false
    } : false;

    // Older browsers used 'mousewheel' event
    let wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    main.addEventListener(wheelEvent, handleScroll, wheelOptions);
    main.addEventListener('touchstart', touchHandler, false);
    main.addEventListener('touchmove', touchHandler, false);
    main.addEventListener('touchend', touchHandler, false);
    
    // Scroll to top event
    let btn = document.getElementById("scroll-top-btn");
    btn.addEventListener("click", () => {
        main.scrollTop = 0;
        scrollToSection(0);
    });
    btn.addEventListener("touchend", () => {
        main.scrollTop = 0;
        scrollToSection(0);
    });

    // Menu button
    let menu = document.getElementById("menu");
    let menuBtn = document.getElementById("menu-btn");
    let menuCloseBtn = document.getElementById("menu-close-btn");
    let menuItems = document.querySelectorAll(".menu-item");

    if(menuItems?.length) {
        menuItems.forEach((item, index) => {
            item.setAttribute("value", index);
            item.setAttribute("style", `--i: ${index}`);

            item.addEventListener("click", () => {
                main.scrollTop = index;
                scrollToSection(index);
                menu.classList.remove("active");
            });
        });
    }

    menuBtn.addEventListener("click", () => {
        menu.classList.add("active");
    });
    
    menuCloseBtn.addEventListener("click", () => {
        menu.classList.remove("active");
    });


    // Search button
    let search = document.getElementById("search");
    let searchBtn = document.getElementById("search-btn");
    let searchCloseBtn = document.getElementById("search-close-btn");

    searchBtn.addEventListener("click", () => {
        search.classList.add("active");
    });
    
    searchCloseBtn.addEventListener("click", () => {
        search.classList.remove("active");
    });


    // Type select button
    let typeSelect = document.getElementById("type-select");
    let typeSelectBtn = document.getElementById("type-select-btn");
    let typeSelectCloseBtn = document.getElementById("type-select-close-btn");
    let typeSelectItems = document.querySelectorAll(".type-select-item");

    if(typeSelectItems?.length) {
        typeSelectItems.forEach((item) => {
            item.addEventListener("click", () => {
                document.querySelector(".type-select-item.active")?.classList.remove("active");
                item.classList.toggle("active");
                main.scrollTop = 0;
                scrollToSection(0);

                let itemSrc = item.querySelector("img")?.getAttribute("src");
                let itemColor = item.getAttribute("color");
                let itemLightColor = item.getAttribute("light-color");
                let itemTitle = item.querySelector(".type-select-item-title")?.textContent;

                let ktmImg = document.querySelector(".ktm-img img");
                let ktmHeading = document.querySelector(".ktm-heading");
                let dotActiveTitle = document.querySelector(".dot-active .dot-text");
                let menuActiveType = document.querySelector(".menu-active-type");

                ktmImg.setAttribute("src", itemSrc);
                document.body.setAttribute("style", `--c-orange: rgb(${itemColor}); --c-orange-light: rgb(${itemLightColor})`);

                ktmHeading.innerHTML = itemTitle;
                dotActiveTitle.innerHTML = itemTitle;
                menuActiveType.innerHTML = itemTitle;

                typeSelect.classList.remove("active");
            });
        });
    }

    typeSelectBtn.addEventListener("click", () => {
        typeSelect.classList.add("active");
    });
    
    typeSelectCloseBtn.addEventListener("click", () => {
        typeSelect.classList.remove("active");
    });

});