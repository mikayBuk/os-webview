import React, {useRef, useEffect} from 'react';
import useActiveElementContext from '~/contexts/active-element';
import useLanguageContext from '~/contexts/language';
import $ from '~/helpers/$';
import cn from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBook} from '@fortawesome/free-solid-svg-icons/faBook';
import {faChalkboardTeacher} from '@fortawesome/free-solid-svg-icons/faChalkboardTeacher';
import {faEllipsisV} from '@fortawesome/free-solid-svg-icons/faEllipsisV';
import {faGraduationCap} from '@fortawesome/free-solid-svg-icons/faGraduationCap';
import LazyLoad from 'react-lazyload';

function QuickLink({url, icon, text}) {
    return (
        <a href={url}>
            <FontAwesomeIcon icon={icon} />
            {text}
        </a>
    );
}

// Ideally, we would fetch these from the CMS
const qlLabelsByLanguage = {
    en: [
        'Get this book',
        'Instructor Resources',
        'Student Resources'
    ],
    es: [
        'Consigue este libro',
        'Recursos del instructor',
        'Recursos para estudiantes'
    ]
};

function Dropdown({urlBase, details}) {
    const {language} = useLanguageContext();
    const labels = qlLabelsByLanguage[language];

    function stopClickPropagation(event) {
        event.stopPropagation();
    }

    return (
        <div className="ur-dropdown" onClick={stopClickPropagation}>
            <QuickLink url={urlBase} icon={faBook} text={labels[0]} />
            {
                details.hasFacultyResources &&
                    <QuickLink
                        url={`${urlBase}?${labels[1]}`}
                        icon={faChalkboardTeacher} text={labels[1]}
                    />
            }
            {
                details.hasStudentResources &&
                    <QuickLink
                        url={`${urlBase}?${labels[2]}`}
                        icon={faGraduationCap} text={labels[2]} />
            }
        </div>
    );
}

// eslint-disable-next-line complexity
function handleKeysInMenu(event) {
    const el = document.activeElement;

    switch (event.key) {
    case 'ArrowUp':
        (el.previousSibling || el).focus();
        event.preventDefault();
        break;
    case 'ArrowDown':
        (el.nextSibling || el).focus();
        event.preventDefault();
        break;
    case 'Escape':
        document.activeElement.blur();
        event.preventDefault();
        break;
    default:
        break;
    }
}

function ThreeDotMenu({slug, details}) {
    const ref = useRef();
    const activeElement = useActiveElementContext();
    const active = ref.current?.contains(activeElement);
    const classList = ['ur-menu'];

    useEffect(() => {
        if (active) {
            const el = ref.current;

            el.addEventListener('keydown', handleKeysInMenu);
            el.querySelector('.ur-dropdown').firstChild.focus();

            return () => el.removeEventListener('keydown', handleKeysInMenu);
        }
        return null;
    }, [active]);

    if (details.coverColor !== 'yellow') {
        classList.push('dark');
    }

    if (active) {
        classList.push('active');
    }

    return (
        <div
            className={classList.join(' ')}
            role="button" tabIndex="0" ref={ref}
        >
            <FontAwesomeIcon icon={faEllipsisV} />
            <Dropdown urlBase={`/details/${slug}`} details={details} />
        </div>
    );
}

export default function BookCover({
    coverUrl,
    slug,
    title,
    bookState: state,
    coverColor,
    hasFacultyResources,
    hasStudentResources
}) {
    const details = {
        coverColor, hasFacultyResources, hasStudentResources
    };
    const className = cn('cover', {
        'coming-soon': state === 'coming_soon',
        polish: $.isPolish(slug)
    });

    return (
        <div className={className}>
            <ThreeDotMenu slug={slug} details={details} />
            <a href={`/details/${slug}`}>
                <LazyLoad once offset={100}>
                    <img src={coverUrl} alt={title} />
                </LazyLoad>
                <div className="cover-caption">{title}</div>
            </a>
        </div>
    );
}
