class window.HeatmapGraph extends BaseGraph

  # Constructor
  # -----------

  constructor: (id, options) ->
    super id, options
    @formatFloat   = d3.format(',.1f')
    @formatInteger = d3.format(',d')
    return @


  # Main methods
  # ------------

  setSVG: ->
    @svg       = null
    @container = d3.select '#'+@id+' .heatmap-graph'
    if @options.legend
      @container.classed 'has-legend', true
    @$tooltip  = @$el.find '.tooltip'

  setData: (data) ->
    # Get years (x scale)
    @years = @getYears(data)
    # Get countries (y scale)
    @countries = data.map (d) -> d.code
    # Get array of data values
    @cellsData = @getCellsData data
    @data = @dataParser(data)
    @getDimensions() # force update dimensions
    @drawScales()
    @drawMarkers()
    if @options.legend
      @drawLegend()
    @drawGraph()
    return @

  getYears: (data) ->
    minYear = d3.min data, (d) -> d3.min(d3.keys(d.values))
    maxYear = d3.max data, (d) -> d3.max(d3.keys(d.values))
    years = d3.range minYear, maxYear, 1
    years.push +maxYear
    return years

  getCellsData: (data) ->
    cellsData = []
    data.forEach (d) ->
      for value of d.values
        cellsData.push
          country: d.code
          name:    d.name
          year:    value
          cases:   d.cases[value]
          value:   d.values[value]
    return cellsData

  dataParser: (data) ->
    data.forEach (d) => 
      d.values = {}
      @years.forEach (year) =>
        if d[year]
          d.values[year] = +d[year]
        #else
        #  console.log 'No hay datos de para', d.name, 'en ', year
        delete d[year]
    return data

  setScales: ->
    # set x scale
    @x = d3.scaleBand()
      .padding(0)
      .paddingInner(0)
      .paddingOuter(0)
      .round(true)
      .range @getScaleXRange()
    # set y scale
    @y = d3.scaleBand()
      .padding(0)
      .paddingInner(0)
      .paddingOuter(0)
      .round(true)
      .range @getScaleYRange()
    # set color scale
    @color = d3.scaleSequential d3.interpolateOranges
    return @

  drawScales: ->
    super()
    @color.domain @getColorDomain()
    return @

  getScaleXRange: =>
    return [0, @width]

  getScaleYRange: =>
    return [0, @height]

  getScaleXDomain: =>
    return @years 

  getScaleYDomain: =>
    return @countries

  getColorDomain: =>
    return [0, 400]

  getDimensions: ->
    @width = @$el.width() - 70  # y axis width = 100
    if @years and @countries
      cellSize = Math.floor @width / @years.length
      # set minimum cell dimensions
      if cellSize < 15
        cellSize = 15
        @width = (cellSize * @years.length) + 70
      @height = if cellSize < 20 then cellSize * @countries.length else 20 * @countries.length
    return @

  drawGraph: ->
    # setup scales range
    @x.range @getScaleXRange()
    @y.range @getScaleYRange()
    # setup container height
    #@container.style 'height', @height+'px'
    # draw years x axis
    @container.append('div')
      .attr 'class', 'x-axis axis'
    .selectAll('.axis-item')
      .data(@years.filter((d) -> d % 5 == 0))
    .enter().append('div')
      .attr  'class', 'axis-item'
      .style 'left', (d) => @x(d)+'px'
      .html  (d) -> d
    # draw countries y axis
    @container.append('div')
      .attr('class', 'y-axis axis')
    .selectAll('.axis-item')
      .data(@countries)
    .enter().append('div')
      .attr  'class', 'axis-item'
      .style 'top', (d) => @y(d)+'px'
      .html (d) => @getCountryName d
    # draw cells
    @container.append('div')
      .attr  'class', 'cell-container'
      .style 'height', @height+'px'
    .selectAll('.cell')
      .data(@cellsData)
    .enter().append('div')
      .attr  'class', 'cell'
      .style 'background', (d) => @color(d.value)
      .on    'mouseover', @onMouseOver
      .on    'mouseout', @onMouseOut
      .call  @setCellDimensions
    # draw year introduction mark
    @container.select('.cell-container')
      .selectAll('.marker')
      .data @data.map((d) -> {code: d.code, year: d.year_introduction}).filter((d) -> !isNaN d.year)
    .enter().append('div')
      .attr 'class', 'marker'
      .call @setMarkerDimensions

  updateGraphDimensions: ->
    # update scales
    @x.range @getScaleXRange()
    @y.range @getScaleYRange()
    # update containers
    @container
      .style 'height', @height + 'px'
    @container.select('.cell-container')
      .style 'height', @height+'px'
    @container.selectAll('.cell')
      .call @setCellDimensions
    @container.select('.x-axis').selectAll('.axis-item')
      .style 'left', (d) => @x(d)+'px'
    @container.select('.y-axis').selectAll('.axis-item')
      .style 'top', (d) => @y(d)+'px'
    @container.select('.cell-container').selectAll('.marker')
      .call @setMarkerDimensions
    return @

  setCellDimensions: (selection) =>
    selection
      .style 'left',   (d) => @x(d.year)+'px'
      .style 'top',    (d) => @y(d.country)+'px'
      .style 'width',  @x.bandwidth()+'px'
      .style 'height', @y.bandwidth()+'px'

  setMarkerDimensions: (selection) =>
    selection
      .style 'top',    (d) => (@y(d.code)-1)+'px'
      .style 'left',   (d) => if d.year < @years[0] then @x(@years[0])-1 + 'px' else if d.year < @years[@years.length-1] then @x(d.year)-1+'px' else @x.bandwidth()+@x(@years[@years.length-1])+'px'
      .style 'height', (@y.bandwidth()+1)+'px'

  onMouseOver: (d) =>
    # Set tooltip content
    offset           = $(d3.event.target).offset()

    @$tooltip
      .find '.tooltip-inner .country'
      .html d.name
    @$tooltip
      .find '.tooltip-inner .year'
      .html d.year
    @$tooltip
      .find '.tooltip-inner .value'
      .html if d.value == 0 then 0 else @formatFloat(d.value)
    @$tooltip
      .find '.tooltip-inner .cases'
      .html @formatInteger(d.cases)
    # Set tooltip position
    @$tooltip.css
      'left':    offset.left + @x.bandwidth() * 0.5 - (@$tooltip.width() * 0.5)
      'top':     offset.top - (@y.bandwidth() * 0.5) - @$tooltip.height()
      'opacity': '1'
    return

  onMouseOut: (d) =>
    @$tooltip.css 'opacity', '0'
    return

  getCountryName: (code) =>
    country = @data.filter (d) -> d.code == code
    return if country[0] then country[0].name else ''

  drawLegend: ->
    legendData = [0,100,200,300,400]
    @legend = @container.append('ul')
      .attr 'class', 'legend'
      .style 'margin-left', -(15*legendData.length)+'px'
    # draw legend rects
    @legend.selectAll('li')
      .data legendData
      .enter().append('li')
        .style 'background', (d) => @color d
        .html (d,i) -> if i != 0 then d else '&nbsp'

    ###
    legendData.shift()
    # draw legend texts
    @legend.selectAll('text')
      .data legendData
      .enter().append('text')
        .attr 'x', (d,i) -> Math.round legenItemWidth*(i-0.5-(legendData.length/2))
        .attr 'y', 20
        .attr 'text-anchor', 'start'
        .text (d) -> d
    ###

# VaccineDiseaseGraph = (_id) ->
#   $ = jQuery.noConflict()
#   Y_AXIS_WIDTH = 100
#   # Must be the ame value than #vaccine-disease-graph $padding-left scss variable
#   that = this
#   id = _id
#   disease = undefined
#   sort = undefined
#   lang = undefined
#   data = undefined
#   dataPopulation = undefined
#   currentData = undefined
#   cellData = undefined
#   countries = undefined
#   years = undefined
#   cellSize = undefined
#   container = undefined
#   x = undefined
#   y = undefined
#   width = undefined
#   height = undefined
#   $el = undefined
#   $tooltip = undefined
#   # Public Methods

#   that.init = (_disease, _sort) ->
#     disease = _disease
#     sort = _sort
#     #console.log('Vaccine Graph init', id, disease, sort);
#     $el = $('#' + id)
#     $tooltip = $el.find('.tooltip')
#     lang = $el.data('lang')
#     x = d3.scaleBand().padding(0).paddingInner(0).paddingOuter(0).round(true)
#     y = d3.scaleBand().padding(0).paddingInner(0).paddingOuter(0).round(true)
#     color = d3.scaleSequential(d3.interpolateOrRd)
#     if data
#       clear()
#       setupData()
#       setupGraph()
#     else
#       # Load CSVs
#       d3.queue().defer(d3.csv, $('body').data('baseurl') + '/data/diseases-cases.csv').defer(d3.csv, $('body').data('baseurl') + '/data/population.csv').await onDataReady
#     that

#   that.onResize = ->
#     getDimensions()
#     if data
#       updateGraph()
#     that

#   onDataReady = (error, data_csv, population_csv) ->
#     data = data_csv
#     dataPopulation = population_csv
#     # we don't need the columns attribute
#     delete data.columns
#     # We can define a filter function to show only some selected countries
#     if that.filter
#       data = data.filter(that.filter)
#     data.forEach (d) ->
#       d.disease = d.disease.toLowerCase()
#       if d.year_introduction
#         d.year_introduction = +d.year_introduction.replace('prior to', '')
#       d.cases = {}
#       d.values = {}
#       # set value es cases /1000 inhabitants
#       populationItem = population_csv.filter((country) ->
#         country.code == d.code
#       )
#       if populationItem.length > 0
#         year = 1980
#         while year < 2016
#           if d[year]
#             population = +populationItem[0][year]
#             if population != 0
#               #d[year] = 1000 * (+d[year] / population);
#               d.cases[year] = +d[year]
#               d.values[year] = 1000 * +d[year] / population
#             else
#               #d[year] = null;
#               #console.log('No hay datos de población para', d.name, 'en ', year, d[year]);
#           else
#             #d[year] = null;
#             #console.log('No hay datos de casos de ' + d.disease + ' para', d.name, 'en ', year, ':', d[year], typeof d[year]);
#           delete d[year]
#           year++
#       else
#         console.log 'No hay datos de población para', d.name
#       # Get total cases by country & disease
#       d.total = d3.values(d.values).reduce(((a, b) ->
#         a + b
#       ), 0)
#       return
#     setupData()
#     setupGraph()
#     return

#   setupData = ->
#     # Filter data based on selected disease
#     currentData = data.filter((d) ->
#       d.disease == disease and d3.values(d.values).length > 0
#     )
#     # Sort data
#     if sort == 'year'
#       currentData.sort (a, b) ->
#         if isNaN(a.year_introduction) then 1 else if isNaN(b.year_introduction) then -1 else b.year_introduction - (a.year_introduction)
#     else if sort == 'cases'
#       currentData.sort (a, b) ->
#         b.total - (a.total)
#     # Get array of country names
#     countries = currentData.map((d) ->
#       d.code
#     )
#     # Get array of years
#     minYear = d3.min(currentData, (d) ->
#       d3.min d3.keys(d.values)
#     )
#     maxYear = d3.max(currentData, (d) ->
#       d3.max d3.keys(d.values)
#     )
#     years = d3.range(minYear, maxYear, 1)
#     years.push +maxYear
#     #console.log(minYear, maxYear, years);
#     #console.log(countries);
#     # Get array of data values
#     cellsData = []
#     currentData.forEach (d) ->
#       for value of d.values
#         cellsData.push
#           country: d.code
#           name: d.name
#           year: value
#           cases: d.cases[value]
#           value: d.values[value]
#       return

#     ###
#     currentData.forEach(function(d){
#       var counter = 0;
#       years.forEach(function(year){
#         if (d[year])
#           counter++;
#       });
#       if(counter <= 20) // years.length/2)
#         console.log(d.name + ' has only values for ' + counter + ' years');
#     });
#     ###

#     return

#   setupGraph = ->
#     # Get dimensions (height is based on countries length)
#     getDimensions()
#     x.domain(years).range [
#       0
#       width
#     ]
#     y.domain(countries).range [
#       0
#       height
#     ]
#     #color.domain([d3.max(cellsData, function(d){ return d.value; }), 0]);
#     color.domain [
#       0
#       4
#     ]
#     #console.log('Maximum cases value: '+ d3.max(cellsData, function(d){ return d.value; }));
#     # Add svg
#     container = d3.select('#' + id + ' .graph-container').style('height', height + 'px')
#     # Draw cells
#     container.append('div').attr('class', 'cell-container').style('height', height + 'px').selectAll('.cell').data(cellsData).enter().append('div').attr('class', 'cell').style('background', (d) ->
#       color d.value
#     ).call(setCellDimensions).on('mouseover', onMouseOver).on 'mouseout', onMouseOut
#     # Draw years x axis
#     container.append('div').attr('class', 'x-axis axis').selectAll('.axis-item').data(years.filter((d) ->
#       d % 5 == 0
#     )).enter().append('div').attr('class', 'axis-item').style('left', (d) ->
#       x(d) + 'px'
#     ).html (d) ->
#       d
#     # Draw countries y axis
#     container.append('div').attr('class', 'y-axis axis').selectAll('.axis-item').data(countries).enter().append('div').attr('class', 'axis-item').style('top', (d) ->
#       y(d) + 'px'
#     ).html (d) ->
#       getCountryName d
#     # Draw year introduction mark
#     container.select('.cell-container').selectAll('.marker').data(currentData.map((d) ->
#       {
#         code: d.code
#         year: d.year_introduction
#       }
#     ).filter((d) ->
#       !isNaN(d.year)
#     )).enter().append('div').attr('class', 'marker').call setMarkerDimensions
#     return

#   clear = ->
#     container.select('.cell-container').remove()
#     container.selectAll('.axis').remove()
#     return



