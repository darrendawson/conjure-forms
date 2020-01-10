import React, { Component } from 'react';
import './DevFormInput.css';

import ConditionalMaker from './ConditionalMaker/ConditionalMaker.js';


class DevFormInput extends Component {

  constructor() {
    super();
  }

  // onInput -------------------------------------------------------------------

  // when a user types into an <input/> that would modify a ConjureFormItem.itemDefinition parameter,
  // this function makes that update happen
  onInput_updateFormDetail = (detailType, e) => {
    let updatedItemDetails = this.props.formDetails;
    updatedItemDetails[detailType] = e.target.value;
    this.props.onClick_updateFormSectionDetails(this.props.selectedID, updatedItemDetails);
  }

  // same as onInput_updateFormDetail, but for an onClick
  onClick_updateFormDetail = (detailType, detailValue) => {
    let updatedFormDetails = this.props.formDetails;
    updatedFormDetails[detailType] = detailValue;
    this.props.onClick_updateFormSectionDetails(this.props.selectedID, updatedFormDetails);
  }

  onInput_updateAppearance = (appearanceType, e) => {
    let updatedAppearance = this.props.appearance;
    updatedAppearance[appearanceType] = e.target.value;
    this.props.onClick_updateFormAppearances(this.props.selectedID, updatedAppearance);
  }


  // ===========================================================================
  // render Details
  // ===========================================================================

  // render Form Details -------------------------------------------------------


  renderFormDetails = () => {

    let containerType = this.props.formDetails.containerType;
    if (["card", "subcard"].indexOf(containerType) < 0) {
      return;
    }

    //  capitalize the first letter
    containerType = containerType.charAt(0).toUpperCase() + containerType.slice(1);

    return (
      <div className="form_input_container">

        <h1 className="section_title">{containerType} Details</h1>

        <div className="input_row">
          <h3 className="input_title">Min to Render</h3>
          <h3 className="input_title">1</h3>
        </div>

        <div className="input_row">
          <h3 className="input_title">Max to Render</h3>
          <input
            className="form_input"
            value={this.props.formDetails.maxForms}
            onChange={this.onInput_updateFormDetail.bind(this, "maxForms")}
          />
        </div>

        {this.renderNewSubformArrayButton()}
      </div>
    );
  }


  renderNewSubformArrayButton = () => {
    if (this.props.formDetails.maxForms > 1) {
      return (
        <div className="input_row">
          <h3 className="input_title">New Subform Text</h3>
          <input
            className="form_input"
            value={this.props.formDetails.newSubformButtonText}
            onChange={this.onInput_updateFormDetail.bind(this, "newSubformButtonText")}
          />
        </div>
      );
    }
  }

  // render form output --------------------------------------------------------

  renderFormOutputObject = () => {

    let formOutput = this.props.formOutput;

    // don't render Output details if the currently selected form isn't in output
    // ex: a selected ConjureFormItem with type text is not in output
    if (formOutput.checkIfIDInOutput(this.props.selectedID) === false) {
      return;
    }

    return (
      <div className="form_input_container">
        <h1 className="section_title">Output Object</h1>
        <div className="input_row">
          <h3 className="input_title">Key</h3>
          <input
            className="form_input"
            value={this.props.formDetails.outputID}
            onChange={this.onInput_updateFormDetail.bind(this, "outputID")}
          />
        </div>

        <div className="input_row">
          {formOutput.render(false, this.props.selectedID, true, this.props.onClick_selectFormSection)}
        </div>

      </div>
    );
  }



  // render conditionals -------------------------------------------------------
  /*
    Conditional render is a section for specifying when a ConjureForm/ConjureFormItem should be rendered
    For example:
      - User is filling out a ConjureForm for creating sql
      - User is adding columns to a table
      - if a user specifies the column type as being a VARCHAR, it'll render additional questions like LENGTH
      - if a user specifies the column type as being a DOUBLE, it'll render additional questions like number of digits
      - These conditionals allow this type of functionality
  */

  renderConditionals = () => {

    // if this form isnt present in ConjureFormOutput, it cant have the option to be conditionally rendered
    if (! this.props.formOutput.checkIfIDInOutput(this.props.selectedID)) { return; }

    let alwaysButton_CSS = "button_selected";
    let conditionallyButton_CSS = "button";
    if (this.props.formDetails.renderConditionally) {
      alwaysButton_CSS = "button";
      conditionallyButton_CSS = "button_selected";
    }

    return (
      <div className="form_input_container with_margin">
        <h1 className="section_title">Conditional Render</h1>

        <div className="input_row">
          <h3 className="input_title">When to Render</h3>
          <button className={alwaysButton_CSS} onClick={() => this.onClick_updateFormDetail("renderConditionally", false)}>Always</button>
          <button className={conditionallyButton_CSS} onClick={() => this.onClick_updateFormDetail("renderConditionally", true)}>Conditionally</button>
        </div>

        {this.renderConditionalMaker()}
      </div>
    );
  }

  renderConditionalMaker = () => {
    if (this.props.formDetails.renderConditionally) {

      let outputObject = this.props.formOutput.getOutputObject();
      let detailsLookup = this.props.formOutput.getDetailsLookup();

      // get the IDs for all multiple choice questions
      let bannedIDs = [];
      bannedIDs.push(this.props.selectedID); // we don't want a question to be conditionally dependent on itself
      for (let key in detailsLookup) {
        if (! (('questionType' in detailsLookup[key]) && (detailsLookup[key]['questionType'] === 'multipleChoice'))) {
          bannedIDs.push(key);
        }
      }

      // ban all IDs that are nested within the current ConjureForm
      let childIDs = this.props.formOutput.getAllChildIDs(this.props.selectedID);
      for (let i = 0; i < childIDs.length; i++) {
        bannedIDs.push(childIDs[i]);
      }

      return (
        <div className="input_row">
          <ConditionalMaker
            condition={this.props.formDetails.renderCondition}
            formOutputObject={outputObject}
            formDetailsLookup={detailsLookup}
            bannedIDs={bannedIDs}
            questionConditionID={this.props.formDetails.renderCondition.questionID}
            questionConditionValue={this.props.formDetails.renderCondition.questionValue}
            onClick_updateItemDetail={this.onClick_updateFormDetail}
          />
        </div>

      );
    }
  }


  // ===========================================================================
  // render Appearance
  // ===========================================================================

  // render padding ------------------------------------------------------------


  renderAppearanceInputRow = (title, key) => {
    return (
      <div className="input_row">
        <h3 className="input_title">{title}</h3>
        <input
          className="form_input"
          value={this.props.appearance[key]}
          onChange={this.onInput_updateAppearance.bind(this, key)}
        />
      </div>
    );
  }

  renderColorInputRow = (title, key) => {
    return (
      <div className="input_row">
        <h3 className="input_title">{title}</h3>
        <div className="color_square" style={{'background-color': this.props.appearance[key]}}></div>
        <input
          className="form_input"
          value={this.props.appearance[key]}
          onChange={this.onInput_updateAppearance.bind(this, key)}
        />
      </div>
    );
  }

  // intentionally not rendering option to change sides because it disrupts width of cards
  //  {this.renderAppearanceInputRow("Sides", "paddingSides")}
  renderPadding = () => {
    return (
      <div className="form_input_container with_margin">
        <h1 className="section_title">Padding</h1>
        {this.renderAppearanceInputRow("Top", "paddingTop")}
        {this.renderAppearanceInputRow("Bottom", "paddingBottom")}
      </div>
    );
  }


  // area for user to modify colors
  renderColors = () => {

    let controlButtonText;
    let controlButtonBackground;
    if (this.props.formDetails.containerType === "page") {
      controlButtonText = this.renderColorInputRow("Next Page Button Text", "colorControlButtonText");
      controlButtonBackground = this.renderColorInputRow("Next Page Button Background", "colorControlButtonBackground");
    } else if (this.props.formDetails.maxForms > 1) {
      controlButtonText = this.renderColorInputRow("New Form Button Text", "colorControlButtonText");
      controlButtonBackground = this.renderColorInputRow("New Form Button Background", "colorControlButtonBackground");
    }


    if (this.props.formDetails.containerType === "card") {
      return (
        <div className="form_input_container with_margin">
          <h1 className="section_title">Colors</h1>
          {this.renderColorInputRow("Background", "colorBackground")}
          {this.renderColorInputRow("Card Shadow", "colorCardShadow")}
          {controlButtonText}
          {controlButtonBackground}
        </div>
      );
    } else {
      return (
        <div className="form_input_container with_margin">
          <h1 className="section_title">Colors</h1>
          {this.renderColorInputRow("Background", "colorBackground")}
          {controlButtonText}
          {controlButtonBackground}
        </div>
      );
    }
  }



  // ===========================================================================
  // render <DevFormInput/>
  // ===========================================================================

  // render <DevFormInput/> ----------------------------------------------------

  render() {

    if (this.props.modificationMode === "Appearance") {
      return (
        <div id="DevFormInput">
          {this.renderPadding()}
          {this.renderColors()}
        </div>
      );
    } else {
      return (
        <div id="DevFormInput">
          {this.renderFormOutputObject()}
          {this.renderFormDetails()}
          {this.renderConditionals()}
        </div>
      );
    }
  }
}

export default DevFormInput;
