(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.BaseGraph = (function() {
    var markerDefault, optionsDefault;

    optionsDefault = {
      margin: {
        top: 0,
        right: 0,
        bottom: 20,
        left: 0
      },
      aspectRatio: 0.5625,
      label: false,
      legend: false,
      mouseEvents: true,
      key: {
        id: 'key',
        x: 'key',
        y: 'value'
      }
    };

    markerDefault = {
      value: null,
      label: '',
      orientation: 'horizontal',
      align: 'right'
    };

    function BaseGraph(id, options) {
      this.setYAxisPosition = bind(this.setYAxisPosition, this);
      this.setXAxisPosition = bind(this.setXAxisPosition, this);
      this.onResize = bind(this.onResize, this);
      this.setupMarkerLabel = bind(this.setupMarkerLabel, this);
      this.setupMarkerLine = bind(this.setupMarkerLine, this);
      this.id = id;
      this.options = $.extend(true, {}, optionsDefault, options);
      this.$el = $('#' + this.id);
      this.getDimensions();
      this.setSVG();
      this.setScales();
      this.markers = [];
      return this;
    }

    BaseGraph.prototype.setSVG = function() {
      this.svg = d3.select('#' + this.id).append('svg').attr('width', this.containerWidth).attr('height', this.containerHeight);
      return this.container = this.svg.append('g').attr('transform', 'translate(' + this.options.margin.left + ',' + this.options.margin.top + ')');
    };

    BaseGraph.prototype.loadData = function(url) {
      d3.csv(url, (function(_this) {
        return function(error, data) {
          _this.$el.trigger('data-loaded');
          return _this.setData(data);
        };
      })(this));
      return this;
    };

    BaseGraph.prototype.setData = function(data) {
      this.data = this.dataParser(data);
      this.drawScales();
      if (this.options.legend) {
        this.drawLegend();
      }
      this.drawMarkers();
      this.drawGraph();
      this.$el.trigger('draw-complete');
      return this;
    };

    BaseGraph.prototype.dataParser = function(data) {
      return data;
    };

    BaseGraph.prototype.setGraph = function() {
      return this;
    };

    BaseGraph.prototype.setScales = function() {
      return this;
    };

    BaseGraph.prototype.drawScales = function() {
      this.x.domain(this.getScaleXDomain());
      this.y.domain(this.getScaleYDomain());
      if (this.xAxis) {
        this.container.append('g').attr('class', 'x axis').call(this.setXAxisPosition).call(this.xAxis);
      }
      if (this.yAxis) {
        this.container.append('g').attr('class', 'y axis').call(this.setYAxisPosition).call(this.yAxis);
      }
      return this;
    };

    BaseGraph.prototype.getScaleXRange = function() {
      return [0, this.width];
    };

    BaseGraph.prototype.getScaleYRange = function() {
      return [this.height, 0];
    };

    BaseGraph.prototype.getScaleXDomain = function() {
      return [];
    };

    BaseGraph.prototype.getScaleYDomain = function() {
      return [];
    };

    BaseGraph.prototype.drawLegend = function() {
      return this;
    };

    BaseGraph.prototype.addMarker = function(marker) {
      this.markers.push($.extend({}, markerDefault, marker));
      return this;
    };

    BaseGraph.prototype.drawMarkers = function() {
      this.container.selectAll('.marker').data(this.markers).enter().append('line').attr('class', 'marker').call(this.setupMarkerLine);
      return this.container.selectAll('.marker-label').data(this.markers).enter().append('text').attr('class', 'marker-label').attr('text-anchor', function(d) {
        if (d.orientation === 'vertical') {
          return 'middle';
        } else if (d.align === 'right') {
          return 'end';
        } else {
          return 'start';
        }
      }).attr('dy', function(d) {
        if (d.orientation === 'horizontal') {
          return '-0.25em';
        } else {
          return 0;
        }
      }).text(function(d) {
        return d.label;
      }).call(this.setupMarkerLabel);
    };

    BaseGraph.prototype.setupMarkerLine = function(element) {
      return element.attr('x1', (function(_this) {
        return function(d) {
          if (d.orientation === 'horizontal') {
            return 0;
          } else {
            return _this.x(d.value);
          }
        };
      })(this)).attr('y1', (function(_this) {
        return function(d) {
          if (d.orientation === 'horizontal') {
            return _this.y(d.value);
          } else {
            return 0;
          }
        };
      })(this)).attr('x2', (function(_this) {
        return function(d) {
          if (d.orientation === 'horizontal') {
            return _this.width;
          } else {
            return _this.x(d.value);
          }
        };
      })(this)).attr('y2', (function(_this) {
        return function(d) {
          if (d.orientation === 'horizontal') {
            return _this.y(d.value);
          } else {
            return _this.height;
          }
        };
      })(this));
    };

    BaseGraph.prototype.setupMarkerLabel = function(element) {
      return element.attr('x', (function(_this) {
        return function(d) {
          if (d.orientation === 'horizontal') {
            if (d.align === 'right') {
              return _this.width;
            } else {
              return 0;
            }
          } else {
            return _this.x(d.value);
          }
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          if (d.orientation === 'horizontal') {
            return _this.y(d.value);
          } else {
            return _this.height;
          }
        };
      })(this));
    };

    BaseGraph.prototype.onResize = function() {
      this.getDimensions();
      this.updateGraphDimensions();
      return this;
    };

    BaseGraph.prototype.getDimensions = function() {
      if (this.$el) {
        this.containerWidth = this.$el.width();
        this.containerHeight = this.containerWidth * this.options.aspectRatio;
        this.width = this.containerWidth - this.options.margin.left - this.options.margin.right;
        this.height = this.containerHeight - this.options.margin.top - this.options.margin.bottom;
      }
      return this;
    };

    BaseGraph.prototype.updateGraphDimensions = function() {
      this.svg.attr('width', this.containerWidth).attr('height', this.containerHeight);
      if (this.x) {
        this.x.range(this.getScaleXRange());
      }
      if (this.y) {
        this.y.range(this.getScaleYRange());
      }
      if (this.xAxis) {
        this.container.selectAll('.x.axis').call(this.setXAxisPosition).call(this.xAxis);
      }
      if (this.yAxis) {
        this.container.selectAll('.y.axis').call(this.setYAxisPosition).call(this.yAxis);
      }
      this.container.select('.marker').call(this.setupMarkerLine);
      this.container.select('.marker-label').call(this.setupMarkerLabel);
      return this;
    };

    BaseGraph.prototype.setXAxisPosition = function(selection) {
      return selection.attr('transform', 'translate(0,' + this.height + ')');
    };

    BaseGraph.prototype.setYAxisPosition = function(selection) {
      return selection.attr('transform', 'translate(' + this.width + ',0)');
    };

    BaseGraph.prototype.getDataX = function() {
      return d[this.options.key.x];
    };

    BaseGraph.prototype.getDataY = function() {
      return d[this.options.key.y];
    };

    return BaseGraph;

  })();

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.BarGraph = (function(superClass) {
    extend(BarGraph, superClass);

    function BarGraph(id, options) {
      this.onMouseOut = bind(this.onMouseOut, this);
      this.onMouseOver = bind(this.onMouseOver, this);
      this.setBarLabelYDimensions = bind(this.setBarLabelYDimensions, this);
      this.setBarLabelXDimensions = bind(this.setBarLabelXDimensions, this);
      this.setBarDimensions = bind(this.setBarDimensions, this);
      this.getScaleYDomain = bind(this.getScaleYDomain, this);
      this.getScaleXDomain = bind(this.getScaleXDomain, this);
      BarGraph.__super__.constructor.call(this, id, options);
      return this;
    }

    BarGraph.prototype.dataParser = function(data) {
      data.forEach((function(_this) {
        return function(d) {
          return d[_this.options.key.y] = +d[_this.options.key.y];
        };
      })(this));
      return data;
    };

    BarGraph.prototype.setScales = function() {
      this.x = d3.scaleBand().range(this.getScaleXRange()).paddingInner(0.1).paddingOuter(0);
      this.y = d3.scaleLinear().range(this.getScaleYRange());
      return this;
    };

    BarGraph.prototype.getScaleXDomain = function() {
      return this.data.map((function(_this) {
        return function(d) {
          return d[_this.options.key.x];
        };
      })(this));
    };

    BarGraph.prototype.getScaleYDomain = function() {
      return [
        0, d3.max(this.data, (function(_this) {
          return function(d) {
            return d[_this.options.key.y];
          };
        })(this))
      ];
    };

    BarGraph.prototype.drawGraph = function() {
      this.container.selectAll('.bar').data(this.data).enter().append('rect').attr('class', function(d) {
        if (d.active) {
          return 'bar active';
        } else {
          return 'bar';
        }
      }).attr('id', (function(_this) {
        return function(d) {
          return d[_this.options.key.id];
        };
      })(this)).call(this.setBarDimensions);
      if (this.options.mouseEvents) {
        this.container.selectAll('.bar').on('mouseover', this.onMouseOver).on('mouseout', this.onMouseOut);
      }
      if (this.options.label) {
        this.container.selectAll('.bar-label-x').data(this.data).enter().append('text').attr('class', function(d) {
          if (d.active) {
            return 'bar-label-x active';
          } else {
            return 'bar-label-x';
          }
        }).attr('id', (function(_this) {
          return function(d) {
            return 'bar-label-x-' + d[_this.options.key.id];
          };
        })(this)).attr('dy', '1.25em').attr('text-anchor', 'middle').text((function(_this) {
          return function(d) {
            return d[_this.options.key.x];
          };
        })(this)).call(this.setBarLabelXDimensions);
        this.container.selectAll('.bar-label-y').data(this.data).enter().append('text').attr('class', function(d) {
          if (d.active) {
            return 'bar-label-y active';
          } else {
            return 'bar-label-y';
          }
        }).attr('id', (function(_this) {
          return function(d) {
            return 'bar-label-y-' + d[_this.options.key.id];
          };
        })(this)).attr('dy', '-0.5em').attr('text-anchor', 'middle').text((function(_this) {
          return function(d) {
            if (_this.options.label.format) {
              return _this.options.label.format(d[_this.options.key.y]);
            } else {
              return d[_this.options.key.y];
            }
          };
        })(this)).call(this.setBarLabelYDimensions);
      }
      return this;
    };

    BarGraph.prototype.updateGraphDimensions = function() {
      BarGraph.__super__.updateGraphDimensions.call(this);
      this.container.selectAll('.bar').call(this.setBarDimensions);
      this.container.selectAll('.bar-label-x').call(this.setBarLabelXDimensions);
      this.container.selectAll('.bar-label-y').call(this.setBarLabelYDimensions);
      return this;
    };

    BarGraph.prototype.setBarDimensions = function(element) {
      return element.attr('x', (function(_this) {
        return function(d) {
          return _this.x(d[_this.options.key.x]);
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          return _this.y(d[_this.options.key.y]);
        };
      })(this)).attr('height', (function(_this) {
        return function(d) {
          return _this.height - _this.y(d[_this.options.key.y]);
        };
      })(this)).attr('width', this.x.bandwidth());
    };

    BarGraph.prototype.setBarLabelXDimensions = function(element) {
      return element.attr('x', (function(_this) {
        return function(d) {
          return _this.x(d[_this.options.key.x]) + _this.x.bandwidth() * 0.5;
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          return _this.height;
        };
      })(this));
    };

    BarGraph.prototype.setBarLabelYDimensions = function(element) {
      return element.attr('x', (function(_this) {
        return function(d) {
          return _this.x(d[_this.options.key.x]) + _this.x.bandwidth() * 0.5;
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          return _this.y(d[_this.options.key.y]);
        };
      })(this));
    };

    BarGraph.prototype.onMouseOver = function(d) {
      this.container.select('#bar-label-x-' + d[this.options.key.id]).classed('active', true);
      return this.container.select('#bar-label-y-' + d[this.options.key.id]).classed('active', true);
    };

    BarGraph.prototype.onMouseOut = function(d) {
      if (!d.active) {
        this.container.select('#bar-label-x-' + d[this.options.key.id]).classed('active', false);
        return this.container.select('#bar-label-y-' + d[this.options.key.id]).classed('active', false);
      }
    };

    return BarGraph;

  })(window.BaseGraph);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.LineGraph = (function(superClass) {
    extend(LineGraph, superClass);

    LineGraph.prototype.yFormat = d3.format('d');

    function LineGraph(id, options) {
      this.setTickHoverPosition = bind(this.setTickHoverPosition, this);
      this.setLineLabelHoverPosition = bind(this.setLineLabelHoverPosition, this);
      this.onMouseMove = bind(this.onMouseMove, this);
      this.onMouseOut = bind(this.onMouseOut, this);
      this.setOverlayDimensions = bind(this.setOverlayDimensions, this);
      this.setLabelDimensions = bind(this.setLabelDimensions, this);
      this.getScaleXDomain = bind(this.getScaleXDomain, this);
      LineGraph.__super__.constructor.call(this, id, options);
      return this;
    }

    LineGraph.prototype.setData = function(data) {
      this.years = this.getYears(data);
      LineGraph.__super__.setData.call(this, data);
      return this;
    };

    LineGraph.prototype.getYears = function(data) {
      var years;
      years = [];
      d3.keys(data[0]).forEach(function(d) {
        if (+d) {
          return years.push(+d);
        }
      });
      return years.sort();
    };

    LineGraph.prototype.dataParser = function(data) {
      data.forEach((function(_this) {
        return function(d) {
          d.values = {};
          return _this.years.forEach(function(year) {
            if (d[year]) {
              d.values[year] = +d[year];
            }
            return delete d[year];
          });
        };
      })(this));
      return data;
    };

    LineGraph.prototype.setScales = function() {
      this.x = d3.scaleLinear().range(this.getScaleXRange());
      this.y = d3.scaleLinear().range(this.getScaleYRange());
      this.xAxis = d3.axisBottom(this.x).tickFormat(d3.format(''));
      this.yAxis = d3.axisLeft(this.y).tickSize(this.width);
      this.line = d3.line().curve(d3.curveCatmullRom).x((function(_this) {
        return function(d) {
          return _this.x(+d.key);
        };
      })(this)).y((function(_this) {
        return function(d) {
          return _this.y(d.value);
        };
      })(this));
      if (this.options.isArea) {
        this.area = d3.area().curve(d3.curveCatmullRom).x((function(_this) {
          return function(d) {
            return _this.x(+d.key);
          };
        })(this)).y0(this.height).y1((function(_this) {
          return function(d) {
            return _this.y(d.value);
          };
        })(this));
      }
      return this;
    };

    LineGraph.prototype.getScaleXDomain = function() {
      return [this.years[0], this.years[this.years.length - 1]];
    };

    LineGraph.prototype.getScaleYDomain = function() {
      return [
        0, d3.max(this.data, function(d) {
          return d3.max(d3.values(d.values));
        })
      ];
    };

    LineGraph.prototype.drawGraph = function() {
      this.container.select('.graph').remove();
      this.graph = this.container.append('g').attr('class', 'graph');
      this.drawLines();
      if (this.options.isArea) {
        this.drawAreas();
      }
      if (this.options.label) {
        this.drawLabels();
      }
      if (this.options.mouseEvents) {
        this.drawLineLabelHover();
        this.drawRectOverlay();
      }
      return this;
    };

    LineGraph.prototype.updateGraphDimensions = function() {
      LineGraph.__super__.updateGraphDimensions.call(this);
      if (this.options.isArea) {
        this.area.y0(this.height);
      }
      this.yAxis.tickSize(this.width);
      this.container.selectAll('.line').attr('d', this.line);
      if (this.options.isArea) {
        this.container.selectAll('.area').attr('d', this.area);
      }
      if (this.options.label) {
        this.container.selectAll('.line-label').call(this.setLabelDimensions);
      }
      if (this.options.mouseEvents) {
        this.container.select('.overlay').call(this.setOverlayDimensions);
        this.container.select('.tick-hover').call(this.setTickHoverPosition);
      }
      return this;
    };

    LineGraph.prototype.drawLines = function() {
      return this.graph.selectAll('.line').data(this.data).enter().append('path').attr('class', 'line').attr('id', (function(_this) {
        return function(d) {
          return 'line-' + d[_this.options.key.id];
        };
      })(this)).datum(function(d) {
        return d3.entries(d.values);
      }).attr('d', this.line);
    };

    LineGraph.prototype.drawAreas = function() {
      return this.graph.selectAll('.area').data(this.data).enter().append('path').attr('class', 'area').attr('id', (function(_this) {
        return function(d) {
          return 'area-' + d[_this.options.key.id];
        };
      })(this)).datum(function(d) {
        return d3.entries(d.values);
      }).attr('d', this.area);
    };

    LineGraph.prototype.drawLabels = function() {
      return this.graph.selectAll('.line-label').data(this.data).enter().append('text').attr('class', 'line-label').attr('id', (function(_this) {
        return function(d) {
          return 'line-label-' + d[_this.options.key.id];
        };
      })(this)).attr('text-anchor', 'end').attr('dy', '-0.125em').text((function(_this) {
        return function(d) {
          return d[_this.options.key.x];
        };
      })(this)).call(this.setLabelDimensions);
    };

    LineGraph.prototype.drawLineLabelHover = function() {
      this.container.selectAll('.line-label-point').data(this.data).enter().append('circle').attr('id', (function(_this) {
        return function(d) {
          return 'line-label-point-' + d[_this.options.key.id];
        };
      })(this)).attr('class', 'line-label-point').attr('r', 4).style('display', 'none');
      this.container.append('text').attr('class', 'tick-hover').attr('dy', '0.71em').style('display', 'none').call(this.setTickHoverPosition);
      if (this.data.length === 1) {
        return this.container.append('text').attr('class', 'line-label-hover').attr('text-anchor', 'middle').attr('dy', '-0.5em').style('display', 'none');
      }
    };

    LineGraph.prototype.drawRectOverlay = function() {
      return this.container.append('rect').attr('class', 'overlay').call(this.setOverlayDimensions).on('mouseover', this.onMouseMove).on('mouseout', this.onMouseOut).on('mousemove', this.onMouseMove);
    };

    LineGraph.prototype.setLabelDimensions = function(element) {
      return element.attr('x', this.width).attr('y', (function(_this) {
        return function(d) {
          return _this.y(d.values[_this.years[_this.years.length - 1]]);
        };
      })(this));
    };

    LineGraph.prototype.setOverlayDimensions = function(element) {
      return element.attr('width', this.width).attr('height', this.height);
    };

    LineGraph.prototype.onMouseOut = function(d) {
      this.$el.trigger('mouseout');
      return this.hideLabel();
    };

    LineGraph.prototype.onMouseMove = function(d) {
      var position, year;
      position = d3.mouse(d3.event.target);
      year = Math.round(this.x.invert(position[0]));
      if (year !== this.currentYear) {
        this.$el.trigger('change-year', year);
        return this.setLabel(year);
      }
    };

    LineGraph.prototype.setLabel = function(year) {
      this.currentYear = year;
      this.container.select('.x.axis').selectAll('.tick').style('display', 'none');
      this.container.selectAll('.line-label-point').each((function(_this) {
        return function(d) {
          return _this.setLineLabelHoverPosition(d);
        };
      })(this));
      return this.container.select('.tick-hover').style('display', 'block').attr('x', Math.round(this.x(this.currentYear))).text(this.currentYear);
    };

    LineGraph.prototype.hideLabel = function() {
      this.container.selectAll('.line-label-point').style('display', 'none');
      this.container.selectAll('.line-label-hover').style('display', 'none');
      this.container.select('.x.axis').selectAll('.tick').style('display', 'block');
      return this.container.select('.tick-hover').style('display', 'none');
    };

    LineGraph.prototype.setLineLabelHoverPosition = function(data) {
      var label, point, year;
      year = this.currentYear;
      while (this.years.indexOf(year) === -1 && this.currentYear > this.years[0]) {
        year--;
      }
      this.currentYear = year;
      point = d3.select('#line-label-point-' + data[this.options.key.id]);
      label = this.container.selectAll('.line-label-hover');
      if (!data.values[year]) {
        point.style('display', 'none');
        label.style('display', 'none');
        return;
      }
      point.style('display', 'block');
      label.style('display', 'block');
      point.attr('cx', (function(_this) {
        return function(d) {
          return _this.x(year);
        };
      })(this)).attr('cy', (function(_this) {
        return function(d) {
          if (data.values[year]) {
            return _this.y(data.values[year]);
          } else {
            return 0;
          }
        };
      })(this));
      return label.attr('x', (function(_this) {
        return function(d) {
          return _this.x(year);
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          if (data.values[year]) {
            return _this.y(data.values[year]);
          } else {
            return 0;
          }
        };
      })(this)).text((function(_this) {
        return function(d) {
          if (data.values[year]) {
            return _this.yFormat(data.values[year]);
          } else {
            return '';
          }
        };
      })(this));
    };

    LineGraph.prototype.setTickHoverPosition = function(element) {
      return element.attr('y', Math.round(this.height + this.options.margin.top + 9));
    };

    return LineGraph;

  })(window.BaseGraph);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.HeatmapGraph = (function(superClass) {
    extend(HeatmapGraph, superClass);

    function HeatmapGraph(id, options) {
      this.getCountryName = bind(this.getCountryName, this);
      this.onMouseOut = bind(this.onMouseOut, this);
      this.onMouseOver = bind(this.onMouseOver, this);
      this.setMarkerDimensions = bind(this.setMarkerDimensions, this);
      this.setCellDimensions = bind(this.setCellDimensions, this);
      this.getColorDomain = bind(this.getColorDomain, this);
      this.getScaleYDomain = bind(this.getScaleYDomain, this);
      this.getScaleXDomain = bind(this.getScaleXDomain, this);
      this.getScaleYRange = bind(this.getScaleYRange, this);
      this.getScaleXRange = bind(this.getScaleXRange, this);
      HeatmapGraph.__super__.constructor.call(this, id, options);
      this.formatFloat = d3.format(',.1f');
      this.formatInteger = d3.format(',d');
      return this;
    }

    HeatmapGraph.prototype.setSVG = function() {
      this.svg = null;
      this.container = d3.select('#' + this.id + ' .heatmap-graph');
      if (this.options.legend) {
        this.container.classed('has-legend', true);
      }
      return this.$tooltip = this.$el.find('.tooltip');
    };

    HeatmapGraph.prototype.setData = function(data) {
      this.years = this.getYears(data);
      this.countries = data.map(function(d) {
        return d.code;
      });
      this.cellsData = this.getCellsData(data);
      this.data = this.dataParser(data);
      this.getDimensions();
      this.drawScales();
      this.drawMarkers();
      if (this.options.legend) {
        this.drawLegend();
      }
      this.drawGraph();
      return this;
    };

    HeatmapGraph.prototype.getYears = function(data) {
      var maxYear, minYear, years;
      minYear = d3.min(data, function(d) {
        return d3.min(d3.keys(d.values));
      });
      maxYear = d3.max(data, function(d) {
        return d3.max(d3.keys(d.values));
      });
      years = d3.range(minYear, maxYear, 1);
      years.push(+maxYear);
      return years;
    };

    HeatmapGraph.prototype.getCellsData = function(data) {
      var cellsData;
      cellsData = [];
      data.forEach(function(d) {
        var results, value;
        results = [];
        for (value in d.values) {
          results.push(cellsData.push({
            country: d.code,
            name: d.name,
            year: value,
            cases: d.cases[value],
            value: d.values[value]
          }));
        }
        return results;
      });
      return cellsData;
    };

    HeatmapGraph.prototype.dataParser = function(data) {
      data.forEach((function(_this) {
        return function(d) {
          d.values = {};
          return _this.years.forEach(function(year) {
            if (d[year]) {
              d.values[year] = +d[year];
            }
            return delete d[year];
          });
        };
      })(this));
      return data;
    };

    HeatmapGraph.prototype.setScales = function() {
      this.x = d3.scaleBand().padding(0).paddingInner(0).paddingOuter(0).round(true).range(this.getScaleXRange());
      this.y = d3.scaleBand().padding(0).paddingInner(0).paddingOuter(0).round(true).range(this.getScaleYRange());
      this.color = d3.scaleSequential(d3.interpolateOranges);
      return this;
    };

    HeatmapGraph.prototype.drawScales = function() {
      HeatmapGraph.__super__.drawScales.call(this);
      this.color.domain(this.getColorDomain());
      return this;
    };

    HeatmapGraph.prototype.getScaleXRange = function() {
      return [0, this.width];
    };

    HeatmapGraph.prototype.getScaleYRange = function() {
      return [0, this.height];
    };

    HeatmapGraph.prototype.getScaleXDomain = function() {
      return this.years;
    };

    HeatmapGraph.prototype.getScaleYDomain = function() {
      return this.countries;
    };

    HeatmapGraph.prototype.getColorDomain = function() {
      return [0, 400];
    };

    HeatmapGraph.prototype.getDimensions = function() {
      var cellSize;
      this.width = this.$el.width() - 70;
      if (this.years && this.countries) {
        cellSize = Math.floor(this.width / this.years.length);
        if (cellSize < 15) {
          cellSize = 15;
          this.width = (cellSize * this.years.length) + 70;
        }
        this.height = cellSize < 20 ? cellSize * this.countries.length : 20 * this.countries.length;
      }
      return this;
    };

    HeatmapGraph.prototype.drawGraph = function() {
      this.x.range(this.getScaleXRange());
      this.y.range(this.getScaleYRange());
      this.container.append('div').attr('class', 'x-axis axis').selectAll('.axis-item').data(this.years.filter(function(d) {
        return d % 5 === 0;
      })).enter().append('div').attr('class', 'axis-item').style('left', (function(_this) {
        return function(d) {
          return _this.x(d) + 'px';
        };
      })(this)).html(function(d) {
        return d;
      });
      this.container.append('div').attr('class', 'y-axis axis').selectAll('.axis-item').data(this.countries).enter().append('div').attr('class', 'axis-item').style('top', (function(_this) {
        return function(d) {
          return _this.y(d) + 'px';
        };
      })(this)).html((function(_this) {
        return function(d) {
          return _this.getCountryName(d);
        };
      })(this));
      this.container.append('div').attr('class', 'cell-container').style('height', this.height + 'px').selectAll('.cell').data(this.cellsData).enter().append('div').attr('class', 'cell').style('background', (function(_this) {
        return function(d) {
          return _this.color(d.value);
        };
      })(this)).on('mouseover', this.onMouseOver).on('mouseout', this.onMouseOut).call(this.setCellDimensions);
      return this.container.select('.cell-container').selectAll('.marker').data(this.data.map(function(d) {
        return {
          code: d.code,
          year: d.year_introduction
        };
      }).filter(function(d) {
        return !isNaN(d.year);
      })).enter().append('div').attr('class', 'marker').call(this.setMarkerDimensions);
    };

    HeatmapGraph.prototype.updateGraphDimensions = function() {
      this.x.range(this.getScaleXRange());
      this.y.range(this.getScaleYRange());
      this.container.style('height', this.height + 'px');
      this.container.select('.cell-container').style('height', this.height + 'px');
      this.container.selectAll('.cell').call(this.setCellDimensions);
      this.container.select('.x-axis').selectAll('.axis-item').style('left', (function(_this) {
        return function(d) {
          return _this.x(d) + 'px';
        };
      })(this));
      this.container.select('.y-axis').selectAll('.axis-item').style('top', (function(_this) {
        return function(d) {
          return _this.y(d) + 'px';
        };
      })(this));
      this.container.select('.cell-container').selectAll('.marker').call(this.setMarkerDimensions);
      return this;
    };

    HeatmapGraph.prototype.setCellDimensions = function(selection) {
      return selection.style('left', (function(_this) {
        return function(d) {
          return _this.x(d.year) + 'px';
        };
      })(this)).style('top', (function(_this) {
        return function(d) {
          return _this.y(d.country) + 'px';
        };
      })(this)).style('width', this.x.bandwidth() + 'px').style('height', this.y.bandwidth() + 'px');
    };

    HeatmapGraph.prototype.setMarkerDimensions = function(selection) {
      return selection.style('top', (function(_this) {
        return function(d) {
          return (_this.y(d.code) - 1) + 'px';
        };
      })(this)).style('left', (function(_this) {
        return function(d) {
          if (d.year < _this.years[0]) {
            return _this.x(_this.years[0]) - 1 + 'px';
          } else if (d.year < _this.years[_this.years.length - 1]) {
            return _this.x(d.year) - 1 + 'px';
          } else {
            return _this.x.bandwidth() + _this.x(_this.years[_this.years.length - 1]) + 'px';
          }
        };
      })(this)).style('height', (this.y.bandwidth() + 1) + 'px');
    };

    HeatmapGraph.prototype.onMouseOver = function(d) {
      var offset;
      offset = $(d3.event.target).offset();
      this.$tooltip.find('.tooltip-inner .country').html(d.name);
      this.$tooltip.find('.tooltip-inner .year').html(d.year);
      this.$tooltip.find('.tooltip-inner .value').html(d.value === 0 ? 0 : this.formatFloat(d.value));
      this.$tooltip.find('.tooltip-inner .cases').html(this.formatInteger(d.cases));
      this.$tooltip.css({
        'left': offset.left + this.x.bandwidth() * 0.5 - (this.$tooltip.width() * 0.5),
        'top': offset.top - (this.y.bandwidth() * 0.5) - this.$tooltip.height(),
        'opacity': '1'
      });
    };

    HeatmapGraph.prototype.onMouseOut = function(d) {
      this.$tooltip.css('opacity', '0');
    };

    HeatmapGraph.prototype.getCountryName = function(code) {
      var country;
      country = this.data.filter(function(d) {
        return d.code === code;
      });
      if (country[0]) {
        return country[0].name;
      } else {
        return '';
      }
    };

    HeatmapGraph.prototype.drawLegend = function() {
      var legendData;
      legendData = [0, 100, 200, 300, 400];
      this.legend = this.container.append('ul').attr('class', 'legend').style('margin-left', -(15 * legendData.length) + 'px');
      return this.legend.selectAll('li').data(legendData).enter().append('li').style('background', (function(_this) {
        return function(d) {
          return _this.color(d);
        };
      })(this)).html(function(d, i) {
        if (i !== 0) {
          return d;
        } else {
          return '&nbsp';
        }
      });

      /*
      legendData.shift()
       * draw legend texts
      @legend.selectAll('text')
        .data legendData
        .enter().append('text')
          .attr 'x', (d,i) -> Math.round legenItemWidth*(i-0.5-(legendData.length/2))
          .attr 'y', 20
          .attr 'text-anchor', 'start'
          .text (d) -> d
       */
    };

    return HeatmapGraph;

  })(BaseGraph);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.MapGraph = (function(superClass) {
    extend(MapGraph, superClass);

    function MapGraph(id, options) {
      this.setTooltipData = bind(this.setTooltipData, this);
      this.onMouseOut = bind(this.onMouseOut, this);
      this.onMouseMove = bind(this.onMouseMove, this);
      this.onMouseOver = bind(this.onMouseOver, this);
      this.getLegendData = bind(this.getLegendData, this);
      this.setLegendPosition = bind(this.setLegendPosition, this);
      this.setCountryColor = bind(this.setCountryColor, this);
      MapGraph.__super__.constructor.call(this, id, options);
      this.formatFloat = d3.format(',.1f');
      this.formatInteger = d3.format(',d');
      return this;
    }

    MapGraph.prototype.setSVG = function() {
      MapGraph.__super__.setSVG.call(this);
      return this.$tooltip = this.$el.find('.tooltip');
    };

    MapGraph.prototype.setScales = function() {
      this.color = d3.scaleSequential(d3.interpolateOranges);
      return this;
    };

    MapGraph.prototype.loadData = function(url_data, url_map) {
      d3.queue().defer(d3.csv, url_data).defer(d3.json, url_map).await((function(_this) {
        return function(error, data, map) {
          _this.$el.trigger('data-loaded');
          return _this.setData(data, map);
        };
      })(this));
      return this;
    };

    MapGraph.prototype.setData = function(data, map) {
      this.data = this.dataParser(data);
      this.color.domain([
        0, d3.max(this.data, function(d) {
          return d.value;
        })
      ]);
      if (this.options.legend) {
        this.drawLegend();
      }
      this.drawGraph(map);
      return this;
    };

    MapGraph.prototype.drawLegend = function() {
      var legenItemWidth, legendData;
      legenItemWidth = 30;
      legendData = this.getLegendData();
      this.legend = this.container.append('g').attr('class', 'legend').call(this.setLegendPosition);
      this.legend.selectAll('rect').data(legendData).enter().append('rect').attr('x', function(d, i) {
        return Math.round(legenItemWidth * (i - (legendData.length / 2)));
      }).attr('width', legenItemWidth).attr('height', 8).attr('fill', (function(_this) {
        return function(d) {
          return _this.color(d);
        };
      })(this));
      legendData.shift();
      return this.legend.selectAll('text').data(legendData).enter().append('text').attr('x', function(d, i) {
        return Math.round(legenItemWidth * (i + 0.5 - (legendData.length / 2)));
      }).attr('y', 20).attr('text-anchor', 'start').text(function(d) {
        return d;
      });
    };

    MapGraph.prototype.drawGraph = function(map) {
      this.countries = topojson.feature(map, map.objects.countries);
      this.countries.features = this.countries.features.filter(function(d) {
        return d.id !== '010';
      });
      this.projection = d3.geoKavrayskiy7();
      this.projectionSetSize();
      this.path = d3.geoPath().projection(this.projection);
      this.container.selectAll('.country').data(this.countries.features).enter().append('path').attr('id', function(d) {
        return 'country-' + d.id;
      }).attr('class', function(d) {
        return 'country';
      }).attr('fill', this.setCountryColor).attr('stroke-width', 1).attr('stroke', this.setCountryColor).attr('d', this.path);
      if (this.$tooltip) {
        this.container.selectAll('.country').on('mouseover', this.onMouseOver).on('mousemove', this.onMouseMove).on('mouseout', this.onMouseOut);
      }
      this.$el.trigger('draw-complete');
      return this;
    };

    MapGraph.prototype.updateGraphDimensions = function() {
      MapGraph.__super__.updateGraphDimensions.call(this);
      this.projectionSetSize();
      this.path.projection(this.projection);
      this.container.selectAll('.country').attr('d', this.path);
      if (this.options.legend) {
        this.legend.call(this.setLegendPosition);
      }
      return this;
    };

    MapGraph.prototype.projectionSetSize = function() {
      return this.projection.fitSize([this.width, this.height], this.countries).scale(this.projection.scale() * 1.1).translate([this.width * 0.48, this.height * 0.6]);
    };

    MapGraph.prototype.setCountryColor = function(d) {
      var value;
      value = this.data.filter(function(e) {
        return e.code_num === d.id;
      });
      if (value[0]) {
        return this.color(value[0].value);
      } else {
        return '#eee';
      }
    };

    MapGraph.prototype.setLegendPosition = function(element) {
      return element.attr('transform', 'translate(' + Math.round(this.width * 0.5) + ',' + (-this.options.margin.top) + ')');
    };

    MapGraph.prototype.getLegendData = function() {
      return d3.range(0, this.color.domain()[1]);
    };

    MapGraph.prototype.onMouseOver = function(d) {
      var offset, position, value;
      value = this.data.filter(function(e) {
        return e.code_num === d.id;
      });
      if (value.length > 0) {
        position = d3.mouse(d3.event.target);
        this.setTooltipData(value[0]);
        offset = $(d3.event.target).offset();
        return this.$tooltip.css({
          'left': position[0] - (this.$tooltip.width() * 0.5),
          'top': position[1] - (this.$tooltip.height() * 0.5),
          'opacity': '1'
        });
      }
    };

    MapGraph.prototype.onMouseMove = function(d) {
      var position;
      position = d3.mouse(d3.event.target);
      return this.$tooltip.css({
        'left': position[0] - (this.$tooltip.width() * 0.5),
        'top': position[1] - (this.$tooltip.height() * 0.5)
      });
    };

    MapGraph.prototype.onMouseOut = function(d) {
      return this.$tooltip.css('opacity', '0');
    };

    MapGraph.prototype.setTooltipData = function(d) {
      this.$tooltip.find('.tooltip-inner .title').html(d.name);
      this.$tooltip.find('.tooltip-inner .value').html(this.formatFloat(d.value));
      if (d.cases) {
        return this.$tooltip.find('.tooltip-inner .cases').html(this.formatInteger(d.cases));
      }
    };

    return MapGraph;

  })(window.BaseGraph);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.ScatterplotGraph = (function(superClass) {
    extend(ScatterplotGraph, superClass);

    function ScatterplotGraph(id, options) {
      this.setTooltipData = bind(this.setTooltipData, this);
      this.onMouseOut = bind(this.onMouseOut, this);
      this.onMouseOver = bind(this.onMouseOver, this);
      this.setXAxisPosition = bind(this.setXAxisPosition, this);
      this.setDotLabelsDimensions = bind(this.setDotLabelsDimensions, this);
      this.setDotsDimensions = bind(this.setDotsDimensions, this);
      this.getDotFill = bind(this.getDotFill, this);
      this.getDotSize = bind(this.getDotSize, this);
      this.getDotLabelText = bind(this.getDotLabelText, this);
      this.getDotLabelId = bind(this.getDotLabelId, this);
      this.getDotId = bind(this.getDotId, this);
      this.getSizeDomain = bind(this.getSizeDomain, this);
      this.getSizeRange = bind(this.getSizeRange, this);
      this.getColorDomain = bind(this.getColorDomain, this);
      this.getColorRange = bind(this.getColorRange, this);
      this.getScaleYDomain = bind(this.getScaleYDomain, this);
      this.getScaleXDomain = bind(this.getScaleXDomain, this);
      ScatterplotGraph.__super__.constructor.call(this, id, options);
      return this;
    }

    ScatterplotGraph.prototype.dataParser = function(data) {
      data.forEach((function(_this) {
        return function(d) {
          d[_this.options.key.x] = +d[_this.options.key.x];
          return d[_this.options.key.y] = +d[_this.options.key.y];
        };
      })(this));
      return data;
    };

    ScatterplotGraph.prototype.setSVG = function() {
      ScatterplotGraph.__super__.setSVG.call(this);
      return this.$tooltip = this.$el.find('.tooltip');
    };

    ScatterplotGraph.prototype.setScales = function() {
      this.x = d3.scaleLinear().range(this.getScaleXRange());
      this.y = d3.scaleLinear().range(this.getScaleYRange());
      if (this.options.key.color) {
        this.color = d3.scaleOrdinal().range(this.getColorRange());
      }
      if (this.options.key.size) {
        this.size = d3.scaleLinear().range(this.getSizeRange());
      }
      this.xAxis = d3.axisBottom(this.x).tickSize(this.height);
      this.yAxis = d3.axisLeft(this.y).tickSize(this.width);
      return this;
    };

    ScatterplotGraph.prototype.getScaleXDomain = function() {
      return [
        0, d3.max(this.data, (function(_this) {
          return function(d) {
            return d[_this.options.key.x];
          };
        })(this))
      ];
    };

    ScatterplotGraph.prototype.getScaleYDomain = function() {
      return [
        0, d3.max(this.data, (function(_this) {
          return function(d) {
            return d[_this.options.key.y];
          };
        })(this))
      ];
    };

    ScatterplotGraph.prototype.getColorRange = function() {
      return ['#C9AD4B', '#BBD646', '#63BA2D', '#34A893', '#3D91AD', '#5B8ACB', '#BA7DAF', '#BF6B80', '#F49D9D', '#E25453', '#B56631', '#E2773B', '#FFA951', '#F4CA00'];
    };

    ScatterplotGraph.prototype.getColorDomain = function() {
      return d3.extent(this.data, (function(_this) {
        return function(d) {
          return d[_this.options.key.color];
        };
      })(this));
    };

    ScatterplotGraph.prototype.getSizeRange = function() {
      return [6, 12];
    };

    ScatterplotGraph.prototype.getSizeDomain = function() {
      return [
        0, d3.max(this.data, (function(_this) {
          return function(d) {
            return d[_this.options.key.size];
          };
        })(this))
      ];
    };

    ScatterplotGraph.prototype.drawScales = function() {
      ScatterplotGraph.__super__.drawScales.call(this);
      if (this.color) {
        this.color.domain(this.getColorDomain());
      }
      if (this.size) {
        this.size.domain(this.getSizeDomain());
      }
      return this;
    };

    ScatterplotGraph.prototype.drawGraph = function() {
      this.container.selectAll('.dot').data(this.data).enter().append('circle').attr('class', 'dot').attr('id', this.getDotId).attr('r', this.getDotSize).style('fill', this.getDotFill).call(this.setDotsDimensions);
      this.container.selectAll('.dot-label').data(this.data).enter().append('text').attr('class', 'dot-label').attr('id', this.getDotLabelId).attr('dx', '0.75em').attr('dy', '0.375em').text(this.getDotLabelText).call(this.setDotLabelsDimensions);
      if (this.$tooltip) {
        this.container.selectAll('.dot').on('mouseover', this.onMouseOver).on('mouseout', this.onMouseOut);
      }
      return this;
    };

    ScatterplotGraph.prototype.updateGraphDimensions = function() {
      ScatterplotGraph.__super__.updateGraphDimensions.call(this);
      this.xAxis.tickSize(this.height);
      this.yAxis.tickSize(this.width);
      this.container.selectAll('.dot').call(this.setDotsDimensions);
      this.container.selectAll('.dot-label').call(this.setDotLabelsDimensions);
      return this;
    };

    ScatterplotGraph.prototype.getDotId = function(d) {
      return 'dot-' + d[this.options.key.id];
    };

    ScatterplotGraph.prototype.getDotLabelId = function(d) {
      return 'dot-label-' + d[this.options.key.id];
    };

    ScatterplotGraph.prototype.getDotLabelText = function(d) {
      return d[this.options.key.id];
    };

    ScatterplotGraph.prototype.getDotSize = function(d) {
      if (this.size) {
        return this.size(d[this.options.key.size]);
      } else {
        return 6;
      }
    };

    ScatterplotGraph.prototype.getDotFill = function(d) {
      if (this.color) {
        return this.color(d[this.options.key.color]);
      } else {
        return null;
      }
    };

    ScatterplotGraph.prototype.setDotsDimensions = function(element) {
      return element.attr('cx', (function(_this) {
        return function(d) {
          return _this.x(d[_this.options.key.x]);
        };
      })(this)).attr('cy', (function(_this) {
        return function(d) {
          return _this.y(d[_this.options.key.y]);
        };
      })(this));
    };

    ScatterplotGraph.prototype.setDotLabelsDimensions = function(element) {
      return element.attr('x', (function(_this) {
        return function(d) {
          return _this.x(d[_this.options.key.x]);
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          return _this.y(d[_this.options.key.y]);
        };
      })(this));
    };

    ScatterplotGraph.prototype.setXAxisPosition = function(selection) {
      return selection.attr('transform', 'translate(0,0)');
    };

    ScatterplotGraph.prototype.onMouseOver = function(d) {
      var element;
      element = d3.select(d3.event.target);
      this.setTooltipData(d);
      return this.$tooltip.css({
        left: +element.attr('cx') + this.options.margin.left - (this.$tooltip.width() * 0.5),
        top: +element.attr('cy') + this.options.margin.top - this.$tooltip.height() - 15,
        opacity: 1
      });
    };

    ScatterplotGraph.prototype.onMouseOut = function(d) {
      return this.$tooltip.css('opacity', '0');
    };

    ScatterplotGraph.prototype.setTooltipData = function(d) {
      this.$tooltip.find('.tooltip-inner .title').html(d[this.options.key.id]);
      this.$tooltip.find('.tooltip-inner .value-x').html(d[this.options.key.x]);
      return this.$tooltip.find('.tooltip-inner .value-y').html(d[this.options.key.y]);
    };

    return ScatterplotGraph;

  })(window.BaseGraph);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.ScatterplotDiscreteGraph = (function(superClass) {
    extend(ScatterplotDiscreteGraph, superClass);

    function ScatterplotDiscreteGraph(id, options) {
      this.onMouseOut = bind(this.onMouseOut, this);
      this.onMouseOver = bind(this.onMouseOver, this);
      this.setDotLinesDimensions = bind(this.setDotLinesDimensions, this);
      this.getScaleXDomain = bind(this.getScaleXDomain, this);
      this.getDotLineId = bind(this.getDotLineId, this);
      ScatterplotDiscreteGraph.__super__.constructor.call(this, id, options);
      return this;
    }

    ScatterplotDiscreteGraph.prototype.dataParser = function(data) {
      data.forEach((function(_this) {
        return function(d) {
          return d[_this.options.key.y] = +d[_this.options.key.y];
        };
      })(this));
      return data;
    };

    ScatterplotDiscreteGraph.prototype.setScales = function() {
      this.x = d3.scalePoint().range(this.getScaleXRange());
      this.y = d3.scaleLinear().range(this.getScaleYRange());
      if (this.options.key.color) {
        this.color = d3.scaleOrdinal().range(this.getColorRange());
      }
      if (this.options.key.size) {
        this.size = d3.scaleLinear().range(this.getSizeRange());
      }
      this.xAxis = d3.axisBottom(this.x).tickSize(this.height);
      this.yAxis = d3.axisLeft(this.y).tickSize(this.width);
      return this;
    };

    ScatterplotDiscreteGraph.prototype.drawGraph = function() {
      ScatterplotDiscreteGraph.__super__.drawGraph.call(this);
      this.container.selectAll('.dot-line').data(this.data).enter().append('line').attr('class', 'dot-line').attr('id', this.getDotLineId).style('stroke', this.getDotFill).style('opacity', 0).call(this.setDotLinesDimensions);
      return this;
    };

    ScatterplotDiscreteGraph.prototype.updateGraphDimensions = function() {
      ScatterplotDiscreteGraph.__super__.updateGraphDimensions.call(this);
      this.container.selectAll('.dot-line').call(this.setDotLinesDimensions);
      return this;
    };

    ScatterplotDiscreteGraph.prototype.getDotLineId = function(d) {
      return 'dot-line-' + d[this.options.key.id];
    };

    ScatterplotDiscreteGraph.prototype.getScaleXDomain = function() {
      return this.data.map((function(_this) {
        return function(d) {
          return d[_this.options.key.x];
        };
      })(this));
    };

    ScatterplotDiscreteGraph.prototype.setDotLinesDimensions = function(element) {
      return element.attr('x1', (function(_this) {
        return function(d) {
          return _this.x(d[_this.options.key.x]);
        };
      })(this)).attr('y1', (function(_this) {
        return function(d) {
          return _this.height;
        };
      })(this)).attr('x2', (function(_this) {
        return function(d) {
          return _this.x(d[_this.options.key.x]);
        };
      })(this)).attr('y2', (function(_this) {
        return function(d) {
          return _this.y(d[_this.options.key.y]);
        };
      })(this));
    };

    ScatterplotDiscreteGraph.prototype.onMouseOver = function(d) {
      var key;
      ScatterplotDiscreteGraph.__super__.onMouseOver.call(this, d);
      key = d3.select(d3.event.target).data()[0][this.options.key.color];
      this.container.selectAll('.dot').classed('inactive', true);
      this.container.selectAll('.dot').filter((function(_this) {
        return function(d) {
          return d[_this.options.key.color] === key;
        };
      })(this)).classed('inactive', false).classed('active', true);
      this.container.selectAll('.dot-line').filter((function(_this) {
        return function(d) {
          return d[_this.options.key.color] === key;
        };
      })(this)).style('opacity', 1);
      return this.container.selectAll('.dot').sort((function(_this) {
        return function(a, b) {
          if (a[_this.options.key.color] === key) {
            return 1;
          } else {
            return -1;
          }
        };
      })(this));
    };

    ScatterplotDiscreteGraph.prototype.onMouseOut = function(d) {
      ScatterplotDiscreteGraph.__super__.onMouseOut.call(this, d);
      this.container.selectAll('.dot').classed('inactive', false).classed('active', false);
      return this.container.selectAll('.dot-line').style('opacity', 0);
    };

    return ScatterplotDiscreteGraph;

  })(window.ScatterplotGraph);

}).call(this);

(function() {
  (function($) {
    var baseurl, excludedCountries, formatFloat, formatInteger, getCountryName, lang, setVideoMapPolio, setupHeatMapGraph, setupImmunizationCoverageDynamicLineGraph, setupImmunizationCoverageMultipleSmallGraph, setupImmunizationDiseaseBarGraph, setupMeaslesWorldMapGraph, setupVaccineBcgCasesMap, setupVaccineBcgStockoutsMap, setupVaccineConfidenceBarGraph, setupVaccineDiseaseHeatmapGraph, setupVaccinePricesGraph, setupWorldCasesMultipleSmallGraph;
    lang = $('body').data('lang');
    baseurl = $('body').data('baseurl');
    excludedCountries = ['NIU', 'COK', 'TUV', 'NRU', 'PLW', 'VGB', 'MAF', 'SMR', 'GIB', 'TCA', 'LIE', 'MCO', 'SXM', 'FRO', 'MHL', 'MNP', 'ASM', 'KNA', 'GRL', 'CY', 'BMU', 'AND', 'DMA', 'IMN', 'ATG', 'SYC', 'VIR', 'ABW', 'FSM', 'TON', 'GRD', 'VCT', 'KIR', 'CUW', 'CHI', 'GUM', 'LCA', 'STP', 'WSM', 'VUT', 'NCL', 'PYF', 'BRB'];
    if (lang === 'es') {
      d3.formatDefaultLocale({
        "decimal": ",",
        "thousands": ".",
        "grouping": [3]
      });
    }
    formatFloat = d3.format(',.1f');
    formatInteger = d3.format(',d');
    $('[data-toggle="tooltip"]').tooltip();
    getCountryName = function(countries, code, lang) {
      var item;
      item = countries.filter(function(d) {
        return d.code === code;
      });
      if (item) {
        return item[0]['name_' + lang];
      } else {
        return console.error('No country name for code', code);
      }
    };
    setVideoMapPolio = function() {
      return d3.csv(baseurl + '/data/diseases-polio-cases-total.csv', function(error, data) {
        var cases, casesStr, i, notes, popcorn, wrapper, year, yearDuration;
        cases = {};
        casesStr = lang === 'es' ? 'casos' : 'cases';
        data.forEach(function(d) {
          return cases[d.year] = d.value;
        });
        wrapper = Popcorn.HTMLYouTubeVideoElement('#video-map-polio');
        wrapper.src = 'http://www.youtube.com/embed/o-EzVOjnc6Q?controls=0&showinfo=0&hd=1';
        popcorn = Popcorn(wrapper);
        notes = 2017 - 1980;
        yearDuration = 27 / (notes + 1);
        i = 0;
        while (i < notes) {
          year = '' + (1980 + i);
          popcorn.footnote({
            start: yearDuration * i,
            end: i < notes - 1 ? yearDuration * (i + 1) : (yearDuration * (i + 1)) + 1,
            text: year + '<br><span class="value">' + formatInteger(cases[year]) + ' ' + casesStr + '</span>',
            target: 'video-map-polio-description'
          });
          i++;
        }
        wrapper.addEventListener('ended', function(e) {
          $('.video-map-polio-cover').show();
          $('#video-map-polio-description, #video-map-polio iframe').fadeTo(0, 0);
          return popcorn.currentTime(0);
        });
        return $('#video-map-polio-play-btn').click(function(e) {
          e.preventDefault();
          popcorn.play();
          $('.video-map-polio-cover').fadeOut();
          return $('#video-map-polio-description, #video-map-polio iframe').fadeTo(300, 1);
        });
      });
    };
    setupMeaslesWorldMapGraph = function() {
      return d3.queue().defer(d3.csv, baseurl + '/data/measles-cases-who-regions.csv').defer(d3.csv, baseurl + '/data/countries-who-regions.csv').defer(d3.json, baseurl + '/data/map-world-110.json').await(function(error, data, countries, map) {
        var graph;
        countries.forEach(function(country) {
          var region;
          region = data.filter(function(d) {
            return d.region === country.region;
          });
          if (region.length > 0) {
            country.value = region[0].cases * 100000;
            country.cases = region[0].cases_total;
            return country.name = region[0]['name_' + lang];
          }
        });
        graph = new window.MapGraph('measles-world-map-graph', {
          aspectRatio: 0.5625,
          margin: {
            top: 60,
            bottom: 0
          },
          legend: true
        });
        graph.setData(countries, map);
        return $(window).resize(graph.onResize);
      });
    };
    setupHeatMapGraph = function(id, data, countries, legend) {
      var graph;
      data = data.filter(function(d) {
        return countries.indexOf(d.code) !== -1 && d3.values(d.values).length > 0;
      }).sort(function(a, b) {
        return a.total - b.total;
      });
      graph = new window.HeatmapGraph(id, {
        legend: legend,
        margin: {
          right: 0,
          left: 0
        }
      });
      graph.setData(data);
      return $(window).resize(graph.onResize);
    };
    setupVaccineConfidenceBarGraph = function() {
      return d3.queue().defer(d3.csv, baseurl + '/data/confidence.csv').defer(d3.json, 'http://freegeoip.net/json/').await(function(error, data, location) {
        var graph;
        data.forEach((function(_this) {
          return function(d) {
            d.value = +d.value;
            d.name = d['name_' + lang];
            delete d.name_es;
            delete d.name_en;
            if (location && d.code2 === location.country_code) {
              return d.active = true;
            }
          };
        })(this));
        graph = new window.BarGraph('vaccine-confidence-graph', {
          aspectRatio: 0.3,
          label: {
            format: function(d) {
              return formatFloat(d) + '%';
            }
          },
          margin: {
            top: 0
          },
          key: {
            x: 'name',
            y: 'value',
            id: 'code'
          }
        });
        graph.setData(data);
        return $(window).resize(graph.onResize);
      });
    };
    setupVaccineBcgCasesMap = function() {
      return d3.queue().defer(d3.csv, baseurl + '/data/tuberculosis-cases.csv').defer(d3.csv, baseurl + '/data/countries.csv').defer(d3.json, baseurl + '/data/map-world-110.json').await(function(error, data, countries, map) {
        var graph;
        data.forEach(function(d) {
          var item;
          item = countries.filter(function(country) {
            return country.code === d.code;
          });
          d.value = +d.cases_population;
          d.cases = +d.cases;
          if (item) {
            d.name = item[0]['name_' + lang];
            return d.code_num = item[0]['code_num'];
          }
        });
        graph = new window.MapGraph('vaccine-bcg-cases-graph', {
          aspectRatio: 0.5625,
          margin: {
            top: 60,
            bottom: 0
          },
          legend: true
        });
        graph.getLegendData = function() {
          return [0, 200, 400, 600, 800];
        };
        graph.setData(data, map);
        return $(window).resize(graph.onResize);
      });
    };
    setupVaccineBcgStockoutsMap = function() {
      return d3.queue().defer(d3.csv, baseurl + '/data/bcg-stockouts.csv').defer(d3.csv, baseurl + '/data/countries.csv').defer(d3.json, baseurl + '/data/map-world-110.json').await(function(error, data, countries, map) {
        var graph, years;
        years = d3.range(2006, 2016);
        data.forEach(function(d) {
          var item;
          item = countries.filter(function(country) {
            return country.code === d.code;
          });
          d.value = +d.value;
          d.years = '';
          years.forEach(function(year) {
            if (d[year] === '2' || d[year] === '3') {
              d.years += year + ',';
            }
            return delete d[year];
          });
          if (item) {
            d.name = item[0]['name_' + lang];
            return d.code_num = item[0]['code_num'];
          }
        });
        graph = new window.MapGraph('vaccine-bcg-stockouts', {
          aspectRatio: 0.5625,
          margin: {
            top: 60,
            bottom: 0
          },
          legend: true
        });
        graph.formatFloat = graph.formatInteger;
        graph.getLegendData = function() {
          return [0, 2, 4, 6, 8];
        };
        graph.setTooltipData = function(d) {
          graph.$tooltip.find('.tooltip-inner .title').html(d.name);
          graph.$tooltip.find('.description, .years-cells').hide();
          if (d.value === 0) {
            return graph.$tooltip.find('.description-zero').show();
          } else if (d.value === 1) {
            graph.$tooltip.find('.description-one .value').html(d.years.split(',')[0]);
            return graph.$tooltip.find('.description-one').show();
          } else {
            graph.$tooltip.find('.description-multiple .value').html(graph.formatInteger(d.value));
            graph.$tooltip.find('.years-cells li').toggleClass('active', false);
            d.years.split(',').forEach(function(year) {
              return graph.$tooltip.find('.years-cells li[data-year="' + year + '"]').toggleClass('active', true);
            });
            return graph.$tooltip.find('.description-multiple, .years-cells').show();
          }
        };
        graph.setData(data, map);
        return $(window).resize(graph.onResize);
      });
    };
    setupVaccineDiseaseHeatmapGraph = function() {
      return d3.queue().defer(d3.csv, baseurl + '/data/diseases-cases-measles.csv').defer(d3.csv, baseurl + '/data/population.csv').await(function(error, data_cases, data_population) {
        delete data_cases.columns;
        data_cases.forEach(function(d) {
          var population, populationItem, year;
          if (d.year_introduction) {
            d.year_introduction = +d.year_introduction.replace('prior to', '');
          }
          d.cases = {};
          d.values = {};
          d.name = getCountryName(data_population, d.code, lang);
          populationItem = data_population.filter(function(country) {
            return country.code === d.code;
          });
          if (populationItem.length > 0) {
            year = 1980;
            while (year < 2016) {
              if (d[year]) {
                population = +populationItem[0][year];
                if (population !== 0) {
                  d.cases[year] = +d[year];
                  d.values[year] = 100000 * +d[year] / population;
                } else {

                }
              } else {

              }
              delete d[year];
              year++;
            }
          } else {
            console.log('No hay datos de población para', d.name);
          }
          return d.total = d3.values(d.values).reduce((function(a, b) {
            return a + b;
          }), 0);
        });
        setupHeatMapGraph('vaccines-measles-graph-1', data_cases, ['FIN', 'HUN', 'PRT', 'URY', 'MEX', 'COL'], true);
        return setupHeatMapGraph('vaccines-measles-graph-2', data_cases, ['IRQ', 'BGR', 'MNG', 'ZAF', 'FRA', 'GEO'], false);
      });
    };
    setupImmunizationCoverageDynamicLineGraph = function() {
      var graph;
      graph = new window.LineGraph('immunization-coverage-graph-all', {
        key: {
          id: 'code',
          x: 'name'
        },
        label: true,
        margin: {
          top: 20
        }
      });
      graph.getScaleYDomain = function(d) {
        return [0, 100];
      };
      graph.yAxis.tickValues([0, 25, 50, 75, 100]);
      d3.csv(baseurl + '/data/immunization-coverage.csv', function(error, data) {
        graph.setData(data.filter(function(d) {
          return d.vaccine === $('#immunization-coverage-vaccine-selector').val();
        }));
        $('#immunization-coverage-vaccine-selector').change(function(e) {
          graph.setData(data.filter(function(d) {
            return d.vaccine === $('#immunization-coverage-vaccine-selector').val();
          }));
          return $('#immunization-coverage-country-1-selector').trigger('change');
        });
        $('#immunization-coverage-country-1-selector, #immunization-coverage-country-2-selector').change(function(e) {
          $('#immunization-coverage-graph-all').find('.line-label, .line').removeClass('active');
          $('#immunization-coverage-graph-all #line-' + $('#immunization-coverage-country-1-selector').val()).addClass('active');
          $('#immunization-coverage-graph-all #line-' + $('#immunization-coverage-country-2-selector').val()).addClass('active');
          $('#immunization-coverage-graph-all #line-label-' + $('#immunization-coverage-country-1-selector').val()).addClass('active');
          return $('#immunization-coverage-graph-all #line-label-' + $('#immunization-coverage-country-2-selector').val()).addClass('active');
        });
        return $('#immunization-coverage-country-1-selector').trigger('change');
      });
      return $(window).resize(graph.onResize);
    };
    setupImmunizationCoverageMultipleSmallGraph = function() {
      var current_countries, graphs;
      current_countries = ['LKA', 'DZA', 'DEU', 'DNK', 'FRA'];
      graphs = [];
      return d3.queue().defer(d3.csv, baseurl + '/data/immunization-coverage-mcv2.csv').defer(d3.csv, baseurl + '/data/countries.csv').defer(d3.json, 'http://freegeoip.net/json/').await(function(error, data, countries, location) {
        var el, user_country;
        if (location) {
          user_country = countries.filter(function(d) {
            return d.code2 === location.country_code;
          });
          if (user_country && user_country.length > 0 && user_country[0].code) {
            if (current_countries.indexOf(user_country[0].code) === -1) {
              current_countries[2] = user_country[0].code;
              el = $('#immunization-coverage-graph .graph-container').eq(2);
              el.find('p').html(user_country[0]['name_' + lang]);
              el.find('.line-graph').attr('id', 'immunization-coverage-' + user_country[0].code.toLowerCase() + '-graph');
            }
          }
        }
        return current_countries.forEach(function(country, i) {
          var country_data, graph;
          country_data = data.filter(function(d) {
            return d.code === country;
          }).map(function(d) {
            return $.extend({}, d);
          });
          country_data.forEach(function(d) {
            delete d['2001'];
            return delete d['2002'];
          });
          graph = new window.LineGraph('immunization-coverage-' + country.toLowerCase() + '-graph', {
            isArea: true,
            key: {
              x: 'name',
              id: 'code'
            }
          });
          graphs.push(graph);
          graph.yFormat = function(d) {
            return d + '%';
          };
          graph.getScaleYDomain = function(d) {
            return [0, 100];
          };
          graph.yAxis.tickValues([50]);
          graph.xAxis.tickValues([2003, 2015]);
          graph.addMarker({
            value: 95,
            label: i % 2 !== 0 ? '' : lang === 'es' ? 'Nivel de rebaño' : 'Herd immunity',
            align: 'left'
          });
          graph.$el.on('draw-complete', function(e) {
            graph.setLabel(2015);
            graph.container.select('.x.axis').selectAll('.tick').style('display', 'block');
            return graph.container.select('.tick-hover').style('display', 'none');
          });
          graph.setData(country_data);
          graph.$el.on('change-year', function(e, year) {
            return graphs.forEach(function(g) {
              if (g !== graph) {
                return g.setLabel(year);
              }
            });
          });
          graph.$el.on('mouseout', function(e) {
            return graphs.forEach(function(g) {
              if (g !== graph) {
                return g.hideLabel();
              }
            });
          });
          return $(window).resize(graph.onResize);
        });
      });
    };
    setupWorldCasesMultipleSmallGraph = function() {
      var diseases, graphs;
      diseases = ['diphteria', 'measles', 'pertussis', 'polio', 'tetanus'];
      graphs = [];
      return d3.csv(baseurl + '/data/diseases-cases-world.csv', function(error, data) {
        var maxValue1, maxValue2;
        maxValue1 = d3.max(data, function(d) {
          return d3.max(d3.values(d), function(e) {
            return +e;
          });
        });
        maxValue2 = 100000;
        return diseases.forEach(function(disease) {
          var disease_data, graph;
          disease_data = data.filter(function(d) {
            return d.disease === disease;
          }).map(function(d) {
            return $.extend({}, d);
          });
          graph = new window.LineGraph(disease + '-world-graph', {
            isArea: true,
            margin: {
              left: 20
            },
            key: {
              x: 'disease',
              id: 'disease'
            }
          });
          graphs.push(graph);
          graph.xAxis.tickValues([1980, 2015]);
          graph.yAxis.ticks(2).tickFormat(d3.format('.0s'));
          graph.yFormat = d3.format('.2s');
          graph.getScaleYDomain = function() {
            return [0, disease === 'measles' || disease === 'pertussis' ? maxValue1 : maxValue2];
          };
          graph.setData(disease_data);
          graph.$el.on('change-year', function(e, year) {
            return graphs.forEach(function(g) {
              if (g !== graph) {
                return g.setLabel(year);
              }
            });
          });
          graph.$el.on('mouseout', function(e) {
            return graphs.forEach(function(g) {
              if (g !== graph) {
                return g.hideLabel();
              }
            });
          });
          return $(window).resize(graph.onResize);
        });
      });
    };
    setupImmunizationDiseaseBarGraph = function() {
      return d3.queue().defer(d3.csv, baseurl + '/data/immunization-coverage.csv').defer(d3.csv, baseurl + '/data/countries.csv').defer(d3.json, 'http://freegeoip.net/json/').await(function(error, data, countries, location) {
        var data_parser, data_sort, herdImmunity, user_country;
        if (location) {
          user_country = countries.filter(function(d) {
            return d.code2 === location.country_code;
          });
          location.code = user_country[0].code;
          location.name = user_country[0]['name_' + lang];
        }
        herdImmunity = {
          'MCV1': 95,
          'Pol3': 80,
          'DTP3': 80
        };
        data = data.filter(function(d) {
          return excludedCountries.indexOf(d.code) === -1;
        });
        data_parser = function(d) {
          var obj;
          obj = {
            key: d.code,
            name: getCountryName(countries, d.code, lang),
            value: +d['2015']
          };
          if (location && d.code === location.code) {
            obj.active = true;
          }
          return obj;
        };
        data_sort = function(a, b) {
          return b.value - a.value;
        };
        return $('.immunization-coverage-disease-graph').each(function() {
          var $el, disease, graph, graph_data, graph_value, marker, vaccine;
          $el = $(this);
          disease = $el.data('disease');
          vaccine = $el.data('vaccine');
          graph_data = data.filter(function(d) {
            return d.vaccine === vaccine && d['2015'] !== '';
          }).map(data_parser).sort(data_sort);
          if (location) {
            graph_value = graph_data.filter(function(d) {
              return d.key === location.code;
            });
          }
          graph = new window.BarGraph(disease + '-immunization-bar-graph', {
            aspectRatio: 0.25,
            label: {
              format: function(d) {
                return +d + '%';
              }
            },
            key: {
              x: 'name'
            },
            margin: {
              top: 20
            }
          });
          marker = {
            value: herdImmunity[vaccine],
            label: lang === 'es' ? 'Nivel de rebaño' : 'Herd immunity'
          };
          if (vaccine === 'DTP3') {
            marker.label = lang === 'es' ? 'Recomendación OMS' : 'WHO recommendation';
          }
          graph.addMarker(marker).setData(graph_data);
          if (graph_value && graph_value.length > 0) {
            $el.find('.immunization-country').html(location.name);
            $el.find('.immunization-data').html('<strong>' + graph_value[0].value + '%</strong>');
            $el.find('.immunization-description').show();
          }
          return $(window).resize(function() {
            return graph.onResize();
          });
        });
      });
    };
    setupVaccinePricesGraph = function() {
      var vaccines;
      vaccines = ['pneumo13', 'BCG', 'IPV', 'MMR', 'HepB-pediátrica', 'VPH', 'DTPa-IPV-HIB', 'DTaP', 'Tdap', 'DTP'];
      return d3.csv(baseurl + '/data/prices-vaccines.csv', function(error, data) {
        var graph;
        data = data.filter(function(d) {
          return vaccines.indexOf(d.vaccine) !== -1;
        });
        graph = new window.ScatterplotDiscreteGraph('vaccine-prices-graph', {
          aspectRatio: 0.5,
          margin: {
            right: 25,
            left: 25,
            bottom: 20
          },
          key: {
            x: 'country',
            y: 'price',
            id: 'country',
            color: 'vaccine'
          }
        });
        graph.getDotId = function(d) {
          return 'dot-' + d.country + '-' + d.vaccine;
        };
        graph.getDotLabelId = function(d) {
          return 'dot-label-' + d.country + '-' + d.vaccine;
        };
        graph.getDotLabelText = function(d) {
          return '';
        };
        graph.xAxis.tickPadding(10);
        graph.yAxis.ticks(5).tickPadding(15).tickFormat(function(d) {
          return '$' + d;
        });
        graph.dataParser = function(data) {
          data.forEach((function(_this) {
            return function(d) {
              d[_this.options.key.y] = +d[_this.options.key.y];
              return d[_this.options.key.size] = +d[_this.options.key.size];
            };
          })(this));
          return data;
        };
        graph.setTooltipData = function(d) {
          var dosesFormat;
          dosesFormat = d3.format('.0s');
          this.$tooltip.find('.tooltip-inner .title').html(d.country);
          this.$tooltip.find('.tooltip-inner .vaccine').html(d.vaccine);
          this.$tooltip.find('.tooltip-inner .price').html(d.price);
          this.$tooltip.find('.tooltip-inner .dosis').html(d.doses ? dosesFormat(d.doses) + ' dosis ' : '');
          return this.$tooltip.find('.tooltip-inner .company').html(d.company ? '(' + d.company + ')' : '');
        };
        graph.setData(data);
        return $(window).resize(graph.onResize);
      });
    };

    /*
    setupGuatemalaCoverageLineGraph = ->
      graph = new window.LineGraph('guatemala-coverage-mmr',
        #isArea: true
        margin: 
          left: 0
          right: 0
          bottom: 20)
      graph.xAxis.tickValues [2000, 2005, 2010, 2015]
      graph.yAxis
        .tickValues [0, 25, 50, 75, 100]
        .tickFormat (d) -> d+'%'
      graph.loadData baseurl+'/data/guatemala-coverage-mmr.csv'
      graph.$el.on 'draw-complete', (e) ->
        line = graph.container.select('.line')
        console.log line.node()
        length = line.node().getTotalLength();
        line
          .attr('stroke-dasharray', length + ' ' + length)
          .attr('stroke-dashoffset', length)
          .transition()
            .delay(5000)
            .duration(5000)
            .ease(d3.easeSinInOut)
            .attr('stroke-dashoffset', 0)
    
    if $('#guatemala-coverage-mmr').length > 0
      setupGuatemalaCoverageLineGraph()
     */
    if ($('#video-map-polio').length > 0) {
      setVideoMapPolio();
    }

    /*
    ## Vaccine map
    if $('#vaccine-map').length > 0
      vaccine_map = new VaccineMap 'vaccine-map'
      #vaccine_map.getData = true  #  Set true to download a polio cases csv
      vaccine_map.getPictureSequence = true   # Set true to download a map picture sequence
      vaccine_map.init baseurl+'/data/diseases-polio-cases.csv', baseurl+'/data/map-polio-cases.csv'
      $(window).resize vaccine_map.onResize
     */
    if ($('.vaccines-disease-graph').length > 0) {
      setupVaccineDiseaseHeatmapGraph();
    }

    /*
     * Vaccine all diseases graph
    if $('#vaccines-all-diseases-graph').length > 0
      graph_vaccine_all_diseases = new VaccineDiseaseGraph('vaccines-all-diseases-graph')
      graph_vaccine_all_diseases.init $('#disease-selector .active a').attr('href').substring(1), $('#vaccines-all-diseases-graph #order-selector').val()
      $(window).resize graph_vaccine_all_diseases.onResize
       * Update graph based on selected disease
      $('#disease-selector a').click (e) ->
        e.preventDefault()
        $(this).tab 'show'
        graph_vaccine_all_diseases.init $(this).attr('href').substring(1), $('#vaccines-all-diseases-graph #order-selector').val()
        return
       * Update graph baseon on order selector
      $('#vaccines-all-diseases-graph #order-selector').change (d) ->
        graph_vaccine_all_diseases.init $('#disease-selector .active a').attr('href').substring(1), $(this).val()
     */
    if ($('#immunization-coverage-graph-all').length > 0) {
      setupImmunizationCoverageDynamicLineGraph();
    }
    if ($('#immunization-coverage-graph').length > 0) {
      setupImmunizationCoverageMultipleSmallGraph();
    }
    if ($('#world-cases').length > 0) {
      setupWorldCasesMultipleSmallGraph();
    }
    if ($('.immunization-coverage-disease-graph').length > 0) {
      setupImmunizationDiseaseBarGraph();
    }
    if ($('#measles-world-map-graph').length > 0) {
      setupMeaslesWorldMapGraph();
    }
    if ($('#vaccine-confidence-graph').length > 0) {
      setupVaccineConfidenceBarGraph();
    }
    if ($('#vaccine-bcg-cases-graph').length > 0) {
      setupVaccineBcgCasesMap();
    }
    if ($('#vaccine-bcg-stockouts').length > 0) {
      setupVaccineBcgStockoutsMap();
    }
    if ($('#vaccine-prices-graph').length > 0) {
      return setupVaccinePricesGraph();
    }
  })(jQuery);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UtZ3JhcGguY29mZmVlIiwiYmFyLWdyYXBoLmNvZmZlZSIsImxpbmUtZ3JhcGguY29mZmVlIiwiaGVhdG1hcC1ncmFwaC5jb2ZmZWUiLCJtYXAtZ3JhcGguY29mZmVlIiwic2NhdHRlcnBsb3QtZ3JhcGguY29mZmVlIiwic2NhdHRlcnBsb3QtZGlzY3JldGUtZ3JhcGguY29mZmVlIiwibWFpbi12YWNjaW5lcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFNLE1BQU0sQ0FBQztBQUVYLFFBQUE7O0lBQUEsY0FBQSxHQUNFO01BQUEsTUFBQSxFQUNFO1FBQUEsR0FBQSxFQUFLLENBQUw7UUFDQSxLQUFBLEVBQU8sQ0FEUDtRQUVBLE1BQUEsRUFBUSxFQUZSO1FBR0EsSUFBQSxFQUFNLENBSE47T0FERjtNQUtBLFdBQUEsRUFBYSxNQUxiO01BTUEsS0FBQSxFQUFPLEtBTlA7TUFPQSxNQUFBLEVBQVEsS0FQUjtNQVFBLFdBQUEsRUFBYSxJQVJiO01BU0EsR0FBQSxFQUNFO1FBQUEsRUFBQSxFQUFJLEtBQUo7UUFDQSxDQUFBLEVBQUksS0FESjtRQUVBLENBQUEsRUFBSSxPQUZKO09BVkY7OztJQWNGLGFBQUEsR0FDRTtNQUFBLEtBQUEsRUFBTyxJQUFQO01BQ0EsS0FBQSxFQUFPLEVBRFA7TUFFQSxXQUFBLEVBQWEsWUFGYjtNQUdBLEtBQUEsRUFBTSxPQUhOOzs7SUFTVyxtQkFBQyxFQUFELEVBQUssT0FBTDs7Ozs7O01BQ1gsSUFBQyxDQUFBLEVBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxPQUFELEdBQVksQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQWUsRUFBZixFQUFtQixjQUFuQixFQUFtQyxPQUFuQztNQUNaLElBQUMsQ0FBQSxHQUFELEdBQVksQ0FBQSxDQUFFLEdBQUEsR0FBSSxJQUFDLENBQUEsRUFBUDtNQUNaLElBQUMsQ0FBQSxhQUFELENBQUE7TUFDQSxJQUFDLENBQUEsTUFBRCxDQUFB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QztNQUNFLHlCQUFBLENBQUEsRUFERjs7SUFHQSxJQUFHLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLE1BQS9CLEdBQXdDLENBQTNDO01BQ0UsOEJBQUEsQ0FBQSxFQURGOztJQUdBLElBQUcsQ0FBQSxDQUFFLDBCQUFGLENBQTZCLENBQUMsTUFBOUIsR0FBdUMsQ0FBMUM7TUFDRSx1QkFBQSxDQUFBLEVBREY7O0lBR0EsSUFBRyxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxNQUE1QixHQUFxQyxDQUF4QztNQUNFLDJCQUFBLENBQUEsRUFERjs7SUFHQSxJQUFHLENBQUEsQ0FBRSx1QkFBRixDQUEwQixDQUFDLE1BQTNCLEdBQW9DLENBQXZDO2FBQ0UsdUJBQUEsQ0FBQSxFQURGOztFQXRsQkQsQ0FBRCxDQUFBLENBeWxCRSxNQXpsQkY7QUFBQSIsImZpbGUiOiJ2YWNjaW5lcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIHdpbmRvdy5CYXNlR3JhcGhcblxuICBvcHRpb25zRGVmYXVsdCA9IFxuICAgIG1hcmdpbjpcbiAgICAgIHRvcDogMFxuICAgICAgcmlnaHQ6IDBcbiAgICAgIGJvdHRvbTogMjBcbiAgICAgIGxlZnQ6IDBcbiAgICBhc3BlY3RSYXRpbzogMC41NjI1XG4gICAgbGFiZWw6IGZhbHNlICAgICAgICAgICAjIHNob3cvaGlkZSBsYWJlbHNcbiAgICBsZWdlbmQ6IGZhbHNlICAgICAgICAgICMgc2hvdy9oaWRlIGxlZ2VuZFxuICAgIG1vdXNlRXZlbnRzOiB0cnVlICAgICAgIyBhZGQvcmVtb3ZlIG1vdXNlIGV2ZW50IGxpc3RlbmVyc1xuICAgIGtleTpcbiAgICAgIGlkOiAna2V5J1xuICAgICAgeDogICdrZXknICAgICAgICAgICAgIyBuYW1lIGZvciB4IGNvbHVtblxuICAgICAgeTogICd2YWx1ZScgICAgICAgICAgIyBuYW1lIGZvciB5IGNvbHVtblxuXG4gIG1hcmtlckRlZmF1bHQgPVxuICAgIHZhbHVlOiBudWxsXG4gICAgbGFiZWw6ICcnXG4gICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJ1xuICAgIGFsaWduOidyaWdodCdcbiBcblxuICAjIENvbnN0cnVjdG9yXG4gICMgLS0tLS0tLS0tLS1cblxuICBjb25zdHJ1Y3RvcjogKGlkLCBvcHRpb25zKSAtPlxuICAgIEBpZCAgICAgICA9IGlkXG4gICAgQG9wdGlvbnMgID0gJC5leHRlbmQgdHJ1ZSwge30sIG9wdGlvbnNEZWZhdWx0LCBvcHRpb25zICAjIG1lcmdlIG9wdGlvbnNEZWZhdWx0ICYgb3B0aW9uc1xuICAgIEAkZWwgICAgICA9ICQoJyMnK0BpZClcbiAgICBAZ2V0RGltZW5zaW9ucygpXG4gICAgQHNldFNWRygpXG4gICAgQHNldFNjYWxlcygpXG4gICAgQG1hcmtlcnMgPSBbXVxuICAgIHJldHVybiBAXG5cblxuICAjIE1haW4gbWV0aG9kc1xuICAjIC0tLS0tLS0tLS0tLVxuXG4gIHNldFNWRzogLT5cbiAgICBAc3ZnID0gZDMuc2VsZWN0KCcjJytAaWQpLmFwcGVuZCgnc3ZnJylcbiAgICAgIC5hdHRyICd3aWR0aCcsIEBjb250YWluZXJXaWR0aFxuICAgICAgLmF0dHIgJ2hlaWdodCcsIEBjb250YWluZXJIZWlnaHRcbiAgICBAY29udGFpbmVyID0gQHN2Zy5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIgJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIEBvcHRpb25zLm1hcmdpbi5sZWZ0ICsgJywnICsgQG9wdGlvbnMubWFyZ2luLnRvcCArICcpJ1xuXG4gIGxvYWREYXRhOiAodXJsKSAtPlxuICAgIGQzLmNzdiB1cmwsIChlcnJvciwgZGF0YSkgPT5cbiAgICAgIEAkZWwudHJpZ2dlciAnZGF0YS1sb2FkZWQnXG4gICAgICBAc2V0RGF0YSBkYXRhXG4gICAgcmV0dXJuIEBcbiAgICBcbiAgc2V0RGF0YTogKGRhdGEpIC0+XG4gICAgQGRhdGEgPSBAZGF0YVBhcnNlcihkYXRhKVxuICAgIEBkcmF3U2NhbGVzKClcbiAgICBpZiBAb3B0aW9ucy5sZWdlbmRcbiAgICAgIEBkcmF3TGVnZW5kKClcbiAgICBAZHJhd01hcmtlcnMoKVxuICAgIEBkcmF3R3JhcGgoKVxuICAgIEAkZWwudHJpZ2dlciAnZHJhdy1jb21wbGV0ZSdcbiAgICByZXR1cm4gQFxuXG4gICMgdG8gb3ZlcmRyaXZlXG4gIGRhdGFQYXJzZXI6IChkYXRhKSAtPlxuICAgIHJldHVybiBkYXRhXG4gIFxuICAjIHRvIG92ZXJkcml2ZVxuICBzZXRHcmFwaDogLT5cbiAgICByZXR1cm4gQFxuXG5cbiAgIyBTY2FsZSBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tXG5cbiAgIyB0byBvdmVyZHJpdmVcbiAgc2V0U2NhbGVzOiAtPlxuICAgIHJldHVybiBAXG5cbiAgZHJhd1NjYWxlczogLT5cbiAgICAjIHNldCBzY2FsZXMgZG9tYWluc1xuICAgIEB4LmRvbWFpbiBAZ2V0U2NhbGVYRG9tYWluKClcbiAgICBAeS5kb21haW4gQGdldFNjYWxlWURvbWFpbigpXG4gICAgIyBzZXQgeCBheGlzXG4gICAgaWYgQHhBeGlzXG4gICAgICBAY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyICdjbGFzcycsICd4IGF4aXMnXG4gICAgICAgIC5jYWxsIEBzZXRYQXhpc1Bvc2l0aW9uIFxuICAgICAgICAuY2FsbCBAeEF4aXNcbiAgICAjIHNldCB5IGF4aXNcbiAgICBpZiBAeUF4aXNcbiAgICAgIEBjb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIgJ2NsYXNzJywgJ3kgYXhpcydcbiAgICAgICAgLmNhbGwgQHNldFlBeGlzUG9zaXRpb25cbiAgICAgICAgLmNhbGwgQHlBeGlzXG4gICAgcmV0dXJuIEBcblxuICAjIHRvIG92ZXJkcml2ZVxuICBnZXRTY2FsZVhSYW5nZTogLT5cbiAgICByZXR1cm4gWzAsIEB3aWR0aF1cblxuICAjIHRvIG92ZXJkcml2ZVxuICBnZXRTY2FsZVlSYW5nZTogLT5cbiAgICByZXR1cm4gW0BoZWlnaHQsIDBdXG5cbiAgIyB0byBvdmVyZHJpdmVcbiAgZ2V0U2NhbGVYRG9tYWluOiAtPlxuICAgIHJldHVybiBbXVxuXG4gICMgdG8gb3ZlcmRyaXZlXG4gIGdldFNjYWxlWURvbWFpbjogLT5cbiAgICByZXR1cm4gW11cblxuICAjIHRvIG92ZXJkcml2ZVxuICBkcmF3TGVnZW5kOiAtPlxuICAgIHJldHVybiBAXG5cblxuICAjIE1hcmtlciBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tLVxuXG4gIGFkZE1hcmtlcjogKG1hcmtlcikgLT5cbiAgICBAbWFya2Vycy5wdXNoICQuZXh0ZW5kIHt9LCBtYXJrZXJEZWZhdWx0LCBtYXJrZXJcbiAgICByZXR1cm4gQFxuXG4gIGRyYXdNYXJrZXJzOiAtPiBcbiAgICAjIERyYXcgbWFya2VyIGxpbmVcbiAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLm1hcmtlcicpXG4gICAgICAuZGF0YShAbWFya2VycylcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2xpbmUnKVxuICAgICAgLmF0dHIgJ2NsYXNzJywgJ21hcmtlcidcbiAgICAgIC5jYWxsIEBzZXR1cE1hcmtlckxpbmVcbiAgICAjIERyYXcgbWFya2VyIGxhYmVsXG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5tYXJrZXItbGFiZWwnKVxuICAgICAgLmRhdGEoQG1hcmtlcnMpXG4gICAgLmVudGVyKCkuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyICdjbGFzcycsICdtYXJrZXItbGFiZWwnXG4gICAgICAuYXR0ciAndGV4dC1hbmNob3InLCAoZCkgLT4gaWYgZC5vcmllbnRhdGlvbiA9PSAndmVydGljYWwnIHRoZW4gJ21pZGRsZScgZWxzZSBpZiBkLmFsaWduID09ICdyaWdodCcgdGhlbiAnZW5kJyBlbHNlICdzdGFydCdcbiAgICAgIC5hdHRyICdkeScsIChkKSAtPiBpZiBkLm9yaWVudGF0aW9uID09ICdob3Jpem9udGFsJyB0aGVuICctMC4yNWVtJyBlbHNlIDBcbiAgICAgIC50ZXh0IChkKSAtPiBkLmxhYmVsXG4gICAgICAuY2FsbCBAc2V0dXBNYXJrZXJMYWJlbFxuXG4gIHNldHVwTWFya2VyTGluZTogKGVsZW1lbnQpID0+XG4gICAgZWxlbWVudFxuICAgICAgLmF0dHIgJ3gxJywgKGQpID0+IGlmIGQub3JpZW50YXRpb24gPT0gJ2hvcml6b250YWwnIHRoZW4gMCBlbHNlIEB4KGQudmFsdWUpXG4gICAgICAuYXR0ciAneTEnLCAoZCkgPT4gaWYgZC5vcmllbnRhdGlvbiA9PSAnaG9yaXpvbnRhbCcgdGhlbiBAeShkLnZhbHVlKSBlbHNlIDBcbiAgICAgIC5hdHRyICd4MicsIChkKSA9PiBpZiBkLm9yaWVudGF0aW9uID09ICdob3Jpem9udGFsJyB0aGVuIEB3aWR0aCBlbHNlIEB4KGQudmFsdWUpIFxuICAgICAgLmF0dHIgJ3kyJywgKGQpID0+IGlmIGQub3JpZW50YXRpb24gPT0gJ2hvcml6b250YWwnIHRoZW4gQHkoZC52YWx1ZSkgZWxzZSBAaGVpZ2h0IFxuXG4gIHNldHVwTWFya2VyTGFiZWw6IChlbGVtZW50KSA9PlxuICAgIGVsZW1lbnRcbiAgICAgIC5hdHRyICd4JywgKGQpID0+IGlmIGQub3JpZW50YXRpb24gPT0gJ2hvcml6b250YWwnIHRoZW4gKGlmIGQuYWxpZ24gPT0gJ3JpZ2h0JyB0aGVuIEB3aWR0aCBlbHNlIDAgKSBlbHNlIEB4KGQudmFsdWUpIFxuICAgICAgLmF0dHIgJ3knLCAoZCkgPT4gaWYgZC5vcmllbnRhdGlvbiA9PSAnaG9yaXpvbnRhbCcgdGhlbiBAeShkLnZhbHVlKSBlbHNlIEBoZWlnaHQgICBcblxuXG4gICMgUmVzaXplIG1ldGhvZHNcbiAgIyAtLS0tLS0tLS0tLS1cblxuICBvblJlc2l6ZTogPT5cbiAgICBAZ2V0RGltZW5zaW9ucygpXG4gICAgQHVwZGF0ZUdyYXBoRGltZW5zaW9ucygpXG4gICAgcmV0dXJuIEBcblxuICBnZXREaW1lbnNpb25zOiAtPlxuICAgIGlmIEAkZWxcbiAgICAgIEBjb250YWluZXJXaWR0aCAgPSBAJGVsLndpZHRoKClcbiAgICAgIEBjb250YWluZXJIZWlnaHQgPSBAY29udGFpbmVyV2lkdGggKiBAb3B0aW9ucy5hc3BlY3RSYXRpb1xuICAgICAgQHdpZHRoICAgICAgICAgICA9IEBjb250YWluZXJXaWR0aCAtIEBvcHRpb25zLm1hcmdpbi5sZWZ0IC0gQG9wdGlvbnMubWFyZ2luLnJpZ2h0XG4gICAgICBAaGVpZ2h0ICAgICAgICAgID0gQGNvbnRhaW5lckhlaWdodCAtIEBvcHRpb25zLm1hcmdpbi50b3AgLSBAb3B0aW9ucy5tYXJnaW4uYm90dG9tXG4gICAgcmV0dXJuIEBcblxuICAjIHRvIG92ZXJkcml2ZVxuICB1cGRhdGVHcmFwaERpbWVuc2lvbnM6IC0+XG4gICAgIyB1cGRhdGUgc3ZnIGRpbWVuc2lvblxuICAgIEBzdmdcbiAgICAgIC5hdHRyICd3aWR0aCcsICBAY29udGFpbmVyV2lkdGhcbiAgICAgIC5hdHRyICdoZWlnaHQnLCBAY29udGFpbmVySGVpZ2h0XG4gICAgIyB1cGRhdGUgc2NhbGVzIGRpbWVuc2lvbnNcbiAgICBpZiBAeFxuICAgICAgQHgucmFuZ2UgQGdldFNjYWxlWFJhbmdlKClcbiAgICBpZiBAeVxuICAgICAgQHkucmFuZ2UgQGdldFNjYWxlWVJhbmdlKClcbiAgICAjIHVwZGF0ZSBheGlzIGRpbWVuc2lvbnNcbiAgICBpZiBAeEF4aXNcbiAgICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcueC5heGlzJylcbiAgICAgICAgLmNhbGwgQHNldFhBeGlzUG9zaXRpb25cbiAgICAgICAgLmNhbGwgQHhBeGlzXG4gICAgaWYgQHlBeGlzXG4gICAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLnkuYXhpcycpXG4gICAgICAgIC5jYWxsIEBzZXRZQXhpc1Bvc2l0aW9uXG4gICAgICAgIC5jYWxsIEB5QXhpc1xuICAgICMgdXBkYXRlIG1hcmtlcnNcbiAgICBAY29udGFpbmVyLnNlbGVjdCgnLm1hcmtlcicpXG4gICAgICAuY2FsbCBAc2V0dXBNYXJrZXJMaW5lXG4gICAgQGNvbnRhaW5lci5zZWxlY3QoJy5tYXJrZXItbGFiZWwnKVxuICAgICAgLmNhbGwgQHNldHVwTWFya2VyTGFiZWxcbiAgICByZXR1cm4gQFxuXG4gIHNldFhBeGlzUG9zaXRpb246IChzZWxlY3Rpb24pID0+XG4gICAgc2VsZWN0aW9uLmF0dHIgJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwnK0BoZWlnaHQrJyknXG5cbiAgc2V0WUF4aXNQb3NpdGlvbjogKHNlbGVjdGlvbikgPT5cbiAgICBzZWxlY3Rpb24uYXR0ciAndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnK0B3aWR0aCsnLDApJ1xuXG5cbiAgIyBBdXhpbGlhciBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGdldERhdGFYOiAtPlxuICAgIHJldHVybiBkW0BvcHRpb25zLmtleS54XVxuXG4gIGdldERhdGFZOiAtPlxuICAgIHJldHVybiBkW0BvcHRpb25zLmtleS55XSIsImNsYXNzIHdpbmRvdy5CYXJHcmFwaCBleHRlbmRzIHdpbmRvdy5CYXNlR3JhcGhcblxuXG4gICMgQ29uc3RydWN0b3JcbiAgIyAtLS0tLS0tLS0tLVxuXG4gIGNvbnN0cnVjdG9yOiAoaWQsIG9wdGlvbnMpIC0+XG4gICAgI2NvbnNvbGUubG9nICdCYXIgR3JhcGgnLCBpZCwgb3B0aW9uc1xuICAgIHN1cGVyIGlkLCBvcHRpb25zXG4gICAgcmV0dXJuIEBcblxuXG4gICMgTWFpbiBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tXG5cbiAgZGF0YVBhcnNlcjogKGRhdGEpIC0+XG4gICAgZGF0YS5mb3JFYWNoIChkKSA9PiBcbiAgICAgIGRbQG9wdGlvbnMua2V5LnldID0gK2RbQG9wdGlvbnMua2V5LnldXG4gICAgcmV0dXJuIGRhdGFcblxuICBzZXRTY2FsZXM6IC0+XG4gICAgIyBzZXQgeCBzY2FsZVxuICAgIEB4ID0gZDMuc2NhbGVCYW5kKClcbiAgICAgIC5yYW5nZSBAZ2V0U2NhbGVYUmFuZ2UoKVxuICAgICAgLnBhZGRpbmdJbm5lcigwLjEpXG4gICAgICAucGFkZGluZ091dGVyKDApXG4gICAgIyBzZXQgeSBzY2FsZVxuICAgIEB5ID0gZDMuc2NhbGVMaW5lYXIoKVxuICAgICAgLnJhbmdlIEBnZXRTY2FsZVlSYW5nZSgpXG4gICAgcmV0dXJuIEBcblxuICBnZXRTY2FsZVhEb21haW46ID0+XG4gICAgcmV0dXJuIEBkYXRhLm1hcCAoZCkgPT4gZFtAb3B0aW9ucy5rZXkueF1cblxuICBnZXRTY2FsZVlEb21haW46ID0+XG4gICAgcmV0dXJuIFswLCBkMy5tYXgoQGRhdGEsIChkKSA9PiBkW0BvcHRpb25zLmtleS55XSldXG5cbiAgZHJhd0dyYXBoOiAtPlxuICAgICMgZHJhdyBiYXJzXG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5iYXInKVxuICAgICAgLmRhdGEoQGRhdGEpXG4gICAgLmVudGVyKCkuYXBwZW5kKCdyZWN0JylcbiAgICAgIC5hdHRyICdjbGFzcycsIChkKSAtPiBpZiBkLmFjdGl2ZSB0aGVuICdiYXIgYWN0aXZlJyBlbHNlICdiYXInXG4gICAgICAuYXR0ciAnaWQnLCAgICAoZCkgPT4gZFtAb3B0aW9ucy5rZXkuaWRdXG4gICAgICAuY2FsbCBAc2V0QmFyRGltZW5zaW9uc1xuICAgIGlmIEBvcHRpb25zLm1vdXNlRXZlbnRzXG4gICAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLmJhcicpXG4gICAgICAgIC5vbiAgICdtb3VzZW92ZXInLCBAb25Nb3VzZU92ZXJcbiAgICAgICAgLm9uICAgJ21vdXNlb3V0JywgQG9uTW91c2VPdXRcbiAgICBpZiBAb3B0aW9ucy5sYWJlbFxuICAgICAgIyBkcmF3IGxhYmVscyB4XG4gICAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLmJhci1sYWJlbC14JylcbiAgICAgICAgLmRhdGEoQGRhdGEpXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAuYXR0ciAnY2xhc3MnLCAoZCkgLT4gaWYgZC5hY3RpdmUgdGhlbiAnYmFyLWxhYmVsLXggYWN0aXZlJyBlbHNlICdiYXItbGFiZWwteCdcbiAgICAgICAgLmF0dHIgJ2lkJywgICAgKGQpID0+ICdiYXItbGFiZWwteC0nK2RbQG9wdGlvbnMua2V5LmlkXVxuICAgICAgICAuYXR0ciAnZHknLCAgICAnMS4yNWVtJ1xuICAgICAgICAuYXR0ciAndGV4dC1hbmNob3InLCAnbWlkZGxlJ1xuICAgICAgICAudGV4dCAoZCkgPT4gZFtAb3B0aW9ucy5rZXkueF1cbiAgICAgICAgLmNhbGwgQHNldEJhckxhYmVsWERpbWVuc2lvbnNcbiAgICAgICAjIGRyYXcgbGFiZWxzIHlcbiAgICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuYmFyLWxhYmVsLXknKVxuICAgICAgICAuZGF0YShAZGF0YSlcbiAgICAgIC5lbnRlcigpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyICdjbGFzcycsIChkKSAtPiBpZiBkLmFjdGl2ZSB0aGVuICdiYXItbGFiZWwteSBhY3RpdmUnIGVsc2UgJ2Jhci1sYWJlbC15J1xuICAgICAgICAuYXR0ciAnaWQnLCAgICAoZCkgPT4gJ2Jhci1sYWJlbC15LScrZFtAb3B0aW9ucy5rZXkuaWRdXG4gICAgICAgIC5hdHRyICdkeScsICAgICctMC41ZW0nXG4gICAgICAgIC5hdHRyICd0ZXh0LWFuY2hvcicsICdtaWRkbGUnXG4gICAgICAgIC50ZXh0IChkKSA9PiBpZiBAb3B0aW9ucy5sYWJlbC5mb3JtYXQgdGhlbiBAb3B0aW9ucy5sYWJlbC5mb3JtYXQoZFtAb3B0aW9ucy5rZXkueV0pIGVsc2UgZFtAb3B0aW9ucy5rZXkueV1cbiAgICAgICAgLmNhbGwgQHNldEJhckxhYmVsWURpbWVuc2lvbnNcbiAgICByZXR1cm4gQFxuXG4gIHVwZGF0ZUdyYXBoRGltZW5zaW9uczogLT5cbiAgICBzdXBlcigpXG4gICAgIyB1cGRhdGUgZ3JhcGggZGltZW5zaW9uc1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuYmFyJylcbiAgICAgIC5jYWxsIEBzZXRCYXJEaW1lbnNpb25zXG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5iYXItbGFiZWwteCcpXG4gICAgICAuY2FsbCBAc2V0QmFyTGFiZWxYRGltZW5zaW9uc1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuYmFyLWxhYmVsLXknKVxuICAgICAgLmNhbGwgQHNldEJhckxhYmVsWURpbWVuc2lvbnNcbiAgICByZXR1cm4gQFxuXG4gIHNldEJhckRpbWVuc2lvbnM6IChlbGVtZW50KSA9PlxuICAgIGVsZW1lbnRcbiAgICAgIC5hdHRyICd4JywgICAgICAoZCkgPT4gQHgoZFtAb3B0aW9ucy5rZXkueF0pXG4gICAgICAuYXR0ciAneScsICAgICAgKGQpID0+IEB5KGRbQG9wdGlvbnMua2V5LnldKVxuICAgICAgLmF0dHIgJ2hlaWdodCcsIChkKSA9PiBAaGVpZ2h0IC0gQHkoZFtAb3B0aW9ucy5rZXkueV0pXG4gICAgICAuYXR0ciAnd2lkdGgnLCAgQHguYmFuZHdpZHRoKClcblxuICBzZXRCYXJMYWJlbFhEaW1lbnNpb25zOiAoZWxlbWVudCkgPT5cbiAgICBlbGVtZW50XG4gICAgICAuYXR0ciAneCcsIChkKSA9PiBAeChkW0BvcHRpb25zLmtleS54XSkgKyBAeC5iYW5kd2lkdGgoKSAqIDAuNVxuICAgICAgLmF0dHIgJ3knLCAoZCkgPT4gQGhlaWdodFxuXG4gIHNldEJhckxhYmVsWURpbWVuc2lvbnM6IChlbGVtZW50KSA9PlxuICAgIGVsZW1lbnRcbiAgICAgIC5hdHRyICd4JywgKGQpID0+IEB4KGRbQG9wdGlvbnMua2V5LnhdKSArIEB4LmJhbmR3aWR0aCgpICogMC41XG4gICAgICAuYXR0ciAneScsIChkKSA9PiBAeShkW0BvcHRpb25zLmtleS55XSlcblxuICBvbk1vdXNlT3ZlcjogKGQpID0+XG4gICAgQGNvbnRhaW5lci5zZWxlY3QoJyNiYXItbGFiZWwteC0nK2RbQG9wdGlvbnMua2V5LmlkXSlcbiAgICAgIC5jbGFzc2VkICdhY3RpdmUnLCB0cnVlXG4gICAgQGNvbnRhaW5lci5zZWxlY3QoJyNiYXItbGFiZWwteS0nK2RbQG9wdGlvbnMua2V5LmlkXSlcbiAgICAgIC5jbGFzc2VkICdhY3RpdmUnLCB0cnVlXG5cbiAgb25Nb3VzZU91dDogKGQpID0+XG4gICAgdW5sZXNzIGQuYWN0aXZlXG4gICAgICBAY29udGFpbmVyLnNlbGVjdCgnI2Jhci1sYWJlbC14LScrZFtAb3B0aW9ucy5rZXkuaWRdKVxuICAgICAgICAuY2xhc3NlZCAnYWN0aXZlJywgZmFsc2VcbiAgICAgIEBjb250YWluZXIuc2VsZWN0KCcjYmFyLWxhYmVsLXktJytkW0BvcHRpb25zLmtleS5pZF0pXG4gICAgICAgIC5jbGFzc2VkICdhY3RpdmUnLCBmYWxzZVxuICAgICIsImNsYXNzIHdpbmRvdy5MaW5lR3JhcGggZXh0ZW5kcyB3aW5kb3cuQmFzZUdyYXBoXG5cblxuICB5Rm9ybWF0OiBkMy5mb3JtYXQoJ2QnKSAgICMgc2V0IGxhYmVscyBob3ZlciBmb3JtYXRcblxuXG4gICMgQ29uc3RydWN0b3JcbiAgIyAtLS0tLS0tLS0tLVxuXG4gIGNvbnN0cnVjdG9yOiAoaWQsIG9wdGlvbnMpIC0+XG4gICAgI2NvbnNvbGUubG9nICdMaW5lIEdyYXBoJywgaWQsIG9wdGlvbnNcbiAgICBzdXBlciBpZCwgb3B0aW9uc1xuICAgIHJldHVybiBAXG5cblxuICAjIE1haW4gbWV0aG9kc1xuICAjIC0tLS0tLS0tLS0tLVxuXG4gIHNldERhdGE6IChkYXRhKSAtPlxuICAgIEB5ZWFycyA9IEBnZXRZZWFycyBkYXRhXG4gICAgc3VwZXIoZGF0YSlcbiAgICByZXR1cm4gQFxuXG4gIGdldFllYXJzOiAoZGF0YSkgLT5cbiAgICB5ZWFycyA9IFtdXG4gICAgZDMua2V5cyhkYXRhWzBdKS5mb3JFYWNoIChkKSAtPlxuICAgICAgaWYgK2RcbiAgICAgICAgeWVhcnMucHVzaCArZFxuICAgIHJldHVybiB5ZWFycy5zb3J0KClcblxuICBkYXRhUGFyc2VyOiAoZGF0YSkgLT5cbiAgICBkYXRhLmZvckVhY2ggKGQpID0+IFxuICAgICAgZC52YWx1ZXMgPSB7fVxuICAgICAgQHllYXJzLmZvckVhY2ggKHllYXIpID0+XG4gICAgICAgIGlmIGRbeWVhcl1cbiAgICAgICAgICBkLnZhbHVlc1t5ZWFyXSA9ICtkW3llYXJdXG4gICAgICAgICNlbHNlXG4gICAgICAgICMgIGNvbnNvbGUubG9nKCdObyBoYXkgZGF0b3MgZGUgcGFyYScsIGRbQG9wdGlvbnMua2V5LnhdLCAnZW4gJywgeWVhcik7XG4gICAgICAgIGRlbGV0ZSBkW3llYXJdXG4gICAgcmV0dXJuIGRhdGFcblxuICBzZXRTY2FsZXM6IC0+XG4gICAgIyBzZXQgeCBzY2FsZVxuICAgIEB4ID0gZDMuc2NhbGVMaW5lYXIoKVxuICAgICAgLnJhbmdlIEBnZXRTY2FsZVhSYW5nZSgpXG4gICAgIyBzZXQgeSBzY2FsZVxuICAgIEB5ID0gZDMuc2NhbGVMaW5lYXIoKVxuICAgICAgLnJhbmdlIEBnZXRTY2FsZVlSYW5nZSgpXG4gICAgIyBzZXR1cCBheGlzXG4gICAgQHhBeGlzID0gZDMuYXhpc0JvdHRvbShAeClcbiAgICAgIC50aWNrRm9ybWF0IGQzLmZvcm1hdCgnJylcbiAgICBAeUF4aXMgPSBkMy5heGlzTGVmdChAeSlcbiAgICAgIC50aWNrU2l6ZSBAd2lkdGhcbiAgICAjIHNldHVwIGxpbmVcbiAgICBAbGluZSA9IGQzLmxpbmUoKVxuICAgICAgLmN1cnZlIGQzLmN1cnZlQ2F0bXVsbFJvbVxuICAgICAgLnggKGQpID0+IEB4KCtkLmtleSlcbiAgICAgIC55IChkKSA9PiBAeShkLnZhbHVlKVxuICAgICMgc2V0dXAgYXJlYVxuICAgIGlmIEBvcHRpb25zLmlzQXJlYVxuICAgICAgQGFyZWEgPSBkMy5hcmVhKClcbiAgICAgICAgLmN1cnZlIGQzLmN1cnZlQ2F0bXVsbFJvbVxuICAgICAgICAueCAgKGQpID0+IEB4KCtkLmtleSlcbiAgICAgICAgLnkwIEBoZWlnaHRcbiAgICAgICAgLnkxIChkKSA9PiBAeShkLnZhbHVlKVxuICAgIHJldHVybiBAXG5cbiAgZ2V0U2NhbGVYRG9tYWluOiA9PlxuICAgIHJldHVybiBbQHllYXJzWzBdLCBAeWVhcnNbQHllYXJzLmxlbmd0aC0xXV1cblxuICBnZXRTY2FsZVlEb21haW46IC0+XG4gICAgcmV0dXJuIFswLCBkMy5tYXggQGRhdGEsIChkKSAtPiBkMy5tYXgoZDMudmFsdWVzKGQudmFsdWVzKSldXG5cbiAgZHJhd0dyYXBoOiAtPlxuICAgICMgY2xlYXIgZ3JhcGggYmVmb3JlIHNldHVwXG4gICAgQGNvbnRhaW5lci5zZWxlY3QoJy5ncmFwaCcpLnJlbW92ZSgpXG4gICAgIyBkcmF3IGdyYXBoIGNvbnRhaW5lciBcbiAgICBAZ3JhcGggPSBAY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAuYXR0ciAnY2xhc3MnLCAnZ3JhcGgnXG4gICAgIyBkcmF3IGxpbmVzXG4gICAgQGRyYXdMaW5lcygpXG4gICAgIyBkcmF3IGFyZWFzXG4gICAgaWYgQG9wdGlvbnMuaXNBcmVhXG4gICAgICBAZHJhd0FyZWFzKClcbiAgICAjIGRyYXcgbGFiZWxzXG4gICAgaWYgQG9wdGlvbnMubGFiZWxcbiAgICAgIEBkcmF3TGFiZWxzKClcbiAgICAjIGRyYXcgbW91c2UgZXZlbnRzIGxhYmVsc1xuICAgIGlmIEBvcHRpb25zLm1vdXNlRXZlbnRzXG4gICAgICBAZHJhd0xpbmVMYWJlbEhvdmVyKClcbiAgICAgICMgZWxzZVxuICAgICAgIyAgIEBkcmF3VG9vbHRpcCgpXG4gICAgICBAZHJhd1JlY3RPdmVybGF5KClcbiAgICByZXR1cm4gQFxuXG4gIHVwZGF0ZUdyYXBoRGltZW5zaW9uczogLT5cbiAgICBzdXBlcigpXG4gICAgIyB1cGRhdGUgYXJlYSB5MFxuICAgIGlmIEBvcHRpb25zLmlzQXJlYVxuICAgICAgQGFyZWEueTAgQGhlaWdodFxuICAgICMgdXBkYXRlIHkgYXhpcyB0aWNrcyB3aWR0aFxuICAgIEB5QXhpcy50aWNrU2l6ZSBAd2lkdGhcbiAgICAjIHVwZGF0ZSBncmFwaCBkaW1lbnNpb25zXG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5saW5lJylcbiAgICAgIC5hdHRyICdkJywgQGxpbmVcbiAgICBpZiBAb3B0aW9ucy5pc0FyZWFcbiAgICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuYXJlYScpXG4gICAgICAgIC5hdHRyICdkJywgQGFyZWFcbiAgICBpZiBAb3B0aW9ucy5sYWJlbFxuICAgICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5saW5lLWxhYmVsJylcbiAgICAgICAgLmNhbGwgQHNldExhYmVsRGltZW5zaW9uc1xuICAgIGlmIEBvcHRpb25zLm1vdXNlRXZlbnRzXG4gICAgICBAY29udGFpbmVyLnNlbGVjdCgnLm92ZXJsYXknKVxuICAgICAgICAuY2FsbCBAc2V0T3ZlcmxheURpbWVuc2lvbnNcbiAgICAgIEBjb250YWluZXIuc2VsZWN0KCcudGljay1ob3ZlcicpXG4gICAgICAgIC5jYWxsIEBzZXRUaWNrSG92ZXJQb3NpdGlvblxuICAgIHJldHVybiBAXG5cbiAgZHJhd0xpbmVzOiAtPlxuICAgIEBncmFwaC5zZWxlY3RBbGwoJy5saW5lJylcbiAgICAgIC5kYXRhKEBkYXRhKVxuICAgIC5lbnRlcigpLmFwcGVuZCgncGF0aCcpXG4gICAgICAuYXR0ciAnY2xhc3MnLCAnbGluZSdcbiAgICAgIC5hdHRyICdpZCcsICAgIChkKSA9PiAnbGluZS0nICsgZFtAb3B0aW9ucy5rZXkuaWRdXG4gICAgICAuZGF0dW0gKGQpIC0+IHJldHVybiBkMy5lbnRyaWVzKGQudmFsdWVzKVxuICAgICAgLmF0dHIgJ2QnLCBAbGluZVxuXG4gIGRyYXdBcmVhczogLT5cbiAgICBAZ3JhcGguc2VsZWN0QWxsKCcuYXJlYScpXG4gICAgICAuZGF0YShAZGF0YSlcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ3BhdGgnKVxuICAgICAgLmF0dHIgICdjbGFzcycsICdhcmVhJ1xuICAgICAgLmF0dHIgICdpZCcsICAgIChkKSA9PiAnYXJlYS0nICsgZFtAb3B0aW9ucy5rZXkuaWRdXG4gICAgICAuZGF0dW0gKGQpIC0+IGQzLmVudHJpZXMoZC52YWx1ZXMpXG4gICAgICAuYXR0ciAnZCcsIEBhcmVhXG5cbiAgZHJhd0xhYmVsczogLT5cbiAgICBAZ3JhcGguc2VsZWN0QWxsKCcubGluZS1sYWJlbCcpXG4gICAgICAuZGF0YShAZGF0YSlcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgLmF0dHIgJ2NsYXNzJywgJ2xpbmUtbGFiZWwnXG4gICAgICAuYXR0ciAnaWQnLCAgICAoZCkgPT4gJ2xpbmUtbGFiZWwtJytkW0BvcHRpb25zLmtleS5pZF1cbiAgICAgIC5hdHRyICd0ZXh0LWFuY2hvcicsICdlbmQnXG4gICAgICAuYXR0ciAnZHknLCAnLTAuMTI1ZW0nXG4gICAgICAudGV4dCAoZCkgPT4gZFtAb3B0aW9ucy5rZXkueF1cbiAgICAgIC5jYWxsIEBzZXRMYWJlbERpbWVuc2lvbnNcblxuICBkcmF3TGluZUxhYmVsSG92ZXI6IC0+XG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5saW5lLWxhYmVsLXBvaW50JylcbiAgICAgIC5kYXRhKEBkYXRhKVxuICAgIC5lbnRlcigpLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyICdpZCcsICAgIChkKSA9PiAnbGluZS1sYWJlbC1wb2ludC0nK2RbQG9wdGlvbnMua2V5LmlkXVxuICAgICAgLmF0dHIgJ2NsYXNzJywgJ2xpbmUtbGFiZWwtcG9pbnQnXG4gICAgICAuYXR0ciAncicsIDRcbiAgICAgIC5zdHlsZSAnZGlzcGxheScsICdub25lJ1xuICAgIEBjb250YWluZXIuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyICdjbGFzcycsICd0aWNrLWhvdmVyJ1xuICAgICAgLmF0dHIgJ2R5JywgJzAuNzFlbScgICAgICBcbiAgICAgIC5zdHlsZSAnZGlzcGxheScsICdub25lJ1xuICAgICAgLmNhbGwgQHNldFRpY2tIb3ZlclBvc2l0aW9uXG4gICAgaWYgQGRhdGEubGVuZ3RoID09IDFcbiAgICAgIEBjb250YWluZXIuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgLmF0dHIgJ2NsYXNzJywgJ2xpbmUtbGFiZWwtaG92ZXInXG4gICAgICAgIC5hdHRyICd0ZXh0LWFuY2hvcicsICdtaWRkbGUnXG4gICAgICAgIC5hdHRyICdkeScsICctMC41ZW0nXG4gICAgICAgIC5zdHlsZSAnZGlzcGxheScsICdub25lJ1xuXG4gIGRyYXdSZWN0T3ZlcmxheTogLT5cbiAgICBAY29udGFpbmVyLmFwcGVuZCgncmVjdCcpXG4gICAgICAuYXR0ciAnY2xhc3MnLCAnb3ZlcmxheSdcbiAgICAgIC5jYWxsIEBzZXRPdmVybGF5RGltZW5zaW9uc1xuICAgICAgLm9uICdtb3VzZW92ZXInLCBAb25Nb3VzZU1vdmVcbiAgICAgIC5vbiAnbW91c2VvdXQnLCAgQG9uTW91c2VPdXRcbiAgICAgIC5vbiAnbW91c2Vtb3ZlJywgQG9uTW91c2VNb3ZlXG5cbiAgc2V0TGFiZWxEaW1lbnNpb25zOiAoZWxlbWVudCkgPT5cbiAgICBlbGVtZW50XG4gICAgICAuYXR0ciAneCcsIEB3aWR0aFxuICAgICAgLmF0dHIgJ3knLCAoZCkgPT4gQHkoZC52YWx1ZXNbQHllYXJzW0B5ZWFycy5sZW5ndGgtMV1dKVxuXG4gIHNldE92ZXJsYXlEaW1lbnNpb25zOiAoZWxlbWVudCkgPT5cbiAgICBlbGVtZW50XG4gICAgICAuYXR0ciAnd2lkdGgnLCBAd2lkdGhcbiAgICAgIC5hdHRyICdoZWlnaHQnLCBAaGVpZ2h0XG5cbiAgb25Nb3VzZU91dDogKGQpID0+XG4gICAgQCRlbC50cmlnZ2VyICdtb3VzZW91dCdcbiAgICBAaGlkZUxhYmVsKClcblxuICBvbk1vdXNlTW92ZTogKGQpID0+XG4gICAgcG9zaXRpb24gPSBkMy5tb3VzZShkMy5ldmVudC50YXJnZXQpXG4gICAgeWVhciA9IE1hdGgucm91bmQgQHguaW52ZXJ0KHBvc2l0aW9uWzBdKVxuICAgIGlmIHllYXIgIT0gQGN1cnJlbnRZZWFyXG4gICAgICBAJGVsLnRyaWdnZXIgJ2NoYW5nZS15ZWFyJywgeWVhclxuICAgICAgQHNldExhYmVsIHllYXJcblxuICBzZXRMYWJlbDogKHllYXIpIC0+XG4gICAgQGN1cnJlbnRZZWFyID0geWVhclxuICAgIEBjb250YWluZXIuc2VsZWN0KCcueC5heGlzJylcbiAgICAgIC5zZWxlY3RBbGwoJy50aWNrJylcbiAgICAgIC5zdHlsZSAnZGlzcGxheScsICdub25lJ1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcubGluZS1sYWJlbC1wb2ludCcpXG4gICAgICAuZWFjaCAoZCkgPT4gQHNldExpbmVMYWJlbEhvdmVyUG9zaXRpb24gZFxuICAgIEBjb250YWluZXIuc2VsZWN0KCcudGljay1ob3ZlcicpXG4gICAgICAuc3R5bGUgJ2Rpc3BsYXknLCAnYmxvY2snXG4gICAgICAuYXR0ciAneCcsIE1hdGgucm91bmQgQHgoQGN1cnJlbnRZZWFyKVxuICAgICAgLnRleHQgQGN1cnJlbnRZZWFyXG5cbiAgaGlkZUxhYmVsOiAtPlxuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcubGluZS1sYWJlbC1wb2ludCcpXG4gICAgICAuc3R5bGUgJ2Rpc3BsYXknLCAnbm9uZSdcbiAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLmxpbmUtbGFiZWwtaG92ZXInKVxuICAgICAgLnN0eWxlICdkaXNwbGF5JywgJ25vbmUnXG4gICAgQGNvbnRhaW5lci5zZWxlY3QoJy54LmF4aXMnKVxuICAgICAgLnNlbGVjdEFsbCgnLnRpY2snKVxuICAgICAgLnN0eWxlICdkaXNwbGF5JywgJ2Jsb2NrJ1xuICAgIEBjb250YWluZXIuc2VsZWN0KCcudGljay1ob3ZlcicpXG4gICAgICAuc3R5bGUgJ2Rpc3BsYXknLCAnbm9uZSdcblxuICBzZXRMaW5lTGFiZWxIb3ZlclBvc2l0aW9uOiAoZGF0YSkgPT5cbiAgICAjIGdldCBjdXJyZW50IHllYXJcbiAgICB5ZWFyID0gQGN1cnJlbnRZZWFyXG4gICAgd2hpbGUgQHllYXJzLmluZGV4T2YoeWVhcikgPT0gLTEgJiYgQGN1cnJlbnRZZWFyID4gQHllYXJzWzBdXG4gICAgICB5ZWFyLS1cbiAgICBAY3VycmVudFllYXIgPSB5ZWFyXG4gICAgIyBnZXQgcG9pbnQgJiBsYWJlbFxuICAgIHBvaW50ID0gZDMuc2VsZWN0KCcjbGluZS1sYWJlbC1wb2ludC0nK2RhdGFbQG9wdGlvbnMua2V5LmlkXSlcbiAgICBsYWJlbCA9IEBjb250YWluZXIuc2VsZWN0QWxsKCcubGluZS1sYWJlbC1ob3ZlcicpXG4gICAgIyBoaWRlIHBvaW50ICYgbGFiZWwgaXMgdGhlcmUgaXMgbm8gZGF0YVxuICAgIHVubGVzcyBkYXRhLnZhbHVlc1t5ZWFyXVxuICAgICAgcG9pbnQuc3R5bGUgJ2Rpc3BsYXknLCAnbm9uZSdcbiAgICAgIGxhYmVsLnN0eWxlICdkaXNwbGF5JywgJ25vbmUnXG4gICAgICByZXR1cm5cbiAgICAjIHNob3cgcG9pbnQgJiBsYWJlbCBpZiB0aGVyZSdzIGRhdGFcbiAgICBwb2ludC5zdHlsZSAnZGlzcGxheScsICdibG9jaydcbiAgICBsYWJlbC5zdHlsZSAnZGlzcGxheScsICdibG9jaydcbiAgICAgIyBzZXQgbGluZSBsYWJlbCBwb2ludFxuICAgIHBvaW50XG4gICAgICAuYXR0ciAnY3gnLCAoZCkgPT4gQHggeWVhclxuICAgICAgLmF0dHIgJ2N5JywgKGQpID0+IGlmIGRhdGEudmFsdWVzW3llYXJdIHRoZW4gQHkoZGF0YS52YWx1ZXNbeWVhcl0pIGVsc2UgMFxuICAgICMgc2V0IGxpbmUgbGFiZWwgaG92ZXJcbiAgICBsYWJlbFxuICAgICAgLmF0dHIgJ3gnLCAoZCkgPT4gQHggeWVhclxuICAgICAgLmF0dHIgJ3knLCAoZCkgPT4gaWYgZGF0YS52YWx1ZXNbeWVhcl0gdGhlbiBAeShkYXRhLnZhbHVlc1t5ZWFyXSkgZWxzZSAwXG4gICAgICAudGV4dCAoZCkgPT4gaWYgZGF0YS52YWx1ZXNbeWVhcl0gdGhlbiBAeUZvcm1hdChkYXRhLnZhbHVlc1t5ZWFyXSkgZWxzZSAnJ1xuICAgICAgXG4gIHNldFRpY2tIb3ZlclBvc2l0aW9uOiAoZWxlbWVudCkgPT5cbiAgICBlbGVtZW50LmF0dHIgJ3knLCBNYXRoLnJvdW5kIEBoZWlnaHQrQG9wdGlvbnMubWFyZ2luLnRvcCs5IiwiY2xhc3Mgd2luZG93LkhlYXRtYXBHcmFwaCBleHRlbmRzIEJhc2VHcmFwaFxuXG4gICMgQ29uc3RydWN0b3JcbiAgIyAtLS0tLS0tLS0tLVxuXG4gIGNvbnN0cnVjdG9yOiAoaWQsIG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgaWQsIG9wdGlvbnNcbiAgICBAZm9ybWF0RmxvYXQgICA9IGQzLmZvcm1hdCgnLC4xZicpXG4gICAgQGZvcm1hdEludGVnZXIgPSBkMy5mb3JtYXQoJyxkJylcbiAgICByZXR1cm4gQFxuXG5cbiAgIyBNYWluIG1ldGhvZHNcbiAgIyAtLS0tLS0tLS0tLS1cblxuICBzZXRTVkc6IC0+XG4gICAgQHN2ZyAgICAgICA9IG51bGxcbiAgICBAY29udGFpbmVyID0gZDMuc2VsZWN0ICcjJytAaWQrJyAuaGVhdG1hcC1ncmFwaCdcbiAgICBpZiBAb3B0aW9ucy5sZWdlbmRcbiAgICAgIEBjb250YWluZXIuY2xhc3NlZCAnaGFzLWxlZ2VuZCcsIHRydWVcbiAgICBAJHRvb2x0aXAgID0gQCRlbC5maW5kICcudG9vbHRpcCdcblxuICBzZXREYXRhOiAoZGF0YSkgLT5cbiAgICAjIEdldCB5ZWFycyAoeCBzY2FsZSlcbiAgICBAeWVhcnMgPSBAZ2V0WWVhcnMoZGF0YSlcbiAgICAjIEdldCBjb3VudHJpZXMgKHkgc2NhbGUpXG4gICAgQGNvdW50cmllcyA9IGRhdGEubWFwIChkKSAtPiBkLmNvZGVcbiAgICAjIEdldCBhcnJheSBvZiBkYXRhIHZhbHVlc1xuICAgIEBjZWxsc0RhdGEgPSBAZ2V0Q2VsbHNEYXRhIGRhdGFcbiAgICBAZGF0YSA9IEBkYXRhUGFyc2VyKGRhdGEpXG4gICAgQGdldERpbWVuc2lvbnMoKSAjIGZvcmNlIHVwZGF0ZSBkaW1lbnNpb25zXG4gICAgQGRyYXdTY2FsZXMoKVxuICAgIEBkcmF3TWFya2VycygpXG4gICAgaWYgQG9wdGlvbnMubGVnZW5kXG4gICAgICBAZHJhd0xlZ2VuZCgpXG4gICAgQGRyYXdHcmFwaCgpXG4gICAgcmV0dXJuIEBcblxuICBnZXRZZWFyczogKGRhdGEpIC0+XG4gICAgbWluWWVhciA9IGQzLm1pbiBkYXRhLCAoZCkgLT4gZDMubWluKGQzLmtleXMoZC52YWx1ZXMpKVxuICAgIG1heFllYXIgPSBkMy5tYXggZGF0YSwgKGQpIC0+IGQzLm1heChkMy5rZXlzKGQudmFsdWVzKSlcbiAgICB5ZWFycyA9IGQzLnJhbmdlIG1pblllYXIsIG1heFllYXIsIDFcbiAgICB5ZWFycy5wdXNoICttYXhZZWFyXG4gICAgcmV0dXJuIHllYXJzXG5cbiAgZ2V0Q2VsbHNEYXRhOiAoZGF0YSkgLT5cbiAgICBjZWxsc0RhdGEgPSBbXVxuICAgIGRhdGEuZm9yRWFjaCAoZCkgLT5cbiAgICAgIGZvciB2YWx1ZSBvZiBkLnZhbHVlc1xuICAgICAgICBjZWxsc0RhdGEucHVzaFxuICAgICAgICAgIGNvdW50cnk6IGQuY29kZVxuICAgICAgICAgIG5hbWU6ICAgIGQubmFtZVxuICAgICAgICAgIHllYXI6ICAgIHZhbHVlXG4gICAgICAgICAgY2FzZXM6ICAgZC5jYXNlc1t2YWx1ZV1cbiAgICAgICAgICB2YWx1ZTogICBkLnZhbHVlc1t2YWx1ZV1cbiAgICByZXR1cm4gY2VsbHNEYXRhXG5cbiAgZGF0YVBhcnNlcjogKGRhdGEpIC0+XG4gICAgZGF0YS5mb3JFYWNoIChkKSA9PiBcbiAgICAgIGQudmFsdWVzID0ge31cbiAgICAgIEB5ZWFycy5mb3JFYWNoICh5ZWFyKSA9PlxuICAgICAgICBpZiBkW3llYXJdXG4gICAgICAgICAgZC52YWx1ZXNbeWVhcl0gPSArZFt5ZWFyXVxuICAgICAgICAjZWxzZVxuICAgICAgICAjICBjb25zb2xlLmxvZyAnTm8gaGF5IGRhdG9zIGRlIHBhcmEnLCBkLm5hbWUsICdlbiAnLCB5ZWFyXG4gICAgICAgIGRlbGV0ZSBkW3llYXJdXG4gICAgcmV0dXJuIGRhdGFcblxuICBzZXRTY2FsZXM6IC0+XG4gICAgIyBzZXQgeCBzY2FsZVxuICAgIEB4ID0gZDMuc2NhbGVCYW5kKClcbiAgICAgIC5wYWRkaW5nKDApXG4gICAgICAucGFkZGluZ0lubmVyKDApXG4gICAgICAucGFkZGluZ091dGVyKDApXG4gICAgICAucm91bmQodHJ1ZSlcbiAgICAgIC5yYW5nZSBAZ2V0U2NhbGVYUmFuZ2UoKVxuICAgICMgc2V0IHkgc2NhbGVcbiAgICBAeSA9IGQzLnNjYWxlQmFuZCgpXG4gICAgICAucGFkZGluZygwKVxuICAgICAgLnBhZGRpbmdJbm5lcigwKVxuICAgICAgLnBhZGRpbmdPdXRlcigwKVxuICAgICAgLnJvdW5kKHRydWUpXG4gICAgICAucmFuZ2UgQGdldFNjYWxlWVJhbmdlKClcbiAgICAjIHNldCBjb2xvciBzY2FsZVxuICAgIEBjb2xvciA9IGQzLnNjYWxlU2VxdWVudGlhbCBkMy5pbnRlcnBvbGF0ZU9yYW5nZXNcbiAgICByZXR1cm4gQFxuXG4gIGRyYXdTY2FsZXM6IC0+XG4gICAgc3VwZXIoKVxuICAgIEBjb2xvci5kb21haW4gQGdldENvbG9yRG9tYWluKClcbiAgICByZXR1cm4gQFxuXG4gIGdldFNjYWxlWFJhbmdlOiA9PlxuICAgIHJldHVybiBbMCwgQHdpZHRoXVxuXG4gIGdldFNjYWxlWVJhbmdlOiA9PlxuICAgIHJldHVybiBbMCwgQGhlaWdodF1cblxuICBnZXRTY2FsZVhEb21haW46ID0+XG4gICAgcmV0dXJuIEB5ZWFycyBcblxuICBnZXRTY2FsZVlEb21haW46ID0+XG4gICAgcmV0dXJuIEBjb3VudHJpZXNcblxuICBnZXRDb2xvckRvbWFpbjogPT5cbiAgICByZXR1cm4gWzAsIDQwMF1cblxuICBnZXREaW1lbnNpb25zOiAtPlxuICAgIEB3aWR0aCA9IEAkZWwud2lkdGgoKSAtIDcwICAjIHkgYXhpcyB3aWR0aCA9IDEwMFxuICAgIGlmIEB5ZWFycyBhbmQgQGNvdW50cmllc1xuICAgICAgY2VsbFNpemUgPSBNYXRoLmZsb29yIEB3aWR0aCAvIEB5ZWFycy5sZW5ndGhcbiAgICAgICMgc2V0IG1pbmltdW0gY2VsbCBkaW1lbnNpb25zXG4gICAgICBpZiBjZWxsU2l6ZSA8IDE1XG4gICAgICAgIGNlbGxTaXplID0gMTVcbiAgICAgICAgQHdpZHRoID0gKGNlbGxTaXplICogQHllYXJzLmxlbmd0aCkgKyA3MFxuICAgICAgQGhlaWdodCA9IGlmIGNlbGxTaXplIDwgMjAgdGhlbiBjZWxsU2l6ZSAqIEBjb3VudHJpZXMubGVuZ3RoIGVsc2UgMjAgKiBAY291bnRyaWVzLmxlbmd0aFxuICAgIHJldHVybiBAXG5cbiAgZHJhd0dyYXBoOiAtPlxuICAgICMgc2V0dXAgc2NhbGVzIHJhbmdlXG4gICAgQHgucmFuZ2UgQGdldFNjYWxlWFJhbmdlKClcbiAgICBAeS5yYW5nZSBAZ2V0U2NhbGVZUmFuZ2UoKVxuICAgICMgc2V0dXAgY29udGFpbmVyIGhlaWdodFxuICAgICNAY29udGFpbmVyLnN0eWxlICdoZWlnaHQnLCBAaGVpZ2h0KydweCdcbiAgICAjIGRyYXcgeWVhcnMgeCBheGlzXG4gICAgQGNvbnRhaW5lci5hcHBlbmQoJ2RpdicpXG4gICAgICAuYXR0ciAnY2xhc3MnLCAneC1heGlzIGF4aXMnXG4gICAgLnNlbGVjdEFsbCgnLmF4aXMtaXRlbScpXG4gICAgICAuZGF0YShAeWVhcnMuZmlsdGVyKChkKSAtPiBkICUgNSA9PSAwKSlcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2RpdicpXG4gICAgICAuYXR0ciAgJ2NsYXNzJywgJ2F4aXMtaXRlbSdcbiAgICAgIC5zdHlsZSAnbGVmdCcsIChkKSA9PiBAeChkKSsncHgnXG4gICAgICAuaHRtbCAgKGQpIC0+IGRcbiAgICAjIGRyYXcgY291bnRyaWVzIHkgYXhpc1xuICAgIEBjb250YWluZXIuYXBwZW5kKCdkaXYnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ3ktYXhpcyBheGlzJylcbiAgICAuc2VsZWN0QWxsKCcuYXhpcy1pdGVtJylcbiAgICAgIC5kYXRhKEBjb3VudHJpZXMpXG4gICAgLmVudGVyKCkuYXBwZW5kKCdkaXYnKVxuICAgICAgLmF0dHIgICdjbGFzcycsICdheGlzLWl0ZW0nXG4gICAgICAuc3R5bGUgJ3RvcCcsIChkKSA9PiBAeShkKSsncHgnXG4gICAgICAuaHRtbCAoZCkgPT4gQGdldENvdW50cnlOYW1lIGRcbiAgICAjIGRyYXcgY2VsbHNcbiAgICBAY29udGFpbmVyLmFwcGVuZCgnZGl2JylcbiAgICAgIC5hdHRyICAnY2xhc3MnLCAnY2VsbC1jb250YWluZXInXG4gICAgICAuc3R5bGUgJ2hlaWdodCcsIEBoZWlnaHQrJ3B4J1xuICAgIC5zZWxlY3RBbGwoJy5jZWxsJylcbiAgICAgIC5kYXRhKEBjZWxsc0RhdGEpXG4gICAgLmVudGVyKCkuYXBwZW5kKCdkaXYnKVxuICAgICAgLmF0dHIgICdjbGFzcycsICdjZWxsJ1xuICAgICAgLnN0eWxlICdiYWNrZ3JvdW5kJywgKGQpID0+IEBjb2xvcihkLnZhbHVlKVxuICAgICAgLm9uICAgICdtb3VzZW92ZXInLCBAb25Nb3VzZU92ZXJcbiAgICAgIC5vbiAgICAnbW91c2VvdXQnLCBAb25Nb3VzZU91dFxuICAgICAgLmNhbGwgIEBzZXRDZWxsRGltZW5zaW9uc1xuICAgICMgZHJhdyB5ZWFyIGludHJvZHVjdGlvbiBtYXJrXG4gICAgQGNvbnRhaW5lci5zZWxlY3QoJy5jZWxsLWNvbnRhaW5lcicpXG4gICAgICAuc2VsZWN0QWxsKCcubWFya2VyJylcbiAgICAgIC5kYXRhIEBkYXRhLm1hcCgoZCkgLT4ge2NvZGU6IGQuY29kZSwgeWVhcjogZC55ZWFyX2ludHJvZHVjdGlvbn0pLmZpbHRlcigoZCkgLT4gIWlzTmFOIGQueWVhcilcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2RpdicpXG4gICAgICAuYXR0ciAnY2xhc3MnLCAnbWFya2VyJ1xuICAgICAgLmNhbGwgQHNldE1hcmtlckRpbWVuc2lvbnNcblxuICB1cGRhdGVHcmFwaERpbWVuc2lvbnM6IC0+XG4gICAgIyB1cGRhdGUgc2NhbGVzXG4gICAgQHgucmFuZ2UgQGdldFNjYWxlWFJhbmdlKClcbiAgICBAeS5yYW5nZSBAZ2V0U2NhbGVZUmFuZ2UoKVxuICAgICMgdXBkYXRlIGNvbnRhaW5lcnNcbiAgICBAY29udGFpbmVyXG4gICAgICAuc3R5bGUgJ2hlaWdodCcsIEBoZWlnaHQgKyAncHgnXG4gICAgQGNvbnRhaW5lci5zZWxlY3QoJy5jZWxsLWNvbnRhaW5lcicpXG4gICAgICAuc3R5bGUgJ2hlaWdodCcsIEBoZWlnaHQrJ3B4J1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuY2VsbCcpXG4gICAgICAuY2FsbCBAc2V0Q2VsbERpbWVuc2lvbnNcbiAgICBAY29udGFpbmVyLnNlbGVjdCgnLngtYXhpcycpLnNlbGVjdEFsbCgnLmF4aXMtaXRlbScpXG4gICAgICAuc3R5bGUgJ2xlZnQnLCAoZCkgPT4gQHgoZCkrJ3B4J1xuICAgIEBjb250YWluZXIuc2VsZWN0KCcueS1heGlzJykuc2VsZWN0QWxsKCcuYXhpcy1pdGVtJylcbiAgICAgIC5zdHlsZSAndG9wJywgKGQpID0+IEB5KGQpKydweCdcbiAgICBAY29udGFpbmVyLnNlbGVjdCgnLmNlbGwtY29udGFpbmVyJykuc2VsZWN0QWxsKCcubWFya2VyJylcbiAgICAgIC5jYWxsIEBzZXRNYXJrZXJEaW1lbnNpb25zXG4gICAgcmV0dXJuIEBcblxuICBzZXRDZWxsRGltZW5zaW9uczogKHNlbGVjdGlvbikgPT5cbiAgICBzZWxlY3Rpb25cbiAgICAgIC5zdHlsZSAnbGVmdCcsICAgKGQpID0+IEB4KGQueWVhcikrJ3B4J1xuICAgICAgLnN0eWxlICd0b3AnLCAgICAoZCkgPT4gQHkoZC5jb3VudHJ5KSsncHgnXG4gICAgICAuc3R5bGUgJ3dpZHRoJywgIEB4LmJhbmR3aWR0aCgpKydweCdcbiAgICAgIC5zdHlsZSAnaGVpZ2h0JywgQHkuYmFuZHdpZHRoKCkrJ3B4J1xuXG4gIHNldE1hcmtlckRpbWVuc2lvbnM6IChzZWxlY3Rpb24pID0+XG4gICAgc2VsZWN0aW9uXG4gICAgICAuc3R5bGUgJ3RvcCcsICAgIChkKSA9PiAoQHkoZC5jb2RlKS0xKSsncHgnXG4gICAgICAuc3R5bGUgJ2xlZnQnLCAgIChkKSA9PiBpZiBkLnllYXIgPCBAeWVhcnNbMF0gdGhlbiBAeChAeWVhcnNbMF0pLTEgKyAncHgnIGVsc2UgaWYgZC55ZWFyIDwgQHllYXJzW0B5ZWFycy5sZW5ndGgtMV0gdGhlbiBAeChkLnllYXIpLTErJ3B4JyBlbHNlIEB4LmJhbmR3aWR0aCgpK0B4KEB5ZWFyc1tAeWVhcnMubGVuZ3RoLTFdKSsncHgnXG4gICAgICAuc3R5bGUgJ2hlaWdodCcsIChAeS5iYW5kd2lkdGgoKSsxKSsncHgnXG5cbiAgb25Nb3VzZU92ZXI6IChkKSA9PlxuICAgICMgU2V0IHRvb2x0aXAgY29udGVudFxuICAgIG9mZnNldCAgICAgICAgICAgPSAkKGQzLmV2ZW50LnRhcmdldCkub2Zmc2V0KClcblxuICAgIEAkdG9vbHRpcFxuICAgICAgLmZpbmQgJy50b29sdGlwLWlubmVyIC5jb3VudHJ5J1xuICAgICAgLmh0bWwgZC5uYW1lXG4gICAgQCR0b29sdGlwXG4gICAgICAuZmluZCAnLnRvb2x0aXAtaW5uZXIgLnllYXInXG4gICAgICAuaHRtbCBkLnllYXJcbiAgICBAJHRvb2x0aXBcbiAgICAgIC5maW5kICcudG9vbHRpcC1pbm5lciAudmFsdWUnXG4gICAgICAuaHRtbCBpZiBkLnZhbHVlID09IDAgdGhlbiAwIGVsc2UgQGZvcm1hdEZsb2F0KGQudmFsdWUpXG4gICAgQCR0b29sdGlwXG4gICAgICAuZmluZCAnLnRvb2x0aXAtaW5uZXIgLmNhc2VzJ1xuICAgICAgLmh0bWwgQGZvcm1hdEludGVnZXIoZC5jYXNlcylcbiAgICAjIFNldCB0b29sdGlwIHBvc2l0aW9uXG4gICAgQCR0b29sdGlwLmNzc1xuICAgICAgJ2xlZnQnOiAgICBvZmZzZXQubGVmdCArIEB4LmJhbmR3aWR0aCgpICogMC41IC0gKEAkdG9vbHRpcC53aWR0aCgpICogMC41KVxuICAgICAgJ3RvcCc6ICAgICBvZmZzZXQudG9wIC0gKEB5LmJhbmR3aWR0aCgpICogMC41KSAtIEAkdG9vbHRpcC5oZWlnaHQoKVxuICAgICAgJ29wYWNpdHknOiAnMSdcbiAgICByZXR1cm5cblxuICBvbk1vdXNlT3V0OiAoZCkgPT5cbiAgICBAJHRvb2x0aXAuY3NzICdvcGFjaXR5JywgJzAnXG4gICAgcmV0dXJuXG5cbiAgZ2V0Q291bnRyeU5hbWU6IChjb2RlKSA9PlxuICAgIGNvdW50cnkgPSBAZGF0YS5maWx0ZXIgKGQpIC0+IGQuY29kZSA9PSBjb2RlXG4gICAgcmV0dXJuIGlmIGNvdW50cnlbMF0gdGhlbiBjb3VudHJ5WzBdLm5hbWUgZWxzZSAnJ1xuXG4gIGRyYXdMZWdlbmQ6IC0+XG4gICAgbGVnZW5kRGF0YSA9IFswLDEwMCwyMDAsMzAwLDQwMF1cbiAgICBAbGVnZW5kID0gQGNvbnRhaW5lci5hcHBlbmQoJ3VsJylcbiAgICAgIC5hdHRyICdjbGFzcycsICdsZWdlbmQnXG4gICAgICAuc3R5bGUgJ21hcmdpbi1sZWZ0JywgLSgxNSpsZWdlbmREYXRhLmxlbmd0aCkrJ3B4J1xuICAgICMgZHJhdyBsZWdlbmQgcmVjdHNcbiAgICBAbGVnZW5kLnNlbGVjdEFsbCgnbGknKVxuICAgICAgLmRhdGEgbGVnZW5kRGF0YVxuICAgICAgLmVudGVyKCkuYXBwZW5kKCdsaScpXG4gICAgICAgIC5zdHlsZSAnYmFja2dyb3VuZCcsIChkKSA9PiBAY29sb3IgZFxuICAgICAgICAuaHRtbCAoZCxpKSAtPiBpZiBpICE9IDAgdGhlbiBkIGVsc2UgJyZuYnNwJ1xuXG4gICAgIyMjXG4gICAgbGVnZW5kRGF0YS5zaGlmdCgpXG4gICAgIyBkcmF3IGxlZ2VuZCB0ZXh0c1xuICAgIEBsZWdlbmQuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgIC5kYXRhIGxlZ2VuZERhdGFcbiAgICAgIC5lbnRlcigpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyICd4JywgKGQsaSkgLT4gTWF0aC5yb3VuZCBsZWdlbkl0ZW1XaWR0aCooaS0wLjUtKGxlZ2VuZERhdGEubGVuZ3RoLzIpKVxuICAgICAgICAuYXR0ciAneScsIDIwXG4gICAgICAgIC5hdHRyICd0ZXh0LWFuY2hvcicsICdzdGFydCdcbiAgICAgICAgLnRleHQgKGQpIC0+IGRcbiAgICAjIyNcblxuIyBWYWNjaW5lRGlzZWFzZUdyYXBoID0gKF9pZCkgLT5cbiMgICAkID0galF1ZXJ5Lm5vQ29uZmxpY3QoKVxuIyAgIFlfQVhJU19XSURUSCA9IDEwMFxuIyAgICMgTXVzdCBiZSB0aGUgYW1lIHZhbHVlIHRoYW4gI3ZhY2NpbmUtZGlzZWFzZS1ncmFwaCAkcGFkZGluZy1sZWZ0IHNjc3MgdmFyaWFibGVcbiMgICB0aGF0ID0gdGhpc1xuIyAgIGlkID0gX2lkXG4jICAgZGlzZWFzZSA9IHVuZGVmaW5lZFxuIyAgIHNvcnQgPSB1bmRlZmluZWRcbiMgICBsYW5nID0gdW5kZWZpbmVkXG4jICAgZGF0YSA9IHVuZGVmaW5lZFxuIyAgIGRhdGFQb3B1bGF0aW9uID0gdW5kZWZpbmVkXG4jICAgY3VycmVudERhdGEgPSB1bmRlZmluZWRcbiMgICBjZWxsRGF0YSA9IHVuZGVmaW5lZFxuIyAgIGNvdW50cmllcyA9IHVuZGVmaW5lZFxuIyAgIHllYXJzID0gdW5kZWZpbmVkXG4jICAgY2VsbFNpemUgPSB1bmRlZmluZWRcbiMgICBjb250YWluZXIgPSB1bmRlZmluZWRcbiMgICB4ID0gdW5kZWZpbmVkXG4jICAgeSA9IHVuZGVmaW5lZFxuIyAgIHdpZHRoID0gdW5kZWZpbmVkXG4jICAgaGVpZ2h0ID0gdW5kZWZpbmVkXG4jICAgJGVsID0gdW5kZWZpbmVkXG4jICAgJHRvb2x0aXAgPSB1bmRlZmluZWRcbiMgICAjIFB1YmxpYyBNZXRob2RzXG5cbiMgICB0aGF0LmluaXQgPSAoX2Rpc2Vhc2UsIF9zb3J0KSAtPlxuIyAgICAgZGlzZWFzZSA9IF9kaXNlYXNlXG4jICAgICBzb3J0ID0gX3NvcnRcbiMgICAgICNjb25zb2xlLmxvZygnVmFjY2luZSBHcmFwaCBpbml0JywgaWQsIGRpc2Vhc2UsIHNvcnQpO1xuIyAgICAgJGVsID0gJCgnIycgKyBpZClcbiMgICAgICR0b29sdGlwID0gJGVsLmZpbmQoJy50b29sdGlwJylcbiMgICAgIGxhbmcgPSAkZWwuZGF0YSgnbGFuZycpXG4jICAgICB4ID0gZDMuc2NhbGVCYW5kKCkucGFkZGluZygwKS5wYWRkaW5nSW5uZXIoMCkucGFkZGluZ091dGVyKDApLnJvdW5kKHRydWUpXG4jICAgICB5ID0gZDMuc2NhbGVCYW5kKCkucGFkZGluZygwKS5wYWRkaW5nSW5uZXIoMCkucGFkZGluZ091dGVyKDApLnJvdW5kKHRydWUpXG4jICAgICBjb2xvciA9IGQzLnNjYWxlU2VxdWVudGlhbChkMy5pbnRlcnBvbGF0ZU9yUmQpXG4jICAgICBpZiBkYXRhXG4jICAgICAgIGNsZWFyKClcbiMgICAgICAgc2V0dXBEYXRhKClcbiMgICAgICAgc2V0dXBHcmFwaCgpXG4jICAgICBlbHNlXG4jICAgICAgICMgTG9hZCBDU1ZzXG4jICAgICAgIGQzLnF1ZXVlKCkuZGVmZXIoZDMuY3N2LCAkKCdib2R5JykuZGF0YSgnYmFzZXVybCcpICsgJy9kYXRhL2Rpc2Vhc2VzLWNhc2VzLmNzdicpLmRlZmVyKGQzLmNzdiwgJCgnYm9keScpLmRhdGEoJ2Jhc2V1cmwnKSArICcvZGF0YS9wb3B1bGF0aW9uLmNzdicpLmF3YWl0IG9uRGF0YVJlYWR5XG4jICAgICB0aGF0XG5cbiMgICB0aGF0Lm9uUmVzaXplID0gLT5cbiMgICAgIGdldERpbWVuc2lvbnMoKVxuIyAgICAgaWYgZGF0YVxuIyAgICAgICB1cGRhdGVHcmFwaCgpXG4jICAgICB0aGF0XG5cbiMgICBvbkRhdGFSZWFkeSA9IChlcnJvciwgZGF0YV9jc3YsIHBvcHVsYXRpb25fY3N2KSAtPlxuIyAgICAgZGF0YSA9IGRhdGFfY3N2XG4jICAgICBkYXRhUG9wdWxhdGlvbiA9IHBvcHVsYXRpb25fY3N2XG4jICAgICAjIHdlIGRvbid0IG5lZWQgdGhlIGNvbHVtbnMgYXR0cmlidXRlXG4jICAgICBkZWxldGUgZGF0YS5jb2x1bW5zXG4jICAgICAjIFdlIGNhbiBkZWZpbmUgYSBmaWx0ZXIgZnVuY3Rpb24gdG8gc2hvdyBvbmx5IHNvbWUgc2VsZWN0ZWQgY291bnRyaWVzXG4jICAgICBpZiB0aGF0LmZpbHRlclxuIyAgICAgICBkYXRhID0gZGF0YS5maWx0ZXIodGhhdC5maWx0ZXIpXG4jICAgICBkYXRhLmZvckVhY2ggKGQpIC0+XG4jICAgICAgIGQuZGlzZWFzZSA9IGQuZGlzZWFzZS50b0xvd2VyQ2FzZSgpXG4jICAgICAgIGlmIGQueWVhcl9pbnRyb2R1Y3Rpb25cbiMgICAgICAgICBkLnllYXJfaW50cm9kdWN0aW9uID0gK2QueWVhcl9pbnRyb2R1Y3Rpb24ucmVwbGFjZSgncHJpb3IgdG8nLCAnJylcbiMgICAgICAgZC5jYXNlcyA9IHt9XG4jICAgICAgIGQudmFsdWVzID0ge31cbiMgICAgICAgIyBzZXQgdmFsdWUgZXMgY2FzZXMgLzEwMDAgaW5oYWJpdGFudHNcbiMgICAgICAgcG9wdWxhdGlvbkl0ZW0gPSBwb3B1bGF0aW9uX2Nzdi5maWx0ZXIoKGNvdW50cnkpIC0+XG4jICAgICAgICAgY291bnRyeS5jb2RlID09IGQuY29kZVxuIyAgICAgICApXG4jICAgICAgIGlmIHBvcHVsYXRpb25JdGVtLmxlbmd0aCA+IDBcbiMgICAgICAgICB5ZWFyID0gMTk4MFxuIyAgICAgICAgIHdoaWxlIHllYXIgPCAyMDE2XG4jICAgICAgICAgICBpZiBkW3llYXJdXG4jICAgICAgICAgICAgIHBvcHVsYXRpb24gPSArcG9wdWxhdGlvbkl0ZW1bMF1beWVhcl1cbiMgICAgICAgICAgICAgaWYgcG9wdWxhdGlvbiAhPSAwXG4jICAgICAgICAgICAgICAgI2RbeWVhcl0gPSAxMDAwICogKCtkW3llYXJdIC8gcG9wdWxhdGlvbik7XG4jICAgICAgICAgICAgICAgZC5jYXNlc1t5ZWFyXSA9ICtkW3llYXJdXG4jICAgICAgICAgICAgICAgZC52YWx1ZXNbeWVhcl0gPSAxMDAwICogK2RbeWVhcl0gLyBwb3B1bGF0aW9uXG4jICAgICAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICAgICAjZFt5ZWFyXSA9IG51bGw7XG4jICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nKCdObyBoYXkgZGF0b3MgZGUgcG9ibGFjacOzbiBwYXJhJywgZC5uYW1lLCAnZW4gJywgeWVhciwgZFt5ZWFyXSk7XG4jICAgICAgICAgICBlbHNlXG4jICAgICAgICAgICAgICNkW3llYXJdID0gbnVsbDtcbiMgICAgICAgICAgICAgI2NvbnNvbGUubG9nKCdObyBoYXkgZGF0b3MgZGUgY2Fzb3MgZGUgJyArIGQuZGlzZWFzZSArICcgcGFyYScsIGQubmFtZSwgJ2VuICcsIHllYXIsICc6JywgZFt5ZWFyXSwgdHlwZW9mIGRbeWVhcl0pO1xuIyAgICAgICAgICAgZGVsZXRlIGRbeWVhcl1cbiMgICAgICAgICAgIHllYXIrK1xuIyAgICAgICBlbHNlXG4jICAgICAgICAgY29uc29sZS5sb2cgJ05vIGhheSBkYXRvcyBkZSBwb2JsYWNpw7NuIHBhcmEnLCBkLm5hbWVcbiMgICAgICAgIyBHZXQgdG90YWwgY2FzZXMgYnkgY291bnRyeSAmIGRpc2Vhc2VcbiMgICAgICAgZC50b3RhbCA9IGQzLnZhbHVlcyhkLnZhbHVlcykucmVkdWNlKCgoYSwgYikgLT5cbiMgICAgICAgICBhICsgYlxuIyAgICAgICApLCAwKVxuIyAgICAgICByZXR1cm5cbiMgICAgIHNldHVwRGF0YSgpXG4jICAgICBzZXR1cEdyYXBoKClcbiMgICAgIHJldHVyblxuXG4jICAgc2V0dXBEYXRhID0gLT5cbiMgICAgICMgRmlsdGVyIGRhdGEgYmFzZWQgb24gc2VsZWN0ZWQgZGlzZWFzZVxuIyAgICAgY3VycmVudERhdGEgPSBkYXRhLmZpbHRlcigoZCkgLT5cbiMgICAgICAgZC5kaXNlYXNlID09IGRpc2Vhc2UgYW5kIGQzLnZhbHVlcyhkLnZhbHVlcykubGVuZ3RoID4gMFxuIyAgICAgKVxuIyAgICAgIyBTb3J0IGRhdGFcbiMgICAgIGlmIHNvcnQgPT0gJ3llYXInXG4jICAgICAgIGN1cnJlbnREYXRhLnNvcnQgKGEsIGIpIC0+XG4jICAgICAgICAgaWYgaXNOYU4oYS55ZWFyX2ludHJvZHVjdGlvbikgdGhlbiAxIGVsc2UgaWYgaXNOYU4oYi55ZWFyX2ludHJvZHVjdGlvbikgdGhlbiAtMSBlbHNlIGIueWVhcl9pbnRyb2R1Y3Rpb24gLSAoYS55ZWFyX2ludHJvZHVjdGlvbilcbiMgICAgIGVsc2UgaWYgc29ydCA9PSAnY2FzZXMnXG4jICAgICAgIGN1cnJlbnREYXRhLnNvcnQgKGEsIGIpIC0+XG4jICAgICAgICAgYi50b3RhbCAtIChhLnRvdGFsKVxuIyAgICAgIyBHZXQgYXJyYXkgb2YgY291bnRyeSBuYW1lc1xuIyAgICAgY291bnRyaWVzID0gY3VycmVudERhdGEubWFwKChkKSAtPlxuIyAgICAgICBkLmNvZGVcbiMgICAgIClcbiMgICAgICMgR2V0IGFycmF5IG9mIHllYXJzXG4jICAgICBtaW5ZZWFyID0gZDMubWluKGN1cnJlbnREYXRhLCAoZCkgLT5cbiMgICAgICAgZDMubWluIGQzLmtleXMoZC52YWx1ZXMpXG4jICAgICApXG4jICAgICBtYXhZZWFyID0gZDMubWF4KGN1cnJlbnREYXRhLCAoZCkgLT5cbiMgICAgICAgZDMubWF4IGQzLmtleXMoZC52YWx1ZXMpXG4jICAgICApXG4jICAgICB5ZWFycyA9IGQzLnJhbmdlKG1pblllYXIsIG1heFllYXIsIDEpXG4jICAgICB5ZWFycy5wdXNoICttYXhZZWFyXG4jICAgICAjY29uc29sZS5sb2cobWluWWVhciwgbWF4WWVhciwgeWVhcnMpO1xuIyAgICAgI2NvbnNvbGUubG9nKGNvdW50cmllcyk7XG4jICAgICAjIEdldCBhcnJheSBvZiBkYXRhIHZhbHVlc1xuIyAgICAgY2VsbHNEYXRhID0gW11cbiMgICAgIGN1cnJlbnREYXRhLmZvckVhY2ggKGQpIC0+XG4jICAgICAgIGZvciB2YWx1ZSBvZiBkLnZhbHVlc1xuIyAgICAgICAgIGNlbGxzRGF0YS5wdXNoXG4jICAgICAgICAgICBjb3VudHJ5OiBkLmNvZGVcbiMgICAgICAgICAgIG5hbWU6IGQubmFtZVxuIyAgICAgICAgICAgeWVhcjogdmFsdWVcbiMgICAgICAgICAgIGNhc2VzOiBkLmNhc2VzW3ZhbHVlXVxuIyAgICAgICAgICAgdmFsdWU6IGQudmFsdWVzW3ZhbHVlXVxuIyAgICAgICByZXR1cm5cblxuIyAgICAgIyMjXG4jICAgICBjdXJyZW50RGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xuIyAgICAgICB2YXIgY291bnRlciA9IDA7XG4jICAgICAgIHllYXJzLmZvckVhY2goZnVuY3Rpb24oeWVhcil7XG4jICAgICAgICAgaWYgKGRbeWVhcl0pXG4jICAgICAgICAgICBjb3VudGVyKys7XG4jICAgICAgIH0pO1xuIyAgICAgICBpZihjb3VudGVyIDw9IDIwKSAvLyB5ZWFycy5sZW5ndGgvMilcbiMgICAgICAgICBjb25zb2xlLmxvZyhkLm5hbWUgKyAnIGhhcyBvbmx5IHZhbHVlcyBmb3IgJyArIGNvdW50ZXIgKyAnIHllYXJzJyk7XG4jICAgICB9KTtcbiMgICAgICMjI1xuXG4jICAgICByZXR1cm5cblxuIyAgIHNldHVwR3JhcGggPSAtPlxuIyAgICAgIyBHZXQgZGltZW5zaW9ucyAoaGVpZ2h0IGlzIGJhc2VkIG9uIGNvdW50cmllcyBsZW5ndGgpXG4jICAgICBnZXREaW1lbnNpb25zKClcbiMgICAgIHguZG9tYWluKHllYXJzKS5yYW5nZSBbXG4jICAgICAgIDBcbiMgICAgICAgd2lkdGhcbiMgICAgIF1cbiMgICAgIHkuZG9tYWluKGNvdW50cmllcykucmFuZ2UgW1xuIyAgICAgICAwXG4jICAgICAgIGhlaWdodFxuIyAgICAgXVxuIyAgICAgI2NvbG9yLmRvbWFpbihbZDMubWF4KGNlbGxzRGF0YSwgZnVuY3Rpb24oZCl7IHJldHVybiBkLnZhbHVlOyB9KSwgMF0pO1xuIyAgICAgY29sb3IuZG9tYWluIFtcbiMgICAgICAgMFxuIyAgICAgICA0XG4jICAgICBdXG4jICAgICAjY29uc29sZS5sb2coJ01heGltdW0gY2FzZXMgdmFsdWU6ICcrIGQzLm1heChjZWxsc0RhdGEsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC52YWx1ZTsgfSkpO1xuIyAgICAgIyBBZGQgc3ZnXG4jICAgICBjb250YWluZXIgPSBkMy5zZWxlY3QoJyMnICsgaWQgKyAnIC5ncmFwaC1jb250YWluZXInKS5zdHlsZSgnaGVpZ2h0JywgaGVpZ2h0ICsgJ3B4JylcbiMgICAgICMgRHJhdyBjZWxsc1xuIyAgICAgY29udGFpbmVyLmFwcGVuZCgnZGl2JykuYXR0cignY2xhc3MnLCAnY2VsbC1jb250YWluZXInKS5zdHlsZSgnaGVpZ2h0JywgaGVpZ2h0ICsgJ3B4Jykuc2VsZWN0QWxsKCcuY2VsbCcpLmRhdGEoY2VsbHNEYXRhKS5lbnRlcigpLmFwcGVuZCgnZGl2JykuYXR0cignY2xhc3MnLCAnY2VsbCcpLnN0eWxlKCdiYWNrZ3JvdW5kJywgKGQpIC0+XG4jICAgICAgIGNvbG9yIGQudmFsdWVcbiMgICAgICkuY2FsbChzZXRDZWxsRGltZW5zaW9ucykub24oJ21vdXNlb3ZlcicsIG9uTW91c2VPdmVyKS5vbiAnbW91c2VvdXQnLCBvbk1vdXNlT3V0XG4jICAgICAjIERyYXcgeWVhcnMgeCBheGlzXG4jICAgICBjb250YWluZXIuYXBwZW5kKCdkaXYnKS5hdHRyKCdjbGFzcycsICd4LWF4aXMgYXhpcycpLnNlbGVjdEFsbCgnLmF4aXMtaXRlbScpLmRhdGEoeWVhcnMuZmlsdGVyKChkKSAtPlxuIyAgICAgICBkICUgNSA9PSAwXG4jICAgICApKS5lbnRlcigpLmFwcGVuZCgnZGl2JykuYXR0cignY2xhc3MnLCAnYXhpcy1pdGVtJykuc3R5bGUoJ2xlZnQnLCAoZCkgLT5cbiMgICAgICAgeChkKSArICdweCdcbiMgICAgICkuaHRtbCAoZCkgLT5cbiMgICAgICAgZFxuIyAgICAgIyBEcmF3IGNvdW50cmllcyB5IGF4aXNcbiMgICAgIGNvbnRhaW5lci5hcHBlbmQoJ2RpdicpLmF0dHIoJ2NsYXNzJywgJ3ktYXhpcyBheGlzJykuc2VsZWN0QWxsKCcuYXhpcy1pdGVtJykuZGF0YShjb3VudHJpZXMpLmVudGVyKCkuYXBwZW5kKCdkaXYnKS5hdHRyKCdjbGFzcycsICdheGlzLWl0ZW0nKS5zdHlsZSgndG9wJywgKGQpIC0+XG4jICAgICAgIHkoZCkgKyAncHgnXG4jICAgICApLmh0bWwgKGQpIC0+XG4jICAgICAgIGdldENvdW50cnlOYW1lIGRcbiMgICAgICMgRHJhdyB5ZWFyIGludHJvZHVjdGlvbiBtYXJrXG4jICAgICBjb250YWluZXIuc2VsZWN0KCcuY2VsbC1jb250YWluZXInKS5zZWxlY3RBbGwoJy5tYXJrZXInKS5kYXRhKGN1cnJlbnREYXRhLm1hcCgoZCkgLT5cbiMgICAgICAge1xuIyAgICAgICAgIGNvZGU6IGQuY29kZVxuIyAgICAgICAgIHllYXI6IGQueWVhcl9pbnRyb2R1Y3Rpb25cbiMgICAgICAgfVxuIyAgICAgKS5maWx0ZXIoKGQpIC0+XG4jICAgICAgICFpc05hTihkLnllYXIpXG4jICAgICApKS5lbnRlcigpLmFwcGVuZCgnZGl2JykuYXR0cignY2xhc3MnLCAnbWFya2VyJykuY2FsbCBzZXRNYXJrZXJEaW1lbnNpb25zXG4jICAgICByZXR1cm5cblxuIyAgIGNsZWFyID0gLT5cbiMgICAgIGNvbnRhaW5lci5zZWxlY3QoJy5jZWxsLWNvbnRhaW5lcicpLnJlbW92ZSgpXG4jICAgICBjb250YWluZXIuc2VsZWN0QWxsKCcuYXhpcycpLnJlbW92ZSgpXG4jICAgICByZXR1cm5cblxuXG5cbiIsImNsYXNzIHdpbmRvdy5NYXBHcmFwaCBleHRlbmRzIHdpbmRvdy5CYXNlR3JhcGhcblxuXG4gICMgQ29uc3RydWN0b3JcbiAgIyAtLS0tLS0tLS0tLVxuXG4gIGNvbnN0cnVjdG9yOiAoaWQsIG9wdGlvbnMpIC0+XG4gICAgI2NvbnNvbGUubG9nICdNYXAgR3JhcGgnLCBpZCwgb3B0aW9uc1xuICAgIHN1cGVyIGlkLCBvcHRpb25zXG4gICAgQGZvcm1hdEZsb2F0ICAgPSBkMy5mb3JtYXQoJywuMWYnKVxuICAgIEBmb3JtYXRJbnRlZ2VyID0gZDMuZm9ybWF0KCcsZCcpXG4gICAgcmV0dXJuIEBcblxuXG4gICMgTWFpbiBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tXG5cbiAgc2V0U1ZHOiAtPlxuICAgIHN1cGVyKClcbiAgICBAJHRvb2x0aXAgPSBAJGVsLmZpbmQgJy50b29sdGlwJ1xuXG4gIHNldFNjYWxlczogLT5cbiAgICAjIHNldCBjb2xvciBzY2FsZVxuICAgIEBjb2xvciA9IGQzLnNjYWxlU2VxdWVudGlhbCBkMy5pbnRlcnBvbGF0ZU9yYW5nZXNcbiAgICByZXR1cm4gQFxuXG4gIGxvYWREYXRhOiAodXJsX2RhdGEsIHVybF9tYXApIC0+XG4gICAgZDMucXVldWUoKVxuICAgICAgLmRlZmVyIGQzLmNzdiwgdXJsX2RhdGFcbiAgICAgIC5kZWZlciBkMy5qc29uLCB1cmxfbWFwXG4gICAgICAuYXdhaXQgKGVycm9yLCBkYXRhLCBtYXApICA9PlxuICAgICAgICBAJGVsLnRyaWdnZXIgJ2RhdGEtbG9hZGVkJ1xuICAgICAgICBAc2V0RGF0YSBkYXRhLCBtYXBcbiAgICByZXR1cm4gQFxuXG4gIHNldERhdGE6IChkYXRhLCBtYXApIC0+XG4gICAgQGRhdGEgPSBAZGF0YVBhcnNlcihkYXRhKVxuICAgIEBjb2xvci5kb21haW4gWzAsIGQzLm1heChAZGF0YSwgKGQpIC0+IGQudmFsdWUpXVxuICAgIGlmIEBvcHRpb25zLmxlZ2VuZFxuICAgICAgQGRyYXdMZWdlbmQoKVxuICAgIEBkcmF3R3JhcGggbWFwXG4gICAgcmV0dXJuIEBcblxuICBkcmF3TGVnZW5kOiAtPlxuICAgIGxlZ2VuSXRlbVdpZHRoID0gMzBcbiAgICBsZWdlbmREYXRhID0gQGdldExlZ2VuZERhdGEoKVxuICAgIEBsZWdlbmQgPSBAY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAuYXR0ciAnY2xhc3MnLCAnbGVnZW5kJ1xuICAgICAgLmNhbGwgQHNldExlZ2VuZFBvc2l0aW9uXG4gICAgIyBkcmF3IGxlZ2VuZCByZWN0c1xuICAgIEBsZWdlbmQuc2VsZWN0QWxsKCdyZWN0JylcbiAgICAgIC5kYXRhIGxlZ2VuZERhdGFcbiAgICAgIC5lbnRlcigpLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5hdHRyICd4JywgKGQsaSkgLT4gTWF0aC5yb3VuZCBsZWdlbkl0ZW1XaWR0aCooaS0obGVnZW5kRGF0YS5sZW5ndGgvMikpXG4gICAgICAgIC5hdHRyICd3aWR0aCcsIGxlZ2VuSXRlbVdpZHRoXG4gICAgICAgIC5hdHRyICdoZWlnaHQnLCA4XG4gICAgICAgIC5hdHRyICdmaWxsJywgKGQpID0+IEBjb2xvciBkXG4gICAgbGVnZW5kRGF0YS5zaGlmdCgpXG4gICAgIyBkcmF3IGxlZ2VuZCB0ZXh0c1xuICAgIEBsZWdlbmQuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgIC5kYXRhIGxlZ2VuZERhdGFcbiAgICAgIC5lbnRlcigpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyICd4JywgKGQsaSkgLT4gTWF0aC5yb3VuZCBsZWdlbkl0ZW1XaWR0aCooaSswLjUtKGxlZ2VuZERhdGEubGVuZ3RoLzIpKVxuICAgICAgICAuYXR0ciAneScsIDIwXG4gICAgICAgIC5hdHRyICd0ZXh0LWFuY2hvcicsICdzdGFydCdcbiAgICAgICAgLnRleHQgKGQpIC0+IGRcblxuICBkcmF3R3JhcGg6IChtYXApIC0+XG4gICAgIyBnZXQgY291bnRyaWVzIGRhdGFcbiAgICBAY291bnRyaWVzID0gdG9wb2pzb24uZmVhdHVyZShtYXAsIG1hcC5vYmplY3RzLmNvdW50cmllcyk7XG4gICAgQGNvdW50cmllcy5mZWF0dXJlcyA9IEBjb3VudHJpZXMuZmVhdHVyZXMuZmlsdGVyIChkKSAtPiBkLmlkICE9ICcwMTAnICAjIHJlbW92ZSBhbnRhcmN0aWNhXG4gICAgIyBzZXQgcHJvamVjdGlvblxuICAgIEBwcm9qZWN0aW9uID0gZDMuZ2VvS2F2cmF5c2tpeTcoKVxuICAgIEBwcm9qZWN0aW9uU2V0U2l6ZSgpXG4gICAgIyBzZXQgcGF0aFxuICAgIEBwYXRoID0gZDMuZ2VvUGF0aCgpXG4gICAgICAucHJvamVjdGlvbiBAcHJvamVjdGlvblxuICAgICMgYWRkIGNvdW50cmllcyBwYXRoc1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuY291bnRyeScpXG4gICAgLmRhdGEoQGNvdW50cmllcy5mZWF0dXJlcylcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ3BhdGgnKVxuICAgICAgLmF0dHIgJ2lkJywgKGQpIC0+ICdjb3VudHJ5LScrZC5pZFxuICAgICAgLmF0dHIgJ2NsYXNzJywgKGQpIC0+ICdjb3VudHJ5J1xuICAgICAgLmF0dHIgJ2ZpbGwnLCBAc2V0Q291bnRyeUNvbG9yXG4gICAgICAuYXR0ciAnc3Ryb2tlLXdpZHRoJywgMVxuICAgICAgLmF0dHIgJ3N0cm9rZScsIEBzZXRDb3VudHJ5Q29sb3JcbiAgICAgIC5hdHRyICdkJywgQHBhdGhcbiAgICAjIGFkZCBtb3VzZSBldmVudHMgbGlzdGVuZXJzIGlmIHRoZXJlJ3MgYSB0b29sdGlwXG4gICAgaWYgQCR0b29sdGlwXG4gICAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLmNvdW50cnknKVxuICAgICAgICAub24gJ21vdXNlb3ZlcicsIEBvbk1vdXNlT3ZlclxuICAgICAgICAub24gJ21vdXNlbW92ZScsIEBvbk1vdXNlTW92ZVxuICAgICAgICAub24gJ21vdXNlb3V0JywgQG9uTW91c2VPdXRcbiAgICAjIHRyaWdnZXIgZHJhdy1jb21wbGV0ZSBldmVudFxuICAgIEAkZWwudHJpZ2dlciAnZHJhdy1jb21wbGV0ZSdcbiAgICByZXR1cm4gQFxuXG4gIHVwZGF0ZUdyYXBoRGltZW5zaW9uczogLT5cbiAgICBzdXBlcigpXG4gICAgQHByb2plY3Rpb25TZXRTaXplKClcbiAgICBAcGF0aC5wcm9qZWN0aW9uIEBwcm9qZWN0aW9uXG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5jb3VudHJ5JylcbiAgICAgIC5hdHRyICdkJywgQHBhdGhcbiAgICBpZiBAb3B0aW9ucy5sZWdlbmRcbiAgICAgIEBsZWdlbmQuY2FsbCBAc2V0TGVnZW5kUG9zaXRpb25cbiAgICByZXR1cm4gQFxuXG4gIHByb2plY3Rpb25TZXRTaXplOiAtPlxuICAgIEBwcm9qZWN0aW9uXG4gICAgICAuZml0U2l6ZSBbQHdpZHRoLCBAaGVpZ2h0XSwgQGNvdW50cmllcyAgIyBmaXQgcHJvamVjdGlvbiBzaXplXG4gICAgICAuc2NhbGUgICAgQHByb2plY3Rpb24uc2NhbGUoKSAqIDEuMSAgICAgIyBBZGp1c3QgcHJvamVjdGlvbiBzaXplICYgdHJhbnNsYXRpb25cbiAgICAgIC50cmFuc2xhdGUgW0B3aWR0aCowLjQ4LCBAaGVpZ2h0KjAuNl1cblxuICBzZXRDb3VudHJ5Q29sb3I6IChkKSA9PlxuICAgIHZhbHVlID0gQGRhdGEuZmlsdGVyIChlKSAtPiBlLmNvZGVfbnVtID09IGQuaWRcbiAgICByZXR1cm4gaWYgdmFsdWVbMF0gdGhlbiBAY29sb3IodmFsdWVbMF0udmFsdWUpIGVsc2UgJyNlZWUnXG5cbiAgc2V0TGVnZW5kUG9zaXRpb246IChlbGVtZW50KSA9PlxuICAgIGVsZW1lbnQuYXR0ciAndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnK01hdGgucm91bmQoQHdpZHRoKjAuNSkrJywnKygtQG9wdGlvbnMubWFyZ2luLnRvcCkrJyknXG5cbiAgZ2V0TGVnZW5kRGF0YTogPT5cbiAgICByZXR1cm4gZDMucmFuZ2UgMCwgQGNvbG9yLmRvbWFpbigpWzFdXG5cbiAgb25Nb3VzZU92ZXI6IChkKSA9PlxuICAgIHZhbHVlID0gQGRhdGEuZmlsdGVyIChlKSAtPiBlLmNvZGVfbnVtID09IGQuaWRcbiAgICBpZiB2YWx1ZS5sZW5ndGggPiAwXG4gICAgICBwb3NpdGlvbiA9IGQzLm1vdXNlKGQzLmV2ZW50LnRhcmdldClcbiAgICAgICMgU2V0IHRvb2x0aXAgY29udGVudFxuICAgICAgQHNldFRvb2x0aXBEYXRhIHZhbHVlWzBdXG4gICAgICAjIFNldCB0b29sdGlwIHBvc2l0aW9uXG4gICAgICBvZmZzZXQgPSAkKGQzLmV2ZW50LnRhcmdldCkub2Zmc2V0KClcbiAgICAgIEAkdG9vbHRpcC5jc3NcbiAgICAgICAgJ2xlZnQnOiAgICBwb3NpdGlvblswXSAtIChAJHRvb2x0aXAud2lkdGgoKSAqIDAuNSlcbiAgICAgICAgJ3RvcCc6ICAgICBwb3NpdGlvblsxXSAtIChAJHRvb2x0aXAuaGVpZ2h0KCkgKiAwLjUpXG4gICAgICAgICdvcGFjaXR5JzogJzEnXG5cbiAgb25Nb3VzZU1vdmU6IChkKSA9PlxuICAgIHBvc2l0aW9uID0gZDMubW91c2UoZDMuZXZlbnQudGFyZ2V0KVxuICAgIEAkdG9vbHRpcC5jc3NcbiAgICAgICdsZWZ0JzogICAgcG9zaXRpb25bMF0gLSAoQCR0b29sdGlwLndpZHRoKCkgKiAwLjUpXG4gICAgICAndG9wJzogICAgIHBvc2l0aW9uWzFdIC0gKEAkdG9vbHRpcC5oZWlnaHQoKSAqIDAuNSlcblxuICBvbk1vdXNlT3V0OiAoZCkgPT5cbiAgICBAJHRvb2x0aXAuY3NzICdvcGFjaXR5JywgJzAnXG5cbiAgc2V0VG9vbHRpcERhdGE6IChkKSA9PlxuICAgIEAkdG9vbHRpcFxuICAgICAgLmZpbmQgJy50b29sdGlwLWlubmVyIC50aXRsZSdcbiAgICAgIC5odG1sIGQubmFtZVxuICAgIEAkdG9vbHRpcFxuICAgICAgLmZpbmQgJy50b29sdGlwLWlubmVyIC52YWx1ZSdcbiAgICAgIC5odG1sIEBmb3JtYXRGbG9hdChkLnZhbHVlKVxuICAgIGlmIGQuY2FzZXNcbiAgICAgIEAkdG9vbHRpcFxuICAgICAgICAuZmluZCAnLnRvb2x0aXAtaW5uZXIgLmNhc2VzJ1xuICAgICAgICAuaHRtbCBAZm9ybWF0SW50ZWdlcihkLmNhc2VzKSAiLCJjbGFzcyB3aW5kb3cuU2NhdHRlcnBsb3RHcmFwaCBleHRlbmRzIHdpbmRvdy5CYXNlR3JhcGhcblxuXG4gICMgQ29uc3RydWN0b3JcbiAgIyAtLS0tLS0tLS0tLVxuXG4gIGNvbnN0cnVjdG9yOiAoaWQsIG9wdGlvbnMpIC0+XG4gICAgI2NvbnNvbGUubG9nICdTY2F0dGVycGxvdCBHcmFwaCcsIGlkLCBvcHRpb25zXG4gICAgc3VwZXIgaWQsIG9wdGlvbnNcbiAgICByZXR1cm4gQFxuXG5cbiAgIyBNYWluIG1ldGhvZHNcbiAgIyAtLS0tLS0tLS0tLS1cblxuICBkYXRhUGFyc2VyOiAoZGF0YSkgLT5cbiAgICBkYXRhLmZvckVhY2ggKGQpID0+IFxuICAgICAgZFtAb3B0aW9ucy5rZXkueF0gPSArZFtAb3B0aW9ucy5rZXkueF1cbiAgICAgIGRbQG9wdGlvbnMua2V5LnldID0gK2RbQG9wdGlvbnMua2V5LnldXG4gICAgcmV0dXJuIGRhdGFcblxuICBzZXRTVkc6IC0+XG4gICAgc3VwZXIoKVxuICAgIEAkdG9vbHRpcCA9IEAkZWwuZmluZCAnLnRvb2x0aXAnXG5cbiAgc2V0U2NhbGVzOiAtPlxuICAgICMgc2V0IHggc2NhbGVcbiAgICBAeCA9IGQzLnNjYWxlTGluZWFyKClcbiAgICAgIC5yYW5nZSBAZ2V0U2NhbGVYUmFuZ2UoKVxuICAgICMgc2V0IHkgc2NhbGVcbiAgICBAeSA9IGQzLnNjYWxlTGluZWFyKClcbiAgICAgIC5yYW5nZSBAZ2V0U2NhbGVZUmFuZ2UoKVxuICAgICMgc2V0IGNvbG9yIHNjYWxlIGlmIG9wdGlvbnMua2V5LmNvbG9yIGlzIGRlZmluZWRcbiAgICBpZiBAb3B0aW9ucy5rZXkuY29sb3JcbiAgICAgIEBjb2xvciA9IGQzLnNjYWxlT3JkaW5hbCgpXG4gICAgICAgIC5yYW5nZSBAZ2V0Q29sb3JSYW5nZSgpXG4gICAgIyBzZXQgc2l6ZSBzY2FsZSBpZiBvcHRpb25zLmtleS5zaXplIGlzIGRlZmluZWRcbiAgICBpZiBAb3B0aW9ucy5rZXkuc2l6ZVxuICAgICAgQHNpemUgPSBkMy5zY2FsZUxpbmVhcigpXG4gICAgICAgIC5yYW5nZSBAZ2V0U2l6ZVJhbmdlKClcbiAgICAjIHNldHVwIGF4aXNcbiAgICBAeEF4aXMgPSBkMy5heGlzQm90dG9tKEB4KVxuICAgICAgLnRpY2tTaXplIEBoZWlnaHRcbiAgICBAeUF4aXMgPSBkMy5heGlzTGVmdChAeSlcbiAgICAgIC50aWNrU2l6ZSBAd2lkdGhcbiAgICByZXR1cm4gQFxuXG4gIGdldFNjYWxlWERvbWFpbjogPT5cbiAgICByZXR1cm4gWzAsIGQzLm1heChAZGF0YSwgKGQpID0+IGRbQG9wdGlvbnMua2V5LnhdKV1cblxuICBnZXRTY2FsZVlEb21haW46ID0+XG4gICAgcmV0dXJuIFswLCBkMy5tYXgoQGRhdGEsIChkKSA9PiBkW0BvcHRpb25zLmtleS55XSldXG5cbiAgZ2V0Q29sb3JSYW5nZTogPT5cbiAgICByZXR1cm4gWycjQzlBRDRCJywgJyNCQkQ2NDYnLCAnIzYzQkEyRCcsICcjMzRBODkzJywgJyMzRDkxQUQnLCAnIzVCOEFDQicsICcjQkE3REFGJywgJyNCRjZCODAnLCAnI0Y0OUQ5RCcsICcjRTI1NDUzJywgJyNCNTY2MzEnLCAnI0UyNzczQicsICcjRkZBOTUxJywgJyNGNENBMDAnXVxuXG4gIGdldENvbG9yRG9tYWluOiA9PlxuICAgIHJldHVybiBkMy5leHRlbnQgQGRhdGEsIChkKSA9PiBkW0BvcHRpb25zLmtleS5jb2xvcl1cblxuICBnZXRTaXplUmFuZ2U6ID0+XG4gICAgcmV0dXJuIFs2LCAxMl1cblxuICBnZXRTaXplRG9tYWluOiA9PlxuICAgIHJldHVybiBbMCwgZDMubWF4KEBkYXRhLCAoZCkgPT4gZFtAb3B0aW9ucy5rZXkuc2l6ZV0pXVxuXG4gIGRyYXdTY2FsZXM6IC0+XG4gICAgc3VwZXIoKVxuICAgICMgc2V0IGNvbG9yIGRvbWFpblxuICAgIGlmIEBjb2xvclxuICAgICAgQGNvbG9yLmRvbWFpbiBAZ2V0Q29sb3JEb21haW4oKVxuICAgICMgc2V0IHNpemUgZG9tYWluXG4gICAgaWYgQHNpemVcbiAgICAgIEBzaXplLmRvbWFpbiBAZ2V0U2l6ZURvbWFpbigpXG4gICAgcmV0dXJuIEBcblxuICBkcmF3R3JhcGg6IC0+XG4gICAgIyBkcmF3IHBvaW50c1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuZG90JylcbiAgICAgIC5kYXRhKEBkYXRhKVxuICAgIC5lbnRlcigpLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyICdjbGFzcycsICdkb3QnXG4gICAgICAuYXR0ciAnaWQnLCBAZ2V0RG90SWRcbiAgICAgIC5hdHRyICdyJywgQGdldERvdFNpemVcbiAgICAgIC5zdHlsZSAnZmlsbCcsIEBnZXREb3RGaWxsXG4gICAgICAuY2FsbCBAc2V0RG90c0RpbWVuc2lvbnNcbiAgICAjIGRyYXcgbGFiZWxzXG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5kb3QtbGFiZWwnKVxuICAgICAgLmRhdGEoQGRhdGEpXG4gICAgLmVudGVyKCkuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyICdjbGFzcycsICdkb3QtbGFiZWwnXG4gICAgICAuYXR0ciAnaWQnLCBAZ2V0RG90TGFiZWxJZFxuICAgICAgLmF0dHIgJ2R4JywgJzAuNzVlbSdcbiAgICAgIC5hdHRyICdkeScsICcwLjM3NWVtJ1xuICAgICAgLnRleHQgQGdldERvdExhYmVsVGV4dFxuICAgICAgLmNhbGwgQHNldERvdExhYmVsc0RpbWVuc2lvbnNcbiAgICAjIGFkZCBtb3VzZSBldmVudHMgbGlzdGVuZXJzIGlmIHRoZXJlJ3MgYSB0b29sdGlwXG4gICAgaWYgQCR0b29sdGlwXG4gICAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLmRvdCcpXG4gICAgICAgIC5vbiAnbW91c2VvdmVyJywgQG9uTW91c2VPdmVyXG4gICAgICAgIC5vbiAnbW91c2VvdXQnLCBAb25Nb3VzZU91dFxuICAgIHJldHVybiBAXG5cbiAgdXBkYXRlR3JhcGhEaW1lbnNpb25zOiAtPlxuICAgIHN1cGVyKClcbiAgICAjIHVwZGF0ZSBheGlzIHNpemVcbiAgICBAeEF4aXMudGlja1NpemUgQGhlaWdodFxuICAgIEB5QXhpcy50aWNrU2l6ZSBAd2lkdGhcbiAgICAjIHVwZGF0ZSBkb3RzIHBvc2l0aW9uc1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuZG90JylcbiAgICAgIC5jYWxsIEBzZXREb3RzRGltZW5zaW9uc1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuZG90LWxhYmVsJylcbiAgICAgIC5jYWxsIEBzZXREb3RMYWJlbHNEaW1lbnNpb25zXG4gICAgcmV0dXJuIEBcblxuICBnZXREb3RJZDogKGQpID0+XG4gICAgcmV0dXJuICdkb3QtJytkW0BvcHRpb25zLmtleS5pZF1cblxuICBnZXREb3RMYWJlbElkOiAoZCkgPT5cbiAgICByZXR1cm4gJ2RvdC1sYWJlbC0nK2RbQG9wdGlvbnMua2V5LmlkXVxuXG4gIGdldERvdExhYmVsVGV4dDogKGQpID0+XG4gICAgcmV0dXJuIGRbQG9wdGlvbnMua2V5LmlkXVxuXG4gIGdldERvdFNpemU6IChkKSA9PlxuICAgIGlmIEBzaXplXG4gICAgICByZXR1cm4gQHNpemUgZFtAb3B0aW9ucy5rZXkuc2l6ZV1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gNlxuXG4gIGdldERvdEZpbGw6IChkKSA9PlxuICAgIGlmIEBjb2xvclxuICAgICAgcmV0dXJuIEBjb2xvciBkW0BvcHRpb25zLmtleS5jb2xvcl1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gbnVsbFxuXG4gIHNldERvdHNEaW1lbnNpb25zOiAoZWxlbWVudCkgPT5cbiAgICBlbGVtZW50XG4gICAgICAuYXR0ciAnY3gnLCAoZCkgPT4gQHggZFtAb3B0aW9ucy5rZXkueF1cbiAgICAgIC5hdHRyICdjeScsIChkKSA9PiBAeSBkW0BvcHRpb25zLmtleS55XVxuXG4gIHNldERvdExhYmVsc0RpbWVuc2lvbnM6IChlbGVtZW50KSA9PlxuICAgIGVsZW1lbnRcbiAgICAgIC5hdHRyICd4JywgKGQpID0+IEB4IGRbQG9wdGlvbnMua2V5LnhdXG4gICAgICAuYXR0ciAneScsIChkKSA9PiBAeSBkW0BvcHRpb25zLmtleS55XVxuXG4gICMgb3ZlcnJpZCB4IGF4aXMgcG9zaXRpb25pbmdcbiAgc2V0WEF4aXNQb3NpdGlvbjogKHNlbGVjdGlvbikgPT5cbiAgICBzZWxlY3Rpb24uYXR0ciAndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLDApJ1xuXG4gICMgbW91c2UgZXZlbnRzXG4gIG9uTW91c2VPdmVyOiAoZCkgPT5cbiAgICBlbGVtZW50ID0gZDMuc2VsZWN0KGQzLmV2ZW50LnRhcmdldClcbiAgICAjIFNldCB0b29sdGlwIGNvbnRlbnRcbiAgICBAc2V0VG9vbHRpcERhdGEgZFxuICAgICMgU2V0IHRvb2x0aXAgcG9zaXRpb25cbiAgICBAJHRvb2x0aXAuY3NzXG4gICAgICBsZWZ0OiAgICArZWxlbWVudC5hdHRyKCdjeCcpICsgQG9wdGlvbnMubWFyZ2luLmxlZnQgLSAoQCR0b29sdGlwLndpZHRoKCkgKiAwLjUpXG4gICAgICB0b3A6ICAgICArZWxlbWVudC5hdHRyKCdjeScpICsgQG9wdGlvbnMubWFyZ2luLnRvcCAtIEAkdG9vbHRpcC5oZWlnaHQoKSAtIDE1XG4gICAgICBvcGFjaXR5OiAxXG5cbiAgb25Nb3VzZU91dDogKGQpID0+XG4gICAgQCR0b29sdGlwLmNzcyAnb3BhY2l0eScsICcwJ1xuXG4gIHNldFRvb2x0aXBEYXRhOiAoZCkgPT5cbiAgICBAJHRvb2x0aXBcbiAgICAgIC5maW5kICcudG9vbHRpcC1pbm5lciAudGl0bGUnXG4gICAgICAuaHRtbCBkW0BvcHRpb25zLmtleS5pZF1cbiAgICBAJHRvb2x0aXBcbiAgICAgIC5maW5kICcudG9vbHRpcC1pbm5lciAudmFsdWUteCdcbiAgICAgIC5odG1sIGRbQG9wdGlvbnMua2V5LnhdXG4gICAgQCR0b29sdGlwXG4gICAgICAuZmluZCAnLnRvb2x0aXAtaW5uZXIgLnZhbHVlLXknXG4gICAgICAuaHRtbCBkW0BvcHRpb25zLmtleS55XVxuXG4gICAgIiwiY2xhc3Mgd2luZG93LlNjYXR0ZXJwbG90RGlzY3JldGVHcmFwaCBleHRlbmRzIHdpbmRvdy5TY2F0dGVycGxvdEdyYXBoXG5cblxuICAjIENvbnN0cnVjdG9yXG4gICMgLS0tLS0tLS0tLS1cblxuICBjb25zdHJ1Y3RvcjogKGlkLCBvcHRpb25zKSAtPlxuICAgICNjb25zb2xlLmxvZyAnU2NhdHRlcnBsb3QgRGlzY3JldGUgR3JhcGgnLCBpZCwgb3B0aW9uc1xuICAgIHN1cGVyIGlkLCBvcHRpb25zXG4gICAgcmV0dXJuIEBcblxuXG4gICMgTWFpbiBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tXG5cbiAgZGF0YVBhcnNlcjogKGRhdGEpIC0+XG4gICAgZGF0YS5mb3JFYWNoIChkKSA9PlxuICAgICAgZFtAb3B0aW9ucy5rZXkueV0gPSArZFtAb3B0aW9ucy5rZXkueV1cbiAgICByZXR1cm4gZGF0YVxuXG4gIHNldFNjYWxlczogLT5cbiAgICAjIHNldCB4IHNjYWxlXG4gICAgQHggPSBkMy5zY2FsZVBvaW50KClcbiAgICAgIC5yYW5nZSBAZ2V0U2NhbGVYUmFuZ2UoKVxuICAgICMgc2V0IHkgc2NhbGVcbiAgICBAeSA9IGQzLnNjYWxlTGluZWFyKClcbiAgICAgIC5yYW5nZSBAZ2V0U2NhbGVZUmFuZ2UoKVxuICAgICMgc2V0IGNvbG9yIHNjYWxlIGlmIG9wdGlvbnMua2V5LmNvbG9yIGlzIGRlZmluZWRcbiAgICBpZiBAb3B0aW9ucy5rZXkuY29sb3JcbiAgICAgIEBjb2xvciA9IGQzLnNjYWxlT3JkaW5hbCgpXG4gICAgICAgIC5yYW5nZSBAZ2V0Q29sb3JSYW5nZSgpXG4gICAgIyBzZXQgc2l6ZSBzY2FsZSBpZiBvcHRpb25zLmtleS5zaXplIGlzIGRlZmluZWRcbiAgICBpZiBAb3B0aW9ucy5rZXkuc2l6ZVxuICAgICAgQHNpemUgPSBkMy5zY2FsZUxpbmVhcigpXG4gICAgICAgIC5yYW5nZSBAZ2V0U2l6ZVJhbmdlKClcbiAgICAjIHNldHVwIGF4aXNcbiAgICBAeEF4aXMgPSBkMy5heGlzQm90dG9tKEB4KVxuICAgICAgLnRpY2tTaXplIEBoZWlnaHRcbiAgICBAeUF4aXMgPSBkMy5heGlzTGVmdChAeSlcbiAgICAgIC50aWNrU2l6ZSBAd2lkdGhcbiAgICByZXR1cm4gQFxuXG4gIGRyYXdHcmFwaDogLT5cbiAgICBzdXBlcigpXG4gICAgIyBkcmF3IGRvdCBsaW5lc1xuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuZG90LWxpbmUnKVxuICAgICAgLmRhdGEoQGRhdGEpXG4gICAgLmVudGVyKCkuYXBwZW5kKCdsaW5lJylcbiAgICAgIC5hdHRyICdjbGFzcycsICdkb3QtbGluZSdcbiAgICAgIC5hdHRyICdpZCcsIEBnZXREb3RMaW5lSWRcbiAgICAgIC5zdHlsZSAnc3Ryb2tlJywgQGdldERvdEZpbGxcbiAgICAgIC5zdHlsZSAnb3BhY2l0eScsIDBcbiAgICAgIC5jYWxsIEBzZXREb3RMaW5lc0RpbWVuc2lvbnNcbiAgICByZXR1cm4gQFxuXG4gIHVwZGF0ZUdyYXBoRGltZW5zaW9uczogLT5cbiAgICBzdXBlcigpXG4gICAgIyB1cGRhdGUgbGluZXMgc2l6ZVxuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuZG90LWxpbmUnKVxuICAgICAgLmNhbGwgQHNldERvdExpbmVzRGltZW5zaW9uc1xuICAgIHJldHVybiBAXG5cbiAgZ2V0RG90TGluZUlkOiAoZCkgPT5cbiAgICByZXR1cm4gJ2RvdC1saW5lLScrZFtAb3B0aW9ucy5rZXkuaWRdXG5cbiAgZ2V0U2NhbGVYRG9tYWluOiA9PlxuICAgIHJldHVybiBAZGF0YS5tYXAgKGQpID0+IGRbQG9wdGlvbnMua2V5LnhdXG5cbiAgc2V0RG90TGluZXNEaW1lbnNpb25zOiAoZWxlbWVudCkgPT5cbiAgICBlbGVtZW50XG4gICAgICAuYXR0ciAneDEnLCAoZCkgPT4gQHggZFtAb3B0aW9ucy5rZXkueF1cbiAgICAgIC5hdHRyICd5MScsIChkKSA9PiBAaGVpZ2h0XG4gICAgICAuYXR0ciAneDInLCAoZCkgPT4gQHggZFtAb3B0aW9ucy5rZXkueF1cbiAgICAgIC5hdHRyICd5MicsIChkKSA9PiBAeSBkW0BvcHRpb25zLmtleS55XVxuXG4gICMgbW91c2UgZXZlbnRzXG4gIG9uTW91c2VPdmVyOiAoZCkgPT5cbiAgICBzdXBlcihkKVxuICAgIGtleSA9IGQzLnNlbGVjdChkMy5ldmVudC50YXJnZXQpLmRhdGEoKVswXVtAb3B0aW9ucy5rZXkuY29sb3JdXG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5kb3QnKVxuICAgICAgLmNsYXNzZWQgJ2luYWN0aXZlJywgdHJ1ZVxuICAgIEBjb250YWluZXIuc2VsZWN0QWxsKCcuZG90JylcbiAgICAgIC5maWx0ZXIgKGQpID0+IHJldHVybiBkW0BvcHRpb25zLmtleS5jb2xvcl0gPT0ga2V5XG4gICAgICAuY2xhc3NlZCAnaW5hY3RpdmUnLCBmYWxzZVxuICAgICAgLmNsYXNzZWQgJ2FjdGl2ZScsIHRydWVcbiAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLmRvdC1saW5lJylcbiAgICAgIC5maWx0ZXIgKGQpID0+IHJldHVybiBkW0BvcHRpb25zLmtleS5jb2xvcl0gPT0ga2V5XG4gICAgICAuc3R5bGUgJ29wYWNpdHknLCAxXG4gICAgIyBzZXQgc2VsZWN0ZWQgZG90cyBvbiB0b3BcbiAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLmRvdCcpXG4gICAgICAuc29ydCAoYSxiKSA9PiBpZiBhW0BvcHRpb25zLmtleS5jb2xvcl0gPT0ga2V5IHRoZW4gMSBlbHNlIC0xXG5cbiAgb25Nb3VzZU91dDogKGQpID0+XG4gICAgc3VwZXIoZClcbiAgICBAY29udGFpbmVyLnNlbGVjdEFsbCgnLmRvdCcpXG4gICAgICAuY2xhc3NlZCAnaW5hY3RpdmUnLCBmYWxzZVxuICAgICAgLmNsYXNzZWQgJ2FjdGl2ZScsIGZhbHNlXG4gICAgQGNvbnRhaW5lci5zZWxlY3RBbGwoJy5kb3QtbGluZScpXG4gICAgICAuc3R5bGUgJ29wYWNpdHknLCAwXG4gICAgIiwiIyBNYWluIHNjcmlwdCBmb3IgdmFjY2luZXMgYXJ0aWNsZXNcblxuKCgkKSAtPlxuXG4gICMgR2V0IGN1cnJlbnQgYXJ0aWNsZSBsYW5nICYgYmFzZSB1cmxcbiAgbGFuZyAgICA9ICQoJ2JvZHknKS5kYXRhKCdsYW5nJylcbiAgYmFzZXVybCA9ICQoJ2JvZHknKS5kYXRhKCdiYXNldXJsJylcblxuICAjIGxpc3Qgb2YgZXhjbHVkZWQgY291bnRyaWVzIGNvZGVzIChjb3VudHJpZXMgd2l0aCBsZXNzIHRoYW4gMzAwLjAwMCBpbmhhYml0YW50cyBpbiAyMDE1KVxuICBleGNsdWRlZENvdW50cmllcyA9IFsnTklVJywnQ09LJywnVFVWJywnTlJVJywnUExXJywnVkdCJywnTUFGJywnU01SJywnR0lCJywnVENBJywnTElFJywnTUNPJywnU1hNJywnRlJPJywnTUhMJywnTU5QJywnQVNNJywnS05BJywnR1JMJywnQ1knLCdCTVUnLCdBTkQnLCdETUEnLCdJTU4nLCdBVEcnLCdTWUMnLCdWSVInLCdBQlcnLCdGU00nLCdUT04nLCdHUkQnLCdWQ1QnLCdLSVInLCdDVVcnLCdDSEknLCdHVU0nLCdMQ0EnLCdTVFAnLCdXU00nLCdWVVQnLCdOQ0wnLCdQWUYnLCdCUkInXSAgICAgIFxuXG4gICMgc2V0dXAgZm9ybWF0IG51bWJlcnNcbiAgaWYgbGFuZyA9PSAnZXMnXG4gICAgZDMuZm9ybWF0RGVmYXVsdExvY2FsZSB7XG4gICAgICBcImRlY2ltYWxcIjogXCIsXCJcbiAgICAgIFwidGhvdXNhbmRzXCI6IFwiLlwiXG4gICAgICBcImdyb3VwaW5nXCI6IFszXVxuICAgIH1cblxuICBmb3JtYXRGbG9hdCA9IGQzLmZvcm1hdCgnLC4xZicpXG4gIGZvcm1hdEludGVnZXIgPSBkMy5mb3JtYXQoJyxkJylcblxuICAjIEluaXQgVG9vbHRpcHNcbiAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKVxuXG5cbiAgIyBnZXQgY291bnRyeSBuYW1lIGF1eGlsaWFyIG1ldGhvZFxuICBnZXRDb3VudHJ5TmFtZSA9IChjb3VudHJpZXMsIGNvZGUsIGxhbmcpIC0+XG4gICAgaXRlbSA9IGNvdW50cmllcy5maWx0ZXIgKGQpIC0+IGQuY29kZSA9PSBjb2RlXG4gICAgaWYgaXRlbVxuICAgICAgaXRlbVswXVsnbmFtZV8nK2xhbmddXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5lcnJvciAnTm8gY291bnRyeSBuYW1lIGZvciBjb2RlJywgY29kZVxuXG4gICMgVmlkZW8gb2YgbWFwIHBvbGlvIGNhc2VzXG4gIHNldFZpZGVvTWFwUG9saW8gPSAtPlxuICAgIGQzLmNzdiBiYXNldXJsKycvZGF0YS9kaXNlYXNlcy1wb2xpby1jYXNlcy10b3RhbC5jc3YnLCAoZXJyb3IsIGRhdGEpIC0+XG4gICAgICBjYXNlcyA9IHt9XG4gICAgICBjYXNlc1N0ciA9IGlmIGxhbmcgPT0gJ2VzJyB0aGVuICdjYXNvcycgZWxzZSAnY2FzZXMnXG4gICAgICBkYXRhLmZvckVhY2ggKGQpIC0+XG4gICAgICAgIGNhc2VzW2QueWVhcl0gPSBkLnZhbHVlXG4gICAgICAjIEFkZCB5b3V0dWJlIHZpZGVvXG4gICAgICB3cmFwcGVyID0gUG9wY29ybi5IVE1MWW91VHViZVZpZGVvRWxlbWVudCgnI3ZpZGVvLW1hcC1wb2xpbycpXG4gICAgICB3cmFwcGVyLnNyYyA9ICdodHRwOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL28tRXpWT2puYzZRP2NvbnRyb2xzPTAmc2hvd2luZm89MCZoZD0xJ1xuICAgICAgcG9wY29ybiA9IFBvcGNvcm4od3JhcHBlcilcbiAgICAgIG5vdGVzID0gMjAxNyAtIDE5ODBcbiAgICAgIHllYXJEdXJhdGlvbiA9IDI3Lyhub3RlcysxKSAjIHZpZGVvIGR1cmF0aW9uIGlzIDI3c2Vjb25kcyBcbiAgICAgIGkgPSAwXG4gICAgICB3aGlsZSBpIDwgbm90ZXNcbiAgICAgICAgeWVhciA9ICcnKygxOTgwK2kpXG4gICAgICAgIHBvcGNvcm4uZm9vdG5vdGVcbiAgICAgICAgICBzdGFydDogIHllYXJEdXJhdGlvbiAqIGlcbiAgICAgICAgICBlbmQ6ICAgIGlmIGkgPCBub3Rlcy0xIHRoZW4geWVhckR1cmF0aW9uKihpKzEpIGVsc2UgKHllYXJEdXJhdGlvbiooaSsxKSkrMVxuICAgICAgICAgIHRleHQ6ICAgeWVhciArICc8YnI+PHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPicgKyBmb3JtYXRJbnRlZ2VyKGNhc2VzW3llYXJdKSArICcgJyArIGNhc2VzU3RyICsgJzwvc3Bhbj4nXG4gICAgICAgICAgdGFyZ2V0OiAndmlkZW8tbWFwLXBvbGlvLWRlc2NyaXB0aW9uJ1xuICAgICAgICBpKytcbiAgICAgICMgU2hvdyBjb3ZlciB3aGVuIHZpZGVvIGVuZGVkXG4gICAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2VuZGVkJywgKGUpIC0+XG4gICAgICAgICQoJy52aWRlby1tYXAtcG9saW8tY292ZXInKS5zaG93KClcbiAgICAgICAgJCgnI3ZpZGVvLW1hcC1wb2xpby1kZXNjcmlwdGlvbiwgI3ZpZGVvLW1hcC1wb2xpbyBpZnJhbWUnKS5mYWRlVG8gMCwgMFxuICAgICAgICBwb3Bjb3JuLmN1cnJlbnRUaW1lIDBcbiAgICAgICMgU2hvdyB2aWRlbyB3aGVuIHBsYXkgYnRuIGNsaWNrZWRcbiAgICAgICQoJyN2aWRlby1tYXAtcG9saW8tcGxheS1idG4nKS5jbGljayAoZSkgLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHBvcGNvcm4ucGxheSgpXG4gICAgICAgICQoJy52aWRlby1tYXAtcG9saW8tY292ZXInKS5mYWRlT3V0KClcbiAgICAgICAgJCgnI3ZpZGVvLW1hcC1wb2xpby1kZXNjcmlwdGlvbiwgI3ZpZGVvLW1hcC1wb2xpbyBpZnJhbWUnKS5mYWRlVG8gMzAwLCAxXG5cblxuICAjIE1lYXNsZXMgV29ybGQgTWFwIEdyYXBoXG4gIHNldHVwTWVhc2xlc1dvcmxkTWFwR3JhcGggPSAtPlxuICAgIGQzLnF1ZXVlKClcbiAgICAgIC5kZWZlciBkMy5jc3YsICBiYXNldXJsKycvZGF0YS9tZWFzbGVzLWNhc2VzLXdoby1yZWdpb25zLmNzdidcbiAgICAgIC5kZWZlciBkMy5jc3YsICBiYXNldXJsKycvZGF0YS9jb3VudHJpZXMtd2hvLXJlZ2lvbnMuY3N2J1xuICAgICAgLmRlZmVyIGQzLmpzb24sIGJhc2V1cmwrJy9kYXRhL21hcC13b3JsZC0xMTAuanNvbidcbiAgICAgIC5hd2FpdCAoZXJyb3IsIGRhdGEsIGNvdW50cmllcywgbWFwKSAtPlxuICAgICAgICAjIGFkZCBjYXNlcyB0byBlYWNoIGNvdW50cnlcbiAgICAgICAgY291bnRyaWVzLmZvckVhY2ggKGNvdW50cnkpIC0+XG4gICAgICAgICAgcmVnaW9uID0gZGF0YS5maWx0ZXIgKGQpIC0+IGQucmVnaW9uID09IGNvdW50cnkucmVnaW9uXG4gICAgICAgICAgaWYgcmVnaW9uLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGNvdW50cnkudmFsdWUgPSByZWdpb25bMF0uY2FzZXMqMTAwMDAwXG4gICAgICAgICAgICBjb3VudHJ5LmNhc2VzID0gcmVnaW9uWzBdLmNhc2VzX3RvdGFsXG4gICAgICAgICAgICBjb3VudHJ5Lm5hbWUgPSByZWdpb25bMF1bJ25hbWVfJytsYW5nXVxuICAgICAgICAjIHNldCBncmFwaFxuICAgICAgICBncmFwaCA9IG5ldyB3aW5kb3cuTWFwR3JhcGgoJ21lYXNsZXMtd29ybGQtbWFwLWdyYXBoJyxcbiAgICAgICAgICBhc3BlY3RSYXRpbzogMC41NjI1XG4gICAgICAgICAgbWFyZ2luOiBcbiAgICAgICAgICAgIHRvcDogNjBcbiAgICAgICAgICAgIGJvdHRvbTogMFxuICAgICAgICAgIGxlZ2VuZDogdHJ1ZSlcbiAgICAgICAgZ3JhcGguc2V0RGF0YSBjb3VudHJpZXMsIG1hcFxuICAgICAgICAkKHdpbmRvdykucmVzaXplIGdyYXBoLm9uUmVzaXplXG5cbiAgIyBNZWFzbGVzIGNhc2VzIEhlYXRtYXAgR3JhcGhcbiAgc2V0dXBIZWF0TWFwR3JhcGggPSAoaWQsIGRhdGEsIGNvdW50cmllcywgbGVnZW5kKSAtPlxuICAgIGRhdGEgPSBkYXRhXG4gICAgICAuZmlsdGVyIChkKSAtPiBjb3VudHJpZXMuaW5kZXhPZihkLmNvZGUpICE9IC0xIGFuZCBkMy52YWx1ZXMoZC52YWx1ZXMpLmxlbmd0aCA+IDBcbiAgICAgIC5zb3J0IChhLGIpIC0+IGEudG90YWwgLSBiLnRvdGFsXG4gICAgZ3JhcGggPSBuZXcgd2luZG93LkhlYXRtYXBHcmFwaChpZCxcbiAgICAgIGxlZ2VuZDogbGVnZW5kXG4gICAgICBtYXJnaW46IFxuICAgICAgICByaWdodDogMFxuICAgICAgICBsZWZ0OiAwKVxuICAgIGdyYXBoLnNldERhdGEgZGF0YVxuICAgICMgU29ydCBkYXRhXG4jICAgICBpZiBzb3J0ID09ICd5ZWFyJ1xuIyAgICAgICBjdXJyZW50RGF0YS5zb3J0IChhLCBiKSAtPlxuIyAgICAgICAgIGlmIGlzTmFOKGEueWVhcl9pbnRyb2R1Y3Rpb24pIHRoZW4gMSBlbHNlIGlmIGlzTmFOKGIueWVhcl9pbnRyb2R1Y3Rpb24pIHRoZW4gLTEgZWxzZSBiLnllYXJfaW50cm9kdWN0aW9uIC0gKGEueWVhcl9pbnRyb2R1Y3Rpb24pXG4jICAgICBlbHNlIGlmIHNvcnQgPT0gJ2Nhc2VzJ1xuIyAgICAgICBjdXJyZW50RGF0YS5zb3J0IChhLCBiKSAtPlxuIyAgICAgICAgIGIudG90YWwgLSAoYS50b3RhbClcbiAgICAkKHdpbmRvdykucmVzaXplIGdyYXBoLm9uUmVzaXplXG5cblxuICBzZXR1cFZhY2NpbmVDb25maWRlbmNlQmFyR3JhcGggPSAtPlxuICAgIGQzLnF1ZXVlKClcbiAgICAgIC5kZWZlciBkMy5jc3YsIGJhc2V1cmwrJy9kYXRhL2NvbmZpZGVuY2UuY3N2J1xuICAgICAgLmRlZmVyIGQzLmpzb24sICdodHRwOi8vZnJlZWdlb2lwLm5ldC9qc29uLydcbiAgICAgIC5hd2FpdCAoZXJyb3IsIGRhdGEsIGxvY2F0aW9uKSAtPlxuICAgICAgICBkYXRhLmZvckVhY2ggKGQpID0+XG4gICAgICAgICAgZC52YWx1ZSA9ICtkLnZhbHVlXG4gICAgICAgICAgZC5uYW1lID0gZFsnbmFtZV8nK2xhbmddXG4gICAgICAgICAgZGVsZXRlIGQubmFtZV9lc1xuICAgICAgICAgIGRlbGV0ZSBkLm5hbWVfZW5cbiAgICAgICAgICAjIHNldCB1c2VyIGNvdW50cnkgYWN0aXZlXG4gICAgICAgICAgaWYgbG9jYXRpb24gYW5kIGQuY29kZTIgPT0gbG9jYXRpb24uY291bnRyeV9jb2RlXG4gICAgICAgICAgICBkLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgZ3JhcGggPSBuZXcgd2luZG93LkJhckdyYXBoKCd2YWNjaW5lLWNvbmZpZGVuY2UtZ3JhcGgnLFxuICAgICAgICAgIGFzcGVjdFJhdGlvOiAwLjNcbiAgICAgICAgICBsYWJlbDogXG4gICAgICAgICAgICBmb3JtYXQ6IChkKSAtPiAgZm9ybWF0RmxvYXQoZCkrJyUnXG4gICAgICAgICAgbWFyZ2luOiB0b3A6IDBcbiAgICAgICAgICBrZXk6XG4gICAgICAgICAgICB4OiAnbmFtZSdcbiAgICAgICAgICAgIHk6ICd2YWx1ZSdcbiAgICAgICAgICAgIGlkOiAnY29kZScpXG4gICAgICAgIGdyYXBoLnNldERhdGEgZGF0YVxuICAgICAgICAkKHdpbmRvdykucmVzaXplIGdyYXBoLm9uUmVzaXplXG5cbiAgc2V0dXBWYWNjaW5lQmNnQ2FzZXNNYXAgPSAtPlxuICAgIGQzLnF1ZXVlKClcbiAgICAgIC5kZWZlciBkMy5jc3YsICBiYXNldXJsKycvZGF0YS90dWJlcmN1bG9zaXMtY2FzZXMuY3N2J1xuICAgICAgLmRlZmVyIGQzLmNzdiwgIGJhc2V1cmwrJy9kYXRhL2NvdW50cmllcy5jc3YnXG4gICAgICAuZGVmZXIgZDMuanNvbiwgYmFzZXVybCsnL2RhdGEvbWFwLXdvcmxkLTExMC5qc29uJ1xuICAgICAgLmF3YWl0IChlcnJvciwgZGF0YSwgY291bnRyaWVzLCBtYXApIC0+XG4gICAgICAgICMgYWRkIGNhc2VzIHRvIGVhY2ggY291bnRyeVxuICAgICAgICBkYXRhLmZvckVhY2ggKGQpIC0+XG4gICAgICAgICAgaXRlbSA9IGNvdW50cmllcy5maWx0ZXIgKGNvdW50cnkpIC0+IGNvdW50cnkuY29kZSA9PSBkLmNvZGVcbiAgICAgICAgICBkLnZhbHVlID0gK2QuY2FzZXNfcG9wdWxhdGlvblxuICAgICAgICAgIGQuY2FzZXMgPSArZC5jYXNlc1xuICAgICAgICAgIGlmIGl0ZW1cbiAgICAgICAgICAgIGQubmFtZSA9IGl0ZW1bMF1bJ25hbWVfJytsYW5nXVxuICAgICAgICAgICAgZC5jb2RlX251bSA9IGl0ZW1bMF1bJ2NvZGVfbnVtJ11cbiAgICAgICAgIyBzZXQgZ3JhcGhcbiAgICAgICAgZ3JhcGggPSBuZXcgd2luZG93Lk1hcEdyYXBoKCd2YWNjaW5lLWJjZy1jYXNlcy1ncmFwaCcsXG4gICAgICAgICAgYXNwZWN0UmF0aW86IDAuNTYyNVxuICAgICAgICAgIG1hcmdpbjogXG4gICAgICAgICAgICB0b3A6IDYwXG4gICAgICAgICAgICBib3R0b206IDBcbiAgICAgICAgICBsZWdlbmQ6IHRydWUpXG4gICAgICAgIGdyYXBoLmdldExlZ2VuZERhdGEgPSAtPiBbMCwyMDAsNDAwLDYwMCw4MDBdXG4gICAgICAgIGdyYXBoLnNldERhdGEgZGF0YSwgbWFwXG4gICAgICAgICQod2luZG93KS5yZXNpemUgZ3JhcGgub25SZXNpemVcblxuXG4gIHNldHVwVmFjY2luZUJjZ1N0b2Nrb3V0c01hcCA9IC0+XG4gICAgZDMucXVldWUoKVxuICAgICAgLmRlZmVyIGQzLmNzdiwgIGJhc2V1cmwrJy9kYXRhL2JjZy1zdG9ja291dHMuY3N2J1xuICAgICAgLmRlZmVyIGQzLmNzdiwgIGJhc2V1cmwrJy9kYXRhL2NvdW50cmllcy5jc3YnXG4gICAgICAuZGVmZXIgZDMuanNvbiwgYmFzZXVybCsnL2RhdGEvbWFwLXdvcmxkLTExMC5qc29uJ1xuICAgICAgLmF3YWl0IChlcnJvciwgZGF0YSwgY291bnRyaWVzLCBtYXApIC0+XG4gICAgICAgIHllYXJzID0gZDMucmFuZ2UgMjAwNiwgMjAxNiAgICMgc2V0IHllYXJzIGFycmF5XG4gICAgICAgICMgYWRkIGNhc2VzIHRvIGVhY2ggY291bnRyeVxuICAgICAgICBkYXRhLmZvckVhY2ggKGQpIC0+XG4gICAgICAgICAgaXRlbSA9IGNvdW50cmllcy5maWx0ZXIgKGNvdW50cnkpIC0+IGNvdW50cnkuY29kZSA9PSBkLmNvZGVcbiAgICAgICAgICBkLnZhbHVlID0gK2QudmFsdWVcbiAgICAgICAgICBkLnllYXJzID0gJydcbiAgICAgICAgICAjIGdldCBsaXN0IG9mIHllYXJzIHdpdGggc3RvY2tvdXRzXG4gICAgICAgICAgeWVhcnMuZm9yRWFjaCAoeWVhcikgLT5cbiAgICAgICAgICAgIGlmIGRbeWVhcl0gPT0gJzInIHx8IGRbeWVhcl0gPT0gJzMnICAjIGNoZWNrIHZhbHVlcyAyIG9yIDMgKG5hdGlvbmFsIHN0b2Nrb3V0cyBjb2RlKVxuICAgICAgICAgICAgICBkLnllYXJzICs9IHllYXIrJywnXG4gICAgICAgICAgICBkZWxldGUgZFt5ZWFyXVxuICAgICAgICAgIGlmIGl0ZW1cbiAgICAgICAgICAgIGQubmFtZSA9IGl0ZW1bMF1bJ25hbWVfJytsYW5nXVxuICAgICAgICAgICAgZC5jb2RlX251bSA9IGl0ZW1bMF1bJ2NvZGVfbnVtJ11cbiAgICAgICAgIyBzZXQgZ3JhcGhcbiAgICAgICAgZ3JhcGggPSBuZXcgd2luZG93Lk1hcEdyYXBoKCd2YWNjaW5lLWJjZy1zdG9ja291dHMnLFxuICAgICAgICAgIGFzcGVjdFJhdGlvOiAwLjU2MjVcbiAgICAgICAgICBtYXJnaW46IFxuICAgICAgICAgICAgdG9wOiA2MFxuICAgICAgICAgICAgYm90dG9tOiAwXG4gICAgICAgICAgbGVnZW5kOiB0cnVlKVxuICAgICAgICBncmFwaC5mb3JtYXRGbG9hdCA9IGdyYXBoLmZvcm1hdEludGVnZXJcbiAgICAgICAgZ3JhcGguZ2V0TGVnZW5kRGF0YSA9IC0+IFswLDIsNCw2LDhdXG4gICAgICAgIGdyYXBoLnNldFRvb2x0aXBEYXRhID0gKGQpIC0+XG4gICAgICAgICAgZ3JhcGguJHRvb2x0aXBcbiAgICAgICAgICAgIC5maW5kICcudG9vbHRpcC1pbm5lciAudGl0bGUnXG4gICAgICAgICAgICAuaHRtbCBkLm5hbWVcbiAgICAgICAgICBncmFwaC4kdG9vbHRpcFxuICAgICAgICAgICAgLmZpbmQgJy5kZXNjcmlwdGlvbiwgLnllYXJzLWNlbGxzJ1xuICAgICAgICAgICAgLmhpZGUoKVxuICAgICAgICAgIGlmIGQudmFsdWUgPT0gMFxuICAgICAgICAgICAgZ3JhcGguJHRvb2x0aXBcbiAgICAgICAgICAgICAgLmZpbmQgJy5kZXNjcmlwdGlvbi16ZXJvJ1xuICAgICAgICAgICAgICAuc2hvdygpXG4gICAgICAgICAgZWxzZSBpZiBkLnZhbHVlID09IDFcbiAgICAgICAgICAgIGdyYXBoLiR0b29sdGlwXG4gICAgICAgICAgICAgIC5maW5kICcuZGVzY3JpcHRpb24tb25lIC52YWx1ZSdcbiAgICAgICAgICAgICAgLmh0bWwgZC55ZWFycy5zcGxpdCgnLCcpWzBdXG4gICAgICAgICAgICBncmFwaC4kdG9vbHRpcFxuICAgICAgICAgICAgICAuZmluZCAnLmRlc2NyaXB0aW9uLW9uZSdcbiAgICAgICAgICAgICAgLnNob3coKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGdyYXBoLiR0b29sdGlwIFxuICAgICAgICAgICAgICAuZmluZCAnLmRlc2NyaXB0aW9uLW11bHRpcGxlIC52YWx1ZSdcbiAgICAgICAgICAgICAgLmh0bWwgZ3JhcGguZm9ybWF0SW50ZWdlcihkLnZhbHVlKVxuICAgICAgICAgICAgZ3JhcGguJHRvb2x0aXBcbiAgICAgICAgICAgICAgLmZpbmQgJy55ZWFycy1jZWxscyBsaSdcbiAgICAgICAgICAgICAgLnRvZ2dsZUNsYXNzICdhY3RpdmUnLCBmYWxzZVxuICAgICAgICAgICAgZC55ZWFycy5zcGxpdCgnLCcpLmZvckVhY2ggKHllYXIpIC0+XG4gICAgICAgICAgICAgIGdyYXBoLiR0b29sdGlwXG4gICAgICAgICAgICAgICAgLmZpbmQgJy55ZWFycy1jZWxscyBsaVtkYXRhLXllYXI9XCInK3llYXIrJ1wiXSdcbiAgICAgICAgICAgICAgICAudG9nZ2xlQ2xhc3MgJ2FjdGl2ZScsIHRydWVcbiAgICAgICAgICAgIGdyYXBoLiR0b29sdGlwXG4gICAgICAgICAgICAgIC5maW5kICcuZGVzY3JpcHRpb24tbXVsdGlwbGUsIC55ZWFycy1jZWxscydcbiAgICAgICAgICAgICAgLnNob3coKVxuICAgICAgICBncmFwaC5zZXREYXRhIGRhdGEsIG1hcFxuICAgICAgICAkKHdpbmRvdykucmVzaXplIGdyYXBoLm9uUmVzaXplXG5cbiAgc2V0dXBWYWNjaW5lRGlzZWFzZUhlYXRtYXBHcmFwaCA9IC0+XG4gICAgZDMucXVldWUoKVxuICAgICAgLmRlZmVyIGQzLmNzdiwgYmFzZXVybCsnL2RhdGEvZGlzZWFzZXMtY2FzZXMtbWVhc2xlcy5jc3YnXG4gICAgICAuZGVmZXIgZDMuY3N2LCBiYXNldXJsKycvZGF0YS9wb3B1bGF0aW9uLmNzdidcbiAgICAgIC5hd2FpdCAoZXJyb3IsIGRhdGFfY2FzZXMsIGRhdGFfcG9wdWxhdGlvbikgLT5cbiAgICAgICAgZGVsZXRlIGRhdGFfY2FzZXMuY29sdW1ucyAgIyB3ZSBkb24ndCBuZWVkIHRoZSBjb2x1bW5zIGF0dHJpYnV0ZVxuICAgICAgICBkYXRhX2Nhc2VzLmZvckVhY2ggKGQpIC0+XG4gICAgICAgICAgaWYgZC55ZWFyX2ludHJvZHVjdGlvblxuICAgICAgICAgICAgZC55ZWFyX2ludHJvZHVjdGlvbiA9ICtkLnllYXJfaW50cm9kdWN0aW9uLnJlcGxhY2UoJ3ByaW9yIHRvJywgJycpXG4gICAgICAgICAgZC5jYXNlcyA9IHt9XG4gICAgICAgICAgZC52YWx1ZXMgPSB7fVxuICAgICAgICAgIGQubmFtZSA9IGdldENvdW50cnlOYW1lIGRhdGFfcG9wdWxhdGlvbiwgZC5jb2RlLCBsYW5nXG4gICAgICAgICAgIyBzZXQgdmFsdWVzIGFzIGNhc2VzLzEwMDAgaW5oYWJpdGFudHNcbiAgICAgICAgICBwb3B1bGF0aW9uSXRlbSA9IGRhdGFfcG9wdWxhdGlvbi5maWx0ZXIgKGNvdW50cnkpIC0+IGNvdW50cnkuY29kZSA9PSBkLmNvZGVcbiAgICAgICAgICBpZiBwb3B1bGF0aW9uSXRlbS5sZW5ndGggPiAwXG4gICAgICAgICAgICB5ZWFyID0gMTk4MFxuICAgICAgICAgICAgd2hpbGUgeWVhciA8IDIwMTZcbiAgICAgICAgICAgICAgaWYgZFt5ZWFyXVxuICAgICAgICAgICAgICAgIHBvcHVsYXRpb24gPSArcG9wdWxhdGlvbkl0ZW1bMF1beWVhcl1cbiAgICAgICAgICAgICAgICBpZiBwb3B1bGF0aW9uICE9IDBcbiAgICAgICAgICAgICAgICAgIGQuY2FzZXNbeWVhcl0gPSArZFt5ZWFyXVxuICAgICAgICAgICAgICAgICAgZC52YWx1ZXNbeWVhcl0gPSAxMDAwMDAgKiArZFt5ZWFyXSAvIHBvcHVsYXRpb25cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAjY29uc29sZS5sb2coJ05vIGhheSBkYXRvcyBkZSBwb2JsYWNpw7NuIHBhcmEnLCBkLm5hbWUsICdlbiAnLCB5ZWFyLCBkW3llYXJdKTtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZygnTm8gaGF5IGRhdG9zIGRlIGNhc29zIGRlICcgKyBkLmRpc2Vhc2UgKyAnIHBhcmEnLCBkLm5hbWUsICdlbiAnLCB5ZWFyLCAnOicsIGRbeWVhcl0sIHR5cGVvZiBkW3llYXJdKTtcbiAgICAgICAgICAgICAgZGVsZXRlIGRbeWVhcl1cbiAgICAgICAgICAgICAgeWVhcisrXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS5sb2cgJ05vIGhheSBkYXRvcyBkZSBwb2JsYWNpw7NuIHBhcmEnLCBkLm5hbWVcbiAgICAgICAgICAjIEdldCB0b3RhbCBjYXNlcyBieSBjb3VudHJ5ICYgZGlzZWFzZVxuICAgICAgICAgIGQudG90YWwgPSBkMy52YWx1ZXMoZC52YWx1ZXMpLnJlZHVjZSgoKGEsIGIpIC0+IGEgKyBiKSwgMClcbiAgICAgICAgIyBGaWx0ZXIgYnkgc2VsZWN0ZWQgY291bnRyaWVzICYgZGlzZWFzZVxuICAgICAgICBzZXR1cEhlYXRNYXBHcmFwaCAndmFjY2luZXMtbWVhc2xlcy1ncmFwaC0xJywgZGF0YV9jYXNlcywgWydGSU4nLCdIVU4nLCdQUlQnLCdVUlknLCdNRVgnLCdDT0wnXSwgdHJ1ZVxuICAgICAgICBzZXR1cEhlYXRNYXBHcmFwaCAndmFjY2luZXMtbWVhc2xlcy1ncmFwaC0yJywgZGF0YV9jYXNlcywgWydJUlEnLCdCR1InLCdNTkcnLCdaQUYnLCdGUkEnLCdHRU8nXSwgZmFsc2VcblxuXG4gICMgSW1tdW5pemF0aW9uIENvdmVyYWdlIER5bmFtaWMgTGluZSBHcmFwaCAod2UgY2FuIHNlbGVjdCBkaWZlcmVudGUgZGlzZWFzZXMgJiBjb3VudHJpZXMpXG4gIHNldHVwSW1tdW5pemF0aW9uQ292ZXJhZ2VEeW5hbWljTGluZUdyYXBoID0gLT5cbiAgICBncmFwaCA9IG5ldyB3aW5kb3cuTGluZUdyYXBoKCdpbW11bml6YXRpb24tY292ZXJhZ2UtZ3JhcGgtYWxsJyxcbiAgICAgIGtleTogXG4gICAgICAgIGlkOiAnY29kZSdcbiAgICAgICAgeDogJ25hbWUnXG4gICAgICBsYWJlbDogdHJ1ZVxuICAgICAgbWFyZ2luOiB0b3A6IDIwKVxuICAgIGdyYXBoLmdldFNjYWxlWURvbWFpbiA9IChkKSAtPiBbMCwgMTAwXVxuICAgIGdyYXBoLnlBeGlzLnRpY2tWYWx1ZXMgWzAsIDI1LCA1MCwgNzUsIDEwMF1cbiAgICBkMy5jc3YgYmFzZXVybCsnL2RhdGEvaW1tdW5pemF0aW9uLWNvdmVyYWdlLmNzdicsIChlcnJvciwgZGF0YSkgLT5cbiAgICAgIGdyYXBoLnNldERhdGEgZGF0YS5maWx0ZXIoKGQpIC0+IGQudmFjY2luZSA9PSAkKCcjaW1tdW5pemF0aW9uLWNvdmVyYWdlLXZhY2NpbmUtc2VsZWN0b3InKS52YWwoKSlcbiAgICAgICMgVXBkYXRlIGRhdGEgYmFzZWQgb24gc2VsZWN0ZWQgdmFjY2luZVxuICAgICAgJCgnI2ltbXVuaXphdGlvbi1jb3ZlcmFnZS12YWNjaW5lLXNlbGVjdG9yJykuY2hhbmdlIChlKSAtPlxuICAgICAgICBncmFwaC5zZXREYXRhIGRhdGEuZmlsdGVyKChkKSAtPiBkLnZhY2NpbmUgPT0gJCgnI2ltbXVuaXphdGlvbi1jb3ZlcmFnZS12YWNjaW5lLXNlbGVjdG9yJykudmFsKCkpXG4gICAgICAgICQoJyNpbW11bml6YXRpb24tY292ZXJhZ2UtY291bnRyeS0xLXNlbGVjdG9yJykudHJpZ2dlcignY2hhbmdlJylcbiAgICAgICMgVXBkYXRlIGFjdGl2ZSBjb3VudHJpZXNcbiAgICAgICQoJyNpbW11bml6YXRpb24tY292ZXJhZ2UtY291bnRyeS0xLXNlbGVjdG9yLCAjaW1tdW5pemF0aW9uLWNvdmVyYWdlLWNvdW50cnktMi1zZWxlY3RvcicpLmNoYW5nZSAoZSkgLT5cbiAgICAgICAgJCgnI2ltbXVuaXphdGlvbi1jb3ZlcmFnZS1ncmFwaC1hbGwnKS5maW5kKCcubGluZS1sYWJlbCwgLmxpbmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJyNpbW11bml6YXRpb24tY292ZXJhZ2UtZ3JhcGgtYWxsICNsaW5lLScrJCgnI2ltbXVuaXphdGlvbi1jb3ZlcmFnZS1jb3VudHJ5LTEtc2VsZWN0b3InKS52YWwoKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICQoJyNpbW11bml6YXRpb24tY292ZXJhZ2UtZ3JhcGgtYWxsICNsaW5lLScrJCgnI2ltbXVuaXphdGlvbi1jb3ZlcmFnZS1jb3VudHJ5LTItc2VsZWN0b3InKS52YWwoKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICQoJyNpbW11bml6YXRpb24tY292ZXJhZ2UtZ3JhcGgtYWxsICNsaW5lLWxhYmVsLScrJCgnI2ltbXVuaXphdGlvbi1jb3ZlcmFnZS1jb3VudHJ5LTEtc2VsZWN0b3InKS52YWwoKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICQoJyNpbW11bml6YXRpb24tY292ZXJhZ2UtZ3JhcGgtYWxsICNsaW5lLWxhYmVsLScrJCgnI2ltbXVuaXphdGlvbi1jb3ZlcmFnZS1jb3VudHJ5LTItc2VsZWN0b3InKS52YWwoKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAkKCcjaW1tdW5pemF0aW9uLWNvdmVyYWdlLWNvdW50cnktMS1zZWxlY3RvcicpLnRyaWdnZXIoJ2NoYW5nZScpXG4gICAgJCh3aW5kb3cpLnJlc2l6ZSBncmFwaC5vblJlc2l6ZVxuXG4gICMgSW1tdW5pemF0aW9uIENvdmVyYWdlIE11bHRpcGxlIFNtYWxsIEdyYXBoICh3aWR0aCBzZWxlY3RlZCBjb3VudHJpZXMpXG4gIHNldHVwSW1tdW5pemF0aW9uQ292ZXJhZ2VNdWx0aXBsZVNtYWxsR3JhcGggPSAtPlxuICAgIGN1cnJlbnRfY291bnRyaWVzID0gWydMS0EnLCdEWkEnLCdERVUnLCdETksnLCdGUkEnXVxuICAgIGdyYXBocyA9IFtdXG4gICAgZDMucXVldWUoKVxuICAgICAgLmRlZmVyIGQzLmNzdiwgYmFzZXVybCsnL2RhdGEvaW1tdW5pemF0aW9uLWNvdmVyYWdlLW1jdjIuY3N2J1xuICAgICAgLmRlZmVyIGQzLmNzdiwgYmFzZXVybCsnL2RhdGEvY291bnRyaWVzLmNzdidcbiAgICAgIC5kZWZlciBkMy5qc29uLCAnaHR0cDovL2ZyZWVnZW9pcC5uZXQvanNvbi8nXG4gICAgICAuYXdhaXQgKGVycm9yLCBkYXRhLCBjb3VudHJpZXMsIGxvY2F0aW9uKSAtPlxuICAgICAgICAjIFNldHVwIHVzZXIgY291bnRyeVxuICAgICAgICBpZiBsb2NhdGlvblxuICAgICAgICAgIHVzZXJfY291bnRyeSA9IGNvdW50cmllcy5maWx0ZXIgKGQpIC0+IGQuY29kZTIgPT0gbG9jYXRpb24uY291bnRyeV9jb2RlXG4gICAgICAgICAgaWYgdXNlcl9jb3VudHJ5IGFuZCB1c2VyX2NvdW50cnkubGVuZ3RoID4gMCBhbmQgdXNlcl9jb3VudHJ5WzBdLmNvZGVcbiAgICAgICAgICAgIGlmIGN1cnJlbnRfY291bnRyaWVzLmluZGV4T2YodXNlcl9jb3VudHJ5WzBdLmNvZGUpID09IC0xXG4gICAgICAgICAgICAgIGN1cnJlbnRfY291bnRyaWVzWzJdID0gdXNlcl9jb3VudHJ5WzBdLmNvZGVcbiAgICAgICAgICAgICAgZWwgPSAkKCcjaW1tdW5pemF0aW9uLWNvdmVyYWdlLWdyYXBoIC5ncmFwaC1jb250YWluZXInKS5lcSgyKVxuICAgICAgICAgICAgICBlbC5maW5kKCdwJykuaHRtbCB1c2VyX2NvdW50cnlbMF1bJ25hbWVfJytsYW5nXVxuICAgICAgICAgICAgICBlbC5maW5kKCcubGluZS1ncmFwaCcpLmF0dHIgJ2lkJywgJ2ltbXVuaXphdGlvbi1jb3ZlcmFnZS0nK3VzZXJfY291bnRyeVswXS5jb2RlLnRvTG93ZXJDYXNlKCkrJy1ncmFwaCdcbiAgICAgICAgIyBsb29wIHRocm91Z2ggZWFjaCBzZWxlY3RlZCBjb3VudHJ5ICAgXG4gICAgICAgIGN1cnJlbnRfY291bnRyaWVzLmZvckVhY2ggKGNvdW50cnksaSkgLT5cbiAgICAgICAgICAjIGdldCBjdXJyZW50IGRpc2Vhc2UgZGF0YVxuICAgICAgICAgIGNvdW50cnlfZGF0YSA9IGRhdGFcbiAgICAgICAgICAgIC5maWx0ZXIgKGQpIC0+IGQuY29kZSA9PSBjb3VudHJ5XG4gICAgICAgICAgICAubWFwICAgIChkKSAtPiAkLmV4dGVuZCh7fSwgZClcbiAgICAgICAgICBjb3VudHJ5X2RhdGEuZm9yRWFjaCAoZCkgLT5cbiAgICAgICAgICAgIGRlbGV0ZSBkWycyMDAxJ11cbiAgICAgICAgICAgIGRlbGV0ZSBkWycyMDAyJ11cbiAgICAgICAgICAjIHNldHVwIGxpbmUgY2hhcnRcbiAgICAgICAgICBncmFwaCA9IG5ldyB3aW5kb3cuTGluZUdyYXBoKCdpbW11bml6YXRpb24tY292ZXJhZ2UtJytjb3VudHJ5LnRvTG93ZXJDYXNlKCkrJy1ncmFwaCcsXG4gICAgICAgICAgICBpc0FyZWE6IHRydWVcbiAgICAgICAgICAgIGtleTogXG4gICAgICAgICAgICAgIHg6ICduYW1lJ1xuICAgICAgICAgICAgICBpZDogJ2NvZGUnKVxuICAgICAgICAgIGdyYXBocy5wdXNoIGdyYXBoXG4gICAgICAgICAgZ3JhcGgueUZvcm1hdCA9IChkKSAtPiBkKyclJ1xuICAgICAgICAgIGdyYXBoLmdldFNjYWxlWURvbWFpbiA9IChkKSAtPiBbMCwgMTAwXVxuICAgICAgICAgIGdyYXBoLnlBeGlzLnRpY2tWYWx1ZXMgWzUwXVxuICAgICAgICAgIGdyYXBoLnhBeGlzLnRpY2tWYWx1ZXMgWzIwMDMsMjAxNV1cbiAgICAgICAgICBncmFwaC5hZGRNYXJrZXJcbiAgICAgICAgICAgIHZhbHVlOiA5NVxuICAgICAgICAgICAgbGFiZWw6IGlmIGklMiAhPSAwIHRoZW4gJycgZWxzZSBpZiBsYW5nID09ICdlcycgdGhlbiAnTml2ZWwgZGUgcmViYcOxbycgZWxzZSAnSGVyZCBpbW11bml0eSdcbiAgICAgICAgICAgIGFsaWduOiAnbGVmdCdcbiAgICAgICAgICAjIHNob3cgbGFzdCB5ZWFyIGxhYmVsXG4gICAgICAgICAgZ3JhcGguJGVsLm9uICdkcmF3LWNvbXBsZXRlJywgKGUpIC0+XG4gICAgICAgICAgICBncmFwaC5zZXRMYWJlbCAyMDE1XG4gICAgICAgICAgICBncmFwaC5jb250YWluZXIuc2VsZWN0KCcueC5heGlzJylcbiAgICAgICAgICAgICAgLnNlbGVjdEFsbCgnLnRpY2snKVxuICAgICAgICAgICAgICAuc3R5bGUgJ2Rpc3BsYXknLCAnYmxvY2snXG4gICAgICAgICAgICBncmFwaC5jb250YWluZXIuc2VsZWN0KCcudGljay1ob3ZlcicpXG4gICAgICAgICAgICAgIC5zdHlsZSAnZGlzcGxheScsICdub25lJ1xuICAgICAgICAgIGdyYXBoLnNldERhdGEgY291bnRyeV9kYXRhXG4gICAgICAgICAgIyBsaXN0ZW4gdG8geWVhciBjaGFuZ2VzICYgdXBkYXRlIGVhY2ggZ3JhcGggbGFiZWxcbiAgICAgICAgICBncmFwaC4kZWwub24gJ2NoYW5nZS15ZWFyJywgKGUsIHllYXIpIC0+XG4gICAgICAgICAgICBncmFwaHMuZm9yRWFjaCAoZykgLT5cbiAgICAgICAgICAgICAgdW5sZXNzIGcgPT0gZ3JhcGhcbiAgICAgICAgICAgICAgICBnLnNldExhYmVsIHllYXJcbiAgICAgICAgICBncmFwaC4kZWwub24gJ21vdXNlb3V0JywgKGUpIC0+XG4gICAgICAgICAgICBncmFwaHMuZm9yRWFjaCAoZykgLT5cbiAgICAgICAgICAgICAgdW5sZXNzIGcgPT0gZ3JhcGhcbiAgICAgICAgICAgICAgICBnLmhpZGVMYWJlbCgpXG4gICAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZSBncmFwaC5vblJlc2l6ZVxuICAgICAgIFxuXG4gICMgV29ybGQgQ2FzZXMgTXVsdGlwbGUgU21hbGxcbiAgc2V0dXBXb3JsZENhc2VzTXVsdGlwbGVTbWFsbEdyYXBoID0gLT5cbiAgICBkaXNlYXNlcyA9IFsnZGlwaHRlcmlhJywgJ21lYXNsZXMnLCdwZXJ0dXNzaXMnLCdwb2xpbycsJ3RldGFudXMnXVxuICAgIGdyYXBocyA9IFtdXG4gICAgIyBMb2FkIGRhdGFcbiAgICBkMy5jc3YgYmFzZXVybCsnL2RhdGEvZGlzZWFzZXMtY2FzZXMtd29ybGQuY3N2JywgKGVycm9yLCBkYXRhKSAtPlxuICAgICAgIyBHZXQgbWF4IHZhbHVlIHRvIGNyZWF0ZSBhIGNvbW1vbiB5IHNjYWxlXG4gICAgICBtYXhWYWx1ZTEgPSBkMy5tYXggZGF0YSwgKGQpIC0+IGQzLm1heChkMy52YWx1ZXMoZCksIChlKSAtPiArZSlcbiAgICAgIG1heFZhbHVlMiA9IDEwMDAwMCAjZDMubWF4IGRhdGEuZmlsdGVyKChkKSAtPiBbJ2RpcGh0ZXJpYScsJ3BvbGlvJywndGV0YW51cyddLmluZGV4T2YoZC5kaXNlYXNlKSAhPSAtMSksIChkKSAtPiBkMy5tYXgoZDMudmFsdWVzKGQpLCAoZSkgLT4gK2UpXG4gICAgICAjIGNyZWF0ZSBhIGxpbmUgZ3JhcGggZm9yIGVhY2ggZGlzZWFzZVxuICAgICAgZGlzZWFzZXMuZm9yRWFjaCAoZGlzZWFzZSkgLT5cbiAgICAgICAgIyBnZXQgY3VycmVudCBkaXNlYXNlIGRhdGFcbiAgICAgICAgZGlzZWFzZV9kYXRhID0gZGF0YVxuICAgICAgICAgIC5maWx0ZXIgKGQpIC0+IGQuZGlzZWFzZSA9PSBkaXNlYXNlXG4gICAgICAgICAgLm1hcCAgICAoZCkgLT4gJC5leHRlbmQoe30sIGQpXG4gICAgICAgICMgc2V0dXAgbGluZSBjaGFydFxuICAgICAgICBncmFwaCA9IG5ldyB3aW5kb3cuTGluZUdyYXBoKGRpc2Vhc2UrJy13b3JsZC1ncmFwaCcsXG4gICAgICAgICAgaXNBcmVhOiB0cnVlXG4gICAgICAgICAgbWFyZ2luOiBsZWZ0OiAyMFxuICAgICAgICAgIGtleTogXG4gICAgICAgICAgICB4OiAnZGlzZWFzZSdcbiAgICAgICAgICAgIGlkOiAnZGlzZWFzZScpXG4gICAgICAgIGdyYXBocy5wdXNoIGdyYXBoXG4gICAgICAgIGdyYXBoLnhBeGlzLnRpY2tWYWx1ZXMgWzE5ODAsIDIwMTVdXG4gICAgICAgIGdyYXBoLnlBeGlzLnRpY2tzKDIpLnRpY2tGb3JtYXQgZDMuZm9ybWF0KCcuMHMnKVxuICAgICAgICBncmFwaC55Rm9ybWF0ID0gZDMuZm9ybWF0KCcuMnMnKVxuICAgICAgICBncmFwaC5nZXRTY2FsZVlEb21haW4gPSAtPiByZXR1cm4gWzAsIGlmIGRpc2Vhc2UgPT0gJ21lYXNsZXMnIG9yIGRpc2Vhc2UgPT0gJ3BlcnR1c3NpcycgdGhlbiBtYXhWYWx1ZTEgZWxzZSBtYXhWYWx1ZTJdXG4gICAgICAgIGdyYXBoLnNldERhdGEgZGlzZWFzZV9kYXRhXG4gICAgICAgICMgbGlzdGVuIHRvIHllYXIgY2hhbmdlcyAmIHVwZGF0ZSBlYWNoIGdyYXBoIGxhYmVsXG4gICAgICAgIGdyYXBoLiRlbC5vbiAnY2hhbmdlLXllYXInLCAoZSwgeWVhcikgLT5cbiAgICAgICAgICBncmFwaHMuZm9yRWFjaCAoZykgLT5cbiAgICAgICAgICAgIHVubGVzcyBnID09IGdyYXBoXG4gICAgICAgICAgICAgIGcuc2V0TGFiZWwgeWVhclxuICAgICAgICBncmFwaC4kZWwub24gJ21vdXNlb3V0JywgKGUpIC0+XG4gICAgICAgICAgZ3JhcGhzLmZvckVhY2ggKGcpIC0+XG4gICAgICAgICAgICB1bmxlc3MgZyA9PSBncmFwaFxuICAgICAgICAgICAgICBnLmhpZGVMYWJlbCgpXG4gICAgICAgICQod2luZG93KS5yZXNpemUgZ3JhcGgub25SZXNpemVcblxuICBzZXR1cEltbXVuaXphdGlvbkRpc2Vhc2VCYXJHcmFwaCA9IC0+XG4gICAgIyBMb2FkIGRhdGFcbiAgICBkMy5xdWV1ZSgpXG4gICAgICAuZGVmZXIgZDMuY3N2LCBiYXNldXJsKycvZGF0YS9pbW11bml6YXRpb24tY292ZXJhZ2UuY3N2J1xuICAgICAgLmRlZmVyIGQzLmNzdiwgYmFzZXVybCsnL2RhdGEvY291bnRyaWVzLmNzdidcbiAgICAgIC5kZWZlciBkMy5qc29uLCAnaHR0cDovL2ZyZWVnZW9pcC5uZXQvanNvbi8nXG4gICAgICAuYXdhaXQgKGVycm9yLCBkYXRhLCBjb3VudHJpZXMsIGxvY2F0aW9uKSAtPlxuICAgICAgICAjIFNldHVwIHVzZXIgY291bnRyeVxuICAgICAgICBpZiBsb2NhdGlvblxuICAgICAgICAgIHVzZXJfY291bnRyeSA9IGNvdW50cmllcy5maWx0ZXIgKGQpIC0+IGQuY29kZTIgPT0gbG9jYXRpb24uY291bnRyeV9jb2RlXG4gICAgICAgICAgbG9jYXRpb24uY29kZSA9IHVzZXJfY291bnRyeVswXS5jb2RlXG4gICAgICAgICAgbG9jYXRpb24ubmFtZSA9IHVzZXJfY291bnRyeVswXVsnbmFtZV8nK2xhbmddXG4gICAgICAgICMgRmlsdGVyIGRhdGFcbiAgICAgICAgaGVyZEltbXVuaXR5ID0gXG4gICAgICAgICAgJ01DVjEnOiA5NVxuICAgICAgICAgICdQb2wzJzogODBcbiAgICAgICAgICAnRFRQMyc6IDgwXG4gICAgICAgIGRhdGEgPSBkYXRhLmZpbHRlciAoZCkgLT4gZXhjbHVkZWRDb3VudHJpZXMuaW5kZXhPZihkLmNvZGUpID09IC0xXG4gICAgICAgICMgRGF0YSBwYXJzZSAmIHNvcnRpbmcgZnVudGlvbnNcbiAgICAgICAgZGF0YV9wYXJzZXIgPSAoZCkgLT5cbiAgICAgICAgICBvYmogPSBcbiAgICAgICAgICAgIGtleTogICBkLmNvZGVcbiAgICAgICAgICAgIG5hbWU6ICBnZXRDb3VudHJ5TmFtZShjb3VudHJpZXMsIGQuY29kZSwgbGFuZylcbiAgICAgICAgICAgIHZhbHVlOiArZFsnMjAxNSddXG4gICAgICAgICAgaWYgbG9jYXRpb24gYW5kIGQuY29kZSA9PSBsb2NhdGlvbi5jb2RlXG4gICAgICAgICAgICBvYmouYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgIHJldHVybiBvYmpcbiAgICAgICAgZGF0YV9zb3J0ID0gKGEsYikgLT4gYi52YWx1ZS1hLnZhbHVlXG4gICAgICAgICMgbG9vcCB0aHJvdWdoIGVhY2ggZ3JhcGhcbiAgICAgICAgJCgnLmltbXVuaXphdGlvbi1jb3ZlcmFnZS1kaXNlYXNlLWdyYXBoJykuZWFjaCAtPlxuICAgICAgICAgICRlbCAgICAgPSAkKHRoaXMpXG4gICAgICAgICAgZGlzZWFzZSA9ICRlbC5kYXRhKCdkaXNlYXNlJylcbiAgICAgICAgICB2YWNjaW5lID0gJGVsLmRhdGEoJ3ZhY2NpbmUnKVxuICAgICAgICAgICMgR2V0IGdyYXBoIGRhdGEgJiB2YWx1ZVxuICAgICAgICAgIGdyYXBoX2RhdGEgPSBkYXRhXG4gICAgICAgICAgICAuZmlsdGVyKChkKSAtPiBkLnZhY2NpbmUgPT0gdmFjY2luZSBhbmQgZFsnMjAxNSddICE9ICcnKVxuICAgICAgICAgICAgLm1hcChkYXRhX3BhcnNlcilcbiAgICAgICAgICAgIC5zb3J0KGRhdGFfc29ydClcbiAgICAgICAgICBpZiBsb2NhdGlvblxuICAgICAgICAgICAgZ3JhcGhfdmFsdWUgPSBncmFwaF9kYXRhLmZpbHRlciAoZCkgLT4gZC5rZXkgPT0gbG9jYXRpb24uY29kZVxuICAgICAgICAgICMgU2V0dXAgZ3JhcGhcbiAgICAgICAgICBncmFwaCA9IG5ldyB3aW5kb3cuQmFyR3JhcGgoZGlzZWFzZSsnLWltbXVuaXphdGlvbi1iYXItZ3JhcGgnLFxuICAgICAgICAgICAgYXNwZWN0UmF0aW86IDAuMjVcbiAgICAgICAgICAgIGxhYmVsOlxuICAgICAgICAgICAgICBmb3JtYXQ6IChkKSAtPiArZCsnJSdcbiAgICAgICAgICAgIGtleTogeDogJ25hbWUnXG4gICAgICAgICAgICBtYXJnaW46XG4gICAgICAgICAgICAgIHRvcDogMjApXG4gICAgICAgICAgbWFya2VyID0gXG4gICAgICAgICAgICB2YWx1ZTogaGVyZEltbXVuaXR5W3ZhY2NpbmVdXG4gICAgICAgICAgICBsYWJlbDogaWYgbGFuZyA9PSAnZXMnIHRoZW4gJ05pdmVsIGRlIHJlYmHDsW8nIGVsc2UgJ0hlcmQgaW1tdW5pdHknXG4gICAgICAgICAgaWYgdmFjY2luZSA9PSAnRFRQMydcbiAgICAgICAgICAgIG1hcmtlci5sYWJlbCA9IGlmIGxhbmcgPT0gJ2VzJyB0aGVuICdSZWNvbWVuZGFjacOzbiBPTVMnIGVsc2UgJ1dITyByZWNvbW1lbmRhdGlvbidcbiAgICAgICAgICBncmFwaFxuICAgICAgICAgICAgLmFkZE1hcmtlciBtYXJrZXJcbiAgICAgICAgICAgIC5zZXREYXRhIGdyYXBoX2RhdGFcbiAgICAgICAgICAjIFNldHVwIGdyYXBoIHZhbHVlXG4gICAgICAgICAgaWYgZ3JhcGhfdmFsdWUgYW5kIGdyYXBoX3ZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICRlbC5maW5kKCcuaW1tdW5pemF0aW9uLWNvdW50cnknKS5odG1sIGxvY2F0aW9uLm5hbWVcbiAgICAgICAgICAgICRlbC5maW5kKCcuaW1tdW5pemF0aW9uLWRhdGEnKS5odG1sICc8c3Ryb25nPicgKyBncmFwaF92YWx1ZVswXS52YWx1ZSArICclPC9zdHJvbmc+J1xuICAgICAgICAgICAgJGVsLmZpbmQoJy5pbW11bml6YXRpb24tZGVzY3JpcHRpb24nKS5zaG93KClcbiAgICAgICAgICAjIE9uIHJlc2l6ZVxuICAgICAgICAgICQod2luZG93KS5yZXNpemUgLT4gZ3JhcGgub25SZXNpemUoKVxuXG4gIHNldHVwVmFjY2luZVByaWNlc0dyYXBoID0gLT5cbiAgICB2YWNjaW5lcyA9IFsncG5ldW1vMTMnLCdCQ0cnLCdJUFYnLCdNTVInLCdIZXBCLXBlZGnDoXRyaWNhJywnVlBIJywnRFRQYS1JUFYtSElCJywnRFRhUCcsJ1RkYXAnLCdEVFAnXVxuICAgIGQzLmNzdiBiYXNldXJsKycvZGF0YS9wcmljZXMtdmFjY2luZXMuY3N2JywgKGVycm9yLCBkYXRhKSAtPlxuICAgICAgIyBmaWx0ZXIgZGF0YSB0byBnZXQgb25seSBzZWxlY3RlZCB2YWNjaW5lc1xuICAgICAgZGF0YSA9IGRhdGEuZmlsdGVyIChkKSAtPiByZXR1cm4gdmFjY2luZXMuaW5kZXhPZihkLnZhY2NpbmUpICE9IC0xXG4gICAgICBncmFwaCA9IG5ldyB3aW5kb3cuU2NhdHRlcnBsb3REaXNjcmV0ZUdyYXBoKCd2YWNjaW5lLXByaWNlcy1ncmFwaCcsXG4gICAgICAgIGFzcGVjdFJhdGlvOiAwLjVcbiAgICAgICAgbWFyZ2luOlxuICAgICAgICAgIHJpZ2h0OiAyNVxuICAgICAgICAgIGxlZnQ6IDI1XG4gICAgICAgICAgYm90dG9tOiAyMFxuICAgICAgICBrZXk6XG4gICAgICAgICAgeDogJ2NvdW50cnknXG4gICAgICAgICAgeTogJ3ByaWNlJ1xuICAgICAgICAgIGlkOiAnY291bnRyeSdcbiAgICAgICAgICAjc2l6ZTogJ2Rvc2VzJ1xuICAgICAgICAgIGNvbG9yOiAndmFjY2luZScpXG4gICAgICAjIHVwZGF0ZSBnZXQgaWQgbWV0aG9kc1xuICAgICAgZ3JhcGguZ2V0RG90SWQgPSAoZCkgLT5cbiAgICAgICAgcmV0dXJuICdkb3QtJytkLmNvdW50cnkrJy0nK2QudmFjY2luZVxuICAgICAgZ3JhcGguZ2V0RG90TGFiZWxJZCA9IChkKSAtPlxuICAgICAgICByZXR1cm4gJ2RvdC1sYWJlbC0nK2QuY291bnRyeSsnLScrZC52YWNjaW5lXG4gICAgICBncmFwaC5nZXREb3RMYWJlbFRleHQgPSAoZCkgLT4gcmV0dXJuICcnXG4gICAgICBncmFwaC54QXhpcy50aWNrUGFkZGluZyAxMFxuICAgICAgZ3JhcGgueUF4aXNcbiAgICAgICAgLnRpY2tzIDVcbiAgICAgICAgLnRpY2tQYWRkaW5nIDE1XG4gICAgICAgIC50aWNrRm9ybWF0IChkKSAtPiAnJCcrZFxuICAgICAgZ3JhcGguZGF0YVBhcnNlciA9IChkYXRhKSAtPlxuICAgICAgICBkYXRhLmZvckVhY2ggKGQpID0+XG4gICAgICAgICAgZFtAb3B0aW9ucy5rZXkueV0gPSArZFtAb3B0aW9ucy5rZXkueV1cbiAgICAgICAgICBkW0BvcHRpb25zLmtleS5zaXplXSA9ICtkW0BvcHRpb25zLmtleS5zaXplXVxuICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgZ3JhcGguc2V0VG9vbHRpcERhdGEgPSAoZCkgLT5cbiAgICAgICAgZG9zZXNGb3JtYXQgPSBkMy5mb3JtYXQoJy4wcycpXG4gICAgICAgIEAkdG9vbHRpcFxuICAgICAgICAgIC5maW5kICcudG9vbHRpcC1pbm5lciAudGl0bGUnXG4gICAgICAgICAgLmh0bWwgZC5jb3VudHJ5XG4gICAgICAgIEAkdG9vbHRpcFxuICAgICAgICAgIC5maW5kICcudG9vbHRpcC1pbm5lciAudmFjY2luZSdcbiAgICAgICAgICAuaHRtbCBkLnZhY2NpbmVcbiAgICAgICAgQCR0b29sdGlwXG4gICAgICAgICAgLmZpbmQgJy50b29sdGlwLWlubmVyIC5wcmljZSdcbiAgICAgICAgICAuaHRtbCBkLnByaWNlXG4gICAgICAgIEAkdG9vbHRpcFxuICAgICAgICAgIC5maW5kICcudG9vbHRpcC1pbm5lciAuZG9zaXMnXG4gICAgICAgICAgLmh0bWwgaWYgZC5kb3NlcyB0aGVuIGRvc2VzRm9ybWF0KGQuZG9zZXMpKycgZG9zaXMgJyBlbHNlICcnXG4gICAgICAgIEAkdG9vbHRpcFxuICAgICAgICAgIC5maW5kICcudG9vbHRpcC1pbm5lciAuY29tcGFueSdcbiAgICAgICAgICAuaHRtbCBpZiBkLmNvbXBhbnkgdGhlbiAnKCcrZC5jb21wYW55KycpJyBlbHNlICcnXG4gICAgICAjIHNldCBkYXRhXG4gICAgICBncmFwaC5zZXREYXRhIGRhdGFcbiAgICAgICQod2luZG93KS5yZXNpemUgZ3JhcGgub25SZXNpemVcblxuICBcbiAgIyMjXG4gIHNldHVwR3VhdGVtYWxhQ292ZXJhZ2VMaW5lR3JhcGggPSAtPlxuICAgIGdyYXBoID0gbmV3IHdpbmRvdy5MaW5lR3JhcGgoJ2d1YXRlbWFsYS1jb3ZlcmFnZS1tbXInLFxuICAgICAgI2lzQXJlYTogdHJ1ZVxuICAgICAgbWFyZ2luOiBcbiAgICAgICAgbGVmdDogMFxuICAgICAgICByaWdodDogMFxuICAgICAgICBib3R0b206IDIwKVxuICAgIGdyYXBoLnhBeGlzLnRpY2tWYWx1ZXMgWzIwMDAsIDIwMDUsIDIwMTAsIDIwMTVdXG4gICAgZ3JhcGgueUF4aXNcbiAgICAgIC50aWNrVmFsdWVzIFswLCAyNSwgNTAsIDc1LCAxMDBdXG4gICAgICAudGlja0Zvcm1hdCAoZCkgLT4gZCsnJSdcbiAgICBncmFwaC5sb2FkRGF0YSBiYXNldXJsKycvZGF0YS9ndWF0ZW1hbGEtY292ZXJhZ2UtbW1yLmNzdidcbiAgICBncmFwaC4kZWwub24gJ2RyYXctY29tcGxldGUnLCAoZSkgLT5cbiAgICAgIGxpbmUgPSBncmFwaC5jb250YWluZXIuc2VsZWN0KCcubGluZScpXG4gICAgICBjb25zb2xlLmxvZyBsaW5lLm5vZGUoKVxuICAgICAgbGVuZ3RoID0gbGluZS5ub2RlKCkuZ2V0VG90YWxMZW5ndGgoKTtcbiAgICAgIGxpbmVcbiAgICAgICAgLmF0dHIoJ3N0cm9rZS1kYXNoYXJyYXknLCBsZW5ndGggKyAnICcgKyBsZW5ndGgpXG4gICAgICAgIC5hdHRyKCdzdHJva2UtZGFzaG9mZnNldCcsIGxlbmd0aClcbiAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kZWxheSg1MDAwKVxuICAgICAgICAgIC5kdXJhdGlvbig1MDAwKVxuICAgICAgICAgIC5lYXNlKGQzLmVhc2VTaW5Jbk91dClcbiAgICAgICAgICAuYXR0cignc3Ryb2tlLWRhc2hvZmZzZXQnLCAwKVxuXG4gIGlmICQoJyNndWF0ZW1hbGEtY292ZXJhZ2UtbW1yJykubGVuZ3RoID4gMFxuICAgIHNldHVwR3VhdGVtYWxhQ292ZXJhZ2VMaW5lR3JhcGgoKVxuICAjIyNcblxuICBpZiAkKCcjdmlkZW8tbWFwLXBvbGlvJykubGVuZ3RoID4gMFxuICAgIHNldFZpZGVvTWFwUG9saW8oKVxuXG4gICMjI1xuICAjIyBWYWNjaW5lIG1hcFxuICBpZiAkKCcjdmFjY2luZS1tYXAnKS5sZW5ndGggPiAwXG4gICAgdmFjY2luZV9tYXAgPSBuZXcgVmFjY2luZU1hcCAndmFjY2luZS1tYXAnXG4gICAgI3ZhY2NpbmVfbWFwLmdldERhdGEgPSB0cnVlICAjICBTZXQgdHJ1ZSB0byBkb3dubG9hZCBhIHBvbGlvIGNhc2VzIGNzdlxuICAgIHZhY2NpbmVfbWFwLmdldFBpY3R1cmVTZXF1ZW5jZSA9IHRydWUgICAjIFNldCB0cnVlIHRvIGRvd25sb2FkIGEgbWFwIHBpY3R1cmUgc2VxdWVuY2VcbiAgICB2YWNjaW5lX21hcC5pbml0IGJhc2V1cmwrJy9kYXRhL2Rpc2Vhc2VzLXBvbGlvLWNhc2VzLmNzdicsIGJhc2V1cmwrJy9kYXRhL21hcC1wb2xpby1jYXNlcy5jc3YnXG4gICAgJCh3aW5kb3cpLnJlc2l6ZSB2YWNjaW5lX21hcC5vblJlc2l6ZVxuICAjIyNcblxuICBpZiAkKCcudmFjY2luZXMtZGlzZWFzZS1ncmFwaCcpLmxlbmd0aCA+IDBcbiAgICBzZXR1cFZhY2NpbmVEaXNlYXNlSGVhdG1hcEdyYXBoKClcblxuICAjIyNcbiAgIyBWYWNjaW5lIGFsbCBkaXNlYXNlcyBncmFwaFxuICBpZiAkKCcjdmFjY2luZXMtYWxsLWRpc2Vhc2VzLWdyYXBoJykubGVuZ3RoID4gMFxuICAgIGdyYXBoX3ZhY2NpbmVfYWxsX2Rpc2Vhc2VzID0gbmV3IFZhY2NpbmVEaXNlYXNlR3JhcGgoJ3ZhY2NpbmVzLWFsbC1kaXNlYXNlcy1ncmFwaCcpXG4gICAgZ3JhcGhfdmFjY2luZV9hbGxfZGlzZWFzZXMuaW5pdCAkKCcjZGlzZWFzZS1zZWxlY3RvciAuYWN0aXZlIGEnKS5hdHRyKCdocmVmJykuc3Vic3RyaW5nKDEpLCAkKCcjdmFjY2luZXMtYWxsLWRpc2Vhc2VzLWdyYXBoICNvcmRlci1zZWxlY3RvcicpLnZhbCgpXG4gICAgJCh3aW5kb3cpLnJlc2l6ZSBncmFwaF92YWNjaW5lX2FsbF9kaXNlYXNlcy5vblJlc2l6ZVxuICAgICMgVXBkYXRlIGdyYXBoIGJhc2VkIG9uIHNlbGVjdGVkIGRpc2Vhc2VcbiAgICAkKCcjZGlzZWFzZS1zZWxlY3RvciBhJykuY2xpY2sgKGUpIC0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICQodGhpcykudGFiICdzaG93J1xuICAgICAgZ3JhcGhfdmFjY2luZV9hbGxfZGlzZWFzZXMuaW5pdCAkKHRoaXMpLmF0dHIoJ2hyZWYnKS5zdWJzdHJpbmcoMSksICQoJyN2YWNjaW5lcy1hbGwtZGlzZWFzZXMtZ3JhcGggI29yZGVyLXNlbGVjdG9yJykudmFsKClcbiAgICAgIHJldHVyblxuICAgICMgVXBkYXRlIGdyYXBoIGJhc2VvbiBvbiBvcmRlciBzZWxlY3RvclxuICAgICQoJyN2YWNjaW5lcy1hbGwtZGlzZWFzZXMtZ3JhcGggI29yZGVyLXNlbGVjdG9yJykuY2hhbmdlIChkKSAtPlxuICAgICAgZ3JhcGhfdmFjY2luZV9hbGxfZGlzZWFzZXMuaW5pdCAkKCcjZGlzZWFzZS1zZWxlY3RvciAuYWN0aXZlIGEnKS5hdHRyKCdocmVmJykuc3Vic3RyaW5nKDEpLCAkKHRoaXMpLnZhbCgpXG4gICMjI1xuXG4gIGlmICQoJyNpbW11bml6YXRpb24tY292ZXJhZ2UtZ3JhcGgtYWxsJykubGVuZ3RoID4gMFxuICAgIHNldHVwSW1tdW5pemF0aW9uQ292ZXJhZ2VEeW5hbWljTGluZUdyYXBoKClcblxuICBpZiAkKCcjaW1tdW5pemF0aW9uLWNvdmVyYWdlLWdyYXBoJykubGVuZ3RoID4gMFxuICAgIHNldHVwSW1tdW5pemF0aW9uQ292ZXJhZ2VNdWx0aXBsZVNtYWxsR3JhcGgoKVxuXG4gIGlmICQoJyN3b3JsZC1jYXNlcycpLmxlbmd0aCA+IDBcbiAgICBzZXR1cFdvcmxkQ2FzZXNNdWx0aXBsZVNtYWxsR3JhcGgoKVxuICBcbiAgaWYgJCgnLmltbXVuaXphdGlvbi1jb3ZlcmFnZS1kaXNlYXNlLWdyYXBoJykubGVuZ3RoID4gMFxuICAgIHNldHVwSW1tdW5pemF0aW9uRGlzZWFzZUJhckdyYXBoKClcblxuICBpZiAkKCcjbWVhc2xlcy13b3JsZC1tYXAtZ3JhcGgnKS5sZW5ndGggPiAwXG4gICAgc2V0dXBNZWFzbGVzV29ybGRNYXBHcmFwaCgpXG5cbiAgaWYgJCgnI3ZhY2NpbmUtY29uZmlkZW5jZS1ncmFwaCcpLmxlbmd0aCA+IDBcbiAgICBzZXR1cFZhY2NpbmVDb25maWRlbmNlQmFyR3JhcGgoKVxuXG4gIGlmICQoJyN2YWNjaW5lLWJjZy1jYXNlcy1ncmFwaCcpLmxlbmd0aCA+IDBcbiAgICBzZXR1cFZhY2NpbmVCY2dDYXNlc01hcCgpXG5cbiAgaWYgJCgnI3ZhY2NpbmUtYmNnLXN0b2Nrb3V0cycpLmxlbmd0aCA+IDBcbiAgICBzZXR1cFZhY2NpbmVCY2dTdG9ja291dHNNYXAoKVxuXG4gIGlmICQoJyN2YWNjaW5lLXByaWNlcy1ncmFwaCcpLmxlbmd0aCA+IDBcbiAgICBzZXR1cFZhY2NpbmVQcmljZXNHcmFwaCgpXG5cbikgalF1ZXJ5Il19
