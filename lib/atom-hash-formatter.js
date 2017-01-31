'use babel';

import AtomHashFormatterView from './atom-hash-formatter-view';
import { CompositeDisposable } from 'atom';

export default {

  atomHashFormatterView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomHashFormatterView = new AtomHashFormatterView(state.atomHashFormatterViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomHashFormatterView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-hash-formatter:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomHashFormatterView.destroy();
  },

  serialize() {
    return {
      atomHashFormatterViewState: this.atomHashFormatterView.serialize()
    };
  },

  toggle() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {

      // get selection
      let selection = editor.getSelectedText();

      // send to conversion
      converted = this.convert(selection);

      // replace editor text
      editor.insertText(converted)
      editor.selectAll();
      editor.autoIndentSelectedRows();
    }
  },

  convert(text) {

    // get text
    selection = text;

    // replace \" with just a "
    selection = selection.replace(/\\"/g, '"');

    // line breaks and tab for {
    selection = selection.replace(/\{/g, '\r\n{\r\n\t');

    // line breaks and tab for }
    selection = selection.replace(/\}/g, '\r\n}\r\n');

    // line breaks for @
    selection = selection.replace(/@/g, '\r\n@');

    // replace properties with new line
    //selection = selection.replace(/(@properties={)([^}]*)/g, '\r\n');

    // rails object new line
    selection = selection.replace(/#</g, '\r\n\t#<');

    // replace ], with new line
    selection = selection.replace(/],/g, '],\r\n');

    // match @properties and get grouped property list
    regex = /(@properties={)([^}]*)/g;

    // execute regex
    properties = regex.exec(selection);

    // loop through all matches
    while(properties != null) {

      // get this match
      this_match = properties[2];

      // format match into what we want to replace with
      formatted_match = this_match.replace(/("[a-zA-Z0-9][^"]*"=>)/g, '\r\n\t$1');

      // replace selection with content
      selection = selection.replace(this_match, formatted_match);

      // keep executing matches
      properties = regex.exec(selection);

    }

    // return
    return selection;

  }

};
