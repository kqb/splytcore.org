$(function () {
    const boxAction = () => {
        $('.concept-boxes.enft .concept-boxes__desktop .concept-box').each((i, e) => {
            addClass($(e));
        });
    }
    const addClass = (box) => {
        let toAnim = box.data("toanim");

        box.on({
            mouseenter: function (event) {
                toAnim.forEach(el => {
                    $(el).attr('ani', '');
                });
            },
            mouseleave: function (event) {
                toAnim.forEach(el => {
                    $(el).removeAttr('ani', '');
                });
            }
        });
    }
    boxAction();
});