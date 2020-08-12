import React, {useState, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import routerBus from '~/helpers/router-bus';
import {instructorResourceBoxPermissions} from '../../resource-box/resource-box';
import FeaturedResources from '../../instructor-resource-tab/featured-resources/featured-resources.jsx';
import ResourceBoxes, {VideoResourceBoxes} from '../../resource-box/resource-boxes';
import WrappedJsx from '~/controllers/jsx-wrapper';
import './instructor-resources-pane.css';

function resourceBoxModel(resourceData, userStatus, bookId, dialogProps) {
    const isCompCopyLink = (/comp-copy/).test(resourceData.link_document_url);

    return Object.assign({
        heading: resourceData.resource_heading,
        description: '',
        creatorFest: resourceData.creator_fest_resource,
        comingSoon: Boolean(resourceData.coming_soon_text),
        comingSoonText: '',
        k12: resourceData.k12,
        dialogProps: isCompCopyLink ? dialogProps : null,
        videoReferenceNumber: resourceData.video_reference_number,
        trackResource: Boolean(userStatus.isInstructor) &&
            {
                book: bookId,
                // eslint-disable-next-line camelcase
                account_id: userStatus.userInfo.accounts_id,
                // eslint-disable-next-line camelcase
                resource_name: resourceData.resource_heading
            }
    }, instructorResourceBoxPermissions(resourceData, userStatus, 'Instructor resources'));
}

function FeaturedResourcesSection({header, models}) {
    return (
        <div>
            <div className="featured-resources">
                <FeaturedResources headline={header} resources={models} />
            </div>
            <div className="divider">
                <div className="line"></div>
                see additional resources below
                <div className="line"></div>
            </div>
        </div>
    );
}

export function InstructorResourcePane({
    bookId,
    featuredResourcesHeader,
    featuredResources,
    videoResources,
    referenceResources,
    otherResources,
    userStatusPromise,
    compCopyDialogProps,
    bookAbbreviation
}) {
    const [userStatus, updateUserStatus] = useState({});
    const featuredModels = featuredResources
        .map((res) => resourceBoxModel(res, userStatus, bookId));
    const referenceModels = referenceResources
        .map((res) => resourceBoxModel(res, userStatus, bookId));
    const otherModels = otherResources
        .map((res) => resourceBoxModel(res, userStatus, bookId, compCopyDialogProps));

    function goToPartners(event) {
        event.preventDefault();
        routerBus.emit('navigate', '/partners', {
            book: bookAbbreviation
        }, true);
    }

    useEffect(() => {
        userStatusPromise.then(updateUserStatus);
    }, [userStatusPromise]);

    return (
        <div className="instructor-resources-pane">
            {
                featuredModels.length > 0 &&
                    <FeaturedResourcesSection header={featuredResourcesHeader} models={featuredModels} />
            }
            <a className="card filter-for-book" onClick={goToPartners}>
                OpenStax Partners{' '}
                <FontAwesomeIcon icon="sign-out-alt" />
            </a>
            <div className="free-resources-region">
                <VideoResourceBoxes models={videoResources} referenceModels={referenceModels} />
                <ResourceBoxes models={otherModels} />
            </div>
        </div>
    );
}

export default class extends WrappedJsx {

    init(props) {
        super.init(InstructorResourcePane, props);
    }

}
