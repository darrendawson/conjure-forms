import React, { Component } from 'react';
import './ConditionalMaker.css';

import RenderFormOutputObject from '../RenderFormOutputObject/RenderFormOutputObject.js';
import MultipleChoice from '../../Render/QuestionTypes/MultipleChoice/MultipleChoice.js';

class ConditionalMaker extends Component {

  constructor() {
    super();

    this.state = {
      expanded: false,
      expandedCategory: false
    }
  }

  // onClick -------------------------------------------------------------------

  // handles cases where user clicks on the questionID or questionValue button
  onClick_selectButton = (category) => {

    // 1) user is clicking on an already expanded option -> close it!
    if (this.state.expanded && (category === this.state.expandedCategory)) {
      this.setState({'expanded': false, 'expandedCategory': false});

    // 2) user is clicking on a different option -> keep component expanded, but select the new one
    } else if (this.state.expanded && (category !== this.state.expandedCategory)) {
      this.setState({'expanded': true, 'expandedCategory': category});

    // 3) component isnt expanded -> expand and select the clicked category
    } else if (!this.state.expanded) {
      this.setState({'expanded': true, 'expandedCategory': category});
    }
  }



  // gets passed to <RenderFormOutputObject/>
  // when a user clicks on a MC question ID, updates itemDetails.renderCondition.questionID
  onClick_selectQuestionID = (formID) => {

    // make sure user is actually selecting a new formID
    if (this.props.questionConditionID !== formID) {

      // perform update
      let renderCondition = {'questionID': formID, 'questionValue': false};
      this.props.onClick_updateItemDetail('renderCondition', renderCondition);

    }

    // close the <RenderFormOutputObject/>
    this.setState({'expanded': false, 'expandedCategory': false})
  }


  onClick_selectQuestionValue = (value) => {
    if (this.props.questionConditionValue !== value) {
      let renderCondition = {'questionID': this.props.questionConditionID, 'questionValue': value};
      this.props.onClick_updateItemDetail('renderCondition', renderCondition);
    }

    // close the <MultipleChoice/>
    this.setState({'expanded': false, 'expandedCategory': false})
  }

  // render --------------------------------------------------------------------

  // button that user presses to toggle <RenderFormOutputObject/>
  renderSelectQuestionButton = () => {

    let questionID = this.props.questionConditionID;
    let formDetails = this.props.formDetailsLookup;

    // get name to render
    let questionText = "(question)";
    if (questionID) {

      // make questionID -> outputID conversion if possible
      if ((questionID in formDetails) && (formDetails[questionID]['outputID'] !== questionID)) {
        questionText = formDetails[questionID]['outputID'];
      } else {
        questionText = questionID;
      }
    }

    // get coloring on the button
    let questionCSS = "question_button";
    if (this.state.expandedCategory === "questionID") {
      questionCSS = "question_button_selected";
    }

    // render
    return (
      <button
        className={questionCSS}
        onClick={() => this.onClick_selectButton("questionID")}>
        {questionText}
      </button>
    );
  }


  // button user clicks to toggle selecting value from multiple choice
  renderSelectValueButton = () => {

    // render <MultipleChoice/> so user can select a value
    if (this.props.questionConditionID !== false) {

      // get choices
      let itemDetails = this.props.formDetailsLookup[this.props.questionConditionID];
      let selectedChoices = [];
      if (this.props.questionConditionValue !== false) {
        selectedChoices.push(this.props.questionConditionValue);
      }

      // determine whether "no answer" is a valid answer
      let minSelected = (itemDetails.minSelected > 0) ? 1 : 0;

      return (
        <MultipleChoice
          questionID={this.props.questionConditionID}
          choices={itemDetails.choices}
          backgroundColor="#353535"
          borderColor="white"
          textColor="white"
          minSelected={minSelected}
          maxSelected={1}
          multipleChoiceType="dropdown"
          devModeOn={false}
          selectedChoices={selectedChoices}
          onClick_answerMultipleChoiceQuestion={this.onClick_selectQuestionValue}
        />
      );


    // otherwise, there arent any options to select
    } else {
      return (<button className="question_button_unclickable">(value)</button>);
    }
  }


  // user clicks on selectQuestion and selectValue buttons to expand <ConditionalMaker/>
  renderSelectionMenu = () => {
    return (
      <div id="selection_row">
        <h3 className="text">If</h3>
        {this.renderSelectQuestionButton()}
        <h3 className="text">includes</h3>
        {this.renderSelectValueButton()}
      </div>
    );
  }


  renderExpandedSelectQuestionID = () => {
    if (this.state.expanded && this.state.expandedCategory === "questionID") {
      return (
        <RenderFormOutputObject
          selectedID={this.props.questionConditionID}
          formOutputObject={this.props.formOutputObject}
          formDetailsLookup={this.props.formDetailsLookup}
          renderTextClickable={true}
          bannedIDs={this.props.bannedIDs}
          onClick_selectFormSection={this.onClick_selectQuestionID}
        />
      );
    }
  }
  // Renders <ConditionalMaker/>
  render() {
    return (
      <div id="ConditionalMaker">
        {this.renderSelectionMenu()}
        {this.renderExpandedSelectQuestionID()}
      </div>
    );
  }
}

export default ConditionalMaker;
