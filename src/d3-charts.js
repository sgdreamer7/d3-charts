/*jshint globalstrict: true, undef: true, unused: true*/
/*globals	d3,	document, moment, numeral*/
"use strict";


function getTextWidth(text, font) {
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
	var context = canvas.getContext("2d");
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
}
function extend(Child, Parent) {
	var F = function() {};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}

var toStr = Object.prototype.toString;

function funcName(f) {
	return f.name ? f.name : /^\s*function\s*([^\(]*)/im.exec(f.toString())[1];
}

function ctorName(obj) {
	var strName = toStr.call(obj).slice(8, -1);
	if (strName === 'Object' && obj.constructor) {
		return funcName(obj.constructor);
	}
	return strName;
}

function typeName(val) {
	var type;
	if (val === null) {
		return 'null';
	}
	type = typeof(val);
	if (type === 'object') {
		return ctorName(val);
	}
	return type;
}
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function zoomRange(v1, v2, z1, z2) {
	var length = v2 - v1;
	return {
		v1: length * z1 + v1,
		v2: length * z2 + v1
	};
}

function sortFun(a, b) {
	return a[0] - b[0];
}
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function PlotSerieTypeEnum() {
	this.LineType = 0;
	this.BarType = 1;
	this.DifferenceType = 2;
	this.StepType = 3;
	this.VLineType = 4;
	this.VZoneType = 5;
	this.SectionType = 6;
	this.HLineType = 7;
	this.HZoneType = 8;
	this.TrendlineType = 9;
	this.LeftValueMarkType = 10;
	this.RightValueMarkType = 11;
	this.SymbolType = 12;
	this.ProfileType = 13;
	this.OHLCVType = 14;
	this.PriceVolumeType = 15;
	this.GraphObjectType = 16;
}
var PlotSerieType = new PlotSerieTypeEnum();
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function PlotSerieStyleEnum() {
	this.SolidLineStyle = "0";
	this.GridLineStyle = "2,2";
	this.DottedLineStyle = "4,8";
	this.DashedLineStyle = "10,10";
	this.AxisLineStyle = "30,10,4,10";
	this.Axis2LineStyle = "30,10,4,10,4,10";
}
var PlotSerieStyle = new PlotSerieStyleEnum();
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function Timestamp() {
	this.year = 2000;
	this.month = 1;
	this.day = 1;
	this.hour = 0;
	this.minute = 0;
	this.second = 0;
	var m = moment().clone().tz("Europe/Berlin");
	this.year = m.year();
	this.month = m.month() + 1;
	this.day = m.day();
	this.hour = m.hour();
	this.minute = m.minute();
	this.second = m.second();
	if (arguments.length == 6) {
		if (
			(typeName(arguments[0]) == 'number') &&
			(typeName(arguments[1]) == 'number') &&
			(typeName(arguments[2]) == 'number') &&
			(typeName(arguments[3]) == 'number') &&
			(typeName(arguments[4]) == 'number') &&
			(typeName(arguments[5]) == 'number')
		) {
			this.year = Math.round(arguments[0]);
			this.month = Math.round(arguments[1]);
			this.day = Math.round(arguments[2]);
			this.hour = Math.round(arguments[3]);
			this.minute = Math.round(arguments[4]);
			this.second = Math.round(arguments[5]);
		}
	} else if (arguments.length == 1) {
		if (typeName(arguments[0]) == 'number') {
			m = moment.tz(Math.round(arguments[0]), "Europe/Berlin");
			this.year = m.year();
			this.month = m.month() + 1;
			this.day = m.date();
			this.hour = m.hour();
			this.minute = m.minute();
			this.second = m.second();
		} else if (typeName(arguments[0]) == 'OtpErlangTuple') {
			if (typeName(arguments[0].elementAt(0)) == 'OtpErlangAtom') {
				if (arguments[0].elementAt(0).atomValue() == 'ts') {
					try {
						if (
							(typeName(arguments[0].elementAt(1)) == 'OtpErlangLong') &&
							(typeName(arguments[0].elementAt(2)) == 'OtpErlangLong') &&
							(typeName(arguments[0].elementAt(3)) == 'OtpErlangLong') &&
							(typeName(arguments[0].elementAt(4)) == 'OtpErlangLong') &&
							(typeName(arguments[0].elementAt(5)) == 'OtpErlangLong') &&
							(typeName(arguments[0].elementAt(6)) == 'OtpErlangLong')
						) {
							this.year = arguments[0].elementAt(1).longValue();
							this.month = arguments[0].elementAt(2).longValue();
							this.day = arguments[0].elementAt(3).longValue();
							this.hour = arguments[0].elementAt(4).longValue();
							this.minute = arguments[0].elementAt(5).longValue();
							this.second = arguments[0].elementAt(6).longValue();
						}
					} catch (e) {
						throw new Error('Illegal input tuple');
					}
				}
			}
		}
	} else if (arguments.length == 2) {
		if (
			(typeName(arguments[0]) == 'number') &&
			(typeName(arguments[1]) == 'string')
		) {
			m = moment.tz(Math.round(arguments[0]), arguments[1]);
			this.year = m.year();
			this.month = m.month() + 1;
			this.day = m.date();
			this.hour = m.hour();
			this.minute = m.minute();
			this.second = m.second();
		}
	}
}
Timestamp.prototype.getDateByTimezone = function(date, tzOffset) {
	var localTimezone = -date.getTimezoneOffset() / 60;
	var localTime = date.getTime();
	var tzTime = localTime - (localTimezone - tzOffset) * 3600000;
	return new Date(tzTime);
};
Timestamp.prototype.firstMondayAfter = function(ts) {
	var tmp = ts.clone();
	tmp.setHour(0);
	tmp.setMinute(0);
	tmp.setSecond(0);
	var dow = tmp.getDayOfWeek();
	if (dow === 0) {
		tmp.addSeconds(86400);
	} else if (dow == 1) {} else {
		tmp.addSeconds(86400 * (7 - dow + 1));
	}
	return tmp.toTimezone("GMT").getMilliseconds();
};
Timestamp.prototype.getYear = function() {
	return this.year;
};
Timestamp.prototype.getMonth = function() {
	return this.month;
};
Timestamp.prototype.getDay = function() {
	return this.day;
};
Timestamp.prototype.getHour = function() {
	return this.hour;
};
Timestamp.prototype.getMinute = function() {
	return this.minute;
};
Timestamp.prototype.getSecond = function() {
	return this.second;
};
Timestamp.prototype.setYear = function(year) {
	this.year = year;
};
Timestamp.prototype.setMonth = function(month) {
	this.month = month;
};
Timestamp.prototype.setDay = function(day) {
	this.day = day;
};
Timestamp.prototype.setHour = function(hour) {
	this.hour = hour;
};
Timestamp.prototype.setMinute = function(minute) {
	this.minute = minute;
};
Timestamp.prototype.setSecond = function(second) {
	this.second = second;
};
Timestamp.prototype.getMilliseconds = function() {
	var m = moment.tz({
			year: this.year,
			month: this.month - 1,
			date: this.day,
			hour: this.hour,
			minute: this.minute,
			second: this.second
		},
		"Europe/Berlin"
	);
	return m.toDate().getTime();
};
Timestamp.prototype.toTimezone = function(timezone) {
	return new Timestamp(this.getMilliseconds(), timezone);
};
Timestamp.prototype.toString = function() {
	return this.leftPad(this.day, 2) + '.' +
		this.leftPad(this.month, 2) + '.' +
		this.leftPad(this.year, 4) + ' ' +
		this.leftPad(this.hour, 2) + ':' +
		this.leftPad(this.minute, 2) + ':' +
		this.leftPad(this.second, 2);
};
Timestamp.prototype.compareTo = function(o) {
	if (typeName(o) == 'Timestamp') {
		return this.getMilliseconds() > o.getMilliseconds() ? 1 : this.getMilliseconds() < o.getMilliseconds() ? -1 : 0;
	} else {
		throw new Error('Object of type ' + typeName(o) + ' is not of type Timestamp');
	}
};
Timestamp.prototype.leftPad = function(number, targetLength) {
	var output = number + '';
	while (output.length < targetLength) {
		output = '0' + output;
	}
	return output;
};
Timestamp.prototype.addSeconds = function(seconds) {
	var tmp = new Timestamp(this.getMilliseconds() + seconds * 1000);
	this.setDay(tmp.getDay());
	this.setMonth(tmp.getMonth());
	this.setYear(tmp.getYear());
	this.setHour(tmp.getHour());
	this.setMinute(tmp.getMinute());
	this.setSecond(tmp.getSecond());
};
Timestamp.prototype.clone = function() {
	var tmp = new Timestamp(this.year, this.month, this.day, this.hour, this.minute, this.second);
	return tmp;
};
Timestamp.prototype.getDayOfWeek = function() {
	var m = moment.tz({
			year: this.year,
			month: this.month - 1,
			date: this.day,
			hour: this.hour,
			minute: this.minute,
			second: this.second
		},
		"Europe/Berlin"
	);
	return m.day();
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartBackground() {
	this.left = arguments[0].left ? arguments[0].left : 0;
	this.top = arguments[0].top ? arguments[0].top : 0;
	this.width = arguments[0].width ? arguments[0].width : 1;
	this.height = arguments[0].height ? arguments[0].height : 1;
	this.stroke = arguments[0].stroke ? arguments[0].stroke : "#000000";
	this.strokeWidth = arguments[0].strokeWidth ? arguments[0].strokeWidth : "1.0";
	this.strokeDashArray = arguments[0].strokeDashArray ? arguments[0].strokeDashArray : PlotSerieStyle.SolidLineStyle;
	this.fill = arguments[0].fill ? arguments[0].fill : "#ffffff";
	this.opacity = arguments[0].opacity ? arguments[0].opacity : 1.0;
	this.rootId = arguments[0].rootId ? arguments[0].rootId : "D3Chart";
	this.id = this.rootId + "Background";
	if (d3.select("#" + this.id)[0][0] === null) {
		this.element = d3.select("#" + this.rootId)
			.append("rect")
			.attr("id", this.id)
			.attr("x", this.left)
			.attr("width", this.width)
			.attr("y", this.top)
			.attr("height", this.height)
			.style("stroke", this.stroke)
			.style("stroke-width", this.strokeWidth)
			.style("stroke-dasharray", this.strokeDashArray)
			.style("fill", this.fill)
			.style("opacity", this.opacity);
	}
}
D3ChartBackground.getId = function() {
	return this.id;
};
D3ChartBackground.prototype.dimension = function(left, top, width, height) {
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.element
		.attr("x", this.left)
		.attr("width", this.width)
		.attr("y", this.top)
		.attr("height", this.height);
	return this;
};
D3ChartBackground.prototype.setStroke = function(stroke) {
	this.stroke = stroke;
	this.element
		.style("stroke", this.stroke);
	return this;
};
D3ChartBackground.prototype.setStrokeWidth = function(strokeWidth) {
	this.strokeWidth = strokeWidth;
	this.element
		.style("stroke-width", this.strokeWidth);
	return this;
};
D3ChartBackground.prototype.setStrokeDashArray = function(strokeDashArray) {
	this.strokeDashArray = strokeDashArray;
	this.element
		.style("stroke-dasharray", this.strokeDashArray);
	return this;
};
D3ChartBackground.prototype.setFill = function(fill) {
	this.fill = fill;
	this.element
		.style("fill", this.fill);
	return this;
};
D3ChartBackground.prototype.setOpacity = function(opacity) {
	this.opacity = opacity;
	this.element
		.style("opacity", this.opacity);
	return this;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartScrollButton() {
	this.init("ScrollButton", arguments[0]);
}
D3ChartScrollButton.prototype.init = function(type, arg) {
	this.left = arguments[0].left ? arg.left : 0;
	this.top = arg.top ? arg.top : 0;
	this.width = arg.width ? arg.width : 1;
	this.height = arg.height ? arg.height : 1;
	this.stroke = arg.stroke ? arg.stroke : "#000000";
	this.strokeWidth = arg.strokeWidth ? arg.strokeWidth : "1.0";
	this.strokeDashArray = arg.strokeDashArray ? arg.strokeDashArray : PlotSerieStyle.SolidLineStyle;
	this.fill = arg.fill ? arg.fill : "#ffffff";
	this.opacity = arg.opacity ? arg.opacity : 1.0;
	this.rootId = arg.rootId ? arg.rootId : "D3Chart";
	this.id = this.rootId + type;
	if (d3.select("#" + this.id)[0][0] === null) {
		this.element = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.id)
			.attr("x", this.left)
			.attr("width", this.width)
			.attr("y", this.top)
			.attr("height", this.height)
			.style("stroke", this.stroke)
			.style("stroke-width", this.strokeWidth)
			.style("stroke-dasharray", this.strokeDashArray)
			.style("fill", this.fill)
			.style("opacity", this.opacity);
	}
	this.update();
};
D3ChartScrollButton.prototype.getId = function() {
	return this.id;
};
D3ChartScrollButton.prototype.dimension = function(left, top, width, height) {
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.update();
	return this;
};
D3ChartScrollButton.prototype.setStroke = function(stroke) {
	this.stroke = stroke;
	this.element
		.style("stroke", this.stroke);
	return this;
};
D3ChartScrollButton.prototype.setStrokeWidth = function(strokeWidth) {
	this.strokeWidth = strokeWidth;
	this.element
		.style("stroke-width", this.strokeWidth);
	return this;
};
D3ChartScrollButton.prototype.setStrokeDashArray = function(strokeDashArray) {
	this.strokeDashArray = strokeDashArray;
	this.element
		.style("stroke-dasharray", this.strokeDashArray);
	return this;
};
D3ChartScrollButton.prototype.setFill = function(fill) {
	this.fill = fill;
	this.element
		.style("fill", this.fill);
	return this;
};
D3ChartScrollButton.prototype.setOpacity = function(opacity) {
	this.opacity = opacity;
	this.element
		.style("opacity", this.opacity);
	return this;
};
D3ChartScrollButton.prototype.update = function() {
	this.element[0][0].innerHTML = "";
	if ((this.width > 0) && (this.height > 0)) {
		this.element
			.append("rect")
			.attr("x", this.left)
			.attr("width", this.width)
			.attr("y", this.top)
			.attr("height", this.height);
		this.element
			.append("path")
			.attr("d",
				"M" + (this.left + this.width / 4) + "," + (this.top + this.height / 2) +
				"L" + (this.left + this.width * 3 / 4) + "," + (this.top + this.height / 2) +
				"M" + (this.left + this.width / 2) + "," + (this.top + this.height / 4) +
				"L" + (this.left + this.width * 3 / 4) + "," + (this.top + this.height / 2) +
				"L" + (this.left + this.width / 2) + "," + (this.top + this.height * 3 / 4)
			);
	}
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartScrollButtonRight() {
	this.init("ScrollButtonRight", arguments[0]);
}

extend(D3ChartScrollButtonRight, D3ChartScrollButton);

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartScrollButtonLeft() {
	this.init("ScrollButtonLeft", arguments[0]);
}

extend(D3ChartScrollButtonLeft, D3ChartScrollButton);

D3ChartScrollButtonLeft.prototype.update = function() {
	this.element[0][0].innerHTML = "";
	if ((this.width > 0) && (this.height > 0)) {
		this.element
			.append("rect")
			.attr("x", this.left)
			.attr("width", this.width)
			.attr("y", this.top)
			.attr("height", this.height);
		this.element
			.append("path")
			.attr("d",
				"M" + (this.left + this.width * 3 / 4) + "," + (this.top + this.height / 2) +
				"L" + (this.left + this.width / 4) + "," + (this.top + this.height / 2) +
				"M" + (this.left + this.width / 2) + "," + (this.top + this.height / 4) +
				"L" + (this.left + this.width / 4) + "," + (this.top + this.height / 2) +
				"L" + (this.left + this.width / 2) + "," + (this.top + this.height * 3 / 4)
			);
	}
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartGrid() {
	this.left = arguments[0].left ? arguments[0].left : 0;
	this.top = arguments[0].top ? arguments[0].top : 0;
	this.width = arguments[0].width ? arguments[0].width : 1;
	this.height = arguments[0].height ? arguments[0].height : 1;
	this.stroke = arguments[0].stroke ? arguments[0].stroke : "#000000";
	this.strokeWidth = arguments[0].strokeWidth ? arguments[0].strokeWidth : "0.5";
	this.strokeDashArray = arguments[0].strokeDashArray ? arguments[0].strokeDashArray : PlotSerieStyle.GridLineStyle;
	this.fill = arguments[0].fill ? arguments[0].fill : "#e0e0e0";
	this.opacity = arguments[0].opacity ? arguments[0].opacity : 1.0;
	this.xStep = arguments[0].xStep ? arguments[0].xStep : 100;
	this.yStep = arguments[0].yStep ? arguments[0].yStep : 50;
	this.xOffset = arguments[0].xOffset ? arguments[0].xOffset : 0;
	this.yOffset = arguments[0].yOffset ? arguments[0].yOffset : 0;
	this.yInverted = arguments[0].yInverted ? arguments[0].yInverted : false;
	this.rootId = arguments[0].rootId ? arguments[0].rootId : "D3Chart";
	this.id = this.rootId + "Grid";
	if (d3.select("#" + this.id)[0][0] === null) {
		this.element = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.id)
			.style("stroke", this.stroke)
			.style("stroke-width", this.strokeWidth)
			.style("stroke-dasharray", this.strokeDashArray)
			.style("fill", this.fill)
			.style("opacity", this.opacity);
	}
	this.update();
}
D3ChartGrid.prototype.update = function() {
	var i;
	this.element[0][0].innerHTML = "";
	if ((this.width > 0) && (this.height > 0)) {
		if (this.yStep > 0) {
			var ySteps = Math.floor(this.height / this.yStep) + 1;
			for (i = 0; i <= ySteps; i++) {
				if ((i % 2) === 0) {
					var yCoord, yCoord2;
					if (this.yInverted) {
						yCoord = this.top + this.yOffset + i * this.yStep;
						if ((yCoord >= this.top) && (yCoord <= this.top + this.height)) {
							yCoord2 = yCoord + this.yStep;
							if (yCoord2 >= this.top + this.height) {
								yCoord2 = this.top + this.height;
							}
							this.element
								.append("rect")
								.attr("x", this.left)
								.attr("width", this.width)
								.attr("y", yCoord)
								.attr("height", Math.max(Math.abs(yCoord2 - yCoord), 0))
								.style("stroke-width", 0)
								.style("stroke-dasharray", "")
								.style("opacity", this.opacity);

						}
					} else {
						yCoord2 = this.top + this.height - this.yOffset - i * this.yStep;
						if ((yCoord2 >= this.top) && (yCoord2 <= this.top + this.height)) {
							yCoord = yCoord2 - this.yStep;
							if (yCoord < this.top) {
								yCoord = this.top;
							}
							this.element
								.append("rect")
								.attr("x", this.left)
								.attr("width", this.width)
								.attr("y", yCoord)
								.attr("height", Math.max(Math.abs(yCoord2 - yCoord), 0))
								.style("stroke-width", 0)
								.style("stroke-dasharray", "")
								.style("opacity", this.opacity);
						}
					}

				}
			}
		}
		if (this.xStep > 0) {
			var xSteps = Math.floor(this.width / this.xStep) + 1;
			for (i = 0; i < xSteps; i++) {
				var xCoord = this.left + this.xOffset + i * this.xStep;
				if ((xCoord >= this.left) && (xCoord <= (this.left + this.width))) {
					this.element
						.append("path")
						.attr("d", "M" + (xCoord) + "," + (this.top + this.height) + "L" + (xCoord) + "," + (this.top));
				}
			}
		}
		this.element
			.append("rect")
			.attr("x", this.left)
			.attr("width", this.width)
			.attr("y", this.top)
			.attr("height", this.height)
			.style("stroke-width", this.strokeWidth)
			.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
			.style("fill-opacity", 0.0)
			.style("stroke-opacity", this.opacity);
	}
};
D3ChartGrid.prototype.allDimension = function(left, top, width, height, xStep, yStep, xOffset, yOffset, inverted) {
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.xStep = xStep;
	this.yStep = yStep;
	this.xOffset = xOffset;
	this.yOffset = yOffset;
	this.yInverted = inverted;
	this.update();
	return this;
};
D3ChartGrid.prototype.dimension = function(left, top, width, height) {
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.update();
	return this;
};
D3ChartGrid.prototype.setStroke = function(stroke) {
	this.stroke = stroke;
	this.element
		.style("stroke", this.stroke);
	return this;
};
D3ChartGrid.prototype.setStrokeWidth = function(strokeWidth) {
	this.strokeWidth = strokeWidth;
	this.element
		.style("stroke-width", this.strokeWidth);
	return this;
};
D3ChartGrid.prototype.setStrokeDashArray = function(strokeDashArray) {
	this.strokeDashArray = strokeDashArray;
	this.element
		.style("stroke-dasharray", this.strokeDashArray);
	return this;
};
D3ChartGrid.prototype.setFill = function(fill) {
	this.fill = fill;
	this.element
		.style("fill", this.fill);
	return this;
};
D3ChartGrid.prototype.setOpacity = function(opacity) {
	this.opacity = opacity;
	this.element
		.style("opacity", this.opacity);
	return this;
};
D3ChartGrid.prototype.setXStep = function(xStep) {
	this.xStep = xStep;
	this.update();
	return this;
};
D3ChartGrid.prototype.setYStep = function(yStep) {
	this.yStep = yStep;
	this.update();
	return this;
};
D3ChartGrid.prototype.setXOffset = function(xOffset) {
	this.xOffset = xOffset;
	this.update();
	return this;
};
D3ChartGrid.prototype.setYOffset = function(yOffset) {
	this.yOffset = yOffset;
	this.update();
	return this;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function Segment(millisecond, timeline) {
	this.timeline = timeline;
	this.segmentNumber = this.calculateSegmentNumber(millisecond);
	this.segmentStart = this.timeline.startTime + this.segmentNumber * this.timeline.segmentSize;
	this.segmentEnd = this.segmentStart + this.timeline.segmentSize - 1;
	this.millisecond = millisecond;
}
Segment.prototype.calculateSegmentNumber = function(millis) {
	if (millis >= this.timeline.startTime) {
		return Math.floor((millis - this.timeline.startTime) / this.timeline.segmentSize);
	} else {
		return Math.floor(((millis - this.timeline.startTime) / this.timeline.segmentSize)) - 1;
	}
};
Segment.prototype.inIncludeSegments = function() {
	if (this.getSegmentNumberRelativeToGroup() < this.timeline.segmentsIncluded) {
		return true;
	} else {
		return false;
	}
};
Segment.prototype.inExcludeSegments = function() {
	return this.getSegmentNumberRelativeToGroup() >= this.timeline.segmentsIncluded;
};
Segment.prototype.getSegmentNumberRelativeToGroup = function() {
	var p = (this.segmentNumber % this.timeline.groupSegmentCount);
	if (p < 0) {
		p += this.timeline.groupSegmentCount;
	}
	return p;
};
Segment.prototype.inc = function() {
	var n = 0;
	if (arguments.length === 0) {
		n = 1;
	} else if (arguments.length == 1) {
		n = arguments[0];
	}
	this.segmentNumber += n;
	var m = n * this.timeline.segmentSize;
	this.segmentStart += m;
	this.segmentEnd += m;
	this.millisecond += m;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function SegmentedTimeline(segmentSize, segmentsIncluded, segmentsExcluded) {
	this.DAY_SEGMENT_SIZE = 24 * 60 * 60 * 1000;
	this.HOUR_SEGMENT_SIZE = 60 * 60 * 1000;
	this.FIFTEEN_MINUTE_SEGMENT_SIZE = 15 * 60 * 1000;
	this.MINUTE_SEGMENT_SIZE = 60 * 1000;
	this.segmentSize = segmentSize;
	this.segmentsIncluded = segmentsIncluded;
	this.segmentsExcluded = segmentsExcluded;

	this.groupSegmentCount = this.segmentsIncluded + this.segmentsExcluded;
	this.segmentsIncludedSize = this.segmentsIncluded * this.segmentSize;
	this.segmentsExcludedSize = this.segmentsExcluded * this.segmentSize;
	this.segmentsGroupSize = this.segmentsIncludedSize + this.segmentsExcludedSize;
	var ts = new Timestamp();
	this.startTime = ts.firstMondayAfter(new Timestamp(1900, 1, 1, 0, 0, 0));
}
SegmentedTimeline.prototype.setStartTime = function() {
	if (arguments.length == 1) {
		this.startTime = arguments[0];
		return this.startTime;
	}
	return null;
};
SegmentedTimeline.prototype.toTimelineValue = function(millisecond) {
	var result;
	var rawMilliseconds = millisecond - this.startTime;
	var groupMilliseconds = rawMilliseconds % this.segmentsGroupSize;
	var groupIndex = Math.floor(rawMilliseconds / this.segmentsGroupSize);
	if (groupMilliseconds >= this.segmentsIncludedSize) {
		result = this.toTimelineValue(this.startTime + this.segmentsGroupSize * (groupIndex + 1));
	} else {
		var shiftedSegmentedValue = millisecond - this.startTime;
		var x = shiftedSegmentedValue % this.segmentsGroupSize;
		var y = Math.floor(shiftedSegmentedValue / this.segmentsGroupSize);
		if (x < this.segmentsIncludedSize) {
			result = this.segmentsIncludedSize * y + x;
		} else {
			result = this.segmentsIncludedSize * (y + 1);
		}
	}
	return result;
};
SegmentedTimeline.prototype.containsDomainValue = function(millisecond) {
	var segment = new Segment(millisecond, this);
	return segment.inIncludeSegments();
};
SegmentedTimeline.prototype.toMillisecond = function(timelineValue) {
	var result = new Segment(this.startTime + timelineValue + (timelineValue / this.segmentsIncludedSize) * this.segmentsExcludedSize, this);
	var lastIndex = this.startTime;
	while (lastIndex <= result.segmentStart) {
		lastIndex = result.segmentStart;
		while (result.inExcludeSegments()) {
			result.inc();
			lastIndex += this.segmentSize;
		}
		lastIndex++;
	}
	return result.millisecond;
};
var segmentedTimeline = new SegmentedTimeline(24 * 60 * 60 * 1000, 7, 0);
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function DateRange() {
	this.lower = 0;
	this.upper = 1000;
	if (arguments.length == 2) {
		if ((typeName(arguments[0]) == "number") && (typeName(arguments[1]) == "number")) {
			this.lower = Math.floor(arguments[0] / 1000) * 1000;
			this.upper = Math.floor(arguments[1] / 1000) * 1000;
			if (this.lower == this.upper) {
				this.upper = this.lower + 1000;
			}
		}
	}
}
DateRange.prototype.getLowerMillis = function() {
	return this.lower;
};
DateRange.prototype.getUpperMillis = function() {
	return this.upper;
};
DateRange.prototype.contains = function(value) {
	return (value >= this.lower && value <= this.upper);
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function NumberRange() {
	this.lower = 0;
	this.upper = 1;
	if (arguments.length == 2) {
		if ((typeName(arguments[0]) == "number") && (typeName(arguments[1]) == "number")) {
			this.lower = arguments[0];
			this.upper = arguments[1];
			if (this.lower == this.upper) {
				this.upper = this.lower + 1.0;
			}
		}
	}
}
NumberRange.prototype.getLowerBound = function() {
	return this.lower;
};
NumberRange.prototype.getUpperBound = function() {
	return this.upper;
};
NumberRange.prototype.getLength = function() {
	return this.upper - this.lower;
};
NumberRange.prototype.getCentralValue = function() {
	return this.lower / 2.0 + this.upper / 2.0;
};
NumberRange.prototype.contains = function(value) {
	return (value >= this.lower && value <= this.upper);
};
NumberRange.prototype.expand = function(lowerMargin, upperMargin) {
	var length = this.getLength();
	var lower = this.getLowerBound() - length * lowerMargin;
	var upper = this.getUpperBound() + length * upperMargin;
	if (lower > upper) {
		lower = lower / 2.0 + upper / 2.0;
		upper = lower;
	}
	return new NumberRange(lower, upper);
};
NumberRange.prototype.equals = function(obj) {
	if (typeName(obj) != "NumberRange") {
		return false;
	}
	var range = obj;
	if (this.lower != range.lower) {
		return false;
	}
	if (this.upper != range.upper) {
		return false;
	}
	return true;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function DateTickUnitType(name) {
	this.name = name;
}
DateTickUnitType.prototype.toString = function() {
	return this.name;
};
DateTickUnitType.prototype.equals = function(obj) {
	if (this == obj) {
		return true;
	}
	if (typeName(obj) != "DateTickUnitType") {
		return false;
	}
	var t = obj;
	if (this.name != t.toString()) {
		return false;
	}
	return true;
};
var dateTickUnitType = new DateTickUnitType("");
dateTickUnitType.YEAR = new DateTickUnitType("YEAR");
dateTickUnitType.MONTH = new DateTickUnitType("MONTH");
dateTickUnitType.DAY = new DateTickUnitType("DAY");
dateTickUnitType.HOUR = new DateTickUnitType("HOUR");
dateTickUnitType.MINUTE = new DateTickUnitType("MINUTE");
dateTickUnitType.SECOND = new DateTickUnitType("SECOND");
dateTickUnitType.MILLISECOND = new DateTickUnitType("MILLISECOND");
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function DateTickUnit() {
	var unitType, multiple, rollUnitType, rollMultiple, formatter;
	if (arguments.length == 5) {
		unitType = arguments[0];
		multiple = arguments[1];
		rollUnitType = arguments[2];
		rollMultiple = arguments[3];
		formatter = arguments[4];
	} else if (arguments.length == 3) {
		unitType = arguments[0];
		multiple = arguments[1];
		rollUnitType = arguments[0];
		rollMultiple = arguments[1];
		formatter = arguments[2];
	} else {
		unitType = dateTickUnitType.DAY;
		multiple = 1;
		rollUnitType = dateTickUnitType.DAY;
		rollMultiple = 1;
		formatter = new SimpleDateFormat();
	}
	this.size = this.getMillisecondCount(unitType, multiple);
	this.unitType = unitType;
	this.count = multiple;
	this.rollUnitType = rollUnitType;
	this.rollCount = rollMultiple;
	this.formatter = formatter;
}
DateTickUnit.prototype.getCount = function() {
	return this.count;
};
DateTickUnit.prototype.getMillisecondCount = function(unit, count) {
	if (unit.equals(dateTickUnitType.YEAR)) {
		return (365 * 24 * 60 * 60 * 1000) * count;
	} else if (unit.equals(dateTickUnitType.MONTH)) {
		return (31 * 24 * 60 * 60 * 1000) * count;
	} else if (unit.equals(dateTickUnitType.DAY)) {
		return (24 * 60 * 60 * 1000) * count;
	} else if (unit.equals(dateTickUnitType.HOUR)) {
		return (60 * 60 * 1000) * count;
	} else if (unit.equals(dateTickUnitType.MINUTE)) {
		return (60 * 1000) * count;
	} else if (unit.equals(dateTickUnitType.SECOND)) {
		return 1000 * count;
	} else if (unit.equals(dateTickUnitType.MILLISECOND)) {
		return count;
	}
	return 0;
};
DateTickUnit.prototype.getSize = function() {
	return this.size;
};
DateTickUnit.prototype.dateToString = function(milliseconds) {
	return "EU: " + this.formatter.format(milliseconds) + "\n" + "US: " + this.formatter.formatTimezone(milliseconds, "America/New_York") + "\n" + "JP: " + this.formatter.formatTimezone(milliseconds, "Asia/Tokyo");
};
DateTickUnit.prototype.valueToString = function(milliseconds) {
	return this.formatter.format(milliseconds);
};
DateTickUnit.prototype.compareTo = function(object) {
	if ((typeName(object) == "DateTickUnit") || ((typeName(object) == "NumberTickUnit"))) {
		var other = object;
		if (this.size > other.getSize()) {
			return 1;
		} else if (this.size < other.getSize()) {
			return -1;
		} else {
			return 0;
		}
	}
	return -1;
};
DateTickUnit.prototype.previousStandardDate = function(milliseconds) {
	var name = this.unitType.name;
	var ts = new Timestamp(milliseconds);
	if (name == "YEAR") {
		ts = new Timestamp(ts.getYear(), 0, 1, 0, 0, 0);
	} else if (name == "MONTH") {
		var yearMonth = ts.getYear() * 12 + (ts.getMonth() - 1);
		yearMonth = yearMonth;
		ts = new Timestamp(Math.floor(yearMonth / 12), (yearMonth % 12) + 1, 1, 0, 0, 0);
	} else if (name == "DAY") {
		ts = new Timestamp(ts.getYear(), ts.getMonth(), ts.getDay(), 0, 0, 0);
	} else if (name == "HOUR") {
		ts = new Timestamp(ts.getYear(), ts.getMonth(), ts.getDay(), ts.getHour(), 0, 0);
	} else if (name == "MINUTE") {
		ts = new Timestamp(ts.getYear(), ts.getMonth(), ts.getDay(), ts.getHour(), ts.getMinute(), 0);
	} else if (name == "SECOND") {
		ts = new Timestamp(ts.getYear(), ts.getMonth(), ts.getDay(), ts.getHour(), ts.getMinute(), ts.getSecond());
	}
	return ts.getMilliseconds();
};
DateTickUnit.prototype.add = function(milliseconds) {
	var ts = new Timestamp(milliseconds);
	var name = this.unitType.name;
	if (name == "YEAR") {
		ts = new Timestamp(ts.getYear() + this.count, ts.getMonth(), ts.getDay(), ts.getHour(), ts.getMinute(), ts.getSecond());
	} else if (name == "MONTH") {
		var yearMonth = ts.getYear() * 12 + (ts.getMonth() - 1);
		yearMonth = yearMonth + this.count;
		ts = new Timestamp(Math.floor(yearMonth / 12), (yearMonth % 12) + 1, ts.getDay(), ts.getHour(), ts.getMinute(), ts.getSecond());
	} else if (name == "DAY") {
		ts.addSeconds(this.count * 86400);
	} else if (name == "HOUR") {
		ts.addSeconds(this.count * 3600);
	} else if (name == "MINUTE") {
		ts.addSeconds(this.count * 60);
	} else if (name == "SECOND") {
		ts.addSeconds(this.count);
	} else if (name == "MILLISECOND") {
		return milliseconds + this.count;
	}
	return ts.getMilliseconds();
};
DateTickUnit.prototype.rollDate = function(milliseconds) {
	var ts = new Timestamp(milliseconds);
	var name = this.rollUnitType.name;
	if (name == "YEAR") {
		ts = new Timestamp(ts.getYear() + this.rollCount, ts.getMonth(), ts.getDay(), ts.getHour(), ts.getMinute(), ts.getSecond());
	} else if (name == "MONTH") {
		var yearMonth = ts.getYear() * 12 + (ts.getMonth() - 1);
		yearMonth = yearMonth + this.rollCount;
		ts = new Timestamp(Math.floor(yearMonth / 12), (yearMonth % 12) + 1, ts.getDay(), ts.getHour(), ts.getMinute(), ts.getSecond());
	} else if (name == "DAY") {
		ts.add(this.rollCount * 86400);
	} else if (name == "HOUR") {
		ts.add(this.rollCount * 3600);
	} else if (name == "MINUTE") {
		ts.add(this.rollCount * 60);
	} else if (name == "SECOND") {
		ts.add(this.rollCount);
	} else if (name == "MILLISECOND") {
		return milliseconds + this.rollCount;
	}
	return ts.getMilliseconds();
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function NumberTickUnit() {
	var unitSize, formatter, minorTickCount;
	if (arguments.length == 3) {
		unitSize = arguments[0];
		formatter = arguments[1];
		minorTickCount = arguments[2];
	} else if (arguments.length == 2) {
		unitSize = arguments[0];
		formatter = arguments[1];
		minorTickCount = 0;
	} else if (arguments.length == 1) {
		unitSize = arguments[0];
		formatter = new DecimalFormat();
		minorTickCount = 0;
	} else {
		unitSize = 1.0;
		formatter = new DecimalFormat("0.0");
		minorTickCount = 0;
	}
	this.size = unitSize;
	this.minorTickCount = minorTickCount;
	this.formatter = formatter;
}
NumberTickUnit.prototype.getSize = function() {
	return this.size;
};
NumberTickUnit.prototype.compareTo = function(object) {
	if (typeName(object) == "NumberTickUnit") {
		var other = object;
		if (this.size > other.getSize()) {
			return 1;
		} else if (this.size < other.getSize()) {
			return -1;
		} else {
			return 0;
		}
	}
	return -1;
};
NumberTickUnit.prototype.valueToString = function(value) {
	return this.formatter.format(value);
};

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function TickUnits() {
	this.tickUnits = [];
}
TickUnits.prototype.add = function(unit) {
	this.tickUnits.push(unit);
	this.tickUnits.sort(function(a, b) {
		return a.compareTo(b);
	});
};
TickUnits.prototype.size = function() {
	return this.tickUnits.length;
};
TickUnits.prototype.get = function(pos) {
	return this.tickUnits[pos];
};
TickUnits.prototype.binarySearch = function(unit) {
	var low = 0;
	var high = this.tickUnits.length - 1;

	while (low <= high) {
		var mid = (low + high) >>> 1;
		var midVal = this.tickUnits[mid];
		var cmp = midVal.compareTo(unit);
		if (cmp < 0) {
			low = mid + 1;
		} else if (cmp > 0) {
			high = mid - 1;
		} else {
			return mid;
		}
	}
	return -(low + 1);
};
TickUnits.prototype.getLargerTickUnit = function(unit) {
	var index = this.binarySearch(unit);
	if (index >= 0) {
		index = index + 1;
	} else {
		index = -index;
	}
	return this.tickUnits[Math.min(index, this.tickUnits.length - 1)];
};
TickUnits.prototype.getSmallerTickUnit = function(unit) {
	var index = this.binarySearch(unit);
	if (index >= 0) {
		index = index - 1;
	} else {
		index = -index - 2;
	}
	return this.tickUnits[Math.max(index, 0)];
};
TickUnits.prototype.getCeilingTickUnit = function(unit) {
	var index;
	if (typeName(unit) == "DateTickUnit") {
		index = this.binarySearch(unit);
		if (index >= 0) {
			return this.tickUnits[index];
		}
		index = -(index + 1);
		return this.tickUnits[Math.min(index, this.tickUnits.length - 1)];
	} else if (typeName(unit) == "NumberTickUnit") {
		index = this.binarySearch(unit);
		if (index >= 0) {
			return this.tickUnits[index];
		}
		index = -(index + 1);
		return this.tickUnits[Math.min(index, this.tickUnits.length - 1)];
	} else if (typeName(unit) == "number") {
		return this.getCeilingTickUnit(new NumberTickUnit(unit));
	}
	return null;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function DecimalFormat() {
	this.fmt = "0.0";
	if (arguments.length == 1) {
		this.fmt = arguments[0];
	}
}
DecimalFormat.prototype.format = function(value) {
	return numeral(value).format(this.fmt);
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function SimpleDateFormat() {
	this.fmt = "YYYY-MM-DD HH:mm:ss";
	if (arguments.length == 1) {
		this.fmt = arguments[0];
	}
}
SimpleDateFormat.prototype.format = function(milliseconds) {
	return moment.tz(milliseconds, "Europe/Berlin").format(this.fmt);
};
SimpleDateFormat.prototype.formatTimezone = function(milliseconds, timezone) {
	return moment.tz(milliseconds, "Europe/Berlin").clone().tz(timezone).format(this.fmt);
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function DateTick(milliseconds, label) {
	this.milliseconds = milliseconds;
	this.label = label;
}
DateTick.prototype.getMilliseconds = function() {
	return this.milliseconds;
};
DateTick.prototype.getLabel = function() {
	return this.label;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function NumberTick(number, label) {
	this.number = number;
	this.label = label;
}
NumberTick.prototype.getNumber = function() {
	return this.number;
};
NumberTick.prototype.getLabel = function() {
	return this.label;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function DateAxis() {
	this.left = arguments[0].left ? arguments[0].left : 0;
	this.top = arguments[0].top ? arguments[0].top : 0;
	this.width = arguments[0].width ? arguments[0].width : 1;
	this.height = arguments[0].height ? arguments[0].height : 1;
	this.weekdays = arguments[0].weekdays ? arguments[0].weekdays : 7;
	this.weekends = arguments[0].weekends ? arguments[0].weekends : 0;
	this.stroke = arguments[0].stroke ? arguments[0].stroke : "#000000";
	this.strokeWidth = arguments[0].strokeWidth ? arguments[0].strokeWidth : "1";
	this.strokeDashArray = PlotSerieStyle.SolidLineStyle;
	this.fill = this.stroke;
	this.opacity = arguments[0].opacity ? arguments[0].opacity : 1.0;
	this.label = arguments[0].label ? arguments[0].label : "";
	this.rootId = arguments[0].rootId ? arguments[0].rootId : "D3Chart";
	this.id = this.rootId + "TimeAxis";
	this.idCursorValue = this.id + "CursorValue";

	this.timeline = new SegmentedTimeline(segmentedTimeline.DAY_SEGMENT_SIZE, this.weekdays, this.weekends);
	this.tickLabelFontFamily = arguments[0].tickLabelFontFamily ? arguments[0].tickLabelFontFamily : "arial";
	this.tickLabelFontWeight = arguments[0].tickLabelFontWeight ? arguments[0].tickLabelFontWeight : "normal";
	this.range = arguments[0].range ? arguments[0].range : new DateRange(0, 1000);
	this.inverted = arguments[0].inverted ? arguments[0].inverted : false;
	this.tickUnit = new DateTickUnit();
	this.standardTickUnits = this.createStandardTickUnits();
	this.gridOffset = 0;
	this.gridStep = 100;
	this.tickLabelFontSize = 1;
	this.cursorValue = Math.round((this.range.getLowerMillis() + this.range.getUpperMillis()) / 2);

	if (d3.select("#" + this.id)[0][0] === null) {
		this.element = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.id)
			.style("stroke", this.stroke)
			.style("stroke-width", this.strokeWidth)
			.style("stroke-dasharray", this.strokeDashArray)
			.style("fill", this.fill)
			.style("opacity", this.opacity)
			.style("font-family", this.tickLabelFontFamily)
			.style("font-weight", this.tickLabelFontWeight)
			.style("font-size", this.tickLabelFontSize);
	}
	if (d3.select("#" + this.idCursorValue)[0][0] === null) {
		this.elementCursorValue = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.idCursorValue)
			.style("stroke", this.stroke)
			.style("stroke-width", this.strokeWidth)
			.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
			.style("fill", this.fill)
			.style("opacity", 1.0)
			.style("font-family", this.tickLabelFontFamily)
			.style("font-weight", this.tickLabelFontWeight)
			.style("font-size", this.tickLabelFontSize);
	}
	this.updateFontSize();
	this.update();
}
DateAxis.prototype.updateFontSize = function() {
	this.tickLabelFontSize = this.height / 5;
	this.element
		.style("font-size", (this.tickLabelFontSize) + "px");
	this.elementCursorValue
		.style("font-size", (this.tickLabelFontSize) + "px");
};
DateAxis.prototype.createStandardTickUnits = function() {
	var units = new TickUnits();
	var dateTimeFormat = new SimpleDateFormat("D-MMM-YY HH:mm:ss");
	var timeFormat = new SimpleDateFormat("HH:mm");
	var daysFormat = new SimpleDateFormat("D-MMM-YY");
	var monthsFormat = new SimpleDateFormat("MMM-YY");
	units.add(new DateTickUnit(dateTickUnitType.SECOND, 1, dateTimeFormat));
	units.add(new DateTickUnit(dateTickUnitType.SECOND, 2, dateTimeFormat));
	units.add(new DateTickUnit(dateTickUnitType.SECOND, 5, dateTimeFormat));
	units.add(new DateTickUnit(dateTickUnitType.SECOND, 10, dateTimeFormat));
	units.add(new DateTickUnit(dateTickUnitType.MINUTE, 1, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.MINUTE, 5, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.MINUTE, 2, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.MINUTE, 3, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.MINUTE, 4, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.MINUTE, 6, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.MINUTE, 10, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.MINUTE, 30, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.HOUR, 1, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.HOUR, 2, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 3, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.HOUR, 4, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 5, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 6, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 7, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.HOUR, 8, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 9, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 10, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 11, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.HOUR, 12, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 13, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 14, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 15, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 16, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 17, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 18, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 19, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 20, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 21, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 22, timeFormat));
	// units.add(new DateTickUnit(dateTickUnitType.HOUR, 23, timeFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 1, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 2, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 3, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 4, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 5, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 6, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 7, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 14, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.DAY, 30, daysFormat));
	units.add(new DateTickUnit(dateTickUnitType.MONTH, 1, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.MONTH, 2, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.MONTH, 3, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.MONTH, 4, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.MONTH, 5, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.MONTH, 6, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.YEAR, 1, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.YEAR, 2, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.YEAR, 5, monthsFormat));
	units.add(new DateTickUnit(dateTickUnitType.YEAR, 10, monthsFormat));
	return units;
};
DateAxis.prototype.getStandardTickUnits = function() {
	return this.standardTickUnits;
};
DateAxis.prototype.getTickUnit = function() {
	return this.tickUnit;
};
DateAxis.prototype.isInverted = function() {
	return this.inverted;
};
DateAxis.prototype.valueTo2D = function(v) {
	var value = this.timeline.toTimelineValue(v);
	var axisMin = this.timeline.toTimelineValue(this.range.getLowerMillis());
	var axisMax = this.timeline.toTimelineValue(this.range.getUpperMillis());
	var result = 0.0;
	var minX = this.left;
	var maxX = this.left + this.width;
	if (this.inverted) {
		result = maxX + ((value - axisMin) / (axisMax - axisMin)) * (minX - maxX);
	} else {
		result = minX + ((value - axisMin) / (axisMax - axisMin)) * (maxX - minX);
	}
	return result;
};
DateAxis.prototype.from2DToValue = function(value2D) {
	var axisMin = this.timeline.toTimelineValue(this.range.getLowerMillis());
	var axisMax = this.timeline.toTimelineValue(this.range.getUpperMillis());
	var min = this.left;
	var max = this.left + this.width;
	var result = 0.0;
	if (this.inverted) {
		result = axisMax - ((value2D - min) / (max - min) * (axisMax - axisMin));
	} else {
		result = axisMin + ((value2D - min) / (max - min) * (axisMax - axisMin));
	}
	return this.timeline.toMillisecond(Math.floor(result));
};
DateAxis.prototype.lengthTo2D = function(length) {
	var zero = this.valueTo2D(0.0);
	var l = this.valueTo2D(length);
	return Math.abs(l - zero);
};
DateAxis.prototype.selectAutoTickUnit = function() {
	var shift = this.timeline.startTime;
	var zero = this.valueTo2D(shift + 0.0);
	var tickLabelWidth = this.estimateMaximumTickLabelWidth(this.getTickUnit());

	var tickUnits = this.getStandardTickUnits();
	var unit1 = tickUnits.getCeilingTickUnit(this.getTickUnit());
	var x1 = this.valueTo2D(shift + unit1.getSize());
	var unit1Width = Math.abs(x1 - zero);

	var guess = (tickLabelWidth / unit1Width) * unit1.getSize();
	var unit2 = tickUnits.getCeilingTickUnit(guess);
	var x2 = this.valueTo2D(shift + unit2.getSize());
	var unit2Width = Math.abs(x2 - zero);
	tickLabelWidth = this.estimateMaximumTickLabelWidth(unit2);
	if (tickLabelWidth > unit2Width) {
		unit2 = tickUnits.getLargerTickUnit(unit2);
	}
	this.tickUnit = unit2;
};
DateAxis.prototype.estimateMaximumTickLabelWidth = function(unit) {
	var lower = this.range.getLowerMillis();
	var upper = this.range.getUpperMillis();
	var lowerStr = null;
	var upperStr = null;
	lowerStr = unit.dateToString(lower);
	upperStr = unit.dateToString(upper);
	var w1 = getTextWidth(lowerStr, (this.tickLabelFontSize) + "px " + this.tickLabelFontWeight + " " + this.tickLabelFontFamily) / 3 * 1.25;
	var w2 = getTextWidth(upperStr, (this.tickLabelFontSize) + "px " + this.tickLabelFontWeight + " " + this.tickLabelFontFamily) / 3 * 1.25;
	return Math.max(w1, w2);
};
DateAxis.prototype.nextStandardDate = function(milliseconds, unit) {
	var previous = unit.previousStandardDate(milliseconds);
	return unit.add(previous);
};
DateAxis.prototype.getMinimumDate = function() {
	return this.range.getLowerMillis();
};
DateAxis.prototype.getMaximumDate = function() {
	return this.range.getUpperMillis();
};
DateAxis.prototype.calculateLowestVisibleTickValue = function(unit) {
	return unit.previousStandardDate(this.getMinimumDate());
};
DateAxis.prototype.isHiddenValue = function(milliseconds) {
	return (this.timeline.containsDomainValue(milliseconds) === false);
};
DateAxis.prototype.refreshTicks = function() {
	var result = [];

	this.selectAutoTickUnit();
	var unit = this.getTickUnit();
	var tickDate = this.getMinimumDate();
	var upperDate = this.getMaximumDate();

	while (tickDate < upperDate) {

		if (!this.isHiddenValue(tickDate)) {
			var tickLabel = this.tickUnit.dateToString(tickDate);
			var tick = new DateTick(tickDate, tickLabel);
			result.push(tick);

			tickDate = unit.add(tickDate);
		} else {
			tickDate = unit.rollDate(tickDate);
			continue;
		}
	}
	return result;
};
DateAxis.prototype.update = function() {
	var i;
	var ticks = this.refreshTicks();
	if (ticks.length > 1) {
		var firstTick = ticks[0];
		var lastTick = ticks[ticks.length - 1];
		var firstTickCoord = this.valueTo2D(firstTick.getMilliseconds());
		var lastTickCoord = this.valueTo2D(lastTick.getMilliseconds());
		this.gridOffset = this.inverted ? this.left + this.width - firstTickCoord : firstTickCoord - this.left;
		this.gridStep = Math.abs(lastTickCoord - firstTickCoord) / (ticks.length - 1);
	} else {
		this.gridOffset = 0;
		this.gridStep = this.width;
	}

	this.element[0][0].innerHTML = "";
	if ((this.width > 0) && (this.height > 0)) {
		var tickSize = 5;
		this.element
			.append("path")
			.attr("d", "M" + (this.left) + "," + (this.top) + "L" + (this.left + this.width) + "," + (this.top));
		for (i = 0; i < ticks.length; i++) {
			var tick = ticks[i];
			var tickCoord = this.valueTo2D(tick.getMilliseconds());

			this.element
				.append("path")
				.attr("d", "M" + (tickCoord) + "," + (this.top - tickSize) + "L" + (tickCoord) + "," + (this.top + tickSize));
			var txt = this.element
				.append("text")
				.attr("x", tickCoord)
				.attr("y", this.top + tickSize)
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "hanging");
			var textLines = tick.getLabel().split("\n");
			for (var lineNo = 0; lineNo < textLines.length; lineNo++) {
				txt
					.append("tspan")
					.attr("x", tickCoord)
					.attr("dy", "1em")
					.text(textLines[lineNo]);
			}


		}
		this.element
			.append("text")
			.attr("x", this.left + this.width / 2)
			.attr("y", this.top + this.height)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "text-after-edge")
			.text(this.label);
	}
	this.cursor(this.cursorValue);
};
DateAxis.prototype.cursor = function() {
	if (arguments.length === 0) {
		return this.cursorValue;
	} else if (arguments.length == 1) {
		this.cursorValue = Math.round(arguments[0]);
		this.elementCursorValue[0][0].innerHTML = "";
		if ((this.width > 0) && (this.height > 0)) {
			if (this.range.contains(this.cursorValue)) {
				var size = 8;
				var delta = size / 2;
				var xPos = this.valueTo2D(this.cursorValue);
				this.cursorTick = this.elementCursorValue
					.append("path")
					.attr(
						"d",
						"M" + (xPos - delta) + "," + (this.top - delta) +
						"L" + (xPos + delta) + "," + (this.top + delta) +
						"L" + (xPos - delta) + "," + (this.top + delta) +
						"L" + (xPos + delta) + "," + (this.top - delta) +
						"L" + (xPos - delta) + "," + (this.top - delta)
					);
				var f = new SimpleDateFormat("YYYY-MM-DD HH:mm:ss");
				var txtLine1 = f.formatTimezone(this.cursorValue, "Europe/Berlin") + " (Berlin)";
				var txtLine2 = f.formatTimezone(this.cursorValue, "America/New_York") + " (NewYork)";
				var txtLine3 = f.formatTimezone(this.cursorValue, "Asia/Tokyo") + " (Tokyo)";
				var w1 = getTextWidth(txtLine1, (this.tickLabelFontSize) + "px " + this.tickLabelFontWeight + " " + this.tickLabelFontFamily);
				var w2 = getTextWidth(txtLine2, (this.tickLabelFontSize) + "px " + this.tickLabelFontWeight + " " + this.tickLabelFontFamily);
				var w3 = getTextWidth(txtLine3, (this.tickLabelFontSize) + "px " + this.tickLabelFontWeight + " " + this.tickLabelFontFamily);
				var w = Math.max(w1, Math.max(w2, w3)) * 1.1;
				var h = this.tickLabelFontSize + 4;
				var linesData = [];
				linesData[0] = {
					label: txtLine1,
					color: "black"
				};
				linesData[1] = {
					label: txtLine2,
					color: "red"
				};
				linesData[2] = {
					label: txtLine3,
					color: "blue"
				};
				for (var line = 0; line < 3; line++) {
					this.elementCursorValue
						.append("rect")
						.attr("x", xPos - w / 2)
						.attr("width", w)
						.attr("y", this.top + size + line * h)
						.attr("height", h)
						.style("stroke", linesData[line].color)
						.style("fill", linesData[line].color);
					this.elementCursorValue
						.append("text")
						.attr("x", xPos)
						.attr("y", this.top + size + line * h)
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "hanging")
						.style("stroke", "white")
						.style("fill", "white")
						.append("tspan")
						.attr("x", xPos)
						.attr("dy", "1em")
						.text(linesData[line].label);
				}
			}
		}
	}
};
DateAxis.prototype.dimension = function(left, top, width, height) {
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.updateFontSize();
	this.update();
	return this;
};
DateAxis.prototype.setStroke = function(stroke) {
	this.stroke = stroke;
	this.fill = this.stroke;
	this.element
		.style("stroke", this.stroke)
		.style("fill", this.fill);
	return this;
};
DateAxis.prototype.setStrokeWidth = function(strokeWidth) {
	this.strokeWidth = strokeWidth;
	this.element
		.style("stroke-width", this.strokeWidth);
	return this;
};
DateAxis.prototype.setOpacity = function(opacity) {
	this.opacity = opacity;
	this.element
		.style("opacity", this.opacity);
	return this;
};
DateAxis.prototype.setRange = function(range) {
	this.range = range;
	this.update();
	return this;
};
DateAxis.prototype.setLabel = function(label) {
	this.label = label;
	this.update();
	return this;
};
DateAxis.prototype.setWeekdays = function(weekdays) {
	this.weekdays = weekdays;
	this.update();
	return this;
};
DateAxis.prototype.setWeekends = function(weekends) {
	this.weekends = weekends;
	this.update();
	return this;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function NumberAxis() {
	this.index = arguments[0].index ? arguments[0].index : 0;
	this.left = arguments[0].left ? arguments[0].left : 0;
	this.top = arguments[0].top ? arguments[0].top : 0;
	this.width = arguments[0].width ? arguments[0].width : 1;
	this.height = arguments[0].height ? arguments[0].height : 1;
	this.stroke = arguments[0].stroke ? arguments[0].stroke : "#000000";
	this.strokeWidth = arguments[0].strokeWidth ? arguments[0].strokeWidth : "1";
	this.strokeDashArray = PlotSerieStyle.SolidLineStyle;
	this.fill = this.stroke;
	this.opacity = arguments[0].opacity ? arguments[0].opacity : 1.0;
	this.label = arguments[0].label ? arguments[0].label : "";
	this.lowerMargin = arguments[0].lowerMargin ? arguments[0].lowerMargin : 0.0;
	this.upperMargin = arguments[0].upperMargin ? arguments[0].upperMargin : 0.05;
	this.zoomTop = arguments[0].zoomTop ? arguments[0].zoomTop : 0.0;
	this.zoomBottom = arguments[0].zoomBottom ? arguments[0].zoomBottom : 1.0;
	this.rootId = arguments[0].rootId ? arguments[0].rootId : "D3Chart";
	this.id = this.rootId + "NumberAxis" + (this.index);
	this.idCursorValue = this.id + "CursorValue" + (this.index);

	this.tickLabelFontFamily = arguments[0].tickLabelFontFamily ? arguments[0].tickLabelFontFamily : "arial";
	this.tickLabelFontWeight = arguments[0].tickLabelFontWeight ? arguments[0].tickLabelFontWeight : "normal";
	this.tickLabelFontSize = arguments[0].tickLabelFontSize ? arguments[0].tickLabelFontSize : 10;
	this.range = arguments[0].range ? arguments[0].range : new NumberRange(0.0, 1.0);
	this.inverted = arguments[0].inverted ? arguments[0].inverted : false;
	var expR = this.range.expand(this.lowerMargin, this.upperMargin);
	var rangeAxisZoomedRange = zoomRange(
		this.inverted ? expR.getLowerBound() : expR.getUpperBound(),
		this.inverted ? expR.getUpperBound() : expR.getLowerBound(),
		this.zoomTop,
		this.zoomBottom
	);
	this.expandedRange = new NumberRange(
		this.inverted ? rangeAxisZoomedRange.v1 : rangeAxisZoomedRange.v2,
		this.inverted ? rangeAxisZoomedRange.v2 : rangeAxisZoomedRange.v1
	);
	this.tickUnit = new NumberTickUnit();
	this.standardTickUnits = this.createStandardTickUnits();
	this.gridOffset = 0;
	this.gridStep = 100;
	this.cursorValue = (this.range.getLowerBound() + this.range.getUpperBound()) / 2;

	if (d3.select("#" + this.id)[0][0] === null) {
		this.element = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.id)
			.style("stroke", this.stroke)
			.style("stroke-width", this.strokeWidth)
			.style("stroke-dasharray", this.strokeDashArray)
			.style("fill", this.fill)
			.style("opacity", this.opacity)
			.style("font-family", this.tickLabelFontFamily)
			.style("font-weight", this.tickLabelFontWeight)
			.style("font-size", this.tickLabelFontSize);
	}
	if (d3.select("#" + this.idCursorValue)[0][0] === null) {
		this.elementCursorValue = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.idCursorValue)
			.style("stroke", this.stroke)
			.style("stroke-width", this.strokeWidth)
			.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
			.style("fill", this.fill)
			.style("opacity", 1.0)
			.style("font-family", this.tickLabelFontFamily)
			.style("font-weight", this.tickLabelFontWeight)
			.style("font-size", this.tickLabelFontSize);
	}
	this.updateFontSize();
	this.update();
}
NumberAxis.prototype.updateFontSize = function() {
	this.element
		.style("font-size", (this.tickLabelFontSize) + "px");
	this.elementCursorValue
		.style("font-size", (this.tickLabelFontSize) + "px");
};
NumberAxis.prototype.createStandardTickUnits = function() {
	var units = new TickUnits();
	var df0 = new DecimalFormat("0.0000[0000]");
	var df1 = new DecimalFormat("0.0000[000]");
	var df2 = new DecimalFormat("0.0000[00]");
	var df3 = new DecimalFormat("0.0000[0]");
	var df4 = new DecimalFormat("0.0000");
	var df5 = new DecimalFormat("0.000");
	var df6 = new DecimalFormat("0.00");
	var df7 = new DecimalFormat("0.0");
	var df8 = new DecimalFormat("[0,00]0");
	var df9 = new DecimalFormat("[0,000,00]0");
	var df10 = new DecimalFormat("[0,000,000,00]0");
	units.add(new NumberTickUnit(0.00000001, df0, 0));
	units.add(new NumberTickUnit(0.0000001, df1, 0));
	units.add(new NumberTickUnit(0.000001, df2, 0));
	units.add(new NumberTickUnit(0.00001, df3, 0));
	units.add(new NumberTickUnit(0.0001, df4, 0));
	units.add(new NumberTickUnit(0.001, df4, 0));
	units.add(new NumberTickUnit(0.01, df4, 10));
	units.add(new NumberTickUnit(0.1, df4, 10));
	units.add(new NumberTickUnit(1, df4, 10));
	units.add(new NumberTickUnit(10, df5, 10));
	units.add(new NumberTickUnit(100, df6, 10));
	units.add(new NumberTickUnit(1000, df7, 10));
	units.add(new NumberTickUnit(10000, df8, 10));
	units.add(new NumberTickUnit(100000, df8, 10));
	units.add(new NumberTickUnit(1000000, df9, 10));
	units.add(new NumberTickUnit(10000000, df9, 10));
	units.add(new NumberTickUnit(100000000, df9, 10));
	units.add(new NumberTickUnit(1000000000, df10, 10));
	units.add(new NumberTickUnit(10000000000.0, df10, 10));
	units.add(new NumberTickUnit(100000000000.0, df10, 10));
	return units;
};
NumberAxis.prototype.getStandardTickUnits = function() {
	return this.standardTickUnits;
};
NumberAxis.prototype.getTickUnit = function() {
	return this.tickUnit;
};
NumberAxis.prototype.isInverted = function() {
	return this.inverted;
};
NumberAxis.prototype.valueTo2D = function(value) {
	var axisMin = this.expandedRange.getLowerBound();
	var axisMax = this.expandedRange.getUpperBound();
	var result = 0.0;
	var minY = this.top + this.height;
	var maxY = this.top;
	if (this.inverted) {
		result = maxY - ((value - axisMin) / (axisMax - axisMin)) * (maxY - minY);
	} else {
		result = minY + ((value - axisMin) / (axisMax - axisMin)) * (maxY - minY);
	}
	return result;
};
NumberAxis.prototype.from2DToValue = function(value2D) {
	var axisMin = this.expandedRange.getLowerBound();
	var axisMax = this.expandedRange.getUpperBound();
	var result = 0.0;
	var minY = this.top + this.height;
	var maxY = this.top;
	if (this.inverted) {
		result = axisMax - ((value2D - minY) / (maxY - minY) * (axisMax - axisMin));
	} else {
		result = axisMin + ((value2D - minY) / (maxY - minY) * (axisMax - axisMin));
	}
	return result;
};
NumberAxis.prototype.selectAutoTickUnit = function() {
	var tickLabelHeight = this.estimateMaximumTickLabelHeight();
	var tickUnits = this.standardTickUnits;
	var unit1 = tickUnits.getCeilingTickUnit(this.getTickUnit());
	var unitHeight = this.lengthTo2D(unit1.getSize());

	var guess = (tickLabelHeight / unitHeight) * unit1.getSize();

	var unit2 = tickUnits.getCeilingTickUnit(guess);
	var unit2Height = this.lengthTo2D(unit2.getSize());
	if (tickLabelHeight > unit2Height) {
		unit2 = tickUnits.getLargerTickUnit(unit2);
	}
	this.tickUnit = unit2;
};
NumberAxis.prototype.lengthTo2D = function(length) {
	var zero = this.valueTo2D(0.0);
	var l = this.valueTo2D(length);
	return Math.abs(l - zero);
};
NumberAxis.prototype.estimateMaximumTickLabelHeight = function() {
	return this.tickLabelFontSize;
};
NumberAxis.prototype.calculateLowestVisibleTickValue = function() {
	var u = this.getTickUnit().getSize();
	var index = Math.ceil(this.expandedRange.getLowerBound() / u);
	return index * u;
};
NumberAxis.prototype.calculateVisibleTickCount = function() {
	var unit = this.getTickUnit().getSize();
	return (Math.floor(this.expandedRange.getUpperBound() / unit) - Math.ceil(this.expandedRange.getLowerBound() / unit) + 1);
};
NumberAxis.prototype.isHiddenValue = function(milliseconds) {
	return (this.timeline.containsDomainValue(milliseconds) === false);
};
NumberAxis.prototype.refreshTicks = function() {
	var result = [];

	this.selectAutoTickUnit();

	var tu = this.getTickUnit();
	var size = tu.getSize();
	var count = this.calculateVisibleTickCount();
	var lowestTickValue = this.calculateLowestVisibleTickValue();
	if (count <= 500) {
		for (var i = 0; i < count; i++) {
			var currentTickValue = lowestTickValue + (i * size);
			var tickLabel = this.getTickUnit().valueToString(currentTickValue);
			var tick = new NumberTick(currentTickValue, tickLabel);
			result.push(tick);
		}
	}
	return result;
};
NumberAxis.prototype.update = function() {
	var i;
	var ticks = this.refreshTicks();
	if (ticks.length > 1) {
		var firstTick = ticks[0];
		var lastTick = ticks[ticks.length - 1];
		var firstTickCoord = this.valueTo2D(firstTick.getNumber());
		var lastTickCoord = this.valueTo2D(lastTick.getNumber());
		this.gridOffset = this.inverted ? firstTickCoord - this.top : this.top + this.height - firstTickCoord;
		this.gridStep = Math.abs(lastTickCoord - firstTickCoord) / (ticks.length - 1);
	} else {
		this.gridOffset = 0;
		this.gridStep = this.height;
	}

	this.element[0][0].innerHTML = "";
	this.elementCursorValue[0][0].innerHTML = "";
	if ((this.width > 0) && (this.height > 0)) {
		var tickSize = 5;
		this.element
			.append("path")
			.attr("d", "M" + (this.left + this.width) + "," + (this.top) + "L" + (this.left + this.width) + "," + (this.top + this.height));
		var maxWidth = 0;
		for (i = 0; i < ticks.length; i++) {
			var tick = ticks[i];
			var tickCoord = this.valueTo2D(tick.getNumber());
			var w = getTextWidth(tick.getLabel(), (this.tickLabelFontSize) + "px " + this.tickLabelFontWeight + " " + this.tickLabelFontFamily) + 5;
			maxWidth = Math.max(maxWidth, w);
			this.element
				.append("path")
				.attr("d", "M" + (this.left + this.width - tickSize) + "," + (tickCoord) + "L" + (this.left + this.width + tickSize) + "," + (tickCoord));
			this.element
				.append("text")
				.attr("x", this.left + this.width - tickSize)
				.attr("y", tickCoord)
				.attr("text-anchor", "end")
				.attr("alignment-baseline", "middle")
				.text(tick.getLabel());
		}
		this.element
			.append("text")
			.attr("x", this.left + this.width - tickSize - maxWidth)
			.attr("y", this.top + this.height / 2)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "baseline")
			.attr("transform", "rotate(-90 " + (this.left + this.width - tickSize - maxWidth) + "," + (this.top + this.height / 2) + ")")
			.text(this.label);
	}
	this.cursor(this.cursorValue);
};
NumberAxis.prototype.cursor = function() {
	if (arguments.length === 0) {
		return this.cursorValue;
	} else if (arguments.length == 1) {
		this.cursorValue = arguments[0];
		this.elementCursorValue[0][0].innerHTML = "";
		if ((this.width > 0) && (this.height > 0)) {
			if (this.expandedRange.contains(this.cursorValue)) {
				var size = 8;
				var delta = size / 2;
				var yPos = this.valueTo2D(this.cursorValue);
				this.cursorTick = this.elementCursorValue
					.append("path")
					.attr(
						"d",
						"M" + (this.left + this.width - delta) + "," + (yPos - delta) +
						"L" + (this.left + this.width + delta) + "," + (yPos + delta) +
						"L" + (this.left + this.width + delta) + "," + (yPos - delta) +
						"L" + (this.left + this.width - delta) + "," + (yPos + delta) +
						"L" + (this.left + this.width - delta) + "," + (yPos - delta)
					);
				var tickLabel = this.getTickUnit().valueToString(this.cursorValue);
				var w = getTextWidth(tickLabel, (this.tickLabelFontSize * 1.1) + "px " + this.tickLabelFontWeight + " " + this.tickLabelFontFamily) + 8;
				var h = this.tickLabelFontSize * 1.1 + 4;
				this.elementCursorValue
					.append("rect")
					.attr("x", this.left + this.width - size - w)
					.attr("y", yPos - h / 2)
					.attr("width", w)
					.attr("height", h)
					.style("stroke", this.stroke)
					.style("fill", this.stroke);
				this.elementCursorValue
					.append("text")
					.attr("x", this.left + this.width - size - w / 2)
					.attr("y", yPos)
					.attr("text-anchor", "middle")
					.attr("alignment-baseline", "middle")
					.style("stroke", "white")
					.style("fill", "white")
					.style("font-size", this.tickLabelFontSize * 1.1)
					.text(tickLabel);
			}
		}
	}
};
NumberAxis.prototype.dimension = function(left, top, width, height) {
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.updateFontSize();
	this.update();
	return this;
};
DateAxis.prototype.setStroke = function(stroke) {
	this.stroke = stroke;
	this.fill = this.stroke;
	this.element
		.style("stroke", this.stroke)
		.style("fill", this.fill);
	return this;
};
NumberAxis.prototype.setStrokeWidth = function(strokeWidth) {
	this.strokeWidth = strokeWidth;
	this.element
		.style("stroke-width", this.strokeWidth);
	return this;
};
NumberAxis.prototype.setOpacity = function(opacity) {
	this.opacity = opacity;
	this.element
		.style("opacity", this.opacity);
	return this;
};
NumberAxis.prototype.setRange = function(range) {
	this.range = range;
	var expR = this.range.expand(this.lowerMargin, this.upperMargin);
	var rangeAxisZoomedRange = zoomRange(
		this.inverted ? expR.getLowerBound() : expR.getUpperBound(),
		this.inverted ? expR.getUpperBound() : expR.getLowerBound(),
		this.zoomTop,
		this.zoomBottom
	);
	this.expandedRange = new NumberRange(
		this.inverted ? rangeAxisZoomedRange.v1 : rangeAxisZoomedRange.v2,
		this.inverted ? rangeAxisZoomedRange.v2 : rangeAxisZoomedRange.v1
	);
	this.update();
	return this;
};
NumberAxis.prototype.setLabel = function(label) {
	this.label = label;
	this.update();
	return this;
};
NumberAxis.prototype.setTickLabelFontSize = function(size) {
	this.tickLabelFontSize = size;
	return this;
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function PlotSerie() {
	var arg = arguments[0] ? arguments[0] : {};
	this.color = arg.color ? arg.color : "#0000ff";
	this.color2 = arg.color2 ? arg.color2 : "#ffff00";
	this.opacity = arg.opacity ? arg.opacity : 1.0;
	this.type = arg.type ? arg.type : PlotSerieType.LineType;
	this.data = arg.data ? arg.data : null;
	this.linestyle = arg.linestyle ? arg.linestyle : PlotSerieStyle.SolidLineStyle;
	this.symbolcode = arg.symbolcode ? arg.symbolcode : 0x2190;
	this.lower_limit = arg.lower_limit ? arg.lower_limit : 0.0;
	this.upper_limit = arg.upper_limit ? arg.upper_limit : 0.0;
	this.thickness = arg.thickness ? arg.thickness : 1.0;
	this.group = arg.group ? arg.group : 0;
	this.invertedAxe = arg.invertedAxe ? arg.invertedAxe : false;
	this.kA = arg.kA ? arg.kA : 1.0;
	this.kB = arg.kB ? arg.kB : 0.0;
}
PlotSerie.prototype.getLinestyle = function() {
	return this.linestyle;
};
PlotSerie.prototype.setLinestyle = function(linestyle) {
	this.linestyle = linestyle;
};
PlotSerie.prototype.getSymbolcode = function() {
	return this.symbolcode;
};
PlotSerie.prototype.setSymbolcode = function(symbolcode) {
	this.symbolcode = symbolcode;
};
PlotSerie.prototype.getData = function() {
	return this.data;
};
PlotSerie.prototype.setData = function(data) {
	this.data = data;
};
PlotSerie.prototype.getColor = function() {
	return this.color;
};
PlotSerie.prototype.setColor = function(color) {
	this.color = color;
};
PlotSerie.prototype.getColor2 = function() {
	return this.color2;
};
PlotSerie.prototype.setColor2 = function(color) {
	this.color2 = color;
};
PlotSerie.prototype.getOpacity = function() {
	return this.opacity;
};
PlotSerie.prototype.setOpacity = function(opacity) {
	this.color = opacity;
};
PlotSerie.prototype.getType = function() {
	return this.type;
};
PlotSerie.prototype.setType = function(type) {
	this.type = type;
};
PlotSerie.prototype.getLower_limit = function() {
	return this.lower_limit;
};
PlotSerie.prototype.setLower_limit = function(lower_limit) {
	this.lower_limit = lower_limit;
};
PlotSerie.prototype.getUpper_limit = function() {
	return this.upper_limit;
};
PlotSerie.prototype.setUpper_limit = function(upper_limit) {
	this.upper_limit = upper_limit;
};
PlotSerie.prototype.getThickness = function() {
	return this.thickness;
};
PlotSerie.prototype.setThickness = function(thickness) {
	this.thickness = thickness;
};
PlotSerie.prototype.getGroup = function() {
	return this.group;
};
PlotSerie.prototype.setGroup = function(group) {
	this.group = group;
};
PlotSerie.prototype.isInvertedAxe = function() {
	return this.invertedAxe;
};
PlotSerie.prototype.setInvertedAxe = function(invertedAxe) {
	this.invertedAxe = invertedAxe;
};
PlotSerie.prototype.getKA = function() {
	return this.kA;
};
PlotSerie.prototype.setKA = function(kA) {
	this.kA = kA;
};
PlotSerie.prototype.getKB = function() {
	return this.kB;
};
PlotSerie.prototype.setKB = function(kB) {
	this.kB = kB;
};
PlotSerie.prototype.getIndexOf = function(x) {
	if (this.data === null) {
		return -1;
	}
	var low = 0;
	var high = this.data.length - 1;
	while (low <= high) {
		var mid = (low + high) >>> 1;
		var midVal = this.data[mid][0];
		var cmp = midVal - x;
		if (cmp < 0) {
			low = mid + 1;
		} else if (cmp > 0) {
			high = mid - 1;
		} else {
			return mid;
		}
	}
	return -(low + 1);
};

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartRenderer() {
	this.init("Renderer", arguments[0]);
}
D3ChartRenderer.prototype.init = function(type, arg) {
	this.index = arg.index ? arg.index : 0;
	this.serie = arg.serie ? arg.serie : null;
	this.timeAxis = arg.timeAxis ? arg.timeAxis : null;
	this.rangeAxis = arg.rangeAxis ? arg.rangeAxis : null;
	this.cursorValue = arg.cursorValue ? arg.cursorValue : (this.timeAxis.range.getLowerMillis() + this.timeAxis.range.getUpperMillis()) / 2;
	this.showCursorValue = arg.showCursorValue ? arg.showCursorValue : true;
	this.rootId = arg.rootId ? arg.rootId : "D3Chart";
	this.id = this.rootId + type + (this.index);
	this.idCursorValue = this.id + "CursorValue";
};
D3ChartRenderer.prototype.cursor = function() {
	if (arguments.length === 0) {
		return this.cursorValue;
	} else if (arguments.length == 1) {
		this.cursorValue = arguments[0];
		var data = this.serie.getData();
		this.elementCursorValue[0][0].innerHTML = "";
		if (data !== null) {
			var i;
			var cursorIndex = this.serie.getIndexOf(this.cursorValue);
			if (cursorIndex < 0) {
				cursorIndex = cursorIndex + 1;
				cursorIndex = -1 * cursorIndex;
				cursorIndex = cursorIndex === 0 ? cursorIndex : cursorIndex - 1;
			}
			if ((cursorIndex >= 0) && (cursorIndex <= data.length - 1)) {
				var cursorRow = data[cursorIndex];
				var kA = this.serie.getKA();
				var kB = this.serie.getKB();
				var bounds = {
					left: this.timeAxis.left,
					right: this.timeAxis.left + this.timeAxis.width,
					top: this.rangeAxis.top,
					bottom: this.timeAxis.top
				};
				for (i = 1; i < cursorRow.length; i++) {
					var y = this.rangeAxis.valueTo2D(cursorRow[i] * kA + kB);
					var yLabel = this.rangeAxis.getTickUnit().valueToString(cursorRow[i] * kA + kB);
					var w = getTextWidth(yLabel, (this.rangeAxis.tickLabelFontSize * 1.1) + "px " + this.rangeAxis.tickLabelFontWeight + " " + this.rangeAxis.tickLabelFontFamily) + 8;
					var h = this.rangeAxis.tickLabelFontSize * 1.1 + 8;
					var cy = y;
					var x = this.timeAxis.valueTo2D(cursorRow[0]);
					var cx = x;
					x = Math.max(x, bounds.left);
					if (x + w > bounds.right) x = x - w;
					y = Math.max(y, bounds.top);
					if (y + h > bounds.bottom) y = y - h;
					this.elementCursorValue
						.append("circle")
						.attr("cx", cx)
						.attr("cy", cy)
						.attr("r", this.serie.getThickness() * 4)
						.style("stroke", this.serie.getColor())
						.style("fill", "none");
					this.elementCursorValue
						.append("rect")
						.attr("x", x)
						.attr("y", y)
						.attr("width", w)
						.attr("height", h)
						.style("stroke", "white")
						.style("fill", this.serie.getColor());
					this.elementCursorValue
						.append("text")
						.attr("x", x + w / 2)
						.attr("y", y + h / 2)
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "middle")
						.style("stroke", "white")
						.style("fill", "white")
						.text(yLabel);

				}
			}
		}
	}
};
D3ChartRenderer.prototype.renderCheckElements = function() {
	if (d3.select("#" + this.id)[0][0] === null) {
		this.element = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.id)
			.style("stroke", this.serie.getColor())
			.style("stroke-width", this.serie.getThickness())
			.style("stroke-dasharray", this.serie.getLinestyle())
			.style("fill", this.serie.getColor())
			.style("opacity", this.serie.getOpacity())
			.style("font-family", this.rangeAxis.tickLabelFontFamily)
			.style("font-weight", this.rangeAxis.tickLabelFontWeight)
			.style("font-size", this.rangeAxis.tickLabelFontSize);
	}
	if (d3.select("#" + this.idCursorValue)[0][0] === null) {
		this.elementCursorValue = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.idCursorValue)
			.style("display", this.showCursorValue ? "block" : "none")
			.style("stroke", this.serie.getColor())
			.style("stroke-width", 1.0)
			.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
			.style("fill", this.serie.getColor())
			.style("opacity", 1.0)
			.style("font-family", this.rangeAxis.tickLabelFontFamily)
			.style("font-weight", this.rangeAxis.tickLabelFontWeight)
			.style("font-size", this.rangeAxis.tickLabelFontSize * 1.1);
	}
};
D3ChartRenderer.prototype.renderLimits = function() {
	var lowerLimit = this.serie.getLower_limit();
	var upperLimit = this.serie.getUpper_limit();
	if (upperLimit > lowerLimit) {
		var x1, y1, x2, y2;
		x1 = this.timeAxis.left;
		y1 = this.rangeAxis.valueTo2D(lowerLimit);
		x2 = this.timeAxis.left + this.timeAxis.width;
		y2 = this.rangeAxis.valueTo2D(upperLimit);
		this.element
			.append("path")
			.attr("d",
				"M" + (x1) + "," + (y1) +
				"L" + (x2) + "," + (y1) +
				"L" + (x2) + "," + (y2) +
				"L" + (x1) + "," + (y2) +
				"L" + (x1) + "," + (y1)
			)
			.style("fill-opacity", this.serie.getOpacity() * 0.25);
	}
};
D3ChartRenderer.prototype.renderZeroValueLine = function() {
	if (this.rangeAxis.expandedRange.contains(0.0)) {
		var x1, y1, x2;
		x1 = this.timeAxis.left;
		y1 = this.rangeAxis.valueTo2D(0.0);
		x2 = this.timeAxis.left + this.timeAxis.width;
		this.element
			.append("path")
			.attr("d",
				"M" + (x1) + "," + (y1) +
				"L" + (x2) + "," + (y1)
			)
			.style("stroke", this.serie.getColor())
			.style("stroke-width", 1.0)
			.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
			.style("fill", "none")
			.style("opacity", 1.0);
	}
};
D3ChartRenderer.prototype.render = function() {
	this.renderCheckElements();
	this.cursor(this.cursor());
	this.renderLimits();
	this.renderMe();
	this.renderZeroValueLine();
};
D3ChartRenderer.prototype.renderMe = function() {
	var data = this.serie.getData();
	if (data !== null) {
		var rows = data.length;
		if (rows > 0) {
			var row, col, x, y, v;
			var operation = "M";
			var paths = [];
			var points = [];
			var rowData = data[0];
			var r = this.serie.getThickness() * 2;
			var kA = this.serie.getKA();
			var kB = this.serie.getKB();
			for (col = 1; col < rowData.length; col++) {
				paths[col - 1] = "";
				points[col - 1] = [];
			}
			for (col = 0; col < paths.length; col++) {
				operation = "M";
				for (row = 0; row < rows; row++) {
					x = this.timeAxis.valueTo2D(data[row][0]);
					v = data[row][col + 1];
					if (!this.isValid(v)) {
						operation = "M";
					} else {
						y = this.rangeAxis.valueTo2D(v * kA + kB);
						paths[col] = paths[col] + operation + (x) + "," + (y);
						points[col].push({
							x: x,
							y: y
						});
						operation = "L";
					}
				}
			}
			for (col = 0; col < paths.length; col++) {
				this.element
					.append("path")
					.attr("d", paths[col])
					.style("fill", "none");
				if (rows <= 200) {
					var pnts = points[col];
					for (row = 0; row < pnts.length; row++) {
						var point = pnts[row];
						this.element
							.append("circle")
							.attr("cx", point.x)
							.attr("cy", point.y)
							.attr("r", r);
					}
				}
			}
		}
	}
};
D3ChartRenderer.prototype.isValid = function(v) {
	return ((v !== null) && (v !== undefined));
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartLineRenderer() {
	this.init("LineRenderer", arguments[0]);
}

extend(D3ChartLineRenderer, D3ChartRenderer);
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartBarRenderer() {
	this.init("BarRenderer", arguments[0]);
}

extend(D3ChartBarRenderer, D3ChartRenderer);

D3ChartBarRenderer.prototype.renderMe = function() {
	var x, y, row, col, v, w;
	var data = this.serie.getData();
	if (data !== null) {
		var rows = data.length;
		if (rows > 0) {
			var points = [];
			var rowData = data[0];
			var kA = this.serie.getKA();
			var kB = this.serie.getKB();
			for (col = 1; col < rowData.length; col++) {
				points[col - 1] = [];
			}
			var prevX = this.timeAxis.valueTo2D(data[0][0]) - 1;
			for (row = 0; row < rows; row++) {
				rowData = data[row];
				x = this.timeAxis.valueTo2D(rowData[0]);
				w = x - prevX;
				for (col = 1; col < rowData.length; col++) {
					v = rowData[col];
					if (this.isValid(v)) {
						break;
					}
					y = this.rangeAxis.valueTo2D(v * kA + kB);
					points[col - 1].push({
						x: x,
						y: y,
						w: w / (rowData.length + 1)
					});
				}
				prevX = x;
			}
			if (rows > 1) {
				rowData = data[0];
				for (col = 1; col < rowData.length; col++) {
					points[col - 1][0].w = points[col - 1][1].w;
				}
			}
			if (this.rangeAxis.expandedRange.contains(0.0)) {
				y = this.rangeAxis.valueTo2D(0.0);
			} else {
				y = this.rangeAxis.valueTo2D(this.serie.getLower_limit());
			}
			for (col = 0; col < points.length; col++) {
				var pnts = points[col];
				for (row = 0; row < pnts.length; row++) {
					var point = pnts[row];
					this.element
						.append("rect")
						.attr("x", point.x + (col - 0.5) * point.w)
						.attr("y", Math.min(point.y, y))
						.attr("width", point.w)
						.attr("height", Math.abs(point.y - y));
				}
			}
		}
	}
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartDifferenceRenderer() {
	this.init("DifferenceRenderer", arguments[0]);
}

extend(D3ChartDifferenceRenderer, D3ChartRenderer);

D3ChartDifferenceRenderer.prototype.renderMe = function() {
	var x1, y1, x2, y2, x, y, row, col, v, zeroY;
	var data = this.serie.getData();
	if (data !== null) {
		var rows = data.length;
		if (rows > 0) {
			var points = [];
			var rowData = data[0];
			var r = this.serie.getThickness() * 2;
			var kA = this.serie.getKA();
			var kB = this.serie.getKB();
			for (col = 1; col < rowData.length; col++) {
				points[col - 1] = [];
			}
			for (row = 0; row < rows; row++) {
				var flag = true;
				var ys = [];
				for (col = 0; col < points.length; col++) {
					x = this.timeAxis.valueTo2D(data[row][0]);
					v = data[row][col + 1];
					if (this.isValid(v)) {
						flag = false;
					} else {
						y = this.rangeAxis.valueTo2D(v * kA + kB);
						ys.push({
							x: x,
							y: y
						});
					}
				}
				if (flag) {
					for (col = 0; col < points.length; col++) {
						points[col].push(ys[col]);
					}
				}
			}
			var areas = this.element
				.append("g")
				.style("stroke-width", "0px")
				.style("stroke-opacity", 0.0)
				.style("fill-opacity", this.serie.getOpacity());
			var lines = this.element
				.append("g")
				.style("fill", "none")
				.style("stroke-opacity", this.serie.getOpacity())
				.style("fill-opacity", 0.0);
			zeroY = this.rangeAxis.valueTo2D(0.0);
			for (col = 0; col < points.length; col++) {
				for (row = 1; row < rows; row++) {
					x1 = points[col][row - 1].x;
					x2 = points[col][row].x;
					y1 = points[col][row - 1].y;
					y2 = points[col][row].y;
					var difY1 = y1 - zeroY;
					var difY2 = y2 - zeroY;
					if (Math.sign(difY1) == Math.sign(difY2)) {
						areas
							.append("path")
							.attr("d",
								"M" + (x1) + "," + (y1) +
								"L" + (x2) + "," + (y2) +
								"L" + (x2) + "," + (zeroY) +
								"L" + (x1) + "," + (zeroY) +
								"L" + (x1) + "," + (y1) +
								"Z"
							)
							.style("fill", Math.sign(difY1) >= 0 ? this.serie.getColor2() : this.serie.getColor());

					} else {
						var clr;
						if ((difY1 !== 0) && (difY2 !== 0)) {
							var xLength = x2 - x1;

							var zeroX = x1 + xLength * Math.abs(difY1 / difY2) / (1 + Math.abs(difY1 / difY2));
							clr = Math.sign(y1 - zeroY) >= 0 ? this.serie.getColor2() : this.serie.getColor();
							areas
								.append("path")
								.attr("d",
									"M" + (x1) + "," + (y1) +
									"L" + (zeroX) + "," + (zeroY) +
									"L" + (x1) + "," + (zeroY) +
									"L" + (x1) + "," + (y1) +
									"Z"
								)
								.style("fill", clr);

							clr = Math.sign(y2 - zeroY) >= 0 ? this.serie.getColor2() : this.serie.getColor();
							areas
								.append("path")
								.attr("d",
									"M" + (zeroX) + "," + (zeroY) +
									"L" + (x2) + "," + (y2) +
									"L" + (x2) + "," + (zeroY) +
									"L" + (zeroX) + "," + (zeroY) +
									"Z"
								)
								.style("fill", clr);
						} else {
							if (difY1 === 0) {
								clr = Math.sign(y2 - zeroY) >= 0 ? this.serie.getColor2() : this.serie.getColor();
							} else {
								clr = Math.sign(y1 - zeroY) >= 0 ? this.serie.getColor2() : this.serie.getColor();
							}
							areas
								.append("path")
								.attr("d",
									"M" + (x1) + "," + (y1) +
									"L" + (x2) + "," + (y2) +
									"L" + (x2) + "," + (zeroY) +
									"L" + (x1) + "," + (zeroY) +
									"L" + (x1) + "," + (y1) +
									"Z"
								)
								.style("fill", clr);
						}
					}
					lines
						.append("path")
						.attr("d",
							"M" + (x1) + "," + (y1) +
							"L" + (x2) + "," + (y2)
						)
						.style("stroke", "black");
					if (rows <= 200) {
						if (row == 1) {
							lines
								.append("circle")
								.attr("cx", x1)
								.attr("cy", y1)
								.attr("r", r);
						}
						lines
							.append("circle")
							.attr("cx", x2)
							.attr("cy", y2)
							.attr("r", r);
					}
				}
			}
		}
	}
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartStepRenderer() {
	this.init("StepRenderer", arguments[0]);
}

extend(D3ChartStepRenderer, D3ChartRenderer);

D3ChartStepRenderer.prototype.renderMe = function() {

	var data = this.serie.getData();
	if (data !== null) {
		var rows = data.length;
		if (rows > 0) {
			var row, col, x1, x2, y1, y2, v1, v2;
			var rowData = data[0];
			var r = this.serie.getThickness() * 2;
			var color = this.serie.getColor();
			var color2 = this.serie.getColor2();
			var kA = this.serie.getKA();
			var kB = this.serie.getKB();
			var cols = rowData.length;
			for (col = 0; col < cols; col++) {
				for (row = 1; row < rows; row++) {
					x1 = this.timeAxis.valueTo2D(data[row - 1][0]);
					x2 = this.timeAxis.valueTo2D(data[row][0]);
					v1 = data[row - 1][col + 1];
					v2 = data[row][col + 1];
					if (this.isValid(v1) && this.isValid(v2)) {
						y1 = this.rangeAxis.valueTo2D(v1 * kA + kB);
						y2 = this.rangeAxis.valueTo2D(v2 * kA + kB);
						this.element
							.append("path")
							.attr("d",
								"M" + (x1) + "," + (y1) +
								"L" + (x1) + "," + (y2) +
								"L" + (x2) + "," + (y2)
							)
							.style("stroke", y2 <= y1 ? color : color2)
							.style("fill", "none");
						if (rows <= 200) {
							if (row === 1) {
								this.element
									.append("circle")
									.attr("cx", x1)
									.attr("cy", y1)
									.attr("r", r);
							}
							this.element
								.append("circle")
								.attr("cx", x2)
								.attr("cy", y2)
								.attr("r", r);
						}
					}
				}
			}
		}
	}
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartCandlestickRenderer() {
	this.init("CandlestickRenderer", arguments[0]);
}

extend(D3ChartCandlestickRenderer, D3ChartRenderer);

D3ChartCandlestickRenderer.prototype.cursor = function() {
	if (arguments.length === 0) {
		return this.cursorValue;
	} else if (arguments.length == 1) {
		this.cursorValue = arguments[0];
		var data = this.serie.getData();
		this.elementCursorValue[0][0].innerHTML = "";
		if (data !== null) {
			var cursorIndex = this.serie.getIndexOf(this.cursorValue);
			if (cursorIndex < 0) {
				cursorIndex = cursorIndex + 1;
				cursorIndex = -1 * cursorIndex;
				cursorIndex = cursorIndex === 0 ? cursorIndex : cursorIndex - 1;
			}
			if ((cursorIndex >= 0) && (cursorIndex <= data.length - 1)) {
				var cursorRow = data[cursorIndex];
				var kA = this.serie.getKA();
				var kB = this.serie.getKB();
				var bounds = {
					left: this.timeAxis.left,
					right: this.timeAxis.left + this.timeAxis.width,
					top: this.rangeAxis.top,
					bottom: this.timeAxis.top
				};
				if (cursorRow.length == 6) {
					var color = this.serie.getColor();
					var color2 = this.serie.getColor2();
					var r = this.serie.getThickness() * 2;
					var y1 = this.rangeAxis.valueTo2D(cursorRow[2] * kA + kB);
					var y2 = this.rangeAxis.valueTo2D(cursorRow[3] * kA + kB);
					var y = (y1 + y2) / 2;
					var openLabel = this.rangeAxis.getTickUnit().valueToString(cursorRow[1] * kA + kB);
					var highLabel = this.rangeAxis.getTickUnit().valueToString(cursorRow[2] * kA + kB);
					var lowLabel = this.rangeAxis.getTickUnit().valueToString(cursorRow[3] * kA + kB);
					var closeLabel = this.rangeAxis.getTickUnit().valueToString(cursorRow[4] * kA + kB);
					var volumeLabel = (cursorRow[5]).toString();
					var yLabel = "O:" + openLabel + " C:" + closeLabel + " H:" + highLabel + " L:" + lowLabel + " V:" + volumeLabel;
					var w = getTextWidth(yLabel, (this.rangeAxis.tickLabelFontSize * 1.2) + "px " + this.rangeAxis.tickLabelFontWeight + " " + this.rangeAxis.tickLabelFontFamily) + 8;
					var h = this.rangeAxis.tickLabelFontSize * 1.1 + 8;
					var x = this.timeAxis.valueTo2D(cursorRow[0]);
					x = Math.max(x, bounds.left);
					if (x + w > bounds.right) x = x - w;
					y = Math.max(y, bounds.top);
					if (y + h > bounds.bottom) y = y - h;
					this.elementCursorValue
						.append("circle")
						.attr("cx", x)
						.attr("cy", y)
						.attr("r", r)
						.style("stroke", "black")
						.style("fill", "none");
					this.elementCursorValue
						.append("rect")
						.attr("x", x)
						.attr("y", y)
						.attr("width", w)
						.attr("height", h)
						.style("stroke", "white")
						.style("fill", cursorRow[4] >= cursorRow[1] ? color : color2);
					this.elementCursorValue
						.append("text")
						.attr("x", x + w / 2)
						.attr("y", y + h / 2)
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "middle")
						.style("stroke", "white")
						.style("fill", "white")
						.text(yLabel);

				}
			}
		}
	}
};
D3ChartCandlestickRenderer.prototype.renderMe = function() {
	var y1, y2, x, y, y3, y4, row, v1, v2, v3, v4, v5, w;
	var data = this.serie.getData();
	if (data !== null) {
		var rows = data.length;
		if (rows > 0) {
			var points = [];
			var rowData = data[0];
			var cols = rowData.length;
			if (cols === 6) {
				var r = this.serie.getThickness() * 2;
				var color = this.serie.getColor();
				var color2 = this.serie.getColor2();
				var kA = this.serie.getKA();
				var kB = this.serie.getKB();
				var volumeOpacity = this.serie.getOpacity() * 0.25;
				var prevX = this.timeAxis.valueTo2D(data[0][0]) - 1;
				var maxVolume = 1;
				for (row = 0; row < rows; row++) {
					rowData = data[row];
					x = this.timeAxis.valueTo2D(rowData[0]);
					w = x - prevX;
					v1 = rowData[1];
					v2 = rowData[2];
					v3 = rowData[3];
					v4 = rowData[4];
					v5 = rowData[5];
					if (!(this.isValid(v1) && this.isValid(v2) && this.isValid(v3) && this.isValid(v4) && this.isValid(v5))) {
						continue;
					}
					y1 = this.rangeAxis.valueTo2D(v1 * kA + kB);
					y2 = this.rangeAxis.valueTo2D(v2 * kA + kB);
					y3 = this.rangeAxis.valueTo2D(v3 * kA + kB);
					y4 = this.rangeAxis.valueTo2D(v4 * kA + kB);
					points.push({
						x: x,
						o: y1,
						h: y2,
						l: y3,
						c: y4,
						v: v5,
						w: w / 2
					});
					prevX = x;
					maxVolume = Math.max(maxVolume, v5);
				}
				if (rows > 1) {
					points[0].w = points[1].w;
				}
				y = this.rangeAxis.valueTo2D(this.serie.getLower_limit());
				if (this.rangeAxis.expandedRange.contains(0.0)) {
					y = this.rangeAxis.valueTo2D(0.0);
				} else {
					y = this.rangeAxis.valueTo2D(this.serie.getLower_limit());
				}
				for (row = 0; row < points.length; row++) {
					var point = points[row];
					var volumeHeight = point.v / maxVolume * this.rangeAxis.height * 0.25;
					var volumeY = this.rangeAxis.top + this.rangeAxis.height - volumeHeight;
					this.element
						.append("rect")
						.attr("x", point.x - 0.5 * point.w)
						.attr("y", volumeY)
						.attr("width", point.w)
						.attr("height", volumeHeight)
						.style("stroke", "black")
						.style("fill", "black")
						.style("stroke-opacity", volumeOpacity)
						.style("fill-opacity", volumeOpacity * 0.5);
					this.element
						.append("path")
						.attr("d",
							"M" + (point.x) + "," + (point.l) +
							"L" + (point.x) + "," + (point.h) +
							"M" + (point.x - 0.25 * point.w) + "," + (point.l) +
							"L" + (point.x + 0.25 * point.w) + "," + (point.l) +
							"M" + (point.x - 0.25 * point.w) + "," + (point.h) +
							"L" + (point.x + 0.25 * point.w) + "," + (point.h)
						)
						.style("stroke", point.o >= point.c ? color : color2)
						.style("stroke-width", r);
					this.element
						.append("rect")
						.attr("x", point.x - 0.5 * point.w)
						.attr("y", Math.min(point.o, point.c))
						.attr("width", point.w)
						.attr("height", Math.abs(point.c - point.o))
						.style("stroke", "none")
						.style("fill", point.o >= point.c ? color : color2);
				}
			}
		}
	}
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartBlockRenderer() {
	this.init("BlockRenderer", arguments[0]);
}

extend(D3ChartBlockRenderer, D3ChartRenderer);

D3ChartBlockRenderer.prototype.updateLookupTable = function(lowerBound, upperBound) {
	this.lookupTable = [];
	var minZ = lowerBound;
	var maxZ = upperBound;
	var increments = (maxZ - minZ) / 4;
	if (minZ == maxZ) maxZ++;
	this.lookupTable.push({
		v: minZ,
		r: 0,
		g: 0,
		b: 255
	});
	this.lookupTable.push({
		v: minZ + increments * 1,
		r: 0,
		g: 255,
		b: 0
	});
	this.lookupTable.push({
		v: minZ + increments * 2,
		r: 255,
		g: 255,
		b: 0
	});
	this.lookupTable.push({
		v: minZ + increments * 3,
		r: 255,
		g: 165,
		b: 0
	});
	this.lookupTable.push({
		v: minZ + increments * 4,
		r: 255,
		g: 0,
		b: 0
	});
};
D3ChartBlockRenderer.prototype.mapColor = function(value, lowerBound, upperBound) {
	var defaultColor = "rgb(255,255,255)";
	var minZ = lowerBound;
	var maxZ = upperBound;
	if (minZ == maxZ) maxZ++;

	if (value < minZ) {
		return this.defaultColor;
	}
	if (value > maxZ) {
		return this.defaultColor;
	}
	var count = this.lookupTable.length;
	if (count === 0) {
		return defaultColor;
	}
	var item = this.lookupTable[0];
	if (value < item.v) {
		return defaultColor;
	}
	var low = 0;
	var high = this.lookupTable.length - 1;
	while (high - low > 1) {
		var current = (low + high) >>> 1;
		item = this.lookupTable[current];
		if (value >= item.v) {
			low = current;
		} else {
			high = current;
		}
	}
	if (high > low) {
		item = this.lookupTable[high];
		if (value < item.v) {
			var item2 = this.lookupTable[low];
			var k = item.v == item2.v ? 1.0 : (value - item2.v) / (item.v - item2.v);
			item = {
				v: value,
				r: Math.floor((item.r - item2.r) * k + item2.r),
				g: Math.floor((item.g - item2.g) * k + item2.g),
				b: Math.floor((item.b - item2.b) * k + item2.b)
			};
			return "rgb(" + (item.r) + "," + (item.g) + "," + (item.b) + ")";
		}
	}
	return defaultColor;
};
D3ChartBlockRenderer.prototype.cursor = function() {
	if (arguments.length === 0) {
		return this.cursorValue;
	} else if (arguments.length == 1) {
		this.cursorValue = arguments[0];
		var data = this.serie.getData();
		this.elementCursorValue[0][0].innerHTML = "";
		if (data !== null) {
			var cursorIndex = this.serie.getIndexOf(this.cursorValue);
			if (cursorIndex < 0) {
				cursorIndex = cursorIndex + 1;
				cursorIndex = -1 * cursorIndex;
				cursorIndex = cursorIndex === 0 ? cursorIndex : cursorIndex - 1;
			}
			if ((cursorIndex >= 0) && (cursorIndex <= data.length - 1)) {
				var startCursorIndex = cursorIndex;
				var finishCursorIndex = cursorIndex;
				while ((startCursorIndex >= 0) && (data[startCursorIndex][0] == data[cursorIndex][0])) {
					startCursorIndex--;
				}
				startCursorIndex = Math.max(startCursorIndex, 0);
				if (data[startCursorIndex][0] != data[cursorIndex][0]) {
					startCursorIndex++;
				}
				while ((finishCursorIndex < data.length) && (data[finishCursorIndex][0] == data[cursorIndex][0])) {
					finishCursorIndex++;
				}
				finishCursorIndex = Math.min(finishCursorIndex, data.length - 1);
				if (data[finishCursorIndex][0] != data[cursorIndex][0]) {
					finishCursorIndex--;
				}
				if ((startCursorIndex >= 0) && (finishCursorIndex >= 0)) {
					var cursorRow = data[cursorIndex];
					if (cursorRow.length == 3) {
						var kA = this.serie.getKA();
						var kB = this.serie.getKB();
						var bounds = {
							left: this.timeAxis.left,
							right: this.timeAxis.left + this.timeAxis.width,
							top: this.rangeAxis.top,
							bottom: this.timeAxis.top
						};
						var color = this.serie.getColor();
						var r = this.serie.getThickness() * 2;
						for (cursorIndex = startCursorIndex; cursorIndex <= finishCursorIndex; cursorIndex++) {
							cursorRow = data[cursorIndex];
							var price = cursorRow[1] * kA + kB;
							var volume = cursorRow[2];
							var y = this.rangeAxis.valueTo2D(price);
							var priceLabel = this.rangeAxis.getTickUnit().valueToString(price);
							var label = priceLabel + " / " + (volume);
							var w = getTextWidth(label, (this.rangeAxis.tickLabelFontSize * 1.2) + "px " + this.rangeAxis.tickLabelFontWeight + " " + this.rangeAxis.tickLabelFontFamily) + 8;
							var h = this.rangeAxis.tickLabelFontSize * 1.1 + 8;
							var cy = y;
							var x = this.timeAxis.valueTo2D(cursorRow[0]);
							var cx = x;
							x = Math.max(x, bounds.left);
							if (x + w > bounds.right) x = x - w;
							y = Math.max(y, bounds.top);
							if (y + h > bounds.bottom) y = y - h;
							this.elementCursorValue
								.append("circle")
								.attr("cx", cx)
								.attr("cy", cy)
								.attr("r", r)
								.style("stroke", "black")
								.style("fill", "none");
							this.elementCursorValue
								.append("rect")
								.attr("x", x)
								.attr("y", y)
								.attr("width", w)
								.attr("height", h)
								.style("stroke", "white")
								.style("fill", color);
							this.elementCursorValue
								.append("text")
								.attr("x", x + w / 2)
								.attr("y", y + h / 2)
								.attr("text-anchor", "middle")
								.attr("alignment-baseline", "middle")
								.style("stroke", "white")
								.style("fill", "white")
								.text(label);
						}
					}
				}
			}
		}
	}
};
D3ChartBlockRenderer.prototype.renderMe = function() {
	var y1, x, row, v1, v2;
	var data = this.serie.getData();
	if (data !== null) {
		var rows = data.length;
		if (rows > 0) {
			var points = [];
			var rowData = data[0];
			var cols = rowData.length;
			if (cols === 3) {
				var kA = this.serie.getKA();
				var kB = this.serie.getKB();
				var minVolume = Number.MAX_VALUE;
				var maxVolume = -Number.MAX_VALUE;
				var minPriceDif = Number.MAX_VALUE;
				var opacity = this.serie.getOpacity();
				var prevPrice = data[0][1];
				for (row = 0; row < rows; row++) {
					rowData = data[row];
					x = this.timeAxis.valueTo2D(rowData[0]);
					v1 = rowData[1];
					v2 = rowData[2];
					if (!(this.isValid(v1) && this.isValid(v2))) {
						continue;
					}
					var priceDif = Math.abs(v1 - prevPrice);
					minPriceDif = priceDif === 0 ? minPriceDif : Math.min(minPriceDif, Math.max(priceDif, 0.0));
					prevPrice = v1;
					y1 = this.rangeAxis.valueTo2D(v1 * kA + kB);
					points.push({
						x: x,
						y: y1,
						v: v2
					});
					minVolume = Math.min(minVolume, v2);
					maxVolume = Math.max(maxVolume, v2);
				}
				var blockWidth = Math.max(this.timeAxis.lengthTo2D(1000), 1);
				var blockHeight = Math.max(this.rangeAxis.lengthTo2D(minPriceDif), 1);
				this.updateLookupTable(minVolume, maxVolume);
				for (row = 0; row < points.length; row++) {
					var point = points[row];
					var volumeColor = this.mapColor(point.v, minVolume, maxVolume);
					this.element
						.append("rect")
						.attr("x", point.x - 0.5 * blockWidth)
						.attr("y", point.y - 0.5 * blockHeight)
						.attr("width", blockWidth)
						.attr("height", blockHeight)
						.style("stroke", "none")
						.style("fill", volumeColor)
						.style("stroke-opacity", 0.0)
						.style("fill-opacity", opacity);
				}
			}
		}
	}
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3ChartNonStandardRenderer() {
	this.init("NonStandardRenderer", arguments[0]);
}

extend(D3ChartNonStandardRenderer, D3ChartRenderer);

D3ChartNonStandardRenderer.prototype.renderCheckElements = function() {
	if (d3.select("#" + this.id)[0][0] === null) {
		this.element = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.id)
			.style("stroke", this.serie.getColor())
			.style("stroke-width", this.serie.getThickness())
			.style("stroke-dasharray", this.serie.getLinestyle())
			.style("fill", this.serie.getColor())
			.style("opacity", 1.0)
			.style("font-family", this.rangeAxis.tickLabelFontFamily)
			.style("font-weight", this.rangeAxis.tickLabelFontWeight)
			.style("font-size", this.rangeAxis.tickLabelFontSize);
	}
	if (d3.select("#" + this.idCursorValue)[0][0] === null) {
		this.elementCursorValue = d3.select("#" + this.rootId)
			.append("g")
			.attr("id", this.idCursorValue)
			.style("display", this.showCursorValue ? "block" : "none")
			.style("stroke", this.serie.getColor())
			.style("stroke-width", 1.0)
			.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
			.style("fill", this.serie.getColor())
			.style("opacity", 1.0)
			.style("font-family", this.rangeAxis.tickLabelFontFamily)
			.style("font-weight", this.rangeAxis.tickLabelFontWeight)
			.style("font-size", this.rangeAxis.tickLabelFontSize * 1.1);
	}
};
D3ChartNonStandardRenderer.prototype.cursor = function() {
	if (arguments.length === 0) {
		return this.cursorValue;
	} else if (arguments.length == 1) {
		this.cursorValue = arguments[0];
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_VLine = function() {
	var row, x, v;
	var data = this.serie.getData();
	var rowData = data[0];
	if (rowData.length == 2) {
		var lowY = this.rangeAxis.valueTo2D(this.rangeAxis.expandedRange.getLowerBound());
		var highY = this.rangeAxis.valueTo2D(this.rangeAxis.expandedRange.getUpperBound());
		var centralY = this.rangeAxis.valueTo2D(this.rangeAxis.expandedRange.getCentralValue());
		var inverted = this.serie.isInvertedAxe();
		var tickUnit = this.timeAxis.getTickUnit();
		var rows = data.length;
		for (row = 0; row < rows; row++) {
			var ts = data[row][0];
			x = this.timeAxis.valueTo2D(ts);
			v = data[row][1];
			if (!this.isValid(v)) {
				continue;
			} else {
				this.element
					.append("path")
					.attr("d", "M" + (x) + "," + (lowY) + "L" + (x) + "," + (highY))
					.style("opacity", 1.0);
				this.element
					.append("text")
					.attr("x", x)
					.attr("y", inverted ? lowY : highY)
					.attr("text-anchor", "end")
					.attr("alignment-baseline", "baseline")
					.attr("transform", "rotate(-90 " + (x) + "," + (inverted ? lowY : highY) + ")")
					.style("opacity", 1.0)
					.text(tickUnit.valueToString(ts));
				if (typeName(v) == "string") {
					this.element
						.append("text")
						.attr("x", x)
						.attr("y", centralY)
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "baseline")
						.attr("transform", "rotate(-90 " + (x) + "," + (centralY) + ")")
						.style("opacity", 1.0)
						.text(v);
				}
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_VZone = function() {
	var row, x1, x2, v1, v2;
	var data = this.serie.getData();
	var rowData = data[0];
	if (data.length > 1) {
		if (rowData.length == 2) {
			var lowY = this.rangeAxis.valueTo2D(this.rangeAxis.expandedRange.getLowerBound());
			var highY = this.rangeAxis.valueTo2D(this.rangeAxis.expandedRange.getUpperBound());
			var centralY = this.rangeAxis.valueTo2D(this.rangeAxis.expandedRange.getCentralValue());
			var inverted = this.serie.isInvertedAxe();
			var tickUnit = this.timeAxis.getTickUnit();
			var opacity = this.serie.getOpacity();
			var rows = Math.floor(data.length / 2) * 2;
			for (row = 0; row < rows; row = row + 2) {
				var ts1 = data[row][0];
				var ts2 = data[row + 1][0];
				x1 = this.timeAxis.valueTo2D(ts1);
				x2 = this.timeAxis.valueTo2D(ts2);
				v1 = data[row][1];
				v2 = data[row + 1][1];
				if (!(this.isValid(v1) && this.isValid(v2))) {
					continue;
				} else {
					this.element
						.append("rect")
						.attr("x", Math.min(x1, x2))
						.attr("y", Math.min(lowY, highY))
						.attr("width", Math.abs(x2 - x1))
						.attr("height", Math.abs(highY - lowY))
						.style("stroke-opacity", 1.0)
						.style("fill-opacity", opacity);
					this.element
						.append("text")
						.attr("x", x1)
						.attr("y", inverted ? lowY : highY)
						.attr("text-anchor", "end")
						.attr("alignment-baseline", "baseline")
						.attr("transform", "rotate(-90 " + (x1) + "," + (inverted ? lowY : highY) + ")")
						.style("opacity", 1.0)
						.text(tickUnit.valueToString(ts1));
					this.element
						.append("text")
						.attr("x", x2)
						.attr("y", centralY)
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "hanging")
						.attr("transform", "rotate(-90 " + (x2) + "," + (centralY) + ")")
						.style("opacity", 1.0)
						.text(tickUnit.valueToString(ts2));
				}
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_HLine = function() {
	var row, y, v;
	var data = this.serie.getData();
	var rowData = data[0];
	var kA = this.serie.getKA();
	var kB = this.serie.getKB();
	if (rowData.length == 2) {
		var lowX = this.timeAxis.left;
		var highX = this.timeAxis.left + this.timeAxis.width;
		var tickUnit = this.rangeAxis.getTickUnit();
		var rows = data.length;
		for (row = 0; row < rows; row++) {
			v = data[row][1];
			if (!this.isValid(v)) {
				continue;
			} else {
				y = this.rangeAxis.valueTo2D(v * kA + kB);
				this.element
					.append("path")
					.attr("d", "M" + (lowX) + "," + (y) + "L" + (highX) + "," + (y))
					.style("opacity", 1.0);
				this.element
					.append("text")
					.attr("x", lowX)
					.attr("y", y)
					.attr("text-anchor", "start")
					.attr("alignment-baseline", "baseline")
					.style("opacity", 1.0)
					.text(tickUnit.valueToString(v));
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_HZone = function() {
	var row, y1, y2, v1, v2;
	var data = this.serie.getData();
	var rowData = data[0];
	var kA = this.serie.getKA();
	var kB = this.serie.getKB();
	if (data.length > 1) {
		if (rowData.length == 2) {
			var lowX = this.timeAxis.left;
			var highX = this.timeAxis.left + this.timeAxis.width;
			var tickUnit = this.rangeAxis.getTickUnit();
			var opacity = this.serie.getOpacity();
			var rows = Math.floor(data.length / 2) * 2;
			for (row = 0; row < rows; row = row + 2) {
				v1 = data[row][1];
				v2 = data[row + 1][1];
				if (!(this.isValid(v1) && this.isValid(v2))) {
					continue;
				} else {
					y1 = this.rangeAxis.valueTo2D(v1 * kA + kB);
					y2 = this.rangeAxis.valueTo2D(v2 * kA + kB);
					this.element
						.append("rect")
						.attr("x", lowX)
						.attr("y", Math.min(y1, y2))
						.attr("width", Math.abs(highX - lowX))
						.attr("height", Math.abs(y2 - y1))
						.style("stroke-opacity", 1.0)
						.style("fill-opacity", opacity);
					this.element
						.append("text")
						.attr("x", lowX)
						.attr("y", y1)
						.attr("text-anchor", "left")
						.attr("alignment-baseline", "baseline")
						.style("opacity", 1.0)
						.text(tickUnit.valueToString(v1));
					this.element
						.append("text")
						.attr("x", lowX)
						.attr("y", y2)
						.attr("text-anchor", "left")
						.attr("alignment-baseline", "baseline")
						.style("opacity", 1.0)
						.text(tickUnit.valueToString(v2));
				}
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_Trendline = function() {
	var row, x1, x2, x3, y1, y2, y3, v1, v2;
	var data = this.serie.getData();
	var rowData = data[0];
	if (data.length > 1) {
		if (rowData.length == 2) {
			var r = this.serie.getThickness() * 2;
			var opacity = this.serie.getOpacity();
			var rows = Math.floor(data.length / 2) * 2;
			for (row = 0; row < rows; row = row + 2) {
				var ts1 = data[row][0];
				var ts2 = data[row + 1][0];
				x1 = this.timeAxis.valueTo2D(ts1);
				x2 = this.timeAxis.valueTo2D(ts2);
				v1 = data[row][1];
				v2 = data[row + 1][1];
				if (!(this.isValid(v1) && this.isValid(v2))) {
					continue;
				} else {
					y1 = this.rangeAxis.valueTo2D(v1);
					y2 = this.rangeAxis.valueTo2D(v2);
					x3 = 0;
					y3 = 0;
					if (x1 < x2) {
						x3 = this.timeAxis.left + this.timeAxis.width;
						y3 = (x3 - x1) / (x2 - x1) * (y2 - y1) + y1;
					} else if (x1 > x2) {
						x3 = this.timeAxis.left;
						y3 = (x3 - x1) / (x2 - x1) * (y2 - y1) + y1;
					}
					if (x1 == x2) {
						x3 = x1;
						if (y1 < y2) {
							y3 = this.rangeAxis.valueto2D(this.rangeAxis.getUpperBound());
						} else {
							y3 = this.rangeAxis.valueto2D(this.rangeAxis.getLowerBound());
						}
					}
					this.element
						.append("path")
						.attr("d", "M" + (x1) + "," + (y1) + "L" + (x2) + "," + (y2))
						.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
						.style("opacity", opacity);
					this.element
						.append("path")
						.attr("d", "M" + (x2) + "," + (y2) + "L" + (x3) + "," + (y3))
						.style("stroke-dasharray", PlotSerieStyle.DashedLineStyle)
						.style("opacity", opacity);
					if (rows < 200) {
						this.element
							.append("circle")
							.attr("cx", x1)
							.attr("cy", y1)
							.attr("r", r)
							.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
							.style("opacity", opacity);
						this.element
							.append("circle")
							.attr("cx", x2)
							.attr("cy", y2)
							.attr("r", r)
							.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
							.style("opacity", opacity);
					}
				}
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_LeftValueMark = function() {
	var row, x, y, v;
	var data = this.serie.getData();
	var rowData = data[0];
	var kA = this.serie.getKA();
	var kB = this.serie.getKB();
	if (rowData.length == 2) {
		var r = this.serie.getThickness() * 2;
		var opacity = this.serie.getOpacity();
		var tickUnit = this.rangeAxis.getTickUnit();
		var rows = data.length;
		for (row = 0; row < rows; row++) {
			v = data[row][1];
			if (!this.isValid(v)) {
				continue;
			} else {
				x = this.timeAxis.valueTo2D(data[row][0]);
				y = this.rangeAxis.valueTo2D(v * kA + kB);
				this.element
					.append("path")
					.attr("d", "M" + (x - 5) + "," + (y) + "L" + (x) + "," + (y))
					.style("opacity", opacity);
				this.element
					.append("text")
					.attr("x", x - 5)
					.attr("y", y)
					.attr("text-anchor", "end")
					.attr("alignment-baseline", "middle")
					.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
					.style("opacity", opacity)
					.text(tickUnit.valueToString(v));
				if (rows < 200) {
					this.element
						.append("circle")
						.attr("cx", x)
						.attr("cy", y)
						.attr("r", r)
						.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
						.style("opacity", opacity);
				}
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_RightValueMark = function() {
	var row, x, y, v;
	var data = this.serie.getData();
	var rowData = data[0];
	var kA = this.serie.getKA();
	var kB = this.serie.getKB();
	if (rowData.length == 2) {
		var r = this.serie.getThickness() * 2;
		var opacity = this.serie.getOpacity();
		var tickUnit = this.rangeAxis.getTickUnit();
		var rows = data.length;
		for (row = 0; row < rows; row++) {
			v = data[row][1];
			if (!this.isValid(v)) {
				continue;
			} else {
				x = this.timeAxis.valueTo2D(data[row][0]);
				y = this.rangeAxis.valueTo2D(v * kA + kB);
				this.element
					.append("path")
					.attr("d", "M" + (x + 5) + "," + (y) + "L" + (x) + "," + (y))
					.style("opacity", opacity);
				this.element
					.append("text")
					.attr("x", x + 5)
					.attr("y", y)
					.attr("text-anchor", "start")
					.attr("alignment-baseline", "middle")
					.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
					.style("opacity", opacity)
					.text(tickUnit.valueToString(v));
				if (rows < 200) {
					this.element
						.append("circle")
						.attr("cx", x)
						.attr("cy", y)
						.attr("r", r)
						.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
						.style("opacity", opacity);
				}
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_Symbol = function() {
	var row, x, y, v;
	var data = this.serie.getData();
	var rowData = data[0];
	var kA = this.serie.getKA();
	var kB = this.serie.getKB();
	var symbol = String.fromCharCode(this.serie.getSymbolcode());
	if (rowData.length == 2) {
		var opacity = this.serie.getOpacity();
		var rows = data.length;
		for (row = 0; row < rows; row++) {
			v = data[row][1];
			if (!this.isValid(v)) {
				continue;
			} else {
				x = this.timeAxis.valueTo2D(data[row][0]);
				y = this.rangeAxis.valueTo2D(v * kA + kB);
				this.element
					.append("text")
					.attr("x", x)
					.attr("y", y)
					.attr("text-anchor", "middle")
					.attr("alignment-baseline", "middle")
					.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
					.style("opacity", opacity)
					.text(symbol);
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_Profile = function() {
	var row, x1, x2, y1, y2, v1, v2, v;
	var data = this.serie.getData();
	var rowData = data[0];
	var color = this.serie.getColor();
	var kA = this.serie.getKA();
	var kB = this.serie.getKB();
	if (rowData.length == 2) {
		var opacity = this.serie.getOpacity();
		var rows = data.length;
		var maxValue = -Number.MAX_VALUE;
		var lowX = this.timeAxis.left;
		var highX = this.timeAxis.left + this.timeAxis.width;
		var difX = (highX - lowX) * 0.25;
		for (row = 0; row < rows; row++) {
			v = data[row][1];
			if (!this.isValid(v)) {
				continue;
			} else {
				maxValue = Math.max(maxValue, v);
			}
		}
		x1 = lowX;
		x2 = highX;
		for (row = 0; row < rows; row++) {
			v1 = data[row][0];
			if (!(this.isValid(v1) && (this.isValid(data[row][1])))) {
				continue;
			} else {
				x2 = lowX + data[row][1] / maxValue * difX;
				y1 = this.rangeAxis.valueTo2D(v1 * kA + kB);
				if (row < rows - 1) {
					v2 = data[row + 1][0];
				} else {
					v2 = data[row - 1][0];
				}
				if (!this.isValid(v2)) {
					continue;
				} else {
					y2 = this.rangeAxis.valueTo2D(v2);
					this.element
						.append("rect")
						.attr("x", x1)
						.attr("y", Math.min(y1, y2))
						.attr("width", Math.abs(x2 - x1))
						.attr("height", Math.abs(y2 - y1))
						.style("stroke", "black")
						.style("fill", color)
						.style("opacity", opacity);
				}
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe_Section = function() {
	var row, x1, x2, y1, y2, v1, v2;
	var data = this.serie.getData();
	var rowData = data[0];
	if (data.length > 1) {
		if (rowData.length == 2) {
			var r = this.serie.getThickness() * 2;
			var opacity = this.serie.getOpacity();
			var rows = Math.floor(data.length / 2) * 2;
			for (row = 0; row < rows; row = row + 2) {
				var ts1 = data[row][0];
				var ts2 = data[row + 1][0];
				x1 = this.timeAxis.valueTo2D(ts1);
				x2 = this.timeAxis.valueTo2D(ts2);
				v1 = data[row][1];
				v2 = data[row + 1][1];
				if (!(this.isValid(v1) && this.isValid(v2))) {
					continue;
				} else {
					y1 = this.rangeAxis.valueTo2D(v1);
					y2 = this.rangeAxis.valueTo2D(v2);
					this.element
						.append("path")
						.attr("d", "M" + (x1) + "," + (y1) + "L" + (x2) + "," + (y2));
					if (rows < 200) {
						this.element
							.append("circle")
							.attr("cx", x1)
							.attr("cy", y1)
							.attr("r", r)
							.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
							.style("opacity", opacity);
						this.element
							.append("circle")
							.attr("cx", x2)
							.attr("cy", y2)
							.attr("r", r)
							.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
							.style("opacity", opacity);
					}
				}
			}
		}
	}
};
D3ChartNonStandardRenderer.prototype.renderMe = function() {
	var data = this.serie.getData();
	if (data !== null) {
		var rows = data.length;
		if (rows > 0) {
			var serieType = this.serie.getType();
			switch (serieType) {
				case PlotSerieType.VLineType:
					this.renderMe_VLine();
					break;
				case PlotSerieType.VZoneType:
					this.renderMe_VZone();
					break;
				case PlotSerieType.SectionType:
					this.renderMe_Section();
					break;
				case PlotSerieType.HLineType:
					this.renderMe_HLine();
					break;
				case PlotSerieType.HZoneType:
					this.renderMe_HZone();
					break;
				case PlotSerieType.TrendlineType:
					this.renderMe_Trendline();
					break;
				case PlotSerieType.LeftValueMarkType:
					this.renderMe_LeftValueMark();
					break;
				case PlotSerieType.RightValueMarkType:
					this.renderMe_RightValueMark();
					break;
				case PlotSerieType.SymbolType:
					this.renderMe_Symbol();
					break;
				case PlotSerieType.ProfileType:
					this.renderMe_Profile();
					break;
				default:
					break;
			}
		}
	}
};

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
function D3Chart(containerId, sizerId) {
	this.datasets = [];
	this.selectedDataset = 0;
	this.zoom = {
		left: 0.0,
		right: 1.0,
		top: 0.0,
		bottom: 1.0
	};
	this.margins = {
		left: 0.05,
		right: 0.03,
		top: 0.05,
		bottom: 0.1
	};
	this.timeAxisMargins = {
		left: 0.0,
		right: 0.0
	};
	this.zoomMode = false;
	this.zoomVisible = false;
	this.zoomPoint = {
		x: 0,
		y: 0
	};
	this.zoomPoint2 = {
		x: 0,
		y: 0
	};
	this.series = [new PlotSerie()];
	this.separateGroups = false;
	this.timeAxisLimits = undefined;
	this.timeAxisLabel = "Дата и время";
	this.rangeAxisLabel = "Группа";
	this.weekdays = 7;
	this.weekends = 0;
	this.label = "График";
	this.fontSize = 10;
	this.fontFamily = "arial";
	this.fontWeight = "normal";
	this.domainCrosshairVisible = true;
	this.rangeCrosshairVisible = true;
	this.showCursorValue = true;


	this.containerId = containerId;
	this.sizerId = sizerId;
	this.backId = this.containerId + "Back";
	this.frontId = this.containerId + "Front";
	this.rootAxisId = this.containerId + "RootAxis";
	this.rootPlotsId = this.containerId + "RootPlot";
	this.svgId = this.containerId + "SVG";
	this.sizer = document.getElementById(this.sizerId);
	this.container = document.getElementById(this.containerId);
	this.container.innerHTML = "";
	this.svg = d3.select("#" + this.containerId).append("svg")
		.attr("id", this.svgId)
		.attr("width", this.width)
		.attr("height", this.height)
		.attr("cursor", "crosshair");
	this.svg = d3.select("#" + this.svgId);
	this.idClipPath = this.rootPlotsId + "ClipPath";
	this.clipPath = this.svg
		.append("defs")
		.append("clipPath")
		.attr("id", this.idClipPath)
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 1)
		.attr("height", 1);
	this.svg
		.append("g")
		.attr("id", this.backId);
	this.svg
		.append("g")
		.attr("id", this.rootAxisId);
	this.svg
		.append("g")
		.attr("id", this.rootPlotsId)
		.attr("clip-path", "url(#" + this.idClipPath + ")");
	this.svg
		.append("g")
		.attr("id", this.frontId);

	this.resizeSelf();

	this.background = new D3ChartBackground({
		rootId: this.backId,
		left: 0,
		top: 0,
		width: this.width,
		height: this.height,
		stroke: "#000000",
		strokeWidth: 1.0,
		strokeDashArray: PlotSerieStyle.SolidLineStyle,
		fill: "#ffffff",
		opacity: 1.0
	});

	this.labelElement = d3.select("#" + this.backId)
		.append("text")
		.attr("id", this.backId + "Caption")
		.attr("x", this.getCaptionX())
		.attr("y", this.getCaptionY())
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "middle")
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
		.style("fill", "black")
		.style("opacity", 1.0)
		.style("font-family", this.fontFamily)
		.style("font-weight", this.fontWeight)
		.style("font-size", this.getCaptionFontSize())
		.text(this.label);

	this.grid = new D3ChartGrid({
		rootId: this.backId,
		left: this.width * this.margins.left,
		top: this.height * this.margins.top,
		width: this.width * (1 - this.margins.left - this.margins.right),
		height: this.height * (1 - this.margins.top - this.margins.bottom),
		stroke: "#000000",
		strokeWidth: 1.0,
		strokeDashArray: PlotSerieStyle.GridLineStyle,
		fill: "#e0e0e0",
		opacity: 1.0,
		xStep: 100,
		yStep: 50,
		xOffset: 0,
		yOffset: 0,
	});

	this.timeAxis = new DateAxis({
		rootId: this.rootAxisId,
		left: this.width * this.margins.left,
		top: this.height * (1 - this.margins.bottom),
		width: this.width * (1 - this.margins.left - this.margins.right),
		height: this.height * this.margins.bottom,
		stroke: "#000000",
		strokeWidth: 1.0,
		opacity: 1.0,
		label: this.timeAxisLabel,
		weekdays: this.weekdays,
		weekends: this.weekends,
		range: new DateRange(0, 60000),
		tickLabelFontFamily: this.fontFamily,
		tickLabelFontWeight: this.fontWeight
	});

	this.domainCrosshair = d3.select("#" + this.frontId)
		.append("path")
		.attr("id", this.frontId + "DomainCrosshair")
		.attr("d", "M" + (this.grid.left) + "," + (this.grid.top) + "L" + (this.grid.left) + "," + (this.grid.top + this.grid.height))
		.style("display", this.domainCrosshairVisible ? "block" : "none")
		.style("stroke", "blue")
		.style("stroke-width", "1px")
		.style("stroke-dasharray", PlotSerieStyle.DottedLineStyle);
	this.rangeCrosshair = d3.select("#" + this.frontId)
		.append("path")
		.attr("id", this.frontId + "RangeCrosshair")
		.attr("d", "M" + (this.grid.left) + "," + (this.grid.top) + "L" + (this.grid.left + this.grid.width) + "," + (this.grid.top))
		.style("display", this.rangeCrosshairVisible ? "block" : "none")
		.style("stroke", "blue")
		.style("stroke-width", "1px")
		.style("stroke-dasharray", PlotSerieStyle.DottedLineStyle);
	this.zoomRect = d3.select("#" + this.frontId)
		.append("path")
		.attr("id", this.frontId + "ZoomRect")
		.attr("d",
			"M" + (this.zoomPoint.x) + "," + (this.zoomPoint.y) +
			"L" + (this.zoomPoint2.x) + "," + (this.zoomPoint.y) +
			"L" + (this.zoomPoint2.x) + "," + (this.zoomPoint2.y) +
			"L" + (this.zoomPoint.x) + "," + (this.zoomPoint2.y) +
			"L" + (this.zoomPoint.x) + "," + (this.zoomPoint.y)
		)
		.style("display", this.zoomVisible ? "block" : "none")
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.style("stroke-dasharray", PlotSerieStyle.GridLineStyle)
		.style("fill", "blue")
		.style("stroke-opacity", 1.0)
		.style("fill-opacity", 0.25);
	this.leftScrollButton = new D3ChartScrollButtonLeft({
		rootId: this.backId,
		left: this.width * (this.margins.left - this.margins.right),
		top: 0,
		width: this.width * this.margins.right,
		height: this.height * this.margins.top,
		stroke: "#000000",
		strokeWidth: 1.0,
		strokeDashArray: PlotSerieStyle.SolidLineStyle,
		fill: "#ffffff",
		opacity: 1.0
	});
	this.rightScrollButton = new D3ChartScrollButtonRight({
		rootId: this.backId,
		left: this.width * (1 - this.margins.right),
		top: 0,
		width: this.width * this.margins.right,
		height: this.height * this.margins.top,
		stroke: "#000000",
		strokeWidth: 1.0,
		strokeDashArray: PlotSerieStyle.SolidLineStyle,
		fill: "#ffffff",
		opacity: 1.0
	});



	this.update();
	var that = this;
	d3.select("#" + this.svgId).on("mousedown", function() {
		that.mousedown();
	});
	d3.select("#" + this.svgId).on("mouseup", function() {
		that.mouseup();
	});
	d3.select("#" + this.svgId).on("mousemove", function() {
		that.mousemove();
	});
	d3.select("#" + this.rightScrollButton.getId()).on("mousedown", function() {
		that.scrollRight();
	});
	d3.select("#" + this.leftScrollButton.getId()).on("mousedown", function() {
		that.scrollLeft();
	});
}
D3Chart.prototype.scrollRight = function() {
	this.selectedDataset++;
	if (this.selectedDataset >= this.datasets.length) {
		this.selectedDataset = 0;
	}
	this.updateDataset();
};
D3Chart.prototype.scrollLeft = function() {
	this.selectedDataset--;
	if (this.selectedDataset < 0) {
		this.selectedDataset = this.datasets.length - 1;
	}
	this.updateDataset();
};
D3Chart.prototype.setDatasets = function() {
	this.datasets = arguments[0] ? arguments[0] : [];
	this.selectedDataset = 0;
	this.updateDataset();
};
D3Chart.prototype.updateDataset = function() {
	if (this.datasets.length > 0) {
		this.setData(this.datasets[this.selectedDataset]);
	}
	d3.select("#" + this.leftScrollButton.getId()).style("display", this.datasets.length>1 ? "block" : "none");
	d3.select("#" + this.rightScrollButton.getId()).style("display", this.datasets.length>1 ? "block" : "none");
};
D3Chart.prototype.setZoomRect = function() {
	this.zoomRect
		.attr("d",
			"M" + (this.zoomPoint.x) + "," + (this.zoomPoint.y) +
			"L" + (this.zoomPoint2.x) + "," + (this.zoomPoint.y) +
			"L" + (this.zoomPoint2.x) + "," + (this.zoomPoint2.y) +
			"L" + (this.zoomPoint.x) + "," + (this.zoomPoint2.y) +
			"L" + (this.zoomPoint.x) + "," + (this.zoomPoint.y)
		)
		.style("display", this.zoomVisible ? "block" : "none");
};
D3Chart.prototype.calculateLowerMargin = function(group, mingroup, maxgroup, separateAxis, invertedAxis) {
	if (separateAxis === true) {
		return invertedAxis ? (group - mingroup) * 1.0 : (maxgroup - group) * 1.0;
	}
	return 0.000;
};
D3Chart.prototype.calculateUpperMargin = function(group, mingroup, maxgroup, separateAxis, invertedAxis) {
	if (separateAxis === true) {
		return invertedAxis ? (maxgroup - group) * 1.0 : (group - mingroup) * 1.0;
	}
	return 0.05;
};
D3Chart.prototype.setData = function() {
	this.zoom = {
		left: 0.0,
		right: 1.0,
		top: 0.0,
		bottom: 1.0
	};
	var series = arguments[0].series ? arguments[0].series : [new PlotSerie()];
	for (var seriesIndex = 0; seriesIndex < series.length; seriesIndex++) {
		var data = series[seriesIndex].getData();
		if (data !== null) {
			var rows = data.length;
			for (var row = 0; row < rows; row++) {
				var rowData = data[row];
				if (rowData.length > 0) {
					var ts = rowData[0];
					if (typeName(ts) == "Object") {
						var t = new Timestamp(ts.y, ts.m, ts.d, ts.h, ts.n, ts.s);
						ts = t.getMilliseconds();
						rowData[0] = ts;
						data[row] = rowData;
					}
				}
			}
		}
		series[seriesIndex].setData(data);
	}
	this.series = series;
	this.separateGroups = arguments[0].separateGroups ? arguments[0].separateGroups : false;
	this.timeAxisLimits = arguments[0].timeAxisLimits ? arguments[0].timeAxisLimits : undefined;
	this.timeAxisLabel = arguments[0].timeAxisLabel ? arguments[0].timeAxisLabel : "Дата и время";
	this.rangeAxisLabel = arguments[0].rangeAxisLabel ? arguments[0].rangeAxisLabel : "Группа";
	this.weekdays = arguments[0].weekdays ? arguments[0].weekdays : 7;
	this.weekends = arguments[0].weekends ? arguments[0].weekends : 0;
	this.label = arguments[0].label ? arguments[0].label : "";
	this.showCursorValue = arguments[0].showCursorValue ? arguments[0].showCursorValue : true;
	this.timeAxisMargins = {
		left: arguments[0].timeAxisLeftMargin ? arguments[0].timeAxisLeftMargin : 0.0,
		right: arguments[0].timeAxisRightMargin ? arguments[0].timeAxisRightMargin : 0.0
	};
	this.update();
};
D3Chart.prototype.getRenderer = function(arg) {
	var serie = arg.serie ? arg.serie : new PlotSerie();
	var serieType = serie.getType();
	switch (serieType) {
		case PlotSerieType.LineType:
			return new D3ChartLineRenderer(arg);
		case PlotSerieType.BarType:
			return new D3ChartBarRenderer(arg);
		case PlotSerieType.DifferenceType:
			return new D3ChartDifferenceRenderer(arg);
		case PlotSerieType.StepType:
			return new D3ChartStepRenderer(arg);
		case PlotSerieType.OHLCVType:
			return new D3ChartCandlestickRenderer(arg);
		case PlotSerieType.PriceVolumeType:
			return new D3ChartBlockRenderer(arg);
		case PlotSerieType.VLineType:
		case PlotSerieType.VZoneType:
		case PlotSerieType.SectionType:
		case PlotSerieType.HLineType:
		case PlotSerieType.HZoneType:
		case PlotSerieType.TrendlineType:
		case PlotSerieType.LeftValueMarkType:
		case PlotSerieType.RightValueMarkType:
		case PlotSerieType.SymbolType:
		case PlotSerieType.ProfileType:
			return new D3ChartNonStandardRenderer(arg);
		default:
			return null;
	}
	return null;
};
D3Chart.prototype.getCaptionX = function() {
	return this.width / 2;
};
D3Chart.prototype.getCaptionY = function() {
	return this.height * this.margins.top / 2;
};
D3Chart.prototype.getCaptionFontSize = function() {
	return (this.height * this.margins.top / 2) + "px";
};
D3Chart.prototype.setLabel = function(value) {
	this.label = value;
	this.labelElement
		.text(this.label);
};
D3Chart.prototype.setDomainCrosshairVisible = function(visibility) {
	this.domainCrosshairVisible = visibility === true;
	this.domainCrosshair
		.style("display", this.domainCrosshairVisible ? "block" : "none");
};
D3Chart.prototype.setRangeCrosshairVisible = function(visibility) {
	this.rangeCrosshairVisible = visibility === true;
	this.rangeCrosshair
		.style("display", this.rangeCrosshairVisible ? "block" : "none");
};
D3Chart.prototype.setXCursor = function(value) {
	this.timeAxis.cursor(value);
	var x = this.timeAxis.valueTo2D(value);
	this.domainCrosshair
		.attr("d", "M" + (x) + "," + (this.grid.top) + "L" + (x) + "," + (this.grid.top + this.grid.height));
};
D3Chart.prototype.setYCursor = function(value) {
	this.rangeAxis[0].cursor(value);
	var y = this.rangeAxis[0].valueTo2D(value);
	this.rangeCrosshair
		.attr("d", "M" + (this.grid.left) + "," + (y) + "L" + (this.grid.left + this.grid.width) + "," + (y));
};

D3Chart.prototype.mousedown = function() {
	var x = d3.event.layerX - this.grid.left;
	var y = d3.event.layerY - this.grid.top;
	if ((x >= 0) && (x <= this.grid.width) && (y >= 0) && (y <= this.grid.height)) {
		if (d3.event.button === 0) {
			this.zoomPoint = {
				x: d3.event.layerX,
				y: d3.event.layerY
			};
			this.zoomPoint2 = {
				x: d3.event.layerX,
				y: d3.event.layerY
			};
			this.zoomVisible = true;
			this.setZoomRect();
			if (d3.event.shiftKey) {
				this.zoomMode = true;
			}
		}
	}
};
D3Chart.prototype.mouseup = function() {
	var x1, x2, y1, y2, v1, v2, v1r, v2r;
	this.zoomVisible = false;
	this.setZoomRect();
	if (this.zoomMode) {
		if ((this.zoomPoint.x > this.zoomPoint2.x) || (this.zoomPoint.y > this.zoomPoint2.y)) {
			this.zoom = {
				left: 0.0,
				right: 1.0,
				top: 0.0,
				bottom: 1.0
			};
		} else {
			if (this.zoom.left < this.zoom.right) {
				x1 = this.zoom.left;
				x2 = this.zoom.right;
				if (x2 - x1 > 0.001) {
					v1 = (this.zoomPoint.x - this.grid.left) / (this.grid.width);
					v2 = (this.zoomPoint2.x - this.grid.left) / (this.grid.width);
					v1r = v1 * (x2 - x1) + x1;
					v2r = v2 * (x2 - x1) + x1;
					this.zoom.left = v1r;
					this.zoom.right = v2r;
				}
			}
			if (this.zoom.left < this.zoom.right) {
				y1 = this.zoom.top;
				y2 = this.zoom.bottom;
				if (y2 - y1 > 0.001) {
					v1 = (this.zoomPoint.y - this.grid.top) / (this.grid.height);
					v2 = (this.zoomPoint2.y - this.grid.top) / (this.grid.height);
					v1r = v1 * (y2 - y1) + y1;
					v2r = v2 * (y2 - y1) + y1;
					this.zoom.top = v1r;
					this.zoom.bottom = v2r;
				}
			}
		}
		this.update();
	}
	this.zoomMode = false;
};
D3Chart.prototype.mousemove = function() {
	var cursorValueX, i;
	var x = d3.event.layerX - this.grid.left;
	var y = d3.event.layerY - this.grid.top;
	if (this.zoomVisible) {
		if ((x >= 0) && (x <= this.grid.width) && (y >= 0) && (y <= this.grid.height)) {
			this.zoomPoint2 = {
				x: d3.event.layerX,
				y: d3.event.layerY
			};
			this.setZoomRect();
		}
	}
	if (this.domainCrosshairVisible) {
		if ((x >= 0) && (x <= this.grid.width) && (y >= 0) && (y <= this.grid.height)) {
			cursorValueX = this.timeAxis.from2DToValue(d3.event.layerX);
			this.setXCursor(cursorValueX);
		}
	}
	if (this.rangeCrosshairVisible) {
		if ((x >= 0) && (x <= this.grid.width) && (y >= 0) && (y <= this.grid.height)) {
			var cursorValueY = this.rangeAxis[0].from2DToValue(d3.event.layerY);
			this.setYCursor(cursorValueY);
			for (i = 1; i < this.rangeAxis.length; i++) {
				cursorValueY = this.rangeAxis[i].from2DToValue(d3.event.layerY);
				this.rangeAxis[i].cursor(cursorValueY);
			}
			for (i = 0; i < this.series.length; i++) {
				if (this.series[i].renderer) {
					this.series[i].renderer.cursor(cursorValueX);
				}
			}
		}
	}
};
D3Chart.prototype.checkInt = function(str) {
	var v = parseInt(str, 10);
	return isNaN(v) ? 0 : v;
};
D3Chart.prototype.resizeSelf = function() {
	var el = this.sizer;
	var el2 = this.container;
	var w = Math.max(this.checkInt(el2.style.width), el2.clientWidth);
	var h = Math.max(this.checkInt(el2.style.height), el2.clientHeight);

	this.width = Math.max(w - this.checkInt(el2.style.left) - this.checkInt(el2.style.right), 0);
	this.height = Math.max(h - this.checkInt(el2.style.top) - this.checkInt(el2.style.bottom), 0);
	if (this.width === 0) {
		w = Math.max(this.checkInt(el2.style.width), el.clientWidth);
		this.width = Math.max(w - this.checkInt(el2.style.left) - this.checkInt(el2.style.right), 50);
	}
	if (this.height === 0) {
		h = Math.max(this.checkInt(el2.style.height), el.clientHeight);
		this.height = Math.max(h - this.checkInt(el2.style.top) - this.checkInt(el2.style.bottom), 50);
	}
	this.svg
		.attr("width", this.width)
		.attr("height", this.height);
};
/****************************************************************************/
D3Chart.prototype.update = function() {
	var rowData;
	this.resizeSelf();
	this.background
		.dimension(
			0,
			0,
			this.width,
			this.height
		);


	var i, serie, group;
	var tmp = [];
	for (i = 0; i < this.series.length; i++) {
		serie = this.series[i];
		tmp[serie.getGroup()] = serie.getGroup();
	}
	var rangeAxisIndexes = [];
	for (i = 0; i < tmp.length; i++) {
		if (tmp[i] !== undefined) {
			rangeAxisIndexes.push(tmp[i]);
		}
	}
	rangeAxisIndexes.sort(function(a, b) {
		return a - b;
	}); //sorted group numbers
	var revRangeAxisIndexes = [];
	var rangeAxisLimits = [];
	var rangeAxisParams = [];
	var timeAxisLimits = {
		min: Number.MAX_VALUE,
		max: -Number.MAX_VALUE
	};
	for (i = 0; i < rangeAxisIndexes.length; i++) {
		revRangeAxisIndexes[rangeAxisIndexes[i]] = i;
		rangeAxisLimits[i] = {
			min: Number.MAX_VALUE,
			max: -Number.MAX_VALUE
		};
		rangeAxisParams[i] = {
			color: "#000000",
			inverted: false,
			group: 0
		};
	} //axis position by group number
	for (i = 0; i < this.series.length; i++) {
		serie = this.series[i];
		var axisLimits = {
			minX: Number.MAX_VALUE,
			maxX: -Number.MAX_VALUE,
			minY: Number.MAX_VALUE,
			maxY: -Number.MAX_VALUE
		};
		var data = serie.getData();
		var kA = serie.getKA();
		var kB = serie.getKB();
		if (data !== null) {
			var rows = data.length;
			var row, col, serieType;
			if (rows > 0) {
				serieType = serie.getType();
				if (serieType == PlotSerieType.OHLCVType) {
					for (row = 0; row < rows; row++) {
						rowData = data[row];
						axisLimits.minX = Math.min(axisLimits.minX, rowData[0]);
						axisLimits.maxX = Math.max(axisLimits.maxX, rowData[0]);
						for (col = 1; col < rowData.length - 1; col++) {
							axisLimits.minY = Math.min(axisLimits.minY, rowData[col] * kA + kB);
							axisLimits.maxY = Math.max(axisLimits.maxY, rowData[col] * kA + kB);
						}
					}
				} else if (serieType == PlotSerieType.PriceVolumeType) {
					for (row = 0; row < rows; row++) {
						rowData = data[row];
						axisLimits.minX = Math.min(axisLimits.minX, rowData[0]);
						axisLimits.maxX = Math.max(axisLimits.maxX, rowData[0]);
						col = 1;
						axisLimits.minY = Math.min(axisLimits.minY, rowData[col] * kA + kB);
						axisLimits.maxY = Math.max(axisLimits.maxY, rowData[col] * kA + kB);
					}
				} else if (
					(serieType == PlotSerieType.LineType) ||
					(serieType == PlotSerieType.BarType) ||
					(serieType == PlotSerieType.DifferenceType) ||
					(serieType == PlotSerieType.StepType) ||
					(serieType == PlotSerieType.SectionType) ||
					(serieType == PlotSerieType.HLineType) ||
					(serieType == PlotSerieType.HZoneType) ||
					(serieType == PlotSerieType.TrendlineType) ||
					(serieType == PlotSerieType.LeftValueMarkType) ||
					(serieType == PlotSerieType.RightValueMarkType) ||
					(serieType == PlotSerieType.SymbolType)
				) {
					for (row = 0; row < rows; row++) {
						rowData = data[row];
						axisLimits.minX = Math.min(axisLimits.minX, rowData[0]);
						axisLimits.maxX = Math.max(axisLimits.maxX, rowData[0]);
						for (col = 1; col < rowData.length; col++) {
							axisLimits.minY = Math.min(axisLimits.minY, rowData[col] * kA + kB);
							axisLimits.maxY = Math.max(axisLimits.maxY, rowData[col] * kA + kB);
						}
					}
				} else if (serieType == PlotSerieType.ProfileType) {
					for (row = 0; row < rows; row++) {
						rowData = data[row];
						col = 0;
						axisLimits.minY = Math.min(axisLimits.minY, rowData[col] * kA + kB);
						axisLimits.maxY = Math.max(axisLimits.maxY, rowData[col] * kA + kB);
					}
				} else {
					axisLimits.minY = 0.0;
					axisLimits.maxY = 1.0;
					for (row = 0; row < rows; row++) {
						rowData = data[row];
						axisLimits.minX = Math.min(axisLimits.minX, rowData[0]);
						axisLimits.maxX = Math.max(axisLimits.maxX, rowData[0]);
					}
				}
				data.sort(sortFun);
			}
		}
		group = serie.getGroup();
		var rangeAxisIndex = revRangeAxisIndexes[group];
		rangeAxisLimits[rangeAxisIndex].min = Math.min(rangeAxisLimits[rangeAxisIndex].min, axisLimits.minY);
		rangeAxisLimits[rangeAxisIndex].max = Math.max(rangeAxisLimits[rangeAxisIndex].max, axisLimits.maxY);
		timeAxisLimits.min = Math.min(timeAxisLimits.min, axisLimits.minX);
		timeAxisLimits.max = Math.max(timeAxisLimits.max, axisLimits.maxX);
		rangeAxisParams[rangeAxisIndex].color = serie.getColor();
		rangeAxisParams[rangeAxisIndex].inverted = serie.isInvertedAxe();
		rangeAxisParams[rangeAxisIndex].group = serie.getGroup();
	}
	if (this.timeAxisLimits) {
		timeAxisLimits.min = this.timeAxisLimits.min;
		timeAxisLimits.max = this.timeAxisLimits.max;
	}
	if ((timeAxisLimits.min == Number.MAX_VALUE) || (timeAxisLimits.max == -Number.MAX_VALUE)) {
		timeAxisLimits.max = (new Timestamp()).getMilliseconds();
		timeAxisLimits.min = timeAxisLimits.max - 60000;
	}
	var timeAxisLength = timeAxisLimits.max - timeAxisLimits.min;
	timeAxisLimits.min = Math.floor(timeAxisLimits.min - timeAxisLength * this.timeAxisMargins.left);
	timeAxisLimits.max = Math.floor(timeAxisLimits.max + timeAxisLength * this.timeAxisMargins.right);
	for (i = 0; i < rangeAxisLimits.length; i++) {
		if ((rangeAxisLimits[i].min == Number.MAX_VALUE) || (rangeAxisLimits[i].max == -Number.MAX_VALUE)) {
			rangeAxisLimits[i].min = 0.0;
			rangeAxisLimits[i].max = 1.0;
		}
	}

	var indexCount = rangeAxisLimits.length;

	var minPlotWidth = 0.3;
	var minPlotHeight = 0.3;
	this.margins.right = Math.min(20 / this.width, 0.04);
	this.margins.top = Math.min(20 / this.height, 0.1);
	this.margins.bottom = Math.min(50 / this.height, 1 - this.margins.top - minPlotHeight);
	var w = getTextWidth("-8888.8888", (this.fontSize) + "px " + this.fontWeight + " " + this.fontFamily);
	w = w + 15;
	w = w + this.fontSize;
	w = w * indexCount;
	w = w / this.width;
	var rangeAxisFontSize = this.fontSize;
	if (w <= 1 - this.margins.right - minPlotWidth) {
		this.margins.left = w;
	} else {
		this.margins.left = 1 - this.margins.right - minPlotWidth;
		rangeAxisFontSize = this.fontSize * (1 - this.margins.right - minPlotWidth) / w;
	}

	d3.select("#" + this.rootAxisId)[0][0].innerHTML = "";
	d3.select("#" + this.rootPlotsId)[0][0].innerHTML = "";

	var timeAxisZoomedRange = zoomRange(timeAxisLimits.min, timeAxisLimits.max, this.zoom.left, this.zoom.right);
	this.timeAxis = new DateAxis({
		rootId: this.rootAxisId,
		left: this.width * this.margins.left,
		top: this.height * (1 - this.margins.bottom),
		width: this.width * (1 - this.margins.left - this.margins.right),
		height: this.height * this.margins.bottom,
		stroke: "#000000",
		strokeWidth: 1.0,
		opacity: 1.0,
		label: this.timeAxisLabel,
		weekdays: this.weekdays,
		weekends: this.weekends,
		range: new DateRange(Math.round(timeAxisZoomedRange.v1), Math.round(timeAxisZoomedRange.v2)),
		tickLabelFontFamily: this.fontFamily,
		tickLabelFontWeight: this.fontWeight
	});

	var index = 0;
	var maxgroup = rangeAxisIndexes[rangeAxisIndexes.length - 1];
	var mingroup = rangeAxisIndexes[0];

	this.rangeAxis = [];
	w = this.width * this.margins.left / indexCount;
	var rangeAxisTop = this.height * this.margins.top;
	var rangeAxisHeight = this.height * (1 - this.margins.top - this.margins.bottom);
	for (index = 0; index < indexCount; index++) {
		var ind = indexCount - 1 - index;
		this.rangeAxis[index] = new NumberAxis({
			index: index,
			rootId: this.rootAxisId,
			left: ind * w,
			top: rangeAxisTop,
			width: w,
			height: rangeAxisHeight,
			stroke: rangeAxisParams[index].color,
			strokeWidth: 1.0,
			opacity: 1.0,
			label: this.rangeAxisLabel + " " + (rangeAxisIndexes[index]),
			range: new NumberRange(rangeAxisLimits[index].min, rangeAxisLimits[index].max),
			zoomTop: this.zoom.top,
			zoomBottom: this.zoom.bottom,
			tickLabelFontFamily: this.fontFamily,
			tickLabelFontWeight: this.fontWeight,
			tickLabelFontSize: rangeAxisFontSize,
			inverted: rangeAxisParams[index].inverted,
			lowerMargin: this.calculateLowerMargin(rangeAxisParams[index].group, mingroup, maxgroup, this.separateGroups, rangeAxisParams[index].inverted),
			upperMargin: this.calculateUpperMargin(rangeAxisParams[index].group, mingroup, maxgroup, this.separateGroups, rangeAxisParams[index].inverted)
		});
		if (this.separateGroups) {
			d3.select("#" + this.rootPlotsId)
				.append("path")
				.attr("d",
					"M" + (this.timeAxis.left) + "," + (this.rangeAxis[index].valueTo2D(this.rangeAxis[index].range.getLowerBound())) +
					"L" + (this.timeAxis.left + this.timeAxis.width) + "," + (this.rangeAxis[index].valueTo2D(this.rangeAxis[index].range.getLowerBound()))
					// "M"+(this.timeAxis.left)+","+(this.rangeAxis[index].valueTo2D(this.rangeAxis[index].range.getUpperBound()))+
					// "L"+(this.timeAxis.left+this.timeAxis.width)+","+(this.rangeAxis[index].valueTo2D(this.rangeAxis[index].range.getUpperBound()))
				)
				.style("stroke", rangeAxisParams[index].color)
				.style("stroke-width", 2.0)
				.style("stroke-dasharray", PlotSerieStyle.SolidLineStyle)
				.style("fill", "none")
				.style("opacity", 1.0);
		}
	}



	for (i = 0; i < this.series.length; i++) {
		serie = this.series[i];
		var arg = {
			index: i,
			serie: serie,
			timeAxis: this.timeAxis,
			rangeAxis: this.rangeAxis[revRangeAxisIndexes[serie.getGroup()]],
			cursorValue: this.cursorValue,
			showCursorValue: this.showCursorValue,
			rootId: this.rootPlotsId
		};
		this.series[i].renderer = this.getRenderer(arg);
	}

	this.labelElement
		.attr("x", this.getCaptionX())
		.attr("y", this.getCaptionY())
		.style("font-size", this.getCaptionFontSize());

	this.clipPath
		.attr("x", this.width * this.margins.left)
		.attr("y", this.height * this.margins.top)
		.attr("width", this.width * (1 - this.margins.left - this.margins.right))
		.attr("height", this.height * (1 - this.margins.top - this.margins.bottom));

	this.grid
		.allDimension(
			this.width * this.margins.left,
			this.height * this.margins.top,
			this.width * (1 - this.margins.left - this.margins.right),
			this.height * (1 - this.margins.top - this.margins.bottom),
			this.timeAxis.gridStep,
			this.rangeAxis[0].gridStep,
			this.timeAxis.gridOffset,
			this.rangeAxis[0].gridOffset,
			this.rangeAxis[0].inverted
		);

	this.setXCursor(this.timeAxis.cursor());
	this.setYCursor(this.rangeAxis[0].cursor());

	for (i = 0; i < this.series.length; i++) {
		var renderer = this.series[i].renderer;
		if (renderer !== null) {
			renderer.render();
		}
	}

	this.setLabel(this.label);
	this.leftScrollButton
		.dimension(
			this.width * (this.margins.left - this.margins.right),
			0,
			this.width * this.margins.right,
			this.height * this.margins.top
		);
	this.rightScrollButton
		.dimension(
			this.width * (1 - this.margins.right),
			0,
			this.width * this.margins.right,
			this.height * this.margins.top
		);
};