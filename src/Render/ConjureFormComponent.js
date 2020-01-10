import React, { Component } from 'react';
import './ConjureFormComponent.css';

class ConjureFormComponent extends Component {

  constructor() {
    super();

    // bind functions so they can access state
    this.getID = this.getID.bind(this);
    this.onClick_selectForm = this.onClick_selectForm.bind(this);
    this.getContainerCSS = this.getContainerCSS.bind(this);
    this.getContainerStyling = this.getContainerStyling.bind(this);
    this.renderEmptySpace = this.renderEmptySpace.bind(this);
    this.renderAddNewButton = this.renderAddNewButton.bind(this);
    this.renderDismissButton = this.renderDismissButton.bind(this);
    this.renderPageButtons = this.renderPageButtons.bind(this);
    this.checkConditionalRender = this.checkConditionalRender.bind(this);
    this.getChildrenToRender = this.getChildrenToRender.bind(this);
    this.getBorderStyling = this.getBorderStyling.bind(this);
  }


  getID() {
    if (this.props.formID in this.props.idConversionTable) {
      return this.props.idConversionTable[this.props.formID];
    }
    return this.props.formID;
  }

  // onClick -------------------------------------------------------------------

  // this function acts as an intermediary to this.props.onClick_selectForm
  // this prevents cascading onClicks when the user clicks a nested <ConjureFormComponent/>
  onClick_selectForm(e) {
    e.stopPropagation();
    this.props.onClick_selectForm(this.getID());
  }


  // render --------------------------------------------------------------------


  // returns the correct CSS class name tags for the container
  getContainerCSS(containerType) {

    if (containerType === "page") {
      return "container_type_page";
    } else if (containerType === "card") {
      return "container_type_card";
    } else if (containerType === "subcard") {
      return "container_type_subcard";
    } else {
      return "";
    }
  }

  // box-shadow and backgroundColor are dynamically inserted using html style
  getContainerStyling(containerType) {

    let style = {'background-color': this.props.appearance.colorBackground};

    // add box shadow
    if (containerType === "card") {
      style['box-shadow'] = "5px 10px 15px " + this.props.appearance.colorCardShadow + "";
    }

    // set margins / padding
    style['padding-top'] = this.props.appearance.paddingTop + "px";
    style['padding-bottom'] = this.props.appearance.paddingBottom + "px";
    style['padding-left'] = this.props.appearance.paddingSides + "px";
    style['padding-right'] = this.props.appearance.paddingSides + "px";

    return style;
  }


  // if this form doesn't have any children, render an empty div instead to make the object large enough to click
  renderEmptySpace() {
    if (Object.keys(this.props.subforms).length === 0 && Object.keys(this.props.items).length === 0) {
      return (
        <div id="empty_space"></div>
      );
    }
  }


  // if a ConjureForm is actually supposed to be an array of other ConjureForms, then we want to render an "add new" button
  // that the user can click to create a new subform in the array
  renderAddNewButton() {
    if (this.props.formDetails.maxForms > 1) {
      let formOutputObject = this.props.formOutput.get(this.getID());

      // if there is only one form, render "add New Button"
      // OR, if array isn't full and this is the last subform in the array, render the button
      if (
        (Array.isArray(formOutputObject) && formOutputObject.length === 1) ||
        (Array.isArray(formOutputObject) && (formOutputObject.length === this.props.indexInArray + 1) && (this.props.formDetails.maxForms > formOutputObject.length))
      ) {
        return (
          <div id="new_array_subform_button_container">
            <button
              id="new_array_subform_button"
              style={{'background-color': this.props.appearance.colorControlButtonBackground, 'color': this.props.appearance.colorControlButtonText}}
              onClick={() => this.props.onClick_addNewSubformToArray(this.getID())}>
              {this.props.formDetails.newSubformButtonText}
            </button>
          </div>
        );
      }
    }
  }

  // for arrays of subforms, render a menu with the option to dismiss
  renderDismissButton() {
    if (this.props.formDetails.maxForms > 1) {
      let formOutputObject = this.props.formOutput.get(this.getID());
      if (Array.isArray(formOutputObject) && formOutputObject.length > 1 && this.props.indexInArray !== 0) {
        return (
          <div id="dismiss_subform_button_row">
            <button
              id="dismiss_subform_button"
              style={{'background-color': this.props.backgroundColor, 'color': this.props.titleColor, 'border-color': this.props.titleColor}}
              onClick={() => this.props.onClick_removeSubformFromArray(this.getID(), this.props.indexInArray)}>
              X
            </button>
          </div>
        );
      }
    }
  }


  //
  renderPageButtons() {
    if (this.props.formDetails.containerType === "page" && (! this.props.devModeOn)) {
      let buttonStyle = {
        'background-color': this.props.appearance.colorControlButtonBackground,
        'color': this.props.appearance.colorControlButtonText
      }
      return (
        <div id="new_array_subform_button_container" style={{'margin-top': '20px'}}>
          <button
            id="new_array_subform_button"
            style={buttonStyle}
            onClick={() => this.props.onClick_moveToPage("prev")}>
            Prev
          </button>
          <button
            id="new_array_subform_button"
            style={buttonStyle}
            onClick={() => this.props.onClick_moveToPage("next")}>
            Next
          </button>
        </div>
      );
    }
  }

  // Conditional Render --------------------------------------------------------

  // returns true if this component should be rendered, false otherwise
  checkConditionalRender() {
    if (this.getID() in this.props.conditionalRenderLookup) {
      return this.props.conditionalRenderLookup[this.getID()];
    } else {
      return true;
    }
  }



  // get children --------------------------------------------------------------

  getChildrenToRender() {

    let childrenToRender = [];

    // for each child, call their render function
    for (let i = 0; i < this.props.order.length; i++) {


      // get full child object from this.subforms or this.items
      let childFormID = this.props.order[i]["id"];
      let childOutputID = this.props.formOutput.getRelevantVersionOfID(childFormID, this.getID());
      let childOutput = this.props.formOutput.get(childOutputID);
      let child;
      if (this.props.order[i]["type"] === "ConjureForm") {
        child = this.props.subforms[childFormID];
      } else if (this.props.order[i]["type"] === "ConjureFormItem"){
        child = this.props.items[childFormID];
      }

      // get subcards
      // if the child is an array of subcards, we need to get the subcards properly
      let convertedID = this.props.idConversionTable[childFormID];
      let subcardsArray = this.props.formOutput.get(convertedID);

      // boolean check to make sure that a child is an array with more than 1 object
      let checkIfActiveArray = function(child, childOutput) {
        return (
          (child.formDetails.maxForms > 1) &&
          (childOutput !== false) &&
          (Array.isArray(childOutput))
        );
      }

      // handle case that child is an array of cards AND has multiple forms active in output
      if (
          (
            (this.props.order[i]["type"] === "ConjureForm") &&
            (child.formDetails.containerType === "card") &&
            (checkIfActiveArray(child, childOutput))
          ) ||
          (
            (this.props.order[i]["type"] === "ConjureForm") &&
            (child.formDetails.containerType === "subcard") &&
            (checkIfActiveArray(child, childOutput)) &&
            (! checkIfActiveArray(child, subcardsArray))
          )
        ) {

          // iterate over the output and add items for each
          for (let j = 0; j < childOutput.length; j++) {

            let formOutput = this.props.formOutput;
            let idConversionTable = formOutput.getIDConversionTable(childOutput[j]);
            let selectForm = this.props.onClick_selectForm;
            let devModeOn = this.props.devModeOn;
            let answerInput = this.props.onInput_answerFormQuestion;
            let answerMC = this.props.onClick_answerMultipleChoiceQuestion;
            let addNewSubformToArray = this.props.onClick_addNewSubformToArray;
            let indexInArray = j;
            let removeSubform = this.props.onClick_removeSubformFromArray;
            let conditionalRenderLookup = this.props.conditionalRenderLookup;
            let moveToPage = this.props.onClick_moveToPage;
            let rendered = child.render(formOutput, selectForm, devModeOn, this.props.selectedID, answerInput, answerMC, addNewSubformToArray, idConversionTable, indexInArray, removeSubform, conditionalRenderLookup, moveToPage);
            childrenToRender.push(rendered);
          }

      // handle case where child is an array of subcards
      } else if (
        (this.props.order[i]["type"] === "ConjureForm") &&
        (child.formDetails.containerType === "subcard") &&
        (checkIfActiveArray(child, subcardsArray))
      ) {

        // iterate over the output and add items for each
        for (let j = 0; j < subcardsArray.length; j++) {

          let formOutput = this.props.formOutput;
          let idConversionTable = formOutput.getIDConversionTable(subcardsArray[j]);
          idConversionTable[childFormID] = this.props.idConversionTable[childFormID]; // add parent array ID to idConversion Lookup table
          let selectForm = this.props.onClick_selectForm;
          let devModeOn = this.props.devModeOn;
          let answerInput = this.props.onInput_answerFormQuestion;
          let answerMC = this.props.onClick_answerMultipleChoiceQuestion;
          let addNewSubformToArray = this.props.onClick_addNewSubformToArray;
          let indexInArray = j;
          let removeSubform = this.props.onClick_removeSubformFromArray;
          let conditionalRenderLookup = this.props.conditionalRenderLookup;
          let moveToPage = this.props.onClick_moveToPage;
          let rendered = child.render(formOutput, selectForm, devModeOn, this.props.selectedID, answerInput, answerMC, addNewSubformToArray, idConversionTable, indexInArray, removeSubform, conditionalRenderLookup, moveToPage);
          childrenToRender.push(rendered);
        }

      // otherwise, just render the child normally
      } else {
        let formOutput = this.props.formOutput;
        let idConversionTable = this.props.idConversionTable;
        let selectForm = this.props.onClick_selectForm;
        let devModeOn = this.props.devModeOn;
        let answerInput = this.props.onInput_answerFormQuestion;
        let answerMC = this.props.onClick_answerMultipleChoiceQuestion;
        let addNewSubformToArray = this.props.onClick_addNewSubformToArray;
        let removeSubform = this.props.onClick_removeSubformFromArray;
        let conditionalRenderLookup = this.props.conditionalRenderLookup;
        let moveToPage = this.props.onClick_moveToPage;
        let rendered = child.render(formOutput, selectForm, devModeOn, this.props.selectedID, answerInput, answerMC, addNewSubformToArray, idConversionTable, -1, removeSubform, conditionalRenderLookup, moveToPage);
        childrenToRender.push(rendered);
      }
    }

    return childrenToRender;
  }


  // render --------------------------------------------------------------------

  // determine border styling for <ConjureFormComponent/>
  getBorderStyling() {
    if (this.props.devModeOn) {
      if (this.props.selectedID === this.getID()) {
        return "dev_mode_selected";
      } else {
        return"dev_mode_hover";
      }
    } else {
      return "dev_mode_off_border";
    }
  }


  // render <ConjureFormComponent/>
  // - because ConjureForm can have ConjureForms and ConjureFormItems as children,
  //      we need to call their render functions as well:
  //      <ConjureForm
  //        {children}
  //      />
  //
  // - objects in this.props.subforms and this.props.items are ConjureForm and ConjureFormItem classes
  //      they ARE NOT <ConjureFormComponent/> or <ConjureFormItemComponent/>
  render() {

    // if ConjureForm should be rendered, do so
    if (this.checkConditionalRender()) {

      return (
        <div
          id="ConjureFormComponent"
          className={this.getBorderStyling()}
          onClick={this.onClick_selectForm}>
          <div
            className={this.getContainerCSS(this.props.containerType)}
            style={this.getContainerStyling(this.props.containerType)}>
            {this.renderDismissButton()}
            {this.getChildrenToRender()}
            {this.renderEmptySpace()}
          </div>
          {this.renderAddNewButton()}
          {this.renderPageButtons()}

        </div>
      );

    // otherwise, form should not be rendered so return an empty div
    } else {
      return (
        <div></div>
      );
    }
  }
}

export default ConjureFormComponent;
