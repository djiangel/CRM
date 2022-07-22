import React, { Component, Fragment } from 'react'
import * as d3module from "d3";
import dagreD3 from "dagre-d3";
import { event, zoom } from 'd3';
import './../WorkflowIllustration.css';
import { connect } from 'react-redux';
import { withResizeDetector } from 'react-resize-detector';
import useResizeObserver from '../../Dashboard/useResizeObserver';

const d3 = {
  ...d3module,
}

class WorkflowIllustration extends Component {
  state = {
    svg: null,
    svgGroup: null,
    windowSize: {
      x: 0,
      y: 0
    },
    //dimensions: useResizeObserver(this.refs.wrapper),
  }

  componentDidUpdate(prevProps) {
    const { width } = this.props;
    if (this.props.workflow !== prevProps.workflow) {
      this._setClasses()
    }
    if (this.props.workflow.transitions !== prevProps.workflow.transitions) {
      this._initialize()
    }
    if (width !== prevProps.width) {
      this.onResize()
    }
  }

  onResize() {
    if (this.state.svg) {
      if (Math.abs(this.state.windowSize.x - window.innerWidth) > 50) {
        this.state.windowSize = { x: window.innerWidth, y: window.innerHeight };
        var containerWidth = d3
          .select("#svg-container")
          .node()
          .getBoundingClientRect().width;
        d3.select(this.refs.flowchart).attr("width", containerWidth - 24);
        this._reCenterSketch();
      }
    }
  }


  async _initialize() {
    if ((this.props.workflow.states && this.props.workflow.states.length > 0) || (this.props.workflow.transitions && this.props.workflow.transitions.length > 0)) {

      await this.setState({
        svg: d3.select(this.refs.flowchart),
        svgGroup: d3.select(this.refs.flowchart).append("g"),
      }, () => {
        var that = this;
        var zoom = d3.zoom()
          .on("zoom", function () {
            that.state.svgGroup.attr("transform", event.transform);
            that.state.svgGroup.attr("stroke-width", 1 / event.transform.k);
            that.onResize()
          });
        this.state.svg.call(zoom);
        this.state.svgGroup.attr("align", "center")
      })

      this.graph = new dagreD3.graphlib.Graph().setGraph({}).setDefaultEdgeLabel(function () {
        return {};
      });

      this._renderSketch();

    }
  }

  _createNode(state, index) {
    this.graph.setNode(state.id, {
      label: state.label,
      class: "node-default",
      id: `state_${state.id}`
    });
  }

  _createEdge(transition) {
    this.graph.setEdge(transition.source_state, transition.destination_state, {
      id: `transition_${transition.id}`,
      label: `<-------`,
      curve: d3.curveBasis
    });
  }

  _destroySketchComponents() {
    var g = this.graph;
    this.graph.nodes().forEach(function (v) {
      g.removeNode(v);
    });

    this.graph.edges().forEach(function (v) {
      g.removeEdge(v);
    });

    d3.selectAll(".clickable-edge").remove();
  }

  _renderSketch() {
    if (this.props.workflow.states.length > 0 && this.refs.flowchart || this.refs.flowchart && this.props.workflow.transitions.length > 0) {
      this._destroySketchComponents();

      var that = this;
      this.props.workflow.states.forEach((state, index) => {
        that._createNode(state, index);
      });

      this.props.workflow.transitions.forEach(transition => {
        that._createEdge(transition);
      });

      var render = new dagreD3.render();

      var inner = d3.select(this.refs.flowchart.lastElementChild)
      render(inner, this.graph);
      this._reCenterSketch();
      this._setEdgeLabelDefaultClass();
      this._setEdgeOnclicks();
      this._setClasses();
    }
  }

  _setEdgeLabelDefaultClass() {
    d3.selectAll(`g.edgeLabels > g.edgeLabel`).classed("edge-label-UNSELECTED ", true);
  }

  _setEdgeOnclicks() {
    var that = this;
    this.props.workflow.transitions.forEach((transition, index) => {
      var edge_container = d3.select(`g#transition_${transition.id}`);
      edge_container.attr("index", index);
      edge_container
        .append("path")
        .attr("d", edge_container.select("path").attr("d"))
        .classed("clickable-edge", true)
        .on("click", function () {
          if (transition) {
            that.props.select_object_transition(transition)
            that._selectEdge(transition)
          }
        });
    });
  }

  _setClasses() {
    if (this.props.workflow.state_class_mapping) {
      const mapping = this.props.workflow.state_class_mapping
      Object.keys(mapping).forEach(state => {
        if (mapping[state].rect) {
          Object.keys(mapping[state].rect).forEach(style =>
            d3.select(`g#state_${state} rect`).style(style, mapping[state].rect[style]),
          );
        }
        if (mapping[state].label) {
          Object.keys(mapping[state].label).forEach(style =>
            d3.select(`g#state_${state} g.label`).style(style, mapping[state].label[style])
          );
        }
      });
    }
  }

  _selectEdge() {
    this.props.showDrawer()
  }

  _reCenterSketch() {
    var xCenterOffset = (this.state.svg.attr("width") - this.graph.graph().width) / 2;
    this.state.svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
    this.state.svg.attr("height", this.graph.graph().height + 40);
  }

  componentDidMount() {
    this._initialize()
  }


  render() {
    return (
      <Fragment>
        <div id="svg-container" ref='wrapper' justify="center" align="middle" style={{ height: "100%", width: '100%' }}>
          <svg ref="flowchart" className="shadow" />
        </div>
      </Fragment>
    )
  }
}


const mapDispatchToProps = dispatch => {
  return {
    select_object_transition: (selected_transition) => dispatch({ type: 'SELECT_WORKFLOWOBJECT_TRANSITION', id: selected_transition }),
  }
}

export default withResizeDetector(connect(null, mapDispatchToProps)(WorkflowIllustration));
