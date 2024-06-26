import React from 'react';
import {Stars} from '~/components/stars-and-count/stars-and-count';
import usePageContext from './page-context';
import usePartnerContext from '../partner-context';
import {useMyReview} from './rating-form';
import ClippedText from '~/components/clipped-text/clipped-text';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';
import './user-review.scss';

function UserControls({status}) {
    const {togglePage} = usePageContext();
    const {postRating} = usePartnerContext();
    const myReview = useMyReview();
    const displayStatus = ['Deleted', 'Rejected'].includes(status) ? status : 'pending';
    const onUpdate = React.useCallback(
        (event) => {
            event.preventDefault();
            togglePage();
        },
        [togglePage]
    );
    const onDelete = React.useCallback(
        (event) => {
            event.preventDefault();
            // eslint-disable-next-line no-alert
            if (window.confirm('Are you sure you want to delete this review?')) {
                postRating({id: myReview.id}, 'DELETE');
            }
        },
        [postRating, myReview]
    );

    return (
        <React.Fragment>
            {status !== 'Approved' && <span className="review-status">{displayStatus}</span>}
            <div className="user-controls">
                {
                    status !== 'Deleted' &&
                        <React.Fragment>
                            <a href="!delete" onClick={onDelete}>Delete</a>
                            &nbsp;&bull;&nbsp;
                        </React.Fragment>
                }
                <a href="!update" onClick={onUpdate}>Update</a>
            </div>
        </React.Fragment>
    );
}

function ReviewAndResponse({review, response}) {
    const {partnerName} = usePartnerContext();

    return (
        <React.Fragment>
            <ClippedText className="review">{review}</ClippedText>
            {
                response &&
                    <div className="response">
                        <div className="partner-name">{partnerName}</div>
                        <ClippedText>
                            {response}
                        </ClippedText>
                    </div>
            }
        </React.Fragment>
    );
}

// eslint-disable-next-line complexity
export default function UserReview({
    initials, userName, rating, review, updated, response, status, userFacultyStatus,
    allowEdit=false
}) {
    const showTheReview = allowEdit || (review && status === 'Approved');
    const isVerified = userFacultyStatus === 'confirmed_faculty';

    if (!showTheReview) {
        return null;
    }

    return (
        <div className="user-review">
            <div className="initial-circle">
                <span className="initials">{initials}</span>
                {isVerified && <FontAwesomeIcon className="verified-check" icon={faCheck} />}
            </div>
            <div className="name-and-verified">
                <span className="name">{userName}</span>
                {isVerified && <div className="verified-tag">Verified Instructor</div>}
            </div>
            <div className="rating-and-controls stars-and-count">
                <Stars stars={rating} />
                <span className="updated">{updated}</span>
                {allowEdit && <UserControls status={status} />}
            </div>
            <ReviewAndResponse review={review} response={response} />
        </div>
    );
}
