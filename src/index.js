/*
  ConjureFormController is the root class for ConjureForms
*/

import React from 'react';

import ProductionFormContainer from './Render/ProductionFormContainer/ProductionFormContainer.js';
import ConjureForm from './ConjureForm.js';

class ConjureFormController {

  constructor(formJSON = false, rerenderFunction) {
    this.conjureForm = new ConjureForm();
    if (formJSON !== false) {
      this.conjureForm.loadConjureForm(formJSON);
    }
    this.formOutput = this.conjureForm.getFormOutputObject();
    this.currentPage = 0;

    // so that ConjureFormController can envoke the parent component to rerender
    this.rerender = rerenderFunction;

    // bind class functions so they have the proper version of `this`
    this.onInput_answerFormQuestion           = this.onInput_answerFormQuestion.bind(this);
    this.onClick_answerMultipleChoiceQuestion = this.onClick_answerMultipleChoiceQuestion.bind(this);
    this.onClick_addNewSubformToArray         = this.onClick_addNewSubformToArray.bind(this);
    this.onClick_removeSubformFromArray       = this.onClick_removeSubformFromArray.bind(this);
    this.onClick_moveToPage                   = this.onClick_moveToPage.bind(this);
    this.renderForm                           = this.renderForm.bind(this);
  }

  // ConjureForm Functions -----------------------------------------------------
  /*
    Functions that get passed to ConjureForm so it can manage state when user answers questions
  */

  onInput_answerFormQuestion(itemID, value) {
    this.formOutput.answerInputQuestion(value, itemID);
    this.rerender();
  }

  onClick_answerMultipleChoiceQuestion(value, itemID) {
    this.formOutput.answerMultipleChoiceQuestion(value, itemID);
    this.rerender();
  }

  onClick_addNewSubformToArray(arrayID) {
    this.formOutput.declareNewArrayItem(arrayID);
    this.rerender();
  }

  onClick_removeSubformFromArray(arrayID, subformIndex) {
    this.formOutput.removeArrayItem(arrayID, subformIndex);
    this.rerender();
  }

  onClick_moveToPage(moveType) {
    if (moveType == "next") {
      this.currentPage += 1;
      this.rerender();
    } else if (moveType == "prev" && this.currentPage > 0) {
      this.currentPage -= 1;
      this.rerender();
    }
  }

  // Render --------------------------------------------------------------------

  renderForm() {
    return (
      <ProductionFormContainer
        conjureForm={this.conjureForm}
        formOutput={this.formOutput}
        currentPageIndex={this.currentPage}
        onClick_deselectItem={() => this.onClick_selectFormSection(false)}
        onInput_answerFormQuestion={this.onInput_answerFormQuestion}
        onClick_answerMultipleChoiceQuestion={this.onClick_answerMultipleChoiceQuestion}
        onClick_addNewSubformToArray={this.onClick_addNewSubformToArray}
        onClick_removeSubformFromArray={this.onClick_removeSubformFromArray}
        onClick_moveToPage={this.onClick_moveToPage}
      />
    );
  }
}

export default ConjureFormController;
