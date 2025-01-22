import React, { useState, useRef } from 'react';
import { Editor, EditorState, Modifier, SelectionState, CompositeDecorator } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './Editor.css';
import Suggestions from './Suggestions';

// Strategy to find autocomplete entries in the content
const findAutocompleteEntries = (contentBlock, callback, contentState) => {
    const text = contentBlock.getText();
    const regex = /\[\[(.*?)\]\]/g; // Match autocomplete entries (e.g., [[autocomplete]])
    let matchArr;
    while ((matchArr = regex.exec(text)) !== null) {
        callback(matchArr.index, matchArr.index + matchArr[0].length);
    }
};

// Decorator to style autocomplete entries
const AutocompleteDecorator = {
    strategy: findAutocompleteEntries,
    component: (props) => (
        <span className="autocomplete-entry">
            {props.children}
        </span>
    ),
};

const MyEditor = () => {
    const [editorState, setEditorState] = useState(
        EditorState.createEmpty(new CompositeDecorator([AutocompleteDecorator]))
    );
    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const editorRef = useRef(null);

    const staticSuggestions = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape'];

    const detectAutocompleteTrigger = (newState) => {
        const content = newState.getCurrentContent();
        const selection = newState.getSelection();
        const blockKey = selection.getStartKey();
        const blockText = content.getBlockForKey(blockKey).getText();
        const cursorPosition = selection.getStartOffset();

        const textBeforeCursor = blockText.substring(0, cursorPosition);
        if (textBeforeCursor.endsWith('<>')) {
            setSuggestions(staticSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleChange = (newState) => {
        setEditorState(newState);
        detectAutocompleteTrigger(newState);
    };

    // Handling keyDown for arrow keys and enter/tab
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent editor from handling Enter or Tab
            setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent editor from handling Enter or Tab
            setActiveIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1));
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (suggestions[activeIndex]) {
                insertSuggestion(suggestions[activeIndex]);
                e.preventDefault(); // Prevent editor from handling Enter or Tab
            }
        }
    };

    const insertSuggestion = (suggestion) => {
        const content = editorState.getCurrentContent();
        const selection = editorState.getSelection();

        const blockKey = selection.getStartKey();
        const blockText = content.getBlockForKey(blockKey).getText();
        const cursorPosition = selection.getStartOffset();
        const start = blockText.lastIndexOf('<>', cursorPosition - 1);

        // Define the range to replace
        const newSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: start,
            focusOffset: cursorPosition,
        });

        // Replace the text with the suggestion
        const newContent = Modifier.replaceText(
            content,
            newSelection,
            `[[${suggestion}]]`, // Enclose suggestion in special syntax
            null // No inline style
        );

        // Set the new content state
        const updatedEditorState = EditorState.push(editorState, newContent, 'insert-characters');

        // Move the cursor to the end of the inserted suggestion
        const newCursorPosition = start + `[[${suggestion}]]`.length;
        const newEditorStateWithSelection = EditorState.forceSelection(
            updatedEditorState,
            SelectionState.createEmpty(blockKey).merge({
                anchorOffset: newCursorPosition,
                focusOffset: newCursorPosition,
            })
        );

        setEditorState(newEditorStateWithSelection);
        setSuggestions([]); // Clear suggestions after insertion
        setActiveIndex(0); // Reset active index
    };


    return (
        <div className="editor-container" onKeyDown={handleKeyDown}>
            <Editor
                ref={editorRef}
                editorState={editorState}
                onChange={handleChange}
            />
            {suggestions.length > 0 && (
                <Suggestions
                    suggestions={suggestions}
                    activeIndex={activeIndex}
                    onSelect={(item) => insertSuggestion(item)}
                />
            )}
        </div>
    );
};

export default MyEditor;
