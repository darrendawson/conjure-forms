import React, { Component } from 'react';
import './ProductionFormContainer.css';

class ProductionFormContainer extends Component {

  constructor() {
    super();

    // bind functions so they can access this.state
    this.getBackgroundColorForPage = this.getBackgroundColorForPage.bind(this);
  }


  getBackgroundColorForPage() {
    let conjureForm = this.props.conjureForm;
    let pageIndex = this.props.currentPageIndex;
    if (conjureForm['order'].length > pageIndex) {
      let pageID = conjureForm['order'][pageIndex]['id'];
      let pageInfo = conjureForm['subforms'][pageID];
      return pageInfo.appearance.colorBackground;
    } else {
      return '#eaeaea'; // default
    }
  }

  // render --------------------------------------------------------------------

  // Renders <ProductionFormContainer/>
  render() {

    let conjureForm = this.props.conjureForm;
    let formOutput = this.props.formOutput;
    let selectForm = () => {};                 // because <ProductionFormContainer/> is used for answering forms, you can't "select" a form section
    let devModeOn = false;                     // devModeOn is false for <ProductionFormContainer/>
    let selectedID = false;                    // there is no such thing as a selected form in production
    let onInput_answerFormQuestion = this.props.onInput_answerFormQuestion;
    let answerMC = this.props.onClick_answerMultipleChoiceQuestion;
    let addNewSubformToArray = this.props.onClick_addNewSubformToArray;
    let removeSubform = this.props.onClick_removeSubformFromArray;
    let conditionalRenderLookup = formOutput.createConditionalRenderLookupTable();
    conditionalRenderLookup = conjureForm.addPagesToConditionalRenderLookup(conditionalRenderLookup, this.props.currentPageIndex);
    let moveToPage = this.props.onClick_moveToPage;

    return (
      <div id="ProductionFormContainer" style={{'background-color': this.getBackgroundColorForPage()}}>
        <div id="form_container">
          {conjureForm.render(formOutput, selectForm, devModeOn, selectedID, onInput_answerFormQuestion, answerMC, addNewSubformToArray, {}, -1, removeSubform, conditionalRenderLookup, moveToPage)}
        </div>
      </div>
    );
  }
}

export default ProductionFormContainer;
