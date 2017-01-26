class window.BaseGraph

  optionsDefault = 
    margin:
      top: 0
      right: 0
      bottom: 20
      left: 0
    aspectRatio: 0.5625
    label: false          # show/hide labels
    key:
      id: 'key'
      x: 'key'            # name for x column
      y: 'value'          # name for y column

  markerDefault =
    value: null
    label: ''
    orientation: 'horizontal'
    align:'right'


  # Constructor
  # -----------

  constructor: (id, options) ->
    @id       = id
    @options  = $.extend true, optionsDefault, options  # merge optionsDefault & options
    @$el      = $('#'+@id)
    @getDimensions()
    @setSVG()
    @setScales()
    @markers = []
    return @


  # Main methods
  # ------------

  setSVG: ->
    @svg = d3.select('#'+@id).append('svg')
      .attr 'width', @containerWidth
      .attr 'height', @containerHeight
    @container = @svg.append('g')
      .attr 'transform', 'translate(' + @options.margin.left + ',' + @options.margin.top + ')'

  loadData: (url) ->
    d3.csv url, (error, data) =>
      @setData data
    return @
    
  setData: (data) ->
    @data = @dataParser(data)
    @drawScales()
    @drawMarkers()
    @setGraph()
    return @

  # to overdrive
  dataParser: (data) ->
    return data
  
  # to overdrive
  setGraph: ->
    return @


  # Scale methods
  # ------------

  # to overdrive
  setScales: ->
    return @

  drawScales: ->
    # set scales domains
    @x.domain @getScaleXDomain()
    @y.domain @getScaleYDomain()
    # set x axis
    if @xAxis
      @container.append('g')
        .attr 'class', 'x axis'
        .attr 'transform', 'translate(0,'+@height+')'
        .call @xAxis
    # set y axis
    if @yAxis
      @container.append('g')
        .attr 'class', 'y axis'
        .attr 'transform', 'translate('+@width+' ,0)'
        .call @yAxis
    return @

  # to overdrive
  getScaleXRange: ->
    return [0, @width]

  # to overdrive
  getScaleYRange: ->
    return [@height, 0]

  # to overdrive
  getScaleXDomain: ->
    return []

  # to overdrive
  getScaleYDomain: ->
    return []


  # Marker methods
  # -------------

  addMarker: (marker) ->
    @markers.push $.extend true, markerDefault, marker
    return @

  drawMarkers: ->
    # Draw marker line
    @container.selectAll('.marker')
      .data(@markers)
    .enter().append('line')
      .attr 'class', 'marker'
      .call @setupMarkerLine
    # Draw marker label
    @container.selectAll('.marker-label')
      .data(@markers)
    .enter().append('text')
      .attr 'class', 'marker-label'
      .attr 'text-anchor', (d) -> if d.orientation == 'vertical' then 'middle' else if d.align == 'right' then 'end' else 'start'
      .text (d) -> d.label
      .call @setupMarkerLabel

  setupMarkerLine: (element) =>
    element
    .attr 'x1', (d) => if d.orientation == 'horizontal' then 0 else @x(d.value)
    .attr 'y1', (d) => if d.orientation == 'horizontal' then @y(d.value) else 0
    .attr 'x2', (d) => if d.orientation == 'horizontal' then @width else @x(d.value) 
    .attr 'y2', (d) => if d.orientation == 'horizontal' then @y(d.value) else @height 

  setupMarkerLabel: (element) =>
    element
      .attr 'x', (d) => if d.orientation == 'horizontal' then (if d.align == 'right' then @width else 0 ) else @x(d.value) 
      .attr 'y', (d) => if d.orientation == 'horizontal' then @y(d.value) else @height   


  # Resize methods
  # ------------

  onResize: =>
    @getDimensions()
    @updateGraphDimensions()
    return @

  getDimensions: ->
    if @$el
      @containerWidth  = @$el.width()
      @containerHeight = @containerWidth * @options.aspectRatio
      @width           = @containerWidth - @options.margin.left - @options.margin.right
      @height          = @containerHeight - @options.margin.top - @options.margin.bottom
    return @

  # to overdrive
  updateGraphDimensions: ->
    # update svg dimension
    @svg
      .attr 'width',  @containerWidth
      .attr 'height', @containerHeight
    # update scales dimensions
    @x.range @getScaleXRange()
    @y.range @getScaleYRange()
    # update axis dimensions
    if @xAxis
      @container.selectAll('.x.axis')
        .attr 'transform', 'translate(0,'+@height+')'
        .call @xAxis
    if @yAxis
      @container.selectAll('.y.axis')
        .attr 'transform', 'translate('+@width+' ,0)'
        .call @yAxis
    # update markers
    @container.select('.marker')
      .call @setupMarkerLine
    @container.select('.marker-label')
      .call @setupMarkerLabel
    return @


    # Auxiliar methods
    # ----------------

    getDataX: ->
      return d[@options.key.x]

    getDataY: ->
      return d[@options.key.y]