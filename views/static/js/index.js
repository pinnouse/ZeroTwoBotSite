var statsChart = new Vue({
    el: '#stats-chart',
    data: {
        guilds: 0,
        users: 0
    }
});
$(() => {
  var statsFilled = false;

  var ticks = 20;

  function scrollCheck() {
    if ($(window).scrollTop() > $('#stats').offset().top - $('#stats').height() / 2 && !statsFilled) {
      statsFilled = true;
      let i = 0;
      var guildsInterval = setInterval(() => {
        i++;
        statsChart.guilds = Math.round(i * guilds / ticks);
        statsChart.users = Math.round(i * users / ticks);
        
        if (i >= ticks) {
          clearInterval(guildsInterval);
        }
      }, 26);
    }

    if ($(window).scrollTop() > $('nav').height() * 2) $('header').addClass("color");
    else $('header').removeClass("color");
  }

  $(window).scroll(scrollCheck);

  scrollCheck();
});