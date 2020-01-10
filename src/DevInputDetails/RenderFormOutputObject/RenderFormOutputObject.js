import React, { Component } from 'react';
import './RenderFormOutputObject.css';


const __leftBracketChar = "{";
const __rightBracketChar = "}";
const __DEV_MODE_ON = false;

class RenderFormOutputObject extends Component {

  constructor() {
    super();

    // bind functions so they can access `this` in an es5 compliant way
    this.checkIfIDBanned           = this.checkIfIDBanned.bind(this);
    this.onClick_selectFormSection = this.onClick_selectFormSection.bind(this);
    this.getSpacePaddingLeft       = this.getSpacePaddingLeft.bind(this);
    this.renderParameterName       = this.renderParameterName.bind(this);
    this.renderObject              = this.renderObject.bind(this);
  }


  // returns true if a given formID has been banned
  checkIfIDBanned(formID) {
    if (Array.isArray(this.props.bannedIDs) && (this.props.bannedIDs.indexOf(formID) >= 0)) {
      return true;
    }
    return false;
  }

  // onClick -------------------------------------------------------------------

  onClick_selectFormSection(formID) {
    if (! this.checkIfIDBanned(formID)) {
      this.props.onClick_selectFormSection(formID);
    }
  }


  // render --------------------------------------------------------------------

  // gets the appropriate number of spaces for an object nested at a certain depth
  getSpacePaddingLeft(depth) {
    let padding = "";
    for (let i = 0; i < depth; i++) {
      padding += "    "; // 4
    }
    return padding;
  }


  renderParameterName(formID, outputName) {

    if ((formID !== outputName) && __DEV_MODE_ON) {
      outputName = formID + "->" + outputName;
    }

    if (this.checkIfIDBanned(formID)) {
      return (
        <span className="text_banned">{outputName}</span>
      );
    } else if (this.props.renderTextClickable === false) {
      return (
        <span className="text">{outputName}</span>
      );
    } else {
      if (this.props.selectedID === formID) {
        return (
          <span className="text_clickable_selected">{outputName}</span>
        );
      } else {
        return (
          <span className="text_clickable">{outputName}</span>
        );
      }
    }
  }


  renderObject(obj, depth = 1, result = []) {

    let paddingLeft = this.getSpacePaddingLeft(depth);

    if (Array.isArray(obj)) {

      for (let i = 0; i < obj.length; i++) {
        //result.push(<pre className="text" onClick={() => this.onClick_selectFormSection(formID)}>{paddingLeft}{parameterName}: {leftBracket}</pre>)
        result.push(<pre className="text">{paddingLeft}{__leftBracketChar}</pre>);
        result.push(this.renderObject(obj[i], depth + 1));
        result.push(<pre className="text">{paddingLeft}{__rightBracketChar}</pre>);

      }

    } else {

      let numSubforms = Object.keys(obj).length;
      let i = 0;

      //
      for (let formID in obj) {
        i += 1;
        let outputName = this.props.formDetailsLookup[formID]['outputID'];
        let parameterName = this.renderParameterName(formID, outputName);

        if (this.props.formDetailsLookup[formID]['type'] === "ConjureForm") {

          // get the right brackets
          let leftBracket = "{";
          let rightBracket = "}";
          if (this.props.formDetailsLookup[formID]['maxForms'] > 1) {
            leftBracket = "[";
            rightBracket = "]";
          }

          result.push(<pre className="text" onClick={() => this.onClick_selectFormSection(formID)}>{paddingLeft}{parameterName}: {leftBracket}</pre>)
          result.push(this.renderObject(obj[formID], depth + 1));

          // render } to end current subform object. logic used to render with or without comma
          if (i < numSubforms) {
            result.push(<pre className="text">{paddingLeft}{rightBracket},</pre>);
          } else {
            result.push(<pre className="text">{paddingLeft}{rightBracket}</pre>);
          }

        } else if (this.props.formDetailsLookup[formID]['type'] === "ConjureFormItem") {

          let itemDefaultValue = JSON.stringify(obj[formID]);

          // render } to end current subform object. logic used to render with or without comma
          if (i < numSubforms) {
            result.push(<pre className="text" onClick={() => this.onClick_selectFormSection(formID)}>{paddingLeft}{parameterName}: {itemDefaultValue},</pre>)
          } else {
            result.push(<pre className="text" onClick={() => this.onClick_selectFormSection(formID)}>{paddingLeft}{parameterName}: {itemDefaultValue}</pre>)
          }
        }

      }
    }


    return result;
  }


  // Renders <RenderFormOutputObject/>
  render() {
    return (
      <div id="RenderFormOutputObject">
        <div id="output_container">
          <pre className="text">{__leftBracketChar}</pre>
          {this.renderObject(this.props.formOutputObject)}
          <pre className="text">{__rightBracketChar}</pre>
        </div>
      </div>
    );
  }
}

export default RenderFormOutputObject;
