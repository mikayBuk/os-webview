import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import {faStarHalf} from '@fortawesome/free-solid-svg-icons/faStarHalf';
import './stars-and-count.scss';

export function roundedRating(rating) {
    return rating.toFixed(1);
}

export function FullStar() {
    return (
        <FontAwesomeIcon icon={faStar} className="full" />
    );
}

function HalfStar() {
    return (
        <span className="overlaid-stars">
            <FontAwesomeIcon icon={faStar} className="empty" />
            <FontAwesomeIcon icon={faStarHalf} className="full" />
        </span>
    );
}

export function EmptyStar() {
    return (
        <FontAwesomeIcon icon={faStar} className="empty" />
    );
}

export function Stars({stars}) {
    const starIcons = [1, 2, 3, 4, 5].map((pos) => {
        if (stars >= pos - 0.25) {
            return FullStar;
        }
        if (stars >= pos - 0.75) {
            return HalfStar;
        }
        return EmptyStar;
    });

    return (
        <span className="stars">
            {
                starIcons.map((Tag, idx) => <Tag key={idx} />)
            }
        </span>
    );
}

// ** RESTORE when using ratings again
// export default function StarsAndCount({rating=0, count=0, showNumber=false}) {
//     const s = count !== 1 ? 's' : '';

//     return (
//         <div className="stars-and-count">
//             <Stars stars={rating} />
//             {showNumber && (count > 0) && roundedRating(rating)}
//             <span>({`${count || 'no'} review${s}`})</span>
//         </div>
//     );
// }

export default function StarsAndCount() {
    return null;
}
