import React from "react";
import PropTypes from "prop-types";
import QuestionsTableRow from "./QuestionsTableRow";
import { questionTableColumnFields } from "./columns";

const QuestionsTableBody = (props) => {
  const { rows, disabled, checkedRowsMap, onEdit, onCheck } = props;

  return (
    <tbody>
      {rows.map((row) => (
        <QuestionsTableRow
          key={row[questionTableColumnFields.questionId]}
          row={row}
          onEdit={() => onEdit(row[questionTableColumnFields.questionId])}
          disabled={disabled}
          checked={checkedRowsMap[row[questionTableColumnFields.questionId]]}
          onCheck={() => onCheck(row[questionTableColumnFields.questionId])}
        />
      ))}
    </tbody>
  );
};

QuestionsTableBody.propTypes = {
  disabled: PropTypes.bool,
  checkedRowsMap: PropTypes.object,
  onCheck: PropTypes.func.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default QuestionsTableBody;
