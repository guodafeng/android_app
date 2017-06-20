/*
 *
 *
 *
 *
 * */
$(function() {
    // Add format method for String object,"aa{1},bb{0}".format("x","y") will return "aay,bbx"
    // First, checks if it isn't implemented yet.
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }

    var signFun = function() {
        var WORKTIME = 9 * 60 * 60 * 1000;
        var MONTH = ["一","二","三","四","五","六","七","八","九","十","十一","十二"];
        var dt = new Date();
        //save and load data to localStorage
        var historyRec = {
                in:[],
                out:[]
        };
        function loadrecord(month, totalDay){
            var historyKey = "history_" + month;
            if (localStorage[historyKey]){
                historyRec = JSON.parse(localStorage[historyKey]);
            }
            else{
                historyRec.in = [];
                historyRec.out = [];
                for (var i=0;i<totalDay;i++){
                   historyRec.in.push("");
                   historyRec.out.push("");
                }
            }
        }
        function saverecord(month){
            localStorage["history_" + month] = JSON.stringify(historyRec);
        }
        /////////////////////////


        var $dateTable = $("#js-signin-table"),
            $currentDate = $(".current-date"),
            $signBtn = $("#js-sign"),
            myDate = new Date();
        $currentDate.text(myDate.getFullYear() + '年' + parseInt(myDate.getMonth() + 1) + '月' + myDate.getDate() + '日');

        var firstDayPos = 0;
        var totalDay = 0;
        var curMonth = myDate.getMonth();

        changeMonth(curMonth);

        $dateTable.on("click", "td", onDayChange);

        $signBtn.on("click", signNow); //签到

        $("#prev").on("click", prevMonth);
        $("#next").on("click", nextMonth);

        function changeMonth(mon){
            curMonth = mon;
            var monthFirst = new Date(myDate.getFullYear(), mon, 1).getDay();
            firstDayPos = (monthFirst + 6) % 7;
            var d = new Date(myDate.getFullYear(), parseInt(mon + 1), 0);
            totalDay = d.getDate(); //获取当前月的天数
            $("#month").text("我的{0}月签到".format(MONTH[mon]));
            createCalendar();
            loadrecord(curMonth, totalDay);
            //classify signed day
            classifySignedDay();

            var selDay = 1;
            if (myDate.getMonth() == curMonth){
                selDay = myDate.getDate();
            }
            signtimeShow(selDay);
            classifySelDay(selDay);

        }

        function createCalendar() {
            //using table to create month calendar
            var weekArray = ['一', '二', '三', '四', '五', '六', '日'];
            var _html = "";
            _html += '<tr>';
            for (var i = 0; i < 7; i++) {
                _html += '<th>' + weekArray[i] + '</th>';
            }
            _html += '</tr>';

            var displayDay = 0;
            while (displayDay < totalDay) {
                _html += '<tr>';
                for (var i = 0; i < 7; i++) {
                    var content = '  ';
                    var id = '>';
                    if (displayDay > 0 || i >= firstDayPos) {
                        content = parseInt(++displayDay);
                        id = ' value=' + content + '>';
                    }
                    _html += '<td' + id + content + '</td>';

                    if (displayDay >= totalDay) {
                        break;
                    }
                }
                _html += '</tr>';
            }
            $dateTable.html(_html);
            //
        }

        function classifySelDay(dt){
            $(".blink").removeClass("blink");
            $("td[value=" + dt +"]").addClass("blink");
        }

        function prevMonth(){
            curMonth -= 1;
            if (curMonth < 0){
                curMonth = 11;
            }
            changeMonth(curMonth);
        }
        function nextMonth(){
            curMonth +=1;
            if (curMonth > 11){
                curMonth = 0;
            }
            changeMonth(curMonth);
        }

        function classifySignedDay(){
            var $td = $dateTable.find('td');
            for (var i = 0;i < totalDay; i++){
                var outTime = Date.parse(historyRec.out[i]);
                var inTime = Date.parse(historyRec.in[i]);
                if (!isNaN(inTime)){
                    $td.eq(i + firstDayPos).addClass("signin");
                    if (!isNaN(outTime) && (outTime-inTime)>WORKTIME){
                        $td.eq(i+firstDayPos).addClass("fulltime");
                    }
                }
            }
        }
        function onDayChange(){
            dt = parseInt($(this).attr("value"));

            classifySelDay(dt);
            signtimeShow(dt);
        }
        function signtimeShow(dt){
            var intime = "",outtime="";
            if (dt > 0){
                intime = historyRec.in[dt-1];
                outtime = historyRec.out[dt-1];
            }
            var innerHtml = "<tr><th>上班时间：</th><td>{0}</td></tr><tr><th>下班时间：</th><td>{1}</td></tr>".format(intime, outtime);
            $("#js-signtime").html(innerHtml);
        }

        function signNow(){
            var curT = new Date();
            changeMonth(curT.getMonth());
            if (historyRec.in[curT.getDate()-1] == ""){
                historyRec.in[curT.getDate()-1] = curT.toLocaleString();
                historyRec.out[curT.getDate()-1] = curT.toLocaleString();
            }

            var outTime = new Date(historyRec.out[curT.getDate()-1]);
            var inTime = new Date(historyRec.in[curT.getDate()-1]);
            if (curT > outTime){
                historyRec.out[curT.getDate()-1] = curT.toLocaleString();
            }

            //update sign status
            var $td = $dateTable.find('td');
            $td.eq(curT.getDate() + firstDayPos - 1).addClass("signin");
            $signBtn.addClass('signin');

            if (outTime -inTime > WORKTIME){
                $signBtn.addClass('fulltime');
                $td.eq(curT.getDate() + firstDayPos - 1).addClass("fulltime");
            }
            signtimeShow(curT.getDate());
            saverecord(curT.getMonth());
        }

    }();

})
