var ht = ht || {};

ht.poplogin = function(element) {
    $("#login-modal").modal('show');
    if (!element) {
        return
    }
    var call_href = element.attr("href");
    if (call_href) {
        $("#call_again_url").val(call_href)
    }
};

ht.initial = function() {
    $("a.ajax-request").livequery(function() {
        if (ht.user != null) {
            $(this).bind("click", function() {
                var ajax_url = $(this).attr("ajax_link_href");
                if (ajax_url) {
                    $.get(ajax_url);
                    return false
                }
                $.get($(this).attr("href"));
                return false
            });
        } else {
            $(this).bind("click.poplogin", function() {
                ht.poplogin($(this));
                return false
            })
        }
    });

    $("a.ajax-modal").livequery(function() {
        if (ht.user != null) {
            $(this).bind("click", function() {
                var _id = $(this).attr("data-target");
                var href = $(this).attr("href");
                $(_id).modal({remote: href});
                return false
            });
        } else {
            $(this).bind("click.poplogin", function() {
                ht.poplogin($(this));
                return false
            })
        }
    });

    function _clearSelectBoardList() {
        $prevItem = $('.board-list label.selected', $pinModal);
        $('i.fa-check', $prevItem).remove();
        $prevItem.removeClass('selected');
    }

    var $pinModal = $("#pin-modal");
    $pinModal.on('shown.bs.modal', function(event){
        $(this).on('click.pin.boardlists', '.board-list label', function(event){
            event.preventDefault(); 
            event.stopPropagation();

            _clearSelectBoardList();
            $(this).addClass('selected').append('<i class="fa fa-check"></i>');

            return false;
        });

        $(this).on('submit.pin.createboard', 'form.board-list-form', function(event){
            event.preventDefault(); 
            event.stopPropagation();

            $form = $('form.board-list-form', $pinModal);
            $.ajax({
                type: "POST",
                url: $form.attr('action'),
                data: $form.serialize(), // serializes the form's elements.
                success: function(data) {
                    if (data.error) {
                        alert('创建失败--'+data.message);
                    } else {
                        _clearSelectBoardList();
                        var $item = $('<li class="board-list"><label data-id="'+data.board_id+'" class="selected"> <span class="board-list-name">'+data.name+'</span> <input type="checkbox" checked> <i class="fa fa-check"></i></label></li>');
                        $('.board-lists', $pinModal).prepend($item);
                        $('#board-name').val("");
                        $("button", $form).addClass('disabled');
                    }               
                }
            });

            return false;
        });

        $(this).on('click.pin.pin2board', 'button.pin2board', function(event){
            event.preventDefault(); 
            event.stopPropagation();

            $item = $('.board-lists label.selected', $pinModal);

            if ($item.length <= 0) {
                alert('请选择一个或新建一个婚礼灵感板！');
                return false;
            }

            $.ajax({
                type: "POST",
                url: $(this).attr('data-href'),
                data: {board_id: $item.attr('data-id')}, // serializes the form's elements.
                success: function(data) {
                }
            });
        });

        $(this).on('keyup.pin.boardname', "input[name='name']", function(event){
            return event.currentTarget.value.trim() ? $("form.board-list-form button", $pinModal).removeClass("disabled") : $("form.board-list-form button", $pinModal).addClass("disabled");
        });
    });

    $pinModal.on('hide.bs.modal', function(){
        $(this).off('submit.pin.createboard');
        $(this).off('click.pin.boardlists');

        $(this).removeData("bs.modal");
        $('.modal-content', $pinModal).html('<p class="loading"><img src="http://www.likewed.com/img/loading.gif"></p>');
    });

    $('img.lazy').lazyload();

    $("form.ajax-form").livequery(function() {
        $(this).ajaxForm()
    });

    /** go to top **/
    var obj = document.getElementById("js_gotop");
    if (obj) {
        function getScrollTop() {
            sTop = document.documentElement.scrollTop == 0 ? document.body.scrollTop : document.documentElement.scrollTop;
            return sTop;
        }

        function setScrollTop(value) {
            document.documentElement.scrollTop > 0 ? document.documentElement.scrollTop = value : document.body.scrollTop = value
        }
        window.onscroll = function() {
            getScrollTop() > 0 ? obj.style.display = "block" : obj.style.display = "none";
        }

        obj.onclick = function() {
            var goTop = setInterval(scrollMove, 1);
            function scrollMove() {
                setScrollTop(getScrollTop() / 4);
                if (getScrollTop() < 1)
                    clearInterval(goTop);
            }
        }
    }
};

