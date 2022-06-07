import React from 'react';
import ResultGrid from './result-grid';
import {books, types, advanced, sort, resultCount} from '../store';
import partnerFeaturePromise, {tooltipText} from '~/models/salesforce-partners';
import {useDataFromPromise, useToggle} from '~/components/jsx-helpers/jsx-helpers.jsx';
import shuffle from 'lodash/shuffle';
import orderBy from 'lodash/orderBy';
import './results.scss';

export const costOptions = [
    '$0 - $10',
    '$11 - $25',
    '$26 - $40',
    '> $40'
].map((label) => ({
    label,
    value: label.replace(/ /g, '')
}));

const costOptionValues = costOptions.map((entry) => entry.value);

const equityKey = 'equity_rating'; // eslint-disable-line

export const equityOptions = [
    'Best',
    'Good',
    'Needs Improvement'
].map((label) => ({
    label,
    value: label
}));

const equityOptionValues = equityOptions.map((entry) => entry.value);

function filterByBooks(candidates) {
    if (books.value.length <= 0) {
        return candidates;
    }
    return candidates.filter((entry) => {
        return entry.books.find((title) => books.includes(title));
    });
}

function filterByType(candidates) {
    if (! types.value) {
        return candidates;
    }
    return candidates.filter((entry) => {
        return types.value.localeCompare(
            entry.type, 'en', {sensitivity: 'base'}
        ) === 0;
    });
}

// Custom advanced filter handling
function filterBy(values, candidates, candidateField) {
    const features = advanced.value
        .filter((f) => values.includes(f));

    if (!features.length) {
        return candidates;
    }
    return candidates.filter(
        (entry) => {
            const v = entry[candidateField] || '';

            // Includes because for costs, the value is a semicolon-separated list
            return features.some((f) => v.includes(f));
        }
    );
}

// eslint-disable-next-line complexity
function filterEntries(entries) {
    let result = shuffle(entries);

    result = filterByBooks(result);
    result = filterByType(result);

    if (advanced.value.length > 0) {
        result = result.filter((entry) => {
            return advanced.value
                .filter((feature) => !costOptionValues.includes(feature))
                .filter((feature) => !equityOptionValues.includes(feature))
                .every((requiredFeature) =>
                    entry.advancedFeatures.includes(requiredFeature)
                );
        });
        result = filterBy(costOptionValues, result, 'cost');
        result = filterBy(equityOptionValues, result, 'equityRating');
    }

    resultCount.value = result.length;

    if (Math.abs(sort.value) === 0) {
        return result;
    }

    const getFieldsDict = {
        1: [(r) => r.title.toLowerCase()],
        2: [(r) => Math.abs(r.rating), (r) => r.ratingCount]
    };
    const sortDir = sort.value < 0 ? 'desc' : 'asc';

    return orderBy(
        result,
        getFieldsDict[Math.abs(sort.value)],
        [sortDir, sortDir]
    );
}

function advancedFilterKeys(partnerEntry) {
    return Reflect.ownKeys(partnerEntry).filter((k) => [false, true].includes(partnerEntry[k]));
}

// eslint-disable-next-line complexity
function resultEntry(pd) {
    return {
        id: pd.id,
        title: pd.partner_name,
        blurb: pd.short_partner_description ||
            '[no description]',
        tags: [
            {
                label: 'type',
                value: pd.partner_type
            },
            {
                label: 'cost',
                value: pd.affordability_cost
            },
            {
                label: 'equity',
                value: pd.equity_rating
            }
        ].filter((v) => Boolean(v.value)),
        richDescription: pd.rich_description ||
            pd.partner_description ||
            '[no rich description]',
        logoUrl: pd.partner_logo,
        books: (pd.books||'').split(/;/),
        advancedFeatures: advancedFilterKeys(pd).filter((k) => pd[k] === true),
        website: pd.landing_page,
        images: [pd.image_1, pd.image_2, pd.image_3, pd.image_4, pd.image_5]
            .filter((img) => Boolean(img)),
        videos: [pd.video_1, pd.video_2]
            .filter((vid) => Boolean(vid)),
        type: pd.partner_type,
        cost: pd.affordability_cost,
        equityRating: pd.equity_rating,
        infoUrl: pd.formstack_url,
        verifiedFeatures: pd.verified_by_instructor ? tooltipText : false,
        rating: pd.average_rating.rating__avg,
        ratingCount: pd.rating_count,
        partnershipLevel: pd.partnership_level
    };
}

function SeeMore({defaultOpen, children}) {
    const [opened, toggle] = useToggle(false);

    function onClick(event) {
        event.preventDefault();
        toggle();
    }

    if (defaultOpen) {
        return children;
    }
    if (opened) {
        return (
            <React.Fragment>
                {children}
                <div>
                    <a href="fewer" onClick={onClick}>See fewer options</a>
                </div>
            </React.Fragment>
        );
    }
    return (
        <React.Fragment>
            <div>
                <a href="more" onClick={onClick}>See more options</a>
            </div>
        </React.Fragment>
    );
}

const allyPartnershipLevel = 'Brand Ally';
const isAlly = (level) => level.localeCompare(allyPartnershipLevel, 'en', {sensitivity: 'base'}) === 0;

function ResultGridLoader({partnerData, linkTexts, headerTexts}) {
    const entries = partnerData.map(resultEntry);
    const [filteredEntries, refreshFilters] = React.useReducer(
        () => filterEntries(entries),
        filterEntries(entries)
    );
    const filteredPartners = filteredEntries.filter((e) => !isAlly(e.partnershipLevel || ''));
    const filteredAllies = filteredEntries.filter((e) => isAlly(e.partnershipLevel || ''));
    const defaultAlliesOpen = filteredPartners.length === 0;

    React.useEffect(() => {
        function handleNotifyFor(store) {
            return store.on('notify', refreshFilters);
        }

        const cleanup = [books, types, advanced, sort].map(handleNotifyFor);

        return () => cleanup.forEach((fn) => fn());
    }, [entries]);

    return (
        <React.Fragment>
            <h2>{headerTexts.partnerHeader}</h2>
            <div>{headerTexts.partnerDescription}</div>
            <ResultGrid entries={filteredPartners} linkTexts={linkTexts} />
            {
                filteredAllies.length > 0 &&
                    <SeeMore defaultOpen={defaultAlliesOpen}>
                        <h2>{headerTexts.allyHeader}</h2>
                        <div>{headerTexts.allyDescription}</div>
                        <ResultGrid entries={filteredAllies} />
                    </SeeMore>
            }
        </React.Fragment>
    );
}

export default function Results({linkTexts, headerTexts}) {
    const partnerData = useDataFromPromise(partnerFeaturePromise);

    if (!partnerData) {
        return null;
    }
    const visiblePartners = partnerData.filter((e) => e.visible_on_website);

    return (
        <section className="results boxed">
            <ResultGridLoader {...{partnerData: visiblePartners, linkTexts, headerTexts}} />
        </section>
    );
}
