(function() {
    var DAY_MAP = {
        1: 'MONDAY',
        2: 'TUESDAY',
        3: 'WEDNESDAY',
        4: 'THURSDAY',
        5: 'FRIDAY',
        6: 'SATURDAY',
        0: 'SUNDAY',
    };

    var MONTH_MAP = {
        0: 'january',
        1: 'february',
        2: 'march',
        3: 'april',
        4: 'may',
        5: 'june',
        6: 'july',
        7: 'august',
        8: 'september',
        9: 'october',
        10: 'november',
        11: 'december'
    };

    var WEATHER_DATA_URL = 'http://api.openweathermap.org/data/2.5/weather?q=cluj-napoca&units=metric&APPID=73222253ba6e6718398231fde9dda6c1';
    var FORECAST_DATA_URL = 'http://api.openweathermap.org/data/2.5/forecast?q=cluj-napoca&units=metric&cnt=3&APPID=73222253ba6e6718398231fde9dda6c1';

    function runApp(tizen, battery) {
        var strHours = document.getElementById('str-hours');
        var strMinutes = document.getElementById('str-minutes');
        var strMeridian = document.getElementById('str-meridian');
        var strDay = document.getElementById('str-day');
        var strDate = document.getElementById('str-date');
        var strBattery = document.getElementById('str-battery');
        var gfxWeatherIcon = document.getElementById('gfx-weather-icon');
        var strTemperature = document.getElementById('str-temperature');
        var gfxWeatherIconF = {
            0: document.getElementById('gfx-weather-icon-f0'),
            1: document.getElementById('gfx-weather-icon-f1'),
            2: document.getElementById('gfx-weather-icon-f2')
        };


        function updateTime() {
            var datetime = tizen.time.getCurrentDateTime();
            var hour = datetime.getHours();
            var minute = datetime.getMinutes();
            var day = datetime.getDay();
            var month = datetime.getMonth();
            var dayInMonth = datetime.getDate();
            var year = datetime.getFullYear();
            var meridian = 'AM';

            if (
                hour > 6
                && hour < 22
                && minute === 0
            ) {
                updateWeather();
            }

            if (minute < 10) {
                minute = '0' + minute;
            }

            if (hour >= 12) {
                meridian = 'PM';

                if (hour > 12) {
                    hour -= 12;
                }
            }

            if (hour < 10) {
                hour = '0' + hour;
            }

            strMeridian.innerHTML = meridian;
            strHours.innerHTML = hour;
            strMinutes.innerHTML = minute;
            strDay.innerHTML = DAY_MAP[day];
            strDate.innerHTML = MONTH_MAP[month] + ' ' + dayInMonth + ', ' + year;
        }

        function updateWatch() {
            updateTime();
        }

        function updateBatteryState() {
            var batteryLevel = Math.floor(battery.level * 100);
            strBattery.innerHTML = batteryLevel + '%';
        }

        function updateWeather() {
            var datetime = tizen.time.getCurrentDateTime();
            var hour = datetime.getHours();

            var xmlHttp = new XMLHttpRequest();

            xmlHttp.overrideMimeType('application/json');
            xmlHttp.open('GET', WEATHER_DATA_URL, true);
            xmlHttp.onreadystatechange = function() {
                if (
                    xmlHttp.readyState === XMLHttpRequest.DONE
                    && xmlHttp.status === 200
                    && xmlHttp.responseText
                ) {
                    var data = JSON.parse(xmlHttp.responseText);
                    var temperature = data.main.temp;
                    var weatherIcon = 'owf owf-' + data.weather[0].id;

                    if (hour < 7 && hour > 23) {
                        weatherIcon += '-n';
                    }
                    else {
                        weatherIcon += '-d';
                    }

                    gfxWeatherIcon.className = weatherIcon;
                    strTemperature.innerHTML = Math.round(temperature) + '°';
                }
            };

            xmlHttp.send();


            var xmlHttpForecast = new XMLHttpRequest();

            xmlHttpForecast.overrideMimeType('application/json');
            xmlHttpForecast.open('GET', FORECAST_DATA_URL, true);
            xmlHttpForecast.onreadystatechange = function() {
                if (
                    xmlHttpForecast.readyState === XMLHttpRequest.DONE
                    && xmlHttpForecast.status === 200
                    && xmlHttpForecast.responseText
                ) {
                    var data = JSON.parse(xmlHttpForecast.responseText);

                    for (var i = 0; i < 3; i++) {
                        var weatherIcon = '';

                        if (data.list.length > i) {
                            weatherIcon = 'owf owf-' + data.list[i].weather[0].id;

                            if (hour < 7 && hour > 23) {
                                weatherIcon += '-n';
                            }
                            else {
                                weatherIcon += '-d';
                            }
                        }

                        gfxWeatherIconF[i].className = weatherIcon;
                    }
                }
            };

            xmlHttpForecast.send();
        }

        function bindEvents() {
            document.addEventListener('timetick', function() {
            	updateWatch();
            });

            // add eventListener to update the screen immediately when the device wakes up.
            document.addEventListener('visibilitychange', function() {
                if (!document.hidden) {
                    updateWatch();
                    updateBatteryState();
                }
            });

            // add event listeners to update watch screen when the time zone is changed.
            tizen.time.setTimezoneChangeListener(function() {
                updateWatch();
            });

            battery.addEventListener('chargingchange', updateBatteryState);
            battery.addEventListener('chargingtimechange', updateBatteryState);
            battery.addEventListener('dischargingtimechange', updateBatteryState);
            battery.addEventListener('levelchange', updateBatteryState);
        }

        bindEvents();
        updateWeather();
    }


    function init() {
        var tizenGlobal;

        if (typeof tizen === 'undefined') {
            if (window.parent) {
                tizenGlobal = window.parent.tizen;
            }
            else {
                throw new Error('global tizen not found, no parent frame to load it from');
            }
        }
        else {
            tizenGlobal = tizen;
        }

        var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
        if (typeof battery === 'undefined') {
            if (window.parent) {
                battery = window.parent.battery;
            }
            else {
                throw new Error('global battery not found, no parent frame to load it from');
            }
        }

        runApp(tizenGlobal, battery);
    }

    window.onload = init();
}());
