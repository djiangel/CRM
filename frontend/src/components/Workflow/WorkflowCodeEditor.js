import React, { Component } from 'react'
import {Controlled  as CodeMirror} from 'react-codemirror2'


// require styles
import "codemirror/lib/codemirror.css";
import "codemirror/mode/python/python.js";
import "codemirror/theme/base16-dark.css";

// require active-line.js
import "codemirror/addon/selection/active-line.js";
// styleSelectedText
import "codemirror/addon/selection/mark-selection.js";
import "codemirror/addon/search/searchcursor.js";
// hint
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/show-hint.css";

import "codemirror/addon/selection/active-line.js";
// highlightSelectionMatches
import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/match-highlighter.js";
// keyMap
import "codemirror/mode/clike/clike.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";
import "codemirror/keymap/sublime.js";


export class WorkflowCodeEditor extends Component {
    state={ value : {...this.props}}

    render() {
        return (
            <CodeMirror
                value={this.state.value.callback_function.body}
                options={{
                    tabSize: 4,
                    styleActiveLine: false,
                    lineNumbers: true,
                    styleSelectedText: false,
                    line: true,
                    foldGutter: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                    mode: "text/x-python",
                    hintOptions: {
                        completeSingle: false
                      },
                    keyMap: "sublime",
                    matchBrackets: true,
                    showCursorWhenSelecting: true,
                    extraKeys: { "Ctrl-Space": "autocomplete" },
                    readOnly: this.state.value.read_only? "nocursor" : false
                }}
                onBeforeChange={(editor, data, value) => {

                    this.setState({value:{callback_function: {body :value}}})
                    this.props.codeChangesHandler(value);
                  }}
            />
        )
    }
}


export default WorkflowCodeEditor;
