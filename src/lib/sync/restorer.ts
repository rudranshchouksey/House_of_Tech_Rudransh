import * as Y from 'yjs';
import diff from 'fast-diff';

/**
 * Deterministically transitions a `Y.Doc` to match the state of a historical `Y.Doc`.
 * It computes the string difference between the historical Y.Text and the current Y.Text,
 * and applies new insertions/deletions to the current document.
 * This guarantees that the Time Travel restoration is appended to the CRDT log and syncs
 * safely with other active peers without destroying their active states.
 * 
 * @param currentDoc The active Yjs document being edited.
 * @param historicalSnapshotBlob The binary Uint8Array snapshot of the historical version.
 * @param textKey The name of the Y.Text shared type (default: 'content').
 */
export function restoreDocumentState(currentDoc: Y.Doc, historicalSnapshotBlob: Uint8Array, textKey = 'content') {
  const historicalDoc = new Y.Doc();
  Y.applyUpdate(historicalDoc, historicalSnapshotBlob);

  const currentText = currentDoc.getText(textKey);
  const historicalText = historicalDoc.getText(textKey);

  const currentString = currentText.toString();
  const historicalString = historicalText.toString();

  // Diff current against historical to figure out how to transition back.
  // diff(oldString, newString) -> returns instructions to convert old to new.
  const differences = diff(currentString, historicalString);

  currentDoc.transact(() => {
    let cursor = 0;

    for (const [operation, text] of differences) {
      if (operation === diff.EQUAL) {
        cursor += text.length;
      } else if (operation === diff.DELETE) {
        currentText.delete(cursor, text.length);
      } else if (operation === diff.INSERT) {
        currentText.insert(cursor, text);
        cursor += text.length;
      }
    }
  }, 'time-travel-restore');
}
