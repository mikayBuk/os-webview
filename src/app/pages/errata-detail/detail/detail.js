import React from 'react';
import RawHTML from '~/components/jsx-helpers/raw-html';
import {useErrataDetail, shouldShowDecisionDetails} from '~/helpers/errata';
import './detail.scss';

const detailDataPairs = [
    ['Submission ID', 'id'],
    ['Title', 'bookTitle'],
    ['Source', 'source'],
    ['Status', 'status'],
    ['Error Type', 'errorType'],
    ['Location', 'location'],
    ['Description', 'detail'],
    ['Date Submitted', 'date']
];
const decisionDataPairs = [
    ['Decision', 'resolutionNotes']
];

function LabelValuePairs({detail, pairs}) {
    return (
        <React.Fragment>
            {
                pairs.map((pair) =>
                    <div className="label-value-pair" key={pair[0]}>
                        <div className="label">{pair[0]}</div>
                        <RawHTML className="value" html={detail[pair[1]] || ''} />
                    </div>
                )
            }
        </React.Fragment>
    );
}

export default function Detail({data}) {
    const detail = useErrataDetail(data);

    if (!detail) {
        return null;
    }
    const showDecisionDetails = shouldShowDecisionDetails(data);

    return (
        <React.Fragment>
            {
                showDecisionDetails &&
                    <div className="info body-block graybottom">
                        <LabelValuePairs detail={detail} pairs={decisionDataPairs} />
                    </div>
            }
            <div className="info body-block">
                <LabelValuePairs detail={detail} pairs={detailDataPairs} />
            </div>
            <div className="note">
                {'You can check the status of all errata submissions on the '}
                <a href={`/errata/?book=${encodeURIComponent(detail.bookTitle)}`}>
                    <RawHTML Tag="span" html={detail.bookTitle} />
                    {' '}Errata Page
                </a>.
            </div>
        </React.Fragment>
    );
}
