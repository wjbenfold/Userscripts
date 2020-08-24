// ==UserScript==
// @name         Trello Usability
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Improve appearance and usability of Trello
// @author       WJB
// @match        trello.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addButtonFunction(relevant_div) {
        // Check if it should be smaller
        if (relevant_div.classList.contains("is-idle")){
            relevant_div.style.width = "40px";
        } else {
            relevant_div.style.width = null;
        }
        // Try to remove the spare writing TODO this is currently done then undone by Trello, needs to happen later or trigger off Trello changing it
        try {
            var relevant_span = relevant_div.firstElementChild.firstElementChild.firstElementChild;
            if (relevant_span.innerHTML.endsWith('list')) {
                relevant_span.innerHTML = relevant_span.innerHTML.substr(0, relevant_span.innerHTML.length - 16);
            }
        } catch(err) {
            console.log('Error was ' + err);
        }
    }

    // When the class of a list changes, check if it needs changing
    function callback(mutationsList, observer) {
        //console.log('Mutations:', mutationsList)
        //console.log('Observer:', observer)
        mutationsList.forEach(mutation => {
            addButtonFunction(mutation.target);
        })
    }

    function attachClassObservers(mutationsList, observer) {
        //console.log('Mutations:', mutationsList)
        //console.log('Observer:', observer)
        mutationsList.forEach(mutation => {
            var relevant_div_list = mutation.target.getElementsByClassName("js-add-list");
            relevant_div_list.forEach(function(relevant_div, index) {
                const mutationObserver = new MutationObserver(callback);
                mutationObserver.observe(relevant_div, { attributes: true, childList: true });
                //console.log(mutationObserver);
            });
        });
    }

    // When there's a new board, attach an observer
    var attachmentNeeded = true;

    function attachBoardObserver() {
        var board = document.getElementById('board');
        if (board === null) {
            //console.log('no board, so waiting');
            attachmentNeeded = true;
        } else {
            //console.log('there is a board, ' + attachmentNeeded);
            if (attachmentNeeded) {
                //console.log('and it needs attachment!');
                const mutationObserver = new MutationObserver(attachClassObservers);
                mutationObserver.observe(board, { childList: true });
                attachmentNeeded = false;

                // Also, because the first time the board loads its children don't change, do the attachments anyway
                var relevant_div_list = board.getElementsByClassName("js-add-list");
                relevant_div_list.forEach(function(relevant_div, index) {
                    const mutationObserver = new MutationObserver(callback);
                    mutationObserver.observe(relevant_div, { attributes: true });
                    //console.log(mutationObserver);
                });

                // Also, because the first time the div loads its classes don't change, do the changes anyway
                relevant_div_list.forEach(function(relevant_div, index) {
                    addButtonFunction(relevant_div);
                });
            }
        }
    }

    document.addEventListener('DOMSubtreeModified', attachBoardObserver); //We're spamming a bit here, but not noticeably affecting load times
})();
