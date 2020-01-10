import React, { Component } from 'react';
import './MultipleChoiceMaker.css';

class MultipleChoiceMaker extends Component {

  constructor() {
    super();

    this.state = {
      newChoiceInputText: ""
    }
  }

  // onClick / onInput ---------------------------------------------------------

  onInput_updateNewChoiceInputText = (e) => {
    this.setState({newChoiceInputText: e.target.value});
  }


  onClick_insertNewChoice = () => {
    let choices = this.props.choices;
    let newChoice = this.state.newChoiceInputText;

    if (choices.indexOf(newChoice) < 0 && newChoice !== "") {
      choices.push(newChoice);
      this.props.onClick_updateItemDetail("choices", choices);
      this.setState({newChoiceInputText: ""});
    }
  }

  onClick_deleteChoice = (choiceToDelete) => {
    let updatedChoices = [];
    for (let i = 0; i < this.props.choices.length; i++) {
      if (this.props.choices[i] !== choiceToDelete) {
        updatedChoices.push(this.props.choices[i]);
      }
    }
    this.props.onClick_updateItemDetail("choices", updatedChoices);
  }



  // render --------------------------------------------------------------------

  renderChoices = () => {

    let choices = this.props.choices;
    let renderChoices = [];

    for (let i = 0; i < choices.length; i++) {
      renderChoices.push(
        <div className="choice_row">
          <div className="choice_item">
            <p className="choice_text">{choices[i]}</p>
          </div>
          <button className="delete_choice_button" onClick={() => this.onClick_deleteChoice(choices[i])}>x</button>
        </div>
      );
    }

    return (
      <div id="choices_container">
        {renderChoices}
      </div>
    );
  }
  // Renders <MultipleChoiceMaker/>
  render() {
    return (
      <div id="MultipleChoiceMaker">

        <div id="title_container">
          <h3 className="input_title">Choices</h3>
        </div>

        <div id="choices_container">
          <div id="new_choice_row">
            <input
              value={this.state.newChoiceInputText}
              onChange={this.onInput_updateNewChoiceInputText.bind(this)}
            />
            <button id="add_new_choice_button" onClick={this.onClick_insertNewChoice}>+</button>
          </div>

          {this.renderChoices()}
        </div>

      </div>
    );
  }
}

export default MultipleChoiceMaker;
