$(() => {
    $('.hamburger').click(() => {
        $('.navbar').addClass('active');
        $('body').addClass('overflow')
    });

    $('.ham-close').click(() => {
        $('.navbar').removeClass('active');
        $('body').removeClass('overflow');
    });
});