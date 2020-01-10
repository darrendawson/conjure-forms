import React, { Component } from 'react';
import './FormQuestionInput.css';

class FormQuestionInput extends Component {

  constructor() {
    super();

    // bind functions so they can access `this` in an es5 compliant way
    this.onInput_answerQuestion = this.onInput_answerQuestion.bind(this);
  }

  // onInput -------------------------------------------------------------------

  onInput_answerQuestion(e) {
    if (this.props.inputType === "string") {
      this.props.onInput_answerFormQuestion(this.props.itemID, e.target.value);
    } else if (this.props.inputType === "number") {
      let numValue = parseFloat(e.target.value);
      this.props.onInput_answerFormQuestion(this.props.itemID, numValue);
    }
  }
  // render --------------------------------------------------------------------

  // Renders <FormQuestionInput/>
  render() {

    let inputStyle = {
      'background-color': this.props.backgroundColor,
      'color': this.props.textColor,
      'border-color': this.props.borderColor
    };


    if (this.props.devModeOn) {
      return (
        <div id="FormQuestionInput">
          <input
            id="question_input"
            style={inputStyle}
            placeholder={this.props.prompt}
            value={this.props.inputValue}
          />
        </div>
      );
    } else {
      return (
        <div id="FormQuestionInput">
          <input
            id="question_input"
            style={inputStyle}
            placeholder={this.props.prompt}
            value={this.props.inputValue}
            onChange={this.onInput_answerQuestion.bind(this)}
          />

        </div>
      );
    }

  }
}

export default FormQuestionInput;
