$(function(){
    var clock = $('#clock'),
        alarm = clock.find('.alarm'),
        ampm = clock.find('.ampm');
    var digit_to_name = 'zero one two three four five six seven eight nine'.split(' ');

    var digits = {};

    var positions = [
        'h1', 'h2', ':', 'm1', 'm2', ':', 's1', 's2'
    ];

    var digit_holder = clock.find('.digits');

    $.each(positions, function(){

        if(this == ':'){
            digit_holder.append('<div class="dots">');
        }
        else{

            var pos = $('<div>');

            for(var i=1; i<8; i++){
                pos.append('<span class="d' + i + '">');
            }
            digits[this] = pos;

            digit_holder.append(pos);
        }

    });
    var weekday_names = 'MON TUE WED THU FRI SAT SUN'.split(' '),
        weekday_holder = clock.find('.weekdays');

    $.each(weekday_names, function(){
        weekday_holder.append('<span>' + this + '</span>');
    });

    var weekdays = clock.find('.weekdays span');

    // Run a timer every second and update the clock

    (function update_time(){

        // Use moment.js to output the current time as a string
        // hh is for the hours in 12-hour format,
        // mm - minutes, ss-seconds (all with leading zeroes),
        // d is for day of week and A is for AM/PM

        //var now = moment().format("hhmmssdA");
        let test=$.get("/get_time")
        test.done(function(response) {
            let now=response
            digits.h1.attr('class', digit_to_name[now[0]]);
            digits.h2.attr('class', digit_to_name[now[1]]);
            digits.m1.attr('class', digit_to_name[now[2]]);
            digits.m2.attr('class', digit_to_name[now[3]]);
            digits.s1.attr('class', digit_to_name[now[4]]);
            digits.s2.attr('class', digit_to_name[now[5]]);
            if(parseInt(now[0] + now[1])>12){
                $('.light').removeClass('light').addClass('dark')
                if(!$('.button.sign_out').transition('is looping')){
                    $('.button.sign_in').transition('remove looping')
                    $('.button.sign_out').transition('set looping').transition('pulsating', '800ms')
                    //$('.sign.form').addClass('inverted').parent('.segment').addClass('inverted')
                    $('body').removeClass('light_body').addClass('dark_body')
                    $('.menu.my_title').removeClass('light_menu').addClass('dark_menu')
                    $('.menu.my_title>.my_title').removeClass('light_item').addClass('dark_item')
                }
            }else{
                $('.dark').removeClass('dark').addClass('light')
                if(!$('.button.sign_in').transition('is looping')){
                    $('.button.sign_out').transition('remove looping')
                    $('.button.sign_in').transition('set looping').transition('pulsating', '800ms')
                    //$('.sign.form').removeClass('inverted').parent('.segment').removeClass('inverted')
                    $('body').removeClass('dark_body').addClass('light_body')
                    $('.menu.my_title').removeClass('dark_menu').addClass('light_menu')
                    $('.menu.my_title>.my_title').removeClass('dark_item').addClass('light_item')
                }
            }
            // The library returns Sunday as the first day of the week.
            // Stupid, I know. Lets shift all the days one position down,
            // and make Sunday last

            var dow = now[6];
            if(dow < 0){
                dow = 6;
            }

            weekdays.removeClass('active').eq(dow).addClass('active');
            ampm.text(now[7]+now[8]);
            setTimeout(update_time, 1000);
        });

    })();
});