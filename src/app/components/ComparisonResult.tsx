import { ReactElement } from "react";
import { ChangesDto } from "../actions/changeComparison";

interface ComparisonResultProps {
    changeOutput: ChangesDto;
}

export const ComparisonResult = ({ changeOutput }: ComparisonResultProps): ReactElement => {
    return (
        <div className="card bg-base-100 shadow-xl mb-4 p-4">
            <h5 className="text-xl font-semibold mb-2">{changeOutput.name}</h5>
            <textarea 
                value={changeOutput.changes.join('\n')} 
                disabled={true} 
                className="textarea textarea-bordered w-full mb-2 overflow-x-auto"
                style={{ whiteSpace: 'pre' }} // Preserve whitespace and line breaks
                rows={10} // Adjust this value to display more lines
            />
            <p className="text-sm">Count: {changeOutput.count}</p>
        </div>
    );
};
