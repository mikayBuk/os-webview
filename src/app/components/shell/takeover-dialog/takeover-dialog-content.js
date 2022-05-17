import React from 'react';
import {useDialog} from '~/components/dialog/dialog';
import {TakeoverContextProvider} from './takeover-context';
import {useLocation} from 'react-router-dom';
import cn from 'classnames';
import DesktopContent from './content-desktop';
import MobileContent from './content-mobile';
import './takeover-dialog.scss';

function goalHasPassed(data) {
    if (data.messageType !== 'goal') {
        return false;
    }
    const goalTimeMs = new Date(data.goalTime).getTime();

    return goalTimeMs < Date.now();
}

export default function TakeoverBanner({data, setDisplayed}) {
    const [Dialog, _, close, isOpen] = useDialog(true);
    const location = useLocation();
    const initialLoc = React.useRef(location);

    React.useEffect(() => {
        if (location !== initialLoc.current) {
            close();
        }
    }, [location, initialLoc, close]);

    React.useEffect(
        () => {
            if (!isOpen) {
                setDisplayed();
            }
        },
        [isOpen, setDisplayed]
    );

    if (goalHasPassed(data)) {
        return null;
    }

    data.image = data.fundraiserImage;
    return (
        <Dialog className={cn('takeover-dialog', data.colorScheme)}>
            <TakeoverContextProvider contextValueParameters={{close}}>
                <DesktopContent data={data} />
                <MobileContent data={data} />
            </TakeoverContextProvider>
        </Dialog>
    );
}
