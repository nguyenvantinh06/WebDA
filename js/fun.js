window.pageTrafficLights = function ()
{
    var TrafficLight = function ()
    {
        var colors = {
            "red": { bg: "bg-danger", color: "text-danger", border: "border-danger" },
            "yellow": { bg: "bg-warning", color: "text-warning", border: "border-warning" },
            "green": { bg: "bg-success", color: "text-success", border: "border-success" }
        };

        var state = {};

        this.redViewer = null;
        this.yellowViewer = null;
        this.greenViewer = null;
        this.counterViewer = null;

        var timer = new Core.Timer({ interval: 1000 });

        this.start = function(redSeconds, yellowSeconds, greenSeconds)
        {
            timer.stop();
            clearState.bind(this)();
            this.counterViewer.html(0);
            state = {};

            createState.bind(this)("red", redSeconds, 0);
            createState.bind(this)("yellow", yellowSeconds, redSeconds);
            createState.bind(this)("green", greenSeconds, redSeconds + yellowSeconds);

            var stateIndex = 1;
            state[redSeconds + yellowSeconds + greenSeconds].afterRun = () => stateIndex = 1;

            var $this = this;
            timer.setOption(function (option)
            {   
                option.onTick = function ()
                {
                    stateColor = state[stateIndex];
                    clearState.bind($this)();
                    stateColor.run();
                    stateIndex++;
                    stateColor.afterRun();
                };                
            });
            timer.start();
        }

        var createState = function (colorName, seconds, start)
        {            
            for (var i = 1; i <= seconds; i++)
            {
                stateColor = new TrafficLight.StateColor(colors[colorName], this[colorName + "Viewer"], this.counterViewer, seconds + start, start + i);
                state[stateColor.stateIndex = (start + i)] = stateColor;
            }
        }

        var clearState = function ()
        {
            var arr = Object.keys(colors);
            for (var i = 0; i < arr.length; i++)
            {
                var colorName = arr[i];
                var color = colors[colorName];
                this[colorName + "Viewer"].removeClass(color.bg);
                this.counterViewer.removeClass(color.color).removeClass(color.border);
            }
        }
    }
    TrafficLight.StateColor = function (color, lightElement, counterViewer, maxSeconds, stateIndex)
    {
        this.run = function ()
        {
            lightElement.addClass(color.bg);
            counterViewer.addClass(color.color).addClass(color.border).html(maxSeconds - stateIndex);
        }
        this.afterRun = function () { };
    }

    var content = $("article");
    var trafficLight = new TrafficLight();
    trafficLight.redViewer = content.find(".tl1");
    trafficLight.yellowViewer = content.find(".tl2");
    trafficLight.greenViewer = content.find(".tl3");
    trafficLight.counterViewer = content.find(".tl4");

    var invalidChars = ["-", "+", "e"];
    var inputSeconds = content.find(".input-seconds");
    inputSeconds.each(function () { this.addEventListener("keydown", function (e) { if (invalidChars.includes(e.key)) { e.preventDefault(); } }); });

    var btn = content.find("[data-btn=Start]");
    btn.click(function ()
    {
        trafficLight.start(parseInt(content.find("#input_1").val()),
            parseInt(content.find("#input_2").val()),
            parseInt(content.find("#input_3").val()));
    });
}